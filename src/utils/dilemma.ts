import { useDilemmaStore } from '@/stores/dilemmaStore';

export function getRandomDilemmas(count: number) {
  const dilemmas = useDilemmaStore.getState().dilemmas;
  const shuffled = [...dilemmas].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
} 