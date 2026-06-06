import * as PIXI from 'pixi.js';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';
import { Clue, Character, TimelineEvent, Chapter } from '../game/types';

type ReadingRoomTab = 'search' | 'timeline' | 'characters' | 'review';

export class ArchiveReadingRoomModule {
  private container: PIXI.Container;
  private toggleBtn: PIXI.Graphics;
  private panel: PIXI.Container | null = null;
  private isOpen: boolean = false;
  private currentTab: ReadingRoomTab = 'search';
  private notification: PIXI.Container | null = null;

  private searchQuery: string = '';
  private searchResults: { clues: Clue[]; characters: Character[]; events: TimelineEvent[] } = { clues: [], characters: [], events: [] };
  private selectedClue: Clue | null = null;
  private selectedCharacter: Character | null = null;
  private selectedEvent: TimelineEvent | null = null;
  private selectedChapter: Chapter | null = null;
  private detailPanel: PIXI.Container | null = null;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.toggleBtn = this.createToggleButton();
    this.container.addChild(this.toggleBtn);
    this.setupEventListeners();
    this.updateBadge();
  }

  private setupEventListeners(): void {
    eventBus.on('readingroom:character-unlock', this.handleContentUnlock.bind(this));
    eventBus.on('readingroom:event-unlock', this.handleContentUnlock.bind(this));
    eventBus.on('clue:collect', this.handleClueCollect.bind(this));
    eventBus.on('chapter:complete', this.handleChapterComplete.bind(this));
  }

  private createToggleButton(): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    btn.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    btn.drawRoundedRect(0, 0, 100, 60, 15);
    btn.endFill();

    const icon = new PIXI.Text('📚', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 50;
    icon.y = 30;
    btn.addChild(icon);

    const badge = new PIXI.Graphics();
    badge.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 0.9);
    badge.drawCircle(0, 0, 12);
    badge.endFill();
    badge.x = 85;
    badge.y = 15;
    badge.visible = false;
    btn.addChild(badge);
    (btn as any).badge = badge;

    const badgeText = new PIXI.Text('', {
      fontSize: 14,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 0;
    badgeText.y = 0;
    badge.addChild(badgeText);
    (btn as any).badgeText = badgeText;

    btn.x = GAME_CONFIG.DESIGN_WIDTH - 130;
    btn.y = GAME_CONFIG.DESIGN_HEIGHT - 160;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.togglePanel();
    });

    return btn;
  }

  private updateBadge(): void {
    const badge = (this.toggleBtn as any).badge as PIXI.Graphics;
    const badgeText = (this.toggleBtn as any).badgeText as PIXI.Text;
    const unreadCount = store.getUnreadCount();
    badge.visible = unreadCount > 0;
    badgeText.text = unreadCount > 9 ? '9+' : unreadCount.toString();
  }

  private togglePanel(): void {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel(): void {
    this.isOpen = true;
    this.panel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.panel.addChild(overlay);

    const mainPanel = new PIXI.Graphics();
    mainPanel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    mainPanel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    mainPanel.drawRoundedRect(25, 80, 700, 1180, 25);
    mainPanel.endFill();
    this.panel.addChild(mainPanel);

    const title = new PIXI.Text('档案阅览室', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 145;
    this.panel.addChild(title);

    const subtitle = new PIXI.Text('整合线索检索、事件时间轴、人物关系与章节回顾', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 185;
    this.panel.addChild(subtitle);

    this.createTabButtons();
    this.renderTabContent();

    this.panel.alpha = 0;
    this.container.addChild(this.panel);

    Animator.animate(
      350,
      (progress) => {
        this.panel!.alpha = progress;
        this.panel!.scale.set(0.95 + progress * 0.05);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createTabButtons(): void {
    if (!this.panel) return;

    const tabs: { id: ReadingRoomTab; label: string; icon: string }[] = [
      { id: 'search', label: '线索检索', icon: '🔍' },
      { id: 'timeline', label: '事件时间轴', icon: '📅' },
      { id: 'characters', label: '人物关系', icon: '👥' },
      { id: 'review', label: '章节回顾', icon: '📖' }
    ];

    const startX = 45;
    const tabWidth = 155;
    const gap = 10;

    tabs.forEach((tab, index) => {
      const btn = new PIXI.Graphics();
      const isActive = this.currentTab === tab.id;
      const color = isActive ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE;
      const textColor = isActive ? GAME_CONFIG.COLORS.DARK_BROWN : 0xFFFFFF;

      btn.beginFill(color, isActive ? 0.95 : 0.5);
      btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, isActive ? 1 : 0.5);
      btn.drawRoundedRect(0, 0, tabWidth, 55, 10);
      btn.endFill();

      const iconText = new PIXI.Text(tab.icon, { fontSize: 20 });
      iconText.anchor.set(0.5);
      iconText.x = 25;
      iconText.y = 27;
      btn.addChild(iconText);

      const btnText = new PIXI.Text(tab.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: textColor
      });
      btnText.anchor.set(0, 0.5);
      btnText.x = 45;
      btnText.y = 27;
      btn.addChild(btnText);

      btn.x = startX + index * (tabWidth + gap);
      btn.y = 220;
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.currentTab = tab.id;
        this.selectedClue = null;
        this.selectedCharacter = null;
        this.selectedEvent = null;
        this.selectedChapter = null;
        this.refreshPanel();
      });

      this.panel!.addChild(btn);
    });
  }

  private renderTabContent(): void {
    if (!this.panel) return;

    const contentY = 295;
    const contentHeight = 940;

    const contentBg = new PIXI.Graphics();
    contentBg.beginFill(0x000000, 0.4);
    contentBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    contentBg.drawRoundedRect(40, contentY, 670, contentHeight, 15);
    contentBg.endFill();
    this.panel.addChild(contentBg);

    switch (this.currentTab) {
      case 'search':
        this.renderSearchTab(contentY + 20);
        break;
      case 'timeline':
        this.renderTimelineTab(contentY + 20);
        break;
      case 'characters':
        this.renderCharactersTab(contentY + 20);
        break;
      case 'review':
        this.renderReviewTab(contentY + 20);
        break;
    }
  }

  private renderSearchTab(startY: number): void {
    if (!this.panel) return;

    const searchBoxBg = new PIXI.Graphics();
    searchBoxBg.beginFill(0x000000, 0.6);
    searchBoxBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
    searchBoxBg.drawRoundedRect(0, 0, 630, 60, 12);
    searchBoxBg.endFill();
    searchBoxBg.x = 60;
    searchBoxBg.y = startY;
    this.panel.addChild(searchBoxBg);

    const searchIcon = new PIXI.Text('🔍', { fontSize: 28 });
    searchIcon.x = 80;
    searchIcon.y = startY + 12;
    this.panel.addChild(searchIcon);

    const searchInput = new PIXI.Text(this.searchQuery || '输入关键词搜索线索、人物、事件...', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: this.searchQuery ? 0xFFFFFF : 0x888888
    });
    searchInput.x = 125;
    searchInput.y = startY + 15;
    this.panel.addChild(searchInput);

    if (this.searchQuery) {
      const clearBtn = new PIXI.Text('✕', { fontSize: 24, fill: GAME_CONFIG.COLORS.WARM_ORANGE });
      clearBtn.x = 650;
      clearBtn.y = startY + 12;
      clearBtn.eventMode = 'static';
      clearBtn.cursor = 'pointer';
      clearBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.searchQuery = '';
        this.searchResults = { clues: [], characters: [], events: [] };
        this.refreshPanel();
      });
      this.panel.addChild(clearBtn);
    }

    searchBoxBg.eventMode = 'static';
    searchBoxBg.cursor = 'text';
    searchBoxBg.on('pointerdown', () => {
      this.showKeyboardInput();
    });

    const searchHistory = store.getReadingRoomState().searchHistory;
    if (searchHistory.length > 0 && !this.searchQuery) {
      const historyTitle = new PIXI.Text('搜索历史', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      historyTitle.x = 60;
      historyTitle.y = startY + 80;
      this.panel.addChild(historyTitle);

      const clearHistoryBtn = new PIXI.Text('清除', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      clearHistoryBtn.x = 630;
      clearHistoryBtn.y = startY + 82;
      clearHistoryBtn.eventMode = 'static';
      clearHistoryBtn.cursor = 'pointer';
      clearHistoryBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        store.clearSearchHistory();
        this.refreshPanel();
      });
      this.panel.addChild(clearHistoryBtn);

      searchHistory.slice(0, 5).forEach((query, index) => {
        const historyItem = new PIXI.Text(`🕐 ${query}`, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 16,
          fill: 0xAAAAAA
        });
        historyItem.x = 60;
        historyItem.y = startY + 115 + index * 35;
        historyItem.eventMode = 'static';
        historyItem.cursor = 'pointer';
        historyItem.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.executeSearch(query);
        });
        this.panel!.addChild(historyItem);
      });
    }

    if (this.searchQuery) {
      let resultY = startY + 80;

      if (this.searchResults.clues.length > 0) {
        const sectionTitle = new PIXI.Text(`📋 线索 (${this.searchResults.clues.length})`, {
          fontFamily: GAME_CONFIG.FONTS.TITLE,
          fontSize: 20,
          fill: GAME_CONFIG.COLORS.AMBER
        });
        sectionTitle.x = 60;
        sectionTitle.y = resultY;
        this.panel.addChild(sectionTitle);
        resultY += 35;

        this.searchResults.clues.slice(0, 3).forEach((clue) => {
          const item = this.createClueSearchItem(clue, resultY);
          this.panel!.addChild(item);
          resultY += 95;
        });
        resultY += 10;
      }

      if (this.searchResults.characters.length > 0) {
        const sectionTitle = new PIXI.Text(`👥 人物 (${this.searchResults.characters.length})`, {
          fontFamily: GAME_CONFIG.FONTS.TITLE,
          fontSize: 20,
          fill: GAME_CONFIG.COLORS.AMBER
        });
        sectionTitle.x = 60;
        sectionTitle.y = resultY;
        this.panel.addChild(sectionTitle);
        resultY += 35;

        this.searchResults.characters.slice(0, 3).forEach((character) => {
          const item = this.createCharacterSearchItem(character, resultY);
          this.panel!.addChild(item);
          resultY += 95;
        });
        resultY += 10;
      }

      if (this.searchResults.events.length > 0) {
        const sectionTitle = new PIXI.Text(`📅 事件 (${this.searchResults.events.length})`, {
          fontFamily: GAME_CONFIG.FONTS.TITLE,
          fontSize: 20,
          fill: GAME_CONFIG.COLORS.AMBER
        });
        sectionTitle.x = 60;
        sectionTitle.y = resultY;
        this.panel.addChild(sectionTitle);
        resultY += 35;

        this.searchResults.events.slice(0, 3).forEach((event) => {
          const item = this.createEventSearchItem(event, resultY);
          this.panel!.addChild(item);
          resultY += 95;
        });
      }

      const totalResults = this.searchResults.clues.length + this.searchResults.characters.length + this.searchResults.events.length;
      if (totalResults === 0) {
        const emptyText = new PIXI.Text('未找到相关内容\n尝试使用其他关键词搜索', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 20,
          fill: 0x888888,
          align: 'center'
        });
        emptyText.anchor.set(0.5);
        emptyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
        emptyText.y = startY + 350;
        this.panel.addChild(emptyText);
      }
    }

    if (!this.searchQuery && searchHistory.length === 0) {
      const tips = [
        '💡 提示：',
        '• 搜索"琥珀"可以找到相关线索和人物',
        '• 搜索"青铜"可以找到历史馆相关内容',
        '• 搜索"爷爷"可以找到关于爷爷的故事',
        '• 点击搜索框开始输入关键词'
      ];

      tips.forEach((tip, index) => {
        const tipText = new PIXI.Text(tip, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: index === 0 ? GAME_CONFIG.COLORS.AMBER : 0xAAAAAA
        });
        tipText.x = 60;
        tipText.y = startY + 200 + index * 40;
        this.panel!.addChild(tipText);
      });
    }
  }

  private createClueSearchItem(clue: Clue, y: number): PIXI.Container {
    const container = new PIXI.Container();
    const width = 630;
    const height = 85;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.4);
    bg.drawRoundedRect(0, 0, width, height, 10);
    bg.endFill();
    container.addChild(bg);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.drawCircle(0, 0, 30);
    iconBg.endFill();
    iconBg.x = 40;
    iconBg.y = height / 2;
    container.addChild(iconBg);

    const icon = new PIXI.Text(clue.icon, { fontSize: 32 });
    icon.anchor.set(0.5);
    icon.x = 40;
    icon.y = height / 2;
    container.addChild(icon);

    const name = new PIXI.Text(clue.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    name.x = 85;
    name.y = 12;
    container.addChild(name);

    const chapter = store.getChapters().find(c => c.id === clue.chapterId);
    const chapterTag = new PIXI.Text(chapter?.title.split('：')[0] || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    chapterTag.x = width - 120;
    chapterTag.y = 15;
    container.addChild(chapterTag);

    const desc = new PIXI.Text(clue.description.slice(0, 45) + '...', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xCCCCCC
    });
    desc.x = 85;
    desc.y = 40;
    container.addChild(desc);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showClueDetail(clue);
    });

    container.x = 60;
    container.y = y;
    return container;
  }

  private createCharacterSearchItem(character: Character, y: number): PIXI.Container {
    const container = new PIXI.Container();
    const width = 630;
    const height = 85;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.4);
    bg.drawRoundedRect(0, 0, width, height, 10);
    bg.endFill();
    container.addChild(bg);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.drawCircle(0, 0, 30);
    iconBg.endFill();
    iconBg.x = 40;
    iconBg.y = height / 2;
    container.addChild(iconBg);

    const icon = new PIXI.Text(character.avatar, { fontSize: 32 });
    icon.anchor.set(0.5);
    icon.x = 40;
    icon.y = height / 2;
    container.addChild(icon);

    const name = new PIXI.Text(character.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    name.x = 85;
    name.y = 12;
    container.addChild(name);

    const roleTag = new PIXI.Text(character.role, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    roleTag.x = width - 120;
    roleTag.y = 15;
    container.addChild(roleTag);

    const desc = new PIXI.Text(character.description.slice(0, 45) + '...', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xCCCCCC
    });
    desc.x = 85;
    desc.y = 40;
    container.addChild(desc);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showCharacterDetail(character);
    });

    container.x = 60;
    container.y = y;
    return container;
  }

  private createEventSearchItem(event: TimelineEvent, y: number): PIXI.Container {
    const container = new PIXI.Container();
    const width = 630;
    const height = 85;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.4);
    bg.drawRoundedRect(0, 0, width, height, 10);
    bg.endFill();
    container.addChild(bg);

    const typeIcons: Record<string, string> = {
      story: '📖',
      clue: '🔍',
      mechanism: '🔐',
      character: '👤',
      important: '⭐'
    };

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.drawCircle(0, 0, 30);
    iconBg.endFill();
    iconBg.x = 40;
    iconBg.y = height / 2;
    container.addChild(iconBg);

    const icon = new PIXI.Text(typeIcons[event.type] || '📅', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 40;
    icon.y = height / 2;
    container.addChild(icon);

    const name = new PIXI.Text(event.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    name.x = 85;
    name.y = 12;
    container.addChild(name);

    const dateTag = new PIXI.Text(event.date, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    dateTag.x = width - 150;
    dateTag.y = 15;
    container.addChild(dateTag);

    const desc = new PIXI.Text(event.description.slice(0, 45) + '...', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xCCCCCC
    });
    desc.x = 85;
    desc.y = 40;
    container.addChild(desc);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showEventDetail(event);
    });

    container.x = 60;
    container.y = y;
    return container;
  }

  private showKeyboardInput(): void {
    const input = prompt('请输入搜索关键词：', this.searchQuery);
    if (input !== null) {
      this.executeSearch(input);
    }
  }

  private executeSearch(query: string): void {
    this.searchQuery = query;
    store.addToSearchHistory(query);
    this.searchResults = {
      clues: store.searchClues(query),
      characters: store.searchCharacters(query),
      events: store.searchTimelineEvents(query)
    };
    this.refreshPanel();
  }

  private showClueDetail(clue: Clue): void {
    this.selectedClue = clue;
    this.renderDetailPanel();
  }

  private showCharacterDetail(character: Character): void {
    this.selectedCharacter = character;
    store.markCharacterAsViewed(character.id);
    this.updateBadge();
    this.renderDetailPanel();
  }

  private showEventDetail(event: TimelineEvent): void {
    this.selectedEvent = event;
    store.markEventAsViewed(event.id);
    this.updateBadge();
    this.renderDetailPanel();
  }

  private renderTimelineTab(startY: number): void {
    if (!this.panel) return;

    const events = store.getUnlockedTimelineEvents();
    const totalEvents = store.getTimelineEvents().length;

    const header = new PIXI.Text(`已解锁 ${events.length} / ${totalEvents} 个事件`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    header.x = 60;
    header.y = startY;
    this.panel.addChild(header);

    const legend = new PIXI.Container();
    const legendItems = [
      { icon: '⭐', label: '重要', color: GAME_CONFIG.COLORS.GOLD },
      { icon: '📖', label: '故事', color: GAME_CONFIG.COLORS.AMBER },
      { icon: '🔐', label: '机关', color: GAME_CONFIG.COLORS.BRONZE },
      { icon: '🔍', label: '线索', color: GAME_CONFIG.COLORS.WARM_ORANGE }
    ];

    legendItems.forEach((item, index) => {
      const itemText = new PIXI.Text(`${item.icon} ${item.label}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: item.color
      });
      itemText.x = index * 120;
      itemText.y = 0;
      legend.addChild(itemText);
    });

    legend.x = 60;
    legend.y = startY + 35;
    this.panel.addChild(legend);

    const timelineBg = new PIXI.Graphics();
    timelineBg.beginFill(0x000000, 0.3);
    timelineBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.2);
    timelineBg.drawRoundedRect(0, 0, 630, 820, 12);
    timelineBg.endFill();
    timelineBg.x = 60;
    timelineBg.y = startY + 80;
    this.panel.addChild(timelineBg);

    const mask = new PIXI.Graphics();
    mask.beginFill(0xFFFFFF);
    mask.drawRoundedRect(60, startY + 80, 630, 820, 12);
    mask.endFill();
    this.panel.addChild(mask);

    const scrollContainer = new PIXI.Container();
    scrollContainer.mask = mask;

    const centerX = 375;
    const itemHeight = 160;
    const lineX = centerX - 60;

    events.forEach((event, index) => {
      const itemY = index * itemHeight + 20;

      const line = new PIXI.Graphics();
      line.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.6);
      line.moveTo(lineX, itemY - 50);
      line.lineTo(lineX, itemY + itemHeight - 50);
      scrollContainer.addChild(line);

      const nodeBg = new PIXI.Graphics();
      const nodeColors: Record<string, number> = {
        important: GAME_CONFIG.COLORS.GOLD,
        story: GAME_CONFIG.COLORS.AMBER,
        mechanism: GAME_CONFIG.COLORS.BRONZE,
        clue: GAME_CONFIG.COLORS.WARM_ORANGE,
        character: GAME_CONFIG.COLORS.DEEP_PURPLE
      };
      nodeBg.beginFill(nodeColors[event.type] || GAME_CONFIG.COLORS.AMBER);
      nodeBg.lineStyle(3, GAME_CONFIG.COLORS.DARK_BROWN, 1);
      nodeBg.drawCircle(0, 0, 18);
      nodeBg.endFill();
      nodeBg.x = lineX;
      nodeBg.y = itemY + 30;
      scrollContainer.addChild(nodeBg);

      const typeIcons: Record<string, string> = {
        story: '📖',
        clue: '🔍',
        mechanism: '🔐',
        character: '👤',
        important: '⭐'
      };
      const nodeIcon = new PIXI.Text(typeIcons[event.type] || '📅', { fontSize: 16 });
      nodeIcon.anchor.set(0.5);
      nodeIcon.x = lineX;
      nodeIcon.y = itemY + 30;
      scrollContainer.addChild(nodeIcon);

      const dateText = new PIXI.Text(event.date, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      dateText.x = 70;
      dateText.y = itemY;
      scrollContainer.addChild(dateText);

      const titleText = new PIXI.Text(event.title, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      titleText.x = 70;
      titleText.y = itemY + 25;
      scrollContainer.addChild(titleText);

      const descText = new PIXI.Text(event.description.slice(0, 60) + '...', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: 0xCCCCCC,
        wordWrap: true,
        wordWrapWidth: 280
      });
      descText.x = 70;
      descText.y = itemY + 55;
      scrollContainer.addChild(descText);

      const viewBtn = this.createSmallButton('查看详情', 70, itemY + 110, 120, 40);
      viewBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.showEventDetail(event);
      });
      scrollContainer.addChild(viewBtn);

      if (event.relatedCharacterIds.length > 0) {
        const relatedTitle = new PIXI.Text('相关人物：', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 13,
          fill: GAME_CONFIG.COLORS.AMBER
        });
        relatedTitle.x = 420;
        relatedTitle.y = itemY;
        scrollContainer.addChild(relatedTitle);

        event.relatedCharacterIds.slice(0, 3).forEach((charId, charIndex) => {
          const char = store.getCharacterById(charId);
          if (char && char.unlocked) {
            const charAvatar = new PIXI.Text(char.avatar, { fontSize: 24 });
            charAvatar.x = 420 + charIndex * 40;
            charAvatar.y = itemY + 25;
            charAvatar.eventMode = 'static';
            charAvatar.cursor = 'pointer';
            charAvatar.on('pointerdown', () => {
              audioModule.playSFX('sfx_click');
              this.showCharacterDetail(char);
            });
            scrollContainer.addChild(charAvatar);
          }
        });
      }
    });

    scrollContainer.y = startY + 80;
    this.panel.addChild(scrollContainer);

    if (events.length === 0) {
      const emptyText = new PIXI.Text('暂无解锁的事件\n收集更多线索以解锁事件时间轴', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: 0x888888,
        align: 'center'
      });
      emptyText.anchor.set(0.5);
      emptyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      emptyText.y = startY + 450;
      this.panel.addChild(emptyText);
    }

    const totalHeight = events.length * itemHeight + 40;
    if (totalHeight > 820) {
      this.setupTimelineScroll(scrollContainer, totalHeight, 820);
    }
  }

  private setupTimelineScroll(container: PIXI.Container, contentHeight: number, viewHeight: number): void {
    let isDragging = false;
    let startY = 0;
    let containerStartY = 0;

    container.eventMode = 'static';
    container.on('pointerdown', (e) => {
      isDragging = true;
      startY = e.global.y;
      containerStartY = container.y;
    });

    container.on('pointermove', (e) => {
      if (!isDragging) return;
      const deltaY = e.global.y - startY;
      let newY = containerStartY + deltaY;
      const minY = 295 + 80;
      const maxY = minY + viewHeight - contentHeight;
      newY = Math.max(maxY, Math.min(minY, newY));
      container.y = newY;
    });

    container.on('pointerup', () => { isDragging = false; });
    container.on('pointerupoutside', () => { isDragging = false; });
  }

  private renderCharactersTab(startY: number): void {
    if (!this.panel) return;

    const characters = store.getUnlockedCharacters();
    const totalCharacters = store.getCharacters().length;

    const header = new PIXI.Text(`已解锁 ${characters.length} / ${totalCharacters} 个人物`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    header.x = 60;
    header.y = startY;
    this.panel.addChild(header);

    const cardWidth = 300;
    const cardHeight = 180;
    const gapX = 30;
    const gapY = 25;
    const startX = 60;

    characters.forEach((character, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const card = this.createCharacterCard(character);
      card.x = startX + col * (cardWidth + gapX);
      card.y = startY + 50 + row * (cardHeight + gapY);
      this.panel!.addChild(card);
    });

    if (characters.length === 0) {
      const emptyText = new PIXI.Text('暂无解锁的人物\n收集更多线索以解锁人物档案', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: 0x888888,
        align: 'center'
      });
      emptyText.anchor.set(0.5);
      emptyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      emptyText.y = startY + 350;
      this.panel.addChild(emptyText);
    }

    const lockedCount = totalCharacters - characters.length;
    if (lockedCount > 0) {
      const lockedText = new PIXI.Text(`还有 ${lockedCount} 个人物待解锁`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'center'
      });
      lockedText.anchor.set(0.5);
      lockedText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      lockedText.y = startY + 880;
      this.panel.addChild(lockedText);
    }
  }

  private createCharacterCard(character: Character): PIXI.Container {
    const container = new PIXI.Container();
    const width = 300;
    const height = 180;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.4);
    bg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.6);
    bg.drawRoundedRect(0, 0, width, height, 15);
    bg.endFill();
    container.addChild(bg);

    const avatarBg = new PIXI.Graphics();
    avatarBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.3);
    avatarBg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 0.8);
    avatarBg.drawCircle(0, 0, 45);
    avatarBg.endFill();
    avatarBg.x = 60;
    avatarBg.y = 65;
    container.addChild(avatarBg);

    const avatar = new PIXI.Text(character.avatar, { fontSize: 48 });
    avatar.anchor.set(0.5);
    avatar.x = 60;
    avatar.y = 65;
    container.addChild(avatar);

    const name = new PIXI.Text(character.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    name.x = 120;
    name.y = 30;
    container.addChild(name);

    const role = new PIXI.Text(character.role, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    role.x = 120;
    role.y = 60;
    container.addChild(role);

    const desc = new PIXI.Text(character.description.slice(0, 50) + '...', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: 0xCCCCCC,
      wordWrap: true,
      wordWrapWidth: 160
    });
    desc.x = 120;
    desc.y = 85;
    container.addChild(desc);

    const relationCount = character.relationships.filter(
      r => store.getCharacterById(r.targetId)?.unlocked
    ).length;
    const relationText = new PIXI.Text(`关系: ${relationCount}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    relationText.x = 20;
    relationText.y = 130;
    container.addChild(relationText);

    const clueCount = character.relatedClues.filter(
      c => store.getState().collectedClues.includes(c)
    ).length;
    const clueText = new PIXI.Text(`线索: ${clueCount}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    clueText.x = 110;
    clueText.y = 130;
    container.addChild(clueText);

    const viewBtn = this.createSmallButton('查看详情', 190, 125, 95, 40);
    viewBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showCharacterDetail(character);
    });
    container.addChild(viewBtn);

    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showCharacterDetail(character);
    });

    return container;
  }

  private renderReviewTab(startY: number): void {
    if (!this.panel) return;

    const chapters = store.getChapters();
    const completedChapters = chapters.filter(c => c.completed);

    const header = new PIXI.Text(`已完成 ${completedChapters.length} / ${chapters.length} 章节`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    header.x = 60;
    header.y = startY;
    this.panel.addChild(header);

    chapters.forEach((chapter, index) => {
      const item = this.createChapterReviewItem(chapter, index, startY + 50 + index * 200);
      this.panel!.addChild(item);
    });
  }

  private createChapterReviewItem(chapter: Chapter, index: number, y: number): PIXI.Container {
    const container = new PIXI.Container();
    const width = 630;
    const height = 180;

    const isUnlocked = index === 0 || store.getChapters()[index - 1].completed;
    const bg = new PIXI.Graphics();
    bg.beginFill(chapter.completed ? GAME_CONFIG.COLORS.BRONZE : 0x333333, chapter.completed ? 0.4 : 0.6);
    bg.lineStyle(3, chapter.completed ? GAME_CONFIG.COLORS.AMBER : 0x555555, chapter.completed ? 0.6 : 0.3);
    bg.drawRoundedRect(0, 0, width, height, 15);
    bg.endFill();
    container.addChild(bg);

    const chapterNum = new PIXI.Text(`第${['一', '二', '三', '四'][index]}章`, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 16,
      fill: chapter.completed ? GAME_CONFIG.COLORS.AMBER : 0x666666
    });
    chapterNum.x = 25;
    chapterNum.y = 20;
    container.addChild(chapterNum);

    if (chapter.completed) {
      const completeIcon = new PIXI.Text('✅', { fontSize: 20 });
      completeIcon.x = 550;
      completeIcon.y = 20;
      container.addChild(completeIcon);
    } else if (!isUnlocked) {
      const lockIcon = new PIXI.Text('🔒', { fontSize: 20 });
      lockIcon.x = 550;
      lockIcon.y = 20;
      container.addChild(lockIcon);
    }

    const title = new PIXI.Text(chapter.title.split('：')[1] || chapter.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: chapter.completed ? GAME_CONFIG.COLORS.AMBER : 0x666666
    });
    title.x = 25;
    title.y = 45;
    container.addChild(title);

    const collectedClues = store.getCollectedClues().filter(c => chapter.requiredClues.includes(c.id)).length;
    const totalClues = chapter.requiredClues.length;
    const progressText = new PIXI.Text(`线索: ${collectedClues} / ${totalClues}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: chapter.completed ? GAME_CONFIG.COLORS.CREAM : 0x666666
    });
    progressText.x = 25;
    progressText.y = 80;
    container.addChild(progressText);

    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x000000, 0.6);
    progressBg.drawRoundedRect(0, 0, 300, 10, 5);
    progressBg.endFill();
    progressBg.x = 25;
    progressBg.y = 105;
    container.addChild(progressBg);

    const progress = totalClues > 0 ? collectedClues / totalClues : 0;
    const progressFill = new PIXI.Graphics();
    progressFill.beginFill(chapter.completed ? GAME_CONFIG.COLORS.AMBER : 0x555555);
    progressFill.drawRoundedRect(0, 0, 300 * progress, 10, 5);
    progressFill.endFill();
    progressFill.x = 25;
    progressFill.y = 105;
    container.addChild(progressFill);

    if (chapter.completed) {
      const reviewBtn = this.createSmallButton('回顾章节', 480, 70, 120, 50);
      reviewBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.showChapterReview(chapter);
      });
      container.addChild(reviewBtn);

      const storyPreview = new PIXI.Text(chapter.storyText.slice(0, 60) + '...', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: 0xAAAAAA,
        wordWrap: true,
        wordWrapWidth: 400
      });
      storyPreview.x = 25;
      storyPreview.y = 125;
      container.addChild(storyPreview);
    } else if (isUnlocked) {
      const continueText = new PIXI.Text('继续探索以完成本章...', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      continueText.x = 25;
      continueText.y = 130;
      container.addChild(continueText);
    } else {
      const lockedText = new PIXI.Text('完成前一章后解锁', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: 0x666666
      });
      lockedText.x = 25;
      lockedText.y = 130;
      container.addChild(lockedText);
    }

    container.x = 60;
    container.y = y;
    return container;
  }

  private showChapterReview(chapter: Chapter): void {
    this.selectedChapter = chapter;
    this.renderDetailPanel();
  }

  private renderDetailPanel(): void {
    if (this.detailPanel) {
      this.container.removeChild(this.detailPanel);
      this.detailPanel.destroy();
    }

    if (!this.selectedClue && !this.selectedCharacter && !this.selectedEvent && !this.selectedChapter) {
      return;
    }

    this.detailPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.95);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.detailPanel!.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(40, 100, 670, 1150, 25);
    panel.endFill();
    this.detailPanel!.addChild(panel);

    if (this.selectedClue) {
      this.renderClueDetailContent();
    } else if (this.selectedCharacter) {
      this.renderCharacterDetailContent();
    } else if (this.selectedEvent) {
      this.renderEventDetailContent();
    } else if (this.selectedChapter) {
      this.renderChapterReviewContent();
    }

    this.detailPanel.alpha = 0;
    this.container.addChild(this.detailPanel);

    Animator.animate(
      300,
      (progress) => {
        this.detailPanel!.alpha = progress;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private renderClueDetailContent(): void {
    if (!this.detailPanel || !this.selectedClue) return;

    const clue = this.selectedClue;
    const chapter = store.getChapters().find(c => c.id === clue.chapterId);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 0.8);
    iconBg.drawCircle(0, 0, 70);
    iconBg.endFill();
    iconBg.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    iconBg.y = 220;
    this.detailPanel!.addChild(iconBg);

    const icon = new PIXI.Text(clue.icon, { fontSize: 72 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 220;
    this.detailPanel!.addChild(icon);

    const name = new PIXI.Text(clue.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    name.anchor.set(0.5);
    name.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    name.y = 330;
    this.detailPanel!.addChild(name);

    const chapterTag = new PIXI.Text(chapter?.title || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    chapterTag.anchor.set(0.5);
    chapterTag.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    chapterTag.y = 370;
    this.detailPanel!.addChild(chapterTag);

    const descBg = new PIXI.Graphics();
    descBg.beginFill(0x000000, 0.4);
    descBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    descBg.drawRoundedRect(70, 420, 610, 250, 15);
    descBg.endFill();
    this.detailPanel!.addChild(descBg);

    const descTitle = new PIXI.Text('📝 线索描述', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    descTitle.x = 90;
    descTitle.y = 445;
    this.detailPanel!.addChild(descTitle);

    const desc = new PIXI.Text(clue.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 570,
      lineHeight: 28
    });
    desc.x = 90;
    desc.y = 485;
    this.detailPanel!.addChild(desc);

    const isFavorite = store.isFavoriteClue(clue.id);
    const favoriteBtn = this.createButton(
      70,
      700,
      280,
      60,
      isFavorite ? '⭐ 已收藏' : '☆ 收藏线索',
      () => {
        audioModule.playSFX('sfx_click');
        store.toggleFavoriteClue(clue.id);
        this.closeDetailPanel();
      },
      isFavorite ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER
    );
    this.detailPanel!.addChild(favoriteBtn);

    const archiveBtn = this.createButton(
      380,
      700,
      280,
      60,
      '📁 归档线索',
      () => {
        audioModule.playSFX('sfx_click');
        store.archiveClue(clue.id);
        audioModule.playSFX('sfx_success');
        this.closeDetailPanel();
      }
    );
    this.detailPanel!.addChild(archiveBtn);

    if (clue.isMemory) {
      const memoryTag = new PIXI.Text(`🧠 记忆碎片 #${clue.memoryOrder}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      memoryTag.anchor.set(0.5);
      memoryTag.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      memoryTag.y = 790;
      this.detailPanel!.addChild(memoryTag);
    }
  }

  private renderCharacterDetailContent(): void {
    if (!this.detailPanel || !this.selectedCharacter) return;

    const character = this.selectedCharacter;

    const avatarBg = new PIXI.Graphics();
    avatarBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    avatarBg.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 0.8);
    avatarBg.drawCircle(0, 0, 80);
    avatarBg.endFill();
    avatarBg.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    avatarBg.y = 230;
    this.detailPanel!.addChild(avatarBg);

    const avatar = new PIXI.Text(character.avatar, { fontSize: 80 });
    avatar.anchor.set(0.5);
    avatar.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    avatar.y = 230;
    this.detailPanel!.addChild(avatar);

    const name = new PIXI.Text(character.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    name.anchor.set(0.5);
    name.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    name.y = 350;
    this.detailPanel!.addChild(name);

    const role = new PIXI.Text(character.role, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    role.anchor.set(0.5);
    role.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    role.y = 390;
    this.detailPanel!.addChild(role);

    const descBg = new PIXI.Graphics();
    descBg.beginFill(0x000000, 0.4);
    descBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    descBg.drawRoundedRect(70, 440, 610, 200, 15);
    descBg.endFill();
    this.detailPanel!.addChild(descBg);

    const descTitle = new PIXI.Text('📝 人物介绍', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    descTitle.x = 90;
    descTitle.y = 465;
    this.detailPanel!.addChild(descTitle);

    const desc = new PIXI.Text(character.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 17,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 570,
      lineHeight: 26
    });
    desc.x = 90;
    desc.y = 500;
    this.detailPanel!.addChild(desc);

    const relationsTitle = new PIXI.Text('👥 人物关系', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    relationsTitle.x = 70;
    relationsTitle.y = 670;
    this.detailPanel!.addChild(relationsTitle);

    let relationY = 710;
    const relationColors: Record<string, number> = {
      family: GAME_CONFIG.COLORS.AMBER,
      friend: GAME_CONFIG.COLORS.GREEN,
      teacher: GAME_CONFIG.COLORS.BRONZE,
      enemy: GAME_CONFIG.COLORS.WARM_ORANGE,
      mysterious: GAME_CONFIG.COLORS.DEEP_PURPLE
    };

    character.relationships.forEach((relation) => {
      const targetChar = store.getCharacterById(relation.targetId);
      if (!targetChar) return;

      const isUnlocked = targetChar.unlocked;
      const relationBg = new PIXI.Graphics();
      relationBg.beginFill(GAME_CONFIG.COLORS.BRONZE, isUnlocked ? 0.3 : 0.2);
      relationBg.lineStyle(2, relationColors[relation.relationshipType] || GAME_CONFIG.COLORS.AMBER, isUnlocked ? 0.5 : 0.3);
      relationBg.drawRoundedRect(0, 0, 610, 70, 10);
      relationBg.endFill();
      relationBg.x = 70;
      relationBg.y = relationY;
      this.detailPanel!.addChild(relationBg);

      const targetAvatar = new PIXI.Text(isUnlocked ? targetChar.avatar : '❓', { fontSize: 36 });
      targetAvatar.x = 90;
      targetAvatar.y = relationY + 12;
      this.detailPanel!.addChild(targetAvatar);

      const targetName = new PIXI.Text(isUnlocked ? targetChar.name : '???', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 18,
        fill: isUnlocked ? GAME_CONFIG.COLORS.AMBER : 0x666666
      });
      targetName.x = 150;
      targetName.y = relationY + 15;
      this.detailPanel!.addChild(targetName);

      const relationDesc = new PIXI.Text(isUnlocked ? relation.description : '收集更多线索以解锁', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: isUnlocked ? 0xCCCCCC : 0x555555
      });
      relationDesc.x = 150;
      relationDesc.y = relationY + 40;
      this.detailPanel!.addChild(relationDesc);

      if (isUnlocked) {
        relationBg.eventMode = 'static';
        relationBg.cursor = 'pointer';
        relationBg.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.closeDetailPanel();
          Animator.delay(200).then(() => {
            this.showCharacterDetail(targetChar);
          });
        });
      }

      relationY += 80;
    });
  }

  private renderEventDetailContent(): void {
    if (!this.detailPanel || !this.selectedEvent) return;

    const event = this.selectedEvent;

    const typeIcons: Record<string, string> = {
      story: '📖',
      clue: '🔍',
      mechanism: '🔐',
      character: '👤',
      important: '⭐'
    };

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 0.8);
    iconBg.drawCircle(0, 0, 60);
    iconBg.endFill();
    iconBg.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    iconBg.y = 200;
    this.detailPanel!.addChild(iconBg);

    const icon = new PIXI.Text(typeIcons[event.type] || '📅', { fontSize: 56 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 200;
    this.detailPanel!.addChild(icon);

    const title = new PIXI.Text(event.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 300;
    this.detailPanel!.addChild(title);

    const date = new PIXI.Text(`📅 ${event.date}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    date.anchor.set(0.5);
    date.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    date.y = 340;
    this.detailPanel!.addChild(date);

    const chapter = store.getChapters().find(c => c.id === event.chapterId);
    const chapterTag = new PIXI.Text(chapter?.title || '', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    chapterTag.anchor.set(0.5);
    chapterTag.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    chapterTag.y = 370;
    this.detailPanel!.addChild(chapterTag);

    const descBg = new PIXI.Graphics();
    descBg.beginFill(0x000000, 0.4);
    descBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    descBg.drawRoundedRect(70, 410, 610, 280, 15);
    descBg.endFill();
    this.detailPanel!.addChild(descBg);

    const descTitle = new PIXI.Text('📝 事件详情', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    descTitle.x = 90;
    descTitle.y = 435;
    this.detailPanel!.addChild(descTitle);

    const desc = new PIXI.Text(event.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 570,
      lineHeight: 28
    });
    desc.x = 90;
    desc.y = 475;
    this.detailPanel!.addChild(desc);

    if (event.relatedCharacterIds.length > 0) {
      const relatedTitle = new PIXI.Text('👤 相关人物', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      relatedTitle.x = 70;
      relatedTitle.y = 720;
      this.detailPanel!.addChild(relatedTitle);

      event.relatedCharacterIds.forEach((charId, index) => {
        const char = store.getCharacterById(charId);
        if (!char) return;

        const isUnlocked = char.unlocked;
        const charBg = new PIXI.Graphics();
        charBg.beginFill(GAME_CONFIG.COLORS.BRONZE, isUnlocked ? 0.3 : 0.2);
        charBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, isUnlocked ? 0.5 : 0.3);
        charBg.drawRoundedRect(0, 0, 290, 70, 10);
        charBg.endFill();
        charBg.x = 70 + (index % 2) * 320;
        charBg.y = 755 + Math.floor(index / 2) * 80;
        this.detailPanel!.addChild(charBg);

        const charAvatar = new PIXI.Text(isUnlocked ? char.avatar : '❓', { fontSize: 32 });
        charAvatar.anchor.set(0.5);
        charAvatar.x = charBg.x + 35;
        charAvatar.y = charBg.y + 35;
        this.detailPanel!.addChild(charAvatar);

        const charName = new PIXI.Text(isUnlocked ? char.name : '???', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: isUnlocked ? GAME_CONFIG.COLORS.CREAM : 0x888888
        });
        charName.x = charBg.x + 70;
        charName.y = charBg.y + 15;
        this.detailPanel!.addChild(charName);

        const charRole = new PIXI.Text(isUnlocked ? char.role : '未解锁', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 14,
          fill: isUnlocked ? GAME_CONFIG.COLORS.WARM_ORANGE : 0x666666
        });
        charRole.x = charBg.x + 70;
        charRole.y = charBg.y + 40;
        this.detailPanel!.addChild(charRole);

        if (isUnlocked) {
          charBg.eventMode = 'static';
          charBg.cursor = 'pointer';
          charBg.on('pointerdown', () => {
            audioModule.playSFX('sfx_click');
            this.selectedCharacter = char;
            this.renderDetailPanel();
          });
        }
      });
    }

    if (event.relatedClueIds.length > 0) {
      const relatedCluesTitle = new PIXI.Text('🔍 相关线索', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      relatedCluesTitle.x = 70;
      relatedCluesTitle.y = 920;
      this.detailPanel!.addChild(relatedCluesTitle);

      event.relatedClueIds.forEach((clueId, index) => {
        const clue = store.getClueById(clueId);
        if (!clue) return;

        const isCollected = store.isClueCollected(clueId);
        const clueBg = new PIXI.Graphics();
        clueBg.beginFill(GAME_CONFIG.COLORS.BRONZE, isCollected ? 0.3 : 0.2);
        clueBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, isCollected ? 0.5 : 0.3);
        clueBg.drawRoundedRect(0, 0, 290, 60, 10);
        clueBg.endFill();
        clueBg.x = 70 + (index % 2) * 320;
        clueBg.y = 955 + Math.floor(index / 2) * 70;
        this.detailPanel!.addChild(clueBg);

        const clueIcon = new PIXI.Text(isCollected ? '📜' : '❓', { fontSize: 24 });
        clueIcon.anchor.set(0.5);
        clueIcon.x = clueBg.x + 30;
        clueIcon.y = clueBg.y + 30;
        this.detailPanel!.addChild(clueIcon);

        const clueName = new PIXI.Text(isCollected ? clue.name : '未收集', {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 16,
          fill: isCollected ? GAME_CONFIG.COLORS.CREAM : 0x666666
        });
        clueName.x = clueBg.x + 60;
        clueName.y = clueBg.y + 20;
        this.detailPanel!.addChild(clueName);

        if (isCollected) {
          clueBg.eventMode = 'static';
          clueBg.cursor = 'pointer';
          clueBg.on('pointerdown', () => {
            audioModule.playSFX('sfx_click');
            this.selectedClue = clue;
            this.renderDetailPanel();
          });
        }
      });
    }

    this.createCloseButton(this.detailPanel!, () => this.closeDetailPanel());
  }

  private renderChapterReviewContent(): void {
    if (!this.detailPanel || !this.selectedChapter) return;

    const chapter = this.selectedChapter;
    const isCompleted = store.isChapterCompleted(chapter.id);
    const collectedClues = store.getCollectedCluesByChapter(chapter.id);
    const totalClues = store.getCluesByChapter(chapter.id).length;
    const progress = totalClues > 0 ? (collectedClues.length / totalClues) * 100 : 0;

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 0.8);
    iconBg.drawCircle(0, 0, 60);
    iconBg.endFill();
    iconBg.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    iconBg.y = 200;
    this.detailPanel!.addChild(iconBg);

    const icon = new PIXI.Text(isCompleted ? '✅' : '📖', { fontSize: 56 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 200;
    this.detailPanel!.addChild(icon);

    const title = new PIXI.Text(chapter.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 300;
    this.detailPanel!.addChild(title);

    const statusTag = new PIXI.Text(isCompleted ? '✓ 已完成' : '⏳ 进行中', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: isCompleted ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.WARM_ORANGE
    });
    statusTag.anchor.set(0.5);
    statusTag.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    statusTag.y = 340;
    this.detailPanel!.addChild(statusTag);

    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x000000, 0.5);
    progressBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    progressBg.drawRoundedRect(70, 380, 610, 40, 20);
    progressBg.endFill();
    this.detailPanel!.addChild(progressBg);

    const progressFill = new PIXI.Graphics();
    progressFill.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
    progressFill.drawRoundedRect(72, 382, (606 * progress) / 100, 36, 18);
    progressFill.endFill();
    this.detailPanel!.addChild(progressFill);

    const progressText = new PIXI.Text(`收集进度: ${collectedClues.length}/${totalClues} (${Math.round(progress)}%)`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF
    });
    progressText.anchor.set(0.5);
    progressText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    progressText.y = 400;
    this.detailPanel!.addChild(progressText);

    const storyBg = new PIXI.Graphics();
    storyBg.beginFill(0x000000, 0.4);
    storyBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    storyBg.drawRoundedRect(70, 440, 610, 300, 15);
    storyBg.endFill();
    this.detailPanel!.addChild(storyBg);

    const storyTitle = new PIXI.Text('📝 章节故事', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    storyTitle.x = 90;
    storyTitle.y = 465;
    this.detailPanel!.addChild(storyTitle);

    const storyText = new PIXI.Text(chapter.storyText, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 570,
      lineHeight: 28
    });
    storyText.x = 90;
    storyText.y = 505;
    this.detailPanel!.addChild(storyText);

    const chapterChars = store.getCharacters().filter(c => c.chapterId === chapter.id && c.unlocked);
    if (chapterChars.length > 0) {
      const charsTitle = new PIXI.Text('👤 登场人物', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      charsTitle.x = 70;
      charsTitle.y = 760;
      this.detailPanel!.addChild(charsTitle);

      chapterChars.forEach((char, index) => {
        const charBg = new PIXI.Graphics();
        charBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
        charBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
        charBg.drawRoundedRect(0, 0, 290, 70, 10);
        charBg.endFill();
        charBg.x = 70 + (index % 2) * 320;
        charBg.y = 795 + Math.floor(index / 2) * 80;
        this.detailPanel!.addChild(charBg);

        const charAvatar = new PIXI.Text(char.avatar, { fontSize: 32 });
        charAvatar.anchor.set(0.5);
        charAvatar.x = charBg.x + 35;
        charAvatar.y = charBg.y + 35;
        this.detailPanel!.addChild(charAvatar);

        const charName = new PIXI.Text(char.name, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: GAME_CONFIG.COLORS.CREAM
        });
        charName.x = charBg.x + 70;
        charName.y = charBg.y + 15;
        this.detailPanel!.addChild(charName);

        const charRole = new PIXI.Text(char.role, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 14,
          fill: GAME_CONFIG.COLORS.WARM_ORANGE
        });
        charRole.x = charBg.x + 70;
        charRole.y = charBg.y + 40;
        this.detailPanel!.addChild(charRole);

        charBg.eventMode = 'static';
        charBg.cursor = 'pointer';
        charBg.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.selectedCharacter = char;
          this.renderDetailPanel();
        });
      });
    }

    const chapterEvents = store.getTimelineEvents().filter(e => e.chapterId === chapter.id && e.unlocked);
    if (chapterEvents.length > 0) {
      const eventsTitle = new PIXI.Text('📅 相关事件', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      const eventsY = chapterChars.length > 0 ? 955 + Math.floor((chapterChars.length - 1) / 2) * 80 : 760;
      eventsTitle.x = 70;
      eventsTitle.y = eventsY;
      this.detailPanel!.addChild(eventsTitle);

      chapterEvents.forEach((event, index) => {
        const eventBg = new PIXI.Graphics();
        eventBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
        eventBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
        eventBg.drawRoundedRect(0, 0, 610, 60, 10);
        eventBg.endFill();
        eventBg.x = 70;
        eventBg.y = eventsY + 35 + index * 70;
        this.detailPanel!.addChild(eventBg);

        const typeIcons: Record<string, string> = {
          story: '📖',
          clue: '🔍',
          mechanism: '🔐',
          character: '👤',
          important: '⭐'
        };

        const eventIcon = new PIXI.Text(typeIcons[event.type] || '📅', { fontSize: 28 });
        eventIcon.anchor.set(0.5);
        eventIcon.x = eventBg.x + 35;
        eventIcon.y = eventBg.y + 30;
        this.detailPanel!.addChild(eventIcon);

        const eventName = new PIXI.Text(event.title, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: GAME_CONFIG.COLORS.CREAM
        });
        eventName.x = eventBg.x + 70;
        eventName.y = eventBg.y + 10;
        this.detailPanel!.addChild(eventName);

        const eventDate = new PIXI.Text(event.date, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 14,
          fill: GAME_CONFIG.COLORS.WARM_ORANGE
        });
        eventDate.x = eventBg.x + 70;
        eventDate.y = eventBg.y + 35;
        this.detailPanel!.addChild(eventDate);

        eventBg.eventMode = 'static';
        eventBg.cursor = 'pointer';
        eventBg.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.selectedEvent = event;
          this.renderDetailPanel();
        });
      });
    }

    this.createCloseButton(this.detailPanel!, () => this.closeDetailPanel());
  }

  private createButton(x: number, y: number, width: number, height: number, text: string, onClick: () => void, color: number = GAME_CONFIG.COLORS.AMBER): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(color, 0.8);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.8);
    btn.drawRoundedRect(0, 0, width, height, 12);
    btn.endFill();
    btn.x = x;
    btn.y = y;

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    btnText.anchor.set(0.5);
    btnText.x = width / 2;
    btnText.y = height / 2;
    btn.addChild(btnText);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      onClick();
    });

    return btn;
  }

  private createSmallButton(text: string, x: number, y: number, width: number, height: number, isActive: boolean = false): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(isActive ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE, isActive ? 0.8 : 0.4);
    btn.lineStyle(2, isActive ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, isActive ? 0.8 : 0.4);
    btn.drawRoundedRect(0, 0, width, height, 8);
    btn.endFill();
    btn.x = x;
    btn.y = y;

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: isActive ? 0xFFFFFF : GAME_CONFIG.COLORS.CREAM
    });
    btnText.anchor.set(0.5);
    btnText.x = width / 2;
    btnText.y = height / 2;
    btn.addChild(btnText);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    return btn;
  }

  private createCloseButton(container: PIXI.Container, onClick: () => void): void {
    const closeBtn = new PIXI.Graphics();
    closeBtn.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    closeBtn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    closeBtn.drawCircle(0, 0, 28);
    closeBtn.endFill();
    closeBtn.x = GAME_CONFIG.DESIGN_WIDTH - 60;
    closeBtn.y = 100;

    const closeIcon = new PIXI.Text('✕', {
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER,
      fontWeight: 'bold'
    });
    closeIcon.anchor.set(0.5);
    closeIcon.x = 0;
    closeIcon.y = 0;
    closeBtn.addChild(closeIcon);

    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      onClick();
    });

    container.addChild(closeBtn);
  }

  private refreshPanel(): void {
    if (!this.panel) return;
    
    this.panel.removeChildren();
    
    const panelBg = new PIXI.Graphics();
    panelBg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    panelBg.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 0.9);
    panelBg.drawRoundedRect(30, 80, GAME_CONFIG.DESIGN_WIDTH - 60, GAME_CONFIG.DESIGN_HEIGHT - 160, 20);
    panelBg.endFill();
    this.panel.addChild(panelBg);

    const titleBg = new PIXI.Graphics();
    titleBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    titleBg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.5);
    titleBg.drawRoundedRect(50, 100, GAME_CONFIG.DESIGN_WIDTH - 100, 60, 15);
    titleBg.endFill();
    this.panel.addChild(titleBg);

    const title = new PIXI.Text('📚 档案阅览室', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 130;
    this.panel.addChild(title);

    this.createCloseButton(this.panel, () => this.closePanel());
    this.createTabButtons();

    let contentY = 240;
    switch (this.currentTab) {
      case 'search':
        this.renderSearchTab(contentY);
        break;
      case 'timeline':
        this.renderTimelineTab(contentY);
        break;
      case 'characters':
        this.renderCharactersTab(contentY);
        break;
      case 'review':
        this.renderReviewTab(contentY);
        break;
    }
  }

  private closePanel(): void {
    if (!this.panel) return;
    
    Animator.tween(this.panel, { alpha: 0 }, 300, Animator.easeOutCubic);
    Animator.delay(300).then(() => {
      if (this.panel && this.container.children.includes(this.panel)) {
        this.container.removeChild(this.panel);
      }
      this.panel = null;
      this.isOpen = false;
      this.selectedClue = null;
      this.selectedCharacter = null;
      this.selectedEvent = null;
      this.selectedChapter = null;
      this.detailPanel = null;
    });
    
    Animator.tween(this.toggleBtn, { alpha: 1 }, 300, Animator.easeOutCubic);
  }

  private closeDetailPanel(): void {
    if (!this.detailPanel) return;
    
    Animator.tween(this.detailPanel, { alpha: 0 }, 200, Animator.easeOutCubic);
    Animator.delay(200).then(() => {
      if (this.detailPanel && this.container.children.includes(this.detailPanel)) {
        this.container.removeChild(this.detailPanel);
      }
      this.detailPanel = null;
      this.selectedClue = null;
      this.selectedCharacter = null;
      this.selectedEvent = null;
      this.selectedChapter = null;
    });
  }

  private handleContentUnlock(data: { id: string; type: 'character' | 'event' }): void {
    this.updateBadge();
    
    if (this.isOpen && this.panel) {
      this.refreshPanel();
    }

    this.showNotification(`新内容解锁: ${data.type === 'character' ? '人物' : '事件'}`);
  }

  private handleClueCollect(_clueId: string): void {
    this.updateBadge();
    
    if (this.isOpen && this.panel) {
      this.refreshPanel();
    }
  }

  private handleChapterComplete(_chapterId: string): void {
    this.updateBadge();
    
    if (this.isOpen && this.panel) {
      this.refreshPanel();
    }

    this.showNotification('章节完成!');
  }

  private showNotification(message: string): void {
    if (this.notification && this.container.children.includes(this.notification)) {
      this.container.removeChild(this.notification);
    }

    this.notification = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.95);
    bg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(0, 0, 400, 60, 15);
    bg.endFill();
    this.notification.addChild(bg);

    const text = new PIXI.Text(message, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      fontWeight: 'bold'
    });
    text.anchor.set(0.5);
    text.x = 200;
    text.y = 30;
    this.notification.addChild(text);

    this.notification.x = (GAME_CONFIG.DESIGN_WIDTH - 400) / 2;
    this.notification.y = 50;
    this.notification.alpha = 0;
    
    this.container.addChild(this.notification);

    Animator.tween(this.notification, { alpha: 1 }, 300, Animator.easeOutCubic);
    
    setTimeout(() => {
      if (this.notification && this.container.children.includes(this.notification)) {
        Animator.tween(this.notification!, { alpha: 0 }, 300, Animator.easeOutCubic);
        Animator.delay(300).then(() => {
          if (this.notification && this.container.children.includes(this.notification)) {
            this.container.removeChild(this.notification);
          }
          this.notification = null;
        });
      }
    }, 2500);
  }

  public update(_delta: number): void {
  }

  public destroy(): void {
    if (this.panel && this.container.children.includes(this.panel)) {
      this.container.removeChild(this.panel);
    }
    if (this.toggleBtn && this.container.children.includes(this.toggleBtn)) {
      this.container.removeChild(this.toggleBtn);
    }
    if (this.notification && this.container.children.includes(this.notification)) {
      this.container.removeChild(this.notification);
    }
    
    eventBus.off('readingroom:character-unlock', this.handleContentUnlock.bind(this));
    eventBus.off('readingroom:event-unlock', this.handleContentUnlock.bind(this));
    eventBus.off('clue:collect', this.handleClueCollect.bind(this));
    eventBus.off('chapter:complete', this.handleChapterComplete.bind(this));
    
    this.panel = null;
    this.toggleBtn = null as any;
    this.notification = null;
    this.detailPanel = null;
  }
}