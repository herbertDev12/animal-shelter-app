import type {
  Adoption,
  CreateAdoption,
  SearchAdoptionsFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchAdoptions = async (
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

  const response = await fetch(
    `${API_URL}/adoptions/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch adoptions");
  return response.json();
};

export const fetchAdoption = async (id: number): Promise<Adoption> => {
  const response = await fetch(`${API_URL}/adoptions/${id}`);
  if (!response.ok) throw new Error("Failed to fetch adoption");
  return response.json();
};

export const createAdoption = async (
  data: CreateAdoption,
): Promise<Adoption> => {
  const response = await fetch(`${API_URL}/adoptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create adoption");
  return response.json();
};

export const updateAdoption = async (
  id: number,
  data: Partial<CreateAdoption>,
): Promise<Adoption> => {
  const response = await fetch(`${API_URL}/adoptions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update adoption");
  return response.json();
};

export const deleteAdoption = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/adoptions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete adoption");
};
