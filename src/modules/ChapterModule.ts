import * as PIXI from 'pixi.js';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';
import { ChapterProgressAnalysis, ProgressPanelTab, ChapterKeyPoint, ChapterIncompleteCondition, MemoryFragmentGap } from '../game/types';

export class ChapterModule {
  private container: PIXI.Container;
  private hudContainer: PIXI.Container;
  private settingsPanel: PIXI.Container | null = null;
  private isSettingsOpen: boolean = false;
  private progressPanel: PIXI.Container | null = null;
  private isProgressPanelOpen: boolean = false;
  private currentProgressTab: ProgressPanelTab = 'overview';

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

    const progressBtn = this.createProgressButton();
    this.hudContainer.addChild(progressBtn);

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

  private createProgressButton(): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(0x000000, 0.6);
    btn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    btn.drawCircle(40, 40, 35);
    btn.endFill();

    const icon = new PIXI.Text('📊', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 40;
    icon.y = 40;
    btn.addChild(icon);

    btn.x = GAME_CONFIG.DESIGN_WIDTH - 90;
    btn.y = 180;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.toggleProgressPanel();
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

  private createSmallButton(text: string, x: number, y: number, isSecondary: boolean = false): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const color = isSecondary ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.AMBER;
    const textColor = isSecondary ? 0xFFFFFF : GAME_CONFIG.COLORS.DARK_BROWN;

    btn.beginFill(color, 0.9);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 90, 40, 10);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: textColor
    });
    btnText.anchor.set(0.5);
    btnText.x = 45;
    btnText.y = 20;
    btn.addChild(btnText);

    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 120);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 120);
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

  private toggleProgressPanel(): void {
    if (this.isProgressPanelOpen) {
      this.closeProgressPanel();
    } else {
      this.openProgressPanel();
    }
  }

  private openProgressPanel(): void {
    this.isProgressPanelOpen = true;
    this.currentProgressTab = 'overview';
    this.progressPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.progressPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.97);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(50, 150, 650, 900, 20);
    panel.endFill();
    this.progressPanel.addChild(panel);

    const title = new PIXI.Text('章节进度分析', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.anchor.set(0.5);
    title.x = 375;
    title.y = 200;
    this.progressPanel.addChild(title);

    this.createProgressTabs();
    this.refreshProgressContent();

    const closeBtn = this.createButton('关闭', 250, 980, true);
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeProgressPanel();
    });
    this.progressPanel.addChild(closeBtn);

    this.progressPanel.alpha = 0;
    this.container.addChild(this.progressPanel);

    Animator.animate(
      300,
      (progress) => {
        this.progressPanel!.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createProgressTabs(): void {
    if (!this.progressPanel) return;

    const tabs: { id: ProgressPanelTab; label: string; icon: string }[] = [
      { id: 'overview', label: '总览', icon: '📋' },
      { id: 'keypoints', label: '关键节点', icon: '🎯' },
      { id: 'incomplete', label: '未完成', icon: '⚠️' },
      { id: 'memorygaps', label: '记忆缺口', icon: '🧩' }
    ];

    tabs.forEach((tab, index) => {
      const isActive = this.currentProgressTab === tab.id;
      const tabBtn = new PIXI.Graphics();
      
      tabBtn.beginFill(isActive ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE, isActive ? 0.9 : 0.5);
      tabBtn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, isActive ? 1 : 0.6);
      tabBtn.drawRoundedRect(0, 0, 140, 50, 12);
      tabBtn.endFill();

      const iconText = new PIXI.Text(tab.icon, { fontSize: 20 });
      iconText.x = 15;
      iconText.y = 12;
      tabBtn.addChild(iconText);

      const labelText = new PIXI.Text(tab.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: isActive ? GAME_CONFIG.COLORS.DARK_BROWN : GAME_CONFIG.COLORS.CREAM
      });
      labelText.x = 45;
      labelText.y = 15;
      tabBtn.addChild(labelText);

      tabBtn.x = 65 + index * 150;
      tabBtn.y = 250;
      tabBtn.eventMode = 'static';
      tabBtn.cursor = 'pointer';

      tabBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.currentProgressTab = tab.id;
        this.refreshProgressContent();
      });

      this.progressPanel!.addChild(tabBtn);
    });
  }

  private refreshProgressContent(): void {
    if (!this.progressPanel) return;

    const contentArea = this.progressPanel.getChildByName('contentArea');
    if (contentArea) {
      this.progressPanel.removeChild(contentArea);
      contentArea.destroy();
    }

    const contentAreaContainer = new PIXI.Container();
    contentAreaContainer.name = 'contentArea';
    this.progressPanel.addChild(contentAreaContainer);

    const currentChapter = store.getCurrentChapter();
    if (!currentChapter) return;

    const analysis = store.analyzeChapterProgress(currentChapter.id);

    switch (this.currentProgressTab) {
      case 'overview':
        this.renderOverviewTab(contentAreaContainer, analysis);
        break;
      case 'keypoints':
        this.renderKeyPointsTab(contentAreaContainer, analysis.keyPoints);
        break;
      case 'incomplete':
        this.renderIncompleteTab(contentAreaContainer, analysis.incompleteConditions);
        break;
      case 'memorygaps':
        this.renderMemoryGapsTab(contentAreaContainer, analysis.memoryGaps);
        break;
    }
  }

  private renderOverviewTab(container: PIXI.Container, analysis: ChapterProgressAnalysis): void {
    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    progressBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    progressBg.drawRoundedRect(75, 320, 600, 100, 15);
    progressBg.endFill();
    container.addChild(progressBg);

    const progressLabel = new PIXI.Text(`章节完成度：${analysis.completionPercentage}%`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    progressLabel.x = 100;
    progressLabel.y = 350;
    container.addChild(progressLabel);

    const progressBarBg = new PIXI.Graphics();
    progressBarBg.beginFill(0x000000, 0.6);
    progressBarBg.drawRoundedRect(100, 390, 550, 20, 10);
    progressBarBg.endFill();
    container.addChild(progressBarBg);

    const progressBarFill = new PIXI.Graphics();
    progressBarFill.beginFill(GAME_CONFIG.COLORS.AMBER);
    progressBarFill.drawRoundedRect(100, 390, 550 * (analysis.completionPercentage / 100), 20, 10);
    progressBarFill.endFill();
    container.addChild(progressBarFill);

    const stats = [
      { icon: '🎯', label: '关键节点', value: `${analysis.completedKeyPoints}/${analysis.totalKeyPoints}` },
      { icon: '🧩', label: '记忆碎片', value: `${analysis.collectedMemoryFragments}/${analysis.totalMemoryFragments}` },
      { icon: '⚠️', label: '未完成项', value: `${analysis.incompleteConditions.length}` },
      { icon: '⏱️', label: '预计剩余', value: analysis.estimatedRemainingTime }
    ];

    stats.forEach((stat, index) => {
      const statBg = new PIXI.Graphics();
      statBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
      statBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.4);
      statBg.drawRoundedRect(75 + (index % 2) * 310, 440 + Math.floor(index / 2) * 80, 290, 70, 12);
      statBg.endFill();
      container.addChild(statBg);

      const iconText = new PIXI.Text(stat.icon, { fontSize: 28 });
      iconText.x = 100 + (index % 2) * 310;
      iconText.y = 455 + Math.floor(index / 2) * 80;
      container.addChild(iconText);

      const labelText = new PIXI.Text(stat.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      labelText.x = 145 + (index % 2) * 310;
      labelText.y = 455 + Math.floor(index / 2) * 80;
      container.addChild(labelText);

      const valueText = new PIXI.Text(stat.value, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      valueText.x = 145 + (index % 2) * 310;
      valueText.y = 478 + Math.floor(index / 2) * 80;
      container.addChild(valueText);
    });

    const suggestionBg = new PIXI.Graphics();
    suggestionBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.4);
    suggestionBg.lineStyle(2, GAME_CONFIG.COLORS.WARM_ORANGE, 0.6);
    suggestionBg.drawRoundedRect(75, 600, 600, 100, 15);
    suggestionBg.endFill();
    container.addChild(suggestionBg);

    const suggestionIcon = new PIXI.Text('💡', { fontSize: 32 });
    suggestionIcon.x = 100;
    suggestionIcon.y = 625;
    container.addChild(suggestionIcon);

    const suggestionLabel = new PIXI.Text('下一步建议', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    suggestionLabel.x = 145;
    suggestionLabel.y = 620;
    container.addChild(suggestionLabel);

    const suggestionText = new PIXI.Text(analysis.nextSuggestion, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM,
      wordWrap: true,
      wordWrapWidth: 500
    });
    suggestionText.x = 145;
    suggestionText.y = 655;
    container.addChild(suggestionText);

    const reviewBtn = this.createButton('查看关键节点回顾', 250, 720);
    reviewBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.currentProgressTab = 'keypoints';
      this.refreshProgressContent();
    });
    container.addChild(reviewBtn);
  }

  private renderKeyPointsTab(container: PIXI.Container, keyPoints: ChapterKeyPoint[]): void {
    const scrollArea = new PIXI.Container();
    scrollArea.name = 'scrollArea';
    container.addChild(scrollArea);

    const mask = new PIXI.Graphics();
    mask.beginFill(0x000000);
    mask.drawRect(50, 320, 650, 620);
    mask.endFill();
    scrollArea.mask = mask;
    container.addChild(mask);

    let yOffset = 0;
    keyPoints.forEach((kp) => {
      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(kp.isCompleted ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE, kp.isCompleted ? 0.3 : 0.2);
      itemBg.lineStyle(2, kp.isCompleted ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.6);
      itemBg.drawRoundedRect(75, 320 + yOffset, 600, 90, 12);
      itemBg.endFill();
      scrollArea.addChild(itemBg);

      const statusIcon = new PIXI.Text(kp.isCompleted ? '✅' : '⬜', { fontSize: 24 });
      statusIcon.x = 95;
      statusIcon.y = 345 + yOffset;
      scrollArea.addChild(statusIcon);

      const orderIcon = new PIXI.Graphics();
      orderIcon.beginFill(kp.isCompleted ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.8);
      orderIcon.drawCircle(0, 0, 18);
      orderIcon.endFill();
      orderIcon.x = 95;
      orderIcon.y = 380 + yOffset;
      scrollArea.addChild(orderIcon);

      const orderText = new PIXI.Text(kp.order.toString(), {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.DARK_BROWN
      });
      orderText.anchor.set(0.5);
      orderText.x = 95;
      orderText.y = 380 + yOffset;
      scrollArea.addChild(orderText);

      const typeIcons: Record<string, string> = {
        story: '📖', clue: '🔍', mechanism: '⚙️', exhibition: '🏛️', choice: '🤔'
      };
      const typeIcon = new PIXI.Text(typeIcons[kp.type] || '📌', { fontSize: 22 });
      typeIcon.x = 140;
      typeIcon.y = 343 + yOffset;
      scrollArea.addChild(typeIcon);

      const nameText = new PIXI.Text(kp.name, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: kp.isCompleted ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.CREAM
      });
      nameText.x = 175;
      nameText.y = 342 + yOffset;
      scrollArea.addChild(nameText);

      const descText = new PIXI.Text(kp.description, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.CREAM,
        wordWrap: true,
        wordWrapWidth: 450
      });
      descText.x = 175;
      descText.y = 372 + yOffset;
      scrollArea.addChild(descText);

      yOffset += 100;
    });

    if (keyPoints.length === 0) {
      const emptyText = new PIXI.Text('本章节暂无关键节点', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      emptyText.anchor.set(0.5);
      emptyText.x = 375;
      emptyText.y = 600;
      scrollArea.addChild(emptyText);
    }
  }

  private renderIncompleteTab(container: PIXI.Container, conditions: ChapterIncompleteCondition[]): void {
    const scrollArea = new PIXI.Container();
    scrollArea.name = 'scrollArea';
    container.addChild(scrollArea);

    const mask = new PIXI.Graphics();
    mask.beginFill(0x000000);
    mask.drawRect(50, 320, 650, 620);
    mask.endFill();
    scrollArea.mask = mask;
    container.addChild(mask);

    let yOffset = 0;
    conditions.forEach((condition) => {
      const priorityColors: Record<string, number> = {
        high: GAME_CONFIG.COLORS.WARM_ORANGE,
        medium: GAME_CONFIG.COLORS.AMBER,
        low: GAME_CONFIG.COLORS.BRONZE
      };
      const priorityIcons: Record<string, string> = {
        high: '🔴', medium: '🟡', low: '🟢'
      };
      const priorityLabels: Record<string, string> = {
        high: '高优先级', medium: '中优先级', low: '低优先级'
      };
      const typeIcons: Record<string, string> = {
        clue: '🔍', mechanism: '⚙️', exhibition: '🏛️', choice: '🤔', memory: '🧩'
      };

      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(priorityColors[condition.priority], 0.2);
      itemBg.lineStyle(2, priorityColors[condition.priority], 0.6);
      itemBg.drawRoundedRect(75, 320 + yOffset, 600, 130, 12);
      itemBg.endFill();
      scrollArea.addChild(itemBg);

      const priorityIcon = new PIXI.Text(priorityIcons[condition.priority], { fontSize: 24 });
      priorityIcon.x = 95;
      priorityIcon.y = 340 + yOffset;
      scrollArea.addChild(priorityIcon);

      const priorityLabel = new PIXI.Text(priorityLabels[condition.priority], {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: priorityColors[condition.priority]
      });
      priorityLabel.x = 130;
      priorityLabel.y = 345 + yOffset;
      scrollArea.addChild(priorityLabel);

      const typeIcon = new PIXI.Text(typeIcons[condition.type] || '📌', { fontSize: 22 });
      typeIcon.x = 550;
      typeIcon.y = 338 + yOffset;
      scrollArea.addChild(typeIcon);

      const nameText = new PIXI.Text(condition.targetName, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      nameText.x = 95;
      nameText.y = 370 + yOffset;
      scrollArea.addChild(nameText);

      const locationIcon = new PIXI.Text('📍', { fontSize: 16 });
      locationIcon.x = 95;
      locationIcon.y = 400 + yOffset;
      scrollArea.addChild(locationIcon);

      const locationText = new PIXI.Text(condition.location, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      locationText.x = 120;
      locationText.y = 400 + yOffset;
      scrollArea.addChild(locationText);

      const hintText = new PIXI.Text(`💡 ${condition.hint}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 15,
        fill: GAME_CONFIG.COLORS.CREAM,
        wordWrap: true,
        wordWrapWidth: 550
      });
      hintText.x = 95;
      hintText.y = 422 + yOffset;
      scrollArea.addChild(hintText);

      yOffset += 140;
    });

    if (conditions.length === 0) {
      const successBg = new PIXI.Graphics();
      successBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.3);
      successBg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
      successBg.drawRoundedRect(150, 500, 450, 150, 20);
      successBg.endFill();
      scrollArea.addChild(successBg);

      const successIcon = new PIXI.Text('🎉', { fontSize: 48 });
      successIcon.anchor.set(0.5);
      successIcon.x = 375;
      successIcon.y = 555;
      scrollArea.addChild(successIcon);

      const successText = new PIXI.Text('太棒了！所有条件都已完成！', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 24,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      successText.anchor.set(0.5);
      successText.x = 375;
      successText.y = 605;
      scrollArea.addChild(successText);
    }
  }

  private renderMemoryGapsTab(container: PIXI.Container, gaps: MemoryFragmentGap[]): void {
    const scrollArea = new PIXI.Container();
    scrollArea.name = 'scrollArea';
    container.addChild(scrollArea);

    const mask = new PIXI.Graphics();
    mask.beginFill(0x000000);
    mask.drawRect(50, 320, 650, 620);
    mask.endFill();
    scrollArea.mask = mask;
    container.addChild(mask);

    let yOffset = 0;
    gaps.forEach((gap) => {
      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(gap.isCollected ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE, gap.isCollected ? 0.3 : 0.2);
      itemBg.lineStyle(2, gap.isCollected ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.6);
      itemBg.drawRoundedRect(75, 320 + yOffset, 600, 140, 12);
      itemBg.endFill();
      scrollArea.addChild(itemBg);

      const statusIcon = new PIXI.Text(gap.isCollected ? '✅' : '❌', { fontSize: 28 });
      statusIcon.x = 95;
      statusIcon.y = 345 + yOffset;
      scrollArea.addChild(statusIcon);

      const orderBg = new PIXI.Graphics();
      orderBg.beginFill(gap.isCollected ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.8);
      orderBg.drawCircle(0, 0, 22);
      orderBg.endFill();
      orderBg.x = 110;
      orderBg.y = 410 + yOffset;
      scrollArea.addChild(orderBg);

      const orderText = new PIXI.Text(`#${gap.memoryOrder}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.DARK_BROWN
      });
      orderText.anchor.set(0.5);
      orderText.x = 110;
      orderText.y = 410 + yOffset;
      scrollArea.addChild(orderText);

      const nameText = new PIXI.Text(gap.fragmentName, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: gap.isCollected ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.CREAM
      });
      nameText.x = 150;
      nameText.y = 343 + yOffset;
      scrollArea.addChild(nameText);

      const locationIcon = new PIXI.Text('📍', { fontSize: 16 });
      locationIcon.x = 150;
      locationIcon.y = 375 + yOffset;
      scrollArea.addChild(locationIcon);

      const locationText = new PIXI.Text(gap.location, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      locationText.x = 175;
      locationText.y = 375 + yOffset;
      scrollArea.addChild(locationText);

      if (gap.requiredForPhase) {
        const phaseTag = new PIXI.Graphics();
        phaseTag.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
        phaseTag.drawRoundedRect(0, 0, 80, 26, 8);
        phaseTag.endFill();
        phaseTag.x = 560;
        phaseTag.y = 340 + yOffset;
        scrollArea.addChild(phaseTag);

        const phaseText = new PIXI.Text(`第${gap.requiredForPhase}阶段`, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 14,
          fill: GAME_CONFIG.COLORS.DARK_BROWN
        });
        phaseText.anchor.set(0.5);
        phaseText.x = 600;
        phaseText.y = 353 + yOffset;
        scrollArea.addChild(phaseText);
      }

      const descText = new PIXI.Text(gap.description, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 15,
        fill: GAME_CONFIG.COLORS.CREAM,
        wordWrap: true,
        wordWrapWidth: 400
      });
      descText.x = 150;
      descText.y = 400 + yOffset;
      scrollArea.addChild(descText);

      const hintText = new PIXI.Text(gap.hint, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      hintText.x = 150;
      hintText.y = 435 + yOffset;
      scrollArea.addChild(hintText);

      if (!gap.isCollected && gap.exhibitionId) {
        const goBtn = this.createSmallButton('前往', 580, 400 + yOffset);
        goBtn.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          store.navigateToExhibition(gap.exhibitionId);
          eventBus.emit('exhibition:change', { exhibitionId: gap.exhibitionId });
          this.closeProgressPanel();
        });
        scrollArea.addChild(goBtn);
      }

      yOffset += 150;
    });

    if (gaps.length === 0) {
      const emptyText = new PIXI.Text('本章节暂无记忆碎片', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      emptyText.anchor.set(0.5);
      emptyText.x = 375;
      emptyText.y = 600;
      scrollArea.addChild(emptyText);
    }
  }



  private closeProgressPanel(): void {
    if (!this.progressPanel) return;

    const panel = this.progressPanel;
    Animator.animate(
      200,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.progressPanel = null;
        this.isProgressPanelOpen = false;
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
    this.updateProgress();
    eventBus.emit('progress:chapter-complete', { chapterId: data.chapterId });
    this.showChapterComplete(data.chapterId, () => {
      this.showExhibitionUnlockAnimation(data.chapterId, () => {
        store.clearNewlyUnlockedExhibitions();
        this.showArchivePrompt(data.chapterId, () => {
          this.showChapterKeyPointReview(data.chapterId, () => {
            this.showNextStepGuide(data.chapterId, () => {
              this.updateProgress();
            });
          });
        });
      });
    });
  }

  private showChapterComplete(chapterId: string, onComplete: () => void): void {
    const chapter = store.getChapters().find(c => c.id === chapterId);
    if (!chapter) {
      onComplete();
      return;
    }

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
        Animator.delay(2000).then(() => {
          Animator.animate(
            500,
            (progress) => {
              notification.y = 50 - progress * 200;
            },
            () => {
              this.container.removeChild(notification);
              notification.destroy();
              onComplete();
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  private showChapterKeyPointReview(chapterId: string, onComplete: () => void): void {
    const review = store.getChapterKeyPointReview(chapterId);
    if (!review) {
      onComplete();
      return;
    }

    const chapter = store.getChapterById(chapterId);
    const state = store.getState();

    const unarchivedClues = chapter?.requiredClues.filter(clueId => 
      state.collectedClues.includes(clueId) && !state.archive.archivedClues.includes(clueId)
    ) || [];

    const unlockedExhibitions = store.getChapterNewExhibitions(chapterId);

    const reviewPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    reviewPanel.addChild(overlay);

    const panelHeight = 1220;
    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.97);
    panel.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    panel.drawRoundedRect(50, 40, 650, panelHeight, 20);
    panel.endFill();
    reviewPanel.addChild(panel);

    const titleIcon = new PIXI.Text('🏆', { fontSize: 48 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = 375;
    titleIcon.y = 100;
    reviewPanel.addChild(titleIcon);

    const title = new PIXI.Text('章节完成', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    title.anchor.set(0.5);
    title.x = 375;
    title.y = 150;
    reviewPanel.addChild(title);

    const chapterTitle = new PIXI.Text(review.chapterTitle, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    chapterTitle.anchor.set(0.5);
    chapterTitle.x = 375;
    chapterTitle.y = 190;
    reviewPanel.addChild(chapterTitle);

    const playTimeMin = Math.round(review.chapterPlayTime / 60000);
    const playTimeText = new PIXI.Text(`⏱️ 本章节用时：${playTimeMin}分钟`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    playTimeText.anchor.set(0.5);
    playTimeText.x = 375;
    playTimeText.y = 230;
    reviewPanel.addChild(playTimeText);

    const summaryBg = new PIXI.Graphics();
    summaryBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    summaryBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    summaryBg.drawRoundedRect(75, 260, 600, 100, 15);
    summaryBg.endFill();
    reviewPanel.addChild(summaryBg);

    const summaryLabel = new PIXI.Text('📖 章节概要', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    summaryLabel.x = 100;
    summaryLabel.y = 280;
    reviewPanel.addChild(summaryLabel);

    const summaryText = new PIXI.Text(review.storySummary, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM,
      wordWrap: true,
      wordWrapWidth: 550
    });
    summaryText.x = 100;
    summaryText.y = 310;
    reviewPanel.addChild(summaryText);

    let currentY = 380;

    if (unlockedExhibitions.length > 0) {
      const unlockBg = new PIXI.Graphics();
      unlockBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.25);
      unlockBg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 0.8);
      unlockBg.drawRoundedRect(75, currentY, 600, 100, 15);
      unlockBg.endFill();
      reviewPanel.addChild(unlockBg);

      const unlockIcon = new PIXI.Text('🔓', { fontSize: 28 });
      unlockIcon.x = 100;
      unlockIcon.y = currentY + 20;
      reviewPanel.addChild(unlockIcon);

      const unlockLabel = new PIXI.Text(`新展区解锁！ (${unlockedExhibitions.length}个)`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.GOLD,
        fontWeight: 'bold'
      });
      unlockLabel.x = 140;
      unlockLabel.y = currentY + 25;
      reviewPanel.addChild(unlockLabel);

      const unlockNames = unlockedExhibitions.map(exh => exh.name).filter(n => n).join('、');

      const unlockNamesText = new PIXI.Text(unlockNames, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      unlockNamesText.x = 140;
      unlockNamesText.y = currentY + 55;
      reviewPanel.addChild(unlockNamesText);

      const unlockHint = new PIXI.Text('点击下方「前往新展区」立即探索', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      unlockHint.x = 140;
      unlockHint.y = currentY + 78;
      reviewPanel.addChild(unlockHint);

      currentY += 115;
    }

    const keyPointsBg = new PIXI.Graphics();
    keyPointsBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    keyPointsBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    keyPointsBg.drawRoundedRect(75, currentY, 600, 380, 15);
    keyPointsBg.endFill();
    reviewPanel.addChild(keyPointsBg);

    const keyPointsLabel = new PIXI.Text(`🎯 关键节点回顾 (${review.completedKeyPoints.length}个)`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    keyPointsLabel.x = 100;
    keyPointsLabel.y = currentY + 20;
    reviewPanel.addChild(keyPointsLabel);

    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0x000000);
    scrollMask.drawRect(75, currentY + 55, 600, 310);
    scrollMask.endFill();
    reviewPanel.addChild(scrollMask);

    const keyPointsScroll = new PIXI.Container();
    keyPointsScroll.mask = scrollMask;
    reviewPanel.addChild(keyPointsScroll);

    let yOffset = 0;
    review.completedKeyPoints.slice(0, 8).forEach((kp) => {
      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
      itemBg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.6);
      itemBg.drawRoundedRect(100, yOffset, 550, 45, 10);
      itemBg.endFill();
      keyPointsScroll.addChild(itemBg);

      const typeIcons: Record<string, string> = {
        story: '📖', clue: '🔍', mechanism: '⚙️', exhibition: '🏛️', choice: '🤔'
      };

      const typeIcon = new PIXI.Text(typeIcons[kp.type] || '📌', { fontSize: 18 });
      typeIcon.x = 120;
      typeIcon.y = yOffset + 12;
      keyPointsScroll.addChild(typeIcon);

      const orderText = new PIXI.Text(`#${kp.order}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      orderText.x = 150;
      orderText.y = yOffset + 15;
      keyPointsScroll.addChild(orderText);

      const nameText = new PIXI.Text(kp.name, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      nameText.x = 190;
      nameText.y = yOffset + 14;
      keyPointsScroll.addChild(nameText);

      yOffset += 55;
    });

    currentY += 395;

    if (review.memoryFragmentsCollected.length > 0) {
      const memoryBg = new PIXI.Graphics();
      memoryBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.3);
      memoryBg.lineStyle(2, GAME_CONFIG.COLORS.WARM_ORANGE, 0.6);
      memoryBg.drawRoundedRect(75, currentY, 600, 60, 15);
      memoryBg.endFill();
      reviewPanel.addChild(memoryBg);

      const memoryIcon = new PIXI.Text('🧩', { fontSize: 24 });
      memoryIcon.x = 100;
      memoryIcon.y = currentY + 15;
      reviewPanel.addChild(memoryIcon);

      const memoryText = new PIXI.Text(`收集记忆碎片：${review.memoryFragmentsCollected.length}个`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      memoryText.x = 140;
      memoryText.y = currentY + 20;
      reviewPanel.addChild(memoryText);

      currentY += 75;
    }

    if (unarchivedClues.length > 0) {
      const archiveBg = new PIXI.Graphics();
      archiveBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
      archiveBg.lineStyle(3, GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
      archiveBg.drawRoundedRect(75, currentY, 600, 120, 15);
      archiveBg.endFill();
      reviewPanel.addChild(archiveBg);

      const archiveIcon = new PIXI.Text('📚', { fontSize: 28 });
      archiveIcon.x = 100;
      archiveIcon.y = currentY + 18;
      reviewPanel.addChild(archiveIcon);

      const archiveLabel = new PIXI.Text(`线索待归档 (${unarchivedClues.length}条)`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        fontWeight: 'bold'
      });
      archiveLabel.x = 140;
      archiveLabel.y = currentY + 23;
      reviewPanel.addChild(archiveLabel);

      const archiveHint = new PIXI.Text('将收集的线索归档到档案室，完善你的调查档案', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 15,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      archiveHint.x = 140;
      archiveHint.y = currentY + 52;
      reviewPanel.addChild(archiveHint);

      const archiveBtn = new PIXI.Graphics();
      archiveBtn.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 0.9);
      archiveBtn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 1);
      archiveBtn.drawRoundedRect(140, currentY + 78, 160, 35, 10);
      archiveBtn.endFill();
      reviewPanel.addChild(archiveBtn);

      const archiveBtnText = new PIXI.Text('📋 前往归档', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: 0xFFFFFF
      });
      archiveBtnText.anchor.set(0.5);
      archiveBtnText.x = 220;
      archiveBtnText.y = currentY + 96;
      reviewPanel.addChild(archiveBtnText);

      archiveBtn.eventMode = 'static';
      archiveBtn.cursor = 'pointer';
      archiveBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        Animator.animate(
          300,
          (progress) => {
            reviewPanel.alpha = 1 - progress;
          },
          () => {
            this.container.removeChild(reviewPanel);
            reviewPanel.destroy();
            eventBus.emit('archive:open', { chapterId });
            onComplete();
          }
        );
      });
      archiveBtn.on('pointerover', () => {
        Animator.tween(archiveBtn.scale, { x: 1.05, y: 1.05 }, 150);
      });
      archiveBtn.on('pointerout', () => {
        Animator.tween(archiveBtn.scale, { x: 1, y: 1 }, 150);
      });

      currentY += 135;
    }

    const guidanceBg = new PIXI.Graphics();
    guidanceBg.beginFill(GAME_CONFIG.COLORS.GOLD, 0.15);
    guidanceBg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.6);
    guidanceBg.drawRoundedRect(75, currentY, 600, 80, 15);
    guidanceBg.endFill();
    reviewPanel.addChild(guidanceBg);

    const guidanceIcon = new PIXI.Text('🧭', { fontSize: 28 });
    guidanceIcon.x = 100;
    guidanceIcon.y = currentY + 25;
    reviewPanel.addChild(guidanceIcon);

    const guidanceLabel = new PIXI.Text('下一步行动', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.GOLD,
      fontWeight: 'bold'
    });
    guidanceLabel.x = 140;
    guidanceLabel.y = currentY + 30;
    reviewPanel.addChild(guidanceLabel);

    let nextActionText = '继续探索，发现更多线索和秘密';
    if (unlockedExhibitions.length > 0) {
      nextActionText = `前往「${unlockedExhibitions[0].name || '新展区'}」继续调查`;
    } else if (unarchivedClues.length > 0) {
      nextActionText = '前往档案室归档收集的线索';
    } else {
      const nextChapter = store.getNextChapter(chapterId);
      if (nextChapter) {
        nextActionText = `进入「${nextChapter.title}」章节继续冒险`;
      }
    }

    const guidanceText = new PIXI.Text(nextActionText, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    guidanceText.x = 140;
    guidanceText.y = currentY + 55;
    reviewPanel.addChild(guidanceText);

    currentY += 95;

    let btnX = 250;
    let goToExhibitionBtn: PIXI.Graphics | null = null;

    if (unlockedExhibitions.length > 0) {
      btnX = 150;

      goToExhibitionBtn = new PIXI.Graphics();
      goToExhibitionBtn.beginFill(GAME_CONFIG.COLORS.GOLD, 0.95);
      goToExhibitionBtn.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
      goToExhibitionBtn.drawRoundedRect(btnX, currentY, 200, 55, 15);
      goToExhibitionBtn.endFill();
      reviewPanel.addChild(goToExhibitionBtn);

      const goToBtnText = new PIXI.Text('🏛️ 前往新展区', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.DARK_BROWN,
        fontWeight: 'bold'
      });
      goToBtnText.anchor.set(0.5);
      goToBtnText.x = btnX + 100;
      goToBtnText.y = currentY + 28;
      reviewPanel.addChild(goToBtnText);

      goToExhibitionBtn.eventMode = 'static';
      goToExhibitionBtn.cursor = 'pointer';
      goToExhibitionBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        Animator.animate(
          300,
          (progress) => {
            reviewPanel.alpha = 1 - progress;
          },
          () => {
            this.container.removeChild(reviewPanel);
            reviewPanel.destroy();
            if (unlockedExhibitions.length > 0) {
              eventBus.emit('exhibition:enter', { exhibitionId: unlockedExhibitions[0].id });
            }
            onComplete();
          }
        );
      });
      goToExhibitionBtn.on('pointerover', () => {
        if (goToExhibitionBtn) {
          Animator.tween(goToExhibitionBtn.scale, { x: 1.05, y: 1.05 }, 150);
        }
      });
      goToExhibitionBtn.on('pointerout', () => {
        if (goToExhibitionBtn) {
          Animator.tween(goToExhibitionBtn.scale, { x: 1, y: 1 }, 150);
        }
      });

      btnX = 400;
    }

    const continueBtn = this.createButton('继续冒险', btnX, currentY);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      Animator.animate(
        300,
        (progress) => {
          reviewPanel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(reviewPanel);
          reviewPanel.destroy();
          onComplete();
        }
      );
    });
    reviewPanel.addChild(continueBtn);

    reviewPanel.alpha = 0;
    this.container.addChild(reviewPanel);

    Animator.animate(
      500,
      (progress) => {
        reviewPanel.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private showExhibitionUnlockAnimation(chapterId: string, onComplete: () => void): void {
    const newExhibitions = store.getChapterNewExhibitions(chapterId);
    
    if (newExhibitions.length === 0) {
      onComplete();
      return;
    }

    const unlockPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.92);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    unlockPanel.addChild(overlay);

    const titleIcon = new PIXI.Text('🔓', { fontSize: 72 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleIcon.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 150;
    unlockPanel.addChild(titleIcon);

    const title = new PIXI.Text('新展区解锁', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 70;
    unlockPanel.addChild(title);

    const startY = GAME_CONFIG.DESIGN_HEIGHT / 2 - 20;
    const itemHeight = 120;
    const gap = 20;

    newExhibitions.forEach((exhibition, index) => {
      const item = new PIXI.Container();
      item.y = startY + index * (itemHeight + gap);
      item.alpha = 0;
      item.scale.set(0.8);

      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
      itemBg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
      itemBg.drawRoundedRect(100, 0, 550, itemHeight, 15);
      itemBg.endFill();
      item.addChild(itemBg);

      const glow = new PIXI.Graphics();
      glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
      glow.drawRoundedRect(95, -5, 560, itemHeight + 10, 18);
      glow.endFill();
      item.addChildAt(glow, 0);

      const iconBg = new PIXI.Graphics();
      iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.3);
      iconBg.drawCircle(0, 0, 40);
      iconBg.endFill();
      iconBg.x = 160;
      iconBg.y = itemHeight / 2;
      item.addChild(iconBg);

      const icon = new PIXI.Text('🏛️', { fontSize: 40 });
      icon.anchor.set(0.5);
      icon.x = 160;
      icon.y = itemHeight / 2;
      item.addChild(icon);

      const name = new PIXI.Text(exhibition.name, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 24,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      name.x = 220;
      name.y = 25;
      item.addChild(name);

      const desc = new PIXI.Text(exhibition.description.slice(0, 45) + '...', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: 0xCCCCCC,
        wordWrap: true,
        wordWrapWidth: 400
      });
      desc.x = 220;
      desc.y = 60;
      item.addChild(desc);

      unlockPanel.addChild(item);

      Animator.delay(300 + index * 200).then(() => {
        Animator.animate(
          500,
          (progress) => {
            item.alpha = progress;
            item.scale.set(0.8 + progress * 0.2);
            glow.clear();
            glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.3);
            glow.drawRoundedRect(95, -5, 560, itemHeight + 10, 18);
            glow.endFill();
          },
          undefined,
          Animator.easeOutBack
        );
      });
    });

    const hintText = new PIXI.Text('点击任意位置继续', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center'
    });
    hintText.anchor.set(0.5);
    hintText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hintText.y = GAME_CONFIG.DESIGN_HEIGHT - 150;
    hintText.alpha = 0;
    unlockPanel.addChild(hintText);

    const totalDuration = 300 + newExhibitions.length * 200 + 600;
    Animator.delay(totalDuration).then(() => {
      Animator.animate(
        800,
        (progress) => {
          hintText.alpha = progress;
          hintText.y = GAME_CONFIG.DESIGN_HEIGHT - 150 + Math.sin(progress * Math.PI * 4) * 5;
        },
        undefined,
        undefined,
        true
      );
    });

    unlockPanel.alpha = 0;
    this.container.addChild(unlockPanel);

    let canContinue = false;
    Animator.animate(
      500,
      (progress) => {
        unlockPanel.alpha = progress;
      },
      () => {
        Animator.delay(totalDuration).then(() => {
          canContinue = true;
        });
      },
      Animator.easeOutCubic
    );

    overlay.on('pointerdown', () => {
      if (!canContinue) return;
      audioModule.playSFX('sfx_click');
      Animator.animate(
        400,
        (progress) => {
          unlockPanel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(unlockPanel);
          unlockPanel.destroy();
          onComplete();
        }
      );
    });
  }

  private showArchivePrompt(chapterId: string, onComplete: () => void): void {
    const archiveProgress = store.getArchiveProgressForChapter(chapterId);
    const chapter = store.getChapterById(chapterId);

    if (archiveProgress.unarchived.length === 0 || !chapter) {
      onComplete();
      return;
    }

    const promptPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    promptPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.97);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(75, 250, 600, 800, 20);
    panel.endFill();
    promptPanel.addChild(panel);

    const titleIcon = new PIXI.Text('📁', { fontSize: 64 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleIcon.y = 330;
    promptPanel.addChild(titleIcon);

    const title = new PIXI.Text('线索归档', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 400;
    promptPanel.addChild(title);

    const subtitle = new PIXI.Text(`「${chapter.title}」的调查告一段落`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 445;
    promptPanel.addChild(subtitle);

    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    progressBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    progressBg.drawRoundedRect(125, 490, 500, 60, 15);
    progressBg.endFill();
    promptPanel.addChild(progressBg);

    const progressPercent = archiveProgress.total > 0 
      ? archiveProgress.archived / archiveProgress.total 
      : 0;
    const progressFill = new PIXI.Graphics();
    progressFill.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
    progressFill.drawRoundedRect(125, 490, 500 * progressPercent, 60, 15);
    progressFill.endFill();
    promptPanel.addChild(progressFill);

    const progressText = new PIXI.Text(
      `归档进度: ${archiveProgress.archived} / ${archiveProgress.total}`,
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.GOLD
      }
    );
    progressText.anchor.set(0.5);
    progressText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    progressText.y = 520;
    promptPanel.addChild(progressText);

    if (archiveProgress.unarchived.length > 0) {
      const hintTitle = new PIXI.Text('待归档线索', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 22,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      hintTitle.x = 125;
      hintTitle.y = 580;
      promptPanel.addChild(hintTitle);

      let yOffset = 620;
      archiveProgress.unarchived.slice(0, 4).forEach((clueId, _index) => {
        const clue = store.getClueById(clueId);
        if (!clue) return;

        const itemBg = new PIXI.Graphics();
        itemBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
        itemBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
        itemBg.drawRoundedRect(125, yOffset, 500, 55, 10);
        itemBg.endFill();
        promptPanel.addChild(itemBg);

        const iconText = new PIXI.Text(clue.icon, { fontSize: 28 });
        iconText.x = 145;
        iconText.y = yOffset + 10;
        promptPanel.addChild(iconText);

        const nameText = new PIXI.Text(clue.name, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: GAME_CONFIG.COLORS.CREAM
        });
        nameText.x = 190;
        nameText.y = yOffset + 15;
        promptPanel.addChild(nameText);

        yOffset += 65;
      });

      if (archiveProgress.unarchived.length > 4) {
        const moreText = new PIXI.Text(`...还有 ${archiveProgress.unarchived.length - 4} 条线索待归档`, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 16,
          fill: GAME_CONFIG.COLORS.WARM_ORANGE
        });
        moreText.x = 125;
        moreText.y = yOffset + 10;
        promptPanel.addChild(moreText);
      }
    }

    const tipBg = new PIXI.Graphics();
    tipBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.15);
    tipBg.lineStyle(2, GAME_CONFIG.COLORS.WARM_ORANGE, 0.6);
    tipBg.drawRoundedRect(125, 680, 500, 70, 12);
    tipBg.endFill();
    promptPanel.addChild(tipBg);

    const tipIcon = new PIXI.Text('💡', { fontSize: 28 });
    tipIcon.x = 150;
    tipIcon.y = 700;
    promptPanel.addChild(tipIcon);

    const tipText = new PIXI.Text(
      '归档线索可解锁馆长的口述录音，\n了解更多背后的故事',
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        lineHeight: 24
      }
    );
    tipText.x = 195;
    tipText.y = 695;
    promptPanel.addChild(tipText);

    const archiveBtn = this.createButton('立即归档', 125, 780);
    archiveBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      Animator.animate(
        300,
        (progress) => {
          promptPanel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(promptPanel);
          promptPanel.destroy();
          eventBus.emit('archive:auto-archive', { chapterId });
          archiveProgress.unarchived.forEach(clueId => {
            store.archiveClue(clueId);
          });
          store.completeChapterArchive(chapterId);
          onComplete();
        }
      );
    });
    promptPanel.addChild(archiveBtn);

    const skipBtn = this.createButton('稍后再说', 125, 865, true);
    skipBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      Animator.animate(
        300,
        (progress) => {
          promptPanel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(promptPanel);
          promptPanel.destroy();
          onComplete();
        }
      );
    });
    promptPanel.addChild(skipBtn);

    promptPanel.alpha = 0;
    this.container.addChild(promptPanel);

    Animator.animate(
      400,
      (progress) => {
        promptPanel.alpha = progress;
        promptPanel.scale.set(0.95 + progress * 0.05);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private showNextStepGuide(chapterId: string, onComplete: () => void): void {
    const nextChapter = store.getNextChapter(chapterId);
    const currentChapter = store.getChapterById(chapterId);
    const newExhibitions = store.getChapterNewExhibitions(chapterId);

    const guidePanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.88);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    guidePanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.97);
    panel.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    panel.drawRoundedRect(50, 200, 650, 900, 25);
    panel.endFill();
    guidePanel.addChild(panel);

    const titleIcon = new PIXI.Text('✨', { fontSize: 64 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleIcon.y = 290;
    guidePanel.addChild(titleIcon);

    const title = new PIXI.Text('旅程继续', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 38,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 360;
    guidePanel.addChild(title);

    if (currentChapter) {
      const summary = new PIXI.Text(
        `你已完成「${currentChapter.title}」\n琥珀的记忆正在逐渐苏醒...`,
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 20,
          fill: GAME_CONFIG.COLORS.CREAM,
          align: 'center',
          lineHeight: 32
        }
      );
      summary.anchor.set(0.5);
      summary.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      summary.y = 410;
      guidePanel.addChild(summary);
    }

    let currentY = 470;

    if (nextChapter) {
      const nextChapterBg = new PIXI.Graphics();
      nextChapterBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
      nextChapterBg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.8);
      nextChapterBg.drawRoundedRect(100, currentY, 550, 140, 15);
      nextChapterBg.endFill();
      guidePanel.addChild(nextChapterBg);

      const nextIcon = new PIXI.Text('📖', { fontSize: 44 });
      nextIcon.x = 130;
      nextIcon.y = currentY + 40;
      guidePanel.addChild(nextIcon);

      const nextLabel = new PIXI.Text('下一章节', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      nextLabel.x = 190;
      nextLabel.y = currentY + 30;
      guidePanel.addChild(nextLabel);

      const nextTitle = new PIXI.Text(nextChapter.title, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 24,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      nextTitle.x = 190;
      nextTitle.y = currentY + 55;
      guidePanel.addChild(nextTitle);

      const nextDesc = new PIXI.Text(
        nextChapter.description.slice(0, 50) + '...',
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 15,
          fill: 0xCCCCCC,
          wordWrap: true,
          wordWrapWidth: 420
        }
      );
      nextDesc.x = 190;
      nextDesc.y = currentY + 88;
      guidePanel.addChild(nextDesc);

      currentY += 160;
    }

    if (newExhibitions.length > 0) {
      const newExhLabel = new PIXI.Text('🗺️ 已解锁展区', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 22,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      newExhLabel.x = 100;
      newExhLabel.y = currentY;
      guidePanel.addChild(newExhLabel);
      currentY += 40;

      newExhibitions.slice(0, 3).forEach((exhibition, _index) => {
        const exhBg = new PIXI.Graphics();
        exhBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
        exhBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
        exhBg.drawRoundedRect(100, currentY, 550, 60, 12);
        exhBg.endFill();
        guidePanel.addChild(exhBg);

        const exhIcon = new PIXI.Text('🏛️', { fontSize: 26 });
        exhIcon.x = 125;
        exhIcon.y = currentY + 12;
        guidePanel.addChild(exhIcon);

        const exhName = new PIXI.Text(exhibition.name, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: GAME_CONFIG.COLORS.CREAM
        });
        exhName.x = 170;
        exhName.y = currentY + 17;
        guidePanel.addChild(exhName);

        const goBtn = this.createSmallButton('前往', 530, currentY + 10);
        goBtn.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          Animator.animate(
            300,
            (progress) => {
              guidePanel.alpha = 1 - progress;
            },
            () => {
              this.container.removeChild(guidePanel);
              guidePanel.destroy();
              store.navigateToExhibition(exhibition.id);
              eventBus.emit('exhibition:change', { exhibitionId: exhibition.id });
              onComplete();
            }
          );
        });
        guidePanel.addChild(goBtn);

        currentY += 70;
      });
    }

    const tipsBg = new PIXI.Graphics();
    tipsBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.25);
    tipsBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.4);
    tipsBg.drawRoundedRect(100, currentY + 10, 550, 80, 12);
    tipsBg.endFill();
    guidePanel.addChild(tipsBg);

    const tipsIcon = new PIXI.Text('🎯', { fontSize: 28 });
    tipsIcon.x = 125;
    tipsIcon.y = currentY + 32;
    guidePanel.addChild(tipsIcon);

    const tipsText = new PIXI.Text(
      nextChapter 
        ? '建议：先探索新解锁的展区，\n收集线索后推进下一章节'
        : '所有章节已完成，\n前往终章揭晓最终结局',
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.CREAM,
        lineHeight: 24
      }
    );
    tipsText.x = 165;
    tipsText.y = currentY + 28;
    guidePanel.addChild(tipsText);

    const continueBtn = this.createButton('继续探索', 250, currentY + 110);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      Animator.animate(
        300,
        (progress) => {
          guidePanel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(guidePanel);
          guidePanel.destroy();
          onComplete();
        }
      );
    });
    guidePanel.addChild(continueBtn);

    const archiveBtn = this.createButton('查看档案', 250, currentY + 190, true);
    archiveBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      Animator.animate(
        300,
        (progress) => {
          guidePanel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(guidePanel);
          guidePanel.destroy();
          eventBus.emit('archive:open', { chapterId });
          onComplete();
        }
      );
    });
    guidePanel.addChild(archiveBtn);

    guidePanel.alpha = 0;
    this.container.addChild(guidePanel);

    Animator.animate(
      450,
      (progress) => {
        guidePanel.alpha = progress;
        guidePanel.scale.set(0.92 + progress * 0.08);
      },
      undefined,
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
    if (this.progressPanel) {
      this.progressPanel.destroy();
    }
  }
}
