import * as PIXI from 'pixi.js';
import { Exhibition, Hotspot, ExhibitionMode, Clue } from '../game/types';
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
  private investigatedHotspots: Map<string, PIXI.Graphics> = new Map();
  private detailPanel: PIXI.Container | null = null;
  private currentExhibition: Exhibition | null = null;
  private background: PIXI.Graphics | null = null;
  private transitionOverlay: PIXI.Graphics;
  private animations: (() => void)[] = [];
  private currentMode: ExhibitionMode = 'day';
  private unlockAnimation: PIXI.Container | null = null;

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
    eventBus.on('exhibition:unlock', this.handleExhibitionUnlock.bind(this));
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

  private handleExhibitionUnlock(data: { exhibitionId: string }): void {
    const exhibition = store.getExhibitionById(data.exhibitionId);
    if (exhibition) {
      this.showExhibitionUnlockAnimation(exhibition);
    }
  }

  private showExhibitionUnlockAnimation(exhibition: Exhibition): void {
    if (this.unlockAnimation) {
      this.container.removeChild(this.unlockAnimation);
      this.unlockAnimation.destroy();
    }

    this.unlockAnimation = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.unlockAnimation.addChild(overlay);

    const glowContainer = new PIXI.Container();
    glowContainer.alpha = 0;
    glowContainer.y = GAME_CONFIG.DESIGN_HEIGHT / 2;
    glowContainer.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    this.unlockAnimation.addChild(glowContainer);

    const glowCount = 12;
    for (let i = 0; i < glowCount; i++) {
      const glow = new PIXI.Graphics();
      const angle = (i / glowCount) * Math.PI * 2;
      const distance = 150;
      glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0.8);
      glow.drawCircle(0, 0, 12 + Math.random() * 8);
      glow.endFill();
      glow.x = Math.cos(angle) * distance;
      glow.y = Math.sin(angle) * distance;
      glowContainer.addChild(glow);

      Animator.animate(
        2000,
        (progress) => {
          const newAngle = angle + progress * Math.PI * 2;
          const newDistance = distance * (1 - progress * 0.3);
          glow.x = Math.cos(newAngle) * newDistance;
          glow.y = Math.sin(newAngle) * newDistance;
          glow.alpha = 0.8 * (1 - progress);
        },
        undefined,
        undefined,
        true
      );
    }

    const centerGlow = new PIXI.Graphics();
    for (let i = 5; i > 0; i--) {
      centerGlow.beginFill(GAME_CONFIG.COLORS.AMBER, 0.15 * i);
      centerGlow.drawCircle(0, 0, 80 + i * 30);
      centerGlow.endFill();
    }
    glowContainer.addChild(centerGlow);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    iconBg.lineStyle(5, GAME_CONFIG.COLORS.GOLD, 1);
    iconBg.drawRoundedRect(-140, -90, 280, 180, 25);
    iconBg.endFill();
    glowContainer.addChild(iconBg);

    const unlockIcon = new PIXI.Text('🔓', { fontSize: 64 });
    unlockIcon.anchor.set(0.5);
    unlockIcon.y = -30;
    glowContainer.addChild(unlockIcon);

    const titleText = new PIXI.Text('新展区解锁！', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    titleText.anchor.set(0.5);
    titleText.y = 35;
    glowContainer.addChild(titleText);

    const nameText = new PIXI.Text(exhibition.name, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    nameText.anchor.set(0.5);
    nameText.y = 80;
    glowContainer.addChild(nameText);

    const descText = new PIXI.Text(exhibition.description.slice(0, 50) + '...', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xCCCCCC,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 500
    });
    descText.anchor.set(0.5, 0);
    descText.y = 115;
    glowContainer.addChild(descText);

    const goBtn = new PIXI.Graphics();
    goBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.95);
    goBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    goBtn.drawRoundedRect(-100, 170, 200, 55, 15);
    goBtn.endFill();
    glowContainer.addChild(goBtn);

    const goBtnText = new PIXI.Text('立即前往', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    goBtnText.anchor.set(0.5);
    goBtnText.y = 198;
    glowContainer.addChild(goBtnText);

    const skipBtn = new PIXI.Graphics();
    skipBtn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
    skipBtn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    skipBtn.drawRoundedRect(-70, 240, 140, 40, 12);
    skipBtn.endFill();
    glowContainer.addChild(skipBtn);

    const skipBtnText = new PIXI.Text('稍后再去', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF
    });
    skipBtnText.anchor.set(0.5);
    skipBtnText.y = 260;
    glowContainer.addChild(skipBtnText);

    goBtn.eventMode = 'static';
    goBtn.cursor = 'pointer';
    goBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeUnlockAnimation();
      Animator.delay(200).then(() => {
        this.loadExhibition(exhibition.id);
      });
    });

    skipBtn.eventMode = 'static';
    skipBtn.cursor = 'pointer';
    skipBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeUnlockAnimation();
    });

    goBtn.on('pointerover', () => {
      Animator.tween(goBtn.scale, { x: 1.05, y: 1.05 }, 150);
    });
    goBtn.on('pointerout', () => {
      Animator.tween(goBtn.scale, { x: 1, y: 1 }, 150);
    });

    skipBtn.on('pointerover', () => {
      Animator.tween(skipBtn.scale, { x: 1.05, y: 1.05 }, 150);
    });
    skipBtn.on('pointerout', () => {
      Animator.tween(skipBtn.scale, { x: 1, y: 1 }, 150);
    });

    this.container.addChild(this.unlockAnimation);
    audioModule.playSFX('sfx_unlock');

    Animator.animate(
      600,
      (progress) => {
        glowContainer.alpha = progress;
        glowContainer.scale.set(0.5 + progress * 0.5);
      },
      undefined,
      Animator.easeOutBack
    );
  }

  private closeUnlockAnimation(): void {
    if (!this.unlockAnimation) return;

    const animation = this.unlockAnimation;
    Animator.animate(
      400,
      (progress) => {
        animation.alpha = 1 - progress;
      },
      () => {
        if (animation.parent) {
          animation.parent.removeChild(animation);
        }
        animation.destroy();
        this.unlockAnimation = null;
      },
      Animator.easeInCubic
    );
  }

  loadExhibition(exhibitionId: string, withTransition: boolean = true): void {
    const exhibition = store.getExhibitionById(exhibitionId);
    if (!exhibition || !exhibition.unlocked) {
      if (exhibitionId === 'exhibition_6') {
        this.showLockedHint('请先解开"修复室之门"的密码，才能进入文物修复室。');
      } else if (exhibitionId === 'exhibition_7') {
        this.showLockedHint('请先完成青铜鼎的修复工作，才能进入青铜珍品馆。');
      } else if (exhibitionId.startsWith('exhibition_history_') || exhibitionId.startsWith('exhibition_art_')) {
        const phase = exhibition?.phase || 1;
        this.showLockedHint(`请先解开第${phase > 1 ? phase - 1 : '一'}阶段的联动机关，才能进入此展厅。`);
      }
      return;
    }

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

    if (isCollected) {
      if (hotspot.type === 'clue') {
        this.createInvestigatedHotspot(hotspot);
      }
      return;
    }

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

  private createInvestigatedHotspot(hotspot: Hotspot): void {
    if (this.investigatedHotspots.has(hotspot.id)) return;

    const clue = store.getClueById(hotspot.targetId);
    if (!clue) return;

    const investigatedGraphics = new PIXI.Graphics();
    const color = GAME_CONFIG.COLORS.SILVER_GRAY;

    investigatedGraphics.lineStyle(2, color, 0.6);
    investigatedGraphics.beginFill(color, 0.1);
    investigatedGraphics.drawRoundedRect(0, 0, hotspot.width, hotspot.height, 12);
    investigatedGraphics.endFill();

    investigatedGraphics.beginFill(color, 0.3);
    investigatedGraphics.drawCircle(hotspot.width / 2, hotspot.height / 2, 12);
    investigatedGraphics.endFill();

    const iconText = new PIXI.Text('✓', {
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.SILVER_GRAY,
      fontWeight: 'bold'
    });
    iconText.anchor.set(0.5);
    iconText.x = hotspot.width / 2;
    iconText.y = hotspot.height / 2;
    investigatedGraphics.addChild(iconText);

    investigatedGraphics.x = hotspot.x;
    investigatedGraphics.y = hotspot.y;
    investigatedGraphics.eventMode = 'static';
    investigatedGraphics.cursor = 'pointer';
    investigatedGraphics.alpha = 0.7;

    const hintLabel = new PIXI.Text(clue.name, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.SILVER_GRAY,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 3
    });
    hintLabel.anchor.set(0.5, 0);
    hintLabel.x = hotspot.x + hotspot.width / 2;
    hintLabel.y = hotspot.y + hotspot.height + 10;
    hintLabel.alpha = 0;
    this.container.addChild(hintLabel);

    const subtleAnimation = () => {
      if (!this.isActive || !this.investigatedHotspots.has(hotspot.id)) return;
      const scale = 1 + Math.sin(Date.now() / 800) * 0.03;
      investigatedGraphics.scale.set(scale);
      requestAnimationFrame(subtleAnimation);
    };
    subtleAnimation();

    investigatedGraphics.on('pointerover', () => {
      hintLabel.alpha = 1;
      Animator.tween(investigatedGraphics.scale, { x: 1.08, y: 1.08 }, 200);
      audioModule.playSFX('sfx_click');
    });

    investigatedGraphics.on('pointerout', () => {
      hintLabel.alpha = 0;
      Animator.tween(investigatedGraphics.scale, { x: 1, y: 1 }, 200);
    });

    investigatedGraphics.on('pointerdown', () => {
      this.handleInvestigatedHotspotClick(hotspot);
    });

    this.investigatedHotspots.set(hotspot.id, investigatedGraphics);
    this.hotspotLabels.set('investigated_' + hotspot.id, hintLabel);
    this.container.addChild(investigatedGraphics);

    Animator.animate(
      300,
      (progress) => {
        investigatedGraphics.alpha = progress * 0.7;
        investigatedGraphics.scale.set(0.8 + progress * 0.2);
      },
      undefined,
      Animator.easeOutCubic
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
        const clue = store.getClueById(hotspot.targetId);
        const isDualHallClue = clue && clue.chapterId === 'chapter_4';
        const canCollect = isDualHallClue ? store.canCollectClue(hotspot.targetId) : true;

        if (!canCollect) {
          const requiredClue = store.getClueById(clue!.requiredClueFromOtherHall!);
          this.showLockedHint(`需要先在${clue!.hallOrigin === 'history' ? '艺术馆' : '历史馆'}收集「${requiredClue?.name || '相关线索'}」后才能获取此线索`);
          return;
        }

        eventBus.emit('clue:collect', { clueId: hotspot.targetId });

        let collected: boolean;
        if (clue?.isEndingClue) {
          collected = store.collectHiddenClue(hotspot.targetId);
        } else if (isDualHallClue) {
          collected = store.collectDualHallClue(hotspot.targetId);
        } else {
          collected = store.collectClue(hotspot.targetId);
        }

        if (collected) {
          audioModule.playSFX('sfx_collect');
          store.investigateHotspot(hotspot.id);
          this.removeHotspot(hotspot.id);
          this.createInvestigatedHotspot(hotspot);

          if (clue && clue.chapterId === 'chapter_3') {
            const materialMap: { [key: string]: string } = {
              'clue_11': 'material_1',
              'clue_12': 'material_2',
              'clue_13': 'material_3',
              'clue_14': 'material_4',
              'clue_15': 'material_5'
            };
            const materialId = materialMap[hotspot.targetId];
            if (materialId) {
              store.collectMaterial(materialId);
            }
          }
        }
        break;

      case 'mechanism':
        const mech = store.getMechanismById(hotspot.targetId);
        if (mech?.isLinked && !store.canSolveLinkedMechanism(hotspot.targetId)) {
          eventBus.emit('mechanism:open', { mechanismId: hotspot.targetId });
        } else {
          eventBus.emit('mechanism:open', { mechanismId: hotspot.targetId });
        }
        break;

      case 'exit':
        this.loadExhibition(hotspot.targetId);
        audioModule.playSFX('sfx_unlock');
        break;
    }
  }

  private handleInvestigatedHotspotClick(hotspot: Hotspot): void {
    audioModule.playSFX('sfx_click');

    if (hotspot.type === 'clue') {
      const clue = store.getClueById(hotspot.targetId);
      if (clue) {
        this.showHotspotDetail(hotspot, clue);
      }
    }
  }

  private showHotspotDetail(_hotspot: Hotspot, clue: Clue): void {
    this.closeDetailPanel();

    const panel = new PIXI.Container();
    const panelWidth = 500;
    const panelHeight = clue.supplementaryDescription ? 480 : 380;
    const panelX = (GAME_CONFIG.DESIGN_WIDTH - panelWidth) / 2;
    const panelY = (GAME_CONFIG.DESIGN_HEIGHT - panelHeight) / 2;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x1A0F0A, 0.95);
    bg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.8);
    bg.drawRoundedRect(0, 0, panelWidth, panelHeight, 16);
    bg.endFill();
    panel.addChild(bg);

    const title = new PIXI.Text(clue.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = panelWidth / 2;
    title.y = 45;
    panel.addChild(title);

    const iconText = new PIXI.Text(clue.icon, {
      fontSize: 48
    });
    iconText.anchor.set(0.5);
    iconText.x = panelWidth / 2;
    iconText.y = 100;
    panel.addChild(iconText);

    const descLabel = new PIXI.Text('线索描述', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.SILVER_GRAY
    });
    descLabel.x = 30;
    descLabel.y = 150;
    panel.addChild(descLabel);

    const description = new PIXI.Text(clue.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: panelWidth - 60
    });
    description.x = 30;
    description.y = 175;
    panel.addChild(description);

    let currentY = 260;

    if (clue.supplementaryDescription) {
      const suppLabel = new PIXI.Text('补充细节', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      suppLabel.x = 30;
      suppLabel.y = currentY;
      panel.addChild(suppLabel);

      const supplementary = new PIXI.Text(clue.supplementaryDescription, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: panelWidth - 60,
        lineHeight: 22
      });
      supplementary.x = 30;
      supplementary.y = currentY + 25;
      panel.addChild(supplementary);

      currentY = 360;
    }

    if (clue.linkedClueId) {
      const linkedClue = store.getClueById(clue.linkedClueId);
      if (linkedClue) {
        const isLinkedCollected = store.getState().collectedClues.includes(clue.linkedClueId);

        const linkLabel = new PIXI.Text('关联线索', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 16,
          fill: GAME_CONFIG.COLORS.GOLD
        });
        linkLabel.x = 30;
        linkLabel.y = currentY;
        panel.addChild(linkLabel);

        const linkButtonBg = new PIXI.Graphics();
        linkButtonBg.beginFill(isLinkedCollected ? GAME_CONFIG.COLORS.AMBER : 0x333333, 0.3);
        linkButtonBg.lineStyle(2, isLinkedCollected ? GAME_CONFIG.COLORS.AMBER : 0x666666, 0.8);
        linkButtonBg.drawRoundedRect(30, currentY + 25, panelWidth - 60, 45, 8);
        linkButtonBg.endFill();
        panel.addChild(linkButtonBg);

        const linkButtonText = new PIXI.Text(
          `${isLinkedCollected ? '🔗' : '🔒'} ${linkedClue.icon} ${linkedClue.name}${isLinkedCollected ? ' →' : ' (未收集)'}`,
          {
            fontFamily: GAME_CONFIG.FONTS.BODY,
            fontSize: 18,
            fill: isLinkedCollected ? GAME_CONFIG.COLORS.AMBER : 0x888888
          }
        );
        linkButtonText.anchor.set(0, 0.5);
        linkButtonText.x = 50;
        linkButtonText.y = currentY + 47;
        panel.addChild(linkButtonText);

        if (isLinkedCollected) {
          linkButtonBg.eventMode = 'static';
          linkButtonBg.cursor = 'pointer';

          linkButtonBg.on('pointerover', () => {
            linkButtonBg.tint = 0xAAAAAA;
            audioModule.playSFX('sfx_click');
          });

          linkButtonBg.on('pointerout', () => {
            linkButtonBg.tint = 0xFFFFFF;
          });

          linkButtonBg.on('pointerdown', () => {
            this.jumpToLinkedClue(clue.linkedClueId!);
          });
        }
      }
    }

    const closeButton = new PIXI.Graphics();
    closeButton.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    closeButton.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    closeButton.drawRoundedRect(panelWidth / 2 - 60, panelHeight - 55, 120, 35, 8);
    closeButton.endFill();
    panel.addChild(closeButton);

    const closeButtonText = new PIXI.Text('关闭', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    closeButtonText.anchor.set(0.5);
    closeButtonText.x = panelWidth / 2;
    closeButtonText.y = panelHeight - 38;
    panel.addChild(closeButtonText);

    closeButton.eventMode = 'static';
    closeButton.cursor = 'pointer';

    closeButton.on('pointerover', () => {
      closeButton.tint = 0xAAAAAA;
    });

    closeButton.on('pointerout', () => {
      closeButton.tint = 0xFFFFFF;
    });

    closeButton.on('pointerdown', () => {
      this.closeDetailPanel();
    });

    panel.x = panelX;
    panel.y = panelY;
    panel.alpha = 0;

    this.container.addChild(panel);
    this.detailPanel = panel;

    Animator.animate(
      300,
      (progress) => {
        panel.alpha = progress;
        panel.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutBack
    );
  }

  private jumpToLinkedClue(linkedClueId: string): void {
    audioModule.playSFX('sfx_unlock');
    this.closeDetailPanel();

    const targetExhibition = store.getExhibitions().find(e =>
      e.hotspots.some(h => h.type === 'clue' && h.targetId === linkedClueId)
    );

    if (targetExhibition && targetExhibition.unlocked) {
      this.loadExhibition(targetExhibition.id);

      Animator.delay(500).then(() => {
        const hotspot = targetExhibition.hotspots.find(
          h => h.type === 'clue' && h.targetId === linkedClueId
        );
        if (hotspot) {
          const clue = store.getClueById(linkedClueId);
          if (clue) {
            this.showHotspotDetail(hotspot, clue);
          }
        }
      });
    } else {
      this.showLockedHint('该线索所在的展厅尚未解锁。');
    }
  }

  private closeDetailPanel(): void {
    if (this.detailPanel) {
      const panel = this.detailPanel;
      Animator.animate(
        200,
        (progress) => {
          panel.alpha = 1 - progress;
          panel.scale.set(1 - progress * 0.1);
        },
        () => {
          if (panel.parent) {
            panel.parent.removeChild(panel);
          }
          panel.destroy();
        }
      );
      this.detailPanel = null;
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

    this.closeDetailPanel();

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

    this.investigatedHotspots.forEach(h => {
      this.container.removeChild(h);
      h.destroy();
    });
    this.investigatedHotspots.clear();

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

  private showLockedHint(text: string): void {
    const hint = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 4,
      wordWrap: true,
      wordWrapWidth: 500
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = GAME_CONFIG.DESIGN_HEIGHT / 2;
    hint.alpha = 0;
    this.container.addChild(hint);

    audioModule.playSFX('sfx_error');

    Animator.animate(
      300,
      (progress) => { hint.alpha = progress; hint.scale.set(0.8 + progress * 0.2); },
      () => {
        Animator.delay(2000).then(() => {
          Animator.animate(300, (p) => { hint.alpha = 1 - p; hint.scale.set(1 - p * 0.2); }, () => {
            if (hint.parent) {
              hint.parent.removeChild(hint);
              hint.destroy();
            }
          });
        });
      },
      Animator.easeOutBack
    );
  }

  update(_delta: number): void {
    // Update animations if needed
  }

  destroy(): void {
    this.clearExhibition();
    eventBus.off('exhibition:enter', this.handleExhibitionEnter.bind(this));
    eventBus.off('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.off('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
    eventBus.off('exhibition:unlock', this.handleExhibitionUnlock.bind(this));

    if (this.unlockAnimation) {
      this.unlockAnimation.destroy({ children: true });
      this.unlockAnimation = null;
    }
  }

  get isActive(): boolean {
    return this.currentExhibition !== null;
  }
}
