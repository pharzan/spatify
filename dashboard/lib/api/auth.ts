"use client";

import type { components, paths } from "@/src/generated/api-types";
import { apiFetch } from "@/lib/api/client";

type LoginPath = paths["/admin/auth/login"]["post"];
export type AdminLoginPayload = components["schemas"]["AdminLogin"];
export type AdminAuthResponse =
  LoginPath["responses"]["200"]["content"]["application/json"];

export const login = (payload: AdminLoginPayload) =>
  apiFetch<AdminAuthResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
