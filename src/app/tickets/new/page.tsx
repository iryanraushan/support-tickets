"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTicket } from "@/hooks/use-tickets";
import { useToastContext } from "@/providers/toast-provider";
import {
  TicketSchema,
  type TicketFormData,
} from "@/features/auth/schemas/ticket.schema";
import { AssigneeMultiSelect } from "@/components/assignee-multi-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const createTicket = useCreateTicket();
  const toast = useToastContext();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(TicketSchema),
    defaultValues: {
      status: "open",
      priority: 1,
      assignees: [],
    },
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      const ticket = await createTicket.mutateAsync(data);

      toast.success("Ticket created successfully");
      router.push(`/tickets/${ticket._id}`);
    } catch (error) {
      toast.error("Failed to create ticket");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl">Create New Ticket</h1>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Title */}
            <div>
              <Label className="mb-2 block text-sm">Title *</Label>
              <Input
                {...form.register("title")}
                placeholder="Brief summary of the issue"
                className="bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Provide a clear and concise title (5-80 characters)
              </p>
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">
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
              <p className="text-sm text-muted-foreground mt-2">
                Provide detailed information about the issue (min 20 characters)
              </p>
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
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
                    <SelectValue className="text-sm font-medium" />
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
                    <SelectValue className="text-sm font-medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 – Low</SelectItem>
                    <SelectItem value="2">2 – Medium</SelectItem>
                    <SelectItem value="3">3 – High</SelectItem>
                    <SelectItem value="4">4 – Urgent</SelectItem>
                    <SelectItem value="5">5 – Critical</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
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
            <div className="flex gap-6 pt-4">
              <Button type="submit" disabled={createTicket.isPending}>
                {createTicket.isPending ? "Creating..." : "Create Ticket"}
              </Button>
              <Button disabled={createTicket.isPending} variant={"outline"}>
                {"Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
