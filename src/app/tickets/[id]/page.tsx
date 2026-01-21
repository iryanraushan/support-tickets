"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Trash2, InfoIcon } from "lucide-react";

import { useTicket, useDeleteTicket } from "@/hooks/use-tickets";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditTicketModal } from "@/components/edit-ticket-modal";
import { TicketMeta } from "@/components/ticket-meta";

const statusStyles = {
  open: "bg-blue-500 text-white",
  in_progress: "bg-yellow-500 text-white",
  closed: "bg-green-500 text-white",
};

export default function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuth();

  const { data: ticket, isLoading, isError } = useTicket(id);
  const deleteTicket = useDeleteTicket();

  const handleDelete = async () => {
    await deleteTicket.mutateAsync(id);
    setShowDeleteModal(false);
    router.push("/tickets");
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 animate-pulse space-y-4">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-red-500 mb-4">Ticket not found</p>
        <Button onClick={() => router.push("/tickets")}>Back to Tickets</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ArrowLeft
          className="h-5 w-5 cursor-pointer"
          onClick={() => router.push("/tickets")}
        />
        Ticket Details
      </div>

      <Card>
        <CardContent className="space-y-6 relative">
          {/* Edit & Delete icons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-lg h-9 w-9"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {user?.role === "admin" && (
              <Button
                size="icon"
                variant="outline"
                className="rounded-lg h-9 w-9 text-red-500"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Title + Status */}
          <div className="space-y-2">
            <h1 className="text-xl">
              {ticket.title}{" "}
              <Badge className={`${statusStyles[ticket.status]} rounded-lg`}>
                {ticket.status.replace("_", " ")}
              </Badge>
            </h1>
            <div className="flex gap-6 items-center mt-4">
              <TicketMeta
                priority={ticket.priority}
                assignees={ticket.assignees}
                createdAt={ticket.createdAt}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Details section */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 border-t pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">
                {ticket.status.replace("_", " ")}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Priority</p>
              <p className="font-medium">Level {ticket.priority}</p>
            </div>

            {ticket.assignees && ticket.assignees.length > 0 && (
              <div>
                <p className="text-muted-foreground">Assignees</p>
                <p className="font-medium">
                  {ticket.assignees.map((a) => a.name).join(", ")}
                </p>
              </div>
            )}

            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {format(new Date(ticket.updatedAt), "MMMM do, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditModal && (
        <EditTicketModal
          ticket={ticket}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete Ticket</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete this ticket? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteTicket.isPending}
              >
                {deleteTicket.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
