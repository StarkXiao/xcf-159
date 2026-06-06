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
    } else if (mechanism.type === 'authenticity') {
      this.showAuthenticityPanel(mechanism);
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
    } else if (data.reward === 'unlock_chapter_5') {
      Animator.delay(1500).then(() => {
        this.showChapterUnlockAnimation('第五章：真伪鉴定', '文物鉴定室已开放\n四件珍贵藏品等待你的慧眼');
      });
    } else if (data.reward === 'unlock_auth_final') {
      Animator.delay(1500).then(() => {
        this.showChapterUnlockAnimation('第五章：真伪鉴定', '珍藏密室已开放');
      });
    }
  }

  private showChapterUnlockAnimation(title: string, description?: string): void {
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

    const defaultDesc = '双馆并行调查模式已开启\n在历史馆与艺术馆间交叉取证';
    const desc = new PIXI.Text(description || defaultDesc, {
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

  private showAuthenticityPanel(mechanism: Mechanism): void {
    const relicIds = mechanism.authenticityRelicIds || [];
    const relics = relicIds.map(id => store.getAuthenticityRelicById(id)).filter(Boolean);

    const panel = new PIXI.Container();
    this.lockPanel = panel;

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    panel.addChild(overlay);

    this.renderAuthenticityMain(mechanism, relics);

    panel.alpha = 0;
    this.container.addChild(panel);

    Animator.animate(
      300,
      (progress) => {
        panel.alpha = progress;
        panel.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private renderAuthenticityMain(mechanism: Mechanism, relics: any[]): void {
    if (!this.lockPanel) return;

    while (this.lockPanel.children.length > 1) {
      this.lockPanel.removeChildAt(1);
    }

    const content = new PIXI.Container();

    const mainPanel = new PIXI.Graphics();
    mainPanel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    mainPanel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    mainPanel.drawRoundedRect(50, 150, 650, 1000, 20);
    mainPanel.endFill();
    content.addChild(mainPanel);

    const icon = new PIXI.Text('🔍', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 230;
    content.addChild(icon);

    const title = new PIXI.Text('藏品真伪鉴定', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 300;
    content.addChild(title);

    const desc = new PIXI.Text('仔细检查每件藏品，判断真伪，推导密码', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xAAAAAA,
      align: 'center'
    });
    desc.anchor.set(0.5);
    desc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    desc.y = 350;
    content.addChild(desc);

    const derivedPassword = store.getDerivedPassword();
    const passwordDisplay = new PIXI.Text(`已推导密码: ${derivedPassword || '????'}`, {
      fontFamily: 'monospace',
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      letterSpacing: 8
    });
    passwordDisplay.anchor.set(0.5);
    passwordDisplay.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    passwordDisplay.y = 400;
    content.addChild(passwordDisplay);

    const attempts = store.getAuthenticityAttempts();
    const attemptsText = new PIXI.Text(`剩余尝试次数: ${attempts.max - attempts.current}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: attempts.current >= attempts.max ? GAME_CONFIG.COLORS.WARM_ORANGE : 0x888888,
      align: 'center'
    });
    attemptsText.anchor.set(0.5);
    attemptsText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    attemptsText.y = 440;
    content.addChild(attemptsText);

    let yOffset = 490;
    relics.forEach((relic) => {
      const verified = relic.verified;
      const progress = store.getCheckPointProgress(relic.id);
      const canSubmit = store.canSubmitVerdict(relic.id);

      const relicBg = new PIXI.Graphics();
      relicBg.beginFill(verified
        ? (relic.verdict === 'genuine' ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE)
        : GAME_CONFIG.COLORS.BRONZE, 0.3);
      relicBg.lineStyle(2, verified ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.6);
      relicBg.drawRoundedRect(80, yOffset, 590, 130, 15);
      relicBg.endFill();
      content.addChild(relicBg);

      const relicIcon = new PIXI.Text(relic.icon, { fontSize: 40 });
      relicIcon.anchor.set(0.5);
      relicIcon.x = 140;
      relicIcon.y = yOffset + 65;
      content.addChild(relicIcon);

      const relicName = new PIXI.Text(relic.name, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 22,
        fill: 0xFFFFFF
      });
      relicName.x = 200;
      relicName.y = yOffset + 30;
      content.addChild(relicName);

      const statusText = verified
        ? (relic.verdict === 'genuine' ? '✓ 鉴定为真品' : '✗ 鉴定为仿品')
        : (canSubmit ? '！ 可提交鉴定' : `检查进度: ${progress}%`);
      const statusColor = verified
        ? (relic.verdict === 'genuine' ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE)
        : (canSubmit ? GAME_CONFIG.COLORS.GOLD : 0x888888);
      const relicStatus = new PIXI.Text(statusText, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 16,
        fill: statusColor
      });
      relicStatus.x = 200;
      relicStatus.y = yOffset + 65;
      content.addChild(relicStatus);

      const progressBg = new PIXI.Graphics();
      progressBg.beginFill(0x000000, 0.5);
      progressBg.drawRoundedRect(200, yOffset + 95, 300, 12, 6);
      progressBg.endFill();
      content.addChild(progressBg);

      const progressFill = new PIXI.Graphics();
      progressFill.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
      progressFill.drawRoundedRect(200, yOffset + 95, 300 * (progress / 100), 12, 6);
      progressFill.endFill();
      content.addChild(progressFill);

      const btnBg = new PIXI.Graphics();
      btnBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
      btnBg.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
      btnBg.drawRoundedRect(520, yOffset + 40, 120, 50, 10);
      btnBg.endFill();
      btnBg.eventMode = 'static';
      btnBg.cursor = 'pointer';
      content.addChild(btnBg);

      const btnText = new PIXI.Text(verified ? '查看' : '鉴定', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.DARK_BROWN
      });
      btnText.anchor.set(0.5);
      btnText.x = 580;
      btnText.y = yOffset + 65;
      content.addChild(btnText);

      btnBg.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        store.setCurrentAuthenticityRelic(relic.id);
        this.renderAuthenticityDetail(mechanism, relics, relic);
      });

      yOffset += 150;
    });

    const allVerified = relics.every(r => r.verified);
    if (allVerified && !store.isAuthenticityComplete()) {
      const passwordBtn = this.createButton('输入密码', 275, yOffset + 20);
      passwordBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.showAuthenticityPasswordInput(mechanism, relics);
      });
      content.addChild(passwordBtn);
    }

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 170;
    content.addChild(closeBtn);

    this.lockPanel.addChild(content);
  }

  private renderAuthenticityDetail(mechanism: Mechanism, relics: any[], currentRelic: any): void {
    if (!this.lockPanel) return;

    while (this.lockPanel.children.length > 1) {
      this.lockPanel.removeChildAt(1);
    }

    const content = new PIXI.Container();

    const mainPanel = new PIXI.Graphics();
    mainPanel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    mainPanel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    mainPanel.drawRoundedRect(50, 150, 650, 1000, 20);
    mainPanel.endFill();
    content.addChild(mainPanel);

    const backBtn = new PIXI.Graphics();
    backBtn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
    backBtn.drawRoundedRect(70, 170, 100, 50, 10);
    backBtn.endFill();
    backBtn.eventMode = 'static';
    backBtn.cursor = 'pointer';
    content.addChild(backBtn);

    const backText = new PIXI.Text('← 返回', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF
    });
    backText.anchor.set(0.5);
    backText.x = 120;
    backText.y = 195;
    content.addChild(backText);

    backBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      store.setCurrentAuthenticityRelic(null);
      this.renderAuthenticityMain(mechanism, relics);
    });

    const relicIcon = new PIXI.Text(currentRelic.icon, { fontSize: 80 });
    relicIcon.anchor.set(0.5);
    relicIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    relicIcon.y = 270;
    content.addChild(relicIcon);

    const relicName = new PIXI.Text(currentRelic.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    relicName.anchor.set(0.5);
    relicName.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    relicName.y = 350;
    content.addChild(relicName);

    const relicDesc = new PIXI.Text(currentRelic.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xAAAAAA,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580
    });
    relicDesc.anchor.set(0.5);
    relicDesc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    relicDesc.y = 410;
    content.addChild(relicDesc);

    const hintTitle = new PIXI.Text('鉴定要点', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    hintTitle.x = 80;
    hintTitle.y = 470;
    content.addChild(hintTitle);

    let yOffset = 510;
    currentRelic.checkPoints.forEach((cp: any) => {
      const checked = cp.checked;
      const correct = cp.correctVerdict;

      const cpBg = new PIXI.Graphics();
      cpBg.beginFill(checked
        ? (correct ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE)
        : GAME_CONFIG.COLORS.BRONZE, 0.3);
      cpBg.lineStyle(2, checked ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.AMBER, 0.6);
      cpBg.drawRoundedRect(80, yOffset, 590, 90, 10);
      cpBg.endFill();
      content.addChild(cpBg);

      const cpIcon = new PIXI.Text(cp.icon, { fontSize: 28 });
      cpIcon.anchor.set(0.5);
      cpIcon.x = 130;
      cpIcon.y = yOffset + 45;
      content.addChild(cpIcon);

      const cpName = new PIXI.Text(cp.name, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 20,
        fill: 0xFFFFFF
      });
      cpName.x = 180;
      cpName.y = yOffset + 20;
      content.addChild(cpName);

      const cpDesc = new PIXI.Text(cp.description, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: 0x888888
      });
      cpDesc.x = 180;
      cpDesc.y = yOffset + 50;
      content.addChild(cpDesc);

      if (!checked && !currentRelic.verified) {
        const genuineBtn = this.createVerdictButton('真品', 420, yOffset + 15, true);
        genuineBtn.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.checkAuthenticityPoint(mechanism, relics, currentRelic, cp, 'genuine');
        });
        content.addChild(genuineBtn);

        const fakeBtn = this.createVerdictButton('仿品', 530, yOffset + 15, false);
        fakeBtn.on('pointerdown', () => {
          audioModule.playSFX('sfx_click');
          this.checkAuthenticityPoint(mechanism, relics, currentRelic, cp, 'fake');
        });
        content.addChild(fakeBtn);
      } else if (checked) {
        const resultText = new PIXI.Text(
          correct ? '✓ 判断正确' : '✗ 判断错误',
          {
            fontFamily: GAME_CONFIG.FONTS.BODY,
            fontSize: 16,
            fill: correct ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE
          }
        );
        resultText.x = 450;
        resultText.y = yOffset + 35;
        content.addChild(resultText);
      }

      yOffset += 100;
    });

    const canSubmit = store.canSubmitVerdict(currentRelic.id);
    if (canSubmit && !currentRelic.verified) {
      const submitTitle = new PIXI.Text('最终判定', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 22,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      submitTitle.anchor.set(0.5);
      submitTitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      submitTitle.y = yOffset + 20;
      content.addChild(submitTitle);

      const finalGenuineBtn = this.createButton('判定为真品', 130, yOffset + 60);
      finalGenuineBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.submitRelicVerdict(mechanism, relics, currentRelic, 'genuine');
      });
      content.addChild(finalGenuineBtn);

      const finalFakeBtn = this.createButton('判定为仿品', 420, yOffset + 60, true);
      finalFakeBtn.on('pointerdown', () => {
        audioModule.playSFX('sfx_click');
        this.submitRelicVerdict(mechanism, relics, currentRelic, 'fake');
      });
      content.addChild(finalFakeBtn);
    } else if (currentRelic.verified) {
      const isCorrect = (currentRelic.verdict === 'genuine' && currentRelic.isGenuine) ||
                      (currentRelic.verdict === 'fake' && !currentRelic.isGenuine);
      const verdictText = new PIXI.Text(
        isCorrect
        ? `✓ 鉴定正确！${currentRelic.isGenuine ? '这是一件真品' : '这是一件仿品'}`
        : `✗ 鉴定错误！${currentRelic.isGenuine ? '这其实是真品' : '这其实是仿品'}`,
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 20,
          fill: isCorrect ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE,
          align: 'center'
        }
      );
      verdictText.anchor.set(0.5);
      verdictText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      verdictText.y = yOffset + 40;
      content.addChild(verdictText);

      const detailText = new PIXI.Text(
        currentRelic.isGenuine ? currentRelic.genuineDescription : currentRelic.fakeDescription,
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 16,
          fill: 0xAAAAAA,
          align: 'center',
          wordWrap: true,
          wordWrapWidth: 580
        }
      );
      detailText.anchor.set(0.5);
      detailText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      detailText.y = yOffset + 90;
      content.addChild(detailText);

      if (isCorrect) {
        const clueText = new PIXI.Text(`密码线索: ${currentRelic.passwordClue}`, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: GAME_CONFIG.COLORS.GOLD,
          align: 'center'
        });
        clueText.anchor.set(0.5);
        clueText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
        clueText.y = yOffset + 150;
        content.addChild(clueText);
      }
    }

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 170;
    content.addChild(closeBtn);

    this.lockPanel.addChild(content);
  }

  private createVerdictButton(text: string, x: number, y: number, isGenuine: boolean): PIXI.Graphics {
    const btn = new PIXI.Graphics();
    const color = isGenuine ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE;
    btn.beginFill(color, 0.9);
    btn.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    btn.drawRoundedRect(0, 0, 90, 60, 8);
    btn.endFill();

    const btnText = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF
    });
    btnText.anchor.set(0.5);
    btnText.x = 45;
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

  private checkAuthenticityPoint(mechanism: Mechanism, relics: any[], relic: any, checkPoint: any, verdict: 'genuine' | 'fake'): void {
    const result = store.checkAuthenticityCheckPoint(relic.id, checkPoint.id, verdict);

    if (!this.lockPanel) return;

    const hint = new PIXI.Text(
      result.correct ? '✓ 判断正确！' : '✗ 判断错误！',
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 24,
        fill: result.correct ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'center'
      }
    );
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 50;
    hint.alpha = 0;
    this.lockPanel.addChild(hint);

    const evidence = new PIXI.Text(result.evidence, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 500
    });
    evidence.anchor.set(0.5);
    evidence.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    evidence.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 20;
    evidence.alpha = 0;
    this.lockPanel.addChild(evidence);

    Animator.animate(
      300,
      (p) => { hint.alpha = p; evidence.alpha = p; },
      () => {
        Animator.delay(2000).then(() => {
          this.renderAuthenticityDetail(mechanism, relics, relic);
        });
      }
    );

    if (result.correct) {
      audioModule.playSFX('sfx_success');
    } else {
      audioModule.playSFX('sfx_error');
    }
  }

  private submitRelicVerdict(mechanism: Mechanism, relics: any[], relic: any, verdict: 'genuine' | 'fake'): void {
    const result = store.submitRelicVerdict(relic.id, verdict);

    if (!this.lockPanel) return;

    const resultIcon = new PIXI.Text(result.correct ? '🎉' : '😔', { fontSize: 80 });
    resultIcon.anchor.set(0.5);
    resultIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    resultIcon.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 100;
    resultIcon.alpha = 0;
    this.lockPanel.addChild(resultIcon);

    const resultText = new PIXI.Text(
      result.correct ? '鉴定正确！' : '鉴定错误...',
      {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 36,
        fill: result.correct ? GAME_CONFIG.COLORS.GREEN : GAME_CONFIG.COLORS.WARM_ORANGE,
        align: 'center'
      }
    );
    resultText.anchor.set(0.5);
    resultText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    resultText.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 30;
    resultText.alpha = 0;
    this.lockPanel.addChild(resultText);

    let detailTextContent = result.correct
      ? `获得密码数字: 第${result.position}位是 ${result.digit}`
      : `很遗憾，这件藏品的真伪判断有误`;
    const detailText = new PIXI.Text(detailTextContent, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 500
    });
    detailText.anchor.set(0.5);
    detailText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    detailText.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 30;
    detailText.alpha = 0;
    this.lockPanel.addChild(detailText);

    if (result.correct) {
      const clueText = new PIXI.Text(`线索: ${result.clue}`, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: GAME_CONFIG.COLORS.GOLD,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 500
      });
      clueText.anchor.set(0.5);
      clueText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      clueText.y = GAME_CONFIG.DESIGN_HEIGHT / 2 + 80;
      clueText.alpha = 0;
      this.lockPanel.addChild(clueText);

      Animator.animate(
        500,
        (p) => { resultIcon.alpha = p; resultText.alpha = p; detailText.alpha = p; clueText.alpha = p; },
        () => {
          Animator.delay(2500).then(() => {
            this.renderAuthenticityMain(mechanism, relics);
          });
        }
      );
      audioModule.playSFX('sfx_success');
      audioModule.playSFX('sfx_unlock');
    } else {
      Animator.animate(
        500,
        (p) => { resultIcon.alpha = p; resultText.alpha = p; detailText.alpha = p; },
        () => {
          Animator.delay(2000).then(() => {
            this.renderAuthenticityMain(mechanism, relics);
          });
        }
      );
      audioModule.playSFX('sfx_error');
    }
  }

  private showAuthenticityPasswordInput(mechanism: Mechanism, relics: any[]): void {
    if (!this.lockPanel) return;

    while (this.lockPanel.children.length > 1) {
      this.lockPanel.removeChildAt(1);
    }

    const content = new PIXI.Container();

    const mainPanel = new PIXI.Graphics();
    mainPanel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    mainPanel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    mainPanel.drawRoundedRect(50, 200, 650, 900, 20);
    mainPanel.endFill();
    content.addChild(mainPanel);

    const icon = new PIXI.Text('🔐', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 300;
    content.addChild(icon);

    const title = new PIXI.Text('输入最终密码', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 370;
    content.addChild(title);

    const hint = new PIXI.Text(`根据鉴定结果推导密码\n${mechanism.hint}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xAAAAAA,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 430;
    content.addChild(hint);

    const derivedPassword = store.getDerivedPassword();
    const derivedDisplay = new PIXI.Text(`已推导: ${derivedPassword}`, {
      fontFamily: 'monospace',
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      letterSpacing: 8
    });
    derivedDisplay.anchor.set(0.5);
    derivedDisplay.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    derivedDisplay.y = 490;
    content.addChild(derivedDisplay);

    const displayBg = new PIXI.Graphics();
    displayBg.beginFill(0x000000, 0.8);
    displayBg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    displayBg.drawRoundedRect(150, 540, 450, 80, 10);
    displayBg.endFill();
    content.addChild(displayBg);

    const displayText = new PIXI.Text('', {
      fontFamily: 'monospace',
      fontSize: 48,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      letterSpacing: 10
    });
    displayText.anchor.set(0.5);
    displayText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    displayText.y = 580;
    content.addChild(displayText);
    (content as any).displayText = displayText;
    this.inputValue = '';

    const startX = 150;
    const startY = 660;
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
          this.inputValue = this.inputValue.slice(0, -1);
        } else {
          if (this.inputValue.length < 4) {
            this.inputValue += num;
          }
        }
        displayText.text = this.inputValue;
      });

      btn.on('pointerover', () => {
        Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 100);
      });

      btn.on('pointerout', () => {
        Animator.tween(btn.scale, { x: 1, y: 1 }, 100);
      });

      content.addChild(btn);
    });

    const attempts = store.getAuthenticityAttempts();
    const attemptsText = new PIXI.Text(`剩余尝试: ${attempts.max - attempts.current}/${attempts.max}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: attempts.current >= attempts.max ? GAME_CONFIG.COLORS.WARM_ORANGE : 0x888888,
      align: 'center'
    });
    attemptsText.anchor.set(0.5);
    attemptsText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    attemptsText.y = 1050;
    content.addChild(attemptsText);

    const confirmBtn = this.createButton('确认', 420, 1080);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validateAuthenticityPassword(mechanism, relics);
    });
    content.addChild(confirmBtn);

    const clearBtn = this.createButton('清除', 130, 1080, true);
    clearBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.inputValue = '';
      displayText.text = '';
    });
    content.addChild(clearBtn);

    const backBtn = this.createButton('返回', 275, 1080, true);
    backBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.renderAuthenticityMain(mechanism, relics);
    });
    content.addChild(backBtn);

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 220;
    content.addChild(closeBtn);

    this.lockPanel.addChild(content);
  }

  private validateAuthenticityPassword(mechanism: Mechanism, _relics: any[]): void {
    const result = store.validateAuthenticityPassword(this.inputValue);

    if (result.correct) {
      audioModule.playSFX('sfx_success');
      audioModule.playSFX('sfx_unlock');

      if (this.lockPanel) {
        const glow = new PIXI.Graphics();
        glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
        glow.drawRoundedRect(50, 200, 650, 900, 20);
        glow.endFill();
        this.lockPanel.addChild(glow);

        Animator.animate(
          500,
          (progress) => {
            glow.clear();
            glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.4);
            glow.drawRoundedRect(50, 200, 650, 900, 20);
            glow.endFill();
          },
          () => {
            Animator.delay(1500).then(() => {
              this.showAuthenticityRewards(mechanism, result.rewards);
            });
          }
        );
      }
    } else {
      audioModule.playSFX('sfx_error');
      const attempts = store.getAuthenticityAttempts();
      if (attempts.current >= attempts.max) {
        this.showHint(`机会已用完，鉴定失败\n将重置鉴定进度`);
        Animator.delay(2000).then(() => {
          store.resetAuthenticityProgress();
          const updatedRelics = mechanism.authenticityRelicIds?.map(id => store.getAuthenticityRelicById(id)).filter(Boolean) || [];
          this.renderAuthenticityMain(mechanism, updatedRelics);
        });
      } else {
        this.showHint(`密码错误，请重试\n剩余${attempts.max - attempts.current}次机会`);
      }
      this.shakeAnimation();
    }
  }

  private showAuthenticityRewards(mechanism: Mechanism, rewards: any[]): void {
    if (!this.lockPanel) return;

    while (this.lockPanel.children.length > 1) {
      this.lockPanel.removeChildAt(1);
    }

    const content = new PIXI.Container();

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    panel.drawRoundedRect(50, 200, 650, 900, 20);
    panel.endFill();
    content.addChild(panel);

    const icon = new PIXI.Text('🏆', { fontSize: 80 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 300;
    content.addChild(icon);

    const title = new PIXI.Text('鉴定完成！', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 380;
    content.addChild(title);

    const rewardTitle = new PIXI.Text('获得奖励', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD
    });
    rewardTitle.x = 80;
    rewardTitle.y = 450;
    content.addChild(rewardTitle);

    let yOffset = 500;
    rewards.forEach((reward) => {
      const rewardBg = new PIXI.Graphics();
      rewardBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
      rewardBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.6);
      rewardBg.drawRoundedRect(80, yOffset, 590, 80, 10);
      rewardBg.endFill();
      content.addChild(rewardBg);

      const rewardIcon = new PIXI.Text(
        reward.type === 'score' ? '⭐' :
        reward.type === 'clue' ? '📜' :
        reward.type === 'unlock' ? '🔓' : '📖',
        { fontSize: 32 }
      );
      rewardIcon.anchor.set(0.5);
      rewardIcon.x = 130;
      rewardIcon.y = yOffset + 40;
      content.addChild(rewardIcon);

      const rewardDesc = new PIXI.Text(reward.description, {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 18,
        fill: 0xFFFFFF
      });
      rewardDesc.x = 180;
      rewardDesc.y = yOffset + 30;
      content.addChild(rewardDesc);

      yOffset += 100;
    });

    const closeBtn = this.createButton('完成', 275, yOffset + 20);
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeLock();
      eventBus.emit('mechanism:solve', { mechanismId: mechanism.id, reward: mechanism.reward });
    });
    content.addChild(closeBtn);

    this.lockPanel.addChild(content);
  }

  destroy(): void {
    eventBus.off('mechanism:open', this.handleMechanismOpen.bind(this));
    eventBus.off('mechanism:solve', this.handleMechanismSolve.bind(this));
    if (this.lockPanel) {
      this.lockPanel.destroy();
    }
  }
}
