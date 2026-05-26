import { createFileRoute } from '@tanstack/react-router'
import { useBoundStore } from '../store/useBoundStore'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const { count, dec } = useBoundStore()
  return (
    <div>
      <h3>Welcome to TanStack Router!</h3>
      <p>Zustand Shared Count: {count}</p>
      <button onClick={dec}>Decrement via TanStack</button>
    </div>
  )
}