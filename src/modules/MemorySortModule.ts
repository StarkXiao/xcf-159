import * as PIXI from 'pixi.js';
import { Clue, MemorySortData, MemoryPuzzleScoreResult } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class MemorySortModule {
  private container: PIXI.Container;
  private sortPanel: PIXI.Container | null = null;
  private currentMechanismId: string = '';
  private fragments: Clue[] = [];
  private arrangedIds: string[] = [];
  private dragging: PIXI.Container | null = null;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private fragmentSlots: Map<string, PIXI.Container> = new Map();
  private isOpen: boolean = false;
  private currentPuzzleId: string = '';
  private currentChapterId: string = '';
  private correctPositions: number[] = [];
  private wrongPositions: number[] = [];
  private attemptsText: PIXI.Text | null = null;
  private scoreText: PIXI.Text | null = null;
  private hintButton: PIXI.Container | null = null;
  private skipButton: PIXI.Container | null = null;
  private hintText: PIXI.Text | null = null;
  private canGetHint: boolean = true;
  private canSkip: boolean = true;
  private skipCost: number = GAME_CONFIG.MEMORY_PUZZLE.SKIP_BASE_COST;
  private hintCost: number = GAME_CONFIG.MEMORY_PUZZLE.HINT_COST;

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('memorysort:open', this.handleMemorySortOpen.bind(this));
  }

  private handleMemorySortOpen(data: { mechanismId: string; memorySortData: MemorySortData }): void {
    if (this.isOpen) return;

    this.currentMechanismId = data.mechanismId;
    this.fragments = data.memorySortData.fragments;
    this.isOpen = true;
    this.arrangedIds = [];
    this.fragmentSlots.clear();
    this.correctPositions = [];
    this.wrongPositions = [];
    this.currentChapterId = store.getCurrentChapter()?.id || '';
    this.currentPuzzleId = data.mechanismId;
    store.initMemoryPuzzleState(this.currentPuzzleId, this.currentChapterId);
    this.shuffleFragments();

    this.sortPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.sortPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(25, 150, 700, 1000, 20);
    panel.endFill();
    this.sortPanel.addChild(panel);

    const icon = new PIXI.Text('🧩', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 210;
    this.sortPanel.addChild(icon);

    const title = new PIXI.Text('记忆碎片排序', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 280;
    this.sortPanel.addChild(title);

    const subtitle = new PIXI.Text('将记忆碎片按时间顺序从早到晚排列', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xCCCCCC,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 320;
    this.sortPanel.addChild(subtitle);

    this.attemptsText = new PIXI.Text('尝试次数：0', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'left'
    });
    this.attemptsText.x = 60;
    this.attemptsText.y = 360;
    this.sortPanel.addChild(this.attemptsText);

    this.scoreText = new PIXI.Text('基础积分：500', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'right'
    });
    this.scoreText.anchor.x = 1;
    this.scoreText.x = GAME_CONFIG.DESIGN_WIDTH - 60;
    this.scoreText.y = 360;
    this.sortPanel.addChild(this.scoreText);

    this.hintText = new PIXI.Text('', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0x7FD77F,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 600
    });
    this.hintText.anchor.set(0.5);
    this.hintText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    this.hintText.y = 620;
    this.sortPanel.addChild(this.hintText);

    this.createSlots();
    this.createFragmentCards();

    const confirmBtn = this.createButton('确认顺序', 390, 1050);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validateOrder();
    });
    this.sortPanel.addChild(confirmBtn);

    this.hintButton = this.createButton(`提示 (-${this.hintCost}分)`, 150, 1050, true);
    this.hintButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.useHint();
    });
    this.sortPanel.addChild(this.hintButton);

    this.skipButton = this.createButton(`跳过 (-${this.skipCost}分)`, 630, 1050, true);
    this.skipButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.skipPuzzle();
    });
    this.sortPanel.addChild(this.skipButton);

    this.sortPanel.alpha = 0;
    this.container.addChild(this.sortPanel);

    Animator.animate(
      300,
      (progress) => {
        this.sortPanel!.alpha = progress;
        this.sortPanel!.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private shuffleFragments(): void {
    for (let i = this.fragments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.fragments[i], this.fragments[j]] = [this.fragments[j], this.fragments[i]];
    }
  }

  private createSlots(): void {
    const slotY = 410;
    const slotSize = 200;
    const gap = 30;
    const startX = (GAME_CONFIG.DESIGN_WIDTH - (this.fragments.length * slotSize + (this.fragments.length - 1) * gap)) / 2;

    this.fragmentSlots.clear();

    for (let i = 0; i < this.fragments.length; i++) {
      const slot = new PIXI.Graphics();
      
      let borderColor: number = GAME_CONFIG.COLORS.AMBER;
      let fillColor: number = GAME_CONFIG.COLORS.BRONZE;
      let alpha = 0.5;
      let fillAlpha = 0.3;

      if (this.correctPositions.includes(i)) {
        borderColor = 0x00FF00;
        fillColor = 0x00FF00;
        alpha = 0.8;
        fillAlpha = 0.2;
      } else if (this.wrongPositions.includes(i)) {
        borderColor = 0xFF0000;
        fillColor = 0xFF0000;
        alpha = 0.8;
        fillAlpha = 0.2;
      }

      slot.lineStyle(3, borderColor, alpha);
      slot.beginFill(fillColor, fillAlpha);
      slot.drawRoundedRect(0, 0, slotSize, slotSize, 15);
      slot.endFill();

      const slotNum = new PIXI.Text(`${i + 1}`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 48,
        fill: borderColor
      });
      slotNum.alpha = 0.5;
      slotNum.anchor.set(0.5);
      slotNum.x = slotSize / 2;
      slotNum.y = slotSize / 2;
      slot.addChild(slotNum);

      slot.x = startX + i * (slotSize + gap);
      slot.y = slotY;
      (slot as any).slotIndex = i;
      this.sortPanel!.addChild(slot);
      this.fragmentSlots.set(`slot-${i}`, slot);
    }
  }

  private createFragmentCards(): void {
    const cardY = 680;
    const cardSize = 180;
    const gap = 25;
    const startX = (GAME_CONFIG.DESIGN_WIDTH - (this.fragments.length * cardSize + (this.fragments.length - 1) * gap)) / 2;

    this.fragments.forEach((fragment, index) => {
      const card = this.createFragmentCard(fragment, cardSize);
      card.x = startX + index * (cardSize + gap);
      card.y = cardY;
      (card as any).originalX = card.x;
      (card as any).originalY = card.y;
      (card as any).fragmentId = fragment.id;
      (card as any).inSlot = false;
      (card as any).slotIndex = -1;

      card.eventMode = 'static';
      card.cursor = 'pointer';

      card.on('pointerdown', (e) => this.onDragStart(e, card));
      card.on('pointermove', (e) => this.onDragMove(e, card));
      card.on('pointerup', () => this.onDragEnd(card));
      card.on('pointerupoutside', () => this.onDragEnd(card));

      this.fragmentSlots.set(fragment.id, card);
      this.sortPanel!.addChild(card);
    });
  }

  private createFragmentCard(fragment: Clue, size: number): PIXI.Container {
    const container = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    bg.drawRoundedRect(0, 0, size, size, 12);
    bg.endFill();
    container.addChild(bg);

    const icon = new PIXI.Text(fragment.icon, { fontSize: 56 });
    icon.anchor.set(0.5);
    icon.x = size / 2;
    icon.y = size / 3;
    container.addChild(icon);

    const name = new PIXI.Text(fragment.name, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: size - 20
    });
    name.anchor.set(0.5, 0);
    name.x = size / 2;
    name.y = size * 0.6;
    container.addChild(name);

    return container;
  }

  private onDragStart(e: PIXI.FederatedPointerEvent, card: PIXI.Container): void {
    audioModule.playSFX('sfx_click');
    this.dragging = card;
    const globalPos = e.global;
    this.dragOffset = {
      x: globalPos.x - card.x,
      y: globalPos.y - card.y
    };
    this.sortPanel!.addChild(card);
    Animator.tween(card.scale, { x: 1.1, y: 1.1 }, 150);
  }

  private onDragMove(e: PIXI.FederatedPointerEvent, card: PIXI.Container): void {
    if (this.dragging !== card) return;

    const parent = card.parent as PIXI.Container;
    const localPos = parent.toLocal(e.global);
    card.x = localPos.x - this.dragOffset.x;
    card.y = localPos.y - this.dragOffset.y;
  }

  private onDragEnd(card: PIXI.Container): void {
    if (this.dragging !== card) return;
    this.dragging = null;

    Animator.tween(card.scale, { x: 1, y: 1 }, 150);

    const slotIndex = this.getSlotAtPosition(card.x + 90, card.y + 90);
    if (slotIndex !== -1) {
      this.placeCardInSlot(card, slotIndex);
    } else {
      this.returnCardToOriginal(card);
    }
  }

  private getSlotAtPosition(x: number, y: number): number {
    const slotY = 380;
    const slotSize = 200;
    const gap = 30;
    const startX = (GAME_CONFIG.DESIGN_WIDTH - (this.fragments.length * slotSize + (this.fragments.length - 1) * gap)) / 2;

    if (y < slotY || y > slotY + slotSize) return -1;

    for (let i = 0; i < this.fragments.length; i++) {
      const slotX = startX + i * (slotSize + gap);
      if (x >= slotX && x <= slotX + slotSize) {
        return i;
      }
    }
    return -1;
  }

  private placeCardInSlot(card: PIXI.Container, slotIndex: number): void {
    const slotY = 380;
    const slotSize = 200;
    const gap = 30;
    const startX = (GAME_CONFIG.DESIGN_WIDTH - (this.fragments.length * slotSize + (this.fragments.length - 1) * gap)) / 2;

    const existingCard = this.getCardInSlot(slotIndex);
    if (existingCard && existingCard !== card) {
      this.returnCardToOriginal(existingCard);
    }

    const fragmentId = (card as any).fragmentId as string;
    const oldIndex = this.arrangedIds.indexOf(fragmentId);
    if (oldIndex !== -1) {
      this.arrangedIds.splice(oldIndex, 1);
    }
    this.arrangedIds[slotIndex] = fragmentId;
    (card as any).slotIndex = slotIndex;
    (card as any).inSlot = true;

    const targetX = startX + slotIndex * (slotSize + gap) + 10;
    const targetY = slotY + 10;

    Animator.animate(
      200,
      (progress) => {
        card.x = card.x + (targetX - card.x) * progress;
        card.y = card.y + (targetY - card.y) * progress;
      }
    );

    audioModule.playSFX('sfx_collect');
  }

  private getCardInSlot(slotIndex: number): PIXI.Container | null {
    for (const [, card] of this.fragmentSlots) {
      if ((card as any).slotIndex === slotIndex && (card as any).inSlot) {
        return card;
      }
    }
    return null;
  }

  private returnCardToOriginal(card: PIXI.Container): void {
    const fragmentId = (card as any).fragmentId as string;
    const index = this.arrangedIds.indexOf(fragmentId);
    if (index !== -1) {
      this.arrangedIds.splice(index, 1);
    }
    (card as any).inSlot = false;
    (card as any).slotIndex = -1;

    Animator.animate(
      200,
      (progress) => {
        card.x = card.x + ((card as any).originalX - card.x) * progress;
        card.y = card.y + ((card as any).originalY - card.y) * progress;
      }
    );
  }

  private validateOrder(): void {
    const filledSlots = this.arrangedIds.filter(id => id !== undefined);
    if (filledSlots.length !== this.fragments.length) {
      this.showHint('请将所有记忆碎片放入槽位中');
      audioModule.playSFX('sfx_error');
      return;
    }

    const orderedIds: string[] = [];
    for (let i = 0; i < this.fragments.length; i++) {
      orderedIds.push(this.arrangedIds[i]);
    }

    const result = store.submitMemorySort(this.currentMechanismId, orderedIds);

    if (result.correctPositions !== undefined) {
      this.correctPositions = result.correctPositions;
    }
    if (result.wrongPositions !== undefined) {
      this.wrongPositions = result.wrongPositions;
    }

    this.refreshSlots();

    if (result.attempts !== undefined) {
      this.updateInfoText(result.attempts);
    }

    if (result.hint && this.hintText) {
      this.hintText.text = `💡 ${result.hint.message}`;
    }

    if (result.canGetHint !== undefined) {
      this.canGetHint = result.canGetHint;
    }
    if (result.hintCost !== undefined) {
      this.hintCost = result.hintCost;
    }
    if (result.canSkip !== undefined) {
      this.canSkip = result.canSkip;
    }
    if (result.skipCost !== undefined) {
      this.skipCost = result.skipCost;
    }
    this.updateButtons();

    if (result.success && result.correct) {
      audioModule.playSFX('sfx_success');
      audioModule.playSFX('sfx_unlock');
      this.showSuccessEffect(result.scoreInfo);
    } else {
      audioModule.playSFX('sfx_error');
      this.showHint(result.message || '顺序不正确，请重新排列');
      this.shakeAnimation();
      if (this.currentPuzzleId && result.message && result.message !== '请将所有记忆碎片放入槽位中') {
        store.recordMemoryPuzzleWrongAttempt(this.currentPuzzleId);
      }
    }
  }

  private refreshSlots(): void {
    if (!this.sortPanel) return;
    
    this.fragmentSlots.forEach(slot => {
      this.sortPanel?.removeChild(slot);
      slot.destroy();
    });
    
    this.createSlots();
  }

  private updateInfoText(attempts: number): void {
    if (this.attemptsText) {
      this.attemptsText.text = `尝试次数：${attempts}`;
    }
    
    if (this.scoreText) {
      const scoreResult = store.calculateMemoryPuzzleScore(this.currentPuzzleId);
      this.scoreText.text = `预计积分：${scoreResult.finalScore} 分`;
    }
  }

  private updateButtons(): void {
    if (this.hintButton) {
      const hintText = this.hintButton.getChildAt(1) as PIXI.Text;
      if (hintText) {
        hintText.text = this.canGetHint ? `提示 (-${this.hintCost}分)` : '提示已用完';
      }
      (this.hintButton as any).eventMode = this.canGetHint ? 'static' : 'none';
      this.hintButton.alpha = this.canGetHint ? 1 : 0.5;
    }

    if (this.skipButton) {
      const skipText = this.skipButton.getChildAt(1) as PIXI.Text;
      if (skipText) {
        skipText.text = this.canSkip ? `跳过 (-${this.skipCost}分)` : '已完成';
      }
      (this.skipButton as any).eventMode = this.canSkip ? 'static' : 'none';
      this.skipButton.alpha = this.canSkip ? 1 : 0.5;
    }
  }

  private useHint(): void {
    if (!this.canGetHint) return;

    store.recordMechanismHintUsed(this.currentMechanismId);
    
    const fragmentIds = this.fragments.map(f => f.id);
    const hint = store.generateMemorySortHint(this.currentPuzzleId, this.arrangedIds, fragmentIds);
    
    if (hint && this.hintText) {
      this.hintText.text = `💡 ${hint.message}`;
      audioModule.playSFX('sfx_click');
    }

    const state = store.getMemoryPuzzleState(this.currentPuzzleId);
    if (state) {
      this.canGetHint = state.hintsUsed < state.maxHints;
      this.updateButtons();
      this.updateInfoText(state.attempts.length);
    }
  }

  private skipPuzzle(): void {
    if (!this.canSkip) return;

    const confirm = window.confirm(`确定要跳过记忆拼图吗？\n将扣除 ${this.skipCost} 分，最终积分会降低。`);
    if (!confirm) return;

    const result = store.skipMemoryPuzzle(this.currentPuzzleId, this.currentMechanismId);
    
    if (result.success) {
      this.showHint(result.message || '已跳过记忆拼图');
      audioModule.playSFX('sfx_click');
      
      Animator.delay(1500).then(() => {
        this.closeSortPanel();
      });
    }
  }

  private showHint(text: string): void {
    const hint = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center'
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 620;
    hint.alpha = 0;
    this.sortPanel!.addChild(hint);

    Animator.animate(
      300,
      (progress) => { hint.alpha = progress; },
      () => {
        Animator.delay(1500).then(() => {
          Animator.animate(300, (p) => { hint.alpha = 1 - p; }, () => {
            this.sortPanel?.removeChild(hint);
            hint.destroy();
          });
        });
      }
    );
  }

  private shakeAnimation(): void {
    const panel = this.sortPanel;
    if (!panel) return;

    const originalX = panel.x;
    let count = 0;
    const shakeStep = () => {
      if (count >= 10) {
        panel.x = originalX;
        return;
      }
      panel.x = originalX + (count % 2 === 0 ? -8 : 8);
      count++;
      requestAnimationFrame(shakeStep);
    };
    shakeStep();
  }

  private showSuccessEffect(scoreInfo?: MemoryPuzzleScoreResult): void {
    if (scoreInfo && this.scoreText) {
      this.scoreText.text = `最终积分：${scoreInfo.finalScore} 分 (${scoreInfo.rank})`;
      this.scoreText.style.fill = GAME_CONFIG.COLORS.GOLD;
    }

    const glow = new PIXI.Graphics();
    glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
    glow.drawRoundedRect(25, 150, 700, 1000, 20);
    glow.endFill();
    this.sortPanel!.addChild(glow);

    if (scoreInfo) {
      const scorePanel = new PIXI.Container();
      scorePanel.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      scorePanel.y = 360;
      scorePanel.alpha = 0;

      const bg = new PIXI.Graphics();
      bg.beginFill(0x000000, 0.7);
      bg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.8);
      bg.drawRoundedRect(-200, -40, 400, 80, 10);
      bg.endFill();
      scorePanel.addChild(bg);

      const rankColor = scoreInfo.rank === 'S' ? 0xFFD700 : 
                       scoreInfo.rank === 'A' ? GAME_CONFIG.COLORS.AMBER :
                       scoreInfo.rank === 'B' ? GAME_CONFIG.COLORS.BRONZE : 0x888888;

      const rankText = new PIXI.Text(`${scoreInfo.rank}`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 36,
        fill: rankColor,
        align: 'center'
      });
      rankText.anchor.set(0.5);
      rankText.x = -120;
      rankText.y = 0;
      scorePanel.addChild(rankText);

      const scoreText = new PIXI.Text(`+${scoreInfo.finalScore} 分`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 32,
        fill: GAME_CONFIG.COLORS.GOLD,
        align: 'center'
      });
      scoreText.anchor.set(0.5);
      scoreText.x = 80;
      scoreText.y = 0;
      scorePanel.addChild(scoreText);

      this.sortPanel!.addChild(scorePanel);

      Animator.animate(
        500,
        (progress) => {
          scorePanel.alpha = progress;
          scorePanel.y = 360 - progress * 20;
        },
        undefined,
        Animator.easeOutCubic
      );
    }

    Animator.animate(
      500,
      (progress) => {
        glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.3);
        glow.clear();
        glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.3);
        glow.drawRoundedRect(25, 150, 700, 1000, 20);
        glow.endFill();
      },
      () => {
        Animator.delay(1500).then(() => {
          this.closeSortPanel();
        });
      }
    );

    for (let i = 0; i < 20; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(GAME_CONFIG.COLORS.GOLD, 0.8);
      particle.drawCircle(0, 0, 4 + Math.random() * 4);
      particle.endFill();
      particle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      particle.y = 600;
      this.sortPanel!.addChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const animateParticle = () => {
        particle.x += vx;
        particle.y += vy;
        particle.alpha -= 0.02;
        if (particle.alpha > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          particle.destroy();
        }
      };
      animateParticle();
    }
  }

  private createButton(text: string, x: number, y: number, isSecondary: boolean = false): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const color = isSecondary ? GAME_CONFIG.COLORS.BRONZE : GAME_CONFIG.COLORS.AMBER;
    const textColor = isSecondary ? 0xFFFFFF : GAME_CONFIG.COLORS.DARK_BROWN;

    btn.beginFill(color, 0.9);
    btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 200, 70, 15);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
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

  private closeSortPanel(): void {
    if (!this.sortPanel) return;

    const panel = this.sortPanel;
    Animator.animate(
      300,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.sortPanel = null;
        this.isOpen = false;
        this.fragmentSlots.clear();
      }
    );
  }

  update(_delta: number): void {
  }

  destroy(): void {
    eventBus.off('memorysort:open', this.handleMemorySortOpen.bind(this));
    if (this.sortPanel) {
      this.sortPanel.destroy();
    }
  }
}
