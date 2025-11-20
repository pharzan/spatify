import type { paths } from "@/src/generated/api-types";
import { apiFetch } from "./client";

type AmenityListResponse =
  paths["/admin/amenities"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateAmenityPayload =
  paths["/admin/amenities"]["post"]["requestBody"]["content"]["application/json"];
type CreateAmenityResult =
  paths["/admin/amenities"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateAmenityPayload =
  paths["/admin/amenities/{id}"]["put"]["requestBody"]["content"]["application/json"];
type UpdateAmenityResult =
  paths["/admin/amenities/{id}"]["put"]["responses"]["200"]["content"]["application/json"];
type AmenityId = paths["/admin/amenities/{id}"]["delete"]["parameters"]["path"]["id"];

export type Amenity = AmenityListResponse[number];

export type {
  AmenityId,
  AmenityListResponse,
  CreateAmenityPayload,
  CreateAmenityResult,
  UpdateAmenityPayload,
  UpdateAmenityResult,
};

export const listAmenities = () => apiFetch<AmenityListResponse>("/admin/amenities");

export const createAmenity = (payload: CreateAmenityPayload) =>
  apiFetch<CreateAmenityResult>("/admin/amenities", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateAmenity = (id: AmenityId, data: UpdateAmenityPayload) =>
  apiFetch<UpdateAmenityResult>(`/admin/amenities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAmenity = (id: AmenityId) =>
  apiFetch<void>(`/admin/amenities/${id}`, {
    method: "DELETE",
  });
