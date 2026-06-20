import type {
  ActivitySchedule,
  CreateActivitySchedule,
  SearchActivityScheduleFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchActivitySchedules = async (
  filters: Partial<SearchActivityScheduleFilters> = {},
): Promise<ActivitySchedule[]> => {
  const params = new URLSearchParams();

  if (filters.id_animal != null)
    params.append("id_animal", String(filters.id_animal));
  if (filters.id_contract != null)
    params.append("id_contract", String(filters.id_contract));
  if (filters.activity_type)
    params.append("activity_type", filters.activity_type);
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/activity-schedules/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch activity schedules");
  return response.json();
};

export const fetchActivitySchedule = async (
  id: number,
): Promise<ActivitySchedule> => {
  const response = await fetch(`${API_URL}/activity-schedules/${id}`);
  if (!response.ok) throw new Error("Failed to fetch activity schedule");
  return response.json();
};

export const createActivitySchedule = async (
  data: CreateActivitySchedule,
): Promise<ActivitySchedule> => {
  const response = await fetch(`${API_URL}/activity-schedules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create activity schedule");
  return response.json();
};

export const updateActivitySchedule = async (
  id: number,
  data: Partial<CreateActivitySchedule>,
): Promise<ActivitySchedule> => {
  const response = await fetch(`${API_URL}/activity-schedules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update activity schedule");
  return response.json();
};

export const deleteActivitySchedule = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/activity-schedules/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete activity schedule");
};
