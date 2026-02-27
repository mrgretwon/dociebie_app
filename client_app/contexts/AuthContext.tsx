import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from "@/models/data-models/auth";
import { fetchProfile, loginRequest, registerRequest } from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthOptions = {
  persist?: boolean;
};

type AuthContextValue = {
  token: string | null;
  user: UserProfile | null;
  isHydrating: boolean;
  isAuthenticating: boolean;
  login: (credentials: LoginPayload, options?: AuthOptions) => Promise<void>;
  register: (payload: RegisterPayload, options?: AuthOptions) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const TOKEN_STORAGE_KEY = "do-ciebie-auth-token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const applyAuthResponse = useCallback(async (auth: AuthResponse, persistToken = true) => {
    setToken(auth.token);
    setUser(auth.user);

    if (persistToken) {
      await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, auth.token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginPayload, options?: AuthOptions) => {
      setIsAuthenticating(true);
      try {
        const response = await loginRequest(credentials);
        await applyAuthResponse(response, options?.persist ?? true);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload: RegisterPayload, options?: AuthOptions) => {
      setIsAuthenticating(true);
      try {
        const response = await registerRequest(payload);
        await applyAuthResponse(response, options?.persist ?? true);
      } finally {
        setIsAuthenticating(false);
      }
    },
    [applyAuthResponse]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await fetchProfile(token);
      setUser(profile);
    } catch (error) {
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      throw error;
    }
  }, [token]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
  }, []);

  useEffect(() => {
    const hydrateFromStorage = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);

        if (!storedToken) {
          setToken(null);
          setUser(null);
          return;
        }

        const profile = await fetchProfile(storedToken);
        setToken(storedToken);
        setUser(profile);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateFromStorage();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isHydrating,
      isAuthenticating,
      login,
      register,
      refreshProfile,
      logout,
    }),
    [token, user, isHydrating, isAuthenticating, login, register, refreshProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
