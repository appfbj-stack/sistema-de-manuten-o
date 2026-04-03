import { create } from "zustand";

type User = {
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (email) =>
    set({
      user: {
        name: "Fernando Borges",
        email
      }
    }),
  logout: () => set({ user: null })
}));
