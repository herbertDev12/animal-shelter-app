import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profit")({
  component: ProfitComponent,
});

function ProfitComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Profit Page</h1>
      <p>This is the profit page content.</p>
    </div>
  );
}
