import { create } from 'zustand';
import { clampStats } from '@/utils/stats';
import { GAME_RULES } from '@/constants/gameRules';

interface DilemmaHistory {
  dilemmaId: string;
  day: number;
  choice: 'left' | 'right';
  stats: {
    health: number;
    budget: number;
    environment: number;
  };
  extraEffect: string;
  effectStats: {
    bonus_type: 'happiness' | 'budget' | 'environment';
    bonus: number;
  };
}

interface GameState {
  health: number;
  budget: number;
  environment: number;
  day: number;
  isDayComplete: boolean;
  dilemmaHistory: DilemmaHistory[];
  isGameOver: boolean;
  isTimerPaused: boolean;
  timeLeft: number;
  timer: ReturnType<typeof setInterval> | null;
  setStats: (stats: Partial<Pick<GameState, 'health' | 'budget' | 'environment'>>) => void;
  incrementDay: () => void;
  setDayComplete: (complete: boolean) => void;
  addToHistory: (entry: DilemmaHistory) => void;
  setGameOver: (value: boolean) => void;
  resetGame: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  startTimer: (duration?: number) => void;
  chapter: number;
  setChapter: (chapter: number) => void;
  cleanupTimer: () => void;
  applyPenalty: (type: keyof typeof GAME_RULES.penalties) => void;
  completedChapters: number[];
  completeChapter: (chapter: number) => void;
  isChapterCompleted: (chapter: number) => boolean;
  getDayDuration: () => number;
}

const DEFAULT_STATS = {
  health: 50,
  budget: 50,
  environment: 50,
  day: 1,
  isDayComplete: false,
  dilemmaHistory: [],
  isGameOver: false,
  isTimerPaused: false,
  timeLeft: 30,
  timer: null as ReturnType<typeof setInterval> | null,
  chapter: 1,
  completedChapters: [],
};

export const useGameStore = create<GameState>((set, get) => ({
  ...DEFAULT_STATS,
  setStats: (stats) => set((state) => {
    if (state.isGameOver) return state;

    const clampedStats = {
      health: clampStats(stats.health !== undefined ? stats.health : state.health),
      budget: clampStats(stats.budget !== undefined ? stats.budget : state.budget),
      environment: clampStats(stats.environment !== undefined ? stats.environment : state.environment),
    };

    const shouldGameOver = 
      clampedStats.health <= 0 || 
      clampedStats.budget <= 0 || 
      clampedStats.environment <= 0;

    return {
      health: clampedStats.health,
      budget: clampedStats.budget,
      environment: clampedStats.environment,
      isGameOver: shouldGameOver,
      // Clear day complete if game over
      ...(shouldGameOver && { isDayComplete: false })
    };
  }),
  incrementDay: () => set((state) => ({ 
    day: state.day + 1, 
    isDayComplete: false 
  })),
  setDayComplete: (complete) => set({ isDayComplete: complete }),
  addToHistory: (entry) => set((state) => ({
    dilemmaHistory: [...state.dilemmaHistory, entry]
  })),
  setGameOver: (value) => set({ isGameOver: value }),
  resetGame: () => set(DEFAULT_STATS),
  pauseTimer: () => set({ isTimerPaused: true }),
  resumeTimer: () => set({ isTimerPaused: false }),
  startTimer: (duration = GAME_RULES.time.dayDuration) => {
    const timer = setInterval(() => {
      const state = get();
      if (!state.isTimerPaused && state.timeLeft <= 1) {
        clearInterval(timer);
        set({ timeLeft: 0, timer: null });
        get().applyPenalty('timeExpired');
      } else if (!state.isTimerPaused) {
        set(state => ({ timeLeft: state.timeLeft - 1 }));
      }
    }, 1000);
    set({ timer, timeLeft: Math.floor(duration / 1000) });
  },
  setChapter: (chapter: number) => set({ chapter }),
  cleanupTimer: () => {
    const currentTimer = get().timer;
    if (currentTimer) {
      clearInterval(currentTimer);
      set({ timer: null });
    }
  },
  applyPenalty: (type) => {
    const penalty = GAME_RULES.penalties[type];
    get().setStats(penalty);
  },
  completeChapter: (chapter) => set(state => ({
    completedChapters: [...new Set([...state.completedChapters, chapter])]
  })),
  isChapterCompleted: (chapter) => get().completedChapters.includes(chapter),
  getDayDuration: () => {
    const { day, chapter } = get();
    const { timePerDay } = GAME_RULES.chapters;

    if (day <= timePerDay.early.days) {
      return timePerDay.early.duration;
    } else if (day <= timePerDay.mid.days) {
      return timePerDay.mid.duration;
    }
    return timePerDay.late.duration;
  },
})); 