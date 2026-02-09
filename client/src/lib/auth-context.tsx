import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { queryClient } from "./queryClient";

type AuthUser = Omit<User, 'password'>;

interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; password: string; fullName: string; email: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  showTelegramDialog: boolean;
  setShowTelegramDialog: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTelegramDialog, setShowTelegramDialog] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem("tiro-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
        localStorage.removeItem("tiro-user");
      }
    }
    // Artificial delay to ensure fonts and layout are ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
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
    setShowTelegramDialog(true);
    setLocation("/");
  };

  const register = async (data: { username: string; password: string; fullName: string; email: string }) => {
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
    
    // Instantly refresh dashboard stats (verified sellers count)
    queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    
    setShowTelegramDialog(true);
    setLocation("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tiro-user");
    setLocation("/");
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        headers: { 'x-user-id': user.id }
      });
      
      if (!response.ok) {
        console.error('Failed to refresh user data');
        return;
      }
      
      const freshUserData = await response.json();
      setUser(freshUserData);
      localStorage.setItem("tiro-user", JSON.stringify(freshUserData));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
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
    <AuthContext.Provider value={{ user, setUser: updateUser, login, register, logout, refreshUser, isLoading, showTelegramDialog, setShowTelegramDialog }}>
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
