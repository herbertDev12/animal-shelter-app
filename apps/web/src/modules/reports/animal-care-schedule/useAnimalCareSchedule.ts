import { useQuery } from "@tanstack/react-query";
import { fetchAnimalCareSchedule } from "./services";

export const useAnimalCareSchedule = (idAnimal: number) => {
  return useQuery({
    queryKey: ["animal-care-schedule", idAnimal],
    queryFn: () => fetchAnimalCareSchedule(idAnimal),
    staleTime: 1000 * 60 * 5,
    enabled: !!idAnimal,
  });
};
