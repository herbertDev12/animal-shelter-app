import type {
  ServiceOffered,
  CreateServiceOffered,
  SearchServiceOfferedFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import type { FkOption } from "@/components/fields/rhf-fk-select";

export const fetchServicesOffered = (
  filters: Partial<SearchServiceOfferedFilters> = {},
): Promise<ServiceOffered[]> => {
  const params = new URLSearchParams();

  if (filters.id_contract != null)
    params.append("id_contract", String(filters.id_contract));
  if (filters.food_type) params.append("food_type", filters.food_type);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<ServiceOffered[]>(
    `/services-offered/search?${params.toString()}`,
  );
};

export const fetchServiceOffered = (id: string): Promise<ServiceOffered> => {
  return fetchWithAuth<ServiceOffered>(`/services-offered/${id}`);
};

export const createServiceOffered = (
  data: CreateServiceOffered,
): Promise<ServiceOffered> => {
  return fetchWithAuth<ServiceOffered>(`/services-offered`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateServiceOffered = (
  id: string,
  data: Partial<CreateServiceOffered>,
): Promise<ServiceOffered> => {
  return fetchWithAuth<ServiceOffered>(`/services-offered/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteServiceOffered = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/services-offered/${id}`, {
    method: "DELETE",
  });
};

export const fetchServiceOfferedOptions = (): Promise<FkOption[]> =>
  fetchServicesOffered({ limit: 100 }).then((rows) =>
    rows.map((service) => ({
      id: service.id,
      label: service.food_type
        ? `${service.name} (${service.food_type})`
        : service.name,
    })),
  );
