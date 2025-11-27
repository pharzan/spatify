import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { components } from "../generated/api-types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3333";

export type SpatiListResponse =
  components["schemas"]["PublicSpatiLocationsResponse"];
export type SpatiLocation = components["schemas"]["PublicSpatiLocation"];

export const spatiKeys = {
  all: ["spatis"] as const,
  list: () => [...spatiKeys.all, "list"] as const,
  detail: (id: SpatiLocation["id"]) =>
    [...spatiKeys.list(), "detail", id] as const,
};

const fetchSpatis = async (): Promise<SpatiListResponse> => {
  const response = await fetch(`${API_BASE_URL}/spatis`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "Failed to fetch locations");
  }

  return response.json();
};

export const useSpatisQuery = (
  options?: UseQueryOptions<SpatiListResponse, Error>
) =>
  useQuery<SpatiListResponse, Error>({
    queryKey: spatiKeys.list(),
    queryFn: fetchSpatis,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
