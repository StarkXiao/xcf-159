import * as PIXI from 'pixi.js';
import { NightEvent, ExhibitionMode } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class NightPatrolModule {
  private container: PIXI.Container;
  private nightOverlay: PIXI.Graphics;
  private toggleButton: PIXI.Graphics | null = null;
  private eventHotspots: Map<string, PIXI.Graphics> = new Map();
  private eventLabels: Map<string, PIXI.Text> = new Map();
  private currentMode: ExhibitionMode = 'day';
  private eventTimer: number | null = null;
  private eventInterval: number = 8000;
  private eventPanel: PIXI.Container | null = null;
  private statusIndicator: PIXI.Container | null = null;
  private fogParticles: PIXI.Graphics[] = [];

  constructor(container: PIXI.Container) {
    this.container = container;

    this.nightOverlay = new PIXI.Graphics();
    this.nightOverlay.beginFill(0x0A0515, 0.7);
    this.nightOverlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    this.nightOverlay.endFill();
    this.nightOverlay.alpha = 0;
    this.nightOverlay.visible = false;
    this.nightOverlay.eventMode = 'auto';
    this.container.addChild(this.nightOverlay);

    this.currentMode = store.getExhibitionMode();

    this.setupEventListeners();
    this.createFogParticles();
    this.createStatusIndicator();
    this.createToggleButton();
  }

  private setupEventListeners(): void {
    eventBus.on('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.on('nightpatrol:event-trigger', this.handleEventTrigger.bind(this));
    eventBus.on('nightpatrol:event-resolve', this.handleEventResolve.bind(this));
    eventBus.on('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
    eventBus.on('nightpatrol:start', this.handlePatrolStart.bind(this));
    eventBus.on('nightpatrol:end', this.handlePatrolEnd.bind(this));
    eventBus.on('exhibition:enter', this.handleExhibitionEnter.bind(this));
  }

  private handleExhibitionEnter(data: { exhibitionId: string }): void {
    this.clearEventHotspots();
    if (this.currentMode === 'night') {
      this.renderActiveEvents(data.exhibitionId);
    }
  }

  private handleModeChange(data: { mode: ExhibitionMode }): void {
    this.currentMode = data.mode;
    this.updateVisualsForMode(data.mode);
    this.updateToggleButton();
    this.updateStatusIndicator();
  }

  private handlePatrolStart(): void {
    audioModule.playSFX('sfx_night_start');
    audioModule.playBGM('bgm_night');
    this.startEventTimer();
    this.startFogAnimation();
    this.clearEventHotspots();

    const currentExhibition = store.getCurrentExhibition();
    if (currentExhibition) {
      Animator.delay(2000).then(() => {
        store.triggerRandomNightEvent(currentExhibition.id);
      });
    }
  }

  private handlePatrolEnd(): void {
    audioModule.playSFX('sfx_day_start');
    audioModule.playBGM('bgm_explore');
    this.stopEventTimer();
    this.stopFogAnimation();
    this.clearEventHotspots();
    this.closeEventPanel();
  }

  private handleEventTrigger(data: { eventId: string; event: NightEvent }): void {
    audioModule.playSFX(data.event.sfx);
    this.createEventHotspot(data.event);
    this.updateStatusIndicator();
  }

  private handleEventResolve(data: { eventId: string; event: NightEvent }): void {
    audioModule.playSFX('sfx_event_resolve');
    this.removeEventHotspot(data.eventId);
    this.closeEventPanel();
    this.updateStatusIndicator();
  }

  private handleMechanismReset(): void {
    audioModule.playSFX('sfx_mechanism_reset');
  }

  private createFogParticles(): void {
    for (let i = 0; i < 15; i++) {
      const fog = new PIXI.Graphics();
      fog.beginFill(0x4A3728, 0.08);
      fog.drawEllipse(0, 0, 150 + Math.random() * 100, 40 + Math.random() * 30);
      fog.endFill();
      fog.x = Math.random() * GAME_CONFIG.DESIGN_WIDTH;
      fog.y = 200 + Math.random() * 800;
      fog.alpha = 0;
      this.fogParticles.push(fog);
      this.container.addChild(fog);
    }
  }

  private startFogAnimation(): void {
    this.fogParticles.forEach((fog, index) => {
      const animate = () => {
        if (this.currentMode !== 'night') return;
        fog.x += 0.3;
        fog.alpha = 0.3 + Math.sin(Date.now() / 2000 + index) * 0.2;
        if (fog.x > GAME_CONFIG.DESIGN_WIDTH + 200) {
          fog.x = -200;
        }
        requestAnimationFrame(animate);
      };
      animate();
    });
  }

  private stopFogAnimation(): void {
    this.fogParticles.forEach(fog => {
      fog.alpha = 0;
    });
  }

  private startEventTimer(): void {
    this.stopEventTimer();
    this.eventTimer = window.setInterval(() => {
      if (this.currentMode !== 'night') return;
      const currentExhibition = store.getCurrentExhibition();
      if (currentExhibition) {
        const activeEvents = store.getActiveNightEvents(currentExhibition.id);
        if (activeEvents.length < 2) {
          store.triggerRandomNightEvent(currentExhibition.id);
        }
      }
    }, this.eventInterval);
  }

  private stopEventTimer(): void {
    if (this.eventTimer !== null) {
      clearInterval(this.eventTimer);
      this.eventTimer = null;
    }
  }

  private updateVisualsForMode(mode: ExhibitionMode): void {
    const isNight = mode === 'night';
    this.nightOverlay.visible = true;

    Animator.animate(
      800,
      (progress) => {
        this.nightOverlay.alpha = isNight ? progress : 1 - progress;
      },
      () => {
        if (!isNight) {
          this.nightOverlay.visible = false;
        }
      },
      Animator.easeInOutCubic
    );
  }

  private createToggleButton(): void {
    const btn = new PIXI.Graphics();
    const btnWidth = 80;
    const btnHeight = 40;

    btn.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.8);
    btn.drawRoundedRect(0, 0, btnWidth, btnHeight, 20);
    btn.endFill();

    const icon = new PIXI.Text(this.currentMode === 'night' ? '🌙' : '☀️', {
      fontSize: 24,
      align: 'center'
    });
    icon.anchor.set(0.5);
    icon.x = btnWidth / 2;
    icon.y = btnHeight / 2;
    btn.addChild(icon);
    (btn as any).icon = icon;

    btn.x = GAME_CONFIG.DESIGN_WIDTH - 100;
    btn.y = 80;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.1, y: 1.1 }, 150);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 150);
    });

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      const newMode: ExhibitionMode = this.currentMode === 'night' ? 'day' : 'night';
      store.setExhibitionMode(newMode);
    });

    this.container.addChild(btn);
    this.toggleButton = btn;
  }

  private updateToggleButton(): void {
    if (!this.toggleButton) return;
    const icon = (this.toggleButton as any).icon;
    if (icon) {
      icon.text = this.currentMode === 'night' ? '🌙' : '☀️';
    }
  }

  private createStatusIndicator(): void {
    const container = new PIXI.Container();
    container.x = 20;
    container.y = 80;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    bg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.6);
    bg.drawRoundedRect(0, 0, 180, 50, 15);
    bg.endFill();
    container.addChild(bg);

    const modeText = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'left'
    });
    modeText.x = 15;
    modeText.y = 10;
    container.addChild(modeText);
    (container as any).modeText = modeText;

    const countText = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xAAAAAA,
      align: 'left'
    });
    countText.x = 15;
    countText.y = 28;
    container.addChild(countText);
    (container as any).countText = countText;

    this.container.addChild(container);
    this.statusIndicator = container;
    this.updateStatusIndicator();
  }

  private updateStatusIndicator(): void {
    if (!this.statusIndicator) return;

    const modeText = (this.statusIndicator as any).modeText;
    const countText = (this.statusIndicator as any).countText;

    if (modeText) {
      modeText.text = this.currentMode === 'night' ? '🌙 夜巡模式' : '☀️ 日间模式';
    }

    if (countText) {
      const totalResolved = store.getTotalEventsResolved();
      if (this.currentMode === 'night') {
        const currentExhibition = store.getCurrentExhibition();
        const activeCount = currentExhibition
          ? store.getActiveNightEvents(currentExhibition.id).length
          : 0;
        countText.text = `异常: ${activeCount} | 已解决: ${totalResolved}`;
      } else {
        countText.text = `总解决事件: ${totalResolved}`;
      }
    }
  }

  private renderActiveEvents(exhibitionId: string): void {
    const activeEvents = store.getActiveNightEvents(exhibitionId);
    activeEvents.forEach(event => {
      this.createEventHotspot(event);
    });
  }

  private createEventHotspot(event: NightEvent): void {
    if (this.eventHotspots.has(event.id)) return;
    if (this.currentMode !== 'night') return;

    const hotspot = new PIXI.Graphics();
    const colors: Record<string, number> = {
      anomaly: GAME_CONFIG.COLORS.WARM_ORANGE,
      sound: GAME_CONFIG.COLORS.AMBER,
      figure: 0x9C27B0,
      whisper: 0x4CAF50
    };
    const color = colors[event.type] || GAME_CONFIG.COLORS.AMBER;

    hotspot.beginFill(color, 0.2);
    hotspot.lineStyle(3, color, 0.9);
    hotspot.drawRoundedRect(0, 0, event.hotspot.width, event.hotspot.height, 12);
    hotspot.endFill();

    const pulseCircle = new PIXI.Graphics();
    pulseCircle.beginFill(color, 0.5);
    pulseCircle.drawCircle(event.hotspot.width / 2, event.hotspot.height / 2, 20);
    pulseCircle.endFill();
    hotspot.addChild(pulseCircle);

    const icon = new PIXI.Text(event.icon, {
      fontSize: 32,
      align: 'center'
    });
    icon.anchor.set(0.5);
    icon.x = event.hotspot.width / 2;
    icon.y = event.hotspot.height / 2;
    hotspot.addChild(icon);

    hotspot.x = event.hotspot.x;
    hotspot.y = event.hotspot.y;
    hotspot.eventMode = 'static';
    hotspot.cursor = 'pointer';

    const pulseAnimation = () => {
      if (this.currentMode !== 'night' || !this.eventHotspots.has(event.id)) return;
      const scale = 1 + Math.sin(Date.now() / 300) * 0.15;
      pulseCircle.scale.set(scale);
      requestAnimationFrame(pulseAnimation);
    };
    pulseAnimation();

    const label = new PIXI.Text(event.name, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 3
    });
    label.anchor.set(0.5, 0);
    label.x = event.hotspot.x + event.hotspot.width / 2;
    label.y = event.hotspot.y + event.hotspot.height + 8;
    label.alpha = 0;
    this.container.addChild(label);

    hotspot.on('pointerover', () => {
      label.alpha = 1;
      Animator.tween(hotspot.scale, { x: 1.1, y: 1.1 }, 150);
    });

    hotspot.on('pointerout', () => {
      label.alpha = 0;
      Animator.tween(hotspot.scale, { x: 1, y: 1 }, 150);
    });

    hotspot.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showEventPanel(event);
    });

    this.eventHotspots.set(event.id, hotspot);
    this.eventLabels.set(event.id, label);
    this.nightOverlay.addChild(hotspot);

    Animator.animate(
      500,
      (progress) => {
        hotspot.alpha = progress;
        hotspot.scale.set(0.5 + progress * 0.5);
      },
      undefined,
      Animator.easeOutBack
    );
  }

  private removeEventHotspot(eventId: string): void {
    const hotspot = this.eventHotspots.get(eventId);
    const label = this.eventLabels.get(eventId);

    if (hotspot) {
      Animator.animate(
        400,
        (progress) => {
          hotspot.alpha = 1 - progress;
          hotspot.scale.set(1 + progress);
        },
        () => {
          if (hotspot.parent) {
            hotspot.parent.removeChild(hotspot);
          }
          hotspot.destroy();
          this.eventHotspots.delete(eventId);
        }
      );
    }

    if (label) {
      this.container.removeChild(label);
      label.destroy();
      this.eventLabels.delete(eventId);
    }
  }

  private clearEventHotspots(): void {
    this.eventHotspots.forEach((hotspot) => {
      if (hotspot.parent) {
        hotspot.parent.removeChild(hotspot);
      }
      hotspot.destroy();
    });
    this.eventHotspots.clear();

    this.eventLabels.forEach(label => {
      this.container.removeChild(label);
      label.destroy();
    });
    this.eventLabels.clear();
  }

  private showEventPanel(event: NightEvent): void {
    this.closeEventPanel();

    const panel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    panel.addChild(overlay);

    const panelBg = new PIXI.Graphics();
    panelBg.beginFill(0x1A0F0A, 0.98);
    panelBg.lineStyle(4, GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
    panelBg.drawRoundedRect(50, 300, 650, 700, 20);
    panelBg.endFill();
    panel.addChild(panelBg);

    const typeColors: Record<string, number> = {
      anomaly: GAME_CONFIG.COLORS.WARM_ORANGE,
      sound: GAME_CONFIG.COLORS.AMBER,
      figure: 0x9C27B0,
      whisper: 0x4CAF50
    };
    const typeNames: Record<string, string> = {
      anomaly: '异象',
      sound: '异响',
      figure: '魅影',
      whisper: '低语'
    };

    const typeBg = new PIXI.Graphics();
    typeBg.beginFill(typeColors[event.type], 0.3);
    typeBg.lineStyle(2, typeColors[event.type], 1);
    typeBg.drawRoundedRect(70, 320, 120, 40, 20);
    typeBg.endFill();
    panel.addChild(typeBg);

    const typeText = new PIXI.Text(`${event.icon} ${typeNames[event.type]}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: typeColors[event.type],
      align: 'center'
    });
    typeText.anchor.set(0.5);
    typeText.x = 130;
    typeText.y = 340;
    panel.addChild(typeText);

    const title = new PIXI.Text(event.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 400;
    panel.addChild(title);

    const description = new PIXI.Text(event.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xDDDDDD,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: 550,
      lineHeight: 36
    });
    description.x = 100;
    description.y = 460;
    panel.addChild(description);

    const resolveBtn = this.createButton('调查', 200, 800, false);
    resolveBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      store.resolveNightEvent(event.id);
    });
    panel.addChild(resolveBtn);

    const ignoreBtn = this.createButton('稍后处理', 420, 800, true);
    ignoreBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeEventPanel();
    });
    panel.addChild(ignoreBtn);

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 320;
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeEventPanel();
    });
    panel.addChild(closeBtn);

    if (event.reward) {
      const rewardHint = new PIXI.Text('💎 可能发现重要线索', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.GOLD,
        align: 'center'
      });
      rewardHint.anchor.set(0.5);
      rewardHint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      rewardHint.y = 900;
      panel.addChild(rewardHint);
    }

    panel.alpha = 0;
    this.container.addChild(panel);
    this.eventPanel = panel;

    Animator.animate(
      300,
      (progress) => {
        panel.alpha = progress;
        panel.scale.set(0.95 + progress * 0.05);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private closeEventPanel(): void {
    if (!this.eventPanel) return;

    const panel = this.eventPanel;
    Animator.animate(
      200,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.eventPanel = null;
      }
    );
  }

  private createButton(text: string, x: number, y: number, isSecondary: boolean): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const color = isSecondary ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.WARM_ORANGE;
    const textColor = isSecondary ? 0xFFFFFF : GAME_CONFIG.COLORS.DARK_BROWN;

    btn.beginFill(color, 0.9);
    btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 180, 60, 15);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: textColor
    });
    btnText.anchor.set(0.5);
    btnText.x = 90;
    btnText.y = 30;
    btn.addChild(btnText);

    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 150);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 150);
    });

    return btn;
  }

  private createCloseButton(): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
    btn.drawCircle(25, 25, 22);
    btn.endFill();

    const icon = new PIXI.Text('✕', {
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    icon.anchor.set(0.5);
    icon.x = 25;
    icon.y = 25;
    btn.addChild(icon);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    return btn;
  }

  update(_delta: number): void {
    this.updateStatusIndicator();
  }

  destroy(): void {
    this.stopEventTimer();
    this.clearEventHotspots();
    this.closeEventPanel();

    eventBus.off('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.off('nightpatrol:event-trigger', this.handleEventTrigger.bind(this));
    eventBus.off('nightpatrol:event-resolve', this.handleEventResolve.bind(this));
    eventBus.off('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
    eventBus.off('nightpatrol:start', this.handlePatrolStart.bind(this));
    eventBus.off('nightpatrol:end', this.handlePatrolEnd.bind(this));
    eventBus.off('exhibition:enter', this.handleExhibitionEnter.bind(this));

    if (this.toggleButton) {
      this.toggleButton.destroy();
    }
    if (this.statusIndicator) {
      this.statusIndicator.destroy();
    }
    this.nightOverlay.destroy();

    this.fogParticles.forEach(fog => fog.destroy());
    this.fogParticles = [];
  }
}
