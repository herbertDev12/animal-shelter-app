import type { ComplementaryServiceContractsResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchComplementaryServiceContracts =
  (): Promise<ComplementaryServiceContractsResponse> =>
    fetchWithAuth<ComplementaryServiceContractsResponse>(
      `/reports/complementary-service-contracts`,
    );
