import type { RevenuePlanResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchRevenuePlan = (): Promise<RevenuePlanResponse> =>
  fetchWithAuth<RevenuePlanResponse>(`/reports/revenue-plan`);
