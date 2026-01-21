export interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: number;
  assignees?: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface TicketUpdateData {
  title?: string;
  description?: string;
  status?: "open" | "in_progress" | "closed";
  priority?: number;
  assignees?: string[];
}

export interface TicketsResponse {
  tickets: Ticket[];
  hasMore: boolean;
  total: number;
}

export interface TicketFilters {
  search?: string;
  status?: string;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

const API_BASE = "/api/tickets";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ticketApi = {
  getTickets: async (filters: TicketFilters = {}): Promise<TicketsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
    
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch tickets");
    return response.json();
  },

  getTicket: async (id: string): Promise<Ticket> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch ticket");
    return response.json();
  },

  createTicket: async (data: Omit<Ticket, "_id" | "createdAt" | "updatedAt">): Promise<Ticket> => {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create ticket");
    return response.json();
  },

  updateTicket: async (id: string, data: TicketUpdateData): Promise<Ticket> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update ticket");
    return response.json();
  },

  deleteTicket: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete ticket");
  },
};