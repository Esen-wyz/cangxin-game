import type { GameHistory } from '../game/types';

interface ReplayPanelProps {
  history: GameHistory;
}

export function ReplayPanel({ history }: ReplayPanelProps) {
  const playerWins = history.phases.filter((phase) => phase.winner === 'player').length;
  const finalWinner = playerWins > history.phases.length / 2 ? '你' : '电脑';

  return (
    <div className="space-y-2 text-left">
      {history.phases.map((phase) => (
        <section key={phase.number} className="rounded-xl border border-[#D6B76A]/20 bg-black/20 p-2 shadow-[inset_0_0_16px_rgba(0,0,0,0.18)]">
          <h3 className="mb-1 text-xs font-black text-[#FFE6A6]">
            {phase.number === 1 ? '⚔ 第一' : phase.number === 2 ? '🌟 第二' : '💥 第三'}阶段 (
            {phase.winner === 'player' ? '你胜' : '电脑胜'} {phase.playerScore}:{phase.computerScore})
          </h3>
          <div className="space-y-0.5 text-[11px] text-stone-400">
            {phase.rounds.map((round) => (
              <div key={`${phase.number}-${round.number}`}>
                <span className={round.winner === 'player' ? 'text-emerald-300' : 'text-red-300'}>
                  {round.winner === 'player' ? '胜' : '负'}
                </span>{' '}
                R{round.number}: {round.playerMove} vs {round.computerMove}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="rounded-xl border border-[#D6B76A]/25 bg-[#D6B76A]/10 py-2 text-center text-sm font-black text-[#FFE6A6]">
        {finalWinner}获胜 ({playerWins}:{history.phases.length - playerWins})
      </div>
    </div>
  );
}
