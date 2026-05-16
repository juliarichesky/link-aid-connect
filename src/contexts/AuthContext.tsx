import React, { createContext, useContext, useEffect, useState } from "react";
import { linkAidApi, type ApiLoginResponse, type ApiUsuarioResponse } from "@/lib/linkaidApi";
import { perfilFrontRole, perfilLabel } from "@/lib/linkaidMappings";

export type Role = "admin" | "colaborador";

export interface User {
  email: string;
  name: string;
  role: Role;
  initials: string;
  roleLabel: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const STORAGE_KEY = "linkaid-auth-user";
const TOKEN_STORAGE_KEY = "linkaid-auth-token";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  login: async () => ({ ok: false }),
  logout: () => {},
  updateUser: () => {},
});

const initialsFromName = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const userFromApi = (data: ApiLoginResponse | ApiUsuarioResponse): User => {
  const role = perfilFrontRole(data.perfil) || "colaborador";
  return {
    email: data.email,
    name: data.nome,
    role,
    initials: initialsFromName(data.nome),
    roleLabel: perfilLabel(data.perfil) || (role === "admin" ? "Administradora" : "Colaborador"),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      if (!localStorage.getItem(TOKEN_STORAGE_KEY)) return null;
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let active = true;
    linkAidApi.me(token)
      .then((response) => {
        if (active) setUser(userFromApi(response));
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setToken(null);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await linkAidApi.login(email.trim().toLowerCase(), password);
      setToken(response.token);
      setUser(userFromApi(response));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "E-mail ou senha inválidos.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const updateUser = (patch: Partial<User>) =>
    setUser((u) => (u ? { ...u, ...patch } : u));

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
