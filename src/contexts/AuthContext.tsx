import React, { createContext, useContext, useEffect, useState } from "react";

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
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const STORAGE_KEY = "linkaid-auth-user";

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "admin@exemplo.com": {
    password: "admin123",
    user: {
      email: "admin@exemplo.com",
      name: "Ana Costa",
      role: "admin",
      initials: "AC",
      roleLabel: "Administradora",
    },
  },
  "colab@exemplo.com": {
    password: "colab123",
    user: {
      email: "colab@exemplo.com",
      name: "Carlos Silva",
      role: "colaborador",
      initials: "CS",
      roleLabel: "Colaborador",
    },
  },
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => ({ ok: false }),
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (email: string, password: string) => {
    const record = MOCK_USERS[email.trim().toLowerCase()];
    if (!record || record.password !== password) {
      return { ok: false, error: "E-mail ou senha inválidos." };
    }
    setUser(record.user);
    return { ok: true };
  };

  const logout = () => setUser(null);

  const updateUser = (patch: Partial<User>) =>
    setUser((u) => (u ? { ...u, ...patch } : u));

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
