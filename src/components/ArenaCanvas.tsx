import { useEffect, useRef, useState } from 'react';
import { ALL_MOVES } from '../game/constants';
import type { MoveTable, TurnResult } from '../game/types';

interface ArenaCanvasProps {
  playerMoves: MoveTable;
  computerMoves: MoveTable;
  animationEvent: { id: number; playerMove: string; computerMove: string; result: TurnResult } | null;
  resetId: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  l: number;
  ml: number;
  c: string;
  s: number;
}

interface Projectile {
  x: number;
  y: number;
  tx: number;
  ty: number;
  c: string;
  s: number;
  tr: string;
  p: number;
  sp: number;
}

interface Impact {
  x: number;
  y: number;
  c: string;
  s: number;
  l: number;
  ml: number;
}

interface FighterAnim {
  x: number;
  y: number;
  st: { punching?: boolean; hit?: boolean; dead?: boolean };
}

export function ArenaCanvas({ playerMoves, computerMoves, animationEvent, resetId }: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const skillTimersRef = useRef<number[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const impactsRef = useRef<Impact[]>([]);
  const pAnimRef = useRef<FighterAnim>({ x: 0, y: 0, st: {} });
  const eAnimRef = useRef<FighterAnim>({ x: 0, y: 0, st: {} });
  const sizeRef = useRef({ w: 0, h: 0 });
  const motionRef = useRef({ shake: 0, flashA: 0, flashC: '', animT: 0, lastT: 0 });
  const [resultPop, setResultPop] = useState<{ text: string; tone: 'win' | 'lose' | 'tie' } | null>(null);

  useEffect(() => {
    const canvasNode = canvasRef.current;
    const wrapNode = wrapRef.current;
    if (!canvasNode || !wrapNode) return;
    const context = canvasNode.getContext('2d');
    if (!context) return;
    const canvas = canvasNode;
    const wrap = wrapNode;
    const ctx = context;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      resetChars();
    }

    function resetChars() {
      const { w, h } = sizeRef.current;
      pAnimRef.current = { x: w * 0.2, y: h * 0.58, st: {} };
      eAnimRef.current = { x: w * 0.8, y: h * 0.58, st: {} };
    }

    function drawFighter(cx: number, cy: number, face: 1 | -1, glow: string, st: FighterAnim['st']) {
      const fl = (x: number) => cx + face * x;
      ctx.save();
      const aura = ctx.createRadialGradient(cx, cy - 8, 8, cx, cy - 8, 72);
      aura.addColorStop(0, glow.replace('rgb', 'rgba').replace(')', ',0.22)'));
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 58, 32, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = glow;
      ctx.lineWidth = 1.4;
      ctx.fillStyle = '#111318';
      ctx.beginPath();
      ctx.roundRect(fl(-17), cy - 8, 34, 38, 8);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(214,177,94,0.95)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fl(-18), cy + 22);
      ctx.lineTo(fl(18), cy + 22);
      ctx.stroke();

      ctx.strokeStyle = glow;
      ctx.lineWidth = 1.5;
      const armRot = st.punching ? face * -1.05 : face * -0.25;
      ctx.save();
      ctx.translate(fl(13), cy - 4);
      ctx.rotate(armRot);
      ctx.fillStyle = '#17191f';
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 27, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      const fistX = fl(13) + face * Math.sin(armRot) * 27;
      const fistY = cy - 4 + Math.cos(armRot) * 27;
      ctx.fillStyle = '#08090d';
      ctx.beginPath();
      ctx.arc(fistX, fistY, st.punching ? 9 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(fl(-14), cy - 6);
      ctx.rotate(face * 0.4);
      ctx.fillStyle = '#14161c';
      ctx.beginPath();
      ctx.roundRect(-5, 0, 10, 24, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#15171d';
      ctx.beginPath();
      ctx.roundRect(fl(-12), cy + 28, 10, 30, 5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(fl(6), cy + 28, 10, 30, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0d0f14';
      ctx.strokeStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy - 28, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = glow;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy - 32, 17.5, 1.25, 1.9);
      ctx.stroke();
      ctx.fillStyle = '#050609';
      for (const [a, b, c] of [
        [-15, -35, -8],
        [-2, -38, 2],
        [8, -36, 15],
      ]) {
        ctx.beginPath();
        ctx.moveTo(fl(a), cy - 36);
        ctx.lineTo(fl(b), cy - 52);
        ctx.lineTo(fl(c), cy - 36);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = '#fff';
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(fl(-6), cy - 30, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(fl(6), cy - 30, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (st.hit) {
        ctx.fillStyle = glow.replace('rgb', 'rgba').replace(')', ',0.24)');
        ctx.beginPath();
        ctx.arc(cx, cy - 8, 50, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function render() {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#111a31');
      bg.addColorStop(0.5, '#07101f');
      bg.addColorStop(1, '#160913');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(214,177,94,0.06)';
      for (let i = 0; i < 22; i++) {
        const x = ((i * 47 + motionRef.current.animT * 9) % (w + 60)) - 30;
        const y = 18 + ((i * 31) % Math.max(1, h - 52));
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + (i % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(214,177,94,0.08)';
      ctx.fillRect(0, h * 0.83, w, 1.5);

      const shake = motionRef.current.shake;
      const sx = (Math.random() - 0.5) * shake * 2;
      const sy = (Math.random() - 0.5) * shake * 2;
      ctx.save();
      ctx.translate(sx, sy);
      drawFighter(pAnimRef.current.x, pAnimRef.current.y, 1, 'rgb(80,180,255)', pAnimRef.current.st);
      drawFighter(eAnimRef.current.x, eAnimRef.current.y, -1, 'rgb(255,90,90)', eAnimRef.current.st);

      for (const p of particlesRef.current) {
        const a = p.l / p.ml;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * a, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const p of projectilesRef.current) {
        const px = p.x + (p.tx - p.x) * p.p;
        const py = p.y + (p.ty - p.y) * p.p;
        for (let i = 0; i < 4; i += 1) {
          const tp = p.p - i * 0.06;
          if (tp < 0) continue;
          ctx.fillStyle = p.tr;
          ctx.globalAlpha = (1 - tp) * 0.25;
          ctx.beginPath();
          ctx.arc(p.x + (p.tx - p.x) * tp, p.y + (p.ty - p.y) * tp, p.s * (0.4 + i * 0.15), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(px, py, p.s * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(px, py, p.s * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const impact of impactsRef.current) {
        const progress = 1 - impact.l / impact.ml;
        const radius = impact.s * (1 + progress * 1.8);
        ctx.globalAlpha = progress < 0.2 ? progress / 0.2 : 1;
        ctx.strokeStyle = impact.c;
        ctx.lineWidth = 3.5 * (1 - progress);
        ctx.beginPath();
        ctx.arc(impact.x, impact.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (motionRef.current.flashA > 0) {
        ctx.fillStyle = motionRef.current.flashC;
        ctx.globalAlpha = motionRef.current.flashA;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    function loop(t: number) {
      const m = motionRef.current;
      if (!m.lastT) m.lastT = t;
      const dt = Math.min((t - m.lastT) / 1000, 0.1);
      m.lastT = t;
      m.animT += dt;
      pAnimRef.current.y += Math.sin(m.animT * 2.5) * 0.2;
      eAnimRef.current.y += Math.sin(m.animT * 2.5 + 1) * 0.2;
      for (const p of particlesRef.current) {
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.l -= dt;
        p.vy += dt * 15;
      }
      particlesRef.current = particlesRef.current.filter((p) => p.l > 0);
      for (const p of projectilesRef.current) {
        p.p += p.sp * dt * 60;
        if (p.p >= 1) {
          impact(p.tx, p.ty, p.c, 38);
          spark(p.tx, p.ty, p.c, 14, 5, 0.45);
        }
      }
      projectilesRef.current = projectilesRef.current.filter((p) => p.p < 1);
      for (const i of impactsRef.current) i.l -= dt;
      impactsRef.current = impactsRef.current.filter((i) => i.l > 0);
      m.shake *= 0.84;
      if (m.shake < 0.08) m.shake = 0;
      m.flashA *= 0.88;
      if (m.flashA < 0.005) m.flashA = 0;
      render();
      frameRef.current = window.requestAnimationFrame(loop);
    }

    function spark(x: number, y: number, color: string, count: number, speed: number, life: number) {
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const s = (Math.random() * speed || 3) + 1;
        particlesRef.current.push({ x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, l: life, ml: life, c: color, s: Math.random() * 3 + 1.5 });
      }
    }

    function projectile(x: number, y: number, tx: number, ty: number, color: string, size = 6, trail = color) {
      projectilesRef.current.push({ x, y, tx, ty, c: color, s: size, tr: trail, p: 0, sp: 0.05 + Math.random() * 0.02 });
    }

    function impact(x: number, y: number, color: string, size = 40) {
      impactsRef.current.push({ x, y, c: color, s: size, l: 0.4, ml: 0.4 });
    }

    function shake(amount: number) {
      motionRef.current.shake = Math.max(motionRef.current.shake, amount);
    }

    function flash(color: string, alpha = 0.4) {
      motionRef.current.flashA = alpha;
      motionRef.current.flashC = color;
    }

    resize();
    window.addEventListener('resize', resize);
    frameRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frameRef.current);
      for (const timer of skillTimersRef.current) window.clearTimeout(timer);
      skillTimersRef.current = [];
    };
  }, []);

  useEffect(() => {
    for (const timer of skillTimersRef.current) window.clearTimeout(timer);
    skillTimersRef.current = [];
    particlesRef.current = [];
    projectilesRef.current = [];
    impactsRef.current = [];
    motionRef.current.shake = 0;
    motionRef.current.flashA = 0;
    const { w, h } = sizeRef.current;
    pAnimRef.current = { x: w * 0.2, y: h * 0.58, st: {} };
    eAnimRef.current = { x: w * 0.8, y: h * 0.58, st: {} };
    setResultPop(null);
  }, [resetId]);

  useEffect(() => {
    if (!animationEvent) return;
    const pInfo = playerMoves[animationEvent.playerMove] ?? ALL_MOVES[animationEvent.playerMove];
    const cInfo = computerMoves[animationEvent.computerMove] ?? ALL_MOVES[animationEvent.computerMove];
    if (!pInfo || !cInfo) return;

    const clearFx = () => {
      for (const timer of skillTimersRef.current) window.clearTimeout(timer);
      skillTimersRef.current = [];
      particlesRef.current = [];
      projectilesRef.current = [];
      impactsRef.current = [];
      motionRef.current.shake = 0;
      motionRef.current.flashA = 0;
    };
    const queueFx = (delay: number, fn: () => void) => {
      const timer = window.setTimeout(fn, delay);
      skillTimersRef.current.push(timer);
    };
    const sp = (x: number, y: number, c: string, n: number, speed: number, life: number) => {
      for (let i = 0; i < n; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const s = (Math.random() * speed || 3) + 1;
        particlesRef.current.push({ x, y, vx: Math.cos(angle) * s, vy: Math.sin(angle) * s, l: life, ml: life, c, s: Math.random() * 3 + 1.5 });
      }
    };
    const pj = (x: number, y: number, tx: number, ty: number, c: string, size = 6, trail = c) => {
      projectilesRef.current.push({ x, y, tx, ty, c, s: size, tr: trail, p: 0, sp: 0.05 + Math.random() * 0.02 });
    };
    const imp = (x: number, y: number, c: string, size = 40) => impactsRef.current.push({ x, y, c, s: size, l: 0.4, ml: 0.4 });
    const sh = (amount: number) => {
      motionRef.current.shake = Math.max(motionRef.current.shake, amount);
    };
    const fl = (color: string, alpha = 0.4) => {
      motionRef.current.flashA = alpha;
      motionRef.current.flashC = color;
    };
    const trigger = (move: string, fromX: number, fromY: number, toX: number, toY: number) => {
      const info = ALL_MOVES[move];
      if (!info) return;
      const dir = fromX < toX ? 1 : -1;
      switch (info.anim) {
        case 'charge':
          queueFx(0, () => { for (let i = 0; i < 15; i += 1) queueFx(i * 30, () => sp(fromX + Math.cos(i * 0.42) * 15, fromY + Math.sin(i * 0.42) * 10 - i * 3, '#2ecc71', 2, 3, 0.5)); });
          queueFx(200, () => { imp(fromX, fromY - 10, '#2ecc71', 30); sp(fromX, fromY, '#2ecc71', 20, 5, 0.8); });
          break;
        case 'shield':
          queueFx(0, () => { for (let i = 0; i < 6; i += 1) queueFx(i * 25, () => sp(fromX + Math.cos((i * Math.PI) / 3) * 25, fromY + Math.sin((i * Math.PI) / 3) * 20 - 10, '#3498db', 3, 2, 0.4)); });
          queueFx(150, () => imp(fromX, fromY - 10, '#3498db', 35));
          break;
        case 'wave':
          queueFx(80, () => { for (let i = 0; i < 3; i += 1) queueFx(i * 60, () => imp(fromX + (toX - fromX) * (i / 3), fromY - 5, '#5dade2', 20 + i * 8)); });
          queueFx(100, () => pj(fromX + dir * 20, fromY - 5, toX, toY - 5, '#5dade2', 8, '#85c1e9'));
          break;
        case 'bolt':
          queueFx(0, () => { for (let i = 0; i < 6; i += 1) queueFx(i * 40, () => { const lx = fromX + (toX - fromX) * (i / 6); sp(lx, Math.random() * 20 + 10, '#f4d03f', 3, 4, 0.3); sp(lx, Math.random() * 20 + 10, '#fff', 2, 5, 0.2); }); });
          queueFx(200, () => { fl('#ff0', 0.35); sh(8); imp(toX, toY, '#f4d03f', 50); sp(toX, toY, '#f4d03f', 25, 7, 0.6); });
          break;
        case 'fire':
          queueFx(0, () => { for (let i = 0; i < 8; i += 1) queueFx(i * 30, () => { sp(fromX + (toX - fromX) * (i / 8), fromY + 15 + Math.random() * 5, '#e74c3c', 2, 2, 0.4); sp(fromX + (toX - fromX) * (i / 8), fromY + 15, '#f90', 2, 3, 0.3); }); });
          queueFx(200, () => { pj(fromX + dir * 20, fromY - 5, toX, toY - 5, '#e74c3c', 9, '#f90'); fl('#f60', 0.2); sh(6); });
          queueFx(400, () => { imp(toX, toY, '#e74c3c', 45); sp(toX, toY, '#f90', 20, 6, 0.5); });
          break;
        case 'dark':
          queueFx(0, () => { for (let i = 0; i < 5; i += 1) queueFx(i * 40, () => sp(fromX + Math.cos(i * 0.6) * 10, fromY + Math.sin(i * 0.6) * 8, '#8e44ad', 2, 3, 0.4)); });
          queueFx(250, () => { pj(fromX + dir * 20, fromY - 10, toX, toY, '#8e44ad', 12, '#bb8fce'); sh(12); fl('#a0f', 0.3); });
          queueFx(450, () => { imp(toX, toY + 10, '#8e44ad', 60); sp(toX, toY + 5, '#8e44ad', 30, 8, 0.7); sp(toX, toY, '#fff', 10, 4, 0.3); });
          break;
        case 'pegasus':
          queueFx(0, () => { for (let i = 0; i < 12; i += 1) queueFx(i * 25, () => { sp(fromX + Math.cos(i * 0.5) * 8, fromY - 15 + Math.sin(i * 0.5) * 8, '#f1c40f', 2, 3, 0.5); sp(fromX - Math.cos(i * 0.5) * 8, fromY - 15 - Math.sin(i * 0.5) * 8, '#fff', 2, 2, 0.3); }); });
          queueFx(150, () => { pj(fromX + dir * 20, fromY - 20, toX, toY - 20, '#f1c40f', 10, '#f9e79f'); fl('#ff0', 0.15); });
          queueFx(350, () => { imp(toX, toY - 15, '#f1c40f', 45); sp(toX, toY - 15, '#f1c40f', 20, 6, 0.6); });
          break;
        case 'meteor':
          queueFx(0, () => { for (let i = 0; i < 10; i += 1) queueFx(i * 35, () => { const a = i * 0.65; const r = 12 + i * 2; sp(fromX + Math.cos(a) * r, fromY + Math.sin(a) * r - 10, '#f39c12', 3, 3, 0.4); sp(fromX + Math.cos(a + 1) * r * 0.8, fromY + Math.sin(a + 1) * r * 0.8 - 10, '#fff', 2, 2, 0.25); }); });
          queueFx(200, () => { for (let i = 0; i < 3; i += 1) queueFx(i * 80, () => pj(fromX + dir * 15, fromY - 10 + i * 5, toX, toY - 10 + i * 5, '#f39c12', 7, '#f1c40f')); });
          queueFx(450, () => { imp(toX, toY, '#f39c12', 50); sp(toX, toY, '#f39c12', 35, 8, 0.7); sh(10); fl('#fa0', 0.25); });
          break;
        case 'ice':
          queueFx(0, () => { for (let i = 0; i < 6; i += 1) queueFx(i * 30, () => { sp(fromX + dir * 15 + Math.random() * 6, fromY - 5 + Math.random() * 6, '#85c1e9', 2, 2, 0.5); sp(fromX + dir * 15, fromY - 5, '#d6eaf8', 2, 1, 0.3); }); });
          queueFx(120, () => pj(fromX + dir * 15, fromY, toX, toY, '#85c1e9', 6, '#d6eaf8'));
          queueFx(300, () => { imp(toX, toY, '#85c1e9', 35); sp(toX, toY, '#d6eaf8', 15, 5, 0.5); });
          break;
        case 'wing':
          queueFx(0, () => { for (let i = 0; i < 8; i += 1) queueFx(i * 30, () => sp(fromX + dir * 20 + Math.cos(Math.PI * (i / 8)) * 15, fromY - 10 + Math.sin(Math.PI * (i / 8)) * 10, '#e67e22', 2, 3, 0.45)); });
          queueFx(150, () => { pj(fromX + dir * 20, fromY - 15, toX, toY - 15, '#e67e22', 8, '#f5b041'); fl('#f80', 0.12); });
          queueFx(350, () => { imp(toX, toY - 10, '#e67e22', 40); sp(toX, toY - 10, '#f5b041', 18, 5, 0.55); });
          break;
        case 'icewing':
          queueFx(0, () => { for (let i = 0; i < 10; i += 1) queueFx(i * 25, () => { sp(fromX + Math.cos(i) * 12, fromY - 10 + Math.sin(i) * 8, '#85c1e9', 2, 2, 0.4); sp(fromX + Math.cos(i + 0.5) * 15, fromY - 10 + Math.sin(i + 0.5) * 10, '#e67e22', 2, 2, 0.4); }); });
          queueFx(180, () => { pj(fromX + dir * 20, fromY - 10, toX, toY - 10, '#bb8fce', 10, '#d7bde2'); fl('#c8f', 0.15); sh(8); });
          queueFx(400, () => { imp(toX, toY, '#bb8fce', 48); sp(toX, toY, '#85c1e9', 15, 5, 0.5); sp(toX, toY, '#e67e22', 15, 5, 0.5); });
          break;
        case 'ult':
          queueFx(0, () => { for (let i = 0; i < 15; i += 1) queueFx(i * 20, () => { sp(fromX + Math.cos(i * 0.4) * 20, fromY + Math.sin(i * 0.4) * 15, '#e056a0', 3, 4, 0.5); sp(fromX + Math.cos(i * 0.4) * 20, fromY + Math.sin(i * 0.4) * 15, '#fff', 2, 3, 0.3); }); });
          queueFx(200, () => { pj(fromX + dir * 20, fromY - 10, toX, toY - 10, '#e056a0', 14, '#f0a0d0'); fl('#f0f', 0.35); sh(15); });
          queueFx(500, () => { imp(toX, toY, '#e056a0', 70); sp(toX, toY, '#e056a0', 40, 10, 0.8); sp(toX, toY, '#fff', 20, 6, 0.4); fl('#fff', 0.3); });
          break;
        case 'fly':
          queueFx(0, () => { for (let i = 0; i < 12; i += 1) queueFx(i * 35, () => { sp(fromX + (Math.random() - 0.5) * 30, fromY - 20 - Math.random() * 20, '#64dcc8', 3, 2, 0.6); sp(fromX + (Math.random() - 0.5) * 20, fromY - 20, '#fff', 2, 1, 0.4); }); });
          queueFx(150, () => imp(fromX, fromY - 25, '#64dcc8', 25));
          break;
      }
    };

    clearFx();
    pAnimRef.current.st = {};
    eAnimRef.current.st = {};
    const p = pAnimRef.current;
    const e = eAnimRef.current;
    if (pInfo.type === 'charge') trigger('苍心', p.x, p.y, 0, 0);
    else if (pInfo.type === 'shield') trigger('护盾', p.x, p.y, 0, 0);
    else if (pInfo.type === 'flyshield') trigger('飞飞', p.x, p.y, 0, 0);
    else if (!animationEvent.result.playerDefeated || animationEvent.result.computerDefeated) {
      p.st.punching = true;
      trigger(animationEvent.playerMove, p.x, p.y - 5, e.x, e.y - 5);
    }

    if (cInfo.type === 'charge') trigger('苍心', e.x, e.y, 0, 0);
    else if (cInfo.type === 'shield') trigger('护盾', e.x, e.y, 0, 0);
    else if (cInfo.type === 'flyshield') trigger('飞飞', e.x, e.y, 0, 0);
    else if (!animationEvent.result.computerDefeated || animationEvent.result.playerDefeated) {
      e.st.punching = true;
      trigger(animationEvent.computerMove, e.x, e.y - 5, p.x, p.y - 5);
    }

    queueFx(400, () => {
      if (animationEvent.result.playerDefeated) {
        p.st.hit = true;
        p.st.dead = true;
        sh(14);
        fl('#f00', 0.3);
      }
      if (animationEvent.result.computerDefeated) {
        e.st.hit = true;
        e.st.dead = true;
        sh(14);
        fl('#fff', 0.35);
      }
    });
    queueFx(900, () => {
      p.st = { ...p.st, hit: false, punching: false };
      e.st = { ...e.st, hit: false, punching: false };
    });
    queueFx(500, () => {
      setResultPop({
        text: animationEvent.result.description,
        tone: animationEvent.result.playerDefeated ? 'lose' : animationEvent.result.computerDefeated ? 'win' : 'tie',
      });
      queueFx(1400, () => setResultPop(null));
    });
  }, [animationEvent, computerMoves, playerMoves]);

  return (
    <div ref={wrapRef} className="relative min-h-[280px] flex-1 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {resultPop && (
        <div
          className={[
            'pointer-events-none absolute left-1/2 top-[28%] z-10 w-[90%] -translate-x-1/2 text-center text-sm font-black drop-shadow-[0_0_16px_rgba(0,0,0,0.9)]',
            resultPop.tone === 'win' ? 'text-emerald-300' : resultPop.tone === 'lose' ? 'text-red-300' : 'text-amber-100',
          ].join(' ')}
        >
          {resultPop.text}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-between px-3 text-[11px] text-stone-400">
        <span>PLAYER</span>
        <span>ENEMY</span>
      </div>
    </div>
  );
}
