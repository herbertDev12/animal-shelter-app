import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useBoundStore } from '../store/useBoundStore'

function Dashboard() {
  const { count, inc } = useBoundStore()
  return (
    <div>
      <h3>React Router Section</h3>
      <p>Zustand Shared Count: {count}</p>
      <button onClick={inc}>Increment via React Router</button>
    </div>
  )
}

export function ReactRouterSubApp() {
  return (
    <BrowserRouter basename="/react-router">
      <nav style={{ display: 'flex', gap: '10px' }}>
        <Link to="/">Dashboard Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}