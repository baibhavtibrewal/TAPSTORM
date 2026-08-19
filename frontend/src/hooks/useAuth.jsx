import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth as authApi } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem("ts_token");
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem("ts_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const { token, user } = await authApi.login(username, password);
    localStorage.setItem("ts_token", token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (username, password) => {
    const { token, user } = await authApi.register(username, password);
    localStorage.setItem("ts_token", token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ts_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
