import type {
  TransportService,
  CreateTransportService,
  SearchTransportServicesFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchTransportServices = (
  filters: Partial<SearchTransportServicesFilters> = {},
): Promise<TransportService[]> => {
  const params = new URLSearchParams();

  if (filters.id_supplier != null)
    params.append("id_supplier", String(filters.id_supplier));
  if (filters.status) params.append("status", String(filters.status));
  if (filters.vehicle) params.append("vehicle", filters.vehicle);
  if (filters.transport_modality)
    params.append("transport_modality", filters.transport_modality);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<TransportService[]>(
    `/transport-services/search?${params.toString()}`,
  );
};

export const fetchTransportService = (
  id: string,
): Promise<TransportService> => {
  return fetchWithAuth<TransportService>(`/transport-services/${id}`);
};

export const createTransportService = (
  data: CreateTransportService,
): Promise<TransportService> => {
  return fetchWithAuth<TransportService>(`/transport-services`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateTransportService = (
  id: string,
  data: Partial<CreateTransportService>,
): Promise<TransportService> => {
  return fetchWithAuth<TransportService>(`/transport-services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteTransportService = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/transport-services/${id}`, {
    method: "DELETE",
  });
};
