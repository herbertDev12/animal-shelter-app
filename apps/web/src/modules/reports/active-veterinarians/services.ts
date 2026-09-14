import type { ActiveVeterinariansResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchActiveVeterinarians =
  (): Promise<ActiveVeterinariansResponse> =>
    fetchWithAuth<ActiveVeterinariansResponse>(`/reports/active-veterinarians`);
