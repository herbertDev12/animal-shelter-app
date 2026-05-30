import { TopUsersTable } from "./components/top-users-table";
import { TopUser } from "./types";

interface TopUsersPageProps {
  data: TopUser[];
}

export default function TopUsersPage({ data }: TopUsersPageProps) {
  return (
    <main className="ml-64 pt-10 p-8">
      <div className="max-w-7xl mx-auto space-y-8 pt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Top Users Ranking</h2>
            <p className="text-gray-400 mt-1">Analyzing the highest revenue-generating accounts.</p>
          </div>
        </div>
        <TopUsersTable data={data} />
      </div>
    </main>
  );
}
