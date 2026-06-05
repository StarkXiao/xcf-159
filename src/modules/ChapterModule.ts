import * as PIXI from 'pixi.js';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class ChapterModule {
  private container: PIXI.Container;
  private hudContainer: PIXI.Container;
  private settingsPanel: PIXI.Container | null = null;
  private isSettingsOpen: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.hudContainer = new PIXI.Container();
    this.container.addChild(this.hudContainer);

    this.createHUD();

    eventBus.on('chapter:enter', this.handleChapterEnter.bind(this));
    eventBus.on('chapter:complete', this.handleChapterComplete.bind(this));
  }

  private createHUD(): void {
    const chapter = store.getCurrentChapter();
    const exhibition = store.getCurrentExhibition();

    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x000000, 0.6);
    progressBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    progressBg.drawRoundedRect(20, 20, 300, 50, 10);
    progressBg.endFill();
    this.hudContainer.addChild(progressBg);

    const chapterIcon = new PIXI.Text('📖', { fontSize: 24 });
    chapterIcon.x = 35;
    chapterIcon.y = 28;
    this.hudContainer.addChild(chapterIcon);

    const chapterLabel = new PIXI.Text(chapter?.title || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    chapterLabel.x = 70;
    chapterLabel.y = 32;
    this.hudContainer.addChild(chapterLabel);
    (this.hudContainer as any).chapterLabel = chapterLabel;

    const progressBarBg = new PIXI.Graphics();
    progressBarBg.beginFill(0x000000, 0.8);
    progressBarBg.drawRoundedRect(20, 75, 300, 12, 6);
    progressBarBg.endFill();
    this.hudContainer.addChild(progressBarBg);

    const progressBar = new PIXI.Graphics();
    progressBar.beginFill(GAME_CONFIG.COLORS.AMBER);
    progressBar.drawRoundedRect(20, 75, 0, 12, 6);
    progressBar.endFill();
    this.hudContainer.addChild(progressBar);
    (this.hudContainer as any).progressBar = progressBar;

    const locationBg = new PIXI.Graphics();
    locationBg.beginFill(0x000000, 0.6);
    locationBg.lineStyle(2, GAME_CONFIG.COLORS.BRONZE, 0.6);
    locationBg.drawRoundedRect(GAME_CONFIG.DESIGN_WIDTH - 250, 20, 230, 50, 10);
    locationBg.endFill();
    this.hudContainer.addChild(locationBg);

    const locationIcon = new PIXI.Text('📍', { fontSize: 24 });
    locationIcon.x = GAME_CONFIG.DESIGN_WIDTH - 235;
    locationIcon.y = 28;
    this.hudContainer.addChild(locationIcon);

    const locationLabel = new PIXI.Text(exhibition?.name || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    locationLabel.x = GAME_CONFIG.DESIGN_WIDTH - 200;
    locationLabel.y = 32;
    this.hudContainer.addChild(locationLabel);
    (this.hudContainer as any).locationLabel = locationLabel;

    const settingsBtn = this.createSettingsButton();
    this.hudContainer.addChild(settingsBtn);

    this.updateProgress();
  }

  private createSettingsButton(): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(0x000000, 0.6);
    btn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    btn.drawCircle(40, 40, 35);
    btn.endFill();

    const icon = new PIXI.Text('⚙️', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 40;
    icon.y = 40;
    btn.addChild(icon);

    btn.x = GAME_CONFIG.DESIGN_WIDTH - 90;
    btn.y = 90;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.toggleSettings();
    });

    return btn;
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
    overlay.beginFill(0x000000, 0.8);
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

    const settings = store.getSettings();

    this.createVolumeControl('背景音乐', 'bgm', settings.bgmVolume, settings.bgmMuted, 490);
    this.createVolumeControl('音效', 'sfx', settings.sfxVolume, settings.sfxMuted, 620);

    const continueBtn = this.createButton('继续游戏', 175, 780);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeSettings();
    });
    this.settingsPanel.addChild(continueBtn);

    const resetBtn = this.createButton('重新开始', 175, 870, true);
    resetBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showResetConfirm();
    });
    this.settingsPanel.addChild(resetBtn);

    this.settingsPanel.alpha = 0;
    this.container.addChild(this.settingsPanel);

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

  private createButton(text: string, x: number, y: number, isSecondary: boolean = false): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const color = isSecondary ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.AMBER;
    const textColor = isSecondary ? 0xFFFFFF : GAME_CONFIG.COLORS.DARK_BROWN;

    btn.beginFill(color, 0.9);
    btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 250, 65, 15);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: textColor
    });
    btnText.anchor.set(0.5);
    btnText.x = 125;
    btnText.y = 32;
    btn.addChild(btnText);

    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.03, y: 1.03 }, 150);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 150);
    });

    return btn;
  }

  private showResetConfirm(): void {
    if (!this.settingsPanel) return;

    const confirmPanel = new PIXI.Container();
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.WARM_ORANGE, 1);
    bg.drawRoundedRect(100, 500, 550, 200, 15);
    bg.endFill();
    confirmPanel.addChild(bg);

    const text = new PIXI.Text('确定要重新开始吗？\n所有进度将会丢失。', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xFFFFFF,
      align: 'center'
    });
    text.anchor.set(0.5);
    text.x = 375;
    text.y = 560;
    confirmPanel.addChild(text);

    const confirmBtn = this.createButton('确定重置', 150, 620, true);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      store.resetGame();
      this.closeSettings();
      eventBus.emit('game:reset');
    });
    confirmPanel.addChild(confirmBtn);

    const cancelBtn = this.createButton('取消', 420, 620);
    cancelBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.settingsPanel?.removeChild(confirmPanel);
      confirmPanel.destroy();
    });
    confirmPanel.addChild(cancelBtn);

    this.settingsPanel.addChild(confirmPanel);
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
        this.container.removeChild(panel);
        panel.destroy();
        this.settingsPanel = null;
        this.isSettingsOpen = false;
      }
    );
  }

  private handleChapterEnter(data: { chapterId: string }): void {
    const chapter = store.getChapters().find(c => c.id === data.chapterId);
    if (chapter && (this.hudContainer as any).chapterLabel) {
      (this.hudContainer as any).chapterLabel.text = chapter.title;
    }
    this.updateProgress();
  }

  private handleChapterComplete(data: { chapterId: string }): void {
    this.showChapterComplete(data.chapterId);
    this.updateProgress();
  }

  private showChapterComplete(chapterId: string): void {
    const chapter = store.getChapters().find(c => c.id === chapterId);
    if (!chapter) return;

    const notification = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.85);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(100, 200, 550, 120, 15);
    bg.endFill();
    notification.addChild(bg);

    const icon = new PIXI.Text('✨', { fontSize: 36 });
    icon.x = 140;
    icon.y = 235;
    notification.addChild(icon);

    const title = new PIXI.Text('章节完成', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 200;
    title.y = 235;
    notification.addChild(title);

    const subtitle = new PIXI.Text(chapter.title, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    subtitle.x = 200;
    subtitle.y = 275;
    notification.addChild(subtitle);

    notification.y = -150;
    this.container.addChild(notification);

    Animator.animate(
      500,
      (progress) => {
        notification.y = -150 + progress * 200;
      },
      () => {
        Animator.delay(2500).then(() => {
          Animator.animate(
            500,
            (progress) => {
              notification.y = 50 - progress * 200;
            },
            () => {
              this.container.removeChild(notification);
              notification.destroy();
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  updateLocation(): void {
    const exhibition = store.getCurrentExhibition();
    if (exhibition && (this.hudContainer as any).locationLabel) {
      (this.hudContainer as any).locationLabel.text = exhibition.name;
    }
  }

  private updateProgress(): void {
    const chapter = store.getCurrentChapter();
    if (!chapter) return;

    const collectedCount = store.getCollectedClues().filter(
      c => chapter.requiredClues.includes(c.id)
    ).length;
    const totalRequired = chapter.requiredClues.length;
    const progress = totalRequired > 0 ? collectedCount / totalRequired : 0;

    const progressBar = (this.hudContainer as any).progressBar as PIXI.Graphics;
    if (progressBar) {
      progressBar.clear();
      progressBar.beginFill(GAME_CONFIG.COLORS.AMBER);
      progressBar.drawRoundedRect(20, 75, 300 * progress, 12, 6);
      progressBar.endFill();
    }
  }

  update(_delta: number): void {
    this.updateProgress();
    this.updateLocation();
  }

  destroy(): void {
    eventBus.off('chapter:enter', this.handleChapterEnter.bind(this));
    eventBus.off('chapter:complete', this.handleChapterComplete.bind(this));
    this.hudContainer.destroy();
    if (this.settingsPanel) {
      this.settingsPanel.destroy();
    }
  }
}
