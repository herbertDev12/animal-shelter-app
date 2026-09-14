import type { Clinic, CreateClinic, SearchClinicsFilters } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchClinics = (
  filters: Partial<SearchClinicsFilters> = {},
): Promise<Clinic[]> => {
  const params = new URLSearchParams();

  if (filters.name) params.append("name", filters.name);
  if (filters.province) params.append("province", filters.province);
  if (filters.address) params.append("address", filters.address);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Clinic[]>(`/clinics/search?${params.toString()}`);
};

export const fetchClinic = (id: string): Promise<Clinic> => {
  return fetchWithAuth<Clinic>(`/clinics/${id}`);
};

export const createClinic = (data: CreateClinic): Promise<Clinic> => {
  return fetchWithAuth<Clinic>(`/clinics`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateClinic = (
  id: string,
  data: Partial<CreateClinic>,
): Promise<Clinic> => {
  return fetchWithAuth<Clinic>(`/clinics/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteClinic = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/clinics/${id}`, {
    method: "DELETE",
  });
};
