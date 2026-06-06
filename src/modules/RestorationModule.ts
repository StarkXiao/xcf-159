import * as PIXI from 'pixi.js';
import { Mechanism, Relic, RestorationStep, RestorationMaterial } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class RestorationModule {
  private container: PIXI.Container;
  private restorationPanel: PIXI.Container | null = null;
  private currentMechanism: Mechanism | null = null;
  private currentRelic: Relic | null = null;
  private stepInput: number[] = [];
  private stepSlots: PIXI.Container[] = [];
  private isOpen: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('restoration:open', this.handleRestorationOpen.bind(this));
    eventBus.on('restoration:complete', this.handleRestorationComplete.bind(this));
  }

  private handleRestorationOpen(data: { mechanismId: string }): void {
    if (this.isOpen) return;
    const mechanism = store.getMechanismById(data.mechanismId);
    if (!mechanism || mechanism.solved || mechanism.type !== 'restoration') return;
    if (!mechanism.relicId) return;

    const relic = store.getRelicById(mechanism.relicId);
    if (!relic) return;

    const restorationState = store.getRestorationState();
    const collectedMaterials = restorationState.collectedMaterials;
    const requiredMaterialIds = relic.steps.map(s => s.materialId);
    const hasAllMaterials = requiredMaterialIds.every(id => collectedMaterials.includes(id));

    if (!hasAllMaterials) {
      this.showMaterialWarning();
      return;
    }

    this.currentMechanism = mechanism;
    this.currentRelic = relic;
    this.stepInput = [];
    this.isOpen = true;

    this.showRestorationPanel(mechanism, relic);
  }

  private handleRestorationComplete(_data: { relicId: string }): void {
    Animator.delay(1500).then(() => {
      eventBus.emit('exhibition:unlock', { exhibitionId: 'exhibition_7' });
    });
  }

  private showMaterialWarning(): void {
    const warning = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.85);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    warning.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.WARM_ORANGE, 1);
    panel.drawRoundedRect(75, 450, 600, 350, 20);
    panel.endFill();
    warning.addChild(panel);

    const icon = new PIXI.Text('⚠️', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 520;
    warning.addChild(icon);

    const title = new PIXI.Text('材料不足', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 590;
    warning.addChild(title);

    const desc = new PIXI.Text('请先收集所有修复材料，\n才能开始修复工作。', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xFFFFFF,
      align: 'center'
    });
    desc.anchor.set(0.5);
    desc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    desc.y = 660;
    warning.addChild(desc);

    const confirmBtn = this.createButton('知道了', GAME_CONFIG.DESIGN_WIDTH / 2 - 125, 730);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.container.removeChild(warning);
      warning.destroy();
    });
    warning.addChild(confirmBtn);

    this.container.addChild(warning);
  }

  private showRestorationPanel(mechanism: Mechanism, relic: Relic): void {
    this.restorationPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.9);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.restorationPanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(25, 50, 700, 1230, 20);
    panel.endFill();
    this.restorationPanel.addChild(panel);

    const titleIcon = new PIXI.Text('🔧', { fontSize: 56 });
    titleIcon.anchor.set(0.5);
    titleIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    titleIcon.y = 120;
    this.restorationPanel.addChild(titleIcon);

    const title = new PIXI.Text(mechanism.displayName, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 180;
    this.restorationPanel.addChild(title);

    const hint = new PIXI.Text(`提示: ${mechanism.hint}`, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xAAAAAA,
      align: 'center'
    });
    hint.anchor.set(0.5);
    hint.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    hint.y = 220;
    this.restorationPanel.addChild(hint);

    this.createRelicDisplay(relic, 260);
    this.createRelicDescription(relic, 460);
    this.createStepSlots(relic.steps, 580);
    this.createMaterialButtons(relic.steps, 820);

    const confirmBtn = this.createButton('确认修复', 420, 1180);
    confirmBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.validateRestoration();
    });
    this.restorationPanel.addChild(confirmBtn);

    const clearBtn = this.createButton('重置', 130, 1180, true);
    clearBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.clearSteps();
    });
    this.restorationPanel.addChild(clearBtn);

    const closeBtn = this.createCloseButton();
    closeBtn.x = 640;
    closeBtn.y = 70;
    this.restorationPanel.addChild(closeBtn);

    this.restorationPanel.alpha = 0;
    this.container.addChild(this.restorationPanel);

    Animator.animate(
      300,
      (progress) => {
        this.restorationPanel!.alpha = progress;
        this.restorationPanel!.scale.set(0.95 + progress * 0.05);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private createRelicDisplay(relic: Relic, y: number): void {
    if (!this.restorationPanel) return;

    const relicContainer = new PIXI.Container();
    relicContainer.y = y;

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BG, 0.8);
    bg.lineStyle(3, GAME_CONFIG.COLORS.BRONZE, 0.8);
    bg.drawRoundedRect(175, 0, 350, 180, 15);
    bg.endFill();
    relicContainer.addChild(bg);

    const relicIcon = new PIXI.Text(relic.damagedIcon, { fontSize: 96 });
    relicIcon.anchor.set(0.5);
    relicIcon.x = 350;
    relicIcon.y = 90;
    relicContainer.addChild(relicIcon);
    (this.restorationPanel as any).relicIcon = relicIcon;

    const relicName = new PIXI.Text(relic.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    relicName.anchor.set(0.5);
    relicName.x = 350;
    relicName.y = 160;
    relicContainer.addChild(relicName);

    this.restorationPanel.addChild(relicContainer);
  }

  private createRelicDescription(relic: Relic, y: number): void {
    if (!this.restorationPanel) return;

    const descBg = new PIXI.Graphics();
    descBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
    descBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.5);
    descBg.drawRoundedRect(50, 0, 650, 100, 12);
    descBg.endFill();
    descBg.y = y;
    this.restorationPanel.addChild(descBg);

    const descText = new PIXI.Text(relic.damagedDescription, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 600
    });
    descText.anchor.set(0.5, 0);
    descText.x = 375;
    descText.y = y + 15;
    (this.restorationPanel as any).descText = descText;
    this.restorationPanel.addChild(descText);
  }

  private createStepSlots(steps: RestorationStep[], y: number): void {
    if (!this.restorationPanel) return;
    this.stepSlots = [];

    const slotsContainer = new PIXI.Container();
    slotsContainer.y = y;

    const label = new PIXI.Text('修复步骤（按顺序点击材料）', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    label.x = 50;
    label.y = 0;
    slotsContainer.addChild(label);

    const slotSize = 100;
    const gap = 15;
    const startX = 50;

    for (let i = 0; i < steps.length; i++) {
      const slot = new PIXI.Container();

      const slotBg = new PIXI.Graphics();
      slotBg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 0.6);
      slotBg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.3);
      slotBg.drawRoundedRect(0, 0, slotSize, slotSize, 10);
      slotBg.endFill();
      slot.addChild(slotBg);

      const stepNum = new PIXI.Text(`${i + 1}`, {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 20,
        fill: GAME_CONFIG.COLORS.AMBER
      });
      stepNum.anchor.set(0.5);
      stepNum.x = slotSize / 2;
      stepNum.y = slotSize / 2;
      slot.addChild(stepNum);

      slot.x = startX + i * (slotSize + gap);
      slot.y = 40;
      slotsContainer.addChild(slot);
      this.stepSlots.push(slot);
    }

    this.restorationPanel.addChild(slotsContainer);
  }

  private createMaterialButtons(steps: RestorationStep[], y: number): void {
    if (!this.restorationPanel) return;

    const materialsContainer = new PIXI.Container();
    materialsContainer.y = y;

    const label = new PIXI.Text('修复材料', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    label.x = 50;
    label.y = 0;
    materialsContainer.addChild(label);

    const materials: { step: RestorationStep; material: RestorationMaterial | undefined }[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < steps.length; i++) {
      let randomIdx;
      do {
        randomIdx = Math.floor(Math.random() * steps.length);
      } while (usedIndices.has(randomIdx));
      usedIndices.add(randomIdx);

      const step = steps[randomIdx];
      const material = store.getRestorationMaterialById(step.materialId);
      materials.push({ step, material });
    }

    const btnSize = 110;
    const gap = 15;
    const startX = 50;

    materials.forEach((item, index) => {
      const btn = this.createMaterialButton(item.step, item.material, btnSize);
      const row = Math.floor(index / 3);
      const col = index % 3;
      btn.x = startX + col * (btnSize + gap);
      btn.y = 40 + row * (btnSize + gap);
      materialsContainer.addChild(btn);
    });

    this.restorationPanel.addChild(materialsContainer);
  }

  private createMaterialButton(step: RestorationStep, material: RestorationMaterial | undefined, size: number): PIXI.Container {
    const btn = new PIXI.Container();

    const btnBg = new PIXI.Graphics();
    btnBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.8);
    btnBg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    btnBg.drawRoundedRect(0, 0, size, size, 12);
    btnBg.endFill();
    btn.addChild(btnBg);

    const icon = new PIXI.Text(step.icon, { fontSize: 40 });
    icon.anchor.set(0.5);
    icon.x = size / 2;
    icon.y = size / 2 - 10;
    btn.addChild(icon);

    const nameText = new PIXI.Text(material?.name || step.name, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.DARK_BROWN,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: size - 10
    });
    nameText.anchor.set(0.5, 1);
    nameText.x = size / 2;
    nameText.y = size - 5;
    btn.addChild(nameText);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    btn.on('pointerdown', () => {
      audioModule.playSFX('sfx_collect');
      this.addStepInput(step);
    });

    btn.on('pointerover', () => {
      Animator.tween(btn.scale, { x: 1.05, y: 1.05 }, 150);
    });

    btn.on('pointerout', () => {
      Animator.tween(btn.scale, { x: 1, y: 1 }, 150);
    });

    return btn;
  }

  private addStepInput(step: RestorationStep): void {
    const steps = this.currentRelic?.steps || [];
    if (this.stepInput.length >= steps.length) return;

    this.stepInput.push(step.order);
    const index = this.stepInput.length - 1;

    if (this.stepSlots[index]) {
      const slot = this.stepSlots[index];

      const oldChildren = slot.children.filter((_, i) => i > 1);
      oldChildren.forEach(child => {
        slot.removeChild(child);
        child.destroy();
      });

      const icon = new PIXI.Text(step.icon, { fontSize: 40 });
      icon.anchor.set(0.5);
      icon.x = 50;
      icon.y = 50;
      icon.alpha = 0;
      slot.addChild(icon);

      Animator.animate(
        200,
        (p) => { icon.alpha = p; icon.scale.set(0.5 + p * 0.5); }
      );
    }

    audioModule.playSFX('sfx_collect');
  }

  private clearSteps(): void {
    this.stepInput = [];

    this.stepSlots.forEach(slot => {
      const oldChildren = slot.children.filter((_, i) => i > 1);
      oldChildren.forEach(child => {
        slot.removeChild(child);
        child.destroy();
      });
    });

    audioModule.playSFX('sfx_click');
  }

  private validateRestoration(): void {
    if (!this.currentMechanism || !this.currentRelic) return;

    const steps = this.currentRelic.steps;
    if (this.stepInput.length !== steps.length) {
      this.showHint('请完成所有修复步骤');
      audioModule.playSFX('sfx_error');
      return;
    }

    const isCorrect = store.checkRestorationOrder(this.currentRelic.id, this.stepInput);
    if (isCorrect) {
      this.onRestorationSuccess();
    } else {
      this.onRestorationError();
    }
  }

  private onRestorationSuccess(): void {
    audioModule.playSFX('sfx_success');
    audioModule.playSFX('sfx_unlock');

    if (this.currentMechanism) {
      store.solveMechanism(this.currentMechanism.id);
    }

    if (this.currentRelic) {
      store.restoreRelic(this.currentRelic.id);
    }

    if (this.restorationPanel && this.currentRelic) {
      const relicIcon = (this.restorationPanel as any).relicIcon as PIXI.Text;
      const descText = (this.restorationPanel as any).descText as PIXI.Text;

      const glow = new PIXI.Graphics();
      glow.beginFill(GAME_CONFIG.COLORS.GOLD, 0);
      glow.drawRoundedRect(25, 50, 700, 1230, 20);
      glow.endFill();
      this.restorationPanel.addChild(glow);

      Animator.animate(
        1000,
        (progress) => {
          glow.clear();
          glow.beginFill(GAME_CONFIG.COLORS.GOLD, progress * 0.4);
          glow.drawRoundedRect(25, 50, 700, 1230, 20);
          glow.endFill();

          if (relicIcon && progress > 0.5) {
            relicIcon.text = this.currentRelic!.restoredIcon;
            relicIcon.scale.set(1 + (progress - 0.5) * 0.5);
          }
        },
        () => {
          if (descText && this.currentRelic) {
            descText.text = this.currentRelic.restoredDescription;
          }

          Animator.delay(1500).then(() => {
            this.showRestorationComplete();
          });
        }
      );
    }
  }

  private showRestorationComplete(): void {
    if (!this.restorationPanel || !this.currentRelic) return;

    const completePanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.92);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    overlay.eventMode = 'static';
    completePanel.addChild(overlay);

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
    panel.lineStyle(5, GAME_CONFIG.COLORS.GOLD, 1);
    panel.drawRoundedRect(50, 300, 650, 700, 25);
    panel.endFill();
    completePanel.addChild(panel);

    const successIcon = new PIXI.Text('✨', { fontSize: 80 });
    successIcon.anchor.set(0.5);
    successIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    successIcon.y = 390;
    completePanel.addChild(successIcon);

    const title = new PIXI.Text('修复完成！', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 48,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 470;
    completePanel.addChild(title);

    const relicIcon = new PIXI.Text(this.currentRelic.restoredIcon, { fontSize: 120 });
    relicIcon.anchor.set(0.5);
    relicIcon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    relicIcon.y = 600;
    completePanel.addChild(relicIcon);

    const relicName = new PIXI.Text(this.currentRelic.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 32,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    relicName.anchor.set(0.5);
    relicName.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    relicName.y = 710;
    completePanel.addChild(relicName);

    const resultDesc = new PIXI.Text(this.currentRelic.restoredDescription, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.CREAM,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 550
    });
    resultDesc.anchor.set(0.5);
    resultDesc.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    resultDesc.y = 760;
    completePanel.addChild(resultDesc);

    const unlockText = new PIXI.Text('🔓 青铜珍品馆已解锁', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: GAME_CONFIG.COLORS.WARM_ORANGE,
      align: 'center'
    });
    unlockText.anchor.set(0.5);
    unlockText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    unlockText.y = 890;
    completePanel.addChild(unlockText);

    const continueBtn = this.createButton('前往珍品馆', GAME_CONFIG.DESIGN_WIDTH / 2 - 125, 940);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeRestoration();
      Animator.delay(300).then(() => {
        eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_7' });
      });
    });
    completePanel.addChild(continueBtn);

    completePanel.alpha = 0;
    this.restorationPanel.addChild(completePanel);

    Animator.animate(
      500,
      (progress) => {
        completePanel.alpha = progress;
        completePanel.scale.set(0.9 + progress * 0.1);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private onRestorationError(): void {
    audioModule.playSFX('sfx_error');
    this.showHint('修复步骤顺序错误，请重试');
    this.shakeAnimation();
  }

  private showHint(text: string): void {
    if (!this.restorationPanel) return;

    const existingHint = this.restorationPanel.getChildByName('errorHint');
    if (existingHint) {
      this.restorationPanel.removeChild(existingHint);
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
    hint.y = 250;
    hint.alpha = 0;
    this.restorationPanel.addChild(hint);

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
    if (!this.restorationPanel) return;

    const panel = this.restorationPanel;
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
      this.closeRestoration();
    });

    return btn;
  }

  private closeRestoration(): void {
    if (!this.restorationPanel) return;

    const panel = this.restorationPanel;
    Animator.animate(
      300,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.restorationPanel = null;
        this.isOpen = false;
        this.currentMechanism = null;
        this.currentRelic = null;
        this.stepInput = [];
        this.stepSlots = [];
      }
    );
  }

  update(_delta: number): void {
  }

  destroy(): void {
    eventBus.off('restoration:open', this.handleRestorationOpen.bind(this));
    eventBus.off('restoration:complete', this.handleRestorationComplete.bind(this));
    if (this.restorationPanel) {
      this.restorationPanel.destroy();
    }
  }
}
