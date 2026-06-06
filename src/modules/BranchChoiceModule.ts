import * as PIXI from 'pixi.js';
import { BranchChoice } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

type BranchChoiceOption = {
  id: string;
  text: string;
  consequence: string;
  leadsToEnding?: string;
  unlocksClue?: string;
  unlocksExhibition?: string;
};

export class BranchChoiceModule {
  private container: PIXI.Container;
  private choicePanel: PIXI.Container | null = null;
  private currentMechanismId: string = '';
  private isOpen: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('branchchoice:open', this.handleBranchChoiceOpen.bind(this));
  }

  private handleBranchChoiceOpen(data: { mechanismId: string; branch: BranchChoice }): void {
    if (this.isOpen) return;

    this.currentMechanismId = data.mechanismId;
    this.isOpen = true;

    this.choicePanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.choicePanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.DEEP_PURPLE, 1);
    panel.drawRoundedRect(50, 200, 650, 900, 20);
    panel.endFill();
    this.choicePanel.addChild(panel);

    const icon = new PIXI.Text('🗨️', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 270;
    this.choicePanel.addChild(icon);

    const title = new PIXI.Text(data.branch.text, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 340;
    this.choicePanel.addChild(title);

    const description = new PIXI.Text(data.branch.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xCCCCCC,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580,
      lineHeight: 36
    });
    description.anchor.set(0.5);
    description.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    description.y = 420;
    this.choicePanel.addChild(description);

    let yOffset = 520;
    data.branch.choices.forEach((choice: BranchChoiceOption, index: number) => {
      const choiceBtn = this.createChoiceButton(choice, index, yOffset);
      this.choicePanel!.addChild(choiceBtn);
      yOffset += 130;
    });

    const closeBtn = this.createCloseButton();
    closeBtn.x = 630;
    closeBtn.y = 220;
    this.choicePanel.addChild(closeBtn);

    this.choicePanel.alpha = 0;
    this.container.addChild(this.choicePanel);

    Animator.animate(
      400,
      (progress) => {
        this.choicePanel!.alpha = progress;
        this.choicePanel!.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createChoiceButton(choice: BranchChoiceOption, index: number, y: number): PIXI.Container {
    const container = new PIXI.Container();

    const btn = new PIXI.Graphics();
    btn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
    btn.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.8);
    btn.drawRoundedRect(0, 0, 550, 110, 15);
    btn.endFill();
    container.addChild(btn);

    const indexText = new PIXI.Text(`${index + 1}`, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    indexText.anchor.set(0.5);
    indexText.x = 50;
    indexText.y = 55;
    container.addChild(indexText);

    const choiceText = new PIXI.Text(choice.text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xFFFFFF,
      wordWrap: true,
      wordWrapWidth: 430
    });
    choiceText.anchor.set(0, 0.5);
    choiceText.x = 100;
    choiceText.y = 55;
    container.addChild(choiceText);

    container.x = 100;
    container.y = y;
    container.eventMode = 'static';
    container.cursor = 'pointer';

    container.on('pointerover', () => {
      btn.clear();
      btn.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
      btn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
      btn.drawRoundedRect(0, 0, 550, 110, 15);
      btn.endFill();
      Animator.tween(container.scale, { x: 1.02, y: 1.02 }, 150);
    });

    container.on('pointerout', () => {
      btn.clear();
      btn.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
      btn.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.8);
      btn.drawRoundedRect(0, 0, 550, 110, 15);
      btn.endFill();
      Animator.tween(container.scale, { x: 1, y: 1 }, 150);
    });

    container.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.makeChoice(choice.id);
    });

    return container;
  }

  private makeChoice(choiceId: string): void {
    const result = store.submitBranchChoice(this.currentMechanismId, choiceId);

    if (result.success) {
      audioModule.playSFX('sfx_success');
      this.showChoiceResult(result.consequence || '选择已确认');
    } else {
      audioModule.playSFX('sfx_error');
      this.showHint(result.reason || '选择失败，请重试');
    }
  }

  private showChoiceResult(consequence: string): void {
    if (!this.choicePanel) return;

    while (this.choicePanel.children.length > 1) {
      this.choicePanel.removeChildAt(1);
    }

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(50, 200, 650, 900, 20);
    panel.endFill();
    this.choicePanel.addChild(panel);

    const icon = new PIXI.Text('✨', { fontSize: 80 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 320;
    this.choicePanel.addChild(icon);

    const title = new PIXI.Text('选择已做出', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 400;
    this.choicePanel.addChild(title);

    const consequenceText = new PIXI.Text(consequence, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580,
      lineHeight: 40
    });
    consequenceText.anchor.set(0.5);
    consequenceText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    consequenceText.y = 520;
    this.choicePanel.addChild(consequenceText);

    const continueBtn = this.createButton('继续', 275, 750);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeChoicePanel();
    });
    this.choicePanel.addChild(continueBtn);

    const glow = new PIXI.Graphics();
    glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
    glow.drawRoundedRect(50, 200, 650, 900, 20);
    glow.endFill();
    this.choicePanel.addChild(glow);

    Animator.animate(
      500,
      (progress) => {
        glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.2);
        glow.clear();
        glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.2);
        glow.drawRoundedRect(50, 200, 650, 900, 20);
        glow.endFill();
      }
    );

    for (let i = 0; i < 15; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(GAME_CONFIG.COLORS.GOLD, 0.8);
      particle.drawCircle(0, 0, 3 + Math.random() * 3);
      particle.endFill();
      particle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      particle.y = 550;
      this.choicePanel.addChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
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

  private showHint(text: string): void {
    if (!this.choicePanel) return;

    const hint = new PIXI.Text(text, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center'
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = GAME_CONFIG.DESIGN_HEIGHT / 2 - 50;
    hint.alpha = 0;
    this.choicePanel.addChild(hint);

    Animator.animate(
      300,
      (progress) => { hint.alpha = progress; },
      () => {
        Animator.delay(2000).then(() => {
          Animator.animate(300, (p) => { hint.alpha = 1 - p; }, () => {
            this.choicePanel?.removeChild(hint);
            hint.destroy();
          });
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
      this.closeChoicePanel();
    });

    return btn;
  }

  private closeChoicePanel(): void {
    if (!this.choicePanel) return;

    const panel = this.choicePanel;
    Animator.animate(
      300,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.choicePanel = null;
        this.isOpen = false;
      }
    );
  }

  update(_delta: number): void {
  }

  destroy(): void {
    eventBus.off('branchchoice:open', this.handleBranchChoiceOpen.bind(this));
    if (this.choicePanel) {
      this.choicePanel.destroy();
    }
  }
}
