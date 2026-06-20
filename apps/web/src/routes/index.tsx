import { createFileRoute } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 min-h-[70vh] text-center">
      <PawPrint className="text-purple-400" size={160} strokeWidth={1.5} />
      <h2 className="text-3xl font-bold tracking-tight">
        Welcome to Amigo de Patas Shelter
      </h2>
    </div>
  );
}
