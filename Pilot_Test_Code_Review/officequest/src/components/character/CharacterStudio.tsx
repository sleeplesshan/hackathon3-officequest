'use client';
import { useState } from 'react';
import { Check, LockKeyhole, Shirt, Sparkles } from 'lucide-react';
import { Button, Modal, TierBadge } from '@/components/ui';
import { useDb } from '@/lib/db/DbProvider';
import { expToNextTier, level, tierForExp } from '@/lib/formulas';
import { equippedAppearance, HAIR_LABELS, OUTFITS, type CharacterAppearance, type CharacterGender } from '@/lib/character';
import CharacterSprite from './CharacterSprite';

function GenderSwitch({value,onChange}:{value:CharacterGender;onChange:(gender:CharacterGender)=>void}) {
  return <div className="character-gender" role="group" aria-label="캐릭터 성별">{(['male','female'] as const).map(g=><button type="button" key={g} aria-pressed={value===g} onClick={()=>onChange(g)}>{g==='male'?'남성 캐릭터':'여성 캐릭터'}</button>)}</div>;
}
export function TierGuide({onClose}:{onClose:()=>void}) {
  const {user}=useDb();const [gender,setGender]=useState<CharacterGender>(user?equippedAppearance(user).gender:'male');
  if(!user)return null;const tier=tierForExp(user.exp);
  return <Modal title="레벨과 티어 가이드" testId="tier-guide-modal" size="lg" className="character-modal" onClose={onClose}>
    <div className="character-intro"><span className="character-eyebrow">GROW WITH EVERY QUEST</span><h3>쌓이는 경험치, 달라지는 나의 캐릭터.</h3><p>100 EXP마다 레벨이 1 올라요. 티어가 오르면 새로운 의상과 장비가 열립니다.<br/>포인트는 거래에, EXP는 성장에 사용돼요. 의상 선택은 보상과 능력에 영향을 주지 않아요.</p><div className="character-current"><TierBadge tier={tier}/><b>현재 Lv.{level(user.exp)}</b><span>{tier==='master'?'최고 티어에 도달했어요':`다음 티어까지 ${expToNextTier(user.exp)} EXP`}</span></div></div>
    <div className="character-section-heading"><h3>6단계 캐릭터 변화</h3><GenderSwitch value={gender} onChange={setGender}/></div>
    <div className="tier-guide-grid">{OUTFITS.map((outfit,i)=><article key={outfit.id} className={`tier-guide-tile ${tier===outfit.id?'current':''}`} data-testid={`tier-guide-${outfit.id}`}><header><TierBadge tier={outfit.id}/>{tier===outfit.id&&<span className="character-current-label">현재 티어</span>}</header><div className="tier-guide-art" style={{'--hero-aura':`var(--tier-${outfit.id})`} as React.CSSProperties}><CharacterSprite appearance={{gender,hair:'classic'}} outfit={outfit.id} size={168}/></div><b>Lv.{outfit.level}{i<5?`–${OUTFITS[i+1]!.level-1}`:'+'}</b><span>{(outfit.level-1)*100}{i<5?`–${(OUTFITS[i+1]!.level-1)*100-1}`:'+'} EXP</span><h4>{outfit.name}</h4><p>{outfit.detail}</p></article>)}</div>
    <p className="character-footnote">시즌 초기화 시 레벨은 1로 돌아가요. 선택한 헤어는 유지되고, 레벨이 부족한 의상은 현재 티어 의상으로 표시돼요.</p>
  </Modal>;
}
export function CharacterWardrobe({onClose}:{onClose:()=>void}) {
  const {user,dispatch,toast}=useDb();const [draft,setDraft]=useState<CharacterAppearance>(()=>user?{...equippedAppearance(user)}:{gender:'male',hair:'classic',outfit:'auto'});
  if(!user)return null;const preview=equippedAppearance({...user,appearance:draft});const lv=level(user.exp);const equipped=OUTFITS.find(o=>o.id===preview.equippedOutfit)!;
  return <Modal title="내 캐릭터 꾸미기" testId="character-wardrobe" size="lg" className="character-modal" onClose={onClose} footer={<><span className="wardrobe-save-note">외형만 바뀌어요 · 포인트 소모 없음</span><Button onClick={onClose}>취소</Button><Button variant="primary" data-testid="character-save" onClick={()=>{if(dispatch({type:'character/equip',appearance:{gender:draft.gender,hair:draft.hair,outfit:draft.outfit}})){toast('캐릭터 스타일을 저장했어요');onClose();}}}><Check size={16}/>스타일 저장</Button></>}>
    <div className="wardrobe-grid"><aside className="wardrobe-preview"><span className="character-eyebrow">MY OFFICE CHARACTER</span><div className="wardrobe-stage" style={{'--hero-aura':`var(--tier-${tierForExp(user.exp)})`} as React.CSSProperties}><CharacterSprite appearance={preview} outfit={preview.equippedOutfit} size={288}/></div><TierBadge tier={tierForExp(user.exp)}/><h3>{user.name}</h3><p>Lv.{lv} · {equipped.name}</p><small>{draft.outfit!=='auto'&&draft.outfit!==preview.equippedOutfit?'선택했던 의상은 레벨을 다시 달성하면 표시돼요.':'헤어 + 의상, 두 파트로 완성해요.'}</small></aside>
    <div className="wardrobe-options"><section><div className="character-section-heading"><h3>캐릭터</h3></div><GenderSwitch value={draft.gender} onChange={gender=>setDraft({...draft,gender})}/></section>
    <section><div className="character-section-heading"><h3><Sparkles size={17}/>헤어스타일</h3><span>모두 선택 가능</span></div><div className="hair-options">{(['classic','wave'] as const).map(hair=><button key={hair} type="button" data-testid={`character-hair-${hair}`} aria-pressed={draft.hair===hair} onClick={()=>setDraft({...draft,hair})}><CharacterSprite appearance={{gender:draft.gender,hair}} outfit="bronze" size={96}/><span>{HAIR_LABELS[draft.gender][hair]}</span>{draft.hair===hair&&<Check size={16}/>}</button>)}</div></section>
    <section><div className="character-section-heading"><h3><Shirt size={17}/>의상</h3><span>{OUTFITS.filter(o=>lv>=o.level).length} / 6 해금</span></div><button type="button" className="outfit-auto" data-testid="character-outfit-auto" aria-pressed={draft.outfit==='auto'} onClick={()=>setDraft({...draft,outfit:'auto'})}><Sparkles size={16}/><span><b>현재 티어에 맞춰 자동 장착</b><small>레벨이 오르면 새 의상으로 바뀌어요</small></span>{draft.outfit==='auto'&&<Check size={17}/>}</button><div className="outfit-options">{OUTFITS.map(outfit=>{const locked=lv<outfit.level;return <button key={outfit.id} type="button" data-testid={`character-outfit-${outfit.id}`} disabled={locked} aria-pressed={draft.outfit===outfit.id} onClick={()=>setDraft({...draft,outfit:outfit.id})}><div className="outfit-thumbnail"><CharacterSprite appearance={draft} outfit={outfit.id} size={96}/>{locked&&<span className="outfit-lock"><LockKeyhole size={14}/>Lv.{outfit.level}</span>}</div><b>{outfit.name}</b><small>{locked?`Lv.${outfit.level}에 해금`:`Lv.${outfit.level} · 선택 가능`}</small>{draft.outfit===outfit.id&&<Check className="outfit-check" size={17}/>}</button>;})}</div></section></div></div>
  </Modal>;
}
