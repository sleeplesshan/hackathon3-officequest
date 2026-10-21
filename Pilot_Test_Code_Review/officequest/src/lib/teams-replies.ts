import type { DB, TeamsThread } from './types';
export const MARKET_BUYER_GUIDANCE='구매하시면 최종 구매자로 등록해 드릴게요. 물품을 받으신 뒤 [샀어요]를 눌러 주세요~';
export const SITE_LABELS = {mapo:'마포 본사',hoehyeon:'회현',banpo:'반포',suseo:'수서',changwon:'창원공장',ulsan:'울산공장'};
export function getTeamsReply(context:TeamsThread['context'],text:string,index=0,price=0,site='마포 본사'):string {
 if(context==='handover') {
  if(/파일|자료|링크|첨부/.test(text))return 'SharePoint 링크로 올려두었어요. 권한 문제 있으면 바로 말씀 주세요.';
  if(/마감|언제|일정|시간/.test(text))return '마감 전까지 v1 먼저 드리고, 피드백 반영해서 마무리할게요.';
  if(/수정|반려|보완|피드백/.test(text))return '확인했습니다! 말씀하신 부분 보완해서 다시 제출할게요.';
  return ['네, 확인했습니다. 진행 상황 바로 공유드릴게요.','인수인계 감사합니다. 궁금한 점 생기면 여쭤볼게요.'][index%2]!;
 }
 if(/네고|깎|할인|에누리/.test(text))return price===0?'나눔이라 그냥 가져가시면 돼요!':`조금은 가능해요! ${Math.floor(price*.9/10)*10} P 어떠세요?`;
 if(/어디|장소|직거래|로비|만나/.test(text))return `${site} 1층 로비에서 점심시간 12:30 어떠세요?`;
 if(/언제|시간|오늘|내일/.test(text))return '오늘 퇴근 전이나 내일 점심 모두 괜찮아요.';
 return ['관심 가져주셔서 감사해요! 상태 아주 좋아요.',MARKET_BUYER_GUIDANCE][index%2]!;
}
export function replyForThread(db:DB,t:TeamsThread):string {const msg=t.messages.find(m=>m.id===t.pendingReplyFor);const item=db.items.find(i=>i.id===t.refId);const seller=item&&db.users[item.sellerId];return getTeamsReply(t.context,msg?.text??'',t.messages.filter(m=>m.from==='them').length,item?.price??0,seller?SITE_LABELS[seller.site]:undefined);}
export const threadKey = (context:TeamsThread['context'],refId:string,a:string,b:string):string => `${context}:${refId}:${[a,b].sort().join(':')}`;
