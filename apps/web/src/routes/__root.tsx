import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@repo/ui";
import { Sidebar } from "../components/dashboard/sidebar";
import { getToken } from "@/lib/api/token";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  // A presence check, not verification — the API stays the authority. An
  // expired or forged token is caught by the 401 handler in fetchWithAuth.
  beforeLoad: ({ location }) => {
    const isAuthenticated = !!getToken();

    if (!isAuthenticated && location.pathname !== "/login") {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    if (isAuthenticated && location.pathname === "/login") {
      throw redirect({ to: "/" });
    }
  },
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // The login screen is standalone: no sidebar, no dashboard chrome.
  if (pathname === "/login") {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans">
      <Sidebar />
      <main className="ml-64 p-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
