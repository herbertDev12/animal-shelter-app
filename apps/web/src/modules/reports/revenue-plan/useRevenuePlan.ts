import { useQuery } from "@tanstack/react-query";
import { fetchRevenuePlan } from "./services";

export const useRevenuePlan = () => {
  return useQuery({
    queryKey: ["revenue-plan"],
    queryFn: fetchRevenuePlan,
    staleTime: 1000 * 60 * 5,
  });
};
