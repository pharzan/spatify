"use client";

import type { AuthProvider } from "ra-core";
import { login } from "@/lib/api/auth";
import {
  getStoredAuthToken,
  setAuthToken,
} from "@/lib/auth/token-storage";

const IDENTITY_STORAGE_KEY = "spatify.admin.identity";

type StoredIdentity = {
  id: string;
  fullName: string;
  email: string;
} | null;

const saveIdentity = (identity: StoredIdentity) => {
  if (typeof window === "undefined") {
    return;
  }
  if (identity) {
    window.localStorage.setItem(
      IDENTITY_STORAGE_KEY,
      JSON.stringify(identity),
    );
  } else {
    window.localStorage.removeItem(IDENTITY_STORAGE_KEY);
  }
};

const loadIdentity = (): StoredIdentity => {
  if (typeof window === "undefined") {
    return null;
  }
  const saved = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as StoredIdentity;
  } catch {
    return null;
  }
};

export const authProvider: AuthProvider = {
  async login(params) {
    const email = params?.email;
    const password = params?.password;
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const response = await login({ email, password });
    setAuthToken(response.token);
    saveIdentity({
      id: email,
      email,
      fullName: email,
    });
  },

  async logout() {
    setAuthToken(null);
    saveIdentity(null);
  },

  async checkAuth() {
    const token = getStoredAuthToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
  },

  async checkError(error) {
    const status = (error && "status" in error && error.status) || undefined;
    if (status === 401 || status === 403) {
      setAuthToken(null);
      saveIdentity(null);
      throw error;
    }
  },

  async getPermissions() {
    return [];
  },

  async getIdentity() {
    const identity = loadIdentity();
    if (identity) {
      return identity;
    }
    return {
      id: "spati-admin",
      fullName: "Späti Admin",
      email: "admin@example.com",
    };
  },
};
