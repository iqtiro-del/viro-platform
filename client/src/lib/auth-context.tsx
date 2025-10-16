import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

type AuthUser = Omit<User, 'password'>;

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem("tiro-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("tiro-user", JSON.stringify(userData));
    setLocation("/");
  };

  const register = async (data: { username: string; password: string; fullName: string }) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    const userData = await response.json();
    setUser(userData);
    localStorage.setItem("tiro-user", JSON.stringify(userData));
    setLocation("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tiro-user");
    setLocation("/login");
  };

  const updateUser = (updatedUser: AuthUser | null) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem("tiro-user", JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem("tiro-user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
