import type { CityGuide } from '../types';
import { london } from './london';

// Static registry. The generation workflow will drop one file per city here.
export const guides: Record<string, CityGuide> = {
  london,
};

export const upcoming = ['Paris', 'Rome', 'Barcelona', 'Dubai', 'New York', 'Amsterdam', 'Singapore'];

export const findGuide = (q: string) => {
  const key = q.trim().toLowerCase().replace(/\s+/g, '-');
  return guides[key];
};
