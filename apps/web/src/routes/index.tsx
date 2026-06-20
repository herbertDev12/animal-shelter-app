import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <h2 className="text-3xl font-bold tracking-tight">
        Welcome to Amigo de Patas Shelter
      </h2>
    </div>
  );
}
