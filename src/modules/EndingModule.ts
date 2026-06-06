import * as PIXI from 'pixi.js';
import { Ending } from '../game/types';
import { store } from '../game/Store';
import { eventBus } from '../game/EventBus';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from './AudioModule';

export class EndingModule {
  private container: PIXI.Container;
  private endingPanel: PIXI.Container | null = null;
  private isOpen: boolean = false;

  constructor(container: PIXI.Container) {
    this.container = container;
    eventBus.on('ending:show', this.handleEndingShow.bind(this));
  }

  private handleEndingShow(): void {
    if (this.isOpen) return;

    const ending = store.getCurrentEnding();
    if (!ending) return;

    this.isOpen = true;
    this.showEndingPanel(ending);
  }

  private showEndingPanel(ending: Ending): void {
    this.endingPanel = new PIXI.Container();

    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.95);
    overlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    overlay.endFill();
    this.endingPanel.addChild(overlay);

    const bgColor = ending.type === 'true' ? 0xFFD700 :
                    ending.type === 'good' ? 0xFFA500 :
                    ending.type === 'bad' ? 0x8B0000 : 0x4A4A4A;

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, bgColor, 1);
    panel.drawRoundedRect(50, 100, 650, 1100, 20);
    panel.endFill();
    this.endingPanel.addChild(panel);

    const typeColor = ending.type === 'true' ? GAME_CONFIG.COLORS.GOLD :
                      ending.type === 'good' ? GAME_CONFIG.COLORS.AMBER :
                      ending.type === 'bad' ? GAME_CONFIG.COLORS.WARM_ORANGE : 0xAAAAAA;

    const typeLabel = ending.type === 'true' ? '🌟 真结局' :
                      ending.type === 'good' ? '💫 好结局' :
                      ending.type === 'bad' ? '💔 坏结局' : '🌙 普通结局';

    const typeText = new PIXI.Text(typeLabel, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: typeColor,
      align: 'center'
    });
    typeText.anchor.set(0.5);
    typeText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    typeText.y = 150;
    this.endingPanel.addChild(typeText);

    const icon = new PIXI.Text(ending.icon, { fontSize: 80 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 220;
    this.endingPanel.addChild(icon);

    const title = new PIXI.Text(ending.title, {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 300;
    this.endingPanel.addChild(title);

    const description = new PIXI.Text(ending.description, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xCCCCCC,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580
    });
    description.anchor.set(0.5);
    description.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    description.y = 370;
    this.endingPanel.addChild(description);

    const divider = new PIXI.Graphics();
    divider.lineStyle(2, typeColor, 0.5);
    divider.moveTo(150, 420);
    divider.lineTo(600, 420);
    this.endingPanel.addChild(divider);

    const storyTitle = new PIXI.Text('结局故事', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: typeColor,
      align: 'center'
    });
    storyTitle.anchor.set(0.5);
    storyTitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    storyTitle.y = 460;
    this.endingPanel.addChild(storyTitle);

    const storyText = new PIXI.Text(ending.storyText, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 22,
      fill: 0xFFFFFF,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580,
      lineHeight: 36
    });
    storyText.anchor.set(0.5, 0);
    storyText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    storyText.y = 510;
    this.endingPanel.addChild(storyText);

    const epilogueTitle = new PIXI.Text('尾声', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 26,
      fill: typeColor,
      align: 'center'
    });
    epilogueTitle.anchor.set(0.5);
    epilogueTitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    epilogueTitle.y = 800;
    this.endingPanel.addChild(epilogueTitle);

    const epilogueText = new PIXI.Text(ending.epilogueText, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: 0xDDDDDD,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 580,
      lineHeight: 32
    });
    epilogueText.anchor.set(0.5, 0);
    epilogueText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    epilogueText.y = 840;
    this.endingPanel.addChild(epilogueText);

    const achievementBadge = new PIXI.Graphics();
    achievementBadge.beginFill(bgColor, 0.3);
    achievementBadge.lineStyle(3, bgColor, 0.8);
    achievementBadge.drawRoundedRect(200, 980, 350, 60, 30);
    achievementBadge.endFill();
    this.endingPanel.addChild(achievementBadge);

    const achievementText = new PIXI.Text('🏆 结局已解锁', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center'
    });
    achievementText.anchor.set(0.5);
    achievementText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    achievementText.y = 1010;
    this.endingPanel.addChild(achievementText);

    const continueBtn = this.createButton('继续游戏', 275, 1070);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.showEndingSummary();
    });
    this.endingPanel.addChild(continueBtn);

    const replayBtn = this.createButton('重新体验', 130, 1070, true);
    replayBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      eventBus.emit('game:restart');
      this.closeEndingPanel();
    });
    this.endingPanel.addChild(replayBtn);

    this.endingPanel.alpha = 0;
    this.container.addChild(this.endingPanel);

    Animator.animate(
      1000,
      (progress) => {
        this.endingPanel!.alpha = progress;
      },
      () => {
        audioModule.playSFX('sfx_success');
        audioModule.playSFX('sfx_unlock');
        this.playEndingVoice(ending);
      },
      Animator.easeOutCubic
    );

    for (let i = 0; i < 30; i++) {
      const particle = new PIXI.Graphics();
      particle.beginFill(bgColor, 0.8);
      particle.drawCircle(0, 0, 3 + Math.random() * 4);
      particle.endFill();
      particle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
      particle.y = GAME_CONFIG.DESIGN_HEIGHT / 2;
      this.endingPanel.addChild(particle);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const animateParticle = () => {
        particle.x += vx;
        particle.y += vy;
        particle.alpha -= 0.015;
        if (particle.alpha > 0) {
          requestAnimationFrame(animateParticle);
        } else {
          particle.destroy();
        }
      };
      animateParticle();
    }
  }

  private playEndingVoice(ending: Ending): void {
    const recording = store.getRecordings().find(r => r.endingId === ending.id);
    if (recording && recording.unlocked) {
      audioModule.playVoice(recording.id);
    }
  }

  private showEndingSummary(): void {
    if (!this.endingPanel) return;

    while (this.endingPanel.children.length > 1) {
      this.endingPanel.removeChildAt(1);
    }

    const allEndings = store.getEndings();
    const unlockedCount = allEndings.filter(e => e.unlocked).length;
    const achievedCount = allEndings.filter(e => e.achieved).length;

    const panel = new PIXI.Graphics();
    panel.beginFill(GAME_CONFIG.COLORS.DARK_BROWN, 0.95);
    panel.lineStyle(4, GAME_CONFIG.COLORS.AMBER, 1);
    panel.drawRoundedRect(50, 150, 650, 1000, 20);
    panel.endFill();
    this.endingPanel.addChild(panel);

    const icon = new PIXI.Text('📊', { fontSize: 64 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 220;
    this.endingPanel.addChild(icon);

    const title = new PIXI.Text('记忆回廊完成', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 42,
      fill: GAME_CONFIG.COLORS.AMBER,
      align: 'center'
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 290;
    this.endingPanel.addChild(title);

    const statsText = new PIXI.Text(
      `已解锁结局: ${unlockedCount}/${allEndings.length}\n已达成结局: ${achievedCount}/${allEndings.length}`,
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 24,
        fill: 0xCCCCCC,
        align: 'center',
        lineHeight: 40
      }
    );
    statsText.anchor.set(0.5);
    statsText.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    statsText.y = 360;
    this.endingPanel.addChild(statsText);

    const endingsTitle = new PIXI.Text('结局收集', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center'
    });
    endingsTitle.anchor.set(0.5);
    endingsTitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    endingsTitle.y = 430;
    this.endingPanel.addChild(endingsTitle);

    let yOffset = 480;
    allEndings.forEach((ending: Ending) => {
      const endingItem = this.createEndingItem(ending, yOffset);
      this.endingPanel!.addChild(endingItem);
      yOffset += 110;
    });

    const continueBtn = this.createButton('返回主菜单', 275, 950);
    continueBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      eventBus.emit('game:returnToMenu');
      this.closeEndingPanel();
    });
    this.endingPanel.addChild(continueBtn);

    const replayBtn = this.createButton('重新体验', 130, 950, true);
    replayBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      eventBus.emit('game:restart');
      this.closeEndingPanel();
    });
    this.endingPanel.addChild(replayBtn);

    const keepExploringBtn = this.createButton('继续探索', 420, 950, true);
    keepExploringBtn.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.closeEndingPanel();
    });
    this.endingPanel.addChild(keepExploringBtn);
  }

  private createEndingItem(ending: Ending, y: number): PIXI.Container {
    const container = new PIXI.Container();

    const bgColor = ending.achieved ?
      (ending.type === 'true' ? GAME_CONFIG.COLORS.GOLD :
       ending.type === 'good' ? GAME_CONFIG.COLORS.AMBER :
       ending.type === 'bad' ? GAME_CONFIG.COLORS.WARM_ORANGE : 0x888888) :
      GAME_CONFIG.COLORS.BRONZE;

    const bg = new PIXI.Graphics();
    bg.beginFill(ending.unlocked ? bgColor : GAME_CONFIG.COLORS.BRONZE, ending.unlocked ? 0.3 : 0.2);
    bg.lineStyle(2, ending.unlocked ? bgColor : 0x666666, ending.unlocked ? 0.8 : 0.3);
    bg.drawRoundedRect(80, 0, 590, 100, 12);
    bg.endFill();
    container.addChild(bg);

    const icon = new PIXI.Text(ending.unlocked ? ending.icon : '❓', { fontSize: 48 });
    icon.anchor.set(0.5);
    icon.x = 130;
    icon.y = 50;
    icon.alpha = ending.unlocked ? 1 : 0.5;
    container.addChild(icon);

    const title = new PIXI.Text(ending.unlocked ? ending.title : '???', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 22,
      fill: ending.unlocked ? 0xFFFFFF : 0x666666
    });
    title.anchor.set(0, 0.5);
    title.x = 180;
    title.y = 50;
    container.addChild(title);

    const status = ending.achieved ? '✓ 已达成' : (ending.unlocked ? '○ 已解锁' : '🔒 未解锁');
    const statusColor = ending.achieved ? GAME_CONFIG.COLORS.GREEN :
                        ending.unlocked ? GAME_CONFIG.COLORS.AMBER : 0x666666;
    const statusText = new PIXI.Text(status, {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 16,
      fill: statusColor
    });
    statusText.anchor.set(1, 0.5);
    statusText.x = 640;
    statusText.y = 50;
    container.addChild(statusText);

    container.y = y;
    return container;
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

  private closeEndingPanel(): void {
    if (!this.endingPanel) return;

    const panel = this.endingPanel;
    Animator.animate(
      500,
      (progress) => {
        panel.alpha = 1 - progress;
      },
      () => {
        this.container.removeChild(panel);
        panel.destroy();
        this.endingPanel = null;
        this.isOpen = false;
      }
    );
  }

  update(_delta: number): void {
  }

  destroy(): void {
    eventBus.off('ending:show', this.handleEndingShow.bind(this));
    if (this.endingPanel) {
      this.endingPanel.destroy();
    }
  }
}
