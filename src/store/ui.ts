import { create } from 'zustand'

interface UIState {
  // Navigation
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Voice
  micActive: boolean
  setMicActive: (active: boolean) => void
  muted: boolean
  toggleMute: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  micActive: false,
  setMicActive: (active) => set({ micActive: active }),
  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}))
