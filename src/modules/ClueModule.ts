import * as PIXI from 'pixi.js';
import { Clue } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class ClueModule {
  private container: PIXI.Container;
  private inventoryPanel: PIXI.Container;
  private inventoryItems: PIXI.Container[] = [];
  private detailPanel: PIXI.Container | null = null;
  private isInventoryOpen: boolean = false;
  private inventoryToggle: PIXI.Graphics;
  private collectAnimation: PIXI.Container | null = null;

  constructor(container: PIXI.Container) {
    this.container = container;

    this.inventoryPanel = new PIXI.Container();
    this.inventoryPanel.y = GAME_CONFIG.DESIGN_HEIGHT - 100;
    this.inventoryPanel.visible = false;
    this.container.addChild(this.inventoryPanel);

    this.inventoryToggle = this.createInventoryToggle();
    this.container.addChild(this.inventoryToggle);

    eventBus.on('clue:collect', this.handleClueCollect.bind(this));
  }

  private createInventoryToggle(): PIXI.Graphics {
    const toggle = new PIXI.Graphics();
    toggle.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.9);
    toggle.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    toggle.drawRoundedRect(20, 0, 100, 60, 15);
    toggle.endFill();

    const icon = new PIXI.Text('🎒', { fontSize: 28 });
    icon.anchor.set(0.5);
    icon.x = 70;
    icon.y = 30;
    toggle.addChild(icon);

    const count = new PIXI.Text('0', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 18,
      fill: 0xFFFFFF
    });
    count.anchor.set(0.5);
    count.x = 95;
    count.y = 15;
    toggle.addChild(count);
    (toggle as any).countText = count;

    toggle.y = GAME_CONFIG.DESIGN_HEIGHT - 80;
    toggle.eventMode = 'static';
    toggle.cursor = 'pointer';

    toggle.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.toggleInventory();
    });

    return toggle;
  }

  private toggleInventory(): void {
    this.isInventoryOpen = !this.isInventoryOpen;

    if (this.isInventoryOpen) {
      this.showInventory();
    } else {
      this.hideInventory();
    }
  }

  private showInventory(): void {
    this.inventoryPanel.visible = true;
    this.inventoryPanel.alpha = 0;
    this.renderInventory();

    Animator.animate(
      300,
      (progress) => {
        this.inventoryPanel.alpha = progress;
        this.inventoryPanel.y = GAME_CONFIG.DESIGN_HEIGHT - 100 - progress * 200;
        this.inventoryToggle.y = GAME_CONFIG.DESIGN_HEIGHT - 80 - progress * 200;
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private hideInventory(): void {
    Animator.animate(
      300,
      (progress) => {
        this.inventoryPanel.alpha = 1 - progress;
        this.inventoryPanel.y = GAME_CONFIG.DESIGN_HEIGHT - 300 + progress * 200;
        this.inventoryToggle.y = GAME_CONFIG.DESIGN_HEIGHT - 280 + progress * 200;
      },
      () => {
        this.inventoryPanel.visible = false;
        this.clearInventoryItems();
      },
      Animator.easeInCubic
    );
  }

  private renderInventory(): void {
    this.clearInventoryItems();

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    bg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    bg.drawRoundedRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, 200, 20);
    bg.endFill();
    this.inventoryPanel.addChild(bg);

    const title = new PIXI.Text('收集的线索', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    title.x = 30;
    title.y = 15;
    this.inventoryPanel.addChild(title);

    const clues = store.getCollectedClues();
    const closeBtn = this.createCloseButton();
    closeBtn.x = GAME_CONFIG.DESIGN_WIDTH - 70;
    closeBtn.y = 10;
    this.inventoryPanel.addChild(closeBtn);

    if (clues.length === 0) {
      const emptyText = new PIXI.Text('还没有收集到任何线索...', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 22,
        fill: 0xAAAAAA,
        align: 'center'
      });
      emptyText.anchor.set(0.5);
      emptyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      emptyText.y = 120;
      this.inventoryPanel.addChild(emptyText);
      return;
    }

    const startX = 30;
    const startY = 70;
    const itemSize = 90;
    const gap = 20;
    const perRow = 6;

    clues.forEach((clue, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      const x = startX + col * (itemSize + gap);
      const y = startY + row * (itemSize + gap);

      const item = this.createInventoryItem(clue, x, y);
      this.inventoryPanel.addChild(item);
      this.inventoryItems.push(item);
    });
  }

  private createInventoryItem(clue: Clue, x: number, y: number): PIXI.Container {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    const bg = new PIXI.Graphics();
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.6);
    bg.drawRoundedRect(0, 0, 90, 90, 12);
    bg.endFill();
    container.addChild(bg);

    const icon = new PIXI.Text(clue.icon, { fontSize: 40 });
    icon.anchor.set(0.5);
    icon.x = 45;
    icon.y = 45;
    container.addChild(icon);

    if (clue.isMemory) {
      const tag = new PIXI.Graphics();
      tag.beginFill(GAME_CONFIG.COLORS.GOLD, 0.9);
      tag.drawCircle(70, 20, 12);
      tag.endFill();

      const tagText = new PIXI.Text('忆', {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.DARK_BROWN,
        fontWeight: 'bold'
      });
      tagText.anchor.set(0.5);
      tagText.x = 70;
      tagText.y = 20;
      tag.addChild(tagText);
      container.addChild(tag);
    }

    container.eventMode = 'static';
    container.cursor = 'pointer';

    container.on('pointerover', () => {
      Animator.tween(bg.scale, { x: 1.1, y: 1.1 }, 150);
    });

    container.on('pointerout', () => {
      Animator.tween(bg.scale, { x: 1, y: 1 }, 150);
    });

    container.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      eventBus.emit('clue:view', { clueId: clue.id });
      this.showClueDetail(clue);
    });

    return container;
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
      this.toggleInventory();
    });

    return btn;
  }

  private showClueDetail(clue: Clue): void {
    this.hideDetail();

    this.detailPanel = new PIXI.Container();
    this.detailPanel.x = 50;
    this.detailPanel.y = 300;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.92);
    bg.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    bg.drawRoundedRect(0, 0, 650, 500, 20);
    bg.endFill();
    this.detailPanel.addChild(bg);

    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.2);
    iconBg.drawCircle(325, 100, 60);
    iconBg.endFill();
    this.detailPanel.addChild(iconBg);

    const icon = new PIXI.Text(clue.icon, { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = 325;
    icon.y = 100;
    this.detailPanel.addChild(icon);

    const name = new PIXI.Text(clue.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 36,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    name.anchor.set(0.5, 0);
    name.x = 325;
    name.y = 180;
    this.detailPanel.addChild(name);

    const description = new PIXI.Text(clue.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580,
      lineHeight: 36
    });
    description.anchor.set(0.5, 0);
    description.x = 325;
    description.y = 250;
    this.detailPanel.addChild(description);

    const closeBtn = new PIXI.Graphics();
    closeBtn.beginFill(GAME_CONFIG.COLORS.AMBER);
    closeBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    closeBtn.drawRoundedRect(200, 420, 250, 60, 15);
    closeBtn.endFill();

    const btnText = new PIXI.Text('关闭', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 26,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    btnText.anchor.set(0.5);
    btnText.x = 325;
    btnText.y = 450;
    closeBtn.addChild(btnText);

    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.hideDetail();
    });
    this.detailPanel.addChild(closeBtn);

    this.detailPanel.alpha = 0;
    this.detailPanel.scale.set(0.8);
    this.container.addChild(this.detailPanel);

    Animator.animate(
      300,
      (progress) => {
        this.detailPanel!.alpha = progress;
        this.detailPanel!.scale.set(0.8 + progress * 0.2);
      },
      undefined,
      Animator.easeOutCubic
    );
  }

  private hideDetail(): void {
    if (this.detailPanel) {
      const panel = this.detailPanel;
      Animator.animate(
        200,
        (progress) => {
          panel.alpha = 1 - progress;
          panel.scale.set(1 - progress * 0.2);
        },
        () => {
          this.container.removeChild(panel);
          panel.destroy();
        }
      );
      this.detailPanel = null;
    }
  }

  private handleClueCollect(data: { clueId: string }): void {
    const clue = store.getClueById(data.clueId);
    if (clue) {
      this.showCollectAnimation(clue);
      this.updateInventoryCount();
    }
  }

  private showCollectAnimation(clue: Clue): void {
    if (this.collectAnimation) {
      this.container.removeChild(this.collectAnimation);
      this.collectAnimation.destroy();
    }

    this.collectAnimation = new PIXI.Container();

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    bg.drawRoundedRect(100, 0, 550, 150, 20);
    bg.endFill();
    this.collectAnimation.addChild(bg);

    const icon = new PIXI.Text(clue.icon, { fontSize: 48 });
    icon.anchor.set(0, 0.5);
    icon.x = 150;
    icon.y = 75;
    this.collectAnimation.addChild(icon);

    const label = new PIXI.Text('获得线索:', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    label.x = 230;
    label.y = 35;
    this.collectAnimation.addChild(label);

    const name = new PIXI.Text(clue.name, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: 0xFFFFFF
    });
    name.x = 230;
    name.y = 65;
    this.collectAnimation.addChild(name);

    this.collectAnimation.y = -160;
    this.container.addChild(this.collectAnimation);

    Animator.animate(
      500,
      (progress) => {
        this.collectAnimation!.y = -160 + progress * 260;
      },
      () => {
        Animator.delay(2000).then(() => {
          if (this.collectAnimation) {
            Animator.animate(
              500,
              (progress) => {
                this.collectAnimation!.y = 100 - progress * 260;
              },
              () => {
                if (this.collectAnimation) {
                  this.container.removeChild(this.collectAnimation);
                  this.collectAnimation.destroy();
                  this.collectAnimation = null;
                }
              }
            );
          }
        });
      },
      Animator.easeOutCubic
    );
  }

  private updateInventoryCount(): void {
    const count = store.getCollectedClues().length;
    ((this.inventoryToggle as any).countText as PIXI.Text).text = count.toString();
  }

  private clearInventoryItems(): void {
    this.inventoryItems.forEach(item => {
      this.inventoryPanel.removeChild(item);
      item.destroy();
    });
    this.inventoryItems = [];

    for (let i = this.inventoryPanel.children.length - 1; i >= 0; i--) {
      this.inventoryPanel.removeChildAt(i);
    }
  }

  update(_delta: number): void {
    // Update animations if needed
  }

  destroy(): void {
    eventBus.off('clue:collect', this.handleClueCollect.bind(this));
    this.clearInventoryItems();
    try {
      if (this.collectAnimation && this.collectAnimation.parent) {
        this.collectAnimation.destroy();
      }
      if (this.inventoryPanel && this.inventoryPanel.parent) {
        this.inventoryPanel.destroy();
      }
      if (this.inventoryToggle && this.inventoryToggle.parent) {
        this.inventoryToggle.destroy();
      }
      if (this.detailPanel && this.detailPanel.parent) {
        this.detailPanel.destroy();
      }
    } catch (e) {
      // Ignore destroy errors
    }
  }
}
