/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import api from "../api/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "hallmark.auth";
const TOKEN_STORAGE_KEY = "hallmark.jwt";

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();
  if (value.includes("manager")) return "manager";
  if (value.includes("reception")) return "receptionist";
  return value || "receptionist";
}

function readStoredAuth() {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedValue && !token) {
      return { user: null, token: null, isAuthenticated: false };
    }

    const parsed = storedValue ? JSON.parse(storedValue) : {};
    return {
      user: parsed.user || null,
      token: token || parsed.token || null,
      isAuthenticated: Boolean(token || parsed.token),
    };
  } catch (error) {
    console.warn("Unable to restore authentication session", error);
    return { user: null, token: null, isAuthenticated: false };
  }
}

export function AuthProvider({ children }) {
  const storedAuth = useMemo(() => readStoredAuth(), []);
  const [user, setUserState] = useState(storedAuth.user);
  const [token, setTokenState] = useState(storedAuth.token);
  const [isAuthenticated, setIsAuthenticatedState] = useState(storedAuth.isAuthenticated);

  const persistAuth = useCallback((nextUser, nextToken) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken || "");
    }
  }, []);

  const clearAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setUserState(null);
    setTokenState(null);
    setIsAuthenticatedState(false);
  }, []);

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);
    if (nextUser) {
      persistAuth(nextUser, token);
    }
  }, [persistAuth, token]);

  const setIsAuthenticated = useCallback((value) => {
    setIsAuthenticatedState(Boolean(value));
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const authPayload = response.data || {};
    const nextUser = {
      id: authPayload.username || credentials.username,
      name: authPayload.fullName || authPayload.username || credentials.username,
      username: authPayload.username || credentials.username,
      role: normalizeRole(authPayload.role || "RECEPTIONIST"),
    };
    const nextToken = authPayload.accessToken || authPayload.token;

    persistAuth(nextUser, nextToken);
    setUserState(nextUser);
    setTokenState(nextToken);
    setIsAuthenticatedState(Boolean(nextToken));

    return nextUser;
  }, [persistAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout, setIsAuthenticated, setUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
