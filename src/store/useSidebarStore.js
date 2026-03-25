import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
  closeMobile: () => set({ isMobileOpen: false }),
}));

export default useSidebarStore;
