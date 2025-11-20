"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { paths } from "@/src/generated/api-types";
import { apiFetch } from "./client";
import { spatiQueryKeys } from "./spatis";

type AmenityListResponse =
  paths["/admin/amenities"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateAmenityPayload =
  paths["/admin/amenities"]["post"]["requestBody"]["content"]["application/json"];
type CreateAmenityResult =
  paths["/admin/amenities"]["post"]["responses"]["201"]["content"]["application/json"];
type AmenityId = paths["/admin/amenities/{id}"]["delete"]["parameters"]["path"]["id"];

export type Amenity = AmenityListResponse[number];

const amenityKeys = {
  all: ["amenities"] as const,
  list: () => ["amenities", "list"] as const,
};

export const useAmenitiesQuery = (
  options?: UseQueryOptions<AmenityListResponse, Error>,
) =>
  useQuery({
    queryKey: amenityKeys.list(),
    queryFn: () => apiFetch<AmenityListResponse>("/admin/amenities"),
    ...options,
  });

export const useCreateAmenityMutation = (
  options?: UseMutationOptions<CreateAmenityResult, Error, CreateAmenityPayload>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      apiFetch<CreateAmenityResult>("/admin/amenities", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: amenityKeys.list() }),
        queryClient.invalidateQueries({ queryKey: spatiQueryKeys.list() }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useDeleteAmenityMutation = (
  options?: UseMutationOptions<void, Error, AmenityId>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      apiFetch<void>(`/admin/amenities/${id}`, {
        method: "DELETE",
      }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: amenityKeys.list() }),
        queryClient.invalidateQueries({ queryKey: spatiQueryKeys.list() }),
      ]);
      await options?.onSuccess?.(data, variables, context);
    },
  });
};

export const amenityQueryKeys = amenityKeys;
