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
    }
  }

  private handleMechanismSolve(data: { mechanismId: string; reward: string }): void {
    if (data.reward === 'ending') {
      Animator.delay(1500).then(() => {
        eventBus.emit('game:complete');
      });
    }
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
      store.solveMechanism(this.currentMechanism.id);
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

  destroy(): void {
    eventBus.off('mechanism:open', this.handleMechanismOpen.bind(this));
    eventBus.off('mechanism:solve', this.handleMechanismSolve.bind(this));
    if (this.lockPanel) {
      this.lockPanel.destroy();
    }
  }
}
