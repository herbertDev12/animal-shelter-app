import type {
  Contract,
  CreateContract,
  SearchContractsFilters,
  Supplier,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchContracts = async (
  filters: Partial<SearchContractsFilters> = {},
): Promise<Contract[]> => {
  const params = new URLSearchParams();

  if (filters.id_supplier != null)
    params.append("id_supplier", String(filters.id_supplier));
  if (filters.contract_category)
    params.append("contract_category", filters.contract_category);
  if (filters.status) params.append("status", filters.status);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/contracts/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch contracts");
  return response.json();
};

export const fetchContract = async (id: number): Promise<Contract> => {
  const response = await fetch(`${API_URL}/contracts/${id}`);
  if (!response.ok) throw new Error("Failed to fetch contract");
  return response.json();
};

export const createContract = async (
  data: CreateContract,
): Promise<Contract> => {
  const response = await fetch(`${API_URL}/contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create contract");
  return response.json();
};

export const updateContract = async (
  id: number,
  data: Partial<CreateContract>,
): Promise<Contract> => {
  const response = await fetch(`${API_URL}/contracts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update contract");
  return response.json();
};

export const deleteContract = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/contracts/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete contract");
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await fetch(`${API_URL}/suppliers`);
  if (!response.ok) throw new Error("Failed to fetch suppliers");
  return response.json();
};
