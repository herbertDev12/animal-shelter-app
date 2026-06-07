import { useQuery } from "@tanstack/react-query";
import { fetchReconciledVeterinarianContracts } from "./services";

export const useReconciledVeterinarianContracts = () => {
  return useQuery({
    queryKey: ["reconciled-veterinarian-contracts"],
    queryFn: fetchReconciledVeterinarianContracts,
    staleTime: 1000 * 60 * 5,
  });
};
