interface SetupScreenProps {
  selectedWins: number;
  onSelectWins: (wins: number) => void;
  onStart: () => void;
}

export function SetupScreen({ selectedWins, onSelectWins, onStart }: SetupScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#070A13] px-5 text-center">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,16,34,0.35),rgba(7,10,19,0.96)),radial-gradient(ellipse_at_50%_16%,rgba(214,183,106,0.24),transparent_42%),radial-gradient(ellipse_at_50%_88%,rgba(75,163,255,0.12),transparent_48%)]" />
      <div className="absolute left-[-20%] top-[18%] h-24 w-[140%] rotate-[-9deg] bg-gradient-to-r from-transparent via-[#D6B76A]/10 to-transparent blur-2xl" />
      <div className="absolute left-[-28%] top-[48%] h-20 w-[150%] rotate-[7deg] bg-gradient-to-r from-transparent via-[#4BA3FF]/10 to-transparent blur-2xl" />
      <div className="absolute inset-x-0 top-8 h-px bg-gradient-to-r from-transparent via-[#D6B76A]/40 to-transparent" />
      <div className="relative w-full max-w-[380px] rounded-2xl border border-[#D6B76A]/35 bg-[#0E1022]/80 px-5 py-7 shadow-[0_0_50px_rgba(214,183,106,0.18)] backdrop-blur-md">
        <div className="mx-auto mb-5 h-px w-28 bg-gradient-to-r from-transparent via-[#D6B76A] to-transparent" />
        <div className="gold-text text-6xl font-black tracking-normal drop-shadow-[0_0_24px_rgba(214,183,106,0.32)]">苍心</div>
        <div className="mt-2 text-sm font-bold tracking-[0.5em] text-[#B9C5DA]">气功对决</div>
        <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-[#4BA3FF]/60 to-transparent" />

        <div className="mt-7 text-xs font-bold tracking-[0.24em] text-[#D6B76A]">每阶段胜利局数</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[1, 3, 2].map((wins) => (
            <button
              key={wins}
              type="button"
              onClick={() => onSelectWins(wins)}
              className={[
                'relative h-12 rounded-lg border text-sm font-black transition active:scale-95',
                selectedWins === wins
                  ? 'border-[#D6B76A] bg-gradient-to-b from-[#D6B76A]/[0.24] to-[#8b6a2a]/[0.18] text-[#FFE8A8] shadow-[inset_0_0_18px_rgba(214,183,106,0.14),0_0_18px_rgba(214,183,106,0.2)]'
                  : 'border-white/10 bg-black/20 text-slate-300 hover:border-[#D6B76A]/40',
              ].join(' ')}
            >
              <span className="absolute inset-x-2 top-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {wins}局
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-6 h-12 w-full rounded-xl border border-[#F1D78A]/70 bg-gradient-to-b from-[#F4D98A] via-[#D6B76A] to-[#8F692D] text-sm font-black text-[#17120A] shadow-[0_0_28px_rgba(214,183,106,0.35)] transition active:scale-[0.98]"
        >
          开始对决
        </button>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[#D6B76A]/70 to-transparent" />
      </div>
    </div>
  );
}
