import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  logout: () => set({ user: null, error: null }),

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/user/me/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Не удалось загрузить профиль");

      const data = await response.json();

      set({ user: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },
}));
