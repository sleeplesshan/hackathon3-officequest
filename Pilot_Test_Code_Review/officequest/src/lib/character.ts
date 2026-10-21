import { level, tierForExp, TIER_ORDER } from './formulas';
import type { TierKey, User } from './types';
export type CharacterGender = 'male' | 'female';
export type HairStyle = 'classic' | 'wave';
export interface CharacterAppearance { gender: CharacterGender; hair: HairStyle; outfit: TierKey | 'auto' }
export const OUTFITS: { id: TierKey; level: number; name: string; detail: string }[] = [
  {id:'bronze',level:1,name:'오피스 루키',detail:'기본 사원복 · 브론즈 핀'},
  {id:'silver',level:5,name:'실버 서포터',detail:'은빛 망토 · 실버 제복'},
  {id:'gold',level:10,name:'골드 가디언',detail:'황금 갑옷 · 레드 망토'},
  {id:'platinum',level:15,name:'플래티넘 테크',detail:'백금 갑옷 · 사이버 고글'},
  {id:'diamond',level:20,name:'크리스탈 윙',detail:'다이아 제복 · 크리스탈 날개'},
  {id:'master',level:25,name:'레전드 마스터',detail:'보라 갑옷 · 전설의 검'},
];
export const HAIR_LABELS = {male:{classic:'단정한 숏컷',wave:'볼륨 펌'},female:{classic:'클래식 보브',wave:'롱 웨이브'}};
export function defaultAppearance(): CharacterAppearance { return {gender:'male',hair:'classic',outfit:'auto'}; }
export function validAppearance(value: CharacterAppearance): boolean {
  return Boolean(value && ['male','female'].includes(value.gender) && ['classic','wave'].includes(value.hair) && (value.outfit==='auto'||TIER_ORDER.includes(value.outfit)));
}
export function equippedAppearance(user: Pick<User,'exp'|'appearance'>): CharacterAppearance & { equippedOutfit: TierKey } {
  const appearance = user.appearance && validAppearance(user.appearance) ? user.appearance : defaultAppearance();
  const chosen = OUTFITS.find(o=>o.id===appearance.outfit);
  return {...appearance,equippedOutfit:chosen && level(user.exp)>=chosen.level ? chosen.id : tierForExp(user.exp)};
}
export function characterAsset(appearance: Pick<CharacterAppearance,'gender'|'hair'>, outfit: TierKey): string {
  return `/assets/character/${appearance.gender}-${appearance.hair}-${outfit}.png`;
}
