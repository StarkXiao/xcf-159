import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../game/config';

export class Renderer {
  static createRoundedRect(
    width: number,
    height: number,
    radius: number,
    color: number,
    alpha: number = 1
  ): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color, alpha);
    graphics.drawRoundedRect(0, 0, width, height, radius);
    graphics.endFill();
    return graphics;
  }

  static createCircle(
    radius: number,
    color: number,
    alpha: number = 1
  ): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color, alpha);
    graphics.drawCircle(0, 0, radius);
    graphics.endFill();
    return graphics;
  }

  static createText(
    text: string,
    style: Partial<PIXI.ITextStyle> = {}
  ): PIXI.Text {
    const defaultStyle: Partial<PIXI.ITextStyle> = {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center'
    };
    return new PIXI.Text(text, { ...defaultStyle, ...style });
  }

  static createGlowFilter(
    _color: number = GAME_CONFIG.COLORS.AMBER,
    blur: number = 15,
    quality: number = 0.5
  ): PIXI.Filter[] {
    const blurFilter = new PIXI.BlurFilter(blur, quality);
    return [blurFilter];
  }

  static hexToNumber(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
  }

  static numberToHex(num: number): string {
    return '#' + num.toString(16).padStart(6, '0');
  }

  static getScale(app: PIXI.Application): { x: number; y: number } {
    const scaleX = app.screen.width / GAME_CONFIG.DESIGN_WIDTH;
    const scaleY = app.screen.height / GAME_CONFIG.DESIGN_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    return { x: scale, y: scale };
  }

  static centerInApp(app: PIXI.Application, container: PIXI.Container): void {
    const scale = this.getScale(app);
    container.scale.set(scale.x, scale.y);
    container.x = (app.screen.width - GAME_CONFIG.DESIGN_WIDTH * scale.x) / 2;
    container.y = (app.screen.height - GAME_CONFIG.DESIGN_HEIGHT * scale.y) / 2;
  }

  static createParticle(
    x: number,
    y: number,
    color: number = GAME_CONFIG.COLORS.AMBER,
    size: number = 4
  ): PIXI.Graphics {
    const particle = new PIXI.Graphics();
    particle.beginFill(color, 0.8);
    particle.drawCircle(0, 0, size);
    particle.endFill();
    particle.x = x;
    particle.y = y;
    return particle;
  }

  static createAmberGradient(
    width: number,
    height: number
  ): PIXI.Graphics {
    const gradient = new PIXI.Graphics();
    gradient.beginFill(0x1A0F0A);
    gradient.drawRect(0, 0, width, height);
    gradient.endFill();

    for (let i = 0; i < 5; i++) {
      const alpha = 0.1 + i * 0.05;
      gradient.beginFill(GAME_CONFIG.COLORS.AMBER, alpha);
      gradient.drawCircle(
        width * (0.3 + Math.random() * 0.4),
        height * (0.3 + Math.random() * 0.4),
        100 + i * 50
      );
      gradient.endFill();
    }

    return gradient;
  }
}
