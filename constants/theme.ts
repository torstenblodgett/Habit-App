import { Verdict } from '../types';

export const THEME = {
  bg: '#FFFFFF',
  surface: '#F7F7F7',
  card: '#F2F2F2',
  border: '#E5E5EA', // iOS system separator
  text: {
    primary: '#0A0A0A',
    secondary: '#5C5C5E', // iOS system secondary label
    tertiary: '#8E8E93', // iOS system tertiary label
  },
  accent: '#0057FF',
  positive: '#2DB55D',
  negative: '#FF3B30',
  verdictColor: {
    Collapse: '#FF3B30',
    Weak: '#FF6B00',
    Decent: '#E6AA00',
    Strong: '#2DB55D',
    Excellent: '#0057FF',
    Elite: '#7B2FF7',
  } satisfies Record<Verdict, string>,
} as const;
