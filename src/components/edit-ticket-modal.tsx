"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateTicket } from "@/hooks/use-tickets";
import { useToastContext } from "@/providers/toast-provider";
import {
  TicketSchema,
  type TicketFormData,
} from "@/features/auth/schemas/ticket.schema";
import type { Ticket } from "@/lib/api/tickets";
import { AssigneeMultiSelect } from "@/components/assignee-multi-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditTicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export function EditTicketModal({ ticket, onClose }: EditTicketModalProps) {
  const updateTicket = useUpdateTicket();
  const toast = useToastContext();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assignees: ticket.assignees?.map((a: any) => a._id) || [],
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      // Transform assignee IDs to full user objects
      let assignees: Array<{ _id: string; name: string; email: string }> | undefined;
      
      if (data.assignees && data.assignees.length > 0) {
        const userResponse = await fetch('/api/users');
        const users = await userResponse.json();
        assignees = users.filter((user: any) => data.assignees!.includes(user._id));
      }

      const updateData = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignees,
      };

      await updateTicket.mutateAsync({
        id: ticket._id,
        data: updateData,
      });

      toast.success("Ticket updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Edit Ticket</CardTitle>
          <p>Update the ticket details below</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <Label className="mb-2 block">Title *</Label>
              <Input
                {...form.register("title")}
                placeholder="Brief summary of the issue"
                className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide a clear and concise title (5-80 characters)
              </p>
              {form.formState.errors.title && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2 block">Description *</Label>
              <textarea
                {...form.register("description")}
                placeholder="Describe the issue in detail"
                className="w-full min-h-32 px-3 py-2 rounded-md text-sm bg-muted border-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide detailed information about the issue (min 20 characters)
              </p>
              {form.formState.errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Status *</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) =>
                    form.setValue(
                      "status",
                      v as "open" | "in_progress" | "closed",
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-muted border-0 focus:ring-1 focus:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block">Priority *</Label>
                <Select
                  value={String(form.watch("priority"))}
                  onValueChange={(v) => form.setValue("priority", Number(v))}
                >
                  <SelectTrigger className="w-full bg-muted border-0 focus:ring-1 focus:ring-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 – Low</SelectItem>
                    <SelectItem value="2">2 – Medium</SelectItem>
                    <SelectItem value="3">3 – High</SelectItem>
                    <SelectItem value="4">4 – Urgent</SelectItem>
                    <SelectItem value="5">5 – Critical</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  1 (Low) to 5 (Critical)
                </p>
              </div>
            </div>

            {/* Assignees */}
            <AssigneeMultiSelect
              selectedIds={form.watch("assignees") || []}
              onChange={(ids) => form.setValue("assignees", ids)}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={updateTicket.isPending}>
                {updateTicket.isPending ? "Updating..." : "Update Ticket"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
