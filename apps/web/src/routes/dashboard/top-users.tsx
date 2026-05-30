import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/top-users")({
  component: TopUsersComponent,
});

function TopUsersComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Top Users</h1>
      <p>This is the top users page content.</p>
    </div>
  );
}
