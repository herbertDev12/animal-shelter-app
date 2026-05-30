import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/events")({
  component: EventsComponent,
});

function EventsComponent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      <p>This is the events page content.</p>
    </div>
  );
}
