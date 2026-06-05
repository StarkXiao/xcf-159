import * as PIXI from 'pixi.js';
import { Scene } from './Scene';
import { GAME_CONFIG } from '../game/config';
import { Animator } from '../utils/Animator';
import { audioModule } from '../modules/AudioModule';
import { eventBus } from '../game/EventBus';

export class EndScene extends Scene {
  private restartButton: PIXI.Graphics | null = null;

  init(): void {
    this.visible = false;
    this.createSceneBackground();
    this.createContent();
    this.createParticles(40);
  }

  private createSceneBackground(): void {
    const bg = new PIXI.Graphics();
    bg.beginFill(GAME_CONFIG.COLORS.DARK_BG);
    bg.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    bg.endFill();

    for (let i = 0; i < 15; i++) {
      const alpha = 0.08 + Math.random() * 0.12;
      bg.beginFill(GAME_CONFIG.COLORS.AMBER, alpha);
      bg.drawCircle(
        GAME_CONFIG.DESIGN_WIDTH * (0.1 + Math.random() * 0.8),
        GAME_CONFIG.DESIGN_HEIGHT * (0.1 + Math.random() * 0.8),
        100 + Math.random() * 250
      );
      bg.endFill();
    }

    const centerGlow = new PIXI.Graphics();
    centerGlow.beginFill(GAME_CONFIG.COLORS.GOLD, 0.2);
    centerGlow.drawEllipse(
      GAME_CONFIG.DESIGN_WIDTH / 2,
      GAME_CONFIG.DESIGN_HEIGHT / 2,
      300,
      200
    );
    centerGlow.endFill();
    bg.addChild(centerGlow);

    const grain = new PIXI.Graphics();
    for (let i = 0; i < 1000; i++) {
      const gray = Math.random() * 50;
      grain.beginFill(gray, 0.025);
      grain.drawRect(
        Math.random() * GAME_CONFIG.DESIGN_WIDTH,
        Math.random() * GAME_CONFIG.DESIGN_HEIGHT,
        2, 2
      );
      grain.endFill();
    }
    bg.addChild(grain);

    this.addChild(bg);
  }

  private createContent(): void {
    const container = new PIXI.Container();
    container.alpha = 0;

    const icon = new PIXI.Text('💎', { fontSize: 100 });
    icon.anchor.set(0.5);
    icon.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    icon.y = 250;
    container.addChild(icon);

    const title = new PIXI.Text('记忆永恒', {
      fontFamily: GAME_CONFIG.FONTS.TITLE,
      fontSize: 72,
      fill: GAME_CONFIG.COLORS.GOLD,
      align: 'center',
      stroke: GAME_CONFIG.COLORS.DARK_BROWN,
      strokeThickness: 4
    });
    title.anchor.set(0.5);
    title.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    title.y = 380;
    container.addChild(title);

    const subtitle = new PIXI.Text('—— 全剧终 ——', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.CREAM
    });
    subtitle.anchor.set(0.5);
    subtitle.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    subtitle.y = 460;
    container.addChild(subtitle);

    const story = new PIXI.Text(
      '爷爷的爱如同琥珀一般，\n' +
      '将最珍贵的记忆永远封存。\n\n' +
      '小琥珀终于明白了，\n' +
      '这座博物馆，是爷爷留给她最后的礼物。\n\n' +
      '那些被封存的记忆，\n' +
      '将永远在她心中闪耀，\n' +
      '如同琥珀中永恒的光芒。',
      {
        fontFamily: GAME_CONFIG.FONTS.BODY,
        fontSize: 24,
        fill: 0xFFFFFF,
        align: 'center',
        lineHeight: 40,
        wordWrap: true,
        wordWrapWidth: 600
      }
    );
    story.anchor.set(0.5);
    story.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    story.y = 650;
    container.addChild(story);

    const thanks = new PIXI.Text('感谢游玩《琥珀记忆馆》', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 20,
      fill: GAME_CONFIG.COLORS.AMBER
    });
    thanks.anchor.set(0.5);
    thanks.x = GAME_CONFIG.DESIGN_WIDTH / 2;
    thanks.y = 880;
    container.addChild(thanks);

    this.restartButton = new PIXI.Graphics();
    this.restartButton.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    this.restartButton.lineStyle(4, GAME_CONFIG.COLORS.GOLD, 1);
    this.restartButton.drawRoundedRect(0, 0, 280, 70, 18);
    this.restartButton.endFill();

    const restartText = new PIXI.Text('重新开始', {
      fontFamily: GAME_CONFIG.FONTS.BODY,
      fontSize: 28,
      fill: GAME_CONFIG.COLORS.DARK_BROWN
    });
    restartText.anchor.set(0.5);
    restartText.x = 140;
    restartText.y = 35;
    this.restartButton.addChild(restartText);

    this.restartButton.x = (GAME_CONFIG.DESIGN_WIDTH - 280) / 2;
    this.restartButton.y = 950;
    this.restartButton.eventMode = 'static';
    this.restartButton.cursor = 'pointer';
    this.restartButton.alpha = 0;

    this.restartButton.on('pointerover', () => {
      Animator.tween(this.restartButton!.scale, { x: 1.05, y: 1.05 }, 150);
      audioModule.playSFX('sfx_click');
    });

    this.restartButton.on('pointerout', () => {
      Animator.tween(this.restartButton!.scale, { x: 1, y: 1 }, 150);
    });

    this.restartButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      this.restartGame();
    });

    container.addChild(this.restartButton);
    this.addChild(container);

    Animator.animate(
      2000,
      (progress) => {
        container.alpha = progress;
      },
      () => {
        Animator.delay(1000).then(() => {
          Animator.animate(
            500,
            (p) => {
              this.restartButton!.alpha = p;
            }
          );
        });
      },
      Animator.easeOutCubic
    );
  }

  private restartGame(): void {
    eventBus.emit('game:reset');
    eventBus.emit('scene:change', { scene: 'start' });
  }

  onEnter(): void {
    super.onEnter();
    audioModule.playBGM('bgm_mystery');
  }

  onExit(): void {
    super.onExit();
  }

  update(_delta: number): void {
    this.updateParticles();
  }

  destroy(): void {
    this.clearParticles();
    if (this.restartButton) this.restartButton.destroy();
  }
}
