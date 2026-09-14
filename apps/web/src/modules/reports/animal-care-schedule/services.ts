import type { AnimalCareScheduleResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchAnimalCareSchedule = (
  idAnimal: string,
): Promise<AnimalCareScheduleResponse> =>
  fetchWithAuth<AnimalCareScheduleResponse>(
    `/reports/animal-care-schedule?id_animal=${encodeURIComponent(idAnimal)}`,
  );
