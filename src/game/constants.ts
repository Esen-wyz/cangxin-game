import type { GameHistory, GameState, MoveTable, PhaseHistory } from './types';

export const BASE_MOVES: MoveTable = {
  '苍心': { type: 'charge', cost: 0, power: 0, icon: '☯', anim: 'charge' },
  '护盾': { type: 'shield', cost: 0, power: 0, icon: '🛡', anim: 'shield' },
  '波波': { type: 'attack', cost: 1, power: 1, icon: '💨', anim: 'wave', shieldResult: 'blocked' },
  '六电': { type: 'attack', cost: 2, power: 2, icon: '⚡', anim: 'bolt', shieldResult: 'energyLoss' },
  '搓搓': { type: 'attack', cost: 3, power: 3, icon: '🔥', anim: 'fire', shieldResult: 'pierce' },
  '八嘎': { type: 'attack', cost: 4, power: 4, icon: '💀', anim: 'dark', shieldResult: 'pierce' },
};

export const PHASE2_BONUS: MoveTable = {
  '天马': { type: 'attack', cost: 1, power: 2, icon: '🦄', anim: 'pegasus', shieldResult: 'blocked', bonus: true, phase: 2 },
  '天马流星转转拳': { type: 'attack', cost: 3, power: 4, icon: '🌟', anim: 'meteor', shieldResult: 'pierce', bonus: true, phase: 2 },
};

export const PHASE3_BONUS: MoveTable = {
  '冰雕': { type: 'attack', cost: 0, power: 0, icon: '❄', anim: 'ice', shieldResult: 'blocked', bonus: true, phase: 3, chargeCost: 1, chargesPerPay: 3 },
  '朝翅': { type: 'attack', cost: 1, power: 3, icon: '🦅', anim: 'wing', shieldResult: 'blocked', bonus: true, phase: 3 },
  '冰雕朝翅': { type: 'attack', cost: 2, power: 4, icon: '❄🦅', anim: 'icewing', shieldResult: 'pierce', bonus: true, phase: 3 },
  '冰雕朝翅飞': { type: 'attack', cost: 3, power: 5, icon: '💥', anim: 'ult', shieldResult: 'pierce', bonus: true, phase: 3 },
  '飞飞': { type: 'flyshield', cost: 0, power: 0, icon: '🕊', anim: 'fly', bonus: true, phase: 3 },
};

export const ALL_MOVES: MoveTable = {
  ...BASE_MOVES,
  ...PHASE2_BONUS,
  ...PHASE3_BONUS,
};

export const KEYBOARD_MOVES: Record<string, string> = {
  '1': '苍心',
  '2': '护盾',
  '3': '波波',
  '4': '六电',
  '5': '搓搓',
  '6': '八嘎',
  '7': '天马',
  '8': '天马流星转转拳',
  '9': '冰雕',
  '0': '朝翅',
  '-': '冰雕朝翅',
  '=': '冰雕朝翅飞',
  f: '飞飞',
};

export function createInitialState(): GameState {
  return {
    currentPhase: 1,
    phase1Winner: null,
    phase2Winner: null,
    phase1PlayerScore: 0,
    phase1ComputerScore: 0,
    phase2PlayerScore: 0,
    phase2ComputerScore: 0,
    playerEnergy: 0,
    computerEnergy: 0,
    playerScore: 0,
    computerScore: 0,
    currentRound: 1,
    turnInRound: 0,
    gameOver: false,
    awaitingPlayer: true,
    playerMove: null,
    computerMove: null,
    lastResult: null,
    playerBingdiaoCharges: 0,
    computerBingdiaoCharges: 0,
  };
}

export function createPhaseHistory(number: 1 | 2 | 3): PhaseHistory {
  return { number, rounds: [], winner: null, playerScore: 0, computerScore: 0 };
}

export function createGameHistory(winsPerPhase: number): GameHistory {
  return { winsPerPhase, phases: [] };
}
