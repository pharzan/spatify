import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { components } from "./generated/api-types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type SpatiListResponse = components["schemas"]["PublicSpatiLocationsResponse"];
type SpatiLocation = components["schemas"]["PublicSpatiLocation"];
type SpatiId = SpatiLocation["id"];

export const spatiKeys = {
  all: ["spatis"] as const,
  list: () => ["spatis", "list"] as const,
  detail: (id: SpatiId) => ["spatis", "detail", id] as const,
};

export const useSpatisQuery = (
  options?: UseQueryOptions<SpatiListResponse, Error>
) =>
  useQuery<SpatiListResponse, Error>({
    queryKey: spatiKeys.list(),
    queryFn: () => apiFetch<SpatiListResponse>("/spatis"),
    ...options,
  });

export async function apiFetch<TResponse>(
  path: string,
  init?: RequestInit
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is not set. Update your .env file to include this value."
    );
  }

  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      message || `Request to ${path} failed with status ${response.status}`
    );
  }

  if (
    response.status === 204 ||
    response.status === 205 ||
    response.status === 304
  ) {
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

export type { SpatiListResponse, SpatiLocation };
