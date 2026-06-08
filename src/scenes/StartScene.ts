import * as PIXI from 'pixi.js';
import { Scene } from './Scene';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from '../modules/AudioModule';
import { eventBus } from '../game/EventBus';
import { store } from '../game/Store';

export class StartScene extends Scene {
  private startButton: PIXI.Graphics | null = null;
  private continueButton: PIXI.Graphics | null = null;
  private continueButtonText: PIXI.Text | null = null;
  private settingsButton: PIXI.Graphics | null = null;
  private settingsPanel: PIXI.Container | null = null;
  private isSettingsOpen: boolean = false;

  init(): void {
    this.visible = false;
    this.createSceneBackground();
    this.createTitle();
    this.createButtons();
    this.createParticles(30);
  }

  private createSceneBackground(): void {
    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BG);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();

    for (let i = 0; i < 10; i++) {
      const alpha = 0.05 + Math.random() * 0.1;
      bg.beginFill(GAME_CONFIG.COLORS.AMBER, alpha);
      bg.drawCircle(
        GAME_CONFIG.DESIGN_WIDTH * (0.1 + Math.random() * 0.8),
        GAME_CONFIG.DESIGN_HEIGHT * (0.1 + Math.random() * 0.8),
        80 + Math.random() * 200
      );
      bg.endFill();
    }

    const centerAmber = new PIXI.Graphics();
    centerAmber.beginFill(GAME_CONFIG.COLORS.AMBER, 0.15);
    centerAmber.drawEllipse(
      GAME_CONFIG.DESIGN_WIDTH / 2,
      GAME_CONFIG.DESIGN_HEIGHT / 2 - 100,
      250,
      180
    );
    centerAmber.endFill();

    centerAmber.beginFill(GAME_CONFIG.COLORS.GOLD, 0.1);
    centerAmber.drawEllipse(
      GAME_CONFIG.DESIGN_WIDTH / 2 - 30,
      GAME_CONFIG.DESIGN_HEIGHT / 2 - 130,
      100,
      60
    );
    centerAmber.endFill();

    bg.addChild(centerAmber);

    const rays = new PIXI.Graphics();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const alpha = 0.03 + Math.random() * 0.02;
      rays.beginFill(GAME_CONFIG.COLORS.GOLD, alpha);
      rays.moveTo(GAME_CONFIG.DESIGN_WIDTH / 2, GAME_CONFIG.DESIGN_HEIGHT / 2 - 100);
      rays.lineTo(
        GAME_CONFIG.DESIGN_WIDTH / 2 + Math.cos(angle) * 800,
        GAME_CONFIG.DESIGN_HEIGHT / 2 - 100 + Math.sin(angle) * 800
      );
      rays.lineTo(
        GAME_CONFIG.DESIGN_WIDTH / 2 + Math.cos(angle + 0.1) * 800,
        GAME_CONFIG.DESIGN_HEIGHT / 2 - 100 + Math.sin(angle + 0.1) * 800
      );
      rays.closePath();
      rays.endFill();
    }
    bg.addChild(rays);

    const grain = new PIXI.Graphics();
    for (let i = 0; i < 800; i++) {
      const gray = Math.random() * 40;
      grain.beginFill(gray, 0.02);
      grain.drawRect(
        Math.random() * GAME_CONFIG.DESIGN_WIDTH,
        Math.random() * GAME_CONFIG.DESIGN_HEIGHT,
        2, 2
      );
      grain.endFill();
    }
    bg.addChild(grain);

    this.addChild(bg);
  }

  private createTitle(): void {
    const titleContainer = new PIXI.Container();
    titleContainer.y = 200;

    const mainTitle = new PIXI.Text('琥珀记忆馆', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 84,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      stroke: GAME_CONFIG.COLORS.DARK_BROWN,
      strokeThickness: 4
    });
    mainTitle.anchor.set(0.5);
    mainTitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    mainTitle.y = 0;
    titleContainer.addChild(mainTitle);

    const subtitle = new PIXI.Text('封存的记忆，永恒的爱', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 80;
    titleContainer.addChild(subtitle);

    const iconRow = new PIXI.Container();
    iconRow.y = 160;

    const icons = ['💎', '📜', '📷', '🎨', '⌚'];
    icons.forEach((icon, i) => {
      const iconText = new PIXI.Text(icon, { fontSize: 36 });
      iconText.anchor.set(0.5);
      iconText.x = GAME_CONFIG.DESIGN_WIDTH / 2 + (i - 2) * 70;
      iconText.y = 0;
      iconText.alpha = 0.7;
      iconRow.addChild(iconText);

      const float = () => {
        if (!this.isActive) return;
        iconText.y = Math.sin(Date.now() / 500 + i) * 8;
        requestAnimationFrame(float);
      };
      float();
    });
    titleContainer.addChild(iconRow);

    titleContainer.alpha = 0;
    titleContainer.scale.set(0.8);
    this.addChild(titleContainer);

    Animator.animate(
      1500,
      (progress) => {
        titleContainer.alpha = progress;
        titleContainer.scale.set(0.8 + progress * 0.2);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createButtons(): void {
    this.startButton = new PIXI.Graphics();
    this.startButton.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    this.startButton.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    this.startButton.drawRoundedRect(0, 0, 300, 80, 20);
    this.startButton.endFill();

    const startText = new PIXI.Text('开始新游戏', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    startText.anchor.set(0.5);
    startText.x = 150;
    startText.y = 40;
    this.startButton.addChild(startText);

    this.startButton.x = (GAME_CONFIG.DESIGN_WIDTH - 300) / 2;
    this.startButton.y = 750;
    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';

    this.startButton.on('pointerover', () => {
      Animator.tween(this.startButton!.scale, { x: 1.05, y: 1.05 }, 150);
      audioModule.playSFX('sfx_click');
    });

    this.startButton.on('pointerout', () => {
      Animator.tween(this.startButton!.scale, { x: 1, y: 1 }, 150);
    });

    this.startButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      audioModule.playSFX('sfx_unlock');
      this.startNewGame();
    });

    this.addChild(this.startButton);

    this.continueButton = new PIXI.Graphics();
    this.continueButton.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.9);
    this.continueButton.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    this.continueButton.drawRoundedRect(0, 0, 300, 80, 20);
    this.continueButton.endFill();

    this.continueButtonText = new PIXI.Text('继续游戏', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    this.continueButtonText.anchor.set(0.5);
    this.continueButtonText.x = 150;
    this.continueButtonText.y = 40;
    this.continueButton.addChild(this.continueButtonText);

    this.continueButton.x = (GAME_CONFIG.DESIGN_WIDTH - 300) / 2;
    this.continueButton.y = 850;
    this.continueButton.eventMode = 'static';
    this.continueButton.cursor = 'pointer';
    this.continueButton.visible = false;

    this.continueButton.on('pointerover', () => {
      Animator.tween(this.continueButton!.scale, { x: 1.05, y: 1.05 }, 150);
      audioModule.playSFX('sfx_click');
    });

    this.continueButton.on('pointerout', () => {
      Animator.tween(this.continueButton!.scale, { x: 1, y: 1 }, 150);
    });

    this.continueButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      audioModule.playSFX('sfx_unlock');
      this.continueGame();
    });

    this.addChild(this.continueButton);

    this.settingsButton = new PIXI.Graphics();
    this.settingsButton.beginFill(0x000000, 0.6);
    this.settingsButton.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.8);
    this.settingsButton.drawCircle(40, 40, 40);
    this.settingsButton.endFill();

    const settingsIcon = new PIXI.Text('⚙️', { fontSize: 32 });
    settingsIcon.anchor.set(0.5);
    settingsIcon.x = 40;
    settingsIcon.y = 40;
    this.settingsButton.addChild(settingsIcon);

    this.settingsButton.x = GAME_CONFIG.DESIGN_WIDTH - 100;
    this.settingsButton.y = 50;
    this.settingsButton.eventMode = 'static';
    this.settingsButton.cursor = 'pointer';

    this.settingsButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.toggleSettings();
    });

    this.addChild(this.settingsButton);

    const hint = new PIXI.Text('点击闪烁的物品收集线索\n解开机关，探索记忆的秘密', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xAAAAAA,
      align: 'center',
      lineHeight: 30
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 970;
    this.addChild(hint);
  }

  private toggleSettings(): void {
    if (this.isSettingsOpen) {
      this.closeSettings();
    } else {
      this.openSettings();
    }
  }

  private openSettings(): void {
    this.isSettingsOpen = true;
    this.settingsPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.settingsPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(75, 350, 600, 780, 20);
    panel.endFill();
    this.settingsPanel.addChild(panel);

    const title = new PIXI.Text('设置', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.anchor.set(0.5);
    title.x = 375;
    title.y = 410;
    this.settingsPanel.addChild(title);

    const bgmMuted = audioModule.getBGMMuted();
    const sfxMuted = audioModule.getSFXMuted();
    const bgmVolume = audioModule.getBGMVolume();
    const sfxVolume = audioModule.getSFXVolume();

    this.createVolumeControl('背景音乐', 'bgm', bgmVolume, bgmMuted, 490);
    this.createVolumeControl('音效', 'sfx', sfxVolume, sfxMuted, 620);

    const hintState = store.getHintState();
    this.createHintSettings(hintState.autoHintEnabled, hintState.hintFrequency, 750);

    const closeBtn = new PIXI.Graphics();
    closeBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    closeBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    closeBtn.drawRoundedRect(0, 0, 200, 65, 15);
    closeBtn.endFill();

    const closeText = new PIXI.Text('关闭', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    closeText.anchor.set(0.5);
    closeText.x = 100;
    closeText.y = 32;
    closeBtn.addChild(closeText);

    closeBtn.x = 275;
    closeBtn.y = 1030;
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeSettings();
    });
    this.settingsPanel.addChild(closeBtn);

    this.settingsPanel.alpha = 0;
    this.addChild(this.settingsPanel);

    Animator.animate(
      300,
      (progress) => {
        this.settingsPanel!.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createVolumeControl(label: string, type: 'bgm' | 'sfx', volume: number, muted: boolean, y: number): void {
    const panel = this.settingsPanel;
    if (!panel) return;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.4);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    bg.drawRoundedRect(100, y - 40, 550, 100, 12);
    bg.endFill();
    panel.addChild(bg);

    const labelText = new PIXI.Text(label, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    labelText.x = 130;
    labelText.y = y - 10;
    panel.addChild(labelText);

    const muteBtn = new PIXI.Graphics();
    const muteColor = muted ? GAME_CONFIG.COLORS.WARM_ORANGE : GAME_CONFIG.COLORS.AMBER;
    muteBtn.beginFill(muteColor, 0.8);
    muteBtn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    muteBtn.drawRoundedRect(0, 0, 60, 40, 8);
    muteBtn.endFill();

    const muteIcon = new PIXI.Text(muted ? '🔇' : '🔊', { fontSize: 22 });
    muteIcon.anchor.set(0.5);
    muteIcon.x = 30;
    muteIcon.y = 20;
    muteBtn.addChild(muteIcon);

    muteBtn.x = 560;
    muteBtn.y = y - 15;
    muteBtn.eventMode = 'static';
    muteBtn.cursor = 'pointer';
    muteBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      if (type === 'bgm') {
        audioModule.toggleBGM();
      } else {
        audioModule.toggleSFX();
      }
      this.closeSettings();
      Animator.delay(100).then(() => this.openSettings());
    });
    panel.addChild(muteBtn);

    const trackBg = new PIXI.Graphics();
    trackBg.beginFill(0x000000, 0.6);
    trackBg.drawRoundedRect(130, y + 30, 380, 12, 6);
    trackBg.endFill();
    panel.addChild(trackBg);

    const trackFill = new PIXI.Graphics();
    trackFill.beginFill(GAME_CONFIG.COLORS.AMBER);
    trackFill.drawRoundedRect(130, y + 30, 380 * volume, 12, 6);
    trackFill.endFill();
    panel.addChild(trackFill);

    const handle = new PIXI.Graphics();
    handle.beginFill(GAME_CONFIG.COLORS.GOLD);
    handle.drawCircle(130 + 380 * volume, y + 36, 14);
    handle.endFill();
    handle.eventMode = 'static';
    handle.cursor = 'pointer';
    panel.addChild(handle);

    let dragging = false;
    handle.on('pointerdown', () => { dragging = true; });
    handle.on('pointerup', () => { dragging = false; });
    handle.on('pointerupoutside', () => { dragging = false; });
    handle.on('pointermove', (e) => {
      if (!dragging) return;
      const parent = handle.parent as PIXI.Container;
      const localPos = parent.toLocal(e.global);
      let newVolume = (localPos.x - 130) / 380;
      newVolume = Math.max(0, Math.min(1, newVolume));

      trackFill.clear();
      trackFill.beginFill(GAME_CONFIG.COLORS.AMBER);
      trackFill.drawRoundedRect(130, y + 30, 380 * newVolume, 12, 6);
      trackFill.endFill();
      handle.x = 130 + 380 * newVolume - (130 + 380 * volume);

      if (type === 'bgm') {
        store.updateSettings({ bgmVolume: newVolume });
        audioModule.setBGMVolume(newVolume);
      } else {
        store.updateSettings({ sfxVolume: newVolume });
        audioModule.setSFXVolume(newVolume);
      }
    });
  }

  private createHintSettings(autoHintEnabled: boolean, frequency: 'conservative' | 'normal' | 'aggressive', y: number): void {
    const panel = this.settingsPanel;
    if (!panel) return;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.4);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    bg.drawRoundedRect(100, y - 40, 550, 180, 12);
    bg.endFill();
    panel.addChild(bg);

    const labelText = new PIXI.Text('智能提示', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    labelText.x = 130;
    labelText.y = y - 10;
    panel.addChild(labelText);

    const hintToggleBtn = new PIXI.Graphics();
    const toggleColor = autoHintEnabled ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE;
    hintToggleBtn.beginFill(toggleColor, 0.8);
    hintToggleBtn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    hintToggleBtn.drawRoundedRect(0, 0, 100, 40, 8);
    hintToggleBtn.endFill();

    const hintToggleText = new PIXI.Text(autoHintEnabled ? '已开启' : '已关闭', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    hintToggleText.anchor.set(0.5);
    hintToggleText.x = 50;
    hintToggleText.y = 20;
    hintToggleBtn.addChild(hintToggleText);

    hintToggleBtn.x = 520;
    hintToggleBtn.y = y - 15;
    hintToggleBtn.eventMode = 'static';
    hintToggleBtn.cursor = 'pointer';
    hintToggleBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      store.toggleAutoHint(!autoHintEnabled);
      this.closeSettings();
      Animator.delay(100).then(() => this.openSettings());
    });
    panel.addChild(hintToggleBtn);

    const freqLabel = new PIXI.Text('提示频率：', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    freqLabel.x = 130;
    freqLabel.y = y + 40;
    panel.addChild(freqLabel);

    const freqOptions: Array<{ value: 'conservative' | 'normal' | 'aggressive'; label: string }> = [
      { value: 'conservative', label: '保守' },
      { value: 'normal', label: '正常' },
      { value: 'aggressive', label: '积极' }
    ];

    freqOptions.forEach((option, i) => {
      const isSelected = frequency === option.value;
      const freqBtn = new PIXI.Graphics();
      const btnColor = isSelected ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE;
      freqBtn.beginFill(btnColor, isSelected ? 0.9 : 0.5);
      freqBtn.lineStyle(2, isSelected ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.6);
      freqBtn.drawRoundedRect(0, 0, 90, 35, 8);
      freqBtn.endFill();

      const freqText = new PIXI.Text(option.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: isSelected ? GAME_CONFIG.COLORS.DARK_BROWN : GAME_CONFIG.COLORS.CREAM
      });
      freqText.anchor.set(0.5);
      freqText.x = 45;
      freqText.y = 17.5;
      freqBtn.addChild(freqText);

      freqBtn.x = 250 + i * 110;
      freqBtn.y = y + 35;
      freqBtn.eventMode = 'static';
      freqBtn.cursor = 'pointer';
      freqBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        store.setHintFrequency(option.value);
        eventBus.emit('hint:setting-changed', { frequency: option.value });
        this.closeSettings();
        Animator.delay(100).then(() => this.openSettings());
      });
      panel.addChild(freqBtn);
    });

    const descText = new PIXI.Text('保守：较少提示，更具挑战性\n积极：更频繁的帮助，适合新手', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xAAAAAA,
      align: 'left',
      lineHeight: 20
    });
    descText.x = 130;
    descText.y = y + 90;
    panel.addChild(descText);
  }

  private closeSettings(): void {
    if (!this.settingsPanel) return;

    const panel = this.settingsPanel;
    Animator.animate(
      200,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.removeChild(panel);
        panel.destroy();
        this.settingsPanel = null;
        this.isSettingsOpen = false;
      }
    );
  }

  private startNewGame(): void {
    if (this.startButton && this.continueButton) {
      Animator.animate(
        500,
        (progress) => {
          this.startButton!.alpha = 1 - progress;
          this.startButton!.scale.set(1 + progress);
          this.continueButton!.alpha = 1 - progress;
          this.continueButton!.scale.set(1 + progress);
        },
        () => {
          store.resetGame();
          eventBus.emit('scene:change', { scene: 'game' });
        }
      );
    }
  }

  private continueGame(): void {
    if (this.startButton && this.continueButton) {
      Animator.animate(
        500,
        (progress) => {
          this.startButton!.alpha = 1 - progress;
          this.startButton!.scale.set(1 + progress);
          this.continueButton!.alpha = 1 - progress;
          this.continueButton!.scale.set(1 + progress);
        },
        () => {
          store.resumeFromBreakpoint();
          eventBus.emit('scene:change', { scene: 'game' });
        }
      );
    }
  }

  private formatPlayTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  }

  private formatSaveTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}天前`;
    
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  private updateContinueButton(): void {
    if (!this.continueButton || !this.continueButtonText) return;

    const hasBreakpoint = store.hasBreakpoint();
    this.continueButton.visible = hasBreakpoint;

    if (hasBreakpoint) {
      const breakpoint = store.getBreakpoint();
      if (breakpoint) {
        const playTime = this.formatPlayTime(breakpoint.playTime);
        const saveTime = this.formatSaveTime(breakpoint.savedAt);
        const chapter = store.getChapterById(breakpoint.currentChapter);
        const exhibition = store.getExhibitionById(breakpoint.currentExhibition);
        const chapterTitle = chapter?.title || '未知章节';
        const exhibitionName = exhibition?.name || '未知展厅';
        this.continueButtonText.text = `继续游戏\n${chapterTitle} · ${exhibitionName}\n游戏时长: ${playTime} · ${saveTime}`;
        this.continueButtonText.style.fontSize = 18;
      }
    }
  }

  onEnter(): void {
    super.onEnter();
    audioModule.playBGM('bgm_main');
    this.updateContinueButton();
  }

  onExit(): void {
    super.onExit();
  }

  update(_delta: number): void {
    this.updateParticles();
  }

  destroy(): void {
    this.clearParticles();
    if (this.startButton) this.startButton.destroy();
    if (this.settingsButton) this.settingsButton.destroy();
    if (this.settingsPanel) this.settingsPanel.destroy();
  }
}
