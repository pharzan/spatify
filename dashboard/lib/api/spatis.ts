import type { paths } from "@/src/generated/api-types";
import { apiFetch } from "./client";

type SpatiListResponse = paths["/spatis"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateSpatiPayload = paths["/admin/spatis"]["post"]["requestBody"]["content"]["application/json"];
type UpdateSpatiPayload = paths["/admin/spatis/{id}"]["put"]["requestBody"]["content"]["application/json"];
type CreateSpatiResult = paths["/admin/spatis"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateSpatiResult = paths["/admin/spatis/{id}"]["put"]["responses"]["200"]["content"]["application/json"];
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

export const createSpati = (payload: CreateSpatiPayload) =>
  apiFetch<CreateSpatiResult>("/admin/spatis", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateSpati = (id: SpatiId, data: UpdateSpatiPayload) =>
  apiFetch<UpdateSpatiResult>(`/admin/spatis/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteSpati = (id: SpatiId) =>
  apiFetch<void>(`/admin/spatis/${id}`, {
    method: "DELETE",
  });
