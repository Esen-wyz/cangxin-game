import type { GameState } from '../game/types';

interface TopHudProps {
  state: GameState;
  winsPerPhase: number;
}

const phaseMeta = {
  1: { label: '⚔ 一阶段', className: 'border-imperial/30 bg-imperial/10 text-amber-200' },
  2: { label: '🌟 二阶段', className: 'border-yellow-300/35 bg-yellow-300/10 text-yellow-200' },
  3: { label: '💥 三阶段', className: 'border-pink-300/35 bg-pink-400/10 text-pink-200' },
} as const;

export function TopHud({ state, winsPerPhase }: TopHudProps) {
  const phase = phaseMeta[state.currentPhase];

  return (
    <header className="z-10 border-b border-white/10 bg-ink/90 px-3 py-2 backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <h1 className="gold-text text-xl font-black">苍 心</h1>
        <div className={`rounded-md border px-2 py-1 text-[11px] font-black ${phase.className}`}>{phase.label}</div>
        <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-sm font-black text-amber-100">
          {state.playerScore}:{state.computerScore}
        </div>
      </div>
      <div className="mt-1 grid grid-cols-3 items-center text-[11px] text-stone-400">
        <span>你 ⚡{state.playerEnergy}</span>
        <span className="text-center">
          第{state.currentRound}局 · 先得{winsPerPhase}分胜
        </span>
        <span className="text-right">电脑 ⚡{state.computerEnergy}</span>
      </div>
    </header>
  );
}
