import { create } from 'zustand';

interface MiniGameState {
  hasPlayedPowerGrid: boolean;
  setPlayedPowerGrid: (played: boolean) => void;
  resetMiniGames: () => void;
}

export const useMiniGameStore = create<MiniGameState>((set) => ({
  hasPlayedPowerGrid: false,
  setPlayedPowerGrid: (played) => set({ hasPlayedPowerGrid: played }),
  resetMiniGames: () => set({ hasPlayedPowerGrid: false }),
})); 