import { getSeed } from './seed';
import { ensureThread } from './reducer';
import { makeSharepointAttachment } from '../sharepoint';
import { threadKey } from '../teams-replies';
import type { DB, Submission } from '../types';
export type ScenarioName='seed'|'ref07'|'timerExpired'|'limitApprove'|'rejectLimit';
export function loadScenario(name:string,now:number):DB {
 let db=getSeed(now);if(name==='seed')return db;if(name==='timerExpired'){db.timer.endsAt=now;return db;}
 if(!['ref07','limitApprove','rejectLimit'].includes(name))throw new Error(`알 수 없는 시나리오: ${name}`);
 const q=db.quests.find(q=>q.no===7)!;const worker=name==='limitApprove'?'park':'lee';q.workerId=worker;if(!q.applications.some(a=>a.userId===worker))q.applications.push({userId:worker,resolve:'바로 처리하겠습니다',appliedAt:'2026-10-21T10:30:00+09:00',pledgeAgreedAt:'2026-10-21T10:30:00+09:00'});
 q.adoptedAt='2026-10-21T10:40:00+09:00';q.status='in_progress';q.reviewPending=true;q.rejectCount=name==='rejectLimit'?2:0;
 const result='<p>요청하신 SAP 원본 데이터 정리와 피벗 자동 생성을 완료했습니다. 상단 갱신 버튼으로 실행할 수 있습니다.</p>';
 const sub=(version:number,time:string):Submission=>({version,bodyHtml:result,attachments:[makeSharepointAttachment(`Q3_원가분석_자동화_v${version}.xlsm`,Math.round(2.4*1048576),`q7-result-${version}`)],submittedAt:`2026-10-21T${time}:00+09:00`});
 q.submissions=name==='rejectLimit'?[{...sub(1,'11:00'),review:{result:'rejected',reason:'표 서식 보완 부탁드려요',reviewedAt:'2026-10-21T11:30:00+09:00'}},{...sub(2,'12:00'),review:{result:'rejected',reason:'피벗 자동 생성이 빠졌어요',reviewedAt:'2026-10-21T12:40:00+09:00'}},sub(3,'13:30')]:[sub(1,name==='limitApprove'?'13:30':'13:40')];
 db.daily[worker]!.achieved.adopted=true;
 if(name==='ref07'){db=ensureThread(db,'handover','7','kim','lee',now);const t=db.teams[threadKey('handover','7','kim','lee')]!;t.messages=[{id:'ref-system',from:'system',text:'업무 인수인계 · 3분기 원가 분석 엑셀 매크로 요청',at:'2026-10-21T13:40:00+09:00'},{id:'ref-me',from:'me',senderId:'kim',text:'안녕하세요! 원본 파일 확인하셨을까요?',at:'2026-10-21T13:58:00+09:00'},{id:'ref-them',from:'them',senderId:'lee',text:'네, 확인했습니다. 피벗 자동 생성까지 완료했어요.',at:'2026-10-21T13:59:00+09:00'},{id:'ref-me2',from:'me',senderId:'kim',text:'감사합니다! 결과물 링크 공유 부탁드려요.',at:'2026-10-21T14:01:00+09:00'}];}
 return db;
}
