import type { paths } from "@/generated/api-types";
import { apiFetch } from "./client";

type MoodListResponse =
  paths["/admin/moods"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateMoodPayload = NonNullable<
  paths["/admin/moods"]["post"]["requestBody"]
>["content"]["application/json"];
type CreateMoodResult =
  paths["/admin/moods"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateMoodPayload = NonNullable<
  paths["/admin/moods/{id}"]["put"]["requestBody"]
>["content"]["application/json"];
type UpdateMoodResult =
  paths["/admin/moods/{id}"]["put"]["responses"]["200"]["content"]["application/json"];
type MoodId = paths["/admin/moods/{id}"]["delete"]["parameters"]["path"]["id"];

export type Mood = MoodListResponse[number];

export type {
  MoodId,
  MoodListResponse,
  CreateMoodPayload,
  CreateMoodResult,
  UpdateMoodPayload,
  UpdateMoodResult,
};

export const listMoods = () => apiFetch<MoodListResponse>("/admin/moods");

export const createMood = (payload: CreateMoodPayload) =>
  apiFetch<CreateMoodResult>("/admin/moods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

export const updateMood = (id: MoodId, data: UpdateMoodPayload) =>
  apiFetch<UpdateMoodResult>(`/admin/moods/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

export const deleteMood = (id: MoodId) =>
  apiFetch<void>(`/admin/moods/${id}`, {
    method: "DELETE",
  });
