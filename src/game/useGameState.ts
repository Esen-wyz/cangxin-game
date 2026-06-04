import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createGameHistory, createInitialState, createPhaseHistory, KEYBOARD_MOVES } from './constants';
import { aiChoose, getComputerMoves, getPlayerMoves, resolveTurn } from './logic';
import type { GameHistory, GameState, PhaseModalData, Side, TurnResult } from './types';

interface RoundAnimationEvent {
  id: number;
  playerMove: string;
  computerMove: string;
  result: TurnResult;
}

export interface GameOverlay extends PhaseModalData {
  mode: 'phase' | 'game' | 'replay';
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [selectedWins, setSelectedWins] = useState(3);
  const [winsPerPhase, setWinsPerPhase] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistory>(() => createGameHistory(3));
  const [overlay, setOverlay] = useState<GameOverlay | null>(null);
  const [animationEvent, setAnimationEvent] = useState<RoundAnimationEvent | null>(null);
  const [roundResetId, setRoundResetId] = useState(0);

  const stateRef = useRef<GameState>(createInitialState());
  const winsPerPhaseRef = useRef(3);
  const gameHistoryRef = useRef<GameHistory>(createGameHistory(3));
  const currentPhaseHistoryRef = useRef(createPhaseHistory(1));
  const playerHistoryRef = useRef<string[]>([]);
  const aiMoodRef = useRef(0.5);
  const timersRef = useRef<number[]>([]);
  const animationIdRef = useRef(0);

  const syncState = useCallback(() => {
    setState({ ...stateRef.current });
  }, []);

  const syncHistory = useCallback(() => {
    setGameHistory({
      winsPerPhase: gameHistoryRef.current.winsPerPhase,
      phases: [...gameHistoryRef.current.phases],
    });
  }, []);

  const queue = useCallback((fn: () => void, delay: number) => {
    const timer = window.setTimeout(fn, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const startNewRound = useCallback(() => {
    const s = stateRef.current;
    s.playerEnergy = 0;
    s.computerEnergy = 0;
    s.turnInRound = 0;
    s.awaitingPlayer = true;
    s.playerMove = null;
    s.computerMove = null;
    s.lastResult = null;
    s.playerBingdiaoCharges = 0;
    s.computerBingdiaoCharges = 0;
    setRoundResetId((id) => id + 1);
    syncState();
  }, [syncState]);

  const finalizePhaseHistory = useCallback(
    (winner: Side) => {
      const history = currentPhaseHistoryRef.current;
      history.winner = winner;
      history.playerScore = stateRef.current.playerScore;
      history.computerScore = stateRef.current.computerScore;
      gameHistoryRef.current.phases.push({ ...history, rounds: [...history.rounds] });
      syncHistory();
    },
    [syncHistory],
  );

  const resetGame = useCallback(() => {
    clearTimers();
    const fresh = createInitialState();
    stateRef.current = fresh;
    gameHistoryRef.current = createGameHistory(winsPerPhaseRef.current);
    currentPhaseHistoryRef.current = createPhaseHistory(1);
    playerHistoryRef.current = [];
    aiMoodRef.current = 0.5;
    setOverlay(null);
    setGameStarted(true);
    syncHistory();
    setState({ ...fresh });
    startNewRound();
  }, [clearTimers, startNewRound, syncHistory]);

  const startPhase2 = useCallback(() => {
    const s = stateRef.current;
    const winner: Side = s.playerScore >= winsPerPhaseRef.current ? 'player' : 'computer';
    s.phase1Winner = winner;
    s.phase1PlayerScore = s.playerScore;
    s.phase1ComputerScore = s.computerScore;
    finalizePhaseHistory(winner);
    s.currentPhase = 2;
    s.playerScore = 0;
    s.computerScore = 0;
    s.currentRound = 1;
    s.awaitingPlayer = false;
    s.gameOver = false;
    currentPhaseHistoryRef.current = createPhaseHistory(2);
    setOverlay({
      mode: 'phase',
      title: '🌟 进入第二阶段！',
      phaseResult: `第一阶段 ${s.phase1PlayerScore}:${s.phase1ComputerScore}`,
      text: `${winner === 'player' ? '你' : '电脑'}赢得第一阶段\n获得: 🦄天马 🌟天马流星转转拳`,
      primaryLabel: '开始',
      secondaryLabel: '重开',
    });
    syncState();
  }, [finalizePhaseHistory, syncState]);

  const startPhase3 = useCallback(() => {
    const s = stateRef.current;
    const winner: Side = s.playerScore >= winsPerPhaseRef.current ? 'player' : 'computer';
    s.phase2Winner = winner;
    s.phase2PlayerScore = s.playerScore;
    s.phase2ComputerScore = s.computerScore;
    finalizePhaseHistory(winner);
    s.currentPhase = 3;
    s.playerScore = 0;
    s.computerScore = 0;
    s.currentRound = 1;
    s.awaitingPlayer = false;
    s.gameOver = false;
    currentPhaseHistoryRef.current = createPhaseHistory(3);
    setOverlay({
      mode: 'phase',
      title: '💥 进入第三阶段！',
      phaseResult: `P1:${s.phase1PlayerScore}:${s.phase1ComputerScore} P2:${s.phase2PlayerScore}:${s.phase2ComputerScore}`,
      text: `${winner === 'player' ? '你' : '电脑'}赢得第二阶段\n获得: ❄冰雕 🦅朝翅 ❄🦅冰雕朝翅 💥冰雕朝翅飞 🕊飞飞`,
      primaryLabel: '开始',
      secondaryLabel: '重开',
    });
    syncState();
  }, [finalizePhaseHistory, syncState]);

  const showReplay = useCallback(() => {
    setOverlay({
      mode: 'replay',
      title: '📊 复盘',
      phaseResult: `每阶段${winsPerPhaseRef.current}局制`,
      text: '',
      primaryLabel: '再来一局',
      secondaryLabel: '关闭',
    });
  }, []);

  const endGame = useCallback(() => {
    const s = stateRef.current;
    const winner: Side = s.playerScore >= winsPerPhaseRef.current ? 'player' : 'computer';
    finalizePhaseHistory(winner);
    s.gameOver = true;
    s.awaitingPlayer = false;
    syncState();
    const phases = gameHistoryRef.current.phases;
    const playerPhaseWins = phases.filter((phase) => phase.winner === 'player').length;
    setOverlay({
      mode: 'game',
      title: winner === 'player' ? '🏆 恭喜！最终胜利！' : '💫 虽败犹荣',
      phaseResult: phases.map((phase) => `P${phase.number}:${phase.playerScore}-${phase.computerScore}`).join(' | '),
      text: `你赢了${playerPhaseWins}个阶段`,
      primaryLabel: '再来一局',
      secondaryLabel: '📊 复盘',
    });
  }, [finalizePhaseHistory, syncState]);

  const endRound = useCallback(
    (winner: Side) => {
      const s = stateRef.current;
      if (winner === 'player') s.playerScore += 1;
      else s.computerScore += 1;
      currentPhaseHistoryRef.current.rounds.push({
        number: s.currentRound,
        winner,
        playerMove: s.playerMove,
        computerMove: s.computerMove,
      });
      syncState();

      if (s.playerScore >= winsPerPhaseRef.current || s.computerScore >= winsPerPhaseRef.current) {
        if (s.currentPhase === 1) queue(startPhase2, 1000);
        else if (s.currentPhase === 2) queue(startPhase3, 1000);
        else queue(endGame, 1000);
        return;
      }

      s.currentRound += 1;
      queue(startNewRound, 1600);
    },
    [endGame, queue, startNewRound, startPhase2, startPhase3, syncState],
  );

  const playerChoose = useCallback(
    (move: string) => {
      const s = stateRef.current;
      if (!s.awaitingPlayer || s.gameOver) return;
      const playerMoves = getPlayerMoves(s);
      const info = playerMoves[move];
      if (!info) return;

      if (info.chargeCost) {
        if (!(s.playerBingdiaoCharges > 0 || s.playerEnergy >= info.chargeCost)) return;
      } else if (info.type === 'attack' && s.playerEnergy < info.cost) return;

      if (info.chargeCost) {
        if (s.playerBingdiaoCharges <= 0) {
          s.playerEnergy -= info.chargeCost;
          s.playerBingdiaoCharges = info.chargesPerPay ?? 0;
        }
      }

      s.awaitingPlayer = false;
      s.playerMove = move;
      playerHistoryRef.current.push(move);
      if (playerHistoryRef.current.length > 30) playerHistoryRef.current.shift();

      s.computerMove = aiChoose(s, s.playerEnergy, s.computerEnergy);
      const computerInfo = getComputerMoves(s)[s.computerMove];
      if (computerInfo?.chargeCost) {
        if (s.computerBingdiaoCharges <= 0 && s.computerEnergy >= computerInfo.chargeCost) {
          s.computerEnergy -= computerInfo.chargeCost;
          s.computerBingdiaoCharges = computerInfo.chargesPerPay ?? 0;
        }
      }

      const result = resolveTurn(s, s.playerMove, s.computerMove);
      if (info.chargeCost) s.playerBingdiaoCharges -= 1;
      if (computerInfo?.chargeCost) s.computerBingdiaoCharges -= 1;

      s.lastResult = result;
      s.turnInRound += 1;
      s.playerEnergy = Math.max(0, s.playerEnergy + result.playerEnergyDelta);
      s.computerEnergy = Math.max(0, s.computerEnergy + result.computerEnergyDelta);
      animationIdRef.current += 1;
      setAnimationEvent({
        id: animationIdRef.current,
        playerMove: s.playerMove,
        computerMove: s.computerMove,
        result,
      });
      syncState();

      if (result.playerDefeated || result.computerDefeated) {
        const roundWinner: Side = result.playerDefeated ? 'computer' : 'player';
        if (result.computerDefeated) aiMoodRef.current = Math.min(1, aiMoodRef.current + 0.15);
        else aiMoodRef.current = Math.max(0, aiMoodRef.current - 0.1);
        queue(() => endRound(roundWinner), 1600);
      } else {
        queue(() => {
          s.awaitingPlayer = true;
          s.playerMove = null;
          s.computerMove = null;
          syncState();
        }, 1600);
      }
    },
    [endRound, queue, syncState],
  );

  const startGame = useCallback(() => {
    clearTimers();
    winsPerPhaseRef.current = selectedWins;
    setWinsPerPhase(selectedWins);
    const fresh = createInitialState();
    stateRef.current = fresh;
    gameHistoryRef.current = createGameHistory(selectedWins);
    currentPhaseHistoryRef.current = createPhaseHistory(1);
    playerHistoryRef.current = [];
    aiMoodRef.current = 0.5;
    setGameStarted(true);
    setOverlay(null);
    syncHistory();
    setState({ ...fresh });
    startNewRound();
  }, [clearTimers, selectedWins, startNewRound, syncHistory]);

  const handleOverlayPrimary = useCallback(() => {
    if (!overlay) return;
    if (overlay.mode === 'phase') {
      setOverlay(null);
      startNewRound();
    } else {
      resetGame();
    }
  }, [overlay, resetGame, startNewRound]);

  const handleOverlaySecondary = useCallback(() => {
    if (!overlay) return;
    if (overlay.mode === 'phase') resetGame();
    else if (overlay.mode === 'game') showReplay();
    else setOverlay(null);
  }, [overlay, resetGame, showReplay]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const move = KEYBOARD_MOVES[event.key];
      if (move && getPlayerMoves(stateRef.current)[move]) playerChoose(move);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playerChoose]);

  useEffect(() => clearTimers, [clearTimers]);

  const playerMoves = useMemo(() => getPlayerMoves(state), [state]);
  const computerMoves = useMemo(() => getComputerMoves(state), [state]);

  return {
    state,
    selectedWins,
    winsPerPhase,
    gameStarted,
    gameHistory,
    overlay,
    animationEvent,
    roundResetId,
    playerMoves,
    computerMoves,
    setSelectedWins,
    startGame,
    resetGame,
    playerChoose,
    handleOverlayPrimary,
    handleOverlaySecondary,
  };
}
