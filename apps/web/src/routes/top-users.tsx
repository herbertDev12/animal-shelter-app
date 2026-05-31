import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/top-users")({
  component: TopUsersComponent,
});

function TopUsersComponent() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Top Users</h2>
        <p className="text-gray-400 mt-1">View your most active users.</p>
      </div>
      <div className="bg-[#0f1419] border border-[#1a1f2e] rounded-xl p-6">
        <p className="text-gray-400">Top users content coming soon...</p>
      </div>
    </div>
  );
}
