import type { GameState } from '../game/types';

interface TopHudProps {
  state: GameState;
  winsPerPhase: number;
}

const phaseMeta = {
  1: { label: '一阶段', icon: '⚔', className: 'border-[#D6B76A]/45 bg-[#D6B76A]/12 text-[#FFE6A6]' },
  2: { label: '二阶段', icon: '🌟', className: 'border-yellow-300/45 bg-yellow-300/12 text-yellow-100' },
  3: { label: '三阶段', icon: '💥', className: 'border-[#E056A0]/50 bg-[#E056A0]/14 text-pink-100' },
} as const;

export function TopHud({ state, winsPerPhase }: TopHudProps) {
  const phase = phaseMeta[state.currentPhase];
  const playerEnergyWidth = `${Math.min(100, state.playerEnergy * 20)}%`;
  const computerEnergyWidth = `${Math.min(100, state.computerEnergy * 20)}%`;

  return (
    <header className="z-10 border-b border-[#D6B76A]/20 bg-[#070A13]/95 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-black tracking-[0.22em] text-[#4BA3FF]">PLAYER</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full border border-[#4BA3FF]/35 bg-black/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#1C6FD0] to-[#4BA3FF]" style={{ width: playerEnergyWidth }} />
          </div>
          <div className="mt-0.5 text-[10px] font-bold text-slate-400">灵气 {state.playerEnergy}</div>
        </div>

        <div className="min-w-[116px] rounded-xl border border-[#D6B76A]/35 bg-gradient-to-b from-[#15182E] to-[#070A13] px-3 py-1 text-center shadow-[inset_0_0_18px_rgba(214,183,106,0.08)]">
          <div className={`mx-auto mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${phase.className}`}>
            <span>{phase.icon}</span>
            <span>{phase.label}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-black text-[#4BA3FF]">{state.playerScore}</span>
            <span className="text-[10px] font-black tracking-normal text-[#D6B76A]">VS</span>
            <span className="text-xl font-black text-[#FF5A6A]">{state.computerScore}</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400">
            第{state.currentRound}局 / 先{winsPerPhase}胜
          </div>
        </div>

        <div className="min-w-0 text-right">
          <div className="text-[10px] font-black tracking-[0.22em] text-[#FF5A6A]">ENEMY</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full border border-[#FF5A6A]/35 bg-black/40">
            <div className="ml-auto h-full rounded-full bg-gradient-to-l from-[#A41D36] to-[#FF5A6A]" style={{ width: computerEnergyWidth }} />
          </div>
          <div className="mt-0.5 text-[10px] font-bold text-slate-400">灵气 {state.computerEnergy}</div>
        </div>
      </div>
    </header>
  );
}
