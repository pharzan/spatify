"use client";

import { getAuthToken } from "@/lib/auth/token-storage";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3333").replace(
  /\/$/,
  "",
);

export async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init?.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

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

export { API_BASE_URL };
