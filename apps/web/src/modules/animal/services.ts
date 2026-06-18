import type { Animal, CreateAnimal, SearchAnimalsFilters } from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchAnimals = async (
  filters: Partial<SearchAnimalsFilters> = {},
): Promise<Animal[]> => {
  const params = new URLSearchParams();

  if (filters.species) params.append("species", filters.species);
  if (filters.breed) params.append("breed", filters.breed);
  if (filters.status?.length) {
    for (const status of filters.status) params.append("status", status);
  }
  if (filters.minAge != null) params.append("minAge", String(filters.minAge));
  if (filters.maxAge != null) params.append("maxAge", String(filters.maxAge));
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/animals/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch animals");
  return response.json();
};

export const fetchAnimal = async (id: number): Promise<Animal> => {
  const response = await fetch(`${API_URL}/animals/${id}`);
  if (!response.ok) throw new Error("Failed to fetch animal");
  return response.json();
};

export const createAnimal = async (data: CreateAnimal): Promise<Animal> => {
  const response = await fetch(`${API_URL}/animals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create animal");
  return response.json();
};

export const updateAnimal = async (
  id: number,
  data: Partial<CreateAnimal>,
): Promise<Animal> => {
  const response = await fetch(`${API_URL}/animals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update animal");
  return response.json();
};

export const deleteAnimal = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/animals/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete animal");
};
