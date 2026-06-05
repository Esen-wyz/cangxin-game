import type { GameOverlay } from '../game/useGameState';
import type { GameHistory } from '../game/types';
import { ReplayPanel } from './ReplayPanel';

interface PhaseModalProps {
  overlay: GameOverlay | null;
  history: GameHistory;
  onPrimary: () => void;
  onSecondary: () => void;
}

export function PhaseModal({ overlay, history, onPrimary, onSecondary }: PhaseModalProps) {
  if (!overlay) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/[0.82] p-4 backdrop-blur-md">
      <div className="relative w-full max-w-[370px] overflow-hidden rounded-2xl border border-[#D6B76A]/45 bg-[linear-gradient(180deg,#15182E,#070A13)] p-4 text-center shadow-[0_0_42px_rgba(214,183,106,0.18)]">
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#D6B76A] to-transparent" />
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[#4BA3FF]/55 to-transparent" />
        <h2 className="gold-text text-2xl font-black drop-shadow-[0_0_18px_rgba(214,183,106,0.28)]">{overlay.title}</h2>
        <div className="mt-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-400">{overlay.phaseResult}</div>
        {overlay.mode === 'replay' ? (
          <div className="mt-3 max-h-[52vh] overflow-y-auto">
            <ReplayPanel history={history} />
          </div>
        ) : (
          <div className="mt-3 whitespace-pre-line rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-[#F4E8C8]">{overlay.text}</div>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={onPrimary} className="rounded-xl border border-[#F4D98A]/70 bg-gradient-to-b from-[#F4D98A] via-[#D6B76A] to-[#8F692D] px-4 py-2 text-sm font-black text-[#17120A] shadow-[0_0_18px_rgba(214,183,106,0.28)] active:scale-95">
            {overlay.primaryLabel}
          </button>
          <button type="button" onClick={onSecondary} className="rounded-xl border border-[#D6B76A]/45 bg-[#0E1022]/70 px-4 py-2 text-sm font-bold text-[#FFE6A6] active:scale-95">
            {overlay.secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
