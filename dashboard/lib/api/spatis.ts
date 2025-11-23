import type { paths } from "@/generated/api-types";
import { apiFetch } from "./client";

type SpatiListResponse =
  paths["/spatis"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateSpatiPayload = NonNullable<
  paths["/admin/spatis"]["post"]["requestBody"]
>["content"]["multipart/form-data"];
type UpdateSpatiPayload = NonNullable<
  paths["/admin/spatis/{id}"]["put"]["requestBody"]
>["content"]["multipart/form-data"];
type CreateSpatiResult =
  paths["/admin/spatis"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateSpatiResult =
  paths["/admin/spatis/{id}"]["put"]["responses"]["200"]["content"]["application/json"];
type SpatiId = paths["/admin/spatis/{id}"]["put"]["parameters"]["path"]["id"];

export type Spati = SpatiListResponse[number];

export type {
  CreateSpatiPayload,
  CreateSpatiResult,
  SpatiId,
  SpatiListResponse,
  UpdateSpatiPayload,
  UpdateSpatiResult,
};

export const listSpatis = () => apiFetch<SpatiListResponse>("/spatis");

export const createSpati = (payload: CreateSpatiPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("latitude", String(payload.latitude));
  formData.append("longitude", String(payload.longitude));
  formData.append("address", payload.address);
  formData.append("hours", payload.hours);
  formData.append("type", payload.type);
  formData.append("rating", String(payload.rating));

  if (payload.amenityIds) {
    payload.amenityIds.forEach((id) => formData.append("amenityIds", id));
  }

  if (payload.image) {
    formData.append("image", payload.image as unknown as Blob);
  }
  if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl);
  }

  return apiFetch<CreateSpatiResult>("/admin/spatis", {
    method: "POST",
    body: formData,
  });
};

export const updateSpati = (id: SpatiId, data: UpdateSpatiPayload) => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("latitude", String(data.latitude));
  formData.append("longitude", String(data.longitude));
  formData.append("address", data.address);
  formData.append("hours", data.hours);
  formData.append("type", data.type);
  formData.append("rating", String(data.rating));

  if (data.amenityIds) {
    data.amenityIds.forEach((id) => formData.append("amenityIds", id));
  }

  if (data.image) {
    formData.append("image", data.image as unknown as Blob);
  }
  if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  if (data.removeImage) {
    formData.append("removeImage", "true");
  }

  return apiFetch<UpdateSpatiResult>(`/admin/spatis/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteSpati = (id: SpatiId) =>
  apiFetch<void>(`/admin/spatis/${id}`, {
    method: "DELETE",
  });
