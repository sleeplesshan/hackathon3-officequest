import type { CharacterAppearance } from './character';
export type UserId = 'kim' | 'lee' | 'park' | 'choi' | 'jung' | 'han' | 'kang' | 'oh' | 'ops' | (string & {});
export type PersonaId = 'kim' | 'lee' | 'park' | 'ops';
export type Stars = 1 | 2 | 3 | 4 | 5;
export type VillageKey = 'mapo' | 'hoehyeon' | 'banpo' | 'suseo' | 'changwon' | 'ulsan';
export type SiteKey = VillageKey;                                  // 사업장 key = 마을 key
export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type ThemeMode = 'light' | 'dark';
export type ISODate = string;                                      // ISO 8601 with +09:00
export type DayKey = string;                                       // 'YYYY-MM-DD' (KST)

export interface User {
  id: UserId; name: string; employeeNo: string;
  village: VillageKey; site: SiteKey; dept: string;
  exp: number;               // 이번 시즌 누적 EXP (레벨·티어·랭킹의 유일한 원천)
  points: number;            // 보유 P (정수, 절대 음수 금지)
  completedToday: number;    // 오늘 작업자로 승인받은 건수 (0..2)
  completedTotal: number;    // 누적 완료 퀘스트 수 (시즌 초기화 영향 없음)
  isPersona: boolean;
  role: 'player' | 'admin';  // 'admin' = ops (D47)
  rating: { sum: number; count: number };   // 누적 별점 (D41, 시즌 초기화 영향 없음)
  seasonBadges: string[];    // 예: ['2026 Season 1']
  appearance?: CharacterAppearance;
  headSprite: string;        // 아바타 스프라이트 키
}

export type QuestType = 'inquiry' | 'request';                     // 문의 | 요청
export type QuestStatus = 'recruiting' | 'in_progress' | 'revision' | 'done';
export interface Attachment {
  id: string; kind: 'sharepoint' | 'image';
  fileName: string; sizeBytes: number;
  url?: string;              // 레거시 저장 호환용. 시연 첨부는 URL을 만들지 않고 로드 시 제거.
  dataUrl?: string;          // kind==='image' → Base64 미리보기
}
export interface Application {
  userId: UserId; resolve: string; appliedAt: ISODate;
  pledgeAgreedAt: ISODate;   // 보안서약 동의 시각 (지원마다 새로 기록)
}
export interface Submission {
  version: number;           // 1부터
  bodyHtml: string; attachments: Attachment[]; submittedAt: ISODate;
  review?: { result: 'rejected' | 'approved'; reason?: string; reviewedAt: ISODate };
}
export interface InquiryAnswer {
  id: string; authorId: UserId; bodyHtml: string; attachments: Attachment[]; createdAt: ISODate;
}
export interface Quest {
  no: number;                // 라우트 키 (/quests/[no]), 1부터 증가
  type: QuestType; status: QuestStatus;
  title: string; field: string; dueAt: ISODate; bodyHtml: string;
  attachments: Attachment[];
  requesterId: UserId;
  bounty: number;            // 현상금 (등록 시 에스크로)
  escrowHeld: number;        // 보관 중 금액: recruiting/in_progress/revision = bounty, done/삭제 = 0
  applications: Application[];
  workerId: UserId | null;   // 채택된 작업자
  adoptedAt: ISODate | null;
  submissions: Submission[];
  reviewPending: boolean;    // 마지막 제출이 검수 대기 중인지
  rejectCount: number;       // 0..REJECT_LIMIT(2), D45
  rating: { stars: Stars; ratedAt: ISODate } | null;   // 승인 시 별점 (done만 non-null)
  views: number;
  createdAt: ISODate; completedAt: ISODate | null;
  pledgeAgreedAt: ISODate;   // 등록 시 보안서약 동의 시각
  deleted?: false;           // 삭제는 배열에서 제거 (soft delete 없음)
  answers?: InquiryAnswer[];
  acceptedAnswerId?: string | null;
}

export type ItemCategory = 'digital' | 'living' | 'fashion' | 'books' | 'hobby';
// 표시명: digital 디지털/가전 · living 생활/주방 · fashion 의류/잡화 · books 도서/티켓/쿠폰 · hobby 취미/기타
export type ItemStatus = 'available' | 'reserved' | 'sold';        // 거래가능 | 예약중 | 거래완료
export interface PurchaseRequest { buyerId: UserId; requestedAt: ISODate }
export interface MarketItem {
  id: string;                // 'm1'…
  title: string; village: VillageKey; category: ItemCategory;
  mode: 'sale' | 'free'; price: number;                           // free → 0
  bodyHtml: string;
  photos: { id: string; source: 'preset' | 'upload'; spriteKey?: string; dataUrl?: string }[];
  sellerId: UserId; status: ItemStatus;
  reservedFor: UserId | null;                                      // status==='reserved'일 때만 non-null
  buyerId: UserId | null; soldAt: ISODate | null;                  // status==='sold'일 때만 non-null
  pendingRequest: PurchaseRequest | null;
  finalBuyerId?: UserId | null;
  receipt?: { purchaseTxId: string; saleTxId: string; buyerId: UserId; price: number } | null;
  likeCount: number; likedBy: UserId[];                            // likedBy는 페르소나 토글용
  views: number; createdAt: ISODate;
}

export type TxType = 'bounty_escrow' | 'bounty_refund' | 'quest_reward' | 'daily_reward' | 'market_purchase' | 'market_sale' | 'market_purchase_refund' | 'market_sale_reversal';
export interface Transaction {
  id: string; type: TxType; userId: UserId; amount: number;        // 부호 포함 (차감 음수)
  balanceAfter: number; refType: 'quest' | 'item' | 'daily'; refId: string;
  counterpartyId?: UserId; memo: string; at: ISODate;
  reversedAt?: ISODate;
  reversesTxId?: string;
}

export type DailyMissionKey = 'login' | 'post' | 'complete' | 'adopted';
export interface DailyProgress {
  dayKey: DayKey;
  achieved: Record<DailyMissionKey, boolean>;
  claimed: Record<DailyMissionKey, boolean>;
}

export interface TeamsMessage { id: string; from: 'me' | 'them' | 'system'; senderId?: UserId; text: string; at: ISODate }
export interface TeamsThread {
  key: string;               // `${context}:${refId}:${a}:${b}` (a,b 정렬)
  context: 'handover' | 'market'; refId: string;
  participants: [UserId, UserId]; messages: TeamsMessage[];
  pendingReplyFor: string | null;   // 자동응답을 기다리는 'me' 메시지 id. teams/send가 설정, teams/reply가 소비(StrictMode 중복 방지)
}

export interface AppNotification {
  id: string; userId: UserId; kind: 'purchase_request' | 'purchase_approved' | 'adopted' | 'rejected' | 'approved';
  refId: string; text: string; at: ISODate; read: boolean;
}

export interface Season { id: number; label: string; startsAt: ISODate; endsAt: ISODate }

export interface DB {
  schemaVersion: 1;
  seededAt: ISODate;
  dayKey: DayKey;                         // 마지막 일일 초기화가 적용된 KST 날짜
  season: Season;
  timer: { endsAt: number };              // epoch ms. 남은 시간 = max(0, endsAt - now)
  users: Record<string, User>;
  quests: Quest[];
  items: MarketItem[];
  transactions: Transaction[];
  daily: Record<string, DailyProgress>;   // key = UserId
  teams: Record<string, TeamsThread>;
  notifications: AppNotification[];
  ratings: RatingRecord[];                // 별점 원장 (모니터링 근거, 아카이브 포함)
  restrictions: Restriction[];
  flagStates: Record<string, FlagState>;  // key = flagId (플래그 자체는 detectFlags로 계산)
  adminLog: AdminLogEntry[];              // append-only
  counters: { nextQuestNo: number; nextItemNo: number; nextTxNo: number; nextId: number; nextRestrictionNo: number; nextLogNo: number };
}

export interface RatingRecord {
  id: string; questRef: string;           // '7' 같은 퀘스트 번호 또는 아카이브 'A-101'
  archived: boolean;                      // true = 게시판에 없는 과거 기록(D52)
  requesterId: UserId; workerId: UserId; stars: Stars; bounty: number;
  postedAt: ISODate; approvedAt: ISODate;
}
export type RestrictionKind = 'quest_post' | 'purchase';
export type RestrictionDuration = '1d' | '3d' | '7d' | 'indefinite';
export interface Restriction {
  id: string;                             // 'r1'…
  userId: UserId; kind: RestrictionKind; reason: string;
  startsAt: ISODate; endsAt: ISODate | null;   // null = 무기한
  createdBy: UserId; flagId: string | null;
  liftedAt: ISODate | null; liftedBy: UserId | null; liftReason: string | null;
}
// 상태 = restrictionStatus(r, now): liftedAt 있으면 'lifted'(만료보다 우선) → endsAt ≤ now면 'expired' → 'active' (D54)
export type FlagRule = 'pair_repeat' | 'reciprocal' | 'pair_5star' | 'fast_high_bounty' | 'market_pair';
export interface Flag {                   // 계산 결과 (저장하지 않음)
  id: string;                             // `${rule}__${a}__${b}` (상호 규칙은 a,b 정렬) 또는 `fast_high_bounty__${questRef}`
  rule: FlagRule; severity: 'high' | 'medium';
  subjects: UserId[]; lastAt: ISODate;
  evidence: { kind: 'rating' | 'tx'; refId: string; text: string; at: ISODate }[];
  status: 'open' | 'actioned' | 'dismissed';   // flagStates에서 병합, 기본 open, 새 근거면 open (D60)
  alsoMatched: FlagRule[];                // R3이 R1을 흡수하면 ['pair_repeat'] (D59), 그 외 []
  newEvidence: number;                    // 처리 후 새로 생긴 근거 수 (D60), 처리 전 0
}
export interface FlagState { status: 'actioned' | 'dismissed'; by: UserId; at: ISODate; note: string; lastAt: ISODate; evidenceCount: number }   // lastAt·evidenceCount = 처리 시점 플래그 값 (D60)
export interface AdminLogEntry {
  id: string;                             // 'L1'…
  at: ISODate; actorId: UserId;
  action: 'restrict' | 'lift' | 'dismiss_flag';
  targetUserId: UserId | null; restrictionId: string | null; flagId: string | null;
  summary: string;                        // 예: "강창원 · 퀘스트 등록 제한 7일 · 사유: …"
}

export interface UIState { personaId: PersonaId; theme: ThemeMode }   // 키 'oq:v1:ui', 탭 간 방송 안 함

export interface QuestInput {
  type: QuestType; title: string; field: string; dueAt: ISODate; bodyHtml: string;
  attachments: Attachment[]; bounty: number;
}
export interface ItemInput {
  title: string; village: VillageKey; category: ItemCategory; mode: 'sale' | 'free'; price: number;
  bodyHtml: string; photos: MarketItem['photos'];
}

export type DomainErrorCode =
  | 'TIMER_EXPIRED' | 'DAILY_LIMIT' | 'INSUFFICIENT_POINTS' | 'NOT_RESERVED_BUYER' | 'FORBIDDEN'
  | 'INVALID_STATE' | 'PLEDGE_REQUIRED' | 'VALIDATION' | 'ALREADY_APPLIED' | 'PENDING_REQUEST_EXISTS'
  | 'RATING_REQUIRED' | 'REJECT_LIMIT' | 'RESTRICTED';   // 이미 활성·이미 해제·이미 처리 = INVALID_STATE (D55, D57)
export class DomainError extends Error { constructor(public code: DomainErrorCode, message: string) { super(message) } }

export type Action =
  | { type: 'character/equip'; appearance: CharacterAppearance }
  | { type: 'quest/create'; input: QuestInput; pledge: true }
  | { type: 'quest/update'; no: number; patch: Partial<Pick<Quest,'title'|'field'|'dueAt'|'bodyHtml'|'attachments'>> }
  | { type: 'quest/delete'; no: number }
  | { type: 'quest/view'; no: number }
  | { type: 'quest/apply'; no: number; resolve: string; pledge: true }
  | { type: 'quest/adopt'; no: number; userId: UserId }
  | { type: 'quest/submit'; no: number; bodyHtml: string; attachments: Attachment[] }
  | { type: 'quest/reject'; no: number; reason: string }
  | { type: 'quest/approve'; no: number; stars: Stars }                     // D40: stars 없거나 1–5 밖이면 RATING_REQUIRED
  | { type: 'quest/answer'; no: number; bodyHtml: string; attachments: Attachment[] }
  | { type: 'quest/acceptAnswer'; no: number; answerId: string; stars: Stars }
  | { type: 'daily/claim'; mission: DailyMissionKey }
  | { type: 'season/reset' }
  | { type: 'timer/expire' } | { type: 'timer/reset' } | { type: 'timer/plus30' } | { type: 'timer/toggle' }
  | { type: 'item/create'; input: ItemInput } | { type: 'item/update'; id: string; patch: Partial<ItemInput> }
  | { type: 'item/delete'; id: string } | { type: 'item/view'; id: string } | { type: 'item/like'; id: string }
  | { type: 'item/request'; id: string }                    // [샀어요]
  | { type: 'item/approveRequest'; id: string }             // 판매자 [거래 승인]
  | { type: 'item/declineRequest'; id: string }             // 판매자 [거절]
  | { type: 'item/reserve'; id: string; userId: UserId }    // 조직도 → 예약자 지정
  | { type: 'item/releaseReservation'; id: string }
  | { type: 'item/sellTo'; id: string; userId: UserId }     // 조직도 → 최종 구매자 지정
  | { type: 'item/confirmReceipt'; id: string }
  | { type: 'item/undoReceipt'; id: string }
  | { type: 'teams/send'; threadKey: string; text: string } | { type: 'teams/reply'; threadKey: string }
  | { type: 'admin/restrict'; userId: UserId; kinds: RestrictionKind[]; duration: RestrictionDuration; reason: string; flagId?: string }
  | { type: 'admin/lift'; restrictionId: string; reason: string }
  | { type: 'admin/dismissFlag'; flagId: string; reason: string }
  | { type: 'debug/resetData' };
