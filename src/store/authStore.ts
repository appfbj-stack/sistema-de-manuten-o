import { create } from "zustand";

type User = {
  name: string;
  email: string;
  role: "owner" | "technician";
};

type AuthState = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) =>
    set({
      user
    }),
  logout: () => set({ user: null })
}));
