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
    { id: 'base', label: '基础', className: 'data-[active=true]:border-imperial data-[active=true]:text-amber-200' },
  ];
  if (Object.keys(PHASE2_BONUS).some((move) => moves[move])) {
    tabs.push({ id: 'p2', label: '二阶段', className: 'data-[active=true]:border-yellow-300 data-[active=true]:text-yellow-200' });
  }
  if (Object.keys(PHASE3_BONUS).some((move) => moves[move])) {
    tabs.push({ id: 'p3', label: '三阶段', className: 'data-[active=true]:border-pink-300 data-[active=true]:text-pink-200' });
  }

  return (
    <div className="flex justify-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`rounded-md border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-bold text-stone-400 transition ${tab.className}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
