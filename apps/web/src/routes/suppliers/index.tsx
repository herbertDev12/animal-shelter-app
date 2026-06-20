import { createFileRoute } from "@tanstack/react-router";
import { SuppliersList } from "@/modules/supplier/list/suppliers-list";

export const Route = createFileRoute("/suppliers/")({
  component: SuppliersList,
});
