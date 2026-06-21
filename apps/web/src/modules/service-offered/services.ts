import type {
  ServiceOffered,
  CreateServiceOffered,
  SearchServiceOfferedFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchServicesOffered = async (
  filters: Partial<SearchServiceOfferedFilters> = {},
): Promise<ServiceOffered[]> => {
  const params = new URLSearchParams();

  if (filters.id_contract != null)
    params.append("id_contract", String(filters.id_contract));
  if (filters.food_type) params.append("food_type", filters.food_type);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/services-offered/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch services offered");
  return response.json();
};

export const fetchServiceOffered = async (
  id: number,
): Promise<ServiceOffered> => {
  const response = await fetch(`${API_URL}/services-offered/${id}`);
  if (!response.ok) throw new Error("Failed to fetch service offered");
  return response.json();
};

export const createServiceOffered = async (
  data: CreateServiceOffered,
): Promise<ServiceOffered> => {
  const response = await fetch(`${API_URL}/services-offered`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create service offered");
  return response.json();
};

export const updateServiceOffered = async (
  id: number,
  data: Partial<CreateServiceOffered>,
): Promise<ServiceOffered> => {
  const response = await fetch(`${API_URL}/services-offered/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update service offered");
  return response.json();
};

export const deleteServiceOffered = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/services-offered/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete service offered");
};
