import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  searchQuery: string;
  toggleDarkMode: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      isMobileMenuOpen: false,
      searchQuery: '',
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    { name: 'freshmart-ui', partialize: (state) => ({ isDarkMode: state.isDarkMode }) }
  )
);
