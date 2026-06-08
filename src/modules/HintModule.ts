import * as PIXI from 'pixi.js';
import { HintContent, HintUrgencyLevel, HintContextType } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';
import { HINT_AUDIO_MAP } from '../game/data/sceneAudio';

export class HintModule {
  private container: PIXI.Container;
  private hintPanel: PIXI.Container | null = null;
  private currentHint: HintContent | null = null;
  private autoCheckTimer: number | null = null;
  private isOpen: boolean = false;
  private relatedHotspotIndicators: Map<string, PIXI.Graphics> = new Map();
  private hintButton: PIXI.Container | null = null;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.setupEventListeners();
    this.createHintButton();
    this.startAutoCheck();
  }

  private setupEventListeners(): void {
    eventBus.on('hint:display', this.handleHintDisplay.bind(this));
    eventBus.on('hint:dismissed', this.handleHintDismissed.bind(this));
    eventBus.on('hint:setting-changed', this.handleSettingChanged.bind(this));
    eventBus.on('mechanism:open', this.handleMechanismOpen.bind(this));
    eventBus.on('mechanism:solve', this.handleMechanismSolve.bind(this));
    eventBus.on('memorysort:open', this.handleMemorySortOpen.bind(this));
    eventBus.on('memory:complete', this.handleMemoryComplete.bind(this));
    eventBus.on('chapter:enter', this.handleChapterEnter.bind(this));
    eventBus.on('exhibition:change', this.handleExhibitionChange.bind(this));
  }

  private createHintButton(): void {
    const button = new PIXI.Container();
    
    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawCircle(35, 35, 35);
    bg.endFill();
    button.addChild(bg);

    const icon = new PIXI.Text('💡', { fontSize: 32 });
    icon.anchor.set(0.5);
    icon.x = 35;
    icon.y = 35;
    button.addChild(icon);

    button.x = GAME_CONFIG.DESIGN_WIDTH - 100;
    button.y = 100;
    button.eventMode = 'static';
    button.cursor = 'pointer';

    button.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.handleManualHintRequest();
    });

    button.on('pointerover', () => {
      Animator.tween(button.scale, { x: 1.1, y: 1.1 }, 150);
    });

    button.on('pointerout', () => {
      Animator.tween(button.scale, { x: 1, y: 1 }, 150);
    });

    this.hintButton = button;
    this.container.addChild(button);
  }

  private handleManualHintRequest(): void {
    const currentChapter = store.getCurrentChapter();
    const activeMechanismId = store.getHintState().contextTracking.currentMechanismId;
    const activePuzzleId = store.getHintState().contextTracking.currentMemoryPuzzleId;

    let contextType: HintContextType = 'exploration';
    let targetId = store.getCurrentExhibition()?.id || '';

    if (activeMechanismId) {
      contextType = 'mechanism';
      targetId = activeMechanismId;
    } else if (activePuzzleId) {
      contextType = 'memory_puzzle';
      targetId = activePuzzleId;
    }

    if (currentChapter) {
      store.requestManualHint(contextType, targetId, currentChapter.id);
    }
  }

  private handleMechanismOpen(data: { mechanismId: string }): void {
    store.startMechanismTracking(data.mechanismId);
    this.clearHotspotIndicators();
  }

  private handleMechanismSolve(_data: { mechanismId: string }): void {
    store.clearContextTracking();
    this.clearHotspotIndicators();
    this.dismissCurrentHint('used');
  }

  private handleMemorySortOpen(data: { mechanismId: string }): void {
    store.startMemoryPuzzleTracking(`memory-module-${data.mechanismId}`);
    this.clearHotspotIndicators();
  }

  private handleMemoryComplete(_data: { chapterId: string; success: boolean }): void {
    store.clearContextTracking();
    this.clearHotspotIndicators();
    this.dismissCurrentHint('used');
  }

  private handleChapterEnter(data: { chapterId: string }): void {
    const chapter = store.getChapterById(data.chapterId);
    if (chapter) {
      const phaseMatch = data.chapterId.match(/chapter_(\d+)/);
      if (phaseMatch) {
        store.setChapterPhase(parseInt(phaseMatch[1]));
      }
    }
    store.clearContextTracking();
    this.clearHotspotIndicators();
    this.dismissCurrentHint('ignored');
  }

  private handleExhibitionChange(_data: { exhibitionId: string }): void {
    store.updateHintTracking({
      explorationStartTime: Date.now()
    });
    this.clearHotspotIndicators();
    this.dismissCurrentHint('ignored');
  }

  private handleHintDisplay(data: { hint: HintContent }): void {
    this.showHint(data.hint);
  }

  private handleHintDismissed(data: { hintId: string; userAction: string }): void {
    if (this.currentHint?.id === data.hintId) {
      this.dismissCurrentHint(data.userAction as any);
    }
  }

  private handleSettingChanged(data: { autoHintEnabled?: boolean; hintFrequency?: string }): void {
    if (data.autoHintEnabled !== undefined) {
      if (data.autoHintEnabled) {
        this.startAutoCheck();
      } else {
        this.stopAutoCheck();
      }
    }
  }

  private startAutoCheck(): void {
    this.stopAutoCheck();
    
    this.autoCheckTimer = window.setInterval(() => {
      const hintState = store.getHintState();
      if (!hintState.autoHintEnabled) return;

      const currentChapter = store.getCurrentChapter();
      if (!currentChapter) return;

      const activeMechanismId = hintState.contextTracking.currentMechanismId;
      const activePuzzleId = hintState.contextTracking.currentMemoryPuzzleId;

      if (activeMechanismId && !store.getMechanismById(activeMechanismId)?.solved) {
        store.checkAndTriggerAutoHint('mechanism', activeMechanismId, currentChapter.id);
      } else if (activePuzzleId) {
        store.checkAndTriggerAutoHint('memory_puzzle', activePuzzleId, currentChapter.id);
      } else {
        const currentExhibition = store.getCurrentExhibition();
        if (currentExhibition) {
          store.checkAndTriggerAutoHint('exploration', currentExhibition.id, currentChapter.id);
        }
      }
    }, 5000);
  }

  private stopAutoCheck(): void {
    if (this.autoCheckTimer !== null) {
      clearInterval(this.autoCheckTimer);
      this.autoCheckTimer = null;
    }
  }

  private showHint(hint: HintContent): void {
    if (this.isOpen) {
      this.dismissCurrentHint('ignored');
    }

    this.currentHint = hint;
    this.isOpen = true;

    this.playHintSound(hint);
    this.createHintPanel(hint);
    this.showRelatedHotspotIndicators(hint);
  }

  private playHintSound(hint: HintContent): void {
    const contextShort = this.getContextShortName(hint.contextType);
    const audioKey = `hint_${contextShort}_${hint.urgencyLevel}`;
    const audioConfig = HINT_AUDIO_MAP[audioKey] || HINT_AUDIO_MAP['hint_display'];
    
    if (audioConfig) {
      audioModule.playSFX(audioConfig.sfx);
    } else {
      audioModule.playSFX('sfx_hint_appear');
    }
  }

  private getContextShortName(contextType: HintContextType): string {
    const map: Record<HintContextType, string> = {
      'mechanism': 'mechanism',
      'memory_puzzle': 'memory',
      'exploration': 'exploration',
      'chapter_progress': 'progress',
      'exhibition_navigation': 'navigation'
    };
    return map[contextType] || 'exploration';
  }

  private createHintPanel(hint: HintContent): void {
    const panel = new PIXI.Container();
    panel.name = 'hintPanel';

    const urgencyColors: Record<HintUrgencyLevel, { bg: number; border: number; icon: string }> = {
      low: { bg: GAME_CONFIG.COLORS.BRONZE, border: GAME_CONFIG.COLORS.AMBER, icon: '💡' },
      medium: { bg: GAME_CONFIG.COLORS.AMBER, border: GAME_CONFIG.COLORS.GOLD, icon: '💡' },
      high: { bg: GAME_CONFIG.COLORS.WARM_ORANGE, border: GAME_CONFIG.COLORS.GOLD, icon: '🔔' },
      critical: { bg: GAME_CONFIG.COLORS.EMERGENCY_RED, border: GAME_CONFIG.COLORS.GOLD, icon: '⚠️' }
    };

    const colors = urgencyColors[hint.urgencyLevel];

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.6);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    overlay.on('pointerdown', () => {
      this.dismissCurrentHint('dismissed');
    });
    panel.addChild(overlay);

    const panelWidth = 650;
    const panelHeight = this.calculatePanelHeight(hint);
    const panelX = (GAME_CONFIG.DESIGN_WIDTH - panelWidth) / 2;
    const panelY = (GAME_CONFIG.DESIGN_HEIGHT - panelHeight) / 2;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    bg.lineStyle(4, colors.border, 1);
    bg.drawRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    bg.endFill();
    panel.addChild(bg);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(colors.bg, 0.3);
    iconBg.lineStyle(3, colors.border, 0.8);
    iconBg.drawCircle(panelX + 60, panelY + 60, 35);
    iconBg.endFill();
    panel.addChild(iconBg);

    const icon = new PIXI.Text(colors.icon, { fontSize: 36 });
    icon.anchor.set(0.5);
    icon.x = panelX + 60;
    icon.y = panelY + 60;
    panel.addChild(icon);

    const title = new PIXI.Text(hint.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: colors.border,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: panelWidth - 140
    });
    title.x = panelX + 110;
    title.y = panelY + 35;
    panel.addChild(title);

    const detailBadge = new PIXI.Text(`详细度 ${hint.detailLevel}/4`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    detailBadge.x = panelX + panelWidth - 120;
    detailBadge.y = panelY + 45;
    panel.addChild(detailBadge);

    const separator = new PIXI.Graphics();
    separator.beginFill(colors.border, 0.3);
    separator.drawRect(panelX + 30, panelY + 100, panelWidth - 60, 1);
    separator.endFill();
    panel.addChild(separator);

    let currentY = panelY + 130;

    const message = new PIXI.Text(hint.message, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'left',
      wordWrap: true,
      wordWrapWidth: panelWidth - 60,
      lineHeight: 32
    });
    message.x = panelX + 30;
    message.y = currentY;
    panel.addChild(message);

    currentY += message.height + 20;

    if (hint.suggestion) {
      const suggestionBg = new PIXI.Graphics();
      suggestionBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.15);
      suggestionBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
      suggestionBg.drawRoundedRect(panelX + 30, currentY, panelWidth - 60, 80, 12);
      suggestionBg.endFill();
      panel.addChild(suggestionBg);

      const suggestionIcon = new PIXI.Text('🎯', { fontSize: 24 });
      suggestionIcon.x = panelX + 50;
      suggestionIcon.y = currentY + 25;
      panel.addChild(suggestionIcon);

      const suggestion = new PIXI.Text(hint.suggestion, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.AMBER,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: panelWidth - 120,
        lineHeight: 26
      });
      suggestion.x = panelX + 90;
      suggestion.y = currentY + 18;
      panel.addChild(suggestion);

      currentY += 100;
    }

    if (hint.relatedClues && hint.relatedClues.length > 0) {
      const relatedLabel = new PIXI.Text('📎 相关线索：', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE
      });
      relatedLabel.x = panelX + 30;
      relatedLabel.y = currentY + 10;
      panel.addChild(relatedLabel);

      currentY += 40;

      hint.relatedClues.slice(0, 3).forEach((clueId, index) => {
        const clue = store.getClueById(clueId);
        if (clue) {
          const clueItem = new PIXI.Text(`• ${clue.icon} ${clue.name}`, {
            fontFamily: GAME_CONFIG.FONTS.BODY,
            fontSize: 16,
            fill: GAME_CONFIG.COLORS.CREAM
          });
          clueItem.x = panelX + 50;
          clueItem.y = currentY + index * 28;
          panel.addChild(clueItem);
        }
      });

      currentY += hint.relatedClues.slice(0, 3).length * 28 + 20;
    }

    const buttonY = currentY + 20;

    const gotItBtn = this.createButton('知道了', panelX + panelWidth / 2 - 100, buttonY, false);
    gotItBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.dismissCurrentHint('used');
    });
    panel.addChild(gotItBtn);

    const dismissBtn = this.createButton('不再提示', panelX + panelWidth / 2 - 100, buttonY + 90, true);
    dismissBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.dismissCurrentHint('dismissed');
    });
    panel.addChild(dismissBtn);

    panel.alpha = 0;
    this.container.addChild(panel);
    this.hintPanel = panel;

    Animator.animate(
      400,
      (progress) => {
        panel.alpha = progress;
        panel.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );

    const autoDismissTime = hint.displayDuration || GAME_CONFIG.PROGRESSIVE_HINTS.DEFAULT_DISPLAY_DURATION;
    if (autoDismissTime > 0) {
      Animator.delay(autoDismissTime).then(() => {
        if (this.hintPanel === panel && this.isOpen) {
          this.dismissCurrentHint('ignored');
        }
      });
    }
  }

  private calculatePanelHeight(hint: HintContent): number {
    let height = 180;
    
    const messageLines = Math.ceil(hint.message.length / 30);
    height += messageLines * 32;

    if (hint.suggestion) {
      height += 100;
    }

    if (hint.relatedClues && hint.relatedClues.length > 0) {
      height += 40 + Math.min(hint.relatedClues.length, 3) * 28 + 20;
    }

    height += 180;

    return Math.max(height, 400);
  }

  private createButton(text: string, x: number, y: number, isSecondary: boolean): PIXI.Container {
    const btn = new PIXI.Container();
    
    const color = isSecondary ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.AMBER;
    const textColor = isSecondary ? 0xFFFFFF : GAME_CONFIG.COLORS.DARK_BROWN;

    const bg = new PIXI.Graphics();
    bg.beginFill(color, 0.9);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(0, 0, 200, 70, 15);
    bg.endFill();
    btn.addChild(bg);

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: textColor
    });
    btnText.anchor.set(0.5);
    btnText.x = 100;
    btnText.y = 35;
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

  private showRelatedHotspotIndicators(hint: HintContent): void {
    if (!hint.relatedHotspots || hint.relatedHotspots.length === 0) return;

    const currentExhibition = store.getCurrentExhibition();
    if (!currentExhibition) return;

    hint.relatedHotspots.forEach(hotspotId => {
      const hotspot = currentExhibition.hotspots.find(h => h.id === hotspotId);
      if (hotspot) {
        const indicator = new PIXI.Graphics();
        indicator.beginFill(GAME_CONFIG.COLORS.GOLD, 0.3);
        indicator.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 0.8);
        indicator.drawRoundedRect(hotspot.x, hotspot.y, hotspot.width, hotspot.height, 8);
        indicator.endFill();

        const pulseAnimation = () => {
          Animator.animate(
            1000,
            (progress) => {
              indicator.alpha = 0.3 + Math.sin(progress * Math.PI * 2) * 0.3;
            },
            pulseAnimation
          );
        };
        pulseAnimation();

        this.container.addChild(indicator);
        this.relatedHotspotIndicators.set(hotspotId, indicator);
      }
    });
  }

  private clearHotspotIndicators(): void {
    this.relatedHotspotIndicators.forEach(indicator => {
      if (indicator.parent) {
        indicator.parent.removeChild(indicator);
      }
      indicator.destroy();
    });
    this.relatedHotspotIndicators.clear();
  }

  private dismissCurrentHint(userAction: 'used' | 'dismissed' | 'ignored' = 'dismissed'): void {
    if (!this.hintPanel || !this.isOpen) return;

    const hintId = this.currentHint?.id;
    
    audioModule.playSFX('sfx_click');

    Animator.animate(
      300,
      (progress) => {
        if (this.hintPanel) {
          this.hintPanel.alpha = 1 - progress;
          this.hintPanel.scale.set(1 - progress * 0.1);
        }
      },
      () => {
        if (this.hintPanel && this.hintPanel.parent) {
          this.hintPanel.parent.removeChild(this.hintPanel);
          this.hintPanel.destroy();
        }
        this.hintPanel = null;
        this.isOpen = false;
        this.currentHint = null;
        this.clearHotspotIndicators();

        if (hintId) {
          store.dismissHint(hintId, userAction);
        }
      }
    );
  }

  update(_delta: number): void {
  }

  destroy(): void {
    this.stopAutoCheck();
    this.clearHotspotIndicators();
    
    if (this.hintPanel) {
      this.hintPanel.destroy();
    }
    
    if (this.hintButton && this.hintButton.parent) {
      this.hintButton.parent.removeChild(this.hintButton);
      this.hintButton.destroy();
    }

    eventBus.off('hint:display', this.handleHintDisplay.bind(this));
    eventBus.off('hint:dismissed', this.handleHintDismissed.bind(this));
    eventBus.off('hint:setting-changed', this.handleSettingChanged.bind(this));
    eventBus.off('mechanism:open', this.handleMechanismOpen.bind(this));
    eventBus.off('mechanism:solve', this.handleMechanismSolve.bind(this));
    eventBus.off('memorysort:open', this.handleMemorySortOpen.bind(this));
    eventBus.off('memory:complete', this.handleMemoryComplete.bind(this));
    eventBus.off('chapter:enter', this.handleChapterEnter.bind(this));
    eventBus.off('exhibition:change', this.handleExhibitionChange.bind(this));
  }
}

export const hintModule = new HintModule(new PIXI.Container());
