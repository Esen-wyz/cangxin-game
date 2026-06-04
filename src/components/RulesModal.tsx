interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur" onClick={onClose}>
      <div
        className="max-h-[76vh] w-full max-w-[360px] overflow-y-auto rounded-xl border border-imperial/35 bg-night p-4 text-xs leading-relaxed text-stone-300 shadow-glow"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="gold-text mb-3 text-center text-xl font-black">规则</h2>
        <div className="space-y-2">
          <p><b className="text-amber-200">一阶段：</b>各6招，先赢N局胜出。</p>
          <p><b className="text-amber-200">苍心：</b>+1能。被攻击即败。</p>
          <p><b className="text-amber-200">护盾：</b>挡波波/天马/冰雕/朝翅。六电使护盾方-1能。</p>
          <p><b className="text-amber-200">攻势：</b>波波＜六电＜搓搓＜八嘎。</p>
          <p><b className="text-amber-200">P2：</b>胜者获得天马、天马流星转转拳。</p>
          <p><b className="text-amber-200">P3：</b>胜者获得冰雕、朝翅、冰雕朝翅、冰雕朝翅飞、飞飞。</p>
          <p><b className="text-amber-200">飞飞：</b>仅六电能击落，其余攻击会被闪避。</p>
        </div>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-lg border border-imperial/60 py-2 text-amber-200">
          知道了
        </button>
      </div>
    </div>
  );
}
