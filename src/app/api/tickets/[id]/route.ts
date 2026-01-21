export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Ticket } from "@/models/Ticket";
import { User } from "@/models/User";
import { TicketSchema } from "@/features/auth/schemas/ticket.schema";
import { sendEmail, createAssignmentEmail } from "@/lib/email";
import { verifyToken } from "@/lib/jwt";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const ticket = await Ticket.findById(id).populate("assignees");

  if (!ticket) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await req.json();
    
    if (body.assignees && Array.isArray(body.assignees)) {
      body.assignees = body.assignees.map((assignee: any) => 
        typeof assignee === 'string' ? assignee : assignee._id
      );
    }
    
    const parsed = TicketSchema.partial().safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const oldTicket = await Ticket.findById(id).populate("assignees");
    if (!oldTicket) {
      return Response.json({ message: "Ticket not found" }, { status: 404 });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      parsed.data,
      { new: true }
    ).populate("assignees");

    if (parsed.data.assignees) {
      const oldAssigneeIds = oldTicket.assignees?.map((a: any) => a._id.toString()) || [];
      const newAssigneeIds = parsed.data.assignees;
      
      const addedAssignees = newAssigneeIds.filter((id: string) => !oldAssigneeIds.includes(id));
      
      if (addedAssignees.length > 0) {
        const assignees = await User.find({ _id: { $in: addedAssignees } });
        const assigneeEmails = assignees.map(user => user.email);
        
        if (assigneeEmails.length > 0) {
          const emailData = createAssignmentEmail(
            assigneeEmails,
            oldTicket.title,
            oldTicket.description,
            true
          );
          await sendEmail(emailData);
        }
      }
    }

    return Response.json(ticket);
  } catch (error) {
    console.error("UPDATE_TICKET_ERROR:", error);
    return Response.json(
      { message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== "admin") {
      return Response.json({ message: "Only admins can delete tickets" }, { status: 403 });
    }
    
    const ticket = await Ticket.findByIdAndDelete(id);
    
    if (!ticket) {
      return Response.json({ message: "Ticket not found" }, { status: 404 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE_TICKET_ERROR:", error);
    return Response.json(
      { message: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
