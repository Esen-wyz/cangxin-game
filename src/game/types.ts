export type Side = 'player' | 'computer';
export type PhaseNumber = 1 | 2 | 3;
export type MoveType = 'charge' | 'shield' | 'attack' | 'flyshield';
export type ShieldResult = 'blocked' | 'energyLoss' | 'pierce';

export interface MoveInfo {
  type: MoveType;
  cost: number;
  power: number;
  icon: string;
  anim: string;
  shieldResult?: ShieldResult;
  bonus?: true;
  phase?: 2 | 3;
  chargeCost?: number;
  chargesPerPay?: number;
}

export type MoveTable = Record<string, MoveInfo>;

export interface TurnResult {
  playerEnergyDelta: number;
  computerEnergyDelta: number;
  playerDefeated: boolean;
  computerDefeated: boolean;
  description: string;
}

export interface RoundHistory {
  number: number;
  winner: Side;
  playerMove: string | null;
  computerMove: string | null;
}

export interface PhaseHistory {
  number: PhaseNumber;
  rounds: RoundHistory[];
  winner: Side | null;
  playerScore: number;
  computerScore: number;
}

export interface GameHistory {
  winsPerPhase: number;
  phases: PhaseHistory[];
}

export interface GameState {
  currentPhase: PhaseNumber;
  phase1Winner: Side | null;
  phase2Winner: Side | null;
  phase1PlayerScore: number;
  phase1ComputerScore: number;
  phase2PlayerScore: number;
  phase2ComputerScore: number;
  playerEnergy: number;
  computerEnergy: number;
  playerScore: number;
  computerScore: number;
  currentRound: number;
  turnInRound: number;
  gameOver: boolean;
  awaitingPlayer: boolean;
  playerMove: string | null;
  computerMove: string | null;
  lastResult: TurnResult | null;
  playerBingdiaoCharges: number;
  computerBingdiaoCharges: number;
}

export interface PhaseModalData {
  title: string;
  phaseResult: string;
  text: string;
  primaryLabel: string;
  secondaryLabel: string;
  mode: 'phase' | 'game' | 'replay';
}
