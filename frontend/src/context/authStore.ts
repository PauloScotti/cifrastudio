import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  can: (roles: Array<"ADMIN" | "EDITOR" | "VIEWER">) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        localStorage.setItem("cifrastudio:token", token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("cifrastudio:token");
        set({ token: null, user: null, isAuthenticated: false });
      },

      can: (roles) => {
        const user = get().user;
        return !!user && roles.includes(user.role as any);
      },
    }),
    {
      name: "cifrastudio:auth",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
