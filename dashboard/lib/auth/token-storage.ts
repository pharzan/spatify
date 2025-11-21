"use client";

const TOKEN_STORAGE_KEY = "spatify.admin.token";
let currentToken: string | null = null;

const hasWindowStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

export const getStoredAuthToken = () => {
  if (currentToken) return currentToken;
  if (!hasWindowStorage()) return null;
  const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  currentToken = stored;
  return currentToken;
};

export const getAuthToken = () => currentToken;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (!hasWindowStorage()) return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};
