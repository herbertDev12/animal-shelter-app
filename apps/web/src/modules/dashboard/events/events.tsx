"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AnalyticsHeader } from "./components/analytics-header";
import { EventTimeline } from "./components/event-timeline";
import { ProfitImpactAnalysis } from "./components/profit-impact-analysis";
import { getEvents, createEvent, updateEvent, deleteEvent } from "./services";
import { EventFormValues } from "./schema";
import { DashboardEvent } from "./types";
import { EditEventDialog } from "./components/edit-event-dialog";

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  const activeEventId =
    selectedEventId ||
    (events.length > 0 ? events[events.length - 1].id : null);
  const selectedEvent = events.find((e) => e.id === activeEventId) || null;

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },
    onError: () => {
      toast.error("Failed to create event. Please try again.");
    },
  });

  const handleAddEvent = async (data: EventFormValues) => {
    await createEventMutation.mutateAsync(data);
  };

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully!");
      if (selectedEventId) setSelectedEventId(null);
    },
    onError: () => {
      toast.error("Failed to delete event.");
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventFormValues }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully!");
      setIsEditModalOpen(false);
      setEditingEvent(null);
    },
    onError: () => {
      toast.error("Failed to update event.");
    },
  });

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEventMutation.mutateAsync(id);
    }
  };

  const handleEditClick = (event: DashboardEvent) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  return (
    <div className="ml-64 pt-16 min-h-screen bg-[#0b0e14] p-8 overflow-y-auto">
      <AnalyticsHeader
        onAddEvent={handleAddEvent}
        isSubmitting={createEventMutation.isPending}
      />
      <EventTimeline
        events={events}
        isLoading={isLoading}
        selectedEventId={activeEventId}
        onSelectEvent={setSelectedEventId}
        onEditEvent={handleEditClick}
        onDeleteEvent={handleDeleteEvent}
      />
      <ProfitImpactAnalysis event={selectedEvent} />

      <EditEventDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={editingEvent}
        onSave={async (data) => {
          if (editingEvent)
            await updateEventMutation.mutateAsync({
              id: editingEvent.id,
              data,
            });
        }}
        isSubmitting={updateEventMutation.isPending}
      />
    </div>
  );
}
