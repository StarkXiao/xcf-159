import * as PIXI from 'pixi.js';
import { Clue, HallType } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

interface FilterState {
  chapterId: string;
  hallType: HallType | 'all';
  mechanismId: string;
  onlyAvailable: boolean;
}

export class ClueModule {
  private container: PIXI.Container;
  private inventoryPanel: PIXI.Container;
  private inventoryItems: PIXI.Container[] = [];
  private detailPanel: PIXI.Container | null = null;
  private isInventoryOpen: boolean = false;
  private inventoryToggle: PIXI.Graphics;
  private collectAnimation: PIXI.Container | null = null;
  
  private filterState: FilterState = {
    chapterId: 'all',
    hallType: 'all',
    mechanismId: 'all',
    onlyAvailable: false
  };
  
  private filterContainer: PIXI.Container | null = null;

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

  private createFilterUI(): PIXI.Container {
    const container = new PIXI.Container();
    container.y = 55;

    const chapters = store.getChapters();
    const halls: { id: HallType | 'all'; name: string }[] = [
      { id: 'all', name: '全部展厅' },
      { id: 'history', name: '历史馆' },
      { id: 'art', name: '艺术馆' }
    ];
    const mechanisms = store.getDistinctMechanismPurposes();

    const chapterFilter = this.createDropdown(
      '章节',
      [{ id: 'all', name: '全部章节' }, ...chapters.map(c => ({ id: c.id, name: c.title }))],
      this.filterState.chapterId,
      (value) => {
        this.filterState.chapterId = value;
        this.renderInventory();
      }
    );
    chapterFilter.x = 30;
    container.addChild(chapterFilter);

    const hallFilter = this.createDropdown(
      '展厅',
      halls,
      this.filterState.hallType,
      (value) => {
        this.filterState.hallType = value as HallType | 'all';
        this.renderInventory();
      }
    );
    hallFilter.x = 200;
    container.addChild(hallFilter);

    const mechanismFilter = this.createDropdown(
      '机关用途',
      [{ id: 'all', name: '全部用途' }, ...mechanisms],
      this.filterState.mechanismId,
      (value) => {
        this.filterState.mechanismId = value;
        this.renderInventory();
      }
    );
    mechanismFilter.x = 370;
    container.addChild(mechanismFilter);

    const availableToggle = this.createAvailableToggle();
    availableToggle.x = 560;
    container.addChild(availableToggle);

    return container;
  }

  private createDropdown(
    label: string,
    options: { id: string; name: string }[],
    currentValue: string,
    onChange: (value: string) => void
  ): PIXI.Container {
    const container = new PIXI.Container();

    const labelText = new PIXI.Text(label, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    labelText.y = 2;
    container.addChild(labelText);

    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.8);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    bg.drawRoundedRect(0, 22, 150, 32, 8);
    bg.endFill();
    container.addChild(bg);

    const currentOption = options.find(o => o.id === currentValue) || options[0];
    const valueText = new PIXI.Text(currentOption.name, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: 0xFFFFFF
    });
    valueText.x = 10;
    valueText.y = 28;
    container.addChild(valueText);

    const arrow = new PIXI.Text('▼', {
      fontSize: 12,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    arrow.x = 130;
    arrow.y = 30;
    container.addChild(arrow);

    bg.eventMode = 'static';
    bg.cursor = 'pointer';

    let isOpen = false;
    let optionContainer: PIXI.Container | null = null;

    const toggleOptions = () => {
      audioModule.playSFX('sfx_click');
      if (isOpen) {
        if (optionContainer) {
          container.removeChild(optionContainer);
          optionContainer.destroy();
          optionContainer = null;
        }
        isOpen = false;
      } else {
        optionContainer = new PIXI.Container();
        optionContainer.y = 56;
        optionContainer.zIndex = 100;

        const optionsBg = new PIXI.Graphics();
        optionsBg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.98);
        optionsBg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
        optionsBg.drawRoundedRect(0, 0, 150, options.length * 36 + 8, 8);
        optionsBg.endFill();
        optionContainer!.addChild(optionsBg);

        options.forEach((option, index) => {
          const optionBg = new PIXI.Graphics();
          optionBg.beginFill(option.id === currentValue ? GAME_CONFIG.COLORS.AMBER : 0x000000, 0.3);
          optionBg.drawRoundedRect(4, 4 + index * 36, 142, 30, 4);
          optionBg.endFill();
          optionContainer!.addChild(optionBg);

          const optionText = new PIXI.Text(option.name, {
            fontFamily: GAME_CONFIG.FONTS.BODY,
            fontSize: 14,
            fill: option.id === currentValue ? GAME_CONFIG.COLORS.DARK_BROWN : 0xFFFFFF
          });
          optionText.x = 12;
          optionText.y = 10 + index * 36;
          optionContainer!.addChild(optionText);

          optionBg.eventMode = 'static';
          optionBg.cursor = 'pointer';
          optionBg.on('pointerdown', () => {
            audioModule.playSFX('sfx_click');
            onChange(option.id);
            if (optionContainer) {
              container.removeChild(optionContainer);
              optionContainer.destroy();
              optionContainer = null;
            }
            isOpen = false;
          });
        });

        container.addChild(optionContainer);
        isOpen = true;
      }
    };

    bg.on('pointerdown', toggleOptions);
    arrow.eventMode = 'static';
    arrow.cursor = 'pointer';
    arrow.on('pointerdown', toggleOptions);

    return container;
  }

  private createAvailableToggle(): PIXI.Container {
    const container = new PIXI.Container();

    const label = new PIXI.Text('仅显示可用', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 14,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    label.y = 2;
    container.addChild(label);

    const bg = new PIXI.Graphics();
    bg.beginFill(this.filterState.onlyAvailable ? GAME_CONFIG.COLORS.GOLD : GAME_CONFIG.COLORS.BRONZE, 0.8);
    bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
    bg.drawRoundedRect(0, 22, 160, 32, 8);
    bg.endFill();
    container.addChild(bg);

    const statusText = new PIXI.Text(
      this.filterState.onlyAvailable ? '✓ 当前场景可用' : '显示全部线索',
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 14,
        fill: this.filterState.onlyAvailable ? GAME_CONFIG.COLORS.DARK_BROWN : 0xFFFFFF
      }
    );
    statusText.x = 10;
    statusText.y = 29;
    container.addChild(statusText);

    bg.eventMode = 'static';
    bg.cursor = 'pointer';
    bg.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.filterState.onlyAvailable = !this.filterState.onlyAvailable;
      this.renderInventory();
    });

    return container;
  }

  private getFilteredClues(): Clue[] {
    const filters: any = {
      onlyCollected: true
    };

    if (this.filterState.chapterId !== 'all') {
      filters.chapterId = this.filterState.chapterId;
    }
    if (this.filterState.hallType !== 'all') {
      filters.hallType = this.filterState.hallType;
    }
    if (this.filterState.mechanismId !== 'all') {
      filters.mechanismId = this.filterState.mechanismId;
    }
    if (this.filterState.onlyAvailable) {
      filters.onlyAvailable = true;
    }

    return store.getCluesFiltered(filters);
  }

  private renderInventory(): void {
    this.clearInventoryItems();

    const panelHeight = this.filterState.onlyAvailable ? 260 : 260;
    
    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    bg.lineStyle(3, GAME_CONFIG.COLORS.AMBER, 1);
    bg.drawRoundedRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, panelHeight, 20);
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

    this.filterContainer = this.createFilterUI();
    this.inventoryPanel.addChild(this.filterContainer);

    const closeBtn = this.createCloseButton();
    closeBtn.x = GAME_CONFIG.DESIGN_WIDTH - 70;
    closeBtn.y = 10;
    this.inventoryPanel.addChild(closeBtn);

    const clues = this.getFilteredClues();

    if (clues.length === 0) {
      const emptyText = new PIXI.Text(
        this.filterState.onlyAvailable 
          ? '当前场景没有可用的线索...' 
          : '还没有收集到任何线索...',
        {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 22,
          fill: 0xAAAAAA,
          align: 'center'
        }
      );
      emptyText.anchor.set(0.5);
      emptyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      emptyText.y = 180;
      this.inventoryPanel.addChild(emptyText);
      return;
    }

    const startX = 30;
    const startY = 120;
    const itemSize = 90;
    const gap = 20;
    const perRow = 6;

    clues.forEach((clue, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      const x = startX + col * (itemSize + gap);
      const y = startY + row * (itemSize + gap);

      const isAvailable = store.isClueUsefulInCurrentExhibition(clue.id);
      const item = this.createInventoryItem(clue, x, y, isAvailable);
      this.inventoryPanel.addChild(item);
      this.inventoryItems.push(item);
    });
  }

  private createInventoryItem(clue: Clue, x: number, y: number, isAvailable: boolean = false): PIXI.Container {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    const bg = new PIXI.Graphics();
    
    if (isAvailable) {
      bg.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
      bg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.4);
    } else {
      bg.lineStyle(2, GAME_CONFIG.COLORS.AMBER, 0.8);
      bg.beginFill(GAME_CONFIG.COLORS.BRONZE, 0.6);
    }
    bg.drawRoundedRect(0, 0, 90, 90, 12);
    bg.endFill();
    container.addChild(bg);

    if (isAvailable) {
      const glow = new PIXI.Graphics();
      glow.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 0.6);
      glow.drawRoundedRect(-3, -3, 96, 96, 14);
      glow.alpha = 0.5;
      container.addChildAt(glow, 0);
      
      Animator.animate(
        1500,
        (progress) => {
          glow.alpha = 0.3 + Math.sin(progress * Math.PI * 2) * 0.3;
        },
        undefined,
        undefined,
        true
      );

      const availableTag = new PIXI.Graphics();
      availableTag.beginFill(GAME_CONFIG.COLORS.GOLD, 1);
      availableTag.drawCircle(80, 80, 10);
      availableTag.endFill();
      container.addChild(availableTag);

      const availableIcon = new PIXI.Text('✓', {
        fontSize: 14,
        fill: GAME_CONFIG.COLORS.DARK_BROWN,
        fontWeight: 'bold'
      });
      availableIcon.anchor.set(0.5);
      availableIcon.x = 80;
      availableIcon.y = 80;
      container.addChild(availableIcon);
    }

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

    const purposeInfo = store.getClueMechanismPurpose(clue.id);
    const hasPurpose = purposeInfo && purposeInfo.length > 0;
    
    const panelHeight = hasPurpose ? 600 : 500;

    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.92);
    bg.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    bg.drawRoundedRect(0, 0, 650, panelHeight, 20);
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

    let currentY = 350;

    if (hasPurpose) {
      const purposeTitle = new PIXI.Text('🔧 机关用途', {
        fontFamily: GAME_CONFIG.FONTS.TITLE,
        fontSize: 22,
        fill: GAME_CONFIG.COLORS.GOLD
      });
      purposeTitle.anchor.set(0.5, 0);
      purposeTitle.x = 325;
      purposeTitle.y = currentY;
      this.detailPanel!.addChild(purposeTitle);
      currentY += 35;

      purposeInfo.forEach((purpose) => {
        const purposeBg = new PIXI.Graphics();
        purposeBg.beginFill(GAME_CONFIG.COLORS.AMBER, 0.15);
        purposeBg.lineStyle(1, GAME_CONFIG.COLORS.AMBER, 0.5);
        purposeBg.drawRoundedRect(50, currentY, 550, 70, 10);
        purposeBg.endFill();
        this.detailPanel!.addChild(purposeBg);

        const mechName = new PIXI.Text(`▸ ${purpose.mechanismName}`, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 18,
          fill: GAME_CONFIG.COLORS.AMBER,
          fontWeight: 'bold'
        });
        mechName.x = 65;
        mechName.y = currentY + 8;
        this.detailPanel!.addChild(mechName);

        const purposeDesc = new PIXI.Text(purpose.purpose, {
          fontFamily: GAME_CONFIG.FONTS.BODY,
          fontSize: 16,
          fill: 0xDDDDDD,
          wordWrap: true,
          wordWrapWidth: 520
        });
        purposeDesc.x = 65;
        purposeDesc.y = currentY + 32;
        this.detailPanel!.addChild(purposeDesc);

        currentY += 80;
      });
    }

    const btnY = hasPurpose ? 520 : 420;
    const closeBtn = new PIXI.Graphics();
    closeBtn.beginFill(GAME_CONFIG.COLORS.AMBER);
    closeBtn.lineStyle(3, GAME_CONFIG.COLORS.GOLD, 1);
    closeBtn.drawRoundedRect(200, btnY, 250, 60, 15);
    closeBtn.endFill();

    const btnText = new PIXI.Text('关闭', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 26,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    btnText.anchor.set(0.5);
    btnText.x = 325;
    btnText.y = btnY + 30;
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

    if (this.filterContainer) {
      this.inventoryPanel.removeChild(this.filterContainer);
      this.filterContainer.destroy();
      this.filterContainer = null;
    }

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
