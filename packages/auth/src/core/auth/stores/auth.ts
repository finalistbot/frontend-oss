import { create } from "zustand";
import type { User } from "../../../types/auth-types";

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (user: User) => void;
  markRequiresUsername: () => void;
  logout: () => void;
  startBootstrap: () => void;
  finishBootstrap: () => void;
  setUser: (user: User | null) => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      isBootstrapping: false,
    }),
  markRequiresUsername: () =>
    set((state) => ({
      user: state.user ? { ...state.user, requires_username: true } : state.user,
      isAuthenticated: state.isAuthenticated,
      isBootstrapping: false,
    })),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isBootstrapping: false,
    }),
  startBootstrap: () => set({ isBootstrapping: true }),
  finishBootstrap: () => set({ isBootstrapping: false }),
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping: false,
    }),
}));
