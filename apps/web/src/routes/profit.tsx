import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profit')({
  component: () => (
    <div className="p-2">
      <h3 className="text-2xl font-bold">Profit</h3>
      <p className="text-gray-400">Profit statistics will be displayed here.</p>
    </div>
  ),
})
