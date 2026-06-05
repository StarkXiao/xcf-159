import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from './config';
import { eventBus } from './EventBus';
import { store } from './Store';
import { StartScene } from '../scenes/StartScene';
import { GameScene } from '../scenes/GameScene';
import { EndScene } from '../scenes/EndScene';

export class Game {
  private app: PIXI.Application;
  private scenes: Map<string, PIXI.Container> = new Map();
  private currentScene: string | null = null;
  private gameContainer!: PIXI.Container;
  private scaleFactor: number = 1;

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

    this.app = new PIXI.Application({
      width: GAME_CONFIG.DESIGN_WIDTH,
      height: GAME_CONFIG.DESIGN_HEIGHT,
      view: canvas,
      backgroundColor: GAME_CONFIG.COLORS.DARK_BG,
      resolution: window.devicePixelRatio || 1,
      antialias: true
    });

    this.setup();
  }

  private setup(): void {
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);

    this.initScenes();
    this.setupResize();
    this.setupEventBus();

    this.changeScene('start');

    this.app.ticker.add(this.update.bind(this));
  }

  private initScenes(): void {
    const startScene = new StartScene(this.app);
    startScene.init();
    this.scenes.set('start', startScene);
    this.gameContainer.addChild(startScene);

    const gameScene = new GameScene(this.app);
    gameScene.init();
    this.scenes.set('game', gameScene);
    this.gameContainer.addChild(gameScene);

    const endScene = new EndScene(this.app);
    endScene.init();
    this.scenes.set('end', endScene);
    this.gameContainer.addChild(endScene);
  }

  private setupEventBus(): void {
    eventBus.on('scene:change', (data: { scene: string }) => {
      this.changeScene(data.scene);
    });

    eventBus.on('game:reset', () => {
      store.resetGame();
    });
  }

  private changeScene(sceneName: string): void {
    if (!this.scenes.has(sceneName)) return;

    if (this.currentScene) {
      const prevScene = this.scenes.get(this.currentScene);
      if (prevScene && 'onExit' in prevScene) {
        (prevScene as any).onExit();
      }
      if (prevScene) {
        prevScene.visible = false;
      }
    }

    const newScene = this.scenes.get(sceneName);
    if (newScene) {
      newScene.visible = true;
      if ('onEnter' in newScene) {
        (newScene as any).onEnter();
      }
      this.currentScene = sceneName;
    }
  }

  private setupResize(): void {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  private resize(): void {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const designWidth = GAME_CONFIG.DESIGN_WIDTH;
    const designHeight = GAME_CONFIG.DESIGN_HEIGHT;

    const scaleX = windowWidth / designWidth;
    const scaleY = windowHeight / designHeight;
    this.scaleFactor = Math.min(scaleX, scaleY);

    const newWidth = designWidth * this.scaleFactor;
    const newHeight = designHeight * this.scaleFactor;

    const offsetX = (windowWidth - newWidth) / 2;
    const offsetY = (windowHeight - newHeight) / 2;

    this.gameContainer.scale.set(this.scaleFactor);
    this.gameContainer.x = offsetX;
    this.gameContainer.y = offsetY;

    this.app.renderer.resize(windowWidth, windowHeight);

    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.style.width = windowWidth + 'px';
      canvas.style.height = windowHeight + 'px';
      canvas.style.position = 'fixed';
      canvas.style.left = '0';
      canvas.style.top = '0';
    }
  }

  private update(delta: number): void {
    if (this.currentScene) {
      const scene = this.scenes.get(this.currentScene);
      if (scene && 'update' in scene) {
        (scene as any).update(delta);
      }
    }
  }

  destroy(): void {
    window.removeEventListener('resize', this.resize.bind(this));
    try {
      this.scenes.forEach(scene => {
        if ('destroy' in scene) {
          (scene as any).destroy();
        }
      });
      this.app.destroy(false);
    } catch (e) {
      // Ignore destroy errors
    }
  }
}
