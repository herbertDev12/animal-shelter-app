import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '../components/dashboard/sidebar'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans">
      <Sidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  ),
})
