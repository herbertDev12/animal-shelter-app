import type { Clinic, CreateClinic, SearchClinicsFilters } from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchClinics = async (
  filters: Partial<SearchClinicsFilters> = {},
): Promise<Clinic[]> => {
  const params = new URLSearchParams();

  if (filters.name) params.append("name", filters.name);
  if (filters.province) params.append("province", filters.province);
  if (filters.address) params.append("address", filters.address);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/clinics/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch clinics");
  return response.json();
};

export const fetchClinic = async (id: number): Promise<Clinic> => {
  const response = await fetch(`${API_URL}/clinics/${id}`);
  if (!response.ok) throw new Error("Failed to fetch clinic");
  return response.json();
};

export const createClinic = async (data: CreateClinic): Promise<Clinic> => {
  const response = await fetch(`${API_URL}/clinics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create clinic");
  return response.json();
};

export const updateClinic = async (
  id: number,
  data: Partial<CreateClinic>,
): Promise<Clinic> => {
  const response = await fetch(`${API_URL}/clinics/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update clinic");
  return response.json();
};

export const deleteClinic = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/clinics/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete clinic");
};
