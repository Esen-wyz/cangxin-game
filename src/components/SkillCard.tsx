import type { MoveInfo } from '../game/types';

interface SkillCardProps {
  name: string;
  info: MoveInfo;
  disabled: boolean;
  playerEnergy: number;
  bingdiaoCharges: number;
  onChoose: (move: string) => void;
}

function costText(info: MoveInfo, charges: number) {
  if (info.chargeCost) {
    return charges > 0 ? `x${charges}` : `-${info.chargeCost}能→${info.chargesPerPay}次`;
  }
  if (info.type === 'charge') return '+1能';
  if (info.type === 'shield' || info.type === 'flyshield') return '免费';
  return `-${info.cost}能`;
}

export function SkillCard({ name, info, disabled, bingdiaoCharges, onChoose }: SkillCardProps) {
  const phaseTint =
    info.phase === 2
      ? 'border-yellow-300/35 from-yellow-300/15'
      : info.phase === 3
        ? 'border-pink-300/35 from-pink-400/15'
        : 'border-imperial/20 from-white/[0.05]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChoose(name)}
      className={[
        'grid h-[72px] w-[72px] shrink-0 grid-rows-[24px_1fr_16px] place-items-center rounded-lg border bg-gradient-to-b to-black/30 px-1 text-center transition active:scale-95',
        phaseTint,
        disabled ? 'cursor-not-allowed opacity-30 grayscale' : 'shadow-[0_0_16px_rgba(214,177,94,0.12)]',
      ].join(' ')}
    >
      <span className="text-xl leading-none">{info.icon}</span>
      <span className="flex items-center text-[11px] font-black leading-tight text-stone-100">{name}</span>
      <span className={info.chargeCost && bingdiaoCharges > 0 ? 'text-[10px] text-amber-300' : 'text-[10px] text-stone-400'}>
        {costText(info, bingdiaoCharges)}
      </span>
    </button>
  );
}
