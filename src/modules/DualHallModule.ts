import * as PIXI from 'pixi.js';
import { HallType } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class DualHallModule {
  private container: PIXI.Container;
  private dualHallPanel: PIXI.Container;
  private historyProgressBar: PIXI.Graphics | null = null;
  private artProgressBar: PIXI.Graphics | null = null;
  private historyBtn: PIXI.Graphics | null = null;
  private artBtn: PIXI.Graphics | null = null;
  private phaseIndicator: PIXI.Text | null = null;
  private isVisible: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.dualHallPanel = new PIXI.Container();
    this.dualHallPanel.visible = false;
    this.container.addChild(this.dualHallPanel);

    eventBus.on('dualhall:start', this.handleDualHallStart.bind(this));
    eventBus.on('dualhall:progress-update', this.handleProgressUpdate.bind(this));
    eventBus.on('dualhall:switch', this.handleHallSwitch.bind(this));
    eventBus.on('dualhall:phase-unlock', this.handlePhaseUnlock.bind(this));
    eventBus.on('dualhall:cross-evidence-complete', this.handleCrossEvidence.bind(this));
    eventBus.on('exhibition:enter', this.handleExhibitionEnter.bind(this));
  }

  private handleDualHallStart(): void {
    this.show();
    this.updateUI();
  }

  private handleProgressUpdate(data: { historyProgress: number; artProgress: number }): void {
    this.updateProgressBars(data.historyProgress, data.artProgress);
  }

  private handleHallSwitch(data: { hallType: HallType }): void {
    this.updateHallButtons(data.hallType);
  }

  private handlePhaseUnlock(data: { phase: number }): void {
    if (this.phaseIndicator) {
      this.phaseIndicator.text = `第${this.getChineseNumber(data.phase)}阶段`;
      this.showPhaseUnlockAnimation(data.phase);
    }
  }

  private handleCrossEvidence(data: { clue1: string; clue2: string; unlockedSharedClue: string }): void {
    const clue1 = store.getClueById(data.clue1);
    const clue2 = store.getClueById(data.clue2);
    const sharedClue = store.getClueById(data.unlockedSharedClue);
    this.showCrossEvidenceAnimation(clue1?.name, clue2?.name, sharedClue?.name);
  }

  private handleExhibitionEnter(data: { exhibitionId: string }): void {
    const exhibition = store.getExhibitionById(data.exhibitionId);
    const isDualHall = exhibition?.hallType !== undefined;
    
    if (isDualHall && !this.isVisible) {
      this.show();
    } else if (!isDualHall && this.isVisible) {
      this.hide();
    }

    if (isDualHall && exhibition?.hallType) {
      store.switchHall(exhibition.hallType);
      this.updateUI();
    }
  }

  private getChineseNumber(num: number): string {
    const nums = ['', '一', '二', '三', '四', '五'];
    return nums[num] || num.toString();
  }

  show(): void {
    if (this.isVisible) return;
    this.isVisible = true;
    this.renderPanel();
    this.dualHallPanel.visible = true;
    this.dualHallPanel.alpha = 0;

    Animator.animate(
      300,
      (p) => { this.dualHallPanel.alpha = p; },
      undefined,
      Animator.easeOutCubic
    );
  }

  hide(): void {
    if (!this.isVisible) return;
    this.isVisible = false;

    Animator.animate(
      300,
      (p) => { this.dualHallPanel.alpha = 1 - p; },
      () => {
        this.dualHallPanel.visible = false;
        this.clearPanel();
      },
      Animator.easeInCubic
    );
  }

  private clearPanel(): void {
    for (let i = this.dualHallPanel.children.length - 1; i >= 0; i--) {
      this.dualHallPanel.removeChildAt(i);
    }
    this.historyProgressBar = null;
    this.artProgressBar = null;
    this.historyBtn = null;
    this.artBtn = null;
    this.phaseIndicator = null;
  }

  private renderPanel(): void {
    this.clearPanel();

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.8);
    bg.drawRoundedRect(10, 10, GAME_CONFIG.DESIGN_WIDTH - 20, 130, 15);
    bg.endFill();
    this.dualHallPanel.addChild(bg);

    const title = new PIXI.Text('双馆并行调查', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 32;
    this.dualHallPanel.addChild(title);

    const state = store.getDualHallState();
    this.phaseIndicator = new PIXI.Text(`第${this.getChineseNumber(state.currentInvestigationPhase)}阶段`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    this.phaseIndicator.anchor.set(0.5);
    this.phaseIndicator.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    this.phaseIndicator.y = 55;
    this.dualHallPanel.addChild(this.phaseIndicator);

    this.historyBtn = this.createHallButton('history', 80, 75);
    this.dualHallPanel.addChild(this.historyBtn);

    this.artBtn = this.createHallButton('art', GAME_CONFIG.DESIGN_WIDTH - 80, 75);
    this.dualHallPanel.addChild(this.artBtn);

    this.updateHallButtons(state.activeHall);
    this.updateProgressBars(state.historyProgress, state.artProgress);
  }

  private createHallButton(hallType: HallType, x: number, y: number): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const isHistory = hallType === 'history';
    const color = isHistory ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.AMBER;
    const icon = isHistory ? '📜' : '🎨';
    const label = isHistory ? '历史馆' : '艺术馆';

    btn.beginFill(color, 0.6);
    btn.lineStyle(2, color, 1);
    btn.drawRoundedRect(0, 0, 120, 50, 10);
    btn.endFill();

    const iconText = new PIXI.Text(icon, { fontSize: 22 });
    iconText.anchor.set(0, 0.5);
    iconText.x = 12;
    iconText.y = 25;
    btn.addChild(iconText);

    const labelText = new PIXI.Text(label, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF
    });
    labelText.anchor.set(0, 0.5);
    labelText.x = 42;
    labelText.y = 25;
    btn.addChild(labelText);

    btn.x = x - 60;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      const exhibitions = store.getHallExhibitions(hallType);
      const unlocked = exhibitions.find(e => e.unlocked);
      if (unlocked) {
        store.setCurrentExhibition(unlocked.id);
      }
    });

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 150);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 150);
    });

    return btn;
  }

  private updateHallButtons(activeHall: HallType): void {
    if (this.historyBtn) {
      const isActive = activeHall === 'history';
      this.historyBtn.alpha = isActive ? 1 : 0.6;
      (this.historyBtn.children[0] as PIXI.Graphics).tint = isActive ? 0xFFFFFF : 0xAAAAAA;
    }
    if (this.artBtn) {
      const isActive = activeHall === 'art';
      this.artBtn.alpha = isActive ? 1 : 0.6;
      (this.artBtn.children[0] as PIXI.Graphics).tint = isActive ? 0xFFFFFF : 0xAAAAAA;
    }
  }

  private updateProgressBars(historyProgress: number, artProgress: number): void {
    if (!this.dualHallPanel.visible) return;

    const centerX = GAME_CONFIG.DESIGN_WIDTH / 2;
    const barY = 80;
    const barWidth = 180;
    const barHeight = 12;

    if (!this.historyProgressBar) {
      const historyBg = new PIXI.Graphics();
      historyBg.beginFill(0x000000, 0.5);
      historyBg.lineStyle(2, GAME_CONFIG.COLORS.BRONZE, 0.5);
      historyBg.drawRoundedRect(centerX - barWidth - 20, barY, barWidth, barHeight, 6);
      historyBg.endFill();
      this.dualHallPanel.addChild(historyBg);

      this.historyProgressBar = new PIXI.Graphics();
      this.dualHallPanel.addChild(this.historyProgressBar);

      const historyLabel = new PIXI.Text('历史馆', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: GAME_CONFIG.COLORS.BRONZE
      });
      historyLabel.anchor.set(1, 0);
      historyLabel.x = centerX - 25;
      historyLabel.y = barY - 18;
      this.dualHallPanel.addChild(historyLabel);
    }

    if (!this.artProgressBar) {
      const artBg = new PIXI.Graphics();
      artBg.beginFill(0x000000, 0.5);
      artBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
      artBg.drawRoundedRect(centerX + 20, barY, barWidth, barHeight, 6);
      artBg.endFill();
      this.dualHallPanel.addChild(artBg);

      this.artProgressBar = new PIXI.Graphics();
      this.dualHallPanel.addChild(this.artProgressBar);

      const artLabel = new PIXI.Text('艺术馆', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 12,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      artLabel.anchor.set(0, 0);
      artLabel.x = centerX + 25;
      artLabel.y = barY - 18;
      this.dualHallPanel.addChild(artLabel);
    }

    this.historyProgressBar.clear();
    this.historyProgressBar.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.9);
    this.historyProgressBar.drawRoundedRect(centerX - barWidth - 20, barY, barWidth * (historyProgress / 100), barHeight, 6);
    this.historyProgressBar.endFill();

    this.artProgressBar.clear();
    this.artProgressBar.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    this.artProgressBar.drawRoundedRect(centerX + 20, barY, barWidth * (artProgress / 100), barHeight, 6);
    this.artProgressBar.endFill();
  }

  private updateUI(): void {
    const state = store.getDualHallState();
    this.updateHallButtons(state.activeHall);
    this.updateProgressBars(state.historyProgress, state.artProgress);
    if (this.phaseIndicator) {
      this.phaseIndicator.text = `第${this.getChineseNumber(state.currentInvestigationPhase)}阶段`;
    }
  }

  private showCrossEvidenceAnimation(clue1Name?: string, clue2Name?: string, sharedClueName?: string): void {
    const panel = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.85);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();
    panel.addChild(bg);

    const icon = new PIXI.Text('🔗', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 80;
    panel.addChild(icon);

    const title = new PIXI.Text('交叉取证完成！', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = GAME_CONFIG.DESIGN_HEIGHT / 2;
    panel.addChild(title);

    const desc = new PIXI.Text(
      `「${clue1Name || '线索'}」与「${clue2Name || '线索'}」相互印证\n解锁了新线索：「${sharedClueName || '共享线索'}」`,
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 22,
        fill: 0xFFFFFF,
        align: 'center',
        lineHeight: 36
      }
    );
    desc.anchor.set(0.5);
    desc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    desc.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 60;
    panel.addChild(desc);

    panel.alpha = 0;
    this.container.addChild(panel);

    Animator.animate(
      400,
      (p) => { panel.alpha = p; },
      () => {
        Animator.delay(2500).then(() => {
          Animator.animate(
            400,
            (p) => { panel.alpha = 1 - p; },
            () => {
              this.container.removeChild(panel);
              panel.destroy();
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  private showPhaseUnlockAnimation(phase: number): void {
    const panel = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.85);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();
    panel.addChild(bg);

    const icon = new PIXI.Text('✨', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 60;
    panel.addChild(icon);

    const title = new PIXI.Text(`第${this.getChineseNumber(phase)}阶段解锁！`, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 40,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 20;
    panel.addChild(title);

    const hallNames = phase === 2 ? '礼乐厅与时光画廊' : '匠作坊与创作室';
    const desc = new PIXI.Text(`新展厅已开放：${hallNames}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xFFFFFF,
      align: 'center'
    });
    desc.anchor.set(0.5);
    desc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    desc.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 80;
    panel.addChild(desc);

    panel.alpha = 0;
    this.container.addChild(panel);

    Animator.animate(
      400,
      (p) => { panel.alpha = p; },
      () => {
        Animator.delay(2000).then(() => {
          Animator.animate(
            400,
            (p) => { panel.alpha = 1 - p; },
            () => {
              this.container.removeChild(panel);
              panel.destroy();
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  update(_delta: number): void {
    // Update animations if needed
  }

  destroy(): void {
    eventBus.off('dualhall:start', this.handleDualHallStart.bind(this));
    eventBus.off('dualhall:progress-update', this.handleProgressUpdate.bind(this));
    eventBus.off('dualhall:switch', this.handleHallSwitch.bind(this));
    eventBus.off('dualhall:phase-unlock', this.handlePhaseUnlock.bind(this));
    eventBus.off('dualhall:cross-evidence-complete', this.handleCrossEvidence.bind(this));
    eventBus.off('exhibition:enter', this.handleExhibitionEnter.bind(this));
    
    this.clearPanel();
    if (this.dualHallPanel && this.dualHallPanel.parent) {
      this.dualHallPanel.destroy();
    }
  }
}

export const dualHallModule = (container: PIXI.Container) => new DualHallModule(container);
