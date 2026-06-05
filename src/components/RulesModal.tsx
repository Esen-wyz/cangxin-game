interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/[0.82] p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative max-h-[76vh] w-full max-w-[370px] overflow-y-auto rounded-2xl border border-[#D6B76A]/40 bg-[linear-gradient(180deg,#15182E,#070A13)] p-4 text-xs leading-relaxed text-slate-300 shadow-[0_0_42px_rgba(214,183,106,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D6B76A] to-transparent" />
        <h2 className="gold-text mb-3 text-center text-xl font-black">规则</h2>
        <div className="space-y-2">
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">一阶段：</b>各6招，先赢N局胜出。</p>
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">苍心：</b>+1能。被攻击即败。</p>
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">护盾：</b>挡波波/天马/冰雕/朝翅。六电使护盾方-1能。</p>
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">攻势：</b>波波＜六电＜搓搓＜八嘎。</p>
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">P2：</b>胜者获得天马、天马流星转转拳。</p>
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">P3：</b>胜者获得冰雕、朝翅、冰雕朝翅、冰雕朝翅飞、飞飞。</p>
          <p className="rounded-lg border border-white/10 bg-black/[0.18] p-2"><b className="text-[#FFE6A6]">飞飞：</b>仅六电能击落，其余攻击会被闪避。</p>
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl border border-[#D6B76A]/55 bg-[#0E1022]/70 py-2 font-black text-[#FFE6A6] active:scale-95">
          知道了
        </button>
      </div>
    </div>
  );
}
