import type {
  Donation,
  CreateDonation,
  SearchDonationsFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchDonations = async (
  filters: Partial<SearchDonationsFilters> = {},
): Promise<Donation[]> => {
  const params = new URLSearchParams();

  if (filters.id_animal != null)
    params.append("id_animal", String(filters.id_animal));
  if (filters.minAmount != null)
    params.append("minAmount", String(filters.minAmount));
  if (filters.maxAmount != null)
    params.append("maxAmount", String(filters.maxAmount));
  if (filters.donor) params.append("donor", filters.donor);
  if (filters.startDate)
    params.append("startDate", new Date(filters.startDate).toISOString());
  if (filters.endDate)
    params.append("endDate", new Date(filters.endDate).toISOString());
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/donations/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch donations");
  return response.json();
};

export const fetchDonation = async (id: number): Promise<Donation> => {
  const response = await fetch(`${API_URL}/donations/${id}`);
  if (!response.ok) throw new Error("Failed to fetch donation");
  return response.json();
};

export const createDonation = async (
  data: CreateDonation,
): Promise<Donation> => {
  const response = await fetch(`${API_URL}/donations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create donation");
  return response.json();
};

export const updateDonation = async (
  id: number,
  data: Partial<CreateDonation>,
): Promise<Donation> => {
  const response = await fetch(`${API_URL}/donations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update donation");
  return response.json();
};

export const deleteDonation = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/donations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete donation");
};
