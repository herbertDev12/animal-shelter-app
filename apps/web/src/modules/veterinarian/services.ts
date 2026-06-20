import type {
  CreateVeterinarian,
  SearchVeterinariansFilters,
  Veterinarian,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchVeterinarians = async (
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

  const response = await fetch(
    `${API_URL}/veterinarians/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch veterinarians");
  return response.json();
};

export const fetchVeterinarian = async (id: number): Promise<Veterinarian> => {
  const response = await fetch(`${API_URL}/veterinarians/${id}`);
  if (!response.ok) throw new Error("Failed to fetch veterinarian");
  return response.json();
};

export const createVeterinarian = async (
  data: CreateVeterinarian,
): Promise<Veterinarian> => {
  const response = await fetch(`${API_URL}/veterinarians`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create veterinarian");
  return response.json();
};

export const updateVeterinarian = async (
  id: number,
  data: Partial<CreateVeterinarian>,
): Promise<Veterinarian> => {
  const response = await fetch(`${API_URL}/veterinarians/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update veterinarian");
  return response.json();
};

export const deleteVeterinarian = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/veterinarians/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete veterinarian");
};
