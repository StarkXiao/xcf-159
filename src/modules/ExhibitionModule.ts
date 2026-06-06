import * as PIXI from 'pixi.js';
import { Exhibition, Hotspot, ExhibitionMode } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class ExhibitionModule {
  private container: PIXI.Container;
  private hotspots: Map<string, PIXI.Graphics> = new Map();
  private hotspotLabels: Map<string, PIXI.Text> = new Map();
  private resetHotspots: Map<string, PIXI.Graphics> = new Map();
  private currentExhibition: Exhibition | null = null;
  private background: PIXI.Graphics | null = null;
  private transitionOverlay: PIXI.Graphics;
  private animations: (() => void)[] = [];
  private currentMode: ExhibitionMode = 'day';

  constructor(container: PIXI.Container) {
    this.container = container;

    this.transitionOverlay = new PIXI.Graphics();
    this.transitionOverlay.beginFill(0x000000);
    this.transitionOverlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    this.transitionOverlay.endFill();
    this.transitionOverlay.alpha = 0;
    this.transitionOverlay.visible = false;
    this.container.addChild(this.transitionOverlay);

    this.currentMode = store.getExhibitionMode();

    eventBus.on('exhibition:enter', this.handleExhibitionEnter.bind(this));
    eventBus.on('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.on('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
  }

  private handleExhibitionEnter(data: { exhibitionId: string }): void {
    this.loadExhibition(data.exhibitionId);
  }

  private handleModeChange(data: { mode: ExhibitionMode }): void {
    this.currentMode = data.mode;
    if (this.currentExhibition) {
      this.renderExhibition(this.currentExhibition);
    }
  }

  private handleMechanismReset(data: { mechanismId: string }): void {
    if (this.currentExhibition) {
      const hotspot = this.currentExhibition.hotspots.find(
        h => h.type === 'mechanism' && h.targetId === data.mechanismId
      );
      if (hotspot) {
        this.createHotspot(hotspot);
      }
    }
  }

  loadExhibition(exhibitionId: string, withTransition: boolean = true): void {
    const exhibition = store.getExhibitionById(exhibitionId);
    if (!exhibition || !exhibition.unlocked) return;

    if (withTransition) {
      this.transitionOverlay.visible = true;
      this.transitionOverlay.alpha = 0;

      const fadeOut = Animator.animate(
        300,
        (progress) => {
          this.transitionOverlay.alpha = progress;
        },
        () => {
          this.renderExhibition(exhibition);
          const fadeIn = Animator.animate(
            300,
            (progress) => {
              this.transitionOverlay.alpha = 1 - progress;
            },
            () => {
              this.transitionOverlay.visible = false;
            }
          );
          this.animations.push(fadeIn);
        }
      );
      this.animations.push(fadeOut);
    } else {
      this.renderExhibition(exhibition);
    }
  }

  private renderExhibition(exhibition: Exhibition): void {
    this.clearExhibition();
    this.currentExhibition = exhibition;

    this.background = this.createBackground(exhibition.bgColor);
    this.container.addChildAt(this.background, 0);

    this.createDecorations();

    exhibition.hotspots.forEach(hotspot => {
      this.createHotspot(hotspot);
    });

    store.setCurrentExhibition(exhibition.id);
  }

  private createBackground(color: number): PIXI.Graphics {
    const bg = new PIXI.Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();

    for (let i = 0; i < 6; i++) {
      const alpha = 0.08 + Math.random() * 0.12;
      bg.beginFill(GAME_CONFIG.COLORS.AMBER, alpha);
      bg.drawCircle(
        GAME_CONFIG.DESIGN_WIDTH * (0.2 + Math.random() * 0.6),
        GAME_CONFIG.DESIGN_HEIGHT * (0.2 + Math.random() * 0.6),
        120 + Math.random() * 200
      );
      bg.endFill();
    }

    const floorY = GAME_CONFIG.DESIGN_HEIGHT * 0.75;
    bg.beginFill(0x000000, 0.3);
    bg.drawRect(0, floorY, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT - floorY);
    bg.endFill();

    for (let i = 0; i < 3; i++) {
      const lightX = 150 + i * 250;
      const gradient = new PIXI.Graphics();
      gradient.beginFill(GAME_CONFIG.COLORS.AMBER, 0.15);
      gradient.moveTo(lightX - 80, 0);
      gradient.lineTo(lightX - 150, floorY);
      gradient.lineTo(lightX + 150, floorY);
      gradient.lineTo(lightX + 80, 0);
      gradient.closePath();
      gradient.endFill();
      bg.addChild(gradient);
    }

    const grain = new PIXI.Graphics();
    for (let i = 0; i < 600; i++) {
      const gray = Math.random() * 40;
      grain.beginFill(gray, 0.025);
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

  private createDecorations(): void {
    const frames = [
      { x: 80, y: 200, w: 120, h: 160 },
      { x: 550, y: 180, w: 120, h: 160 },
      { x: 300, y: 150, w: 150, h: 200 },
      { x: 100, y: 650, w: 100, h: 120 },
      { x: 550, y: 680, w: 100, h: 120 }
    ];

    frames.forEach((frame, idx) => {
      const frameGraphics = new PIXI.Graphics();
      frameGraphics.lineStyle(6, GAME_CONFIG.COLORS.GOLD, 1);
      frameGraphics.beginFill(0x1A0F0A, 0.8);
      frameGraphics.drawRoundedRect(0, 0, frame.w, frame.h, 8);
      frameGraphics.endFill();

      const amberGlow = new PIXI.Graphics();
      amberGlow.beginFill(GAME_CONFIG.COLORS.AMBER, 0.3 + Math.random() * 0.2);
      amberGlow.drawCircle(frame.w / 2, frame.h / 2, Math.min(frame.w, frame.h) / 3);
      amberGlow.endFill();
      frameGraphics.addChild(amberGlow);

      const icon = ['💎', '📷', '🎨', '📜', '⌚'][idx % 5];
      const iconText = new PIXI.Text(icon, {
        fontSize: 36,
        align: 'center'
      });
      iconText.anchor.set(0.5);
      iconText.x = frame.w / 2;
      iconText.y = frame.h / 2;
      frameGraphics.addChild(iconText);

      frameGraphics.x = frame.x;
      frameGraphics.y = frame.y;
      this.container.addChild(frameGraphics);
    });

    const displayCase = new PIXI.Graphics();
    displayCase.lineStyle(4, GAME_CONFIG.COLORS.BRONZE, 1);
    displayCase.beginFill(0xFFFFFF, 0.1);
    displayCase.drawRoundedRect(250, 850, 250, 180, 10);
    displayCase.endFill();

    const caseTop = new PIXI.Graphics();
    caseTop.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
    caseTop.drawRoundedRect(245, 840, 260, 20, 5);
    caseTop.endFill();
    displayCase.addChild(caseTop);

    const bigAmber = new PIXI.Graphics();
    bigAmber.beginFill(GAME_CONFIG.COLORS.AMBER, 0.7);
    bigAmber.drawEllipse(375, 940, 80, 60);
    bigAmber.endFill();

    bigAmber.beginFill(GAME_CONFIG.COLORS.GOLD, 0.5);
    bigAmber.drawEllipse(360, 920, 30, 20);
    bigAmber.endFill();

    displayCase.addChild(bigAmber);
    this.container.addChild(displayCase);
  }

  private createHotspot(hotspot: Hotspot): void {
    const isCollected = hotspot.type === 'clue' &&
      store.getState().collectedClues.includes(hotspot.targetId);
    const isSolved = hotspot.type === 'mechanism' &&
      store.getState().solvedMechanisms.includes(hotspot.targetId);

    if (isCollected) return;

    if (isSolved) {
      if (this.currentMode === 'night' && hotspot.type === 'mechanism') {
        this.createResetHotspot(hotspot);
      }
      return;
    }

    const hotspotGraphics = new PIXI.Graphics();
    const color = hotspot.type === 'clue' ? GAME_CONFIG.COLORS.AMBER :
                  hotspot.type === 'mechanism' ? GAME_CONFIG.COLORS.DEEP_PURPLE :
                  GAME_CONFIG.COLORS.BRONZE;

    hotspotGraphics.lineStyle(3, color, 0.8);
    hotspotGraphics.beginFill(color, 0.15);
    hotspotGraphics.drawRoundedRect(0, 0, hotspot.width, hotspot.height, 12);
    hotspotGraphics.endFill();

    hotspotGraphics.beginFill(color, 0.4);
    hotspotGraphics.drawCircle(hotspot.width / 2, hotspot.height / 2, 15);
    hotspotGraphics.endFill();

    const icon = hotspot.type === 'clue' ? '✨' :
                 hotspot.type === 'mechanism' ? '🔒' : '🚪';
    const iconText = new PIXI.Text(icon, {
      fontSize: 28,
      align: 'center'
    });
    iconText.anchor.set(0.5);
    iconText.x = hotspot.width / 2;
    iconText.y = hotspot.height / 2;
    hotspotGraphics.addChild(iconText);

    hotspotGraphics.x = hotspot.x;
    hotspotGraphics.y = hotspot.y;
    hotspotGraphics.eventMode = 'static';
    hotspotGraphics.cursor = 'pointer';

    const hintLabel = new PIXI.Text(hotspot.hint, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 3
    });
    hintLabel.anchor.set(0.5, 0);
    hintLabel.x = hotspot.x + hotspot.width / 2;
    hintLabel.y = hotspot.y + hotspot.height + 10;
    hintLabel.alpha = 0;
    this.container.addChild(hintLabel);

    const breatheAnimation = () => {
      if (!this.isActive) return;
      const scale = 1 + Math.sin(Date.now() / 400) * 0.08;
      hotspotGraphics.scale.set(scale);
      requestAnimationFrame(breatheAnimation);
    };
    breatheAnimation();

    hotspotGraphics.on('pointerover', () => {
      hintLabel.alpha = 1;
      Animator.tween(hotspotGraphics.scale, { x: 1.15, y: 1.15 }, 200);
      audioModule.playSFX('sfx_click');
    });

    hotspotGraphics.on('pointerout', () => {
      hintLabel.alpha = 0;
      Animator.tween(hotspotGraphics.scale, { x: 1, y: 1 }, 200);
    });

    hotspotGraphics.on('pointerdown', () => {
      this.handleHotspotClick(hotspot);
    });

    this.hotspots.set(hotspot.id, hotspotGraphics);
    this.hotspotLabels.set(hotspot.id, hintLabel);
    this.container.addChild(hotspotGraphics);
  }

  private createResetHotspot(hotspot: Hotspot): void {
    if (this.resetHotspots.has(hotspot.id)) return;

    const resetGraphics = new PIXI.Graphics();
    const color = GAME_CONFIG.COLORS.WARM_ORANGE;

    resetGraphics.lineStyle(3, color, 0.9);
    resetGraphics.beginFill(color, 0.2);
    resetGraphics.drawRoundedRect(0, 0, hotspot.width, hotspot.height, 12);
    resetGraphics.endFill();

    resetGraphics.beginFill(color, 0.5);
    resetGraphics.drawCircle(hotspot.width / 2, hotspot.height / 2, 18);
    resetGraphics.endFill();

    const iconText = new PIXI.Text('🔄', {
      fontSize: 28,
      align: 'center'
    });
    iconText.anchor.set(0.5);
    iconText.x = hotspot.width / 2;
    iconText.y = hotspot.height / 2;
    resetGraphics.addChild(iconText);

    resetGraphics.x = hotspot.x;
    resetGraphics.y = hotspot.y;
    resetGraphics.eventMode = 'static';
    resetGraphics.cursor = 'pointer';

    const hintLabel = new PIXI.Text('机关重置', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 3
    });
    hintLabel.anchor.set(0.5, 0);
    hintLabel.x = hotspot.x + hotspot.width / 2;
    hintLabel.y = hotspot.y + hotspot.height + 10;
    hintLabel.alpha = 0;
    this.container.addChild(hintLabel);

    const pulseAnimation = () => {
      if (!this.isActive || !this.resetHotspots.has(hotspot.id)) return;
      const scale = 1 + Math.sin(Date.now() / 250) * 0.1;
      resetGraphics.scale.set(scale);
      requestAnimationFrame(pulseAnimation);
    };
    pulseAnimation();

    resetGraphics.on('pointerover', () => {
      hintLabel.alpha = 1;
      Animator.tween(resetGraphics.scale, { x: 1.2, y: 1.2 }, 150);
      audioModule.playSFX('sfx_click');
    });

    resetGraphics.on('pointerout', () => {
      hintLabel.alpha = 0;
      Animator.tween(resetGraphics.scale, { x: 1, y: 1 }, 150);
    });

    resetGraphics.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      if (confirm('确定要重置这个机关吗？重置后需要重新解开。')) {
        store.resetMechanism(hotspot.targetId);
        this.removeResetHotspot(hotspot.id);
      }
    });

    this.resetHotspots.set(hotspot.id, resetGraphics);
    this.hotspotLabels.set('reset_' + hotspot.id, hintLabel);
    this.container.addChild(resetGraphics);

    Animator.animate(
      400,
      (progress) => {
        resetGraphics.alpha = progress;
        resetGraphics.scale.set(0.5 + progress * 0.5);
      },
      undefined,
      Animator.easeOutBack
    );
  }

  private removeResetHotspot(hotspotId: string): void {
    const hotspot = this.resetHotspots.get(hotspotId);
    const label = this.hotspotLabels.get('reset_' + hotspotId);

    if (hotspot) {
      Animator.animate(
        300,
        (progress) => {
          hotspot.alpha = 1 - progress;
          hotspot.scale.set(1 + progress);
        },
        () => {
          if (hotspot.parent) {
            hotspot.parent.removeChild(hotspot);
          }
          hotspot.destroy();
          this.resetHotspots.delete(hotspotId);
        }
      );
    }

    if (label) {
      this.container.removeChild(label);
      label.destroy();
      this.hotspotLabels.delete('reset_' + hotspotId);
    }
  }

  private handleHotspotClick(hotspot: Hotspot): void {
    audioModule.playSFX('sfx_click');

    switch (hotspot.type) {
      case 'clue':
        eventBus.emit('clue:collect', { clueId: hotspot.targetId });
        const collected = store.collectClue(hotspot.targetId);
        if (collected) {
          audioModule.playSFX('sfx_collect');
          this.removeHotspot(hotspot.id);
        }
        break;

      case 'mechanism':
        eventBus.emit('mechanism:open', { mechanismId: hotspot.targetId });
        break;

      case 'exit':
        this.loadExhibition(hotspot.targetId);
        audioModule.playSFX('sfx_unlock');
        break;
    }
  }

  private removeHotspot(hotspotId: string): void {
    const hotspot = this.hotspots.get(hotspotId);
    const label = this.hotspotLabels.get(hotspotId);

    if (hotspot) {
      Animator.animate(
        500,
        (progress) => {
          hotspot.alpha = 1 - progress;
          hotspot.scale.set(1 + progress);
        },
        () => {
          this.container.removeChild(hotspot);
          hotspot.destroy();
          this.hotspots.delete(hotspotId);
        }
      );
    }

    if (label) {
      this.container.removeChild(label);
      label.destroy();
      this.hotspotLabels.delete(hotspotId);
    }
  }

  private clearExhibition(): void {
    this.animations.forEach(cancel => cancel());
    this.animations = [];

    this.hotspots.forEach(h => {
      this.container.removeChild(h);
      h.destroy();
    });
    this.hotspots.clear();

    this.resetHotspots.forEach(h => {
      this.container.removeChild(h);
      h.destroy();
    });
    this.resetHotspots.clear();

    this.hotspotLabels.forEach(l => {
      this.container.removeChild(l);
      l.destroy();
    });
    this.hotspotLabels.clear();

    if (this.background) {
      this.container.removeChild(this.background);
      this.background.destroy();
      this.background = null;
    }

    for (let i = this.container.children.length - 1; i >= 0; i--) {
      const child = this.container.children[i];
      if (child !== this.transitionOverlay) {
        this.container.removeChild(child);
        child.destroy();
      }
    }
  }

  update(_delta: number): void {
    // Update animations if needed
  }

  destroy(): void {
    this.clearExhibition();
    eventBus.off('exhibition:enter', this.handleExhibitionEnter.bind(this));
    eventBus.off('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.off('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
  }

  get isActive(): boolean {
    return this.currentExhibition !== null;
  }
}
