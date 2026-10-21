import { RATING_EXP } from './constants';
import type { Stars, User } from './types';
export const ratingExp = (stars: Stars): number => RATING_EXP[stars];
export const formatRating = (r: User['rating']): string => r.count===0 ? '평가 없음' : `${(Math.round(r.sum/r.count*10)/10).toFixed(1)} · 평가 ${r.count}건`;
