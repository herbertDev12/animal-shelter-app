import type {
  TransportService,
  CreateTransportService,
  SearchTransportServicesFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchTransportServices = async (
  filters: Partial<SearchTransportServicesFilters> = {},
): Promise<TransportService[]> => {
  const params = new URLSearchParams();

  if (filters.id_supplier != null)
    params.append("id_supplier", String(filters.id_supplier));
  if (filters.status) params.append("status", filters.status);
  if (filters.vehicle) params.append("vehicle", filters.vehicle);
  if (filters.transport_modality)
    params.append("transport_modality", filters.transport_modality);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/transport-services/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch transport services");
  return response.json();
};

export const fetchTransportService = async (
  id: number,
): Promise<TransportService> => {
  const response = await fetch(`${API_URL}/transport-services/${id}`);
  if (!response.ok) throw new Error("Failed to fetch transport service");
  return response.json();
};

export const createTransportService = async (
  data: CreateTransportService,
): Promise<TransportService> => {
  const response = await fetch(`${API_URL}/transport-services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create transport service");
  return response.json();
};

export const updateTransportService = async (
  id: number,
  data: Partial<CreateTransportService>,
): Promise<TransportService> => {
  const response = await fetch(`${API_URL}/transport-services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update transport service");
  return response.json();
};

export const deleteTransportService = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/transport-services/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete transport service");
};
