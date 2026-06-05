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
      ? 'border-yellow-300/45 from-yellow-300/[0.18] shadow-yellow-300/10'
      : info.phase === 3
        ? 'border-[#E056A0]/55 from-[#E056A0]/20 shadow-[#E056A0]/10'
        : 'border-[#D6B76A]/35 from-[#D6B76A]/12 shadow-[#D6B76A]/10';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChoose(name)}
      className={[
        'relative grid h-[82px] w-[74px] shrink-0 grid-rows-[28px_1fr_18px] place-items-center overflow-hidden rounded-xl border bg-gradient-to-b to-[#070A13] px-1.5 text-center transition active:scale-95',
        phaseTint,
        disabled
          ? 'cursor-not-allowed opacity-35 grayscale before:absolute before:inset-0 before:bg-black/45'
          : 'shadow-[0_0_18px_var(--tw-shadow-color)] hover:-translate-y-0.5 hover:border-[#F4D98A]/70',
      ].join(' ')}
    >
      <span className="absolute inset-x-2 top-1 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <span className="relative grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-black/25 text-xl leading-none shadow-[0_0_14px_rgba(255,255,255,0.08)]">
        {info.icon}
      </span>
      <span className="relative flex min-h-0 items-center text-[11px] font-black leading-tight text-[#F4E8C8]">{name}</span>
      <span
        className={[
          'relative rounded-full border px-1.5 text-[10px] font-bold leading-4',
          info.chargeCost && bingdiaoCharges > 0
            ? 'border-[#D6B76A]/40 bg-[#D6B76A]/12 text-[#FFE6A6]'
            : 'border-white/10 bg-black/20 text-slate-400',
        ].join(' ')}
      >
        {costText(info, bingdiaoCharges)}
      </span>
    </button>
  );
}
