import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Navigation
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;

  // Voice
  micActive: boolean;
  setMicActive: (active: boolean) => void;
  muted: boolean;
  toggleMute: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      sidebarCollapsed: false,
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      micActive: false,
      setMicActive: (active) => set({ micActive: active }),
      muted: false,
      toggleMute: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: 'zenko-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
