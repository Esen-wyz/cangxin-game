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
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 p-4 backdrop-blur">
      <div className="w-full max-w-[360px] rounded-2xl border border-imperial/60 bg-night p-4 text-center shadow-glow">
        <h2 className="gold-text text-2xl font-black">{overlay.title}</h2>
        <div className="mt-1 text-xs text-stone-400">{overlay.phaseResult}</div>
        {overlay.mode === 'replay' ? (
          <div className="mt-3 max-h-[52vh] overflow-y-auto">
            <ReplayPanel history={history} />
          </div>
        ) : (
          <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-100">{overlay.text}</div>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={onPrimary} className="rounded-xl bg-gradient-to-br from-[#f0d58b] to-[#9d7434] px-4 py-2 text-sm font-black text-[#17120a]">
            {overlay.primaryLabel}
          </button>
          <button type="button" onClick={onSecondary} className="rounded-xl border border-imperial/60 px-4 py-2 text-sm font-bold text-amber-200">
            {overlay.secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
