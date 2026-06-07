import { useQuery } from "@tanstack/react-query";
import { fetchActiveVeterinarians } from "./services";

export const useActiveVeterinarians = () => {
  return useQuery({
    queryKey: ["active-veterinarians"],
    queryFn: fetchActiveVeterinarians,
    staleTime: 1000 * 60 * 5,
  });
};
