export { formatKstDate, formatTimer, kstDayKey, toISO } from './formulas';
export { formatRating } from './rating';
export const formatNumber = (n:number): string => n.toLocaleString('ko-KR');
export const formatPoints = (n:number): string => `${formatNumber(n)} P`;
export function formatBytes(n:number): string {return n>=1048576?`${(n/1048576).toFixed(1)} MB`:`${(n/1024).toFixed(1)} KB`;}
export const plainText = (html:string):string => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,'').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
