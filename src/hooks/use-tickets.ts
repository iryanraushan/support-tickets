import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketApi, type Ticket, type TicketFilters, type TicketUpdateData } from "@/lib/api/tickets";

export const useTickets = (filters: TicketFilters) => {
  return useInfiniteQuery({
    queryKey: ["tickets", filters],
    queryFn: ({ pageParam = 1 }) =>
      ticketApi.getTickets({ ...filters, page: pageParam, limit: 10 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketApi.getTicket(id),
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TicketUpdateData }) =>
      ticketApi.updateTicket(id, data),
    onSuccess: (updatedTicket) => {
      queryClient.setQueryData(["ticket", updatedTicket._id], updatedTicket);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ticketApi.deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};