import { BASE_MOVES, PHASE2_BONUS, PHASE3_BONUS } from '../game/constants';
import type { MoveTable } from '../game/types';

export type SkillTabId = 'base' | 'p2' | 'p3';

interface SkillTabsProps {
  activeTab: SkillTabId;
  moves: MoveTable;
  onTabChange: (tab: SkillTabId) => void;
}

export function getMoveNamesForTab(tab: SkillTabId) {
  if (tab === 'p2') return Object.keys(PHASE2_BONUS);
  if (tab === 'p3') return Object.keys(PHASE3_BONUS);
  return Object.keys(BASE_MOVES);
}

export function SkillTabs({ activeTab, moves, onTabChange }: SkillTabsProps) {
  const tabs: Array<{ id: SkillTabId; label: string; className: string }> = [
    { id: 'base', label: '基础', className: 'data-[active=true]:border-[#D6B76A] data-[active=true]:bg-[#D6B76A]/15 data-[active=true]:text-[#FFE6A6]' },
  ];
  if (Object.keys(PHASE2_BONUS).some((move) => moves[move])) {
    tabs.push({ id: 'p2', label: 'P2 觉醒', className: 'data-[active=true]:border-yellow-300 data-[active=true]:bg-yellow-300/15 data-[active=true]:text-yellow-100' });
  }
  if (Object.keys(PHASE3_BONUS).some((move) => moves[move])) {
    tabs.push({ id: 'p3', label: 'P3 终式', className: 'data-[active=true]:border-[#E056A0] data-[active=true]:bg-[#E056A0]/15 data-[active=true]:text-pink-100' });
  }

  return (
    <div className="mx-auto grid max-w-[340px] grid-cols-3 gap-1 rounded-xl border border-[#D6B76A]/20 bg-black/25 p-1 shadow-[inset_0_0_18px_rgba(0,0,0,0.28)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`h-8 rounded-lg border border-white/10 bg-[#0E1022]/70 px-2 text-[11px] font-black text-slate-400 transition active:scale-95 ${tab.className}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
