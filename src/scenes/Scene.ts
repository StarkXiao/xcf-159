import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../game/config';

export abstract class Scene extends PIXI.Container {
  protected app: PIXI.Application;
  protected isActive: boolean = false;
  protected particles: PIXI.Graphics[] = [];

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
    this.width = GAME_CONFIG.DESIGN_WIDTH;
    this.height = GAME_CONFIG.DESIGN_HEIGHT;
  }

  abstract init(): void;
  abstract update(delta: number): void;
  abstract destroy(): void;

  onEnter(): void {
    this.isActive = true;
    this.visible = true;
  }

  onExit(): void {
    this.isActive = false;
    this.visible = false;
  }

  protected createParticles(count: number): void {
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(GAME_CONFIG.COLORS.AMBER, 0.4 + Math.random() * 0.4);
      particle.drawCircle(0, 0, 2 + Math.random() * 3);
      particle.endFill();
      particle.x = Math.random() * GAME_CONFIG.DESIGN_WIDTH;
      particle.y = Math.random() * GAME_CONFIG.DESIGN_HEIGHT;
      particle.alpha = 0.3 + Math.random() * 0.5;
      (particle as any).speedY = 0.2 + Math.random() * 0.5;
      (particle as any).speedX = -0.1 + Math.random() * 0.2;
      this.particles.push(particle);
      this.addChild(particle);
    }
  }

  protected updateParticles(): void {
    this.particles.forEach(p => {
      p.y -= (p as any).speedY;
      p.x += (p as any).speedX;
      p.alpha = 0.3 + Math.sin(Date.now() / 500) * 0.2;

      if (p.y < -10) {
        p.y = GAME_CONFIG.DESIGN_HEIGHT + 10;
        p.x = Math.random() * GAME_CONFIG.DESIGN_WIDTH;
      }
      if (p.x < -10) p.x = GAME_CONFIG.DESIGN_WIDTH + 10;
      if (p.x > GAME_CONFIG.DESIGN_WIDTH + 10) p.x = -10;
    });
  }

  protected clearParticles(): void {
    this.particles.forEach(p => {
      this.removeChild(p);
      p.destroy();
    });
    this.particles = [];
  }

  protected createBackground(color: number): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();

    for (let i = 0; i < 8; i++) {
      const alpha = 0.05 + Math.random() * 0.1;
      bg.beginFill(GAME_CONFIG.COLORS.AMBER, alpha);
      bg.drawCircle(
        GAME_CONFIG.DESIGN_WIDTH * (0.2 + Math.random() * 0.6),
        GAME_CONFIG.DESIGN_HEIGHT * (0.2 + Math.random() * 0.6),
        100 + Math.random() * 200
      );
      bg.endFill();
    }

    const grain = new PIXI.Graphics();
    for (let i = 0; i < 500; i++) {
      const gray = Math.random() * 30;
      grain.beginFill(gray, 0.03);
      grain.drawRect(
        Math.random() * GAME_CONFIG.DESIGN_WIDTH,
        Math.random() * GAME_CONFIG.DESIGN_HEIGHT,
        2, 2
      );
      grain.endFill();
    }
    bg.addChild(grain);

    return bg;
  }
}
