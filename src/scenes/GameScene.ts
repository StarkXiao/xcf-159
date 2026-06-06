import * as PIXI from 'pixi.js';
import { Scene } from './Scene';
import { GAME_CONFIG } from '../game/config';
import { eventBus } from '../game/EventBus';
import { Animator } from '../utils/Animator';
import { ExhibitionModule } from '../modules/ExhibitionModule';
import { ClueModule } from '../modules/ClueModule';
import { MemoryModule } from '../modules/MemoryModule';
import { MechanismModule } from '../modules/MechanismModule';
import { ChapterModule } from '../modules/ChapterModule';
import { ArchiveModule } from '../modules/ArchiveModule';
import { NightPatrolModule } from '../modules/NightPatrolModule';
import { RestorationModule } from '../modules/RestorationModule';
import { DualHallModule } from '../modules/DualHallModule';
import { VisitorQuestModule } from '../modules/VisitorQuestModule';
import { ArchiveReadingRoomModule } from '../modules/ArchiveReadingRoomModule';
import { audioModule } from '../modules/AudioModule';

export class GameScene extends Scene {
  private exhibitionModule: ExhibitionModule | null = null;
  private clueModule: ClueModule | null = null;
  private memoryModule: MemoryModule | null = null;
  private mechanismModule: MechanismModule | null = null;
  private chapterModule: ChapterModule | null = null;
  private archiveModule: ArchiveModule | null = null;
  private nightPatrolModule: NightPatrolModule | null = null;
  private restorationModule: RestorationModule | null = null;
  private dualHallModule: DualHallModule | null = null;
  private visitorQuestModule: VisitorQuestModule | null = null;
  private archiveReadingRoomModule: ArchiveReadingRoomModule | null = null;

  private transitionOverlay: PIXI.Graphics | null = null;

  init(): void {
    this.visible = false;

    this.createTransitionOverlay();

    this.exhibitionModule = new ExhibitionModule(this);
    this.clueModule = new ClueModule(this);
    this.memoryModule = new MemoryModule(this);
    this.mechanismModule = new MechanismModule(this);
    this.chapterModule = new ChapterModule(this);
    this.archiveModule = new ArchiveModule(this);
    this.nightPatrolModule = new NightPatrolModule(this);
    this.restorationModule = new RestorationModule(this);
    this.dualHallModule = new DualHallModule(this);
    this.visitorQuestModule = new VisitorQuestModule(this);
    this.archiveReadingRoomModule = new ArchiveReadingRoomModule(this);

    this.createParticles(25);

    this.setupEventListeners();
  }

  private createTransitionOverlay(): void {
    this.transitionOverlay = new PIXI.Graphics();
    this.transitionOverlay.beginFill(0x000000, 1);
    this.transitionOverlay.drawRect(0, 0, GAME_CONFIG.DESIGN_WIDTH, GAME_CONFIG.DESIGN_HEIGHT);
    this.transitionOverlay.endFill();
    this.transitionOverlay.alpha = 0;
    this.transitionOverlay.eventMode = 'static';
    this.addChild(this.transitionOverlay);
  }

  private setupEventListeners(): void {
    eventBus.on('game:reset', this.handleReset.bind(this));
    eventBus.on('game:complete', this.handleGameComplete.bind(this));
  }

  onEnter(): void {
    super.onEnter();

    audioModule.playBGM('bgm_explore');

    if (this.transitionOverlay) {
      this.transitionOverlay.alpha = 1;
      Animator.animate(
        800,
        (progress) => {
          this.transitionOverlay!.alpha = 1 - progress;
        },
        () => {
          if (this.transitionOverlay) {
            this.transitionOverlay.eventMode = 'auto';
          }
        },
        Animator.easeOutCubic
      );
    }
  }

  onExit(): void {
    super.onExit();
  }

  private handleReset(): void {
    if (this.transitionOverlay) {
      this.transitionOverlay.eventMode = 'static';
      Animator.animate(
        500,
        (progress) => {
          this.transitionOverlay!.alpha = progress;
        },
        () => {
          Animator.delay(300).then(() => {
            Animator.animate(
              800,
              (progress) => {
                this.transitionOverlay!.alpha = 1 - progress;
              },
              () => {
                if (this.transitionOverlay) {
                  this.transitionOverlay.eventMode = 'auto';
                }
              }
            );
          });
        }
      );
    }
  }

  private handleGameComplete(): void {
    audioModule.playSFX('sfx_unlock');

    if (this.transitionOverlay) {
      this.transitionOverlay.eventMode = 'static';
      Animator.animate(
        1500,
        (progress) => {
          this.transitionOverlay!.alpha = progress;
        },
        () => {
          eventBus.emit('scene:change', { scene: 'end' });
        },
        Animator.easeInOutCubic
      );
    }
  }

  update(delta: number): void {
    this.updateParticles();
    if (this.chapterModule) {
      this.chapterModule.update(delta);
    }
    if (this.archiveModule) {
      this.archiveModule.update(delta);
    }
    if (this.nightPatrolModule) {
      this.nightPatrolModule.update(delta);
    }
    if (this.dualHallModule) {
      this.dualHallModule.update(delta);
    }
    if (this.visitorQuestModule) {
      this.visitorQuestModule.update(delta);
    }
    if (this.archiveReadingRoomModule) {
      this.archiveReadingRoomModule.update(delta);
    }
  }

  destroy(): void {
    eventBus.off('game:reset', this.handleReset.bind(this));
    eventBus.off('game:complete', this.handleGameComplete.bind(this));

    this.clearParticles();

    if (this.exhibitionModule) this.exhibitionModule.destroy();
    if (this.clueModule) this.clueModule.destroy();
    if (this.memoryModule) this.memoryModule.destroy();
    if (this.mechanismModule) this.mechanismModule.destroy();
    if (this.chapterModule) this.chapterModule.destroy();
    if (this.archiveModule) this.archiveModule.destroy();
    if (this.nightPatrolModule) this.nightPatrolModule.destroy();
    if (this.restorationModule) this.restorationModule.destroy();
    if (this.dualHallModule) this.dualHallModule.destroy();
    if (this.visitorQuestModule) this.visitorQuestModule.destroy();
    if (this.archiveReadingRoomModule) this.archiveReadingRoomModule.destroy();
    if (this.transitionOverlay) this.transitionOverlay.destroy();
  }
}
