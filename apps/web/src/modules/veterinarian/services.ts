import type {
  CreateVeterinarian,
  SearchVeterinariansFilters,
  Veterinarian,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchVeterinarians = (
  filters: Partial<SearchVeterinariansFilters> = {},
): Promise<Veterinarian[]> => {
  const params = new URLSearchParams();

  if (filters.id_clinic != null)
    params.append("id_clinic", String(filters.id_clinic));
  if (filters.modality) params.append("modality", filters.modality);
  if (filters.specialty) params.append("specialty", filters.specialty);
  if (filters.province) params.append("province", filters.province);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Veterinarian[]>(
    `/veterinarians/search?${params.toString()}`,
  );
};

export const fetchVeterinarian = (id: string): Promise<Veterinarian> => {
  return fetchWithAuth<Veterinarian>(`/veterinarians/${id}`);
};

export const createVeterinarian = (
  data: CreateVeterinarian,
): Promise<Veterinarian> => {
  return fetchWithAuth<Veterinarian>(`/veterinarians`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateVeterinarian = (
  id: string,
  data: Partial<CreateVeterinarian>,
): Promise<Veterinarian> => {
  return fetchWithAuth<Veterinarian>(`/veterinarians/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteVeterinarian = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/veterinarians/${id}`, {
    method: "DELETE",
  });
};
