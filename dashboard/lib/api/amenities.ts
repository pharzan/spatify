import type { paths } from "@/generated/api-types";
import { apiFetch } from "./client";

type AmenityListResponse =
  paths["/admin/amenities"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateAmenityPayload = NonNullable<
  paths["/admin/amenities"]["post"]["requestBody"]
>["content"]["multipart/form-data"];
type CreateAmenityResult =
  paths["/admin/amenities"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateAmenityPayload = NonNullable<
  paths["/admin/amenities/{id}"]["put"]["requestBody"]
>["content"]["multipart/form-data"];
type UpdateAmenityResult =
  paths["/admin/amenities/{id}"]["put"]["responses"]["200"]["content"]["application/json"];
type AmenityId =
  paths["/admin/amenities/{id}"]["delete"]["parameters"]["path"]["id"];

export type Amenity = AmenityListResponse[number];

export type {
  AmenityId,
  AmenityListResponse,
  CreateAmenityPayload,
  CreateAmenityResult,
  UpdateAmenityPayload,
  UpdateAmenityResult,
};

export const listAmenities = () =>
  apiFetch<AmenityListResponse>("/admin/amenities");

export const createAmenity = (payload: CreateAmenityPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.image) {
    formData.append("image", payload.image as unknown as Blob);
  }
  if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl);
  }

  return apiFetch<CreateAmenityResult>("/admin/amenities", {
    method: "POST",
    body: formData,
  });
};

export const updateAmenity = (id: AmenityId, data: UpdateAmenityPayload) => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.image) {
    formData.append("image", data.image as unknown as Blob);
  }
  if (data.imageUrl) {
    formData.append("imageUrl", data.imageUrl);
  }
  if (data.removeImage) {
    formData.append("removeImage", "true");
  }

  return apiFetch<UpdateAmenityResult>(`/admin/amenities/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteAmenity = (id: AmenityId) =>
  apiFetch<void>(`/admin/amenities/${id}`, {
    method: "DELETE",
  });
