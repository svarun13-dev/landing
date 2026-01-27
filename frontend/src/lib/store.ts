import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  favorites: Set<string>;
  toggleFavorite: (symbol: string) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      favorites: new Set<string>(),
      toggleFavorite: (symbol) =>
        set((state) => {
          const next = new Set(state.favorites);
          if (next.has(symbol)) next.delete(symbol);
          else next.add(symbol);
          return { favorites: next };
        }),
    }),
    {
      name: "market-preferences",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed?.state?.favorites) {
            parsed.state.favorites = new Set(parsed.state.favorites);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              favorites: Array.from(value.state.favorites),
            },
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
