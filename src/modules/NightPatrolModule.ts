import * as PIXI from 'pixi.js';
import { NightEvent, ExhibitionMode, PowerOutageEvent, HiddenHotspot, TimedMechanism, LightingState } from '../game/types';
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

  private powerOutageOverlay: PIXI.Graphics;
  private powerOutageActive: boolean = false;
  private currentLightingState: LightingState = 'normal';
  private hiddenHotspotGraphics: Map<string, PIXI.Graphics> = new Map();
  private hiddenHotspotLabels: Map<string, PIXI.Text> = new Map();
  private timedMechanismUI: Map<string, PIXI.Container> = new Map();
  private flickerAnimationId: number | null = null;
  private emergencyLightGraphics: PIXI.Graphics | null = null;
  private powerOutageStatus: PIXI.Container | null = null;
  private powerOutageTriggerButton: PIXI.Graphics | null = null;
  private powerOutagePanel: PIXI.Container | null = null;

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

    this.powerOutageOverlay = new PIXI.Graphics();
    this.powerOutageOverlay.beginFill(0x000000, 0);
    this.powerOutageOverlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    this.powerOutageOverlay.endFill();
    this.powerOutageOverlay.alpha = 0;
    this.powerOutageOverlay.visible = false;
    this.powerOutageOverlay.eventMode = 'auto';
    this.container.addChild(this.powerOutageOverlay);

    this.currentMode = store.getExhibitionMode();
    this.currentLightingState = store.getLightingState();

    this.setupEventListeners();
    this.createFogParticles();
    this.createStatusIndicator();
    this.createToggleButton();
    this.createPowerOutageStatus();
    this.createPowerOutageTriggerButton();
    this.createEmergencyLight();
  }

  private setupEventListeners(): void {
    eventBus.on('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.on('nightpatrol:event-trigger', this.handleEventTrigger.bind(this));
    eventBus.on('nightpatrol:event-resolve', this.handleEventResolve.bind(this));
    eventBus.on('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
    eventBus.on('nightpatrol:start', this.handlePatrolStart.bind(this));
    eventBus.on('nightpatrol:end', this.handlePatrolEnd.bind(this));
    eventBus.on('exhibition:enter', this.handleExhibitionEnter.bind(this));
    eventBus.on('poweroutage:start', this.handlePowerOutageStart.bind(this));
    eventBus.on('poweroutage:end', this.handlePowerOutageEnd.bind(this));
    eventBus.on('poweroutage:lighting-change', this.handleLightingChange.bind(this));
    eventBus.on('poweroutage:event-trigger', this.handlePowerOutageEventTrigger.bind(this));
    eventBus.on('poweroutage:event-complete', this.handlePowerOutageEventComplete.bind(this));
    eventBus.on('poweroutage:hotspot-reveal', this.handleHotspotReveal.bind(this));
    eventBus.on('poweroutage:hotspot-interact', this.handleHotspotInteract.bind(this));
    eventBus.on('poweroutage:timed-mechanism-start', this.handleTimedMechanismStart.bind(this));
    eventBus.on('poweroutage:timed-mechanism-complete', this.handleTimedMechanismComplete.bind(this));
    eventBus.on('poweroutage:timed-mechanism-fail', this.handleTimedMechanismFail.bind(this));
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
    this.updatePowerOutageStatus();
    this.updateTimedMechanismUI();
  }

  private createPowerOutageStatus(): void {
    const container = new PIXI.Container();
    container.x = 20;
    container.y = 140;
    container.alpha = 0;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x1A0505, 0.9);
    bg.lineStyle(2, GAME_CONFIG.COLORS.EMERGENCY_RED, 0.8);
    bg.drawRoundedRect(0, 0, 220, 60, 15);
    bg.endFill();
    container.addChild(bg);

    const statusText = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.EMERGENCY_RED,
      align: 'left'
    });
    statusText.x = 15;
    statusText.y = 10;
    container.addChild(statusText);
    (container as any).statusText = statusText;

    const phaseText = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xAAAAAA,
      align: 'left'
    });
    phaseText.x = 15;
    phaseText.y = 32;
    container.addChild(phaseText);
    (container as any).phaseText = phaseText;

    this.container.addChild(container);
    this.powerOutageStatus = container;
  }

  private updatePowerOutageStatus(): void {
    if (!this.powerOutageStatus) return;

    const poState = store.getPowerOutageState();
    const statusText = (this.powerOutageStatus as any).statusText;
    const phaseText = (this.powerOutageStatus as any).phaseText;

    if (poState.active) {
      this.powerOutageStatus.alpha = 1;
      statusText.text = `⚡ 停电状态: ${this.getLightingStateName(this.currentLightingState)}`;
      const phaseNames: Record<string, string> = {
        'warning': '预警',
        'outage': '停电中',
        'recovery': '恢复中',
        'complete': '已完成'
      };
      phaseText.text = `阶段: ${phaseNames[poState.currentPhase] || poState.currentPhase} | 已完成: ${poState.completedEvents.length}事件`;
    } else {
      this.powerOutageStatus.alpha = 0;
    }
  }

  private getLightingStateName(state: LightingState): string {
    const names: Record<LightingState, string> = {
      'normal': '正常照明',
      'flickering': '灯光闪烁',
      'dim': '光线昏暗',
      'dark': '完全黑暗',
      'emergency': '应急照明'
    };
    return names[state];
  }

  private createPowerOutageTriggerButton(): void {
    const btn = new PIXI.Graphics();
    const btnWidth = 100;
    const btnHeight = 40;

    btn.beginFill(GAME_CONFIG.COLORS.EMERGENCY_RED, 0.9);
    btn.lineStyle(2, 0xFFFFFF, 0.6);
    btn.drawRoundedRect(0, 0, btnWidth, btnHeight, 20);
    btn.endFill();

    const icon = new PIXI.Text('⚡', {
      fontSize: 20,
      align: 'center'
    });
    icon.anchor.set(0.5);
    icon.x = btnWidth / 2;
    icon.y = btnHeight / 2;
    btn.addChild(icon);

    btn.x = GAME_CONFIG.DESIGN_WIDTH - 100;
    btn.y = 130;
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
      if (!this.powerOutageActive) {
        store.startPowerOutage('exhibition_1');
      }
    });

    this.container.addChild(btn);
    this.powerOutageTriggerButton = btn;
  }

  private createEmergencyLight(): void {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(GAME_CONFIG.COLORS.EMERGENCY_RED, 0);
    graphics.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    graphics.endFill();
    graphics.alpha = 0;
    graphics.visible = false;
    this.container.addChild(graphics);
    this.emergencyLightGraphics = graphics;
  }

  private handlePowerOutageStart(data: { exhibitionId: string }): void {
    this.powerOutageActive = true;
    this.powerOutageOverlay.visible = true;
    audioModule.playSFX(GAME_CONFIG.AUDIO.SFX_POWER_FAILURE);

    const firstEvent = store.getPowerOutageEvents().find(
      e => e.phase === 'warning' && e.exhibitionId === data.exhibitionId
    );
    if (firstEvent) {
      setTimeout(() => {
        store.triggerPowerOutageEvent(firstEvent.id);
      }, 1000);
    }
  }

  private handlePowerOutageEnd(): void {
    this.powerOutageActive = false;
    this.stopFlickerAnimation();
    this.clearHiddenHotspots();
    this.clearTimedMechanismUI();
    this.closePowerOutagePanel();

    Animator.animate(
      1000,
      (progress) => {
        this.powerOutageOverlay.alpha = 1 - progress;
        if (this.emergencyLightGraphics) {
          this.emergencyLightGraphics.alpha = 0;
        }
      },
      () => {
        this.powerOutageOverlay.visible = false;
        if (this.emergencyLightGraphics) {
          this.emergencyLightGraphics.visible = false;
        }
      },
      Animator.easeInOutCubic
    );

    this.updatePowerOutageStatus();
  }

  private handleLightingChange(data: { lightingState: LightingState }): void {
    this.currentLightingState = data.lightingState;
    this.updateLightingVisuals(data.lightingState);
    this.renderVisibleHiddenHotspots(data.lightingState);
    this.updatePowerOutageStatus();
  }

  private updateLightingVisuals(lightingState: LightingState): void {
    this.stopFlickerAnimation();

    switch (lightingState) {
      case 'normal':
        this.animateOverlayToColor(0x000000, 0, 500);
        if (this.emergencyLightGraphics) {
          this.emergencyLightGraphics.visible = false;
          this.emergencyLightGraphics.alpha = 0;
        }
        break;
      case 'flickering':
        this.startFlickerAnimation(GAME_CONFIG.COLORS.POWER_OUTAGE_DIM, 0.3, 0.6);
        if (this.emergencyLightGraphics) {
          this.emergencyLightGraphics.visible = false;
        }
        break;
      case 'dim':
        this.animateOverlayToColor(GAME_CONFIG.COLORS.POWER_OUTAGE_DIM, 0.5, 800);
        if (this.emergencyLightGraphics) {
          this.emergencyLightGraphics.visible = false;
        }
        break;
      case 'dark':
        this.animateOverlayToColor(GAME_CONFIG.COLORS.POWER_OUTAGE_DARK, 0.9, 1000);
        if (this.emergencyLightGraphics) {
          this.emergencyLightGraphics.visible = false;
        }
        break;
      case 'emergency':
        this.animateOverlayToColor(GAME_CONFIG.COLORS.EMERGENCY_DIM, 0.7, 500);
        this.startEmergencyLightBlink();
        break;
    }
  }

  private animateOverlayToColor(color: number, alpha: number, duration: number): void {
    Animator.animate(
      duration,
      (progress) => {
        this.powerOutageOverlay.clear();
        this.powerOutageOverlay.beginFill(color, alpha * progress);
        this.powerOutageOverlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
        this.powerOutageOverlay.endFill();
      },
      () => {
        (this.powerOutageOverlay as any).currentColor = color;
      },
      Animator.easeInOutCubic
    );
  }

  private startFlickerAnimation(_minColor: number, minAlpha: number, maxAlpha: number): void {
    const flicker = () => {
      if (!this.powerOutageActive || this.currentLightingState !== 'flickering') return;

      const interval = GAME_CONFIG.POWER_OUTAGE.FLICKER_INTERVAL_MIN +
        Math.random() * (GAME_CONFIG.POWER_OUTAGE.FLICKER_INTERVAL_MAX - GAME_CONFIG.POWER_OUTAGE.FLICKER_INTERVAL_MIN);

      const alpha = minAlpha + Math.random() * (maxAlpha - minAlpha);
      const color = Math.random() > 0.5 ? GAME_CONFIG.COLORS.FLICKER_WARM : GAME_CONFIG.COLORS.FLICKER_COLD;

      this.powerOutageOverlay.clear();
      this.powerOutageOverlay.beginFill(color, alpha);
      this.powerOutageOverlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
      this.powerOutageOverlay.endFill();

      this.flickerAnimationId = window.setTimeout(flicker, interval);
    };

    flicker();
  }

  private startEmergencyLightBlink(): void {
    if (!this.emergencyLightGraphics) return;
    this.emergencyLightGraphics.visible = true;

    const blink = () => {
      if (!this.powerOutageActive || this.currentLightingState !== 'emergency') return;

      const targetAlpha = this.emergencyLightGraphics!.alpha > 0.1 ? 0 : 0.25;
      Animator.tween(this.emergencyLightGraphics!, { alpha: targetAlpha }, 300);

      this.flickerAnimationId = window.setTimeout(blink, GAME_CONFIG.POWER_OUTAGE.EMERGENCY_BLINK_INTERVAL);
    };

    blink();
  }

  private stopFlickerAnimation(): void {
    if (this.flickerAnimationId !== null) {
      clearTimeout(this.flickerAnimationId);
      this.flickerAnimationId = null;
    }
  }

  private handlePowerOutageEventTrigger(data: { eventId: string; event: PowerOutageEvent }): void {
    audioModule.playSFX(data.event.audioTransition.sfx);
    if (data.event.audioTransition.to !== data.event.audioTransition.from) {
      audioModule.playBGM(data.event.audioTransition.to);
    }
    this.showPowerOutagePanel(data.event);
  }

  private handlePowerOutageEventComplete(_data: { eventId: string; event: PowerOutageEvent }): void {
    audioModule.playSFX('sfx_event_resolve');
    this.closePowerOutagePanel();
  }

  private handleHotspotReveal(_data: { hotspotId: string; hotspot: HiddenHotspot }): void {
    audioModule.playSFX('sfx_glow');
    this.renderVisibleHiddenHotspots(this.currentLightingState);
  }

  private handleHotspotInteract(data: { hotspotId: string; hotspot: HiddenHotspot; result: string }): void {
    if (data.result === 'collected') {
      audioModule.playSFX('sfx_collect');
      this.removeHiddenHotspot(data.hotspotId);
    } else if (data.result === 'story') {
      audioModule.playSFX('sfx_whisper');
    }
  }

  private handleTimedMechanismStart(data: { timedMechId: string; timedMech: TimedMechanism }): void {
    audioModule.playSFX('sfx_mechanism_reset');
    this.createTimedMechanismUI(data.timedMech);
  }

  private handleTimedMechanismComplete(data: { timedMechId: string; timedMech: TimedMechanism; remaining: number }): void {
    audioModule.playSFX('sfx_success');
    this.removeTimedMechanismUI(data.timedMechId);
  }

  private handleTimedMechanismFail(data: { timedMechId: string; timedMech: TimedMechanism }): void {
    audioModule.playSFX('sfx_error');
    this.removeTimedMechanismUI(data.timedMechId);
  }

  private renderVisibleHiddenHotspots(lightingState: LightingState): void {
    if (!this.powerOutageActive) return;

    const visibleHotspots = store.getVisibleHiddenHotspots(lightingState);
    store.getCurrentExhibition();

    visibleHotspots.forEach(hotspot => {
      if (!this.hiddenHotspotGraphics.has(hotspot.id)) {
        this.createHiddenHotspot(hotspot);
      }
    });

    const revealedIds = visibleHotspots.map(h => h.id);
    this.hiddenHotspotGraphics.forEach((_, _id) => {
      if (!revealedIds.includes(_id)) {
        this.removeHiddenHotspot(_id);
      }
    });
  }

  private createHiddenHotspot(hotspot: HiddenHotspot): void {
    if (this.hiddenHotspotGraphics.has(hotspot.id)) return;

    const graphics = new PIXI.Graphics();
    const colors: Record<string, number> = {
      'clue': GAME_CONFIG.COLORS.AMBER,
      'mechanism': GAME_CONFIG.COLORS.WARM_ORANGE,
      'exit': GAME_CONFIG.COLORS.GREEN,
      'story': 0x9C27B0
    };
    const color = colors[hotspot.type] || GAME_CONFIG.COLORS.AMBER;

    graphics.beginFill(color, 0.15);
    graphics.lineStyle(2, color, 0.8);
    graphics.drawRoundedRect(0, 0, hotspot.width, hotspot.height, 10);
    graphics.endFill();

    const glowCircle = new PIXI.Graphics();
    glowCircle.beginFill(color, 0.4);
    glowCircle.drawCircle(hotspot.width / 2, hotspot.height / 2, 15);
    glowCircle.endFill();
    graphics.addChild(glowCircle);

    const icon = new PIXI.Text(this.getHotspotIcon(hotspot.type), {
      fontSize: 28,
      align: 'center'
    });
    icon.anchor.set(0.5);
    icon.x = hotspot.width / 2;
    icon.y = hotspot.height / 2;
    graphics.addChild(icon);

    graphics.x = hotspot.x;
    graphics.y = hotspot.y;
    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';
    graphics.alpha = 0;

    const pulseAnimation = () => {
      if (!this.hiddenHotspotGraphics.has(hotspot.id)) return;
      const scale = 1 + Math.sin(Date.now() / 400) * 0.1;
      glowCircle.scale.set(scale);
      requestAnimationFrame(pulseAnimation);
    };
    pulseAnimation();

    const label = new PIXI.Text(hotspot.hint, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 3
    });
    label.anchor.set(0.5, 0);
    label.x = hotspot.x + hotspot.width / 2;
    label.y = hotspot.y + hotspot.height + 5;
    label.alpha = 0;
    this.powerOutageOverlay.addChild(label);
    this.hiddenHotspotLabels.set(hotspot.id, label);

    graphics.on('pointerover', () => {
      label.alpha = 1;
      Animator.tween(graphics.scale, { x: 1.1, y: 1.1 }, 150);
    });

    graphics.on('pointerout', () => {
      label.alpha = 0;
      Animator.tween(graphics.scale, { x: 1, y: 1 }, 150);
    });

    graphics.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      const result = store.interactWithHiddenHotspot(hotspot.id);
      if (result.success && result.type === 'mechanism') {
        const timedMech = store.getTimedMechanisms().find(
          m => m.mechanismId === result.targetId && m.active
        );
        if (timedMech) {
          this.showTimedMechanismPanel(timedMech);
        }
      }
    });

    this.powerOutageOverlay.addChild(graphics);
    this.hiddenHotspotGraphics.set(hotspot.id, graphics);

    Animator.animate(
      500,
      (progress) => {
        graphics.alpha = progress;
        graphics.scale.set(0.5 + progress * 0.5);
      },
      undefined,
      Animator.easeOutBack
    );
  }

  private getHotspotIcon(type: HiddenHotspot['type']): string {
    const icons: Record<string, string> = {
      'clue': '💎',
      'mechanism': '🔧',
      'exit': '🚪',
      'story': '👻'
    };
    return icons[type] || '✨';
  }

  private removeHiddenHotspot(hotspotId: string): void {
    const graphics = this.hiddenHotspotGraphics.get(hotspotId);
    const label = this.hiddenHotspotLabels.get(hotspotId);

    if (graphics) {
      Animator.animate(
        300,
        (progress) => {
          graphics.alpha = 1 - progress;
          graphics.scale.set(1 + progress * 0.3);
        },
        () => {
          if (graphics.parent) {
            graphics.parent.removeChild(graphics);
          }
          graphics.destroy();
          this.hiddenHotspotGraphics.delete(hotspotId);
        }
      );
    }

    if (label) {
      this.powerOutageOverlay.removeChild(label);
      label.destroy();
      this.hiddenHotspotLabels.delete(hotspotId);
    }
  }

  private clearHiddenHotspots(): void {
    this.hiddenHotspotGraphics.forEach((graphics, _id) => {
      if (graphics.parent) {
        graphics.parent.removeChild(graphics);
      }
      graphics.destroy();
    });
    this.hiddenHotspotGraphics.clear();

    this.hiddenHotspotLabels.forEach(label => {
      this.powerOutageOverlay.removeChild(label);
      label.destroy();
    });
    this.hiddenHotspotLabels.clear();
  }

  private createTimedMechanismUI(timedMech: TimedMechanism): void {
    const container = new PIXI.Container();
    container.x = 20;
    container.y = 210;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x1A0505, 0.95);
    bg.lineStyle(2, GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
    bg.drawRoundedRect(0, 0, 250, 80, 15);
    bg.endFill();
    container.addChild(bg);

    const title = new PIXI.Text('⏱️ 限时机关', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'left'
    });
    title.x = 15;
    title.y = 10;
    container.addChild(title);

    const mechName = new PIXI.Text(store.getMechanismById(timedMech.mechanismId)?.displayName || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xCCCCCC,
      align: 'left'
    });
    mechName.x = 15;
    mechName.y = 32;
    container.addChild(mechName);

    const timerText = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'left'
    });
    timerText.x = 15;
    timerText.y = 52;
    container.addChild(timerText);
    (container as any).timerText = timerText;

    const progressBar = new PIXI.Graphics();
    progressBar.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.8);
    progressBar.drawRect(80, 55, 150, 15);
    progressBar.endFill();
    progressBar.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 1);
    progressBar.drawRect(80, 55, 150, 15);
    progressBar.endFill();
    container.addChild(progressBar);
    (container as any).progressBar = progressBar;
    (container as any).timeLimit = timedMech.timeLimit;

    container.alpha = 0;
    this.container.addChild(container);
    this.timedMechanismUI.set(timedMech.id, container);

    Animator.tween(container, { alpha: 1 }, 300);
  }

  private updateTimedMechanismUI(): void {
    this.timedMechanismUI.forEach((container, timedMechId) => {
      const timerText = (container as any).timerText;
      const progressBar = (container as any).progressBar;
      const timeLimit = (container as any).timeLimit;

      if (timerText && progressBar) {
        const remaining = store.getRemainingTimeForMechanism(timedMechId);
        timerText.text = `${remaining}秒`;

        if (remaining <= 10) {
          timerText.style.fill = GAME_CONFIG.COLORS.EMERGENCY_RED;
        }

        const progress = Math.max(0, remaining / timeLimit);
        progressBar.clear();
        progressBar.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.8);
        progressBar.drawRect(80, 55, 150, 15);
        progressBar.endFill();
        progressBar.beginFill(remaining <= 10 ? GAME_CONFIG.COLORS.EMERGENCY_RED : GAME_CONFIG.COLORS.WARM_ORANGE, 1);
        progressBar.drawRect(80, 55, 150 * progress, 15);
        progressBar.endFill();
      }
    });
  }

  private removeTimedMechanismUI(timedMechId: string): void {
    const container = this.timedMechanismUI.get(timedMechId);
    if (container) {
      Animator.animate(
        300,
        (progress) => {
          container.alpha = 1 - progress;
        },
        () => {
          if (container.parent) {
            container.parent.removeChild(container);
          }
          container.destroy();
          this.timedMechanismUI.delete(timedMechId);
        }
      );
    }
  }

  private clearTimedMechanismUI(): void {
    this.timedMechanismUI.forEach(container => {
      if (container.parent) {
        container.parent.removeChild(container);
      }
      container.destroy();
    });
    this.timedMechanismUI.clear();
  }

  private showPowerOutagePanel(event: PowerOutageEvent): void {
    this.closePowerOutagePanel();

    const panel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    panel.addChild(overlay);

    const panelBg = new PIXI.Graphics();
    panelBg.beginFill(0x1A0505, 0.98);
    panelBg.lineStyle(4, GAME_CONFIG.COLORS.EMERGENCY_RED, 0.8);
    panelBg.drawRoundedRect(50, 300, 650, 600, 20);
    panelBg.endFill();
    panel.addChild(panelBg);

    const phaseColors: Record<string, number> = {
      'warning': GAME_CONFIG.COLORS.WARM_ORANGE,
      'outage': GAME_CONFIG.COLORS.EMERGENCY_RED,
      'recovery': GAME_CONFIG.COLORS.AMBER,
      'complete': GAME_CONFIG.COLORS.GREEN
    };
    const phaseNames: Record<string, string> = {
      'warning': '⚠️ 预警',
      'outage': '🔴 停电',
      'recovery': '⚡ 恢复',
      'complete': '✅ 完成'
    };

    const typeBg = new PIXI.Graphics();
    typeBg.beginFill(phaseColors[event.phase] || GAME_CONFIG.COLORS.EMERGENCY_RED, 0.3);
    typeBg.lineStyle(2, phaseColors[event.phase] || GAME_CONFIG.COLORS.EMERGENCY_RED, 1);
    typeBg.drawRoundedRect(70, 320, 120, 40, 20);
    typeBg.endFill();
    panel.addChild(typeBg);

    const typeText = new PIXI.Text(`${event.icon} ${phaseNames[event.phase] || event.phase}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: phaseColors[event.phase] || GAME_CONFIG.COLORS.EMERGENCY_RED,
      align: 'center'
    });
    typeText.anchor.set(0.5);
    typeText.x = 130;
    typeText.y = 340;
    panel.addChild(typeText);

    const title = new PIXI.Text(event.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.EMERGENCY_RED,
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

    const lightingInfo = new PIXI.Text(`💡 照明状态: ${this.getLightingStateName(event.lightingState)}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    lightingInfo.anchor.set(0.5);
    lightingInfo.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    lightingInfo.y = 650;
    panel.addChild(lightingInfo);

    if (event.revealHiddenHotspots.length > 0) {
      const hotspotHint = new PIXI.Text(`👁️  ${event.revealHiddenHotspots.length} 个隐藏区域已显现`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.GREEN,
        align: 'center'
      });
      hotspotHint.anchor.set(0.5);
      hotspotHint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      hotspotHint.y = 700;
      panel.addChild(hotspotHint);
    }

    if (event.triggerTimedMechanisms.length > 0) {
      const mechHint = new PIXI.Text(`⏱️  限时机关已启动，抓紧时间！`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'center'
      });
      mechHint.anchor.set(0.5);
      mechHint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      mechHint.y = 750;
      panel.addChild(mechHint);
    }

    const closeBtn = this.createButton('继续探索', 285, 800, false);
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closePowerOutagePanel();
    });
    panel.addChild(closeBtn);

    panel.alpha = 0;
    this.container.addChild(panel);
    this.powerOutagePanel = panel;

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

  private showTimedMechanismPanel(timedMech: TimedMechanism): void {
    this.closePowerOutagePanel();

    const mech = store.getMechanismById(timedMech.mechanismId);
    if (!mech) return;

    const panel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    panel.addChild(overlay);

    const panelBg = new PIXI.Graphics();
    panelBg.beginFill(0x1A0505, 0.98);
    panelBg.lineStyle(4, GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
    panelBg.drawRoundedRect(50, 300, 650, 650, 20);
    panelBg.endFill();
    panel.addChild(panelBg);

    const title = new PIXI.Text(`⏱️ ${mech.displayName}`, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 380;
    panel.addChild(title);

    const timerDisplay = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 48,
      fill: GAME_CONFIG.COLORS.EMERGENCY_RED,
      align: 'center'
    });
    timerDisplay.anchor.set(0.5);
    timerDisplay.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    timerDisplay.y = 450;
    panel.addChild(timerDisplay);
    (panel as any).timerDisplay = timerDisplay;

    const hint = new PIXI.Text(`💡 ${mech.hint}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 550,
      lineHeight: 36
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 530;
    panel.addChild(hint);

    const inputHint = new PIXI.Text('请输入密码:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xCCCCCC,
      align: 'center'
    });
    inputHint.anchor.set(0.5);
    inputHint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    inputHint.y = 620;
    panel.addChild(inputHint);

    const passwordInput = new PIXI.Text('_______', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 32,
      fill: 0xFFFFFF,
      align: 'center',
      stroke: 0x000000,
      strokeThickness: 2
    });
    passwordInput.anchor.set(0.5);
    passwordInput.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    passwordInput.y = 670;
    panel.addChild(passwordInput);
    (panel as any).passwordInput = passwordInput;
    (panel as any).currentPassword = '';

    const updateTimer = () => {
      if (!this.powerOutagePanel || (this.powerOutagePanel as any).timerDisplay !== timerDisplay) return;
      const remaining = store.getRemainingTimeForMechanism(timedMech.id);
      timerDisplay.text = `${remaining} 秒`;
      if (remaining <= 10) {
        timerDisplay.style.fill = GAME_CONFIG.COLORS.EMERGENCY_RED;
      }
      if (remaining > 0 && timedMech.active) {
        this.flickerAnimationId = window.setTimeout(updateTimer, 500);
      }
    };
    updateTimer();

    const keyboard = this.createVirtualKeyboard((char: string) => {
      const currentPassword = (panel as any).currentPassword || '';
      if (char === 'BACKSPACE') {
        (panel as any).currentPassword = currentPassword.slice(0, -1);
      } else if (char === 'CONFIRM') {
        const isCorrect = store.checkTimedMechanismPassword(timedMech.id, currentPassword);
        if (isCorrect) {
          store.solveTimedMechanism(timedMech.id);
          this.closePowerOutagePanel();
        } else {
          audioModule.playSFX('sfx_error');
          passwordInput.style.fill = GAME_CONFIG.COLORS.EMERGENCY_RED;
          setTimeout(() => {
            passwordInput.style.fill = 0xFFFFFF;
          }, 500);
        }
      } else if (currentPassword.length < 10) {
        (panel as any).currentPassword = currentPassword + char;
      }

      const displayPassword = (panel as any).currentPassword || '';
      passwordInput.text = displayPassword.padEnd(7, '_');
    });
    keyboard.x = 100;
    keyboard.y = 730;
    panel.addChild(keyboard);

    const closeBtn = this.createButton('稍后', 420, 1150, true);
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closePowerOutagePanel();
    });
    panel.addChild(closeBtn);

    panel.alpha = 0;
    this.container.addChild(panel);
    this.powerOutagePanel = panel;

    Animator.animate(
      300,
      (progress) => {
        panel.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createVirtualKeyboard(onKeyPress: (char: string) => void): PIXI.Container {
    const container = new PIXI.Container();
    const keys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
      ['永', '恒', '记', '忆', 'CONFIRM']
    ];

    const KH = 50;
    let y = 0;
    keys.forEach(row => {
      let x = 0;
      row.forEach(key => {
        const isSpecial = key === 'BACKSPACE' || key === 'CONFIRM';
        const keyWidth = isSpecial ? 120 : 45;

        const btn = new PIXI.Graphics();
        btn.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
        btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.6);
        btn.drawRoundedRect(0, 0, keyWidth, KH, 8);
        btn.endFill();

        const label = new PIXI.Text(key === 'BACKSPACE' ? '←' : key === 'CONFIRM' ? '确认' : key, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: isSpecial ? 14 : 18,
          fill: 0xFFFFFF,
          align: 'center'
        });
        label.anchor.set(0.5);
        label.x = keyWidth / 2;
        label.y = KH / 2;
        btn.addChild(label);

        btn.x = x;
        btn.y = y;
        btn.eventMode = 'static';
        btn.cursor = 'pointer';

        btn.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          onKeyPress(key);
        });

        container.addChild(btn);
        x += keyWidth + 8;
      });
      y += KH + 8;
    });

    return container;
  }

  private closePowerOutagePanel(): void {
    if (!this.powerOutagePanel) return;

    const panel = this.powerOutagePanel;
    Animator.animate(
      200,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.powerOutagePanel = null;
      }
    );
  }

  destroy(): void {
    this.stopEventTimer();
    this.stopFlickerAnimation();
    this.clearEventHotspots();
    this.clearHiddenHotspots();
    this.clearTimedMechanismUI();
    this.closeEventPanel();
    this.closePowerOutagePanel();

    eventBus.off('exhibition:mode-change', this.handleModeChange.bind(this));
    eventBus.off('nightpatrol:event-trigger', this.handleEventTrigger.bind(this));
    eventBus.off('nightpatrol:event-resolve', this.handleEventResolve.bind(this));
    eventBus.off('nightpatrol:mechanism-reset', this.handleMechanismReset.bind(this));
    eventBus.off('nightpatrol:start', this.handlePatrolStart.bind(this));
    eventBus.off('nightpatrol:end', this.handlePatrolEnd.bind(this));
    eventBus.off('exhibition:enter', this.handleExhibitionEnter.bind(this));
    eventBus.off('poweroutage:start', this.handlePowerOutageStart.bind(this));
    eventBus.off('poweroutage:end', this.handlePowerOutageEnd.bind(this));
    eventBus.off('poweroutage:lighting-change', this.handleLightingChange.bind(this));
    eventBus.off('poweroutage:event-trigger', this.handlePowerOutageEventTrigger.bind(this));
    eventBus.off('poweroutage:event-complete', this.handlePowerOutageEventComplete.bind(this));
    eventBus.off('poweroutage:hotspot-reveal', this.handleHotspotReveal.bind(this));
    eventBus.off('poweroutage:hotspot-interact', this.handleHotspotInteract.bind(this));
    eventBus.off('poweroutage:timed-mechanism-start', this.handleTimedMechanismStart.bind(this));
    eventBus.off('poweroutage:timed-mechanism-complete', this.handleTimedMechanismComplete.bind(this));
    eventBus.off('poweroutage:timed-mechanism-fail', this.handleTimedMechanismFail.bind(this));

    if (this.toggleButton) {
      this.toggleButton.destroy();
    }
    if (this.statusIndicator) {
      this.statusIndicator.destroy();
    }
    if (this.powerOutageStatus) {
      this.powerOutageStatus.destroy();
    }
    if (this.powerOutageTriggerButton) {
      this.powerOutageTriggerButton.destroy();
    }
    if (this.emergencyLightGraphics) {
      this.emergencyLightGraphics.destroy();
    }
    this.nightOverlay.destroy();
    this.powerOutageOverlay.destroy();

    this.fogParticles.forEach(fog => fog.destroy());
    this.fogParticles = [];
    this.hiddenHotspotGraphics.clear();
    this.hiddenHotspotLabels.clear();
    this.timedMechanismUI.clear();
  }
}
