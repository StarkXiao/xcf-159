import * as PIXI from 'pixi.js';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';
import {
  FinalReviewData,
  FinalReviewTab,
  FinalReviewClueSummary,
  FinalReviewMechanismSummary,
  FinalReviewChoiceSummary,
  FinalReviewEndingCondition
} from '../game/types';

export class FinalReviewModule {
  private container: PIXI.Container;
  private reviewPanel: PIXI.Container | null = null;
  private contentContainer: PIXI.Container | null = null;
  private isOpen: boolean = false;
  private currentTab: FinalReviewTab['id'] = 'clues';
  private reviewData: FinalReviewData | null = null;

  private readonly tabs: FinalReviewTab[] = [
    { id: 'clues', label: '线索汇总', icon: '🔍' },
    { id: 'mechanisms', label: '机关未解', icon: '🔧' },
    { id: 'choices', label: '关键抉择', icon: '🗨️' },
    { id: 'endings', label: '结局条件', icon: '🏆' }
  ];

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('finalreview:show', this.handleShow.bind(this));
    eventBus.on('ending:show', () => {
      setTimeout(() => {
        this.refreshData();
      }, 100);
    });
  }

  private handleShow(): void {
    if (this.isOpen) return;
    this.refreshData();
    this.isOpen = true;
    this.showReviewPanel();
  }

  private refreshData(): void {
    this.reviewData = store.getFinalReviewData();
  }

  private showReviewPanel(): void {
    this.reviewPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.92);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.reviewPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(20, 60, 710, 1220, 20);
    panel.endFill();
    this.reviewPanel.addChild(panel);

    const titleIcon = new PIXI.Text('📜', { fontSize: 48 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleIcon.y = 110;
    this.reviewPanel.addChild(titleIcon);

    const title = new PIXI.Text('终章复盘台', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 160;
    this.reviewPanel.addChild(title);

    this.renderOverview();

    this.renderTabs();

    this.contentContainer = new PIXI.Container();
    this.contentContainer.y = 400;
    this.reviewPanel.addChild(this.contentContainer);

    this.renderContent();

    const closeBtn = this.createButton('关闭复盘台', 275, 1240);
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeReviewPanel();
    });
    this.reviewPanel.addChild(closeBtn);

    this.reviewPanel.alpha = 0;
    this.container.addChild(this.reviewPanel);

    Animator.animate(
      800,
      (progress) => {
        this.reviewPanel!.alpha = progress;
      },
      () => {
        audioModule.playSFX('sfx_unlock');
      },
      Animator.easeOutCubic
    );
  }

  private renderOverview(): void {
    if (!this.reviewData || !this.reviewPanel) return;
    const data = this.reviewData;

    const overviewBg = new PIXI.Graphics();
    overviewBg.beginFill(GAME_CONFIG.COLORS.DARK_BG, 0.6);
    overviewBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
    overviewBg.drawRoundedRect(40, 200, 670, 180, 12);
    overviewBg.endFill();
    this.reviewPanel.addChild(overviewBg);

    const stats = [
      { icon: '🔍', label: '线索', current: data.collectedClues, total: data.totalClues, color: GAME_CONFIG.COLORS.AMBER },
      { icon: '🔧', label: '机关', current: data.solvedMechanisms, total: data.totalMechanisms, color: GAME_CONFIG.COLORS.WARM_ORANGE },
      { icon: '🗨️', label: '抉择', current: data.madeChoices, total: data.totalChoices, color: GAME_CONFIG.COLORS.GOLD }
    ];

    stats.forEach((stat, index) => {
      const x = 100 + index * 200;
      const y = 250;

      const icon = new PIXI.Text(stat.icon, { fontSize: 32 });
      icon.anchor.set(0.5);
      icon.x = x;
      icon.y = y;
      this.reviewPanel!.addChild(icon);

      const value = new PIXI.Text(`${stat.current}/${stat.total}`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 24,
        fill: stat.color
      });
      value.anchor.set(0.5);
      value.x = x;
      value.y = y + 35;
      this.reviewPanel!.addChild(value);

      const label = new PIXI.Text(stat.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: 0xAAAAAA
      });
      label.anchor.set(0.5);
      label.x = x;
      label.y = y + 65;
      this.reviewPanel!.addChild(label);

      const progressWidth = 80;
      const progressHeight = 6;
      const progress = stat.total > 0 ? stat.current / stat.total : 0;

      const progressBg = new PIXI.Graphics();
      progressBg.beginFill(0x333333, 0.8);
      progressBg.drawRoundedRect(x - progressWidth / 2, y + 85, progressWidth, progressHeight, 3);
      progressBg.endFill();
      this.reviewPanel!.addChild(progressBg);

      const progressFill = new PIXI.Graphics();
      progressFill.beginFill(stat.color, 1);
      progressFill.drawRoundedRect(x - progressWidth / 2, y + 85, progressWidth * progress, progressHeight, 3);
      progressFill.endFill();
      this.reviewPanel!.addChild(progressFill);
    });

    const overallLabel = new PIXI.Text('整体进度', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xCCCCCC
    });
    overallLabel.anchor.set(0, 0.5);
    overallLabel.x = 60;
    overallLabel.y = 355;
    this.reviewPanel.addChild(overallLabel);

    const overallProgressWidth = 500;
    const overallProgress = data.overallProgress / 100;

    const overallBg = new PIXI.Graphics();
    overallBg.beginFill(0x333333, 0.8);
    overallBg.drawRoundedRect(140, 345, overallProgressWidth, 16, 8);
    overallBg.endFill();
    this.reviewPanel.addChild(overallBg);

    const overallFill = new PIXI.Graphics();
    const gradientColor = data.overallProgress >= 80 ? GAME_CONFIG.COLORS.GOLD :
                         data.overallProgress >= 50 ? GAME_CONFIG.COLORS.AMBER :
                         GAME_CONFIG.COLORS.WARM_ORANGE;
    overallFill.beginFill(gradientColor, 1);
    overallFill.drawRoundedRect(140, 345, overallProgressWidth * overallProgress, 16, 8);
    overallFill.endFill();
    this.reviewPanel.addChild(overallFill);

    const overallText = new PIXI.Text(`${data.overallProgress}%`, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 18,
      fill: 0xFFFFFF
    });
    overallText.anchor.set(0.5);
    overallText.x = 140 + overallProgressWidth / 2;
    overallText.y = 353;
    this.reviewPanel.addChild(overallText);

    if (data.currentEnding) {
      const endingBadge = new PIXI.Text(`${data.currentEnding.icon} 已达成: ${data.currentEnding.title}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      endingBadge.anchor.set(1, 0.5);
      endingBadge.x = 700;
      endingBadge.y = 355;
      this.reviewPanel.addChild(endingBadge);
    }
  }

  private renderTabs(): void {
    const panel = this.reviewPanel;
    if (!panel) return;

    this.tabs.forEach((tab, index) => {
      const x = 40 + index * 170;
      const y = 400;
      const isActive = this.currentTab === tab.id;

      const tabBg = new PIXI.Graphics();
      tabBg.beginFill(
        isActive ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.DARK_BG,
        isActive ? 1 : 0.6
      );
      tabBg.lineStyle(
        2,
        isActive ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.BRONZE,
        1
      );
      tabBg.drawRoundedRect(x, y, 160, 50, 8);
      tabBg.endFill();
      tabBg.eventMode = 'static';
      tabBg.cursor = 'pointer';
      panel.addChild(tabBg);

      const tabIcon = new PIXI.Text(tab.icon, { fontSize: 20 });
      tabIcon.anchor.set(0, 0.5);
      tabIcon.x = x + 15;
      tabIcon.y = y + 25;
      panel.addChild(tabIcon);

      const tabText = new PIXI.Text(tab.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: isActive ? GAME_CONFIG.COLORS.DARK_BROWN : 0xCCCCCC
      });
      tabText.anchor.set(0, 0.5);
      tabText.x = x + 45;
      tabText.y = y + 25;
      panel.addChild(tabText);

      tabBg.on('pointerdown', () => {
        if (this.currentTab !== tab.id) {
          audioModule.playSFX('sfx_click');
          this.currentTab = tab.id;
          this.renderTabs();
          this.renderContent();
        }
      });
    });
  }

  private renderContent(): void {
    if (!this.contentContainer || !this.reviewData) return;

    while (this.contentContainer.children.length > 0) {
      this.contentContainer.removeChildAt(0);
    }

    switch (this.currentTab) {
      case 'clues':
        this.renderCluesContent();
        break;
      case 'mechanisms':
        this.renderMechanismsContent();
        break;
      case 'choices':
        this.renderChoicesContent();
        break;
      case 'endings':
        this.renderEndingsContent();
        break;
    }
  }

  private renderCluesContent(): void {
    if (!this.contentContainer || !this.reviewData) return;

    let yOffset = 0;
    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0xFFFFFF, 1);
    scrollMask.drawRect(0, 0, 710, 800);
    scrollMask.endFill();
    this.contentContainer.addChild(scrollMask);

    const scrollContainer = new PIXI.Container();
    scrollContainer.mask = scrollMask;
    this.contentContainer.addChild(scrollContainer);

    this.reviewData.clueSummaries.forEach((summary: FinalReviewClueSummary) => {
      if (summary.totalClues === 0) return;

      const chapterCard = this.createChapterCard(
        summary.chapterTitle,
        summary.collectedClues,
        summary.totalClues,
        '🔍',
        GAME_CONFIG.COLORS.AMBER,
        yOffset
      );
      scrollContainer.addChild(chapterCard);
      yOffset += 80;

      summary.collectedClueList.forEach(clue => {
        const clueItem = this.createClueItem(clue, true, yOffset);
        scrollContainer.addChild(clueItem);
        yOffset += 60;
      });

      summary.missingClueList.forEach(clue => {
        const clueItem = this.createClueItem(clue, false, yOffset);
        scrollContainer.addChild(clueItem);
        yOffset += 60;
      });

      yOffset += 10;
    });
  }

  private renderMechanismsContent(): void {
    if (!this.contentContainer || !this.reviewData) return;

    let yOffset = 0;
    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0xFFFFFF, 1);
    scrollMask.drawRect(0, 0, 710, 800);
    scrollMask.endFill();
    this.contentContainer.addChild(scrollMask);

    const scrollContainer = new PIXI.Container();
    scrollContainer.mask = scrollMask;
    this.contentContainer.addChild(scrollContainer);

    this.reviewData.mechanismSummaries.forEach((summary: FinalReviewMechanismSummary) => {
      if (summary.totalMechanisms === 0) return;

      const chapterCard = this.createChapterCard(
        summary.chapterTitle,
        summary.solvedMechanisms,
        summary.totalMechanisms,
        '🔧',
        GAME_CONFIG.COLORS.WARM_ORANGE,
        yOffset
      );
      scrollContainer.addChild(chapterCard);
      yOffset += 80;

      summary.solvedMechanismList.forEach(mech => {
        const mechItem = this.createMechanismItem(mech, true, yOffset);
        scrollContainer.addChild(mechItem);
        yOffset += 60;
      });

      summary.unsolvedMechanismList.forEach(mech => {
        const mechItem = this.createMechanismItem(mech, false, yOffset);
        scrollContainer.addChild(mechItem);
        yOffset += 60;
      });

      yOffset += 10;
    });
  }

  private renderChoicesContent(): void {
    if (!this.contentContainer || !this.reviewData) return;

    let yOffset = 0;
    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0xFFFFFF, 1);
    scrollMask.drawRect(0, 0, 710, 800);
    scrollMask.endFill();
    this.contentContainer.addChild(scrollMask);

    const scrollContainer = new PIXI.Container();
    scrollContainer.mask = scrollMask;
    this.contentContainer.addChild(scrollContainer);

    this.reviewData.choiceSummaries.forEach((summary: FinalReviewChoiceSummary) => {
      const choiceCard = this.createChoiceCard(summary, yOffset);
      scrollContainer.addChild(choiceCard);
      yOffset += 280;
    });
  }

  private renderEndingsContent(): void {
    if (!this.contentContainer || !this.reviewData) return;

    let yOffset = 0;
    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0xFFFFFF, 1);
    scrollMask.drawRect(0, 0, 710, 800);
    scrollMask.endFill();
    this.contentContainer.addChild(scrollMask);

    const scrollContainer = new PIXI.Container();
    scrollContainer.mask = scrollMask;
    this.contentContainer.addChild(scrollContainer);

    this.reviewData.endingConditions.forEach((condition: FinalReviewEndingCondition) => {
      const endingCard = this.createEndingCard(condition, yOffset);
      scrollContainer.addChild(endingCard);
      yOffset += 320;
    });
  }

  private createChapterCard(
    title: string,
    current: number,
    total: number,
    icon: string,
    color: number,
    y: number
  ): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(color, 0.15);
    bg.lineStyle(2, color, 0.6);
    bg.drawRoundedRect(40, y, 630, 60, 8);
    bg.endFill();
    container.addChild(bg);

    const iconText = new PIXI.Text(icon, { fontSize: 24 });
    iconText.anchor.set(0, 0.5);
    iconText.x = 60;
    iconText.y = y + 30;
    container.addChild(iconText);

    const titleText = new PIXI.Text(title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 20,
      fill: color
    });
    titleText.anchor.set(0, 0.5);
    titleText.x = 95;
    titleText.y = y + 30;
    container.addChild(titleText);

    const progress = total > 0 ? current / total : 0;
    const progressWidth = 120;
    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x333333, 0.8);
    progressBg.drawRoundedRect(500, y + 22, progressWidth, 16, 8);
    progressBg.endFill();
    container.addChild(progressBg);

    const progressFill = new PIXI.Graphics();
    progressFill.beginFill(color, 1);
    progressFill.drawRoundedRect(500, y + 22, progressWidth * progress, 16, 8);
    progressFill.endFill();
    container.addChild(progressFill);

    const countText = new PIXI.Text(`${current}/${total}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xFFFFFF
    });
    countText.anchor.set(0.5);
    countText.x = 500 + progressWidth / 2;
    countText.y = y + 30;
    container.addChild(countText);

    return container;
  }

  private createClueItem(clue: any, collected: boolean, y: number): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(
      collected ? GAME_CONFIG.COLORS.DARK_BG : 0x1a1a1a,
      collected ? 0.8 : 0.4
    );
    bg.lineStyle(
      1,
      collected ? GAME_CONFIG.COLORS.AMBER : 0x444444,
      collected ? 0.6 : 0.3
    );
    bg.drawRoundedRect(60, y, 610, 50, 6);
    bg.endFill();
    container.addChild(bg);

    const icon = new PIXI.Text(collected ? clue.icon : '❓', { fontSize: 20 });
    icon.anchor.set(0, 0.5);
    icon.x = 80;
    icon.y = y + 25;
    icon.alpha = collected ? 1 : 0.5;
    container.addChild(icon);

    const name = new PIXI.Text(collected ? clue.name : '??? 未发现的线索', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: collected ? 0xFFFFFF : 0x666666
    });
    name.anchor.set(0, 0.5);
    name.x = 115;
    name.y = y + 25;
    container.addChild(name);

    const status = new PIXI.Text(collected ? '✓ 已收集' : '○ 未收集', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 12,
      fill: collected ? GAME_CONFIG.COLORS.GREEN : 0x888888
    });
    status.anchor.set(1, 0.5);
    status.x = 650;
    status.y = y + 25;
    container.addChild(status);

    return container;
  }

  private createMechanismItem(mech: any, solved: boolean, y: number): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(
      solved ? GAME_CONFIG.COLORS.DARK_BG : 0x1a1a1a,
      solved ? 0.8 : 0.4
    );
    bg.lineStyle(
      1,
      solved ? GAME_CONFIG.COLORS.WARM_ORANGE : 0x444444,
      solved ? 0.6 : 0.3
    );
    bg.drawRoundedRect(60, y, 610, 50, 6);
    bg.endFill();
    container.addChild(bg);

    const typeIcon = mech.type === 'password' ? '🔐' :
                     mech.type === 'memory_sort' ? '🧩' :
                     mech.type === 'branch_choice' ? '🗨️' :
                     mech.type === 'restoration' ? '🔧' : '⚙️';

    const icon = new PIXI.Text(typeIcon, { fontSize: 20 });
    icon.anchor.set(0, 0.5);
    icon.x = 80;
    icon.y = y + 25;
    container.addChild(icon);

    const name = new PIXI.Text(mech.displayName, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: solved ? 0xFFFFFF : 0x888888
    });
    name.anchor.set(0, 0.5);
    name.x = 115;
    name.y = y + 25;
    container.addChild(name);

    const status = new PIXI.Text(solved ? '✓ 已解开' : '○ 未解', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 12,
      fill: solved ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE
    });
    status.anchor.set(1, 0.5);
    status.x = 650;
    status.y = y + 25;
    container.addChild(status);

    return container;
  }

  private createChoiceCard(summary: FinalReviewChoiceSummary, y: number): PIXI.Container {
    const container = new PIXI.Container();

    const isMade = summary.selectedChoiceId !== null;
    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BG, 0.8);
    bg.lineStyle(2, isMade ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.BRONZE, 0.6);
    bg.drawRoundedRect(40, y, 630, 260, 12);
    bg.endFill();
    container.addChild(bg);

    const headerIcon = new PIXI.Text('🗨️', { fontSize: 24 });
    headerIcon.anchor.set(0, 0);
    headerIcon.x = 60;
    headerIcon.y = y + 20;
    container.addChild(headerIcon);

    const headerText = new PIXI.Text('关键抉择', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    headerText.anchor.set(0, 0);
    headerText.x = 95;
    headerText.y = y + 22;
    container.addChild(headerText);

    const statusText = new PIXI.Text(isMade ? '✓ 已做出' : '○ 待选择', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: isMade ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE
    });
    statusText.anchor.set(1, 0);
    statusText.x = 650;
    statusText.y = y + 25;
    container.addChild(statusText);

    const questionText = new PIXI.Text(summary.branchTitle, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 580,
      lineHeight: 24
    });
    questionText.anchor.set(0, 0);
    questionText.x = 60;
    questionText.y = y + 60;
    container.addChild(questionText);

    let choiceY = y + 130;
    summary.allChoices.forEach(choice => {
      const isSelected = choice.selected;
      const choiceBg = new PIXI.Graphics();
      choiceBg.beginFill(
        isSelected ? GAME_CONFIG.COLORS.AMBER : 0x2a2a2a,
        isSelected ? 0.3 : 0.6
      );
      choiceBg.lineStyle(
        2,
        isSelected ? GAME_CONFIG.COLORS.GOLD : 0x444444,
        isSelected ? 1 : 0.5
      );
      choiceBg.drawRoundedRect(60, choiceY, 590, 40, 6);
      choiceBg.endFill();
      container.addChild(choiceBg);

      const choiceIcon = new PIXI.Text(isSelected ? '●' : '○', {
        fontSize: 16,
        fill: isSelected ? GAME_CONFIG.COLORS.GOLD : 0x888888
      });
      choiceIcon.anchor.set(0, 0.5);
      choiceIcon.x = 75;
      choiceIcon.y = choiceY + 20;
      container.addChild(choiceIcon);

      const choiceText = new PIXI.Text(choice.text, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: isSelected ? 0xFFFFFF : 0xAAAAAA
      });
      choiceText.anchor.set(0, 0.5);
      choiceText.x = 100;
      choiceText.y = choiceY + 20;
      container.addChild(choiceText);

      if (choice.leadsToEnding) {
        const endingBadge = new PIXI.Text('🏆 影响结局', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 11,
          fill: GAME_CONFIG.COLORS.WARM_ORANGE
        });
        endingBadge.anchor.set(1, 0.5);
        endingBadge.x = 630;
        endingBadge.y = choiceY + 20;
        container.addChild(endingBadge);
      }

      choiceY += 48;
    });

    if (isMade && summary.selectedChoiceConsequence) {
      const consequenceLabel = new PIXI.Text('选择结果:', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      consequenceLabel.anchor.set(0, 0);
      consequenceLabel.x = 60;
      consequenceLabel.y = y + 225;
      container.addChild(consequenceLabel);

      const consequenceText = new PIXI.Text(summary.selectedChoiceConsequence, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: 0xCCCCCC,
        wordWrap: true,
        wordWrapWidth: 500,
        lineHeight: 18
      });
      consequenceText.anchor.set(0, 0);
      consequenceText.x = 120;
      consequenceText.y = y + 225;
      container.addChild(consequenceText);
    }

    return container;
  }

  private createEndingCard(condition: FinalReviewEndingCondition, y: number): PIXI.Container {
    const container = new PIXI.Container();

    const typeColor = condition.endingType === 'true' ? GAME_CONFIG.COLORS.GOLD :
                      condition.endingType === 'good' ? GAME_CONFIG.COLORS.AMBER :
                      condition.endingType === 'bad' ? GAME_CONFIG.COLORS.WARM_ORANGE : 0x888888;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BG, 0.8);
    bg.lineStyle(3, typeColor, condition.isUnlocked ? 0.9 : 0.3);
    bg.drawRoundedRect(40, y, 630, 300, 12);
    bg.endFill();
    container.addChild(bg);

    const icon = new PIXI.Text(condition.isUnlocked ? condition.endingIcon : '❓', {
      fontSize: 48
    });
    icon.anchor.set(0, 0);
    icon.x = 60;
    icon.y = y + 25;
    icon.alpha = condition.isUnlocked ? 1 : 0.4;
    container.addChild(icon);

    const titleText = new PIXI.Text(condition.isUnlocked ? condition.endingTitle : '??? 未知结局', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: condition.isUnlocked ? typeColor : 0x666666
    });
    titleText.anchor.set(0, 0);
    titleText.x = 125;
    titleText.y = y + 30;
    container.addChild(titleText);

    const typeLabel = condition.endingType === 'true' ? '🌟 真结局' :
                    condition.endingType === 'good' ? '💫 好结局' :
                    condition.endingType === 'bad' ? '💔 坏结局' : '🌙 普通结局';
    const typeText = new PIXI.Text(typeLabel, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: typeColor
    });
    typeText.anchor.set(0, 0);
    typeText.x = 125;
    typeText.y = y + 62;
    container.addChild(typeText);

    const status = condition.isAchieved ? '🏆 已达成' :
                   condition.isUnlocked ? '🔓 已解锁' : '🔒 未解锁';
    const statusColor = condition.isAchieved ? GAME_CONFIG.COLORS.GOLD :
                        condition.isUnlocked ? GAME_CONFIG.COLORS.AMBER : 0x666666;
    const statusText = new PIXI.Text(status, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: statusColor
    });
    statusText.anchor.set(1, 0);
    statusText.x = 650;
    statusText.y = y + 35;
    container.addChild(statusText);

    const progressLabel = new PIXI.Text('解锁进度', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 12,
      fill: 0xAAAAAA
    });
    progressLabel.anchor.set(0, 0);
    progressLabel.x = 60;
    progressLabel.y = y + 95;
    container.addChild(progressLabel);

    const progressWidth = 450;
    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x333333, 0.8);
    progressBg.drawRoundedRect(130, y + 95, progressWidth, 14, 7);
    progressBg.endFill();
    container.addChild(progressBg);

    const progressFill = new PIXI.Graphics();
    progressFill.beginFill(typeColor, 1);
    progressFill.drawRoundedRect(130, y + 95, progressWidth * (condition.unlockProgress / 100), 14, 7);
    progressFill.endFill();
    container.addChild(progressFill);

    const progressText = new PIXI.Text(`${condition.unlockProgress}%`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 12,
      fill: 0xFFFFFF
    });
    progressText.anchor.set(0.5);
    progressText.x = 130 + progressWidth / 2;
    progressText.y = y + 102;
    container.addChild(progressText);

    const conditionsTitle = new PIXI.Text('开启条件:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    conditionsTitle.anchor.set(0, 0);
    conditionsTitle.x = 60;
    conditionsTitle.y = y + 125;
    container.addChild(conditionsTitle);

    let condY = y + 150;
    condition.requiredConditions.slice(0, 5).forEach(cond => {
      if (cond.description.includes('/') && !cond.description.includes('线索:') && !cond.description.includes('抉择:')) {
        const condIcon = new PIXI.Text(cond.satisfied ? '✓' : '○', {
          fontSize: 14,
          fill: cond.satisfied ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE
        });
        condIcon.anchor.set(0, 0);
        condIcon.x = 75;
        condIcon.y = condY;
        container.addChild(condIcon);

        const condText = new PIXI.Text(cond.description, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 13,
          fill: cond.satisfied ? 0xFFFFFF : 0x999999
        });
        condText.anchor.set(0, 0);
        condText.x = 95;
        condText.y = condY;
        container.addChild(condText);

        condY += 22;
      }
    });

    const hintBg = new PIXI.Graphics();
    hintBg.beginFill(GAME_CONFIG.COLORS.DEEP_PURPLE, 0.3);
    hintBg.lineStyle(1, GAME_CONFIG.COLORS.AMBER, 0.4);
    hintBg.drawRoundedRect(60, y + 250, 590, 35, 6);
    hintBg.endFill();
    container.addChild(hintBg);

    const hintText = new PIXI.Text(condition.hint, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 13,
      fill: 0xDDDDDD,
      wordWrap: true,
      wordWrapWidth: 560
    });
    hintText.anchor.set(0, 0.5);
    hintText.x = 75;
    hintText.y = y + 267;
    container.addChild(hintText);

    return container;
  }

  private createButton(text: string, x: number, y: number, isSecondary: boolean = false): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const color = isSecondary ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.AMBER;
    const textColor = isSecondary ? 0xFFFFFF : GAME_CONFIG.COLORS.DARK_BROWN;

    btn.beginFill(color, 0.9);
    btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 200, 60, 12);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: textColor
    });
    btnText.anchor.set(0.5);
    btnText.x = 100;
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

  private closeReviewPanel(): void {
    if (!this.reviewPanel) return;

    const panel = this.reviewPanel;
    Animator.animate(
      400,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.reviewPanel = null;
        this.contentContainer = null;
        this.isOpen = false;
      }
    );
  }

  update(_delta: number): void {
  }

  destroy(): void {
    eventBus.off('finalreview:show', this.handleShow.bind(this));
    if (this.reviewPanel) {
      this.reviewPanel.destroy();
    }
  }
}
