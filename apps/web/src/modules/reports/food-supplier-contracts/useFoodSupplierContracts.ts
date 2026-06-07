import { useQuery } from "@tanstack/react-query";
import { fetchFoodSupplierContracts } from "./services";

export const useFoodSupplierContracts = () => {
  return useQuery({
    queryKey: ["food-supplier-contracts"],
    queryFn: fetchFoodSupplierContracts,
    staleTime: 1000 * 60 * 5,
  });
};
