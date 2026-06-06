import * as PIXI from 'pixi.js';
import { AudioRecording, ArchiveEntry, Clue } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class ArchiveModule {
  private container: PIXI.Container;
  private archiveToggle: PIXI.Graphics;
  private archivePanel: PIXI.Container | null = null;
  private playerPanel: PIXI.Container | null = null;
  private isArchiveOpen: boolean = false;
  private isPlayerOpen: boolean = false;
  private currentTab: 'recordings' | 'archive' = 'recordings';
  private currentChapter: string = 'chapter_1';
  private progressUpdateTimer: number | null = null;
  private unlockNotification: PIXI.Container | null = null;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.archiveToggle = this.createArchiveToggle();
    this.container.addChild(this.archiveToggle);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.on('recording:unlock', this.handleRecordingUnlock.bind(this));
    eventBus.on('clue:archived', this.handleClueArchived.bind(this));
    eventBus.on('archive:chapter-complete', this.handleArchiveChapterComplete.bind(this));
    eventBus.on('memory:complete', this.handleMemoryComplete.bind(this));
    eventBus.on('voice:play', this.handleVoicePlay.bind(this));
    eventBus.on('voice:end', this.handleVoiceEnd.bind(this));
  }

  private createArchiveToggle(): PIXI.Graphics {
    const toggle = new PIXI.Graphics();
    toggle.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    toggle.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    toggle.drawRoundedRect(0, 0, 100, 60, 15);
    toggle.endFill();

    const icon = new PIXI.Text('📼', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 50;
    icon.y = 30;
    toggle.addChild(icon);

    const badge = new PIXI.Graphics();
    badge.beginFill(GAME_CONFIG.COLORS.WARM_ORANGE, 0.9);
    badge.drawCircle(0, 0, 12);
    badge.endFill();
    badge.x = 85;
    badge.y = 15;
    badge.visible = false;
    toggle.addChild(badge);
    (toggle as any).badge = badge;

    toggle.x = GAME_CONFIG.DESIGN_WIDTH - 130;
    toggle.y = GAME_CONFIG.DESIGN_HEIGHT - 80;
    toggle.eventMode = 'static';
    toggle.cursor = 'pointer';

    toggle.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.toggleArchive();
    });

    return toggle;
  }

  private toggleArchive(): void {
    if (this.isPlayerOpen) {
      this.closePlayer();
      return;
    }
    this.isArchiveOpen = !this.isArchiveOpen;
    if (this.isArchiveOpen) {
      this.showArchivePanel();
    } else {
      this.hideArchivePanel();
    }
  }

  private showArchivePanel(): void {
    this.hideArchivePanel();
    this.archivePanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.archivePanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(25, 100, 700, 1100, 25);
    panel.endFill();
    this.archivePanel.addChild(panel);

    const title = new PIXI.Text('馆长口述档案', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 170;
    this.archivePanel.addChild(title);

    this.createTabButtons();
    this.createChapterSelector();
    this.renderContent();

    const closeBtn = this.createCloseButton();
    closeBtn.x = GAME_CONFIG.DESIGN_WIDTH - 80;
    closeBtn.y = 130;
    this.archivePanel.addChild(closeBtn);

    this.archivePanel.alpha = 0;
    this.container.addChild(this.archivePanel);

    Animator.animate(
      350,
      (progress) => {
        this.archivePanel!.alpha = progress;
        this.archivePanel!.scale.set(0.95 + progress * 0.05);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createTabButtons(): void {
    if (!this.archivePanel) return;

    const tabs = [
      { id: 'recordings', label: '🎧 语音录音' },
      { id: 'archive', label: '📁 线索归档' }
    ];

    const startX = 75;
    const tabWidth = 280;
    const gap = 40;

    tabs.forEach((tab, index) => {
      const btn = new PIXI.Graphics();
      const isActive = this.currentTab === tab.id;
      const color = isActive ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE;
      const textColor = isActive ? GAME_CONFIG.COLORS.DARK_BROWN : 0xFFFFFF;

      btn.beginFill(color, isActive ? 0.95 : 0.6);
      btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, isActive ? 1 : 0.5);
      btn.drawRoundedRect(0, 0, tabWidth, 60, 12);
      btn.endFill();

      const btnText = new PIXI.Text(tab.label, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 22,
        fill: textColor
      });
      btnText.anchor.set(0.5);
      btnText.x = tabWidth / 2;
      btnText.y = 30;
      btn.addChild(btnText);

      btn.x = startX + index * (tabWidth + gap);
      btn.y = 230;
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.currentTab = tab.id as 'recordings' | 'archive';
        this.refreshArchivePanel();
      });

      this.archivePanel!.addChild(btn);
    });
  }

  private createChapterSelector(): void {
    if (!this.archivePanel) return;

    const chapters = store.getChapters();
    const startX = 75;
    const chapterWidth = 280;
    const gap = 40;

    chapters.forEach((chapter, index) => {
      const btn = new PIXI.Graphics();
      const isActive = this.currentChapter === chapter.id;
      const isUnlocked = index === 0 || store.isChapterArchiveComplete(chapters[index - 1].id);
      const color = isActive ? GAME_CONFIG.COLORS.GOLD : isUnlocked ? GAME_CONFIG.COLORS.BRONZE : 0x444444;
      const textColor = isActive ? GAME_CONFIG.COLORS.DARK_BROWN : isUnlocked ? 0xFFFFFF : 0x888888;

      btn.beginFill(color, isActive ? 0.95 : 0.5);
      btn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, isActive ? 1 : 0.4);
      btn.drawRoundedRect(0, 0, chapterWidth, 55, 10);
      btn.endFill();

      const btnText = new PIXI.Text(chapter.title, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: textColor,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: chapterWidth - 20
      });
      btnText.anchor.set(0.5);
      btnText.x = chapterWidth / 2;
      btnText.y = 27;
      btn.addChild(btnText);

      if (!isUnlocked) {
        const lockIcon = new PIXI.Text('🔒', { fontSize: 20 });
        lockIcon.anchor.set(0.5);
        lockIcon.x = chapterWidth - 30;
        lockIcon.y = 27;
        btn.addChild(lockIcon);
      }

      btn.x = startX + index * (chapterWidth + gap);
      btn.y = 310;

      if (isUnlocked) {
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.currentChapter = chapter.id;
          this.refreshArchivePanel();
        });
      }

      this.archivePanel!.addChild(btn);
    });
  }

  private renderContent(): void {
    if (!this.archivePanel) return;

    const contentY = 390;
    const contentHeight = 780;

    const contentBg = new PIXI.Graphics();
    contentBg.beginFill(0x000000, 0.4);
    contentBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    contentBg.drawRoundedRect(50, contentY, 650, contentHeight, 15);
    contentBg.endFill();
    this.archivePanel.addChild(contentBg);

    if (this.currentTab === 'recordings') {
      this.renderRecordingsList(contentY + 20);
    } else {
      this.renderArchiveList(contentY + 20);
    }
  }

  private renderRecordingsList(startY: number): void {
    if (!this.archivePanel) return;

    const recordings = store.getRecordingsByChapter(this.currentChapter);
    const unlockedRecordings = recordings.filter(r => r.unlocked);

    if (unlockedRecordings.length === 0) {
      const emptyText = new PIXI.Text('暂无可用录音\n收集线索以解锁更多内容', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 22,
        fill: 0xAAAAAA,
        align: 'center'
      });
      emptyText.anchor.set(0.5);
      emptyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      emptyText.y = startY + 350;
      this.archivePanel.addChild(emptyText);
      return;
    }

    const itemHeight = 130;
    const gap = 15;
    const padding = 20;

    unlockedRecordings.forEach((recording, index) => {
      const item = this.createRecordingItem(recording, index, itemHeight);
      item.x = padding + 50;
      item.y = startY + index * (itemHeight + gap);
      this.archivePanel!.addChild(item);
    });

    const lockedCount = recordings.length - unlockedRecordings.length;
    if (lockedCount > 0) {
      const lockedText = new PIXI.Text(`还有 ${lockedCount} 段录音待解锁`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'center'
      });
      lockedText.anchor.set(0.5);
      lockedText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      lockedText.y = startY + unlockedRecordings.length * (itemHeight + gap) + 20;
      this.archivePanel.addChild(lockedText);
    }
  }

  private createRecordingItem(recording: AudioRecording, _index: number, height: number): PIXI.Container {
    const container = new PIXI.Container();
    const width = 610;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.4);
    bg.lineStyle(2, recording.played ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.GOLD, 0.6);
    bg.drawRoundedRect(0, 0, width, height, 12);
    bg.endFill();
    container.addChild(bg);

    const playBtn = new PIXI.Graphics();
    playBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    playBtn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    playBtn.drawCircle(0, 0, 35);
    playBtn.endFill();
    playBtn.x = 55;
    playBtn.y = height / 2;
    playBtn.eventMode = 'static';
    playBtn.cursor = 'pointer';

    const playIcon = new PIXI.Text(recording.played ? '▶️' : '🔊', { fontSize: 28 });
    playIcon.anchor.set(0.5);
    playBtn.addChild(playIcon);

    playBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.playRecording(recording);
    });

    container.addChild(playBtn);

    const title = new PIXI.Text(recording.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 110;
    title.y = 20;
    container.addChild(title);

    const desc = new PIXI.Text(recording.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xCCCCCC
    });
    desc.x = 110;
    desc.y = 50;
    container.addChild(desc);

    const duration = new PIXI.Text(`⏱ ${recording.duration}秒`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE
    });
    duration.x = width - 90;
    duration.y = height - 35;
    container.addChild(duration);

    if (recording.played) {
      const playedTag = new PIXI.Text('已播放', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      playedTag.x = 110;
      playedTag.y = height - 35;
      container.addChild(playedTag);
    }

    return container;
  }

  private renderArchiveList(startY: number): void {
    if (!this.archivePanel) return;

    const chapter = store.getChapters().find(c => c.id === this.currentChapter);
    if (!chapter) return;

    const archivedClues = store.getArchivedClues().filter(c => c.chapterId === this.currentChapter);
    const requiredClues = chapter.requiredClues;
    const collectedClues = store.getCollectedClues().filter(c => c.chapterId === this.currentChapter);

    const progressText = new PIXI.Text(
      `归档进度: ${archivedClues.length} / ${requiredClues.length}`,
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      }
    );
    progressText.x = 70;
    progressText.y = startY;
    this.archivePanel.addChild(progressText);

    const isChapterComplete = store.isChapterArchiveComplete(this.currentChapter);
    if (isChapterComplete) {
      const completeTag = new PIXI.Text('✅ 章节归档完成', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      completeTag.x = 480;
      completeTag.y = startY;
      this.archivePanel.addChild(completeTag);
    }

    const itemHeight = 100;
    const gap = 12;
    const padding = 20;

    requiredClues.forEach((clueId, index) => {
      const clue = store.getClueById(clueId);
      if (!clue) return;

      const isArchived = store.getArchiveState().archivedClues.includes(clueId);
      const isCollected = store.getState().collectedClues.includes(clueId);

      const item = this.createArchiveItem(clue, isArchived, isCollected, itemHeight);
      item.x = padding + 50;
      item.y = startY + 45 + index * (itemHeight + gap);
      this.archivePanel!.addChild(item);
    });

    const unarchivedCollected = collectedClues.filter(
      c => !store.getArchiveState().archivedClues.includes(c.id) && !requiredClues.includes(c.id)
    );

    if (unarchivedCollected.length > 0) {
      const otherTitle = new PIXI.Text('其他收集的线索（可选归档）', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      otherTitle.x = 70;
      otherTitle.y = startY + 45 + requiredClues.length * (itemHeight + gap) + 20;
      this.archivePanel.addChild(otherTitle);

      unarchivedCollected.forEach((clue, index) => {
        const item = this.createArchiveItem(clue, false, true, itemHeight, true);
        item.x = padding + 50;
        item.y = startY + 45 + requiredClues.length * (itemHeight + gap) + 55 + index * (itemHeight + gap);
        this.archivePanel!.addChild(item);
      });
    }
  }

  private createArchiveItem(
    clue: Clue,
    isArchived: boolean,
    isCollected: boolean,
    height: number,
    isOptional: boolean = false
  ): PIXI.Container {
    const container = new PIXI.Container();
    const width = 610;

    const bgColor = isArchived ? GAME_CONFIG.COLORS.AMBER : isCollected ? GAME_CONFIG.COLORS.BRONZE : 0x333333;
    const bgAlpha = isArchived ? 0.3 : isCollected ? 0.4 : 0.6;
    const lineColor = isArchived ? GAME_CONFIG.COLORS.GOLD : isCollected ? GAME_CONFIG.COLORS.AMBER : 0x555555;

    const bg = new PIXI.Graphics();
    bg.beginFill(bgColor, bgAlpha);
    bg.lineStyle(2, lineColor, isCollected ? 0.6 : 0.3);
    bg.drawRoundedRect(0, 0, width, height, 10);
    bg.endFill();
    container.addChild(bg);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(isArchived ? GAME_CONFIG.COLORS.AMBER : GAME_CONFIG.COLORS.BRONZE, 0.5);
    iconBg.drawCircle(0, 0, 35);
    iconBg.endFill();
    iconBg.x = 50;
    iconBg.y = height / 2;
    container.addChild(iconBg);

    const icon = new PIXI.Text(isCollected ? clue.icon : '❓', { fontSize: 36 });
    icon.anchor.set(0.5);
    icon.x = 50;
    icon.y = height / 2;
    container.addChild(icon);

    const name = new PIXI.Text(isCollected ? clue.name : '未收集', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 20,
      fill: isCollected ? GAME_CONFIG.COLORS.AMBER : 0x888888
    });
    name.x = 105;
    name.y = 18;
    container.addChild(name);

    const desc = new PIXI.Text(
      isCollected ? clue.description.slice(0, 50) + '...' : '收集此线索后可查看详情',
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: isCollected ? 0xCCCCCC : 0x666666,
        wordWrap: true,
        wordWrapWidth: 380
      }
    );
    desc.x = 105;
    desc.y = 45;
    container.addChild(desc);

    if (isOptional) {
      const optionalTag = new PIXI.Text('可选', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      optionalTag.x = width - 60;
      optionalTag.y = 15;
      container.addChild(optionalTag);
    }

    if (isArchived) {
      const archivedTag = new PIXI.Text('✅ 已归档', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      archivedTag.x = width - 90;
      archivedTag.y = height - 30;
      container.addChild(archivedTag);
    } else if (isCollected) {
      const archiveBtn = new PIXI.Graphics();
      archiveBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
      archiveBtn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
      archiveBtn.drawRoundedRect(0, 0, 80, 35, 8);
      archiveBtn.endFill();

      const btnText = new PIXI.Text('归档', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: GAME_CONFIG.COLORS.DARK_BROWN
      });
      btnText.anchor.set(0.5);
      btnText.x = 40;
      btnText.y = 17;
      archiveBtn.addChild(btnText);

      archiveBtn.x = width - 95;
      archiveBtn.y = height - 45;
      archiveBtn.eventMode = 'static';
      archiveBtn.cursor = 'pointer';

      archiveBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.archiveClue(clue.id);
      });

      container.addChild(archiveBtn);
    }

    return container;
  }

  private archiveClue(clueId: string): void {
    const success = store.archiveClue(clueId);
    if (success) {
      audioModule.playSFX('sfx_collect');
      const chapter = store.getCurrentChapter();
      if (chapter) {
        store.completeChapterArchive(chapter.id);
      }
      this.refreshArchivePanel();
    }
  }

  private playRecording(recording: AudioRecording): void {
    this.hideArchivePanel();
    this.showPlayerPanel(recording);
    audioModule.playVoice(recording.id);
  }

  private showPlayerPanel(recording: AudioRecording): void {
    this.closePlayer();
    this.isPlayerOpen = true;
    this.playerPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.92);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    this.playerPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(50, 250, 650, 800, 25);
    panel.endFill();
    this.playerPanel.addChild(panel);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.drawCircle(0, 0, 80);
    iconBg.endFill();
    iconBg.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    iconBg.y = 380;
    this.playerPanel.addChild(iconBg);

    const icon = new PIXI.Text('🎙️', { fontSize: 80 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 380;
    this.playerPanel.addChild(icon);

    const title = new PIXI.Text(recording.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 490;
    this.playerPanel.addChild(title);

    const subtitle = new PIXI.Text(recording.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xCCCCCC,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 535;
    this.playerPanel.addChild(subtitle);

    this.createProgressBar();
    this.createControlButtons();
    this.createTranscript(recording);

    const closeBtn = this.createCloseButton();
    closeBtn.x = GAME_CONFIG.DESIGN_WIDTH - 100;
    closeBtn.y = 280;
    this.playerPanel.addChild(closeBtn);

    this.playerPanel.alpha = 0;
    this.container.addChild(this.playerPanel);

    Animator.animate(
      400,
      (progress) => {
        this.playerPanel!.alpha = progress;
        this.playerPanel!.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );

    this.startProgressUpdate();
  }

  private createProgressBar(): void {
    if (!this.playerPanel) return;

    const barY = 610;
    const barWidth = 500;

    const barBg = new PIXI.Graphics();
    barBg.beginFill(0x000000, 0.6);
    barBg.drawRoundedRect(0, 0, barWidth, 12, 6);
    barBg.endFill();
    barBg.x = (GAME_CONFIG.DESIGN_WIDTH - barWidth) / 2;
    barBg.y = barY;
    this.playerPanel.addChild(barBg);

    const barFill = new PIXI.Graphics();
    barFill.beginFill(GAME_CONFIG.COLORS.AMBER);
    barFill.drawRoundedRect(0, 0, 0, 12, 6);
    barFill.endFill();
    barFill.x = (GAME_CONFIG.DESIGN_WIDTH - barWidth) / 2;
    barFill.y = barY;
    this.playerPanel.addChild(barFill);
    (this.playerPanel as any).progressFill = barFill;

    const timeLabel = new PIXI.Text('0:00 / 0:00', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center'
    });
    timeLabel.anchor.set(0.5);
    timeLabel.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    timeLabel.y = barY + 30;
    this.playerPanel.addChild(timeLabel);
    (this.playerPanel as any).timeLabel = timeLabel;
  }

  private createControlButtons(): void {
    if (!this.playerPanel) return;

    const btnY = 700;
    const centerX = GAME_CONFIG.DESIGN_WIDTH / 2;

    const playPauseBtn = new PIXI.Graphics();
    playPauseBtn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.95);
    playPauseBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    playPauseBtn.drawCircle(0, 0, 50);
    playPauseBtn.endFill();
    playPauseBtn.x = centerX;
    playPauseBtn.y = btnY;
    playPauseBtn.eventMode = 'static';
    playPauseBtn.cursor = 'pointer';

    const playIcon = new PIXI.Text('⏸️', { fontSize: 40 });
    playIcon.anchor.set(0.5);
    playPauseBtn.addChild(playIcon);
    (playPauseBtn as any).icon = playIcon;

    playPauseBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.togglePlayPause();
    });

    this.playerPanel.addChild(playPauseBtn);
    (this.playerPanel as any).playPauseBtn = playPauseBtn;

    const stopBtn = new PIXI.Graphics();
    stopBtn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.9);
    stopBtn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    stopBtn.drawCircle(0, 0, 35);
    stopBtn.endFill();
    stopBtn.x = centerX + 120;
    stopBtn.y = btnY;
    stopBtn.eventMode = 'static';
    stopBtn.cursor = 'pointer';

    const stopIcon = new PIXI.Text('⏹️', { fontSize: 28 });
    stopIcon.anchor.set(0.5);
    stopBtn.addChild(stopIcon);

    stopBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      audioModule.stopVoice();
    });

    this.playerPanel.addChild(stopBtn);

    const rewindBtn = new PIXI.Graphics();
    rewindBtn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.9);
    rewindBtn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    rewindBtn.drawCircle(0, 0, 35);
    rewindBtn.endFill();
    rewindBtn.x = centerX - 120;
    rewindBtn.y = btnY;
    rewindBtn.eventMode = 'static';
    rewindBtn.cursor = 'pointer';

    const rewindIcon = new PIXI.Text('⏮️', { fontSize: 28 });
    rewindIcon.anchor.set(0.5);
    rewindBtn.addChild(rewindIcon);

    rewindBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      const currentId = audioModule.getCurrentVoiceId();
      if (currentId) {
        audioModule.stopVoice();
        Animator.delay(200).then(() => {
          audioModule.playVoice(currentId);
        });
      }
    });

    this.playerPanel.addChild(rewindBtn);
  }

  private createTranscript(recording: AudioRecording): void {
    if (!this.playerPanel) return;

    const transcriptBg = new PIXI.Graphics();
    transcriptBg.beginFill(0x000000, 0.5);
    transcriptBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.3);
    transcriptBg.drawRoundedRect(70, 780, 610, 220, 15);
    transcriptBg.endFill();
    this.playerPanel.addChild(transcriptBg);

    const transcriptTitle = new PIXI.Text('📝 文字记录', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    transcriptTitle.x = 90;
    transcriptTitle.y = 795;
    this.playerPanel.addChild(transcriptTitle);

    const transcriptText = new PIXI.Text(recording.transcript, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 17,
      fill: 0xFFFFFF,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: 570,
      lineHeight: 28
    });
    transcriptText.x = 90;
    transcriptText.y = 830;
    this.playerPanel.addChild(transcriptText);
  }

  private togglePlayPause(): void {
    if (audioModule.isVoicePlaying()) {
      audioModule.pauseVoice();
      this.updatePlayPauseIcon(false);
    } else {
      audioModule.resumeVoice();
      this.updatePlayPauseIcon(true);
    }
  }

  private updatePlayPauseIcon(isPlaying: boolean): void {
    if (!this.playerPanel) return;
    const btn = (this.playerPanel as any).playPauseBtn as PIXI.Graphics;
    const icon = (btn as any).icon as PIXI.Text;
    icon.text = isPlaying ? '⏸️' : '▶️';
  }

  private startProgressUpdate(): void {
    this.stopProgressUpdate();
    this.progressUpdateTimer = window.setInterval(() => {
      this.updateProgress();
    }, 100);
  }

  private stopProgressUpdate(): void {
    if (this.progressUpdateTimer !== null) {
      clearInterval(this.progressUpdateTimer);
      this.progressUpdateTimer = null;
    }
  }

  private updateProgress(): void {
    if (!this.playerPanel) return;

    const progress = audioModule.getVoiceProgress();
    const duration = audioModule.getVoiceDuration();

    if (duration > 0) {
      const percent = progress / duration;
      const barWidth = 500;

      const progressFill = (this.playerPanel as any).progressFill as PIXI.Graphics;
      if (progressFill) {
        progressFill.clear();
        progressFill.beginFill(GAME_CONFIG.COLORS.AMBER);
        progressFill.drawRoundedRect(0, 0, barWidth * percent, 12, 6);
        progressFill.endFill();
      }

      const timeLabel = (this.playerPanel as any).timeLabel as PIXI.Text;
      if (timeLabel) {
        timeLabel.text = `${this.formatTime(progress)} / ${this.formatTime(duration)}`;
      }
    }

    this.updatePlayPauseIcon(audioModule.isVoicePlaying());
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  private createCloseButton(): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.85);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawCircle(0, 0, 28);
    btn.endFill();

    const icon = new PIXI.Text('✕', {
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    icon.anchor.set(0.5);
    btn.addChild(icon);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      if (this.isPlayerOpen) {
        this.closePlayer();
      } else {
        this.hideArchivePanel();
      }
    });

    return btn;
  }

  private hideArchivePanel(): void {
    if (this.archivePanel) {
      const panel = this.archivePanel;
      Animator.animate(
        250,
        (progress) => {
          panel.alpha = 1 - progress;
          panel.scale.set(1 - progress * 0.05);
        },
        () => {
          this.container.removeChild(panel);
          panel.destroy();
          this.archivePanel = null;
          this.isArchiveOpen = false;
        },
        Animator.easeInCubic
      );
    }
  }

  private closePlayer(): void {
    this.stopProgressUpdate();
    if (this.playerPanel) {
      const panel = this.playerPanel;
      Animator.animate(
        300,
        (progress) => {
          panel.alpha = 1 - progress;
        },
        () => {
          this.container.removeChild(panel);
          panel.destroy();
          this.playerPanel = null;
          this.isPlayerOpen = false;
          audioModule.stopVoice();
        }
      );
    }
  }

  private refreshArchivePanel(): void {
    if (this.archivePanel) {
      this.hideArchivePanel();
      Animator.delay(200).then(() => {
        this.showArchivePanel();
      });
    }
  }

  private handleRecordingUnlock(data: { recordingId: string }): void {
    const recording = store.getRecordingById(data.recordingId);
    if (recording) {
      this.showUnlockNotification(recording);
      this.updateBadge();
    }
  }

  private handleClueArchived(_data: { clueId: string; entry: ArchiveEntry }): void {
    audioModule.playSFX('sfx_success');
  }

  private handleArchiveChapterComplete(data: { chapterId: string }): void {
    eventBus.emit('archive:chapter-complete', { chapterId: data.chapterId });
  }

  private handleMemoryComplete(data: { success: boolean }): void {
    if (data.success) {
      const chapter = store.getCurrentChapter();
      if (chapter) {
        store.unlockChapterCompleteRecording(chapter.id);
      }
    }
  }

  private handleVoicePlay(_data: { recordingId: string }): void {
    this.startProgressUpdate();
  }

  private handleVoiceEnd(_data: { recordingId: string }): void {
    this.stopProgressUpdate();
    if (this.isPlayerOpen) {
      Animator.delay(500).then(() => {
        if (this.isPlayerOpen) {
          this.closePlayer();
          this.showArchivePanel();
          this.isArchiveOpen = true;
        }
      });
    }
  }

  private showUnlockNotification(recording: AudioRecording): void {
    if (this.unlockNotification) {
      this.container.removeChild(this.unlockNotification);
      this.unlockNotification.destroy();
    }

    this.unlockNotification = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(75, 0, 600, 130, 18);
    bg.endFill();
    this.unlockNotification.addChild(bg);

    const icon = new PIXI.Text('🔓', { fontSize: 40 });
    icon.x = 110;
    icon.y = 40;
    this.unlockNotification.addChild(icon);

    const title = new PIXI.Text('解锁新录音', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 170;
    title.y = 35;
    this.unlockNotification.addChild(title);

    const name = new PIXI.Text(recording.title, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xFFFFFF
    });
    name.x = 170;
    name.y = 70;
    this.unlockNotification.addChild(name);

    this.unlockNotification.y = -140;
    this.container.addChild(this.unlockNotification);

    Animator.animate(
      500,
      (progress) => {
        this.unlockNotification!.y = -140 + progress * 200;
      },
      () => {
        Animator.delay(3000).then(() => {
          if (this.unlockNotification) {
            Animator.animate(
              500,
              (progress) => {
                this.unlockNotification!.y = 60 - progress * 200;
              },
              () => {
                if (this.unlockNotification) {
                  this.container.removeChild(this.unlockNotification);
                  this.unlockNotification.destroy();
                  this.unlockNotification = null;
                }
              }
            );
          }
        });
      },
      Animator.easeOutCubic
    );
  }

  private updateBadge(): void {
    const badge = (this.archiveToggle as any).badge as PIXI.Graphics;
    const unlockedCount = store.getUnlockedRecordings().length;
    const playedCount = store.getArchiveState().playedRecordings.length;
    badge.visible = unlockedCount > playedCount;
  }

  update(_delta: number): void {
    if (this.isPlayerOpen) {
      this.updateProgress();
    }
  }

  destroy(): void {
    this.stopProgressUpdate();
    eventBus.off('recording:unlock', this.handleRecordingUnlock.bind(this));
    eventBus.off('clue:archived', this.handleClueArchived.bind(this));
    eventBus.off('archive:chapter-complete', this.handleArchiveChapterComplete.bind(this));
    eventBus.off('memory:complete', this.handleMemoryComplete.bind(this));
    eventBus.off('voice:play', this.handleVoicePlay.bind(this));
    eventBus.off('voice:end', this.handleVoiceEnd.bind(this));

    try {
      if (this.archiveToggle && this.archiveToggle.parent) {
        this.archiveToggle.destroy();
      }
      if (this.archivePanel && this.archivePanel.parent) {
        this.archivePanel.destroy();
      }
      if (this.playerPanel && this.playerPanel.parent) {
        this.playerPanel.destroy();
      }
      if (this.unlockNotification && this.unlockNotification.parent) {
        this.unlockNotification.destroy();
      }
    } catch (e) {
      // Ignore destroy errors
    }
  }
}
