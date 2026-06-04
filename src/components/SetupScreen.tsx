interface SetupScreenProps {
  selectedWins: number;
  onSelectWins: (wins: number) => void;
  onStart: () => void;
}

export function SetupScreen({ selectedWins, onSelectWins, onStart }: SetupScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-ink px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(214,177,94,0.18),transparent_34%)]" />
      <div className="relative">
        <div className="gold-text text-6xl font-black tracking-normal">苍 心</div>
        <div className="mt-2 text-sm tracking-[0.42em] text-stone-400">气 功 对 决</div>
      </div>
      <div className="relative text-sm text-stone-400">每阶段获胜局数</div>
      <div className="relative flex gap-2">
        {[1, 3, 2].map((wins) => (
          <button
            key={wins}
            type="button"
            onClick={() => onSelectWins(wins)}
            className={[
              'h-11 min-w-16 rounded-lg border px-4 text-sm font-bold transition',
              selectedWins === wins
                ? 'border-imperial bg-imperial/15 text-amber-100 shadow-glow'
                : 'border-white/10 bg-white/[0.04] text-stone-300',
            ].join(' ')}
          >
            {wins}局
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onStart}
        className="relative rounded-xl bg-gradient-to-br from-[#f0d58b] to-[#9d7434] px-9 py-3 text-sm font-black text-[#17120a] shadow-glow"
      >
        开始对决
      </button>
    </div>
  );
}
