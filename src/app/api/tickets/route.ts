import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Ticket } from "@/models/Ticket";
import { User } from "@/models/User";
import { TicketSchema } from "@/features/auth/schemas/ticket.schema";
import { sendEmail, createAssignmentEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  // Build query
  const query: any = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  if (status) {
    query.status = status;
  }

  const tickets = await Ticket.find(query)
    .sort({ createdAt: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("assignees", "name email");

  const total = await Ticket.countDocuments(query);

  return Response.json({
    tickets,
    hasMore: page * limit < total,
    total,
  });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = TicketSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ticket = await Ticket.create(parsed.data);
    
    // Send email notifications to assignees
    if (parsed.data.assignees && parsed.data.assignees.length > 0) {
      const assignees = await User.find({ _id: { $in: parsed.data.assignees } });
      const assigneeEmails = assignees.map(user => user.email);
      
      if (assigneeEmails.length > 0) {
        const emailData = createAssignmentEmail(
          assigneeEmails,
          parsed.data.title,
          parsed.data.description
        );
        await sendEmail(emailData);
      }
    }

    return Response.json(ticket, { status: 201 });
  } catch (error) {
    console.error("CREATE_TICKET_ERROR:", error);

    return Response.json(
      { message: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
