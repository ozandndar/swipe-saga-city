import { LANGUAGES } from '@/constants/languages';

type LanguageCode = typeof LANGUAGES[number]['code'];

interface DilemmaStats {
  happiness: number;
  budget: number;
  environment: number;
}

interface ExtraEffectStats {
  bonus_type: 'happiness' | 'budget' | 'environment';
  bonus: number;
}

export interface DilemmaContent {
  title: string;
  description: string;
  swipe_right: string;
  swipe_left: string;
  extra_effect_right: string;
  extra_effect_left: string;
}

export type Dilemma = {
  id: string;
  swipe_right_stats: DilemmaStats;
  swipe_left_stats: DilemmaStats;
  extra_effect_right_stats: ExtraEffectStats;
  extra_effect_left_stats: ExtraEffectStats;
} & {
  [K in LanguageCode]: DilemmaContent;
}; 

export interface DilemmaHistory {
  dilemmaId: string;
  day: number;
  choice: 'left' | 'right';
  stats: DilemmaStats;
  extraEffect: string;
  effectStats: ExtraEffectStats;
}
