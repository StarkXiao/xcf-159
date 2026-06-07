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

  private createSmallButton(text: string, x: number, y: number): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 80, 40, 10);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    btnText.anchor.set(0.5);
    btnText.x = 40;
    btnText.y = 20;
    btn.addChild(btnText);

    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 100);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 100);
    });

    return btn;
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
    this.showChapterComplete(data.chapterId);
    this.updateProgress();
    eventBus.emit('progress:chapter-complete', { chapterId: data.chapterId });
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
        Animator.delay(2000).then(() => {
          Animator.animate(
            500,
            (progress) => {
              notification.y = 50 - progress * 200;
            },
            () => {
              this.container.removeChild(notification);
              notification.destroy();
              this.showChapterKeyPointReview(chapterId);
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  private showChapterKeyPointReview(chapterId: string): void {
    const review = store.getChapterKeyPointReview(chapterId);
    if (!review) return;

    const reviewPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    reviewPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.97);
    panel.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    panel.drawRoundedRect(50, 100, 650, 1000, 20);
    panel.endFill();
    reviewPanel.addChild(panel);

    const titleIcon = new PIXI.Text('🏆', { fontSize: 48 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = 375;
    titleIcon.y = 160;
    reviewPanel.addChild(titleIcon);

    const title = new PIXI.Text('章节回顾', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    title.anchor.set(0.5);
    title.x = 375;
    title.y = 210;
    reviewPanel.addChild(title);

    const chapterTitle = new PIXI.Text(review.chapterTitle, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    chapterTitle.anchor.set(0.5);
    chapterTitle.x = 375;
    chapterTitle.y = 250;
    reviewPanel.addChild(chapterTitle);

    const playTimeMin = Math.round(review.chapterPlayTime / 60000);
    const playTimeText = new PIXI.Text(`⏱️ 本章节用时：${playTimeMin}分钟`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    playTimeText.anchor.set(0.5);
    playTimeText.x = 375;
    playTimeText.y = 290;
    reviewPanel.addChild(playTimeText);

    const summaryBg = new PIXI.Graphics();
    summaryBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    summaryBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    summaryBg.drawRoundedRect(75, 320, 600, 100, 15);
    summaryBg.endFill();
    reviewPanel.addChild(summaryBg);

    const summaryLabel = new PIXI.Text('📖 章节概要', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    summaryLabel.x = 100;
    summaryLabel.y = 340;
    reviewPanel.addChild(summaryLabel);

    const summaryText = new PIXI.Text(review.storySummary, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM,
      wordWrap: true,
      wordWrapWidth: 550
    });
    summaryText.x = 100;
    summaryText.y = 370;
    reviewPanel.addChild(summaryText);

    const keyPointsBg = new PIXI.Graphics();
    keyPointsBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    keyPointsBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    keyPointsBg.drawRoundedRect(75, 440, 600, 480, 15);
    keyPointsBg.endFill();
    reviewPanel.addChild(keyPointsBg);

    const keyPointsLabel = new PIXI.Text(`🎯 关键节点回顾 (${review.completedKeyPoints.length}个)`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    keyPointsLabel.x = 100;
    keyPointsLabel.y = 460;
    reviewPanel.addChild(keyPointsLabel);

    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0x000000);
    scrollMask.drawRect(75, 495, 600, 410);
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

    if (review.memoryFragmentsCollected.length > 0) {
      const memoryBg = new PIXI.Graphics();
      memoryBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.3);
      memoryBg.lineStyle(2, GAME_CONFIG.COLORS.WARM_ORANGE, 0.6);
      memoryBg.drawRoundedRect(75, 940, 600, 60, 15);
      memoryBg.endFill();
      reviewPanel.addChild(memoryBg);

      const memoryIcon = new PIXI.Text('🧩', { fontSize: 24 });
      memoryIcon.x = 100;
      memoryIcon.y = 955;
      reviewPanel.addChild(memoryIcon);

      const memoryText = new PIXI.Text(`收集记忆碎片：${review.memoryFragmentsCollected.length}个`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      memoryText.x = 140;
      memoryText.y = 960;
      reviewPanel.addChild(memoryText);
    }

    const continueBtn = this.createButton('继续冒险', 250, 1020);
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
