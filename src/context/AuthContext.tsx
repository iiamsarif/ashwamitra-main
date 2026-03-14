import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, getToken, setToken, removeToken } from "@/lib/api";

export type UserRole = "farmer" | "b2b" | "customer" | "admin" | null;

interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  profile: any | null;
  login: (email: string, password: string, role?: string, phone?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and fetch user
  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi
        .getMe()
        .then((data) => {
          setUser({
            id: data.user._id,
            name: data.user.name,
            role: data.user.role,
            email: data.user.email,
            phone: data.user.phone,
            avatar: data.user.avatar,
            status: data.user.status,
          });
          setProfile(data.profile);
        })
        .catch(() => {
          removeToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, role?: string, phone?: string) => {
    const data = await authApi.login(email, password, role, phone);
    setToken(data.token);
    setUser({
      id: data.user.id,
      name: data.user.name,
      role: data.user.role,
      email: data.user.email,
      status: data.user.status,
    });
    // Fetch full profile
    try {
      const meData = await authApi.getMe();
      setProfile(meData.profile);
    } catch {}
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser({
      id: res.user.id,
      name: res.user.name,
      role: res.user.role,
      email: res.user.email,
      status: res.user.status,
    });
    try {
      const meData = await authApi.getMe();
      setProfile(meData.profile);
    } catch {}
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        profile,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
