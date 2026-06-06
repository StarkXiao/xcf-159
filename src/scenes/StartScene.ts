import * as PIXI from 'pixi.js';
import { Scene } from './Scene';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from '../modules/AudioModule';
import { eventBus } from '../game/EventBus';
import { store } from '../game/Store';

export class StartScene extends Scene {
  private startButton: PIXI.Graphics | null = null;
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

    const startText = new PIXI.Text('开始游戏', {
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
      this.startGame();
    });

    this.addChild(this.startButton);

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
    hint.y = 900;
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
    panel.drawRoundedRect(75, 350, 600, 600, 20);
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
    closeBtn.y = 780;
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

  private startGame(): void {
    if (this.startButton) {
      Animator.animate(
        500,
        (progress) => {
          this.startButton!.alpha = 1 - progress;
          this.startButton!.scale.set(1 + progress);
        },
        () => {
          eventBus.emit('scene:change', { scene: 'game' });
        }
      );
    }
  }

  onEnter(): void {
    super.onEnter();
    audioModule.playBGM('bgm_main');
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
