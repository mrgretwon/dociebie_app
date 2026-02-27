import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from "@/models/data-models/auth";
import {
  fetchProfile,
  loginRequest,
  registerRequest,
  refreshToken as refreshTokenRequest,
} from "@/services/api";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

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

const ACCESS_TOKEN_KEY = "do-ciebie-access-token";
const REFRESH_TOKEN_KEY = "do-ciebie-refresh-token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Keep a ref so async callbacks always see latest refresh token
  const refreshTokenRef = useRef<string | null>(null);

  const clearAuth = useCallback(async () => {
    setToken(null);
    setUser(null);
    refreshTokenRef.current = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }, []);

  const applyAuthResponse = useCallback(
    async (auth: AuthResponse, persistTokens = true) => {
      setToken(auth.access);
      setUser(auth.user);
      refreshTokenRef.current = auth.refresh;

      if (persistTokens) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, auth.access);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, auth.refresh);
      } else {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    },
    []
  );

  const tryRefreshToken = useCallback(async (): Promise<string | null> => {
    const storedRefresh =
      refreshTokenRef.current ?? (await SecureStore.getItemAsync(REFRESH_TOKEN_KEY));

    if (!storedRefresh) return null;

    try {
      const { access } = await refreshTokenRequest(storedRefresh);
      setToken(access);
      refreshTokenRef.current = storedRefresh;
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
      return access;
    } catch {
      await clearAuth();
      return null;
    }
  }, [clearAuth]);

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
    } catch {
      // Access token may have expired — try refreshing
      const newToken = await tryRefreshToken();
      if (newToken) {
        try {
          const profile = await fetchProfile(newToken);
          setUser(profile);
          return;
        } catch {
          // refresh succeeded but profile still fails
        }
      }
      await clearAuth();
    }
  }, [token, tryRefreshToken, clearAuth]);

  const logout = useCallback(async () => {
    await clearAuth();
  }, [clearAuth]);

  // Hydrate from storage on mount
  useEffect(() => {
    const hydrateFromStorage = async () => {
      try {
        const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (!storedRefresh) {
          // No refresh token — clean start
          await clearAuth();
          return;
        }

        refreshTokenRef.current = storedRefresh;

        // Try stored access token first
        const storedAccess = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

        if (storedAccess) {
          try {
            const profile = await fetchProfile(storedAccess);
            setToken(storedAccess);
            setUser(profile);
            return;
          } catch {
            // Access token expired, will try refresh below
          }
        }

        // Access token missing or expired — try refresh
        const newAccess = await tryRefreshToken();
        if (newAccess) {
          const profile = await fetchProfile(newAccess);
          setUser(profile);
        } else {
          await clearAuth();
        }
      } catch {
        await clearAuth();
      } finally {
        setIsHydrating(false);
      }
    };

    hydrateFromStorage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
