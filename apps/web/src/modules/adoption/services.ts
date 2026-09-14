import type {
  Adoption,
  CreateAdoption,
  SearchAdoptionsFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchAdoptions = (
  filters: Partial<SearchAdoptionsFilters> = {},
): Promise<Adoption[]> => {
  const params = new URLSearchParams();

  if (filters.id_animal != null)
    params.append("id_animal", String(filters.id_animal));
  if (filters.startDate)
    params.append("startDate", new Date(filters.startDate).toISOString());
  if (filters.endDate)
    params.append("endDate", new Date(filters.endDate).toISOString());
  if (filters.minPrice != null)
    params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null)
    params.append("maxPrice", String(filters.maxPrice));
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Adoption[]>(`/adoptions/search?${params.toString()}`);
};

export const fetchAdoption = (id: string): Promise<Adoption> => {
  return fetchWithAuth<Adoption>(`/adoptions/${id}`);
};

export const createAdoption = (data: CreateAdoption): Promise<Adoption> => {
  return fetchWithAuth<Adoption>(`/adoptions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateAdoption = (
  id: string,
  data: Partial<CreateAdoption>,
): Promise<Adoption> => {
  return fetchWithAuth<Adoption>(`/adoptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteAdoption = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/adoptions/${id}`, {
    method: "DELETE",
  });
};
