import { create } from 'zustand';
import { DilemmaHistory } from '@/types/dilemma';

interface ActiveEffect {
  bonus_type: 'happiness' | 'budget' | 'environment';
  bonus: number;
  description: string;
}

interface EffectState {
  activeEffect: ActiveEffect | null;
  setActiveEffect: (effect: ActiveEffect | null) => void;
  generateEffectFromHistory: (history: DilemmaHistory[]) => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  activeEffect: null,
  setActiveEffect: (effect) => set({ activeEffect: effect }),
  generateEffectFromHistory: (history) => {
    // 30% chance to generate effect
    if (Math.random() > 0.3 || history.length === 0) {
      set({ activeEffect: null });
      return;
    }

    // Pick random history entry
    const randomEntry = history[Math.floor(Math.random() * history.length)];
    const effect = randomEntry.effectStats;

    set({
      activeEffect: {
        bonus_type: effect.bonus_type,
        bonus: effect.bonus,
        description: randomEntry.extraEffect
      }
    });
  }
})); 