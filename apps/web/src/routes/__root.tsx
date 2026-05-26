import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ padding: '10px', background: '#eee', display: 'flex', gap: '15px' }}>
        <Link to="/" activeProps={{ style: { fontWeight: 'bold' } }}>
          TanStack Home
        </Link>
        <a href="/react-router">Go to React Router App</a>
      </div>
      <hr />
      <Outlet />
    </>
  ),
})
