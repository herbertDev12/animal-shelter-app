import type { AnimalCareScheduleResponse } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchAnimalCareSchedule = (
  idAnimal: number,
): Promise<AnimalCareScheduleResponse> =>
  fetchWithAuth<AnimalCareScheduleResponse>(
    `/reports/animal-care-schedule?id_animal=${idAnimal}`,
  );
