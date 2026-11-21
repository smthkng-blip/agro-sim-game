export type ParticleKind = 'dirt' | 'water' | 'ripple' | 'leaf' | 'coin' | 'heart';

export interface WorldParticle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  age: number;
  maxAge: number;
  rotation: number;
  vRot: number;
}

export class ParticleSystem {
  private particles: WorldParticle[] = [];

  public spawnDirtPuff(x: number, y: number): void {
    const colors = ['#785233', '#92623c', '#5c3c22', '#b07d4f'];
    for (let i = 0; i < 12; i++) {
      const angle = -Math.PI * Math.random();
      const speed = 24 + Math.random() * 48;
      this.particles.push({
        kind: 'dirt',
        x: x + (Math.random() * 14 - 7),
        y: y + (Math.random() * 6 - 3),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 18,
        size: 2.5 + Math.random() * 3,
        color: colors[i % colors.length],
        age: 0,
        maxAge: 0.55 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 6,
      });
    }
  }

  public spawnWaterSplash(x: number, y: number): void {
    this.particles.push({
      kind: 'ripple',
      x,
      y,
      vx: 0,
      vy: 0,
      size: 6,
      color: '#7dd3fc',
      age: 0,
      maxAge: 0.75,
      rotation: 0,
      vRot: 0,
    });
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
      const speed = 34 + Math.random() * 44;
      this.particles.push({
        kind: 'water',
        x: x + (Math.random() * 10 - 5),
        y: y - 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 22,
        size: 2.2 + Math.random() * 2,
        color: i % 2 === 0 ? '#38bdf8' : '#e0f2fe',
        age: 0,
        maxAge: 0.52 + Math.random() * 0.25,
        rotation: 0,
        vRot: 0,
      });
    }
  }

  public spawnHarvestBurst(x: number, y: number, includeCoins = false): void {
    const leafColors = ['#facc15', '#4ade80', '#fde047', '#34d399', '#fb923c'];
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI * Math.random();
      const speed = 28 + Math.random() * 62;
      this.particles.push({
        kind: 'leaf',
        x,
        y: y - 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 3.5 + Math.random() * 2.5,
        color: leafColors[i % leafColors.length],
        age: 0,
        maxAge: 0.85 + Math.random() * 0.35,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 9,
      });
    }
    if (includeCoins) {
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          kind: 'coin',
          x: x + (Math.random() * 18 - 9),
          y: y - 10,
          vx: (Math.random() - 0.5) * 32,
          vy: -78 - Math.random() * 34,
          size: 5,
          color: '#fbbf24',
          age: 0,
          maxAge: 0.95,
          rotation: 0,
          vRot: 8,
        });
      }
    }
  }

  public spawnHeartBurst(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        kind: 'heart',
        x: x + (Math.random() * 20 - 10),
        y: y - 10,
        vx: (Math.random() - 0.5) * 18,
        vy: -32 - Math.random() * 24,
        size: 6 + Math.random() * 2.5,
        color: i % 2 === 0 ? '#f43f5e' : '#fb7185',
        age: 0,
        maxAge: 1.05,
        rotation: 0,
        vRot: 0,
      });
    }
  }

  public update(dt: number): void {
    const gravity = 155;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      if (p.age >= p.maxAge) {
        this.particles.splice(i, 1);
        continue;
      }
      if (p.kind === 'ripple') {
        p.size += dt * 36;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === 'dirt' || p.kind === 'water' || p.kind === 'coin') {
          p.vy += gravity * dt;
        } else if (p.kind === 'leaf') {
          p.vy += 65 * dt;
          p.vx *= 0.985;
        }
        p.rotation += p.vRot * dt;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = Math.max(0, 1 - p.age / p.maxAge);
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === 'ripple') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.kind === 'dirt' || p.kind === 'water') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'leaf') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'coin') {
        ctx.translate(p.x, p.y);
        const w = Math.max(1.5, Math.abs(Math.cos(p.rotation)) * p.size);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, 0, w, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.55, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'heart') {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        const s = p.size * 0.55;
        ctx.beginPath();
        ctx.moveTo(0, s);
        ctx.bezierCurveTo(-s * 1.6, -s * 0.2, -s * 0.9, -s * 1.4, 0, -s * 0.45);
        ctx.bezierCurveTo(s * 0.9, -s * 1.4, s * 1.6, -s * 0.2, 0, s);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
