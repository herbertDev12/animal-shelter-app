import type {
  Supplier,
  CreateSupplier,
  SearchSuppliersFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchSuppliers = (
  filters: Partial<SearchSuppliersFilters> = {},
): Promise<Supplier[]> => {
  const params = new URLSearchParams();

  if (filters.name) params.append("name", filters.name);
  if (filters.type) params.append("type", String(filters.type));
  if (filters.province) params.append("province", filters.province);
  if (filters.phone) params.append("phone", filters.phone);
  if (filters.contact_email)
    params.append("contact_email", filters.contact_email);
  if (filters.contact_name) params.append("contact_name", filters.contact_name);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Supplier[]>(`/suppliers/search?${params.toString()}`);
};

export const fetchSupplier = (id: string): Promise<Supplier> => {
  return fetchWithAuth<Supplier>(`/suppliers/${id}`);
};

export const createSupplier = (data: CreateSupplier): Promise<Supplier> => {
  return fetchWithAuth<Supplier>(`/suppliers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateSupplier = (
  id: string,
  data: Partial<CreateSupplier>,
): Promise<Supplier> => {
  return fetchWithAuth<Supplier>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteSupplier = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/suppliers/${id}`, {
    method: "DELETE",
  });
};
