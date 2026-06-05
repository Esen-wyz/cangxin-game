import { useEffect, useRef, useState } from 'react';
import { ALL_MOVES } from '../game/constants';
import type { MoveInfo, MoveTable, TurnResult } from '../game/types';

interface ArenaCanvasProps {
  playerMoves: MoveTable;
  computerMoves: MoveTable;
  animationEvent: { id: number; playerMove: string; computerMove: string; result: TurnResult } | null;
  resetId: number;
}

type Side = 'player' | 'computer';
type Pose = 'idle' | 'attack' | 'charge' | 'shield' | 'fly';

interface Vec {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity: number;
}

interface Ring {
  x: number;
  y: number;
  color: string;
  size: number;
  start: number;
  duration: number;
}

interface Projectile {
  from: Vec;
  to: Vec;
  color: string;
  trail: string;
  size: number;
  start: number;
  duration: number;
  impacted: boolean;
}

interface FighterState {
  pose: Pose;
  poseStart: number;
  poseEnd: number;
  hitUntil: number;
  deadUntil: number;
}

interface MotionState {
  time: number;
  lastFrame: number;
  shake: number;
  flashColor: string;
  flashAlpha: number;
}

interface ArenaLayout {
  width: number;
  height: number;
  groundY: number;
  player: Vec;
  computer: Vec;
}

interface ResultPop {
  text: string;
  tone: 'win' | 'lose' | 'tie';
}

const PLAYER_GLOW = '#53b7ff';
const ENEMY_GLOW = '#ff6262';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - clamp(value, 0, 1), 3);
}

function phaseProgress(now: number, start: number, end: number) {
  if (end <= start) return 1;
  return clamp((now - start) / (end - start), 0, 1);
}

function getLayout(width: number, height: number): ArenaLayout {
  const groundY = height * 0.78;
  return {
    width,
    height,
    groundY,
    player: { x: width * 0.24, y: groundY },
    computer: { x: width * 0.76, y: groundY },
  };
}

function pointFor(layout: ArenaLayout, side: Side) {
  return side === 'player' ? layout.player : layout.computer;
}

function opposite(side: Side): Side {
  return side === 'player' ? 'computer' : 'player';
}

export function ArenaCanvas({ playerMoves, computerMoves, animationEvent, resetId }: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const lastAnimationIdRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const sizeRef = useRef({ width: 1, height: 1 });
  const motionRef = useRef<MotionState>({ time: 0, lastFrame: 0, shake: 0, flashColor: '', flashAlpha: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const fightersRef = useRef<Record<Side, FighterState>>({
    player: { pose: 'idle', poseStart: 0, poseEnd: 0, hitUntil: 0, deadUntil: 0 },
    computer: { pose: 'idle', poseStart: 0, poseEnd: 0, hitUntil: 0, deadUntil: 0 },
  });
  const [resultPop, setResultPop] = useState<ResultPop | null>(null);

  function clearTimers() {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }

  function clearEffects() {
    clearTimers();
    particlesRef.current = [];
    ringsRef.current = [];
    projectilesRef.current = [];
    motionRef.current.shake = 0;
    motionRef.current.flashAlpha = 0;
  }

  function resetScene() {
    clearEffects();
    fightersRef.current = {
      player: { pose: 'idle', poseStart: 0, poseEnd: 0, hitUntil: 0, deadUntil: 0 },
      computer: { pose: 'idle', poseStart: 0, poseEnd: 0, hitUntil: 0, deadUntil: 0 },
    };
    setResultPop(null);
  }

  function queue(delay: number, fn: () => void) {
    const timer = window.setTimeout(fn, delay);
    timersRef.current.push(timer);
  }

  function setPose(side: Side, pose: Pose, duration: number) {
    const now = motionRef.current.time;
    fightersRef.current[side].pose = pose;
    fightersRef.current[side].poseStart = now;
    fightersRef.current[side].poseEnd = now + duration;
  }

  function flash(color: string, alpha: number) {
    motionRef.current.flashColor = color;
    motionRef.current.flashAlpha = Math.max(motionRef.current.flashAlpha, alpha);
  }

  function shake(amount: number) {
    motionRef.current.shake = Math.max(motionRef.current.shake, amount);
  }

  function spawnParticles(origin: Vec, color: string, count: number, speed: number, life: number, gravity = 18) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 0.8 + Math.random() * speed;
      particlesRef.current.push({
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        size: 1.6 + Math.random() * 2.8,
        life,
        maxLife: life,
        gravity,
      });
    }
  }

  function addRing(origin: Vec, color: string, size: number, duration = 0.45) {
    ringsRef.current.push({ x: origin.x, y: origin.y, color, size, start: motionRef.current.time, duration });
  }

  function addProjectile(from: Vec, to: Vec, color: string, size: number, duration = 0.34, trail = color) {
    projectilesRef.current.push({ from, to, color, trail, size, start: motionRef.current.time, duration, impacted: false });
  }

  function castSkill(move: string, side: Side) {
    const info = ALL_MOVES[move];
    if (!info) return;

    const layout = getLayout(sizeRef.current.width, sizeRef.current.height);
    const origin = pointFor(layout, side);
    const target = pointFor(layout, opposite(side));
    const dir = side === 'player' ? 1 : -1;
    const hand = { x: origin.x + dir * 26, y: origin.y - 72 };
    const targetChest = { x: target.x - dir * 24, y: target.y - 72 };
    const selfCore = { x: origin.x, y: origin.y - 78 };

    switch (info.anim) {
      case 'charge':
        setPose(side, 'charge', 0.8);
        addRing(selfCore, '#32d582', 34, 0.55);
        spawnParticles({ x: origin.x, y: origin.y - 16 }, '#32d582', 24, 4.2, 0.72, -22);
        queue(180, () => spawnParticles(selfCore, '#e7fff3', 14, 2.8, 0.45, -10));
        break;
      case 'shield':
        setPose(side, 'shield', 0.85);
        addRing(selfCore, '#4fb2ff', 48, 0.65);
        spawnParticles(selfCore, '#8bd1ff', 18, 3, 0.55, 0);
        break;
      case 'fly':
        setPose(side, 'fly', 0.9);
        addRing({ x: origin.x, y: origin.y - 104 }, '#64dcc8', 36, 0.58);
        spawnParticles({ x: origin.x, y: origin.y - 112 }, '#dffff8', 24, 3.2, 0.72, -26);
        break;
      case 'bolt':
        setPose(side, 'attack', 0.75);
        for (let i = 0; i < 6; i += 1) {
          queue(i * 38, () => spawnParticles({ x: hand.x + dir * i * 18, y: 18 + Math.random() * 22 }, '#fff6a6', 5, 4, 0.25, 14));
        }
        queue(170, () => {
          addRing(targetChest, '#f4d03f', 58, 0.55);
          spawnParticles(targetChest, '#f4d03f', 30, 7, 0.5, 16);
          flash('#fff36a', 0.26);
          shake(7);
        });
        break;
      case 'fire':
        setPose(side, 'attack', 0.72);
        addProjectile(hand, targetChest, '#ff6b32', 9, 0.34, '#ffb347');
        for (let i = 0; i < 7; i += 1) {
          queue(i * 35, () => {
            const x = hand.x + (targetChest.x - hand.x) * (i / 7);
            spawnParticles({ x, y: origin.y - 22 + Math.random() * 8 }, '#ff8a22', 5, 3.5, 0.32, 6);
          });
        }
        break;
      case 'dark':
        setPose(side, 'attack', 0.82);
        spawnParticles(selfCore, '#a66cff', 18, 3.5, 0.48, -4);
        queue(180, () => addProjectile(hand, targetChest, '#8e44ad', 13, 0.38, '#d5a4ff'));
        queue(460, () => {
          addRing({ x: targetChest.x, y: targetChest.y + 16 }, '#8e44ad', 72, 0.65);
          spawnParticles(targetChest, '#d8b7ff', 24, 7, 0.58, 10);
          shake(11);
          flash('#9b42ff', 0.24);
        });
        break;
      case 'pegasus':
        setPose(side, 'attack', 0.78);
        addProjectile({ x: hand.x, y: hand.y - 18 }, { x: targetChest.x, y: targetChest.y - 16 }, '#f1c40f', 11, 0.35, '#fff3a7');
        spawnParticles({ x: hand.x, y: hand.y - 18 }, '#fff3a7', 22, 4.4, 0.56, -2);
        break;
      case 'meteor':
        setPose(side, 'attack', 0.88);
        for (let i = 0; i < 3; i += 1) {
          queue(i * 90, () => addProjectile({ x: hand.x, y: hand.y - 8 + i * 8 }, { x: targetChest.x, y: targetChest.y - 8 + i * 8 }, '#f39c12', 8, 0.28, '#ffe28b'));
        }
        queue(430, () => {
          addRing(targetChest, '#f39c12', 58, 0.55);
          spawnParticles(targetChest, '#ffe28b', 34, 7, 0.58, 12);
          shake(8);
        });
        break;
      case 'ice':
        setPose(side, 'attack', 0.68);
        addProjectile(hand, targetChest, '#85c1e9', 7, 0.34, '#eaf8ff');
        spawnParticles(hand, '#eaf8ff', 16, 2.6, 0.48, -4);
        break;
      case 'wing':
        setPose(side, 'attack', 0.7);
        addProjectile({ x: hand.x, y: hand.y - 10 }, { x: targetChest.x, y: targetChest.y - 10 }, '#e67e22', 8, 0.3, '#ffd08a');
        spawnParticles({ x: hand.x, y: hand.y - 10 }, '#ffd08a', 18, 4.2, 0.5, 0);
        break;
      case 'icewing':
        setPose(side, 'attack', 0.82);
        addProjectile(hand, targetChest, '#bb8fce', 11, 0.36, '#dff7ff');
        spawnParticles(hand, '#85c1e9', 14, 3.2, 0.5, -4);
        spawnParticles(hand, '#e67e22', 14, 3.2, 0.5, -4);
        queue(380, () => {
          addRing(targetChest, '#bb8fce', 56, 0.58);
          shake(8);
        });
        break;
      case 'ult':
        setPose(side, 'attack', 0.95);
        spawnParticles(selfCore, '#e056a0', 34, 5.4, 0.62, -8);
        queue(160, () => addProjectile(hand, targetChest, '#e056a0', 15, 0.42, '#ffd1eb'));
        queue(520, () => {
          addRing(targetChest, '#e056a0', 82, 0.72);
          spawnParticles(targetChest, '#fff', 28, 8, 0.42, 8);
          spawnParticles(targetChest, '#e056a0', 42, 10, 0.72, 12);
          flash('#fff', 0.28);
          shake(14);
        });
        break;
      default:
        setPose(side, info.type === 'attack' ? 'attack' : 'idle', 0.65);
        addProjectile(hand, targetChest, '#5dade2', 8, 0.32, '#a8ddff');
        break;
    }
  }

  function drawBackground(ctx: CanvasRenderingContext2D, layout: ArenaLayout, now: number) {
    const bg = ctx.createLinearGradient(0, 0, 0, layout.height);
    bg.addColorStop(0, '#0c1730');
    bg.addColorStop(0.5, '#07101f');
    bg.addColorStop(1, '#170913');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, layout.width, layout.height);

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = 'rgba(214,177,94,0.12)';
    ctx.lineWidth = 1;
    for (let i = -1; i < 8; i += 1) {
      const y = layout.groundY + 8 + i * 12;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(layout.width * 0.5, y + 10, layout.width, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(214,177,94,0.08)';
    for (let i = 0; i < 28; i += 1) {
      const x = ((i * 53 + now * 12) % (layout.width + 80)) - 40;
      const y = 20 + ((i * 37) % Math.max(1, layout.height - 80));
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3) * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(0, layout.groundY + 62, layout.width, layout.height - layout.groundY);
  }

  function drawFighter(ctx: CanvasRenderingContext2D, side: Side, layout: ArenaLayout, now: number) {
    const state = fightersRef.current[side];
    const base = pointFor(layout, side);
    const face = side === 'player' ? 1 : -1;
    const glow = side === 'player' ? PLAYER_GLOW : ENEMY_GLOW;
    const enemyTint = side === 'player' ? '#66c8ff' : '#ff6d6d';
    const progress = phaseProgress(now, state.poseStart, state.poseEnd);
    const attackKick = state.pose === 'attack' ? Math.sin(Math.PI * progress) : 0;
    const chargePulse = state.pose === 'charge' ? 0.7 + Math.sin(now * 20) * 0.3 : 0;
    const flyLift = state.pose === 'fly' ? 24 + Math.sin(now * 12) * 4 : 0;
    const idle = Math.sin(now * 2.6 + (side === 'player' ? 0 : 0.8)) * 2;
    const hit = now < state.hitUntil;
    const dead = now < state.deadUntil;
    const localShake = hit ? Math.sin(now * 90) * 3 : 0;
    const x = base.x + face * attackKick * 20 + localShake;
    const groundY = base.y - flyLift + idle + (dead ? 8 : 0);
    const torsoY = groundY - 76;

    ctx.save();
    if (dead) {
      ctx.translate(x, groundY - 8);
      ctx.rotate(face * 0.26);
      ctx.translate(-x, -(groundY - 8));
    }

    const aura = ctx.createRadialGradient(x, torsoY, 8, x, torsoY, 80 + chargePulse * 18);
    aura.addColorStop(0, `${glow}44`);
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, torsoY, 82 + chargePulse * 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.beginPath();
    ctx.ellipse(base.x, base.y + 5, 34, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const fl = (value: number) => x + face * value;
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#0c0e13';
    ctx.beginPath();
    ctx.roundRect(fl(-15), groundY - 53, 12, 48, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(fl(5), groundY - 53, 12, 48, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10131a';
    ctx.beginPath();
    ctx.moveTo(fl(-19), groundY - 102);
    ctx.lineTo(fl(19), groundY - 102);
    ctx.lineTo(fl(15), groundY - 54);
    ctx.lineTo(fl(-15), groundY - 54);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#d6b15e';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(fl(-18), groundY - 59);
    ctx.lineTo(fl(18), groundY - 59);
    ctx.stroke();
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.5;

    const frontArm = state.pose === 'attack' ? -1.18 + progress * 0.2 : state.pose === 'shield' ? -0.62 : -0.24;
    const backArm = state.pose === 'shield' ? 0.35 : 0.42;
    drawArm(ctx, fl(14), groundY - 98, face, frontArm, glow, enemyTint, state.pose === 'attack');
    drawArm(ctx, fl(-14), groundY - 96, face, backArm, glow, enemyTint, false);

    ctx.fillStyle = '#090b10';
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.arc(x, groundY - 122, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = glow;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(x, groundY - 126, 18, 1.22, 1.92);
    ctx.stroke();

    ctx.fillStyle = '#050609';
    for (const spike of [
      { left: -16, tip: -11, top: -146, right: -6 },
      { left: -6, tip: 0, top: -151, right: 7 },
      { left: 5, tip: 12, top: -145, right: 17 },
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(fl(spike.left), groundY - 128);
      ctx.lineTo(fl(spike.tip), groundY + spike.top);
      ctx.lineTo(fl(spike.right), groundY - 128);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = '#fff';
    ctx.shadowColor = glow;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(fl(-6), groundY - 124, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fl(6), groundY - 124, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (state.pose === 'shield') {
      drawShield(ctx, x + face * 26, groundY - 88, glow, now);
    }
    if (hit) {
      ctx.fillStyle = `${glow}33`;
      ctx.beginPath();
      ctx.arc(x, torsoY, 54, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawArm(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    face: 1 | -1,
    rotation: number,
    glow: string,
    tint: string,
    punching: boolean,
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(face * rotation);
    ctx.fillStyle = '#11141b';
    ctx.strokeStyle = glow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 31, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#06070a';
    ctx.beginPath();
    ctx.arc(0, 34, punching ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (punching) {
      ctx.fillStyle = `${tint}66`;
      ctx.beginPath();
      ctx.arc(0, 34, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawShield(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, now: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(now * 1.6);
    ctx.strokeStyle = `${color}cc`;
    ctx.fillStyle = `${color}18`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const px = Math.cos(angle) * 32;
      const py = Math.sin(angle) * 32;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawRings(ctx: CanvasRenderingContext2D, now: number) {
    for (const ring of ringsRef.current) {
      const progress = phaseProgress(now, ring.start, ring.start + ring.duration);
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 4 * (1 - progress);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.size * (0.3 + progress * 1.4), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawProjectiles(ctx: CanvasRenderingContext2D, now: number) {
    for (const projectile of projectilesRef.current) {
      const progress = easeOut(phaseProgress(now, projectile.start, projectile.start + projectile.duration));
      const x = projectile.from.x + (projectile.to.x - projectile.from.x) * progress;
      const y = projectile.from.y + (projectile.to.y - projectile.from.y) * progress;

      for (let i = 0; i < 4; i += 1) {
        const back = clamp(progress - i * 0.07, 0, 1);
        const tx = projectile.from.x + (projectile.to.x - projectile.from.x) * back;
        const ty = projectile.from.y + (projectile.to.y - projectile.from.y) * back;
        ctx.globalAlpha = 0.22 * (1 - i * 0.14);
        ctx.fillStyle = projectile.trail;
        ctx.beginPath();
        ctx.arc(tx, ty, projectile.size * (1.8 - i * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(x, y, projectile.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.72;
      ctx.beginPath();
      ctx.arc(x, y, projectile.size * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function stepEffects(dt: number, now: number) {
    for (const particle of particlesRef.current) {
      particle.x += particle.vx * dt * 60;
      particle.y += particle.vy * dt * 60;
      particle.vy += particle.gravity * dt;
      particle.life -= dt;
    }
    particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0);

    for (const projectile of projectilesRef.current) {
      if (!projectile.impacted && now >= projectile.start + projectile.duration) {
        projectile.impacted = true;
        addRing(projectile.to, projectile.color, 38, 0.42);
        spawnParticles(projectile.to, projectile.color, 16, 5, 0.42, 10);
      }
    }
    projectilesRef.current = projectilesRef.current.filter((projectile) => now < projectile.start + projectile.duration + 0.02);
    ringsRef.current = ringsRef.current.filter((ring) => now < ring.start + ring.duration);

    const motion = motionRef.current;
    motion.shake *= 0.84;
    if (motion.shake < 0.05) motion.shake = 0;
    motion.flashAlpha *= 0.86;
    if (motion.flashAlpha < 0.004) motion.flashAlpha = 0;

    for (const fighter of Object.values(fightersRef.current)) {
      if (fighter.pose !== 'idle' && now >= fighter.poseEnd) fighter.pose = 'idle';
    }
  }

  function render(ctx: CanvasRenderingContext2D) {
    const { width, height } = sizeRef.current;
    const now = motionRef.current.time;
    const layout = getLayout(width, height);
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, layout, now);

    const sx = (Math.random() - 0.5) * motionRef.current.shake * 2;
    const sy = (Math.random() - 0.5) * motionRef.current.shake * 2;
    ctx.save();
    ctx.translate(sx, sy);
    drawRings(ctx, now);
    drawFighter(ctx, 'player', layout, now);
    drawFighter(ctx, 'computer', layout, now);
    drawProjectiles(ctx, now);

    for (const particle of particlesRef.current) {
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    if (motionRef.current.flashAlpha > 0) {
      ctx.fillStyle = motionRef.current.flashColor;
      ctx.globalAlpha = motionRef.current.flashAlpha;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
    }
  }

  useEffect(() => {
    const canvasNode = canvasRef.current;
    const wrapNode = wrapRef.current;
    if (!canvasNode || !wrapNode) return;
    const context = canvasNode.getContext('2d');
    if (!context) return;

    const resize = () => {
      const rect = wrapNode.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasNode.width = Math.max(1, Math.floor(rect.width * dpr));
      canvasNode.height = Math.max(1, Math.floor(rect.height * dpr));
      canvasNode.style.width = `${rect.width}px`;
      canvasNode.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width: rect.width, height: rect.height };
    };

    const loop = (timestamp: number) => {
      const seconds = timestamp / 1000;
      const motion = motionRef.current;
      if (!motion.lastFrame) motion.lastFrame = seconds;
      const dt = Math.min(seconds - motion.lastFrame, 0.1);
      motion.lastFrame = seconds;
      motion.time = seconds;
      stepEffects(dt, seconds);
      render(context);
      frameRef.current = window.requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frameRef.current);
      clearTimers();
    };
  }, []);

  useEffect(() => {
    resetScene();
  }, [resetId]);

  useEffect(() => {
    if (!animationEvent) return;
    if (lastAnimationIdRef.current === animationEvent.id) return;
    lastAnimationIdRef.current = animationEvent.id;

    const pInfo: MoveInfo | undefined = ALL_MOVES[animationEvent.playerMove];
    const cInfo: MoveInfo | undefined = ALL_MOVES[animationEvent.computerMove];
    if (!pInfo || !cInfo) return;

    clearEffects();
    const triggerMove = (side: Side, move: string, info: MoveInfo, canAttack: boolean) => {
      if (info.type === 'charge') castSkill('苍心', side);
      else if (info.type === 'shield') castSkill('护盾', side);
      else if (info.type === 'flyshield') castSkill('飞飞', side);
      else if (canAttack) castSkill(move, side);
    };

    triggerMove('player', animationEvent.playerMove, pInfo, !animationEvent.result.playerDefeated || animationEvent.result.computerDefeated);
    triggerMove('computer', animationEvent.computerMove, cInfo, !animationEvent.result.computerDefeated || animationEvent.result.playerDefeated);

    queue(400, () => {
      const now = motionRef.current.time;
      if (animationEvent.result.playerDefeated) {
        fightersRef.current.player.hitUntil = now + 0.52;
        fightersRef.current.player.deadUntil = now + 1.15;
        shake(13);
        flash('#f02424', 0.26);
      }
      if (animationEvent.result.computerDefeated) {
        fightersRef.current.computer.hitUntil = now + 0.52;
        fightersRef.current.computer.deadUntil = now + 1.15;
        shake(13);
        flash('#ffffff', 0.28);
      }
    });

    queue(500, () => {
      setResultPop({
        text: animationEvent.result.description,
        tone: animationEvent.result.playerDefeated ? 'lose' : animationEvent.result.computerDefeated ? 'win' : 'tie',
      });
    });
    queue(1900, () => setResultPop(null));
  }, [animationEvent]);

  return (
    <div className="relative flex min-h-[280px] flex-1 bg-[#070A13] p-2">
      <div className="pointer-events-none absolute inset-x-4 top-2 z-10 h-px bg-gradient-to-r from-transparent via-[#D6B76A]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-4 bottom-2 z-10 h-px bg-gradient-to-r from-transparent via-[#D6B76A]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-y-5 left-2 z-10 w-px bg-gradient-to-b from-transparent via-[#D6B76A]/25 to-transparent" />
      <div className="pointer-events-none absolute inset-y-5 right-2 z-10 w-px bg-gradient-to-b from-transparent via-[#D6B76A]/25 to-transparent" />
      <div
        ref={wrapRef}
        className="relative flex-1 overflow-hidden rounded-xl border border-[#D6B76A]/25 bg-[#0E1022] shadow-[inset_0_0_32px_rgba(75,163,255,0.08),0_0_28px_rgba(0,0,0,0.45)]"
      >
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(214,183,106,0.08),transparent_16%,transparent_74%,rgba(75,163,255,0.08))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] z-[1] h-px bg-gradient-to-r from-transparent via-[#4BA3FF]/35 to-transparent" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {resultPop && (
        <div
          className={[
            'pointer-events-none absolute left-1/2 top-[27%] z-10 w-[90%] -translate-x-1/2 text-center text-sm font-black drop-shadow-[0_0_16px_rgba(0,0,0,0.9)]',
            resultPop.tone === 'win' ? 'text-emerald-300' : resultPop.tone === 'lose' ? 'text-red-300' : 'text-amber-100',
          ].join(' ')}
        >
          {resultPop.text}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-4 text-[11px] font-bold tracking-normal text-stone-500">
        <span>PLAYER</span>
        <span>ENEMY</span>
      </div>
      </div>
    </div>
  );
}
