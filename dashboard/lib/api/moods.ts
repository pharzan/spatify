import type { paths } from "@/generated/api-types";
import { apiFetch } from "./client";

type MoodListResponse =
  paths["/admin/moods"]["get"]["responses"]["200"]["content"]["application/json"];

type CreateMoodPayload = NonNullable<
  paths["/admin/moods"]["post"]["requestBody"]
>["content"]["multipart/form-data"];

type CreateMoodResult =
  paths["/admin/moods"]["post"]["responses"]["201"]["content"]["application/json"];

type UpdateMoodPayload = NonNullable<
  paths["/admin/moods/{id}"]["put"]["requestBody"]
>["content"]["multipart/form-data"];

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

export const createMood = (payload: CreateMoodPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("color", payload.color);
  if (payload.image) {
    formData.append("image", payload.image as unknown as Blob);
  }
  if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl);
  }

  return apiFetch<CreateMoodResult>("/admin/moods", {
    method: "POST",
    body: formData,
  });
};

export const updateMood = (id: MoodId, data: UpdateMoodPayload) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("color", data.color);
  if (data.image) {
    formData.append("image", data.image as unknown as Blob);
  }
  if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  if (data.removeImage) {
    formData.append("removeImage", "true");
  }

  return apiFetch<UpdateMoodResult>(`/admin/moods/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteMood = (id: MoodId) =>
  apiFetch<void>(`/admin/moods/${id}`, {
    method: "DELETE",
  });
