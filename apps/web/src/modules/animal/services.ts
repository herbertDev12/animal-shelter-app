import type { Animal, CreateAnimal, SearchAnimalsFilters } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchAnimals = (
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

  return fetchWithAuth<Animal[]>(`/animals/search?${params.toString()}`);
};

export const fetchAnimal = (id: number): Promise<Animal> => {
  return fetchWithAuth<Animal>(`/animals/${id}`);
};

export const createAnimal = (data: CreateAnimal): Promise<Animal> => {
  return fetchWithAuth<Animal>(`/animals`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateAnimal = (
  id: number,
  data: Partial<CreateAnimal>,
): Promise<Animal> => {
  return fetchWithAuth<Animal>(`/animals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteAnimal = (id: number): Promise<void> => {
  return fetchWithAuth<void>(`/animals/${id}`, {
    method: "DELETE",
  });
};
