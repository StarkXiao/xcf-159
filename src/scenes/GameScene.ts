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
import { MemorySortModule } from '../modules/MemorySortModule';
import { BranchChoiceModule } from '../modules/BranchChoiceModule';
import { EndingModule } from '../modules/EndingModule';
import { FinalReviewModule } from '../modules/FinalReviewModule';
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
  private memorySortModule: MemorySortModule | null = null;
  private branchChoiceModule: BranchChoiceModule | null = null;
  private endingModule: EndingModule | null = null;
  private finalReviewModule: FinalReviewModule | null = null;

  private transitionOverlay: PIXI.Graphics | null = null;
  private reviewButton: PIXI.Graphics | null = null;

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
    this.memorySortModule = new MemorySortModule(this);
    this.branchChoiceModule = new BranchChoiceModule(this);
    this.endingModule = new EndingModule(this);
    this.finalReviewModule = new FinalReviewModule(this);

    this.createReviewButton();

    this.createParticles(25);

    this.setupEventListeners();
  }

  private createReviewButton(): void {
    this.reviewButton = new PIXI.Graphics();
    this.reviewButton.beginFill(GAME_CONFIG.COLORS.AMBER, 0.9);
    this.reviewButton.lineStyle(2, GAME_CONFIG.COLORS.GOLD, 1);
    this.reviewButton.drawRoundedRect(0, 0, 70, 70, 12);
    this.reviewButton.endFill();

    const icon = new PIXI.Text('📜', { fontSize: 32 });
    icon.anchor.set(0.5);
    icon.x = 35;
    icon.y = 35;
    this.reviewButton.addChild(icon);

    this.reviewButton.x = GAME_CONFIG.DESIGN_WIDTH - 90;
    this.reviewButton.y = 70;
    this.reviewButton.eventMode = 'static';
    this.reviewButton.cursor = 'pointer';

    this.reviewButton.on('pointerdown', () => {
      audioModule.playSFX('sfx_click');
      eventBus.emit('finalreview:show');
    });

    this.reviewButton.on('pointerover', () => {
      if (this.reviewButton) {
        Animator.tween(this.reviewButton.scale, { x: 1.1, y: 1.1 }, 150);
      }
    });

    this.reviewButton.on('pointerout', () => {
      if (this.reviewButton) {
        Animator.tween(this.reviewButton.scale, { x: 1, y: 1 }, 150);
      }
    });

    this.addChild(this.reviewButton);
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
    if (this.memorySortModule) {
      this.memorySortModule.update(delta);
    }
    if (this.branchChoiceModule) {
      this.branchChoiceModule.update(delta);
    }
    if (this.endingModule) {
      this.endingModule.update(delta);
    }
    if (this.finalReviewModule) {
      this.finalReviewModule.update(delta);
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
    if (this.memorySortModule) this.memorySortModule.destroy();
    if (this.branchChoiceModule) this.branchChoiceModule.destroy();
    if (this.endingModule) this.endingModule.destroy();
    if (this.finalReviewModule) this.finalReviewModule.destroy();
    if (this.reviewButton) this.reviewButton.destroy();
    if (this.transitionOverlay) this.transitionOverlay.destroy();
  }
}
