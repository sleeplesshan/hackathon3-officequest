import type { ItemFilters } from '@/lib/db/selectors';
import type { ItemCategory, VillageKey } from '@/lib/types';
export const VILLAGES:VillageKey[]=['mapo','hoehyeon','banpo','suseo','changwon','ulsan'];
export const CATEGORIES:ItemCategory[]=['digital','living','fashion','books','hobby'];
const FILTER_KEYS=['v','cat','q','sort','onlyAvailable','onlyFree'];
export function readMarketFilters(params:Pick<URLSearchParams,'get'>):ItemFilters {const v=params.get('v'),cat=params.get('cat'),sort=params.get('sort');return {v:VILLAGES.includes(v as VillageKey)?v as VillageKey:'all',cat:CATEGORIES.includes(cat as ItemCategory)?cat as ItemCategory:'all',q:params.get('q')??'',sort:sort==='popular'||sort==='price'?sort:'newest',onlyAvailable:['1','true'].includes(params.get('onlyAvailable')??''),onlyFree:['1','true'].includes(params.get('onlyFree')??'')};}
export function villageHref(params:URLSearchParams,patch:Record<string,string|undefined>={}):string {const next=new URLSearchParams();for(const key of FILTER_KEYS){const value=params.get(key);if(value)next.set(key,value);}for(const [key,value] of Object.entries(patch)){if(!value||value==='all'||(key==='sort'&&value==='newest'))next.delete(key);else next.set(key,value);}return `/village${next.size?`?${next.toString()}`:''}`;}
export function updateVillageFilters(patch:Record<string,string|undefined>,replace=false):void {const href=villageHref(new URLSearchParams(window.location.search),patch);if(replace)window.history.replaceState(null,'',href);else window.history.pushState(null,'',href);}
