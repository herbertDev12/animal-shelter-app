import {
  ContractCategoryLabel,
  type Contract,
  type CreateContract,
  type SearchContractsFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import type { FkOption } from "@/components/fields/rhf-fk-select";
import { shortId } from "@/lib/utils/short-id";

export const fetchContracts = (
  filters: Partial<SearchContractsFilters> = {},
): Promise<Contract[]> => {
  const params = new URLSearchParams();

  if (filters.id_supplier != null)
    params.append("id_supplier", String(filters.id_supplier));
  if (filters.contract_category)
    params.append("contract_category", String(filters.contract_category));
  if (filters.status) params.append("status", String(filters.status));
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Contract[]>(`/contracts/search?${params.toString()}`);
};

export const fetchContract = (id: string): Promise<Contract> => {
  return fetchWithAuth<Contract>(`/contracts/${id}`);
};

export const createContract = (data: CreateContract): Promise<Contract> => {
  return fetchWithAuth<Contract>(`/contracts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateContract = (
  id: string,
  data: Partial<CreateContract>,
): Promise<Contract> => {
  return fetchWithAuth<Contract>(`/contracts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteContract = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/contracts/${id}`, {
    method: "DELETE",
  });
};

/** Contracts have no name, so the label falls back to category + short id. */
export const fetchContractOptions = (): Promise<FkOption[]> =>
  fetchContracts({ limit: 100 }).then((rows) =>
    rows.map((contract) => ({
      id: contract.id,
      label:
        contract.description ??
        `${ContractCategoryLabel[contract.contract_category]} #${shortId(contract.id)}`,
    })),
  );
