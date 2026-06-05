import * as PIXI from 'pixi.js';
import { Clue } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class MemoryModule {
  private container: PIXI.Container;
  private puzzlePanel: PIXI.Container | null = null;
  private fragments: Clue[] = [];
  private arrangedIds: string[] = [];
  private dragging: PIXI.Container | null = null;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private fragmentSlots: Map<string, PIXI.Container> = new Map();
  private isOpen: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('chapter:complete', this.handleChapterComplete.bind(this));
  }

  private handleChapterComplete(data: { chapterId: string }): void {
    Animator.delay(1500).then(() => {
      this.showMemoryPuzzle(data.chapterId);
    });
  }

  showMemoryPuzzle(chapterId: string): void {
    if (this.isOpen) return;

    this.fragments = store.getMemoryFragments(chapterId);
    if (this.fragments.length === 0) return;

    this.isOpen = true;
    this.arrangedIds = [];
    this.shuffleFragments();

    this.puzzlePanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.puzzlePanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(25, 150, 700, 1000, 20);
    panel.endFill();
    this.puzzlePanel.addChild(panel);

    const title = new PIXI.Text('记忆拼接', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 220;
    this.puzzlePanel.addChild(title);

    const subtitle = new PIXI.Text('将记忆碎片按正确顺序排列', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xCCCCCC,
      align: 'center'
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 280;
    this.puzzlePanel.addChild(subtitle);

    this.createSlots();
    this.createFragmentCards();

    const confirmBtn = this.createButton('验证顺序', 400, 1050);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validateOrder();
    });
    this.puzzlePanel.addChild(confirmBtn);

    const skipBtn = this.createButton('稍后再说', 150, 1050, true);
    skipBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closePuzzle();
    });
    this.puzzlePanel.addChild(skipBtn);

    this.puzzlePanel.alpha = 0;
    this.container.addChild(this.puzzlePanel);

    Animator.animate(
      400,
      (progress) => {
        this.puzzlePanel!.alpha = progress;
        this.puzzlePanel!.scale.set(0.9 + progress * 0.1);
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
    const slotY = 380;
    const slotSize = 200;
    const gap = 30;
    const startX = (GAME_CONFIG.DESIGN_WIDTH - (this.fragments.length * slotSize + (this.fragments.length - 1) * gap)) / 2;

    for (let i = 0; i < this.fragments.length; i++) {
      const slot = new PIXI.Graphics();
      slot.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.5);
      slot.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
      slot.drawRoundedRect(0, 0, slotSize, slotSize, 15);
      slot.endFill();

      const slotNum = new PIXI.Text(`${i + 1}`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 48,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      slotNum.alpha = 0.5;
      slotNum.anchor.set(0.5);
      slotNum.x = slotSize / 2;
      slotNum.y = slotSize / 2;
      slot.addChild(slotNum);

      slot.x = startX + i * (slotSize + gap);
      slot.y = slotY;
      this.puzzlePanel!.addChild(slot);
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
      this.puzzlePanel!.addChild(card);
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

    const glow = new PIXI.Graphics();
    glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
    glow.drawRoundedRect(0, 0, size, size, 12);
    glow.endFill();
    container.addChild(glow);
    (container as any).glow = glow;

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
    this.puzzlePanel!.addChild(card);
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

    const isCorrect = store.checkMemoryOrder(orderedIds);

    if (isCorrect) {
      audioModule.playSFX('sfx_success');
      this.showSuccessEffect();
    } else {
      audioModule.playSFX('sfx_error');
      this.showHint('顺序不正确，请重新排列');
      this.shakeAnimation();
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
    this.puzzlePanel!.addChild(hint);

    Animator.animate(
      300,
      (progress) => { hint.alpha = progress; },
      () => {
        Animator.delay(1500).then(() => {
          Animator.animate(300, (p) => { hint.alpha = 1 - p; }, () => {
            this.puzzlePanel?.removeChild(hint);
            hint.destroy();
          });
        });
      }
    );
  }

  private shakeAnimation(): void {
    const panel = this.puzzlePanel;
    if (!panel) return;

    const originalX = panel.x;
    const shake = () => {
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
    };
    shake();
  }

  private showSuccessEffect(): void {
    eventBus.emit('memory:complete', { success: true });

    const glow = new PIXI.Graphics();
    glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
    glow.drawRoundedRect(25, 150, 700, 1000, 20);
    glow.endFill();
    this.puzzlePanel!.addChild(glow);

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
        Animator.delay(1000).then(() => {
          this.showStoryText();
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
      this.puzzlePanel!.addChild(particle);

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

  private showStoryText(): void {
    const chapter = store.getCurrentChapter();
    if (!chapter) return;

    this.puzzlePanel?.removeChildren();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.puzzlePanel!.addChild(overlay);

    const title = new PIXI.Text('记忆苏醒', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 48,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 350;
    title.alpha = 0;
    this.puzzlePanel!.addChild(title);

    Animator.animate(
      1000,
      (p) => { title.alpha = p; },
      () => {
        Animator.delay(500).then(() => {
          const story = new PIXI.Text(chapter.storyText, {
            fontFamily: GAME_CONFIG.FONTS.BODY,
            fontSize: 26,
            fill: 0xFFFFFF,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 600,
            lineHeight: 42
          });
          story.anchor.set(0.5);
          story.x = GAME_CONFIG.DESIGN_WIDTH / 2;
          story.y = 550;
          story.alpha = 0;
          this.puzzlePanel!.addChild(story);

          Animator.animate(
            1500,
            (p) => { story.alpha = p; },
            () => {
              Animator.delay(2000).then(() => {
                const continueBtn = this.createButton('继续', 250, 850);
                continueBtn.on('pointerdown', () => {
                  audioModule.playSFX('sfx_click');
                  this.closePuzzle();
                });
                this.puzzlePanel!.addChild(continueBtn);
              });
            }
          );
        });
      }
    );
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

  private closePuzzle(): void {
    if (!this.puzzlePanel) return;

    const panel = this.puzzlePanel;
    Animator.animate(
      300,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.puzzlePanel = null;
        this.isOpen = false;
        this.fragmentSlots.clear();
      }
    );
  }

  update(_delta: number): void {
    // Update animations if needed
  }

  destroy(): void {
    eventBus.off('chapter:complete', this.handleChapterComplete.bind(this));
    if (this.puzzlePanel) {
      this.puzzlePanel.destroy();
    }
  }
}
