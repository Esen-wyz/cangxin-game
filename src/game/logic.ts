import { BASE_MOVES, PHASE2_BONUS, PHASE3_BONUS } from './constants';
import type { GameState, MoveTable, TurnResult } from './types';

export function getPlayerMoves(state: GameState): MoveTable {
  const moves = { ...BASE_MOVES };
  if (state.currentPhase >= 2 && state.phase1Winner === 'player') Object.assign(moves, PHASE2_BONUS);
  if (state.currentPhase >= 3 && state.phase2Winner === 'player') Object.assign(moves, PHASE3_BONUS);
  return moves;
}

export function getComputerMoves(state: GameState): MoveTable {
  const moves = { ...BASE_MOVES };
  if (state.currentPhase >= 2 && state.phase1Winner === 'computer') Object.assign(moves, PHASE2_BONUS);
  if (state.currentPhase >= 3 && state.phase2Winner === 'computer') Object.assign(moves, PHASE3_BONUS);
  return moves;
}

export function createTurnResult(): TurnResult {
  return {
    playerEnergyDelta: 0,
    computerEnergyDelta: 0,
    playerDefeated: false,
    computerDefeated: false,
    description: '',
  };
}

export function resolveTurn(state: GameState, pMove: string, cMove: string): TurnResult {
  const pM = getPlayerMoves(state);
  const cM = getComputerMoves(state);
  const r = createTurnResult();
  const pI = pM[pMove];
  const cI = cM[cMove];
  const pAtk = pI.type === 'attack';
  const cAtk = cI.type === 'attack';
  const pCx = pMove === '苍心';
  const cCx = cMove === '苍心';
  const pSh = pMove === '护盾';
  const cSh = cMove === '护盾';
  const pFf = pI.type === 'flyshield';
  const cFf = cI.type === 'flyshield';

  if (pCx) r.playerEnergyDelta += 1;
  if (cCx) r.computerEnergyDelta += 1;
  if (pCx && cAtk) {
    r.playerDefeated = true;
    r.computerEnergyDelta -= cI.cost;
    r.description = '苍心被' + cMove + '击败！';
    return r;
  }
  if (cCx && pAtk) {
    r.computerDefeated = true;
    r.playerEnergyDelta -= pI.cost;
    r.description = pMove + '击败苍心！';
    return r;
  }
  if (pCx && cCx) {
    r.description = '双方蓄力！';
    return r;
  }

  if (pFf) {
    if (cMove === '六电') {
      r.playerDefeated = true;
      r.computerEnergyDelta -= cI.cost;
      r.description = '飞飞被六电击落！';
      return r;
    }
    if (cAtk) {
      r.computerEnergyDelta -= cI.cost;
      r.description = '飞飞闪避' + cMove;
      return r;
    }
    if (cCx) {
      r.description = '对手蓄力,飞飞飘舞';
      return r;
    }
    if (cFf) {
      r.description = '双方飞舞';
      return r;
    }
    if (cSh) {
      r.description = '双方防御';
      return r;
    }
  }

  if (cFf) {
    if (pMove === '六电') {
      r.computerDefeated = true;
      r.playerEnergyDelta -= pI.cost;
      r.description = '六电击落飞飞！';
      return r;
    }
    if (pAtk) {
      r.playerEnergyDelta -= pI.cost;
      r.description = '飞飞闪避' + pMove;
      return r;
    }
    if (pCx) {
      r.description = '蓄力中,对手飞飞';
      return r;
    }
    if (pSh) {
      r.description = '双方防御';
      return r;
    }
  }

  function shieldResult(isPlayerShield: boolean): TurnResult {
    const o = createTurnResult();
    const attackerInfo = isPlayerShield ? cI : pI;
    const attackerName = isPlayerShield ? cMove : pMove;
    const defenderLabel = isPlayerShield ? '你' : '对手';
    if (isPlayerShield) o.computerEnergyDelta -= attackerInfo.cost;
    else o.playerEnergyDelta -= attackerInfo.cost;

    if (attackerInfo.shieldResult === 'blocked') {
      o.description = defenderLabel + '护盾挡住' + attackerName;
    } else if (attackerInfo.shieldResult === 'energyLoss') {
      if (isPlayerShield) o.playerEnergyDelta -= 1;
      else o.computerEnergyDelta -= 1;
      o.description = defenderLabel + '护盾被' + attackerName + '击穿-1能';
    } else {
      if (isPlayerShield) o.playerDefeated = true;
      else o.computerDefeated = true;
      o.description = defenderLabel + '护盾挡不住' + attackerName;
    }
    return o;
  }

  if (pSh && cAtk) return Object.assign(r, shieldResult(true));
  if (cSh && pAtk) return Object.assign(r, shieldResult(false));
  if (pSh && cCx) {
    r.description = '对手蓄力,你举盾';
    return r;
  }
  if (cSh && pCx) {
    r.description = '你蓄力,对手举盾';
    return r;
  }
  if (pSh && cSh) {
    r.description = '双方举盾';
    return r;
  }

  if (pAtk && cAtk) {
    r.playerEnergyDelta -= pI.cost;
    r.computerEnergyDelta -= cI.cost;
    if (pI.power > cI.power) {
      r.computerDefeated = true;
      r.description = pMove + '击败' + cMove + '！';
    } else if (cI.power > pI.power) {
      r.playerDefeated = true;
      r.description = cMove + '击败' + pMove + '！';
    } else {
      r.description = '平手！';
    }
    return r;
  }

  r.description = '对峙...';
  return r;
}

export function getAvailAI(moves: MoveTable, energy: number, charges: number): string[] {
  return Object.entries(moves)
    .filter(([, info]) => {
      if (info.chargeCost) return charges > 0 || energy >= info.chargeCost;
      return !(info.type === 'attack' && energy < info.cost);
    })
    .map(([name]) => name);
}

export function aiChoose(state: GameState, playerEnergy: number, computerEnergy: number): string {
  const cM = getComputerMoves(state);
  const pM = getPlayerMoves(state);
  const cAtt = Object.entries(cM)
    .filter(([, info]) => info.type === 'attack')
    .map(([name]) => name);
  const avail = getAvailAI(cM, computerEnergy, state.computerBingdiaoCharges);
  const weights: Record<string, number> = {};

  for (const move of avail) weights[move] = 1;
  if (computerEnergy === 0 && playerEnergy === 0 && avail.includes('苍心')) weights['苍心'] += 1000;
  if (computerEnergy <= 1 && avail.includes('苍心')) weights['苍心'] += 5;
  if (playerEnergy <= 1 && computerEnergy >= 1) {
    for (const attack of cAtt) if (avail.includes(attack) && computerEnergy >= cM[attack].cost) weights[attack] += 3;
  }
  for (const attack of cAtt) {
    if (cM[attack].power >= 4 && computerEnergy >= cM[attack].cost && avail.includes(attack)) weights[attack] += 5;
  }
  if (
    playerEnergy >= 3 &&
    getAvailAI(pM, playerEnergy, state.playerBingdiaoCharges).some((move) => pM[move].type === 'attack')
  ) {
    if (avail.includes('护盾')) weights['护盾'] += 2;
    if (avail.includes('飞飞')) weights['飞飞'] += 3;
  }
  if (computerEnergy >= 2 && computerEnergy < 4) {
    for (const attack of cAtt) if (cM[attack].power === 2 && avail.includes(attack)) weights[attack] += 2;
  }
  if (avail.includes('天马') && computerEnergy >= 1) weights['天马'] += 2;
  if (avail.includes('天马流星转转拳') && computerEnergy >= 3) weights['天马流星转转拳'] += 4;
  if (avail.includes('冰雕朝翅飞') && computerEnergy >= 3) weights['冰雕朝翅飞'] += 5;
  if (avail.includes('冰雕朝翅') && computerEnergy >= 2) weights['冰雕朝翅'] += 3;
  if (avail.includes('冰雕')) {
    if (state.computerBingdiaoCharges > 0) weights['冰雕'] += 3;
    else if (computerEnergy >= 1) weights['冰雕'] += 1;
  }
  for (const move of avail) {
    weights[move] = (weights[move] || 1) + (Math.random() - 0.5) * 3;
    if (weights[move] < 0.1) weights[move] = 0.1;
  }

  const total = avail.reduce((sum, move) => sum + weights[move], 0);
  let rand = Math.random() * total;
  for (const move of avail) {
    rand -= weights[move];
    if (rand <= 0) return move;
  }
  return avail[avail.length - 1];
}
