import { useQuery } from "@tanstack/react-query";
import { fetchComplementaryServiceContracts } from "./services";

export const useComplementaryServiceContracts = () => {
  return useQuery({
    queryKey: ["complementary-service-contracts"],
    queryFn: fetchComplementaryServiceContracts,
    staleTime: 1000 * 60 * 5,
  });
};
