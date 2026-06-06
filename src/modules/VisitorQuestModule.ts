import * as PIXI from 'pixi.js';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';
import { VisitorQuest, ChapterEvaluation } from '../game/types';

export class VisitorQuestModule {
  private container: PIXI.Container;
  private hudContainer: PIXI.Container;
  private panelContainer: PIXI.Container | null = null;
  private isPanelOpen: boolean = false;
  private currentTab: 'available' | 'active' | 'completed' | 'evaluation' = 'available';
  private questNotification: PIXI.Container | null = null;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.hudContainer = new PIXI.Container();
    this.container.addChild(this.hudContainer);

    this.createHUD();
    this.setupEventListeners();
  }

  private createHUD(): void {
    const questBtn = new PIXI.Graphics();
    questBtn.beginFill(0x000000, 0.6);
    questBtn.lineStyle(2, GAME_CONFIG.COLORS.WARM_ORANGE, 0.6);
    questBtn.drawCircle(40, 40, 35);
    questBtn.endFill();

    const icon = new PIXI.Text('📜', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 40;
    icon.y = 40;
    questBtn.addChild(icon);

    questBtn.x = GAME_CONFIG.DESIGN_WIDTH - 90;
    questBtn.y = 160;
    questBtn.eventMode = 'static';
    questBtn.cursor = 'pointer';

    questBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.togglePanel();
    });

    this.hudContainer.addChild(questBtn);

    const badge = new PIXI.Graphics();
    badge.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE);
    badge.drawCircle(0, 0, 12);
    badge.endFill();
    badge.x = GAME_CONFIG.DESIGN_WIDTH - 55;
    badge.y = 135;
    badge.visible = false;
    this.hudContainer.addChild(badge);
    (this.hudContainer as any).questBadge = badge;

    const badgeText = new PIXI.Text('0', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    badgeText.anchor.set(0.5);
    badgeText.x = GAME_CONFIG.DESIGN_WIDTH - 55;
    badgeText.y = 135;
    badgeText.visible = false;
    this.hudContainer.addChild(badgeText);
    (this.hudContainer as any).badgeText = badgeText;

    this.updateBadge();
  }

  private updateBadge(): void {
    const currentChapter = store.getCurrentChapter()?.id || '';
    const availableCount = store.getAvailableQuests(currentChapter).length;
    const readyCount = store.getActiveQuests().filter(q => q.status === 'ready').length;
    const totalCount = availableCount + readyCount;

    const badge = (this.hudContainer as any).questBadge as PIXI.Graphics;
    const badgeText = (this.hudContainer as any).badgeText as PIXI.Text;

    if (badge && badgeText) {
      badge.visible = totalCount > 0;
      badgeText.visible = totalCount > 0;
      badgeText.text = totalCount.toString();
    }
  }

  private setupEventListeners(): void {
    eventBus.on('quest:unlock', () => this.updateBadge());
    eventBus.on('quest:accept', () => this.updateBadge());
    eventBus.on('quest:ready', () => {
      this.updateBadge();
      this.showQuestReadyNotification();
    });
    eventBus.on('quest:complete', () => this.updateBadge());
    eventBus.on('clue:collect', () => this.updateBadge());
    eventBus.on('chapter:complete', (data: { chapterId: string }) => {
      this.showChapterEvaluation(data.chapterId);
    });
  }

  private togglePanel(): void {
    if (this.isPanelOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel(): void {
    this.isPanelOpen = true;
    this.panelContainer = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.panelContainer.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(25, 100, 700, 1150, 20);
    panel.endFill();
    this.panelContainer.addChild(panel);

    const title = new PIXI.Text('访客委托', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.anchor.set(0.5);
    title.x = 375;
    title.y = 160;
    this.panelContainer.addChild(title);

    const scoreDisplay = this.createScoreDisplay();
    this.panelContainer.addChild(scoreDisplay);

    this.createTabs();
    this.createCloseButton();
    this.refreshContent();

    this.panelContainer.alpha = 0;
    this.container.addChild(this.panelContainer);

    Animator.animate(
      300,
      (progress) => {
        this.panelContainer!.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createScoreDisplay(): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.4);
    bg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.6);
    bg.drawRoundedRect(50, 210, 650, 60, 12);
    bg.endFill();
    container.addChild(bg);

    const totalScoreLabel = new PIXI.Text('总分:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    totalScoreLabel.x = 80;
    totalScoreLabel.y = 228;
    container.addChild(totalScoreLabel);

    const totalScoreValue = new PIXI.Text(store.getTotalScore().toString(), {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    totalScoreValue.x = 140;
    totalScoreValue.y = 222;
    container.addChild(totalScoreValue);

    const chapterScoreLabel = new PIXI.Text('本章:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    chapterScoreLabel.x = 350;
    chapterScoreLabel.y = 228;
    container.addChild(chapterScoreLabel);

    const chapterScoreValue = new PIXI.Text(store.getCurrentChapterScore().toString(), {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    chapterScoreValue.x = 420;
    chapterScoreValue.y = 222;
    container.addChild(chapterScoreValue);

    const currentChapter = store.getCurrentChapter();
    const completedCount = store.getCompletedQuestsCount(currentChapter?.id);
    const totalCount = store.getTotalQuestsCount(currentChapter?.id);

    const progressLabel = new PIXI.Text(`委托: ${completedCount}/${totalCount}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    progressLabel.x = 550;
    progressLabel.y = 230;
    container.addChild(progressLabel);

    return container;
  }

  private createTabs(): void {
    if (!this.panelContainer) return;

    const tabs = [
      { id: 'available', label: '可接取', x: 50 },
      { id: 'active', label: '进行中', x: 225 },
      { id: 'completed', label: '已完成', x: 400 },
      { id: 'evaluation', label: '评价', x: 575 }
    ];

    tabs.forEach(tab => {
      const isActive = this.currentTab === tab.id;
      const tabBg = new PIXI.Graphics();

      if (isActive) {
        tabBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
        tabBg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
      } else {
        tabBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.5);
        tabBg.lineStyle(2, GAME_CONFIG.COLORS.BRONZE, 0.6);
      }

      tabBg.drawRoundedRect(tab.x, 290, 160, 50, 10);
      tabBg.endFill();
      tabBg.eventMode = 'static';
      tabBg.cursor = 'pointer';

      const tabText = new PIXI.Text(tab.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: isActive ? GAME_CONFIG.COLORS.DARK_BROWN : GAME_CONFIG.COLORS.CREAM
      });
      tabText.anchor.set(0.5);
      tabText.x = tab.x + 80;
      tabText.y = 315;
      tabBg.addChild(tabText);

      tabBg.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.currentTab = tab.id as any;
        this.refreshContent();
        this.createTabs();
      });

      this.panelContainer!.addChild(tabBg);
    });
  }

  private createCloseButton(): void {
    if (!this.panelContainer) return;

    const closeBtn = new PIXI.Graphics();
    closeBtn.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 0.8);
    closeBtn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    closeBtn.drawCircle(0, 0, 25);
    closeBtn.endFill();

    const closeIcon = new PIXI.Text('✕', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: 0xFFFFFF
    });
    closeIcon.anchor.set(0.5);
    closeBtn.addChild(closeIcon);

    closeBtn.x = 685;
    closeBtn.y = 155;
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';

    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closePanel();
    });

    this.panelContainer.addChild(closeBtn);
  }

  private refreshContent(): void {
    if (!this.panelContainer) return;

    const contentArea = (this.panelContainer as any).contentArea as PIXI.Container;
    if (contentArea) {
      this.panelContainer.removeChild(contentArea);
      contentArea.destroy();
    }

    const newContentArea = new PIXI.Container();
    newContentArea.y = 360;
    (this.panelContainer as any).contentArea = newContentArea;
    this.panelContainer.addChild(newContentArea);

    const currentChapter = store.getCurrentChapter()?.id || '';
    let quests: VisitorQuest[] = [];

    switch (this.currentTab) {
      case 'available':
        quests = store.getAvailableQuests(currentChapter);
        this.renderAvailableQuests(newContentArea, quests);
        break;
      case 'active':
        quests = store.getActiveQuests();
        this.renderActiveQuests(newContentArea, quests);
        break;
      case 'completed':
        quests = store.getCompletedQuests(currentChapter);
        this.renderCompletedQuests(newContentArea, quests);
        break;
      case 'evaluation':
        this.renderEvaluations(newContentArea);
        break;
    }
  }

  private renderAvailableQuests(container: PIXI.Container, quests: VisitorQuest[]): void {
    if (quests.length === 0) {
      this.renderEmptyState(container, '暂无可接取的委托');
      return;
    }

    let yOffset = 0;
    quests.forEach((quest, index) => {
      const questCard = this.createQuestCard(quest, index, yOffset);
      container.addChild(questCard);
      yOffset += 180;
    });
  }

  private renderActiveQuests(container: PIXI.Container, quests: VisitorQuest[]): void {
    if (quests.length === 0) {
      this.renderEmptyState(container, '暂无进行中的委托');
      return;
    }

    let yOffset = 0;
    quests.forEach((quest, index) => {
      const questCard = this.createQuestCard(quest, index, yOffset);
      container.addChild(questCard);
      yOffset += 200;
    });
  }

  private renderCompletedQuests(container: PIXI.Container, quests: VisitorQuest[]): void {
    if (quests.length === 0) {
      this.renderEmptyState(container, '暂无已完成的委托');
      return;
    }

    let yOffset = 0;
    quests.forEach((quest, index) => {
      const questCard = this.createQuestCard(quest, index, yOffset);
      container.addChild(questCard);
      yOffset += 160;
    });
  }

  private renderEvaluations(container: PIXI.Container): void {
    const evaluations = store.getAllChapterEvaluations();

    if (evaluations.length === 0) {
      this.renderEmptyState(container, '完成章节后可查看评价');
      return;
    }

    let yOffset = 0;
    evaluations.forEach((evaluation, index) => {
      const evalCard = this.createEvaluationCard(evaluation, index, yOffset);
      container.addChild(evalCard);
      yOffset += 220;
    });
  }

  private renderEmptyState(container: PIXI.Container, message: string): void {
    const emptyIcon = new PIXI.Text('📭', { fontSize: 48 });
    emptyIcon.anchor.set(0.5);
    emptyIcon.x = 350;
    emptyIcon.y = 200;
    container.addChild(emptyIcon);

    const emptyText = new PIXI.Text(message, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center'
    });
    emptyText.anchor.set(0.5);
    emptyText.x = 350;
    emptyText.y = 270;
    container.addChild(emptyText);
  }

  private createQuestCard(quest: VisitorQuest, _index: number, yOffset: number): PIXI.Container {
    const container = new PIXI.Container();
    container.y = yOffset;

    const priorityColors: Record<string, number> = {
      common: GAME_CONFIG.COLORS.BRONZE,
      rare: GAME_CONFIG.COLORS.AMBER,
      epic: GAME_CONFIG.COLORS.DEEP_PURPLE,
      legendary: GAME_CONFIG.COLORS.GOLD
    };

    const priorityLabels: Record<string, string> = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    };

    const borderColor = priorityColors[quest.priority] || GAME_CONFIG.COLORS.BRONZE;

    const card = new PIXI.Graphics();
    card.beginFill(0x000000, 0.5);
    card.lineStyle(3, borderColor, 0.8);
    card.drawRoundedRect(25, 0, 650, quest.status === 'accepted' ? 190 : 150, 12);
    card.endFill();
    container.addChild(card);

    const avatar = new PIXI.Text(quest.visitorAvatar, { fontSize: 36 });
    avatar.x = 45;
    avatar.y = 20;
    container.addChild(avatar);

    const visitorName = new PIXI.Text(quest.visitorName, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    visitorName.x = 95;
    visitorName.y = 25;
    container.addChild(visitorName);

    const priorityLabel = new PIXI.Text(priorityLabels[quest.priority], {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: borderColor
    });
    priorityLabel.x = 95;
    priorityLabel.y = 50;
    container.addChild(priorityLabel);

    const title = new PIXI.Text(quest.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 200;
    title.y = 22;
    container.addChild(title);

    const description = new PIXI.Text(quest.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM,
      wordWrap: true,
      wordWrapWidth: 450
    });
    description.x = 200;
    description.y = 55;
    container.addChild(description);

    if (quest.status === 'accepted' || quest.status === 'ready') {
      const progressArea = this.createQuestProgress(quest);
      progressArea.y = 95;
      container.addChild(progressArea);
    }

    const rewardIcon = new PIXI.Text('🎁', { fontSize: 20 });
    rewardIcon.x = 560;
    rewardIcon.y = 55;
    container.addChild(rewardIcon);

    const rewardText = new PIXI.Text(quest.reward.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    rewardText.x = 590;
    rewardText.y = 60;
    container.addChild(rewardText);

    const actionBtn = this.createActionButton(quest);
    if (actionBtn) {
      actionBtn.x = 480;
      actionBtn.y = quest.status === 'accepted' ? 140 : 100;
      container.addChild(actionBtn);
    }

    return container;
  }

  private createQuestProgress(quest: VisitorQuest): PIXI.Container {
    const container = new PIXI.Container();

    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x000000, 0.6);
    progressBg.lineStyle(2, GAME_CONFIG.COLORS.BRONZE, 0.5);
    progressBg.drawRoundedRect(200, 0, 450, 80, 8);
    progressBg.endFill();
    container.addChild(progressBg);

    const progressLabel = new PIXI.Text('收集进度:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    progressLabel.x = 215;
    progressLabel.y = 8;
    container.addChild(progressLabel);

    let itemX = 215;
    quest.requiredItems.forEach(item => {
      const progress = store.getQuestItemProgress(quest.id, item.id);
      const isComplete = progress >= item.quantity;

      const itemIcon = new PIXI.Text(item.icon, { fontSize: 24 });
      itemIcon.x = itemX;
      itemIcon.y = 35;
      itemIcon.alpha = isComplete ? 1 : 0.5;
      container.addChild(itemIcon);

      const itemName = new PIXI.Text(item.name, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: isComplete ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.CREAM
      });
      itemName.x = itemX;
      itemName.y = 62;
      container.addChild(itemName);

      const itemCount = new PIXI.Text(`${progress}/${item.quantity}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: isComplete ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.CREAM
      });
      itemCount.x = itemX + 25;
      itemCount.y = 62;
      container.addChild(itemCount);

      itemX += 110;
    });

    return container;
  }

  private createActionButton(quest: VisitorQuest): PIXI.Container | null {
    if (quest.status === 'completed') return null;

    const container = new PIXI.Container();
    const btn = new PIXI.Graphics();
    let btnText = '';
    let btnColor: number = GAME_CONFIG.COLORS.AMBER;
    let textColor = GAME_CONFIG.COLORS.DARK_BROWN;

    switch (quest.status) {
      case 'available':
        btnText = '接取委托';
        btnColor = GAME_CONFIG.COLORS.AMBER;
        break;
      case 'accepted':
        return null;
      case 'ready':
        btnText = '交付道具';
        btnColor = GAME_CONFIG.COLORS.GOLD;
        break;
    }

    btn.beginFill(btnColor, 0.9);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 150, 45, 10);
    btn.endFill();

    const text = new PIXI.Text(btnText, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: textColor
    });
    text.anchor.set(0.5);
    text.x = 75;
    text.y = 22;
    btn.addChild(text);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      if (quest.status === 'available') {
        this.handleAcceptQuest(quest.id);
      } else if (quest.status === 'ready') {
        this.handleDeliverQuest(quest.id);
      }
    });

    container.addChild(btn);
    return container;
  }

  private createEvaluationCard(evaluation: ChapterEvaluation, _index: number, yOffset: number): PIXI.Container {
    const container = new PIXI.Container();
    container.y = yOffset;

    const chapter = store.getChapters().find(c => c.id === evaluation.chapterId);

    const card = new PIXI.Graphics();
    card.beginFill(0x000000, 0.5);
    card.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 0.8);
    card.drawRoundedRect(25, 0, 650, 210, 12);
    card.endFill();
    container.addChild(card);

    const rankColors: Record<string, number> = {
      'S': GAME_CONFIG.COLORS.GOLD,
      'A': GAME_CONFIG.COLORS.AMBER,
      'B': GAME_CONFIG.COLORS.WARM_ORANGE,
      'C': GAME_CONFIG.COLORS.BRONZE
    };

    const rankBg = new PIXI.Graphics();
    rankBg.beginFill(rankColors[evaluation.rank], 0.9);
    rankBg.lineStyle(3, 0xFFFFFF, 0.5);
    rankBg.drawCircle(60, 60, 40);
    rankBg.endFill();
    container.addChild(rankBg);

    const rankText = new PIXI.Text(evaluation.rank, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    rankText.anchor.set(0.5);
    rankText.x = 60;
    rankText.y = 60;
    container.addChild(rankText);

    const chapterTitle = new PIXI.Text(chapter?.title || evaluation.chapterId, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    chapterTitle.x = 120;
    chapterTitle.y = 30;
    container.addChild(chapterTitle);

    const totalScoreLabel = new PIXI.Text('总分:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    totalScoreLabel.x = 120;
    totalScoreLabel.y = 65;
    container.addChild(totalScoreLabel);

    const totalScoreValue = new PIXI.Text(evaluation.totalScore.toString(), {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    totalScoreValue.x = 175;
    totalScoreValue.y = 60;
    container.addChild(totalScoreValue);

    const scoreItems = [
      { label: '主线剧情', value: evaluation.mainStoryScore, icon: '📖' },
      { label: '支线委托', value: evaluation.sideQuestsScore, icon: '📜' },
      { label: '收集完成', value: evaluation.collectionScore, icon: '💎' },
      { label: '效率加成', value: evaluation.efficiencyScore, icon: '⚡' }
    ];

    let itemX = 120;
    scoreItems.forEach(item => {
      const itemIcon = new PIXI.Text(item.icon, { fontSize: 20 });
      itemIcon.x = itemX;
      itemIcon.y = 110;
      container.addChild(itemIcon);

      const itemLabel = new PIXI.Text(item.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      itemLabel.x = itemX;
      itemLabel.y = 135;
      container.addChild(itemLabel);

      const itemValue = new PIXI.Text(`+${item.value}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      itemValue.x = itemX;
      itemValue.y = 155;
      container.addChild(itemValue);

      itemX += 135;
    });

    const questsCompleted = new PIXI.Text(
      `完成委托: ${evaluation.completedQuests.length}个`,
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.CREAM
      }
    );
    questsCompleted.x = 120;
    questsCompleted.y = 185;
    container.addChild(questsCompleted);

    const minutes = Math.floor(evaluation.completionTime / 60000);
    const timeText = new PIXI.Text(
      `用时: ${minutes}分钟`,
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.CREAM
      }
    );
    timeText.x = 350;
    timeText.y = 185;
    container.addChild(timeText);

    return container;
  }

  private handleAcceptQuest(questId: string): void {
    const quest = store.getQuestById(questId);
    if (!quest) return;

    this.showStoryDialog(quest.storyAccept, () => {
      const success = store.acceptQuest(questId);
      if (success) {
        this.refreshContent();
        this.updateBadge();
      }
    });
  }

  private handleDeliverQuest(questId: string): void {
    const quest = store.getQuestById(questId);
    if (!quest) return;

    const result = store.deliverQuest(questId);
    if (result.success) {
      this.showStoryDialog(result.story, () => {
        this.showStoryDialog(quest.storyComplete, () => {
          const success = store.completeQuest(questId);
          if (success) {
            this.showQuestCompleteNotification(quest);
            this.refreshContent();
            this.updateBadge();
          }
        });
      });
    }
  }

  private showStoryDialog(text: string, onClose?: () => void): void {
    if (!this.panelContainer) return;

    const dialogOverlay = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.8);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    dialogOverlay.addChild(overlay);

    const dialog = new PIXI.Graphics();
    dialog.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    dialog.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    dialog.drawRoundedRect(75, 350, 600, 450, 20);
    dialog.endFill();
    dialogOverlay.addChild(dialog);

    const storyText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM,
      wordWrap: true,
      wordWrapWidth: 520,
      lineHeight: 32
    });
    storyText.x = 115;
    storyText.y = 400;
    dialogOverlay.addChild(storyText);

    const continueBtn = new PIXI.Graphics();
    continueBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    continueBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    continueBtn.drawRoundedRect(275, 720, 200, 55, 12);
    continueBtn.endFill();

    const btnText = new PIXI.Text('继续', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    btnText.anchor.set(0.5);
    btnText.x = 375;
    btnText.y = 747;
    continueBtn.addChild(btnText);

    continueBtn.eventMode = 'static';
    continueBtn.cursor = 'pointer';

    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.panelContainer!.removeChild(dialogOverlay);
      dialogOverlay.destroy();
      if (onClose) onClose();
    });

    dialogOverlay.addChild(continueBtn);
    this.panelContainer.addChild(dialogOverlay);
  }

  private showQuestReadyNotification(): void {
    if (this.questNotification) {
      this.container.removeChild(this.questNotification);
      this.questNotification.destroy();
    }

    const notification = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(100, 300, 550, 100, 15);
    bg.endFill();
    notification.addChild(bg);

    const icon = new PIXI.Text('📜', { fontSize: 32 });
    icon.x = 130;
    icon.y = 330;
    notification.addChild(icon);

    const title = new PIXI.Text('委托完成', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 180;
    title.y = 325;
    notification.addChild(title);

    const subtitle = new PIXI.Text('可以交付道具了！', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    subtitle.x = 180;
    subtitle.y = 360;
    notification.addChild(subtitle);

    notification.y = -150;
    this.container.addChild(notification);
    this.questNotification = notification;

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
              if (this.questNotification === notification) {
                this.container.removeChild(notification);
                notification.destroy();
                this.questNotification = null;
              }
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  private showQuestCompleteNotification(quest: VisitorQuest): void {
    const notification = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(100, 300, 550, 120, 15);
    bg.endFill();
    notification.addChild(bg);

    const icon = new PIXI.Text('✨', { fontSize: 36 });
    icon.x = 130;
    icon.y = 335;
    notification.addChild(icon);

    const title = new PIXI.Text('委托完成！', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 26,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 180;
    title.y = 325;
    notification.addChild(title);

    const questTitle = new PIXI.Text(quest.title, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    questTitle.x = 180;
    questTitle.y = 360;
    notification.addChild(questTitle);

    const rewardText = new PIXI.Text(quest.reward.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    rewardText.x = 180;
    rewardText.y = 385;
    notification.addChild(rewardText);

    notification.y = -150;
    this.container.addChild(notification);

    Animator.animate(
      500,
      (progress) => {
        notification.y = -150 + progress * 200;
      },
      () => {
        Animator.delay(3000).then(() => {
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

  private showChapterEvaluation(chapterId: string): void {
    const evaluation = store.evaluateChapter(chapterId);
    if (!evaluation) return;

    const evalContainer = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    evalContainer.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    panel.drawRoundedRect(75, 250, 600, 700, 20);
    panel.endFill();
    evalContainer.addChild(panel);

    const title = new PIXI.Text('章节评价', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.anchor.set(0.5);
    title.x = 375;
    title.y = 310;
    evalContainer.addChild(title);

    const chapter = store.getChapters().find(c => c.id === chapterId);
    const chapterTitle = new PIXI.Text(chapter?.title || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    chapterTitle.anchor.set(0.5);
    chapterTitle.x = 375;
    chapterTitle.y = 355;
    evalContainer.addChild(chapterTitle);

    const rankColors: Record<string, number> = {
      'S': GAME_CONFIG.COLORS.GOLD,
      'A': GAME_CONFIG.COLORS.AMBER,
      'B': GAME_CONFIG.COLORS.WARM_ORANGE,
      'C': GAME_CONFIG.COLORS.BRONZE
    };

    const rankBg = new PIXI.Graphics();
    rankBg.beginFill(rankColors[evaluation.rank], 0.9);
    rankBg.lineStyle(4, 0xFFFFFF, 0.6);
    rankBg.drawCircle(375, 450, 60);
    rankBg.endFill();
    evalContainer.addChild(rankBg);

    const rankText = new PIXI.Text(evaluation.rank, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 56,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    rankText.anchor.set(0.5);
    rankText.x = 375;
    rankText.y = 450;
    evalContainer.addChild(rankText);

    const scoreItems = [
      { label: '主线剧情', value: evaluation.mainStoryScore, icon: '📖' },
      { label: '支线委托', value: evaluation.sideQuestsScore, icon: '📜' },
      { label: '收集完成', value: evaluation.collectionScore, icon: '💎' },
      { label: '效率加成', value: evaluation.efficiencyScore, icon: '⚡' }
    ];

    let itemY = 540;
    scoreItems.forEach(item => {
      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(0x000000, 0.4);
      itemBg.lineStyle(2, GAME_CONFIG.COLORS.BRONZE, 0.5);
      itemBg.drawRoundedRect(115, itemY, 520, 50, 8);
      itemBg.endFill();
      evalContainer.addChild(itemBg);

      const itemIcon = new PIXI.Text(item.icon, { fontSize: 24 });
      itemIcon.x = 140;
      itemIcon.y = itemY + 10;
      evalContainer.addChild(itemIcon);

      const itemLabel = new PIXI.Text(item.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.CREAM
      });
      itemLabel.x = 185;
      itemLabel.y = itemY + 15;
      evalContainer.addChild(itemLabel);

      const itemValue = new PIXI.Text(`+${item.value}`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 22,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      itemValue.x = 550;
      itemValue.y = itemY + 12;
      evalContainer.addChild(itemValue);

      itemY += 60;
    });

    const totalLine = new PIXI.Graphics();
    totalLine.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.8);
    totalLine.moveTo(115, 785);
    totalLine.lineTo(635, 785);
    evalContainer.addChild(totalLine);

    const totalLabel = new PIXI.Text('总分', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    totalLabel.x = 140;
    totalLabel.y = 800;
    evalContainer.addChild(totalLabel);

    const totalValue = new PIXI.Text(evaluation.totalScore.toString(), {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    totalValue.x = 520;
    totalValue.y = 795;
    evalContainer.addChild(totalValue);

    const continueBtn = new PIXI.Graphics();
    continueBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    continueBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    continueBtn.drawRoundedRect(250, 850, 250, 60, 15);
    continueBtn.endFill();

    const btnText = new PIXI.Text('继续冒险', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    btnText.anchor.set(0.5);
    btnText.x = 375;
    btnText.y = 880;
    continueBtn.addChild(btnText);

    continueBtn.eventMode = 'static';
    continueBtn.cursor = 'pointer';

    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.container.removeChild(evalContainer);
      evalContainer.destroy();
    });

    evalContainer.addChild(continueBtn);
    this.container.addChild(evalContainer);

    evalContainer.alpha = 0;
    Animator.animate(
      500,
      (progress) => {
        evalContainer.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private closePanel(): void {
    if (!this.panelContainer) return;

    const panel = this.panelContainer;
    this.isPanelOpen = false;

    Animator.animate(
      200,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.panelContainer = null;
      }
    );
  }

  update(_delta: number): void {
    this.updateBadge();
  }

  destroy(): void {
    eventBus.off('quest:unlock', () => this.updateBadge());
    eventBus.off('quest:accept', () => this.updateBadge());
    eventBus.off('quest:ready', () => this.updateBadge());
    eventBus.off('quest:complete', () => this.updateBadge());
    eventBus.off('clue:collect', () => this.updateBadge());
    this.hudContainer.destroy();
    if (this.panelContainer) {
      this.panelContainer.destroy();
    }
    if (this.questNotification) {
      this.questNotification.destroy();
    }
  }
}
