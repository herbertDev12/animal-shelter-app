import type {
  Supplier,
  CreateSupplier,
  SearchSuppliersFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchSuppliers = async (
  filters: Partial<SearchSuppliersFilters> = {},
): Promise<Supplier[]> => {
  const params = new URLSearchParams();

  if (filters.name) params.append("name", filters.name);
  if (filters.type) params.append("type", filters.type);
  if (filters.province) params.append("province", filters.province);
  if (filters.phone) params.append("phone", filters.phone);
  if (filters.contact_email)
    params.append("contact_email", filters.contact_email);
  if (filters.contact_name) params.append("contact_name", filters.contact_name);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/suppliers/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return response.json();
};

export const fetchSupplier = async (id: number): Promise<Supplier> => {
  const response = await fetch(`${API_URL}/suppliers/${id}`);
  if (!response.ok) throw new Error("Failed to fetch supplier");
  return response.json();
};

export const createSupplier = async (
  data: CreateSupplier,
): Promise<Supplier> => {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create supplier");
  return response.json();
};

export const updateSupplier = async (
  id: number,
  data: Partial<CreateSupplier>,
): Promise<Supplier> => {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update supplier");
  return response.json();
};

export const deleteSupplier = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete supplier");
};
