import type { FoodSupplierContractsResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchFoodSupplierContracts =
  (): Promise<FoodSupplierContractsResponse> =>
    fetchWithAuth<FoodSupplierContractsResponse>(
      `/reports/food-supplier-contracts`,
    );
