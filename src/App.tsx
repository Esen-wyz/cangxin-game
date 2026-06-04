import { Info, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ArenaCanvas } from './components/ArenaCanvas';
import { PhaseModal } from './components/PhaseModal';
import { RulesModal } from './components/RulesModal';
import { SetupScreen } from './components/SetupScreen';
import { SkillCard } from './components/SkillCard';
import { getMoveNamesForTab, SkillTabId, SkillTabs } from './components/SkillTabs';
import { TopHud } from './components/TopHud';
import { PHASE2_BONUS, PHASE3_BONUS } from './game/constants';
import { useGameState } from './game/useGameState';
import type { MoveInfo } from './game/types';

export function App() {
  const game = useGameState();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SkillTabId>('base');

  const availableTabs = useMemo(() => {
    const tabs: SkillTabId[] = ['base'];
    if (Object.keys(PHASE2_BONUS).some((move) => game.playerMoves[move])) tabs.push('p2');
    if (Object.keys(PHASE3_BONUS).some((move) => game.playerMoves[move])) tabs.push('p3');
    return tabs;
  }, [game.playerMoves]);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) setActiveTab('base');
  }, [activeTab, availableTabs]);

  const visibleMoveNames = getMoveNamesForTab(activeTab).filter((move) => game.playerMoves[move]);

  function isDisabled(info: MoveInfo) {
    const state = game.state;
    if (!state.awaitingPlayer || state.gameOver) return true;
    if (info.chargeCost) return !(state.playerBingdiaoCharges > 0 || state.playerEnergy >= info.chargeCost);
    return info.type === 'attack' && state.playerEnergy < info.cost;
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden border-x border-white/10 bg-ink/70 shadow-2xl">
      {!game.gameStarted && (
        <SetupScreen selectedWins={game.selectedWins} onSelectWins={game.setSelectedWins} onStart={game.startGame} />
      )}

      <TopHud state={game.state} winsPerPhase={game.winsPerPhase} />
      <ArenaCanvas
        playerMoves={game.playerMoves}
        computerMoves={game.computerMoves}
        animationEvent={game.animationEvent}
        resetId={game.roundResetId}
      />

      <section className="z-10 border-t border-white/10 bg-[#0b1020]/95 p-2 backdrop-blur">
        <SkillTabs activeTab={activeTab} moves={game.playerMoves} onTabChange={setActiveTab} />
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {visibleMoveNames.map((name) => {
            const info = game.playerMoves[name];
            return (
              <SkillCard
                key={name}
                name={name}
                info={info}
                disabled={isDisabled(info)}
                playerEnergy={game.state.playerEnergy}
                bingdiaoCharges={game.state.playerBingdiaoCharges}
                onChoose={game.playerChoose}
              />
            );
          })}
        </div>
      </section>

      <div className="fixed right-3 top-3 z-20 flex gap-2">
        <button
          type="button"
          onClick={() => setRulesOpen(true)}
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-night/90 text-stone-300 shadow-lg backdrop-blur"
          aria-label="查看规则"
        >
          <Info size={16} />
        </button>
        {game.gameStarted && (
          <button
            type="button"
            onClick={game.resetGame}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-night/90 text-stone-300 shadow-lg backdrop-blur"
            aria-label="重新开始"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <PhaseModal
        overlay={game.overlay}
        history={game.gameHistory}
        onPrimary={game.handleOverlayPrimary}
        onSecondary={game.handleOverlaySecondary}
      />
    </div>
  );
}
