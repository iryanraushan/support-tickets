"use client";

import { useState, useEffect } from "react";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, Plus, Search, LogOut } from "lucide-react";
import { useTickets } from "@/hooks/use-tickets";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketMeta } from "@/components/ticket-meta";

const statusStyles = {
  open: "bg-blue-500 text-white",
  in_progress: "bg-yellow-500 text-white",
  closed: "bg-green-500 text-white",
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const debouncedSearch = useDebounce(search, 300);
  const { scrollY } = useScroll();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useTickets({
      search: debouncedSearch || undefined,
      status: status === "all" ? undefined : status,
      sortBy: "createdAt",
      sortOrder,
    });

  useEffect(() => {
    return scrollY.on("change", (y) => {
      if (
        window.innerHeight + y >= document.documentElement.scrollHeight - 120 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    });
  }, [scrollY, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tickets = data?.pages.flatMap((p) => p.tickets) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">{total} Tickets</p>
        </div>

        <div className="flex gap-2">
          <Link href="/tickets/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </Link>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40 bg-muted border-0 focus:ring-0">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(v: "asc" | "desc") => setSortOrder(v)}
        >
          <SelectTrigger className="w-40 bg-muted border-0 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <motion.div
            key={ticket._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href={`/tickets/${ticket._id}`}>
              <Card className="hover:shadow-sm transition cursor-pointer">
                <CardContent className="space-y-3 relative">
                  {/* Status */}
                  <Badge
                    className={`absolute top-4 right-4 ${statusStyles[ticket.status]}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>

                  {/* Title */}
                  <h3 className="font-medium text-base pr-20">
                    {ticket.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>

                  {/* Meta */}
                  <TicketMeta
                    priority={ticket.priority}
                    assignees={ticket.assignees}
                    createdAt={ticket.createdAt}
                  />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Loading more */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
        </div>
      )}
    </div>
  );
}