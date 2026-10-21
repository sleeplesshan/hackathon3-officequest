import { describe, expect, it } from 'vitest';
import { getTeamsReply, threadKey, MARKET_BUYER_GUIDANCE } from '@/lib/teams-replies';

describe('Teams deterministic keyword replies', () => {
  it('file keywords take precedence over deadlines and revision', () => {
    expect(getTeamsReply('handover', '파일 마감 수정')).toContain('SharePoint 링크');
    expect(getTeamsReply('handover', '언제 피드백')).toContain('마감 전까지');
    expect(getTeamsReply('handover', '보완해주세요')).toContain('보완해서');
  });
  it('cycles fallback messages by thread reply count', () => {
    expect(getTeamsReply('handover', '안녕하세요', 0)).toBe(getTeamsReply('handover', '안녕하세요', 2));
    expect(getTeamsReply('handover', '안녕하세요', 0)).not.toBe(getTeamsReply('handover', '안녕하세요', 1));
    expect(getTeamsReply('market', '안녕하세요', 0)).toContain('상태 아주 좋아요');
    expect(getTeamsReply('market', '안녕하세요', 1)).toBe(MARKET_BUYER_GUIDANCE);
    expect(MARKET_BUYER_GUIDANCE).toContain('최종 구매자로 등록');expect(MARKET_BUYER_GUIDANCE).toContain('[샀어요]');expect(MARKET_BUYER_GUIDANCE).not.toContain('승인');
  });
  it('discount rounds down to tens, and free items stay free', () => {
    expect(getTeamsReply('market', '네고 가능한가요', 0, 550)).toContain('490 P');
    expect(getTeamsReply('market', '할인', 0, 0)).toContain('그냥 가져가시면');
    expect(getTeamsReply('market', '직거래 오늘', 0, 500, '창원공장')).toContain('창원공장 1층 로비');
    expect(getTeamsReply('market', '오늘 언제')).toContain('오늘 퇴근 전');
  });
  it('thread keys sort participants, keep contexts and refs separate', () => {
    expect(threadKey('market', 'm1', 'lee', 'kim')).toBe('market:m1:kim:lee');
    expect(threadKey('handover', 'm1', 'kim', 'lee')).not.toBe(threadKey('market', 'm1', 'kim', 'lee'));
  });
});
