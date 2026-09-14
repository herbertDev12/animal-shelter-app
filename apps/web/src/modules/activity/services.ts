import type {
  Activity,
  CreateActivity,
  SearchActivityFilters,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchActivities = (
  filters: Partial<SearchActivityFilters> = {},
): Promise<Activity[]> => {
  const params = new URLSearchParams();

  if (filters.id_animal != null)
    params.append("id_animal", String(filters.id_animal));
  if (filters.id_service != null)
    params.append("id_service", String(filters.id_service));
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  return fetchWithAuth<Activity[]>(`/activities/search?${params.toString()}`);
};

export const fetchActivity = (id: string): Promise<Activity> => {
  return fetchWithAuth<Activity>(`/activities/${id}`);
};

export const createActivity = (data: CreateActivity): Promise<Activity> => {
  return fetchWithAuth<Activity>(`/activities`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateActivity = (
  id: string,
  data: Partial<CreateActivity>,
): Promise<Activity> => {
  return fetchWithAuth<Activity>(`/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteActivity = (id: string): Promise<void> => {
  return fetchWithAuth<void>(`/activities/${id}`, {
    method: "DELETE",
  });
};
