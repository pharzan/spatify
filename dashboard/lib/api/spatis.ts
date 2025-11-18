"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { paths } from "@/src/generated/api-types";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333").replace(/\/$/, "");

type SpatiListResponse = paths["/spatis"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateSpatiPayload = paths["/admin/spatis"]["post"]["requestBody"]["content"]["application/json"];
type UpdateSpatiPayload = paths["/admin/spatis/{id}"]["put"]["requestBody"]["content"]["application/json"];
type CreateSpatiResult = paths["/admin/spatis"]["post"]["responses"]["201"]["content"]["application/json"];
type UpdateSpatiResult = paths["/admin/spatis/{id}"]["put"]["responses"]["200"]["content"]["application/json"];
type SpatiId = paths["/admin/spatis/{id}"]["put"]["parameters"]["path"]["id"];

export type Spati = SpatiListResponse[number];

const spatiKeys = {
  all: ["spatis"] as const,
  list: () => ["spatis", "list"] as const,
  detail: (id: SpatiId) => ["spatis", "detail", id] as const,
};

async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request to ${path} failed with status ${response.status}`);
  }

  if (response.status === 204 || response.status === 205 || response.status === 304) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as TResponse;
  }

  const text = await response.text();
  if (!text) {
    return undefined as TResponse;
  }

  return JSON.parse(text) as TResponse;
}

export const useSpatisQuery = (
  options?: UseQueryOptions<SpatiListResponse, Error>,
) =>
  useQuery({
    queryKey: spatiKeys.list(),
    queryFn: () => apiFetch<SpatiListResponse>("/spatis"),
    ...options,
  });

export const useCreateSpatiMutation = (
  options?: UseMutationOptions<CreateSpatiResult, Error, CreateSpatiPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiFetch<CreateSpatiResult>("/admin/spatis", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: spatiKeys.list() });
      await options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateSpatiMutation = (
  options?: UseMutationOptions<
    UpdateSpatiResult,
    Error,
    { id: SpatiId; data: UpdateSpatiPayload }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch<UpdateSpatiResult>(`/admin/spatis/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: spatiKeys.list() }),
        queryClient.invalidateQueries({ queryKey: spatiKeys.detail(variables.id) }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useDeleteSpatiMutation = (
  options?: UseMutationOptions<void, Error, SpatiId>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiFetch<void>(`/admin/spatis/${id}`, {
        method: "DELETE",
      }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: spatiKeys.list() }),
        queryClient.invalidateQueries({ queryKey: spatiKeys.detail(variables) }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
  });
};

export const spatiQueryKeys = spatiKeys;
