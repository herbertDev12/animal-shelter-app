import { createFileRoute } from "@tanstack/react-router";
import { ContractsList } from "@/modules/contract/list/contracts-list";

export const Route = createFileRoute("/contracts/")({
  component: ContractsList,
});
