import * as PIXI from 'pixi.js';
import { Mechanism } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class MechanismModule {
  private container: PIXI.Container;
  private lockPanel: PIXI.Container | null = null;
  private currentMechanism: Mechanism | null = null;
  private inputValue: string = '';
  private sequenceInput: number[] = [];
  private isOpen: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('mechanism:open', this.handleMechanismOpen.bind(this));
    eventBus.on('mechanism:solve', this.handleMechanismSolve.bind(this));
  }

  private handleMechanismOpen(data: { mechanismId: string }): void {
    if (this.isOpen) return;
    const mechanism = store.getMechanismById(data.mechanismId);
    if (!mechanism || mechanism.solved) return;

    this.currentMechanism = mechanism;
    this.inputValue = '';
    this.sequenceInput = [];
    this.isOpen = true;

    if (mechanism.type === 'password') {
      this.showPasswordLock(mechanism);
    } else if (mechanism.type === 'sequence') {
      this.showSequenceLock(mechanism);
    } else if (mechanism.type === 'restoration') {
      this.isOpen = false;
      eventBus.emit('restoration:open', { mechanismId: data.mechanismId });
    } else if (mechanism.type === 'linked') {
      this.showLinkedLock(mechanism);
    }
  }

  private handleMechanismSolve(data: { mechanismId: string; reward: string }): void {
    if (data.reward === 'ending') {
      Animator.delay(1500).then(() => {
        eventBus.emit('game:complete');
      });
    } else if (data.reward === 'unlock_chapter_4') {
      Animator.delay(1500).then(() => {
        store.startDualHallInvestigation();
        this.showChapterUnlockAnimation('第四章：双馆并行调查');
      });
    } else if (data.reward === 'unlock_phase_2') {
      Animator.delay(1000).then(() => {
        this.showPhaseUnlockAnimation('第二阶段解锁', '礼乐厅与时光画廊已开放');
      });
    } else if (data.reward === 'unlock_phase_3') {
      Animator.delay(1000).then(() => {
        this.showPhaseUnlockAnimation('第三阶段解锁', '匠作坊与创作室已开放');
      });
    } else if (data.reward === 'chapter_4_complete') {
      Animator.delay(1500).then(() => {
        eventBus.emit('game:complete');
      });
    }
  }

  private showChapterUnlockAnimation(title: string): void {
    const panel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    panel.addChild(overlay);

    const icon = new PIXI.Text('🏛️', { fontSize: 80 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 100;
    panel.addChild(icon);

    const titleText = new PIXI.Text(title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    titleText.anchor.set(0.5);
    titleText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleText.y = GAME_CONFIG.DESIGN_HEIGHT / 2;
    panel.addChild(titleText);

    const desc = new PIXI.Text('双馆并行调查模式已开启\n在历史馆与艺术馆间交叉取证', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center',
      lineHeight: 36
    });
    desc.anchor.set(0.5);
    desc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    desc.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 80;
    panel.addChild(desc);

    panel.alpha = 0;
    this.container.addChild(panel);

    Animator.animate(
      500,
      (p) => { panel.alpha = p; },
      () => {
        Animator.delay(3000).then(() => {
          Animator.animate(
            500,
            (p) => { panel.alpha = 1 - p; },
            () => {
              this.container.removeChild(panel);
              panel.destroy();
              store.setCurrentExhibition('exhibition_history_1');
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  private showPhaseUnlockAnimation(title: string, desc: string): void {
    const panel = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.85);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();
    panel.addChild(bg);

    const icon = new PIXI.Text('🔓', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 60;
    panel.addChild(icon);

    const titleText = new PIXI.Text(title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    titleText.anchor.set(0.5);
    titleText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleText.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 20;
    panel.addChild(titleText);

    const descText = new PIXI.Text(desc, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xFFFFFF,
      align: 'center'
    });
    descText.anchor.set(0.5);
    descText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    descText.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 80;
    panel.addChild(descText);

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

  private showPasswordLock(mechanism: Mechanism): void {
    this.lockPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.lockPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.DEEP_PURPLE, 1);
    panel.drawRoundedRect(50, 250, 650, 850, 20);
    panel.endFill();
    this.lockPanel.addChild(panel);

    const icon = new PIXI.Text('🔒', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 330;
    this.lockPanel.addChild(icon);

    const title = new PIXI.Text(mechanism.displayName, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 410;
    this.lockPanel.addChild(title);

    const hint = new PIXI.Text(`提示: ${mechanism.hint}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xAAAAAA,
      align: 'center'
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 470;
    this.lockPanel.addChild(hint);

    const displayBg = new PIXI.Graphics();
    displayBg.beginFill(0x000000, 0.8);
    displayBg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    displayBg.drawRoundedRect(150, 520, 450, 80, 10);
    displayBg.endFill();
    this.lockPanel.addChild(displayBg);

    const displayText = new PIXI.Text('', {
      fontFamily: 'monospace',
      fontSize: 48,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      letterSpacing: 10
    });
    displayText.anchor.set(0.5);
    displayText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    displayText.y = 560;
    this.lockPanel.addChild(displayText);
    (this.lockPanel as any).displayText = displayText;

    this.createNumberPad();

    const confirmBtn = this.createButton('确认', 420, 1000);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validatePassword();
    });
    this.lockPanel.addChild(confirmBtn);

    const clearBtn = this.createButton('清除', 130, 1000, true);
    clearBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.clearInput();
    });
    this.lockPanel.addChild(clearBtn);

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 270;
    this.lockPanel.addChild(closeBtn);

    this.lockPanel.alpha = 0;
    this.container.addChild(this.lockPanel);

    Animator.animate(
      300,
      (progress) => {
        this.lockPanel!.alpha = progress;
        this.lockPanel!.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createNumberPad(): void {
    const startX = 150;
    const startY = 640;
    const btnSize = 110;
    const gap = 25;

    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'];

    numbers.forEach((num, index) => {
      if (num === '') return;

      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);

      const btn = new PIXI.Graphics();
      btn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
      btn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
      btn.drawRoundedRect(0, 0, btnSize, btnSize, 12);
      btn.endFill();

      const btnText = new PIXI.Text(num, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 36,
        fill: 0xFFFFFF
      });
      btnText.anchor.set(0.5);
      btnText.x = btnSize / 2;
      btnText.y = btnSize / 2;
      btn.addChild(btnText);

      btn.x = x;
      btn.y = y;
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        if (num === '←') {
          this.backspaceInput();
        } else {
          this.addToInput(num);
        }
      });

      btn.on('pointerover', () => {
        Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 100);
      });

      btn.on('pointerout', () => {
        Animator.tween(btn.scale, { x: 1, y: 1 }, 100);
      });

      this.lockPanel!.addChild(btn);
    });
  }

  private showSequenceLock(mechanism: Mechanism): void {
    this.lockPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.lockPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.DEEP_PURPLE, 1);
    panel.drawRoundedRect(50, 250, 650, 850, 20);
    panel.endFill();
    this.lockPanel.addChild(panel);

    const icon = new PIXI.Text('🔮', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 330;
    this.lockPanel.addChild(icon);

    const title = new PIXI.Text(mechanism.displayName, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 410;
    this.lockPanel.addChild(title);

    const hint = new PIXI.Text(`提示: ${mechanism.hint}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xAAAAAA,
      align: 'center'
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 470;
    this.lockPanel.addChild(hint);

    const slotContainer = new PIXI.Container();
    slotContainer.y = 530;
    this.lockPanel.addChild(slotContainer);

    const answer = mechanism.answer as number[];
    const slotSize = 120;
    const gap = 20;
    const startX = (650 - (answer.length * slotSize + (answer.length - 1) * gap)) / 2;

    for (let i = 0; i < answer.length; i++) {
      const slot = new PIXI.Graphics();
      slot.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.6);
      slot.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
      slot.drawRoundedRect(0, 0, slotSize, slotSize, 10);
      slot.endFill();
      slot.x = startX + i * (slotSize + gap);
      slotContainer.addChild(slot);
    }

    const fragmentContainer = new PIXI.Container();
    fragmentContainer.y = 700;
    this.lockPanel.addChild(fragmentContainer);

    const fragments = ['📜', '💎', '🏥'];
    fragments.forEach((emoji, index) => {
      const btn = new PIXI.Graphics();
      btn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
      btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
      btn.drawRoundedRect(0, 0, slotSize, slotSize, 10);
      btn.endFill();

      const icon = new PIXI.Text(emoji, { fontSize: 48 });
      icon.anchor.set(0.5);
      icon.x = slotSize / 2;
      icon.y = slotSize / 2;
      btn.addChild(icon);

      btn.x = startX + index * (slotSize + gap);
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.addSequenceInput(index + 1, emoji, slotContainer, startX, slotSize, gap);
      });

      fragmentContainer.addChild(btn);
    });

    const confirmBtn = this.createButton('确认', 420, 1000);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validateSequence();
    });
    this.lockPanel.addChild(confirmBtn);

    const clearBtn = this.createButton('清除', 130, 1000, true);
    clearBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.clearSequence(slotContainer);
    });
    this.lockPanel.addChild(clearBtn);

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 270;
    this.lockPanel.addChild(closeBtn);

    this.lockPanel.alpha = 0;
    this.container.addChild(this.lockPanel);

    Animator.animate(
      300,
      (progress) => {
        this.lockPanel!.alpha = progress;
        this.lockPanel!.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private addSequenceInput(num: number, emoji: string, slotContainer: PIXI.Container, startX: number, slotSize: number, gap: number): void {
    const answer = this.currentMechanism?.answer as number[];
    if (this.sequenceInput.length >= answer.length) return;

    this.sequenceInput.push(num);
    const index = this.sequenceInput.length - 1;

    const icon = new PIXI.Text(emoji, { fontSize: 48 });
    icon.anchor.set(0.5);
    icon.x = startX + index * (slotSize + gap) + slotSize / 2;
    icon.y = slotSize / 2;
    icon.alpha = 0;
    slotContainer.addChild(icon);

    Animator.animate(
      200,
      (p) => { icon.alpha = p; icon.scale.set(0.5 + p * 0.5); }
    );

    audioModule.playSFX('sfx_collect');
  }

  private clearSequence(slotContainer: PIXI.Container): void {
    this.sequenceInput = [];
    for (let i = slotContainer.children.length - 1; i > 2; i--) {
      slotContainer.removeChildAt(i);
    }
    audioModule.playSFX('sfx_click');
  }

  private addToInput(char: string): void {
    if (this.inputValue.length >= 6) return;
    this.inputValue += char;
    this.updateDisplay();
    audioModule.playSFX('sfx_collect');
  }

  private backspaceInput(): void {
    if (this.inputValue.length > 0) {
      this.inputValue = this.inputValue.slice(0, -1);
      this.updateDisplay();
      audioModule.playSFX('sfx_click');
    }
  }

  private clearInput(): void {
    this.inputValue = '';
    this.updateDisplay();
    audioModule.playSFX('sfx_click');
  }

  private updateDisplay(): void {
    if (this.lockPanel && (this.lockPanel as any).displayText) {
      let display = this.inputValue;
      while (display.length < 6) {
        display += '·';
      }
      (this.lockPanel as any).displayText.text = display;
    }
  }

  private validatePassword(): void {
    if (!this.currentMechanism) return;

    const answer = this.currentMechanism.answer as string;
    if (this.inputValue === answer) {
      this.onSuccess();
    } else {
      this.onError();
    }
  }

  private validateSequence(): void {
    if (!this.currentMechanism) return;

    const answer = this.currentMechanism.answer as number[];
    if (this.sequenceInput.length !== answer.length) {
      this.showHint('请输入完整的顺序');
      audioModule.playSFX('sfx_error');
      return;
    }

    const isCorrect = this.sequenceInput.every((val, idx) => val === answer[idx]);
    if (isCorrect) {
      this.onSuccess();
    } else {
      this.onError();
    }
  }

  private onSuccess(): void {
    audioModule.playSFX('sfx_success');
    audioModule.playSFX('sfx_unlock');

    if (this.currentMechanism) {
      if (this.currentMechanism.isLinked) {
        store.solveLinkedMechanism(this.currentMechanism.id);
      } else {
        store.solveMechanism(this.currentMechanism.id);
      }
    }

    if (this.lockPanel) {
      const glow = new PIXI.Graphics();
      glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
      glow.drawRoundedRect(50, 250, 650, 850, 20);
      glow.endFill();
      this.lockPanel.addChild(glow);

      Animator.animate(
        500,
        (progress) => {
          glow.clear();
          glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.4);
          glow.drawRoundedRect(50, 250, 650, 850, 20);
          glow.endFill();
        },
        () => {
          Animator.delay(1000).then(() => {
            this.closeLock();
          });
        }
      );
    }
  }

  private onError(): void {
    audioModule.playSFX('sfx_error');
    this.showHint('密码错误，请重试');
    this.shakeAnimation();
  }

  private showHint(text: string): void {
    if (!this.lockPanel) return;

    const existingHint = this.lockPanel.getChildByName('errorHint');
    if (existingHint) {
      this.lockPanel.removeChild(existingHint);
      existingHint.destroy();
    }

    const hint = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center'
    });
    hint.name = 'errorHint';
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 490;
    hint.alpha = 0;
    this.lockPanel.addChild(hint);

    Animator.animate(
      300,
      (progress) => { hint.alpha = progress; },
      () => {
        Animator.delay(2000).then(() => {
          Animator.animate(300, (p) => { hint.alpha = 1 - p; }, () => {
            if (hint.parent) {
              hint.parent.removeChild(hint);
              hint.destroy();
            }
          });
        });
      }
    );
  }

  private shakeAnimation(): void {
    if (!this.lockPanel) return;

    const panel = this.lockPanel;
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

  private createCloseButton(): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    btn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
    btn.drawCircle(25, 25, 22);
    btn.endFill();

    const icon = new PIXI.Text('✕', {
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    icon.anchor.set(0.5);
    icon.x = 25;
    icon.y = 25;
    btn.addChild(icon);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeLock();
    });

    return btn;
  }

  private closeLock(): void {
    if (!this.lockPanel) return;

    const panel = this.lockPanel;
    Animator.animate(
      300,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.lockPanel = null;
        this.isOpen = false;
        this.currentMechanism = null;
      }
    );
  }

  update(_delta: number): void {
    // Update animations if needed
  }

  private showLinkedLock(mechanism: Mechanism): void {
    const lockPanel = new PIXI.Container();
    this.lockPanel = lockPanel;

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    lockPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(50, 200, 650, 900, 20);
    panel.endFill();
    lockPanel.addChild(panel);

    const icon = new PIXI.Text('🔗', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 280;
    lockPanel.addChild(icon);

    const title = new PIXI.Text(mechanism.displayName, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 350;
    lockPanel.addChild(title);

    const hint = new PIXI.Text(`提示: ${mechanism.hint}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xAAAAAA,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 400;
    lockPanel.addChild(hint);

    const progress = store.getLinkedMechanismProgress(mechanism.id);
    const reqHistory = mechanism.requiredHistoryClues || [];
    const reqArt = mechanism.requiredArtClues || [];

    const progressBg = new PIXI.Graphics();
    progressBg.beginFill(0x000000, 0.5);
    progressBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
    progressBg.drawRoundedRect(100, 440, 550, 30, 10);
    progressBg.endFill();
    lockPanel.addChild(progressBg);

    const progressFill = new PIXI.Graphics();
    progressFill.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
    progressFill.drawRoundedRect(100, 440, 550 * (progress / 100), 30, 10);
    progressFill.endFill();
    lockPanel.addChild(progressFill);

    const progressText = new PIXI.Text(`联动进度: ${progress}%`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF
    });
    progressText.anchor.set(0.5);
    progressText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    progressText.y = 455;
    lockPanel.addChild(progressText);

    let yOffset = 500;

    const historyTitle = new PIXI.Text('📜 历史馆线索', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.BRONZE
    });
    historyTitle.x = 100;
    historyTitle.y = yOffset;
    lockPanel.addChild(historyTitle);
    yOffset += 40;

    reqHistory.forEach(clueId => {
      const clue = store.getClueById(clueId);
      const collected = store.getState().collectedClues.includes(clueId);
      const clueText = new PIXI.Text(
        `${collected ? '✓' : '○'} ${clue?.name || clueId}`,
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: collected ? GAME_CONFIG.COLORS.GOLD : 0x888888
        }
      );
      clueText.x = 120;
      clueText.y = yOffset;
      lockPanel.addChild(clueText);
      yOffset += 30;
    });

    yOffset += 20;

    const artTitle = new PIXI.Text('🎨 艺术馆线索', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    artTitle.x = 100;
    artTitle.y = yOffset;
    lockPanel.addChild(artTitle);
    yOffset += 40;

    reqArt.forEach(clueId => {
      const clue = store.getClueById(clueId);
      const collected = store.getState().collectedClues.includes(clueId);
      const clueText = new PIXI.Text(
        `${collected ? '✓' : '○'} ${clue?.name || clueId}`,
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: collected ? GAME_CONFIG.COLORS.GOLD : 0x888888
        }
      );
      clueText.x = 120;
      clueText.y = yOffset;
      lockPanel.addChild(clueText);
      yOffset += 30;
    });

    const canSolve = store.canSolveLinkedMechanism(mechanism.id);

    if (canSolve) {
      if (typeof mechanism.answer === 'string') {
        this.createPasswordInput(yOffset + 20, lockPanel);
      } else if (Array.isArray(mechanism.answer)) {
        this.createSequenceInput(yOffset + 20, mechanism.answer as number[], lockPanel);
      }
    } else {
      const lockedText = new PIXI.Text('需要收集齐所有线索后才能解锁', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'center'
      });
      lockedText.anchor.set(0.5);
      lockedText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      lockedText.y = yOffset + 40;
      lockPanel.addChild(lockedText);
    }

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 220;
    lockPanel.addChild(closeBtn);

    lockPanel.alpha = 0;
    this.container.addChild(lockPanel);

    Animator.animate(
      300,
      (progress) => {
        lockPanel.alpha = progress;
        lockPanel.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createPasswordInput(y: number, lockPanel: PIXI.Container): void {
    const displayBg = new PIXI.Graphics();
    displayBg.beginFill(0x000000, 0.8);
    displayBg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    displayBg.drawRoundedRect(150, y, 450, 70, 10);
    displayBg.endFill();
    lockPanel.addChild(displayBg);

    const displayText = new PIXI.Text('', {
      fontFamily: 'monospace',
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      letterSpacing: 10
    });
    displayText.anchor.set(0.5);
    displayText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    displayText.y = y + 35;
    lockPanel.addChild(displayText);
    (lockPanel as any).displayText = displayText;

    this.createMiniNumberPad(y + 90, lockPanel);

    const confirmBtn = this.createButton('确认', 420, y + 320);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validatePassword();
    });
    lockPanel.addChild(confirmBtn);

    const clearBtn = this.createButton('清除', 130, y + 320, true);
    clearBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.clearInput();
    });
    lockPanel.addChild(clearBtn);
  }

  private createMiniNumberPad(startY: number, lockPanel: PIXI.Container): void {
    const startX = 150;
    const btnSize = 90;
    const gap = 20;
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'];

    numbers.forEach((num, index) => {
      if (num === '') return;
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * (btnSize + gap);
      const y = startY + row * (btnSize + gap);

      const btn = new PIXI.Graphics();
      btn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
      btn.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
      btn.drawRoundedRect(0, 0, btnSize, btnSize, 12);
      btn.endFill();

      const btnText = new PIXI.Text(num, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 32,
        fill: 0xFFFFFF
      });
      btnText.anchor.set(0.5);
      btnText.x = btnSize / 2;
      btnText.y = btnSize / 2;
      btn.addChild(btnText);

      btn.x = x;
      btn.y = y;
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        if (num === '←') {
          this.backspaceInput();
        } else {
          this.addToInput(num);
        }
      });

      lockPanel.addChild(btn);
    });
  }

  private createSequenceInput(y: number, answer: number[], lockPanel: PIXI.Container): void {
    const slotContainer = new PIXI.Container();
    slotContainer.y = y;
    lockPanel.addChild(slotContainer);

    const slotSize = 100;
    const gap = 20;
    const startX = (650 - (answer.length * slotSize + (answer.length - 1) * gap)) / 2 + 50;

    for (let i = 0; i < answer.length; i++) {
      const slot = new PIXI.Graphics();
      slot.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.6);
      slot.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
      slot.drawRoundedRect(0, 0, slotSize, slotSize, 10);
      slot.endFill();
      slot.x = startX + i * (slotSize + gap);
      slotContainer.addChild(slot);
    }

    const fragmentContainer = new PIXI.Container();
    fragmentContainer.y = y + 140;
    lockPanel.addChild(fragmentContainer);

    const fragments = ['📜', '💎', '🏥', '📖'];
    fragments.slice(0, answer.length).forEach((emoji, index) => {
      const btn = new PIXI.Graphics();
      btn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
      btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
      btn.drawRoundedRect(0, 0, slotSize, slotSize, 10);
      btn.endFill();

      const icon = new PIXI.Text(emoji, { fontSize: 40 });
      icon.anchor.set(0.5);
      icon.x = slotSize / 2;
      icon.y = slotSize / 2;
      btn.addChild(icon);

      btn.x = startX + index * (slotSize + gap);
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.addSequenceInput(index + 1, emoji, slotContainer, startX, slotSize, gap);
      });

      fragmentContainer.addChild(btn);
    });

    const confirmBtn = this.createButton('确认', 420, y + 280);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validateSequence();
    });
    lockPanel.addChild(confirmBtn);

    const clearBtn = this.createButton('清除', 130, y + 280, true);
    clearBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.clearSequence(slotContainer);
    });
    lockPanel.addChild(clearBtn);
  }

  destroy(): void {
    eventBus.off('mechanism:open', this.handleMechanismOpen.bind(this));
    eventBus.off('mechanism:solve', this.handleMechanismSolve.bind(this));
    if (this.lockPanel) {
      this.lockPanel.destroy();
    }
  }
}
