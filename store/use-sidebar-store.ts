import { create } from "zustand";

/**
 * État global de la sidebar (ouverte/fermée sur mobile).
 *
 * Exemple d'utilisation de Zustand pour le scaffold : le header peut basculer
 * la sidebar et la sidebar peut se fermer elle-même, sans prop drilling.
 */
interface SidebarState {
  /** La sidebar est-elle ouverte (drawer mobile) ? */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
