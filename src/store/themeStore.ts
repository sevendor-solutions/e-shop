import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Enforce light mode on document root immediately and clean up old cache
if (typeof window !== 'undefined') {
  window.document.documentElement.classList.remove('dark');
  localStorage.removeItem('eshop-theme-storage');
}

export const useThemeStore = create<ThemeState>()(() => ({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {
    if (typeof window !== 'undefined') {
      window.document.documentElement.classList.remove('dark');
    }
  },
}));
