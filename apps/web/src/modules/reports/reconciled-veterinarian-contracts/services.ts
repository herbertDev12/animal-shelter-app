import type { ReconciledVeterinarianContractsResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchReconciledVeterinarianContracts =
  (): Promise<ReconciledVeterinarianContractsResponse> =>
    fetchWithAuth<ReconciledVeterinarianContractsResponse>(
      `/reports/reconciled-veterinarian-contracts`,
    );
