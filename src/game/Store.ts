import { GameState, GameSettings, Clue, Exhibition, Chapter, Mechanism, AudioRecording, ArchiveState, ArchiveEntry, NightEvent, ExhibitionMode, NightPatrolState, Relic, RestorationMaterial, RestorationState, HallType, DualHallState, VisitorQuest, VisitorQuestState, ChapterEvaluation, QuestHistoryEntry, Character, TimelineEvent, ReadingRoomState, AuthenticityRelic, AuthenticityState, AuthenticityReward, Ending, BranchChoice, MemoryCorridorState, MechanismInteractionResult, MemorySortSubmitResult, BranchChoiceSubmitResult, PowerOutageEvent, HiddenHotspot, TimedMechanism, LightingState, PowerOutagePhase, PowerOutageState, FinalReviewClueSummary, FinalReviewMechanismSummary, FinalReviewChoiceSummary, FinalReviewEndingCondition, FinalReviewData, MechanismPurpose, ChapterKeyPoint, ChapterIncompleteCondition, MemoryFragmentGap, ChapterProgressAnalysis, ChapterKeyPointReview, MemoryPuzzleState, MemoryPuzzleAttempt, MemoryPuzzleScoreResult, MemorySortHint, MemorySortSkipResult, BreakpointState, MechanismProgress, NarrativeProgress, MechanismSolveRecord, SideQuestProgress, EndingEvaluationState, EndingUnlockConditions, EndingConditionWeights, EndingAnalysis, EndingConditionSatisfaction } from './types';
import { CLUES } from './data/clues';
import { EXHIBITIONS, CHAPTERS, MECHANISMS } from './data/chapters';
import { RECORDINGS } from './data/recordings';
import { NIGHT_EVENTS } from './data/nightEvents';
import { RELICS, RESTORATION_MATERIALS } from './data/restoration';
import { VISITOR_QUESTS } from './data/visitorQuests';
import { CHARACTERS } from './data/characters';
import { TIMELINE_EVENTS } from './data/timelineEvents';
import { AUTHENTICITY_RELICS, AUTHENTICITY_REWARDS } from './data/authenticity';
import { ENDINGS } from './data/endings';
import { BRANCH_CHOICES } from './data/branchChoices';
import { HIDDEN_HOTSPOTS, TIMED_MECHANISMS, POWER_OUTAGE_EVENTS, POWER_OUTAGE_CLUES, POWER_OUTAGE_MECHANISMS } from './data/powerOutageEvents';
import { eventBus } from './EventBus';
import { GAME_CONFIG } from './config';

class Store {
  private state: GameState;
  private clues: Clue[];
  private exhibitions: Exhibition[];
  private chapters: Chapter[];
  private mechanisms: Mechanism[];
  private recordings: AudioRecording[];
  private nightEvents: NightEvent[];
  private relics: Relic[];
  private restorationMaterials: RestorationMaterial[];
  private visitorQuests: VisitorQuest[];
  private characters: Character[];
  private timelineEvents: TimelineEvent[];
  private authenticityRelics: AuthenticityRelic[];
  private authenticityRewards: AuthenticityReward[];
  private endings: Ending[];
  private branchChoices: BranchChoice[];
  private hiddenHotspots: HiddenHotspot[];
  private timedMechanisms: TimedMechanism[];
  private powerOutageEvents: PowerOutageEvent[];
  private chapterStartTime: number = Date.now();
  private newlyUnlockedExhibitions: string[] = [];
  private gameStartTime: number = Date.now();
  private autoSaveTimer: number | null = null;
  private activeMechanismId: string | null = null;
  private mechanismInputState: Record<string, string> = {};

  constructor() {
    const savedState = this.loadFromStorage();
    this.clues = JSON.parse(JSON.stringify(CLUES)).concat(JSON.parse(JSON.stringify(POWER_OUTAGE_CLUES)));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.exhibitions.forEach(exhibition => {
      exhibition.hotspots.forEach(hotspot => {
        if (hotspot.investigated === undefined) {
          hotspot.investigated = false;
        }
      });
    });
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS)).concat(JSON.parse(JSON.stringify(POWER_OUTAGE_MECHANISMS)));
    this.recordings = JSON.parse(JSON.stringify(RECORDINGS));
    this.nightEvents = JSON.parse(JSON.stringify(NIGHT_EVENTS));
    this.relics = JSON.parse(JSON.stringify(RELICS));
    this.restorationMaterials = JSON.parse(JSON.stringify(RESTORATION_MATERIALS));
    this.visitorQuests = JSON.parse(JSON.stringify(VISITOR_QUESTS));
    this.characters = JSON.parse(JSON.stringify(CHARACTERS));
    this.timelineEvents = JSON.parse(JSON.stringify(TIMELINE_EVENTS));
    this.authenticityRelics = JSON.parse(JSON.stringify(AUTHENTICITY_RELICS));
    this.authenticityRewards = JSON.parse(JSON.stringify(AUTHENTICITY_REWARDS));
    this.endings = JSON.parse(JSON.stringify(ENDINGS));
    this.branchChoices = JSON.parse(JSON.stringify(BRANCH_CHOICES));
    this.hiddenHotspots = JSON.parse(JSON.stringify(HIDDEN_HOTSPOTS));
    this.timedMechanisms = JSON.parse(JSON.stringify(TIMED_MECHANISMS));
    this.powerOutageEvents = JSON.parse(JSON.stringify(POWER_OUTAGE_EVENTS));

    const defaultArchive: ArchiveState = {
      unlockedRecordings: ['rec_intro', 'rec_ch1_unlock'],
      playedRecordings: [],
      archivedClues: [],
      archiveEntries: [],
      completedChapters: []
    };

    const defaultPowerOutage: PowerOutageState = {
      active: false,
      currentPhase: 'idle',
      currentExhibitionId: '',
      activeEvents: [],
      completedEvents: [],
      lightingState: 'normal',
      revealedHotspots: [],
      activeTimedMechanisms: [],
      completedTimedMechanisms: [],
      failedTimedMechanisms: [],
      eventStartTime: 0,
      totalPowerOutages: 0
    };

    const defaultNightPatrol: NightPatrolState = {
      mode: 'day',
      activeEvents: [],
      resolvedEvents: [],
      resetMechanisms: [],
      patrolStartTime: 0,
      totalEventsResolved: 0,
      powerOutage: defaultPowerOutage
    };

    const defaultRestoration: RestorationState = {
      collectedMaterials: [],
      restoredRelics: [],
      currentRestoration: null
    };

    const defaultDualHall: DualHallState = {
      activeHall: 'history',
      historyProgress: 0,
      artProgress: 0,
      sharedClues: [],
      unlockedHalls: [],
      linkedMechanismProgress: {},
      currentInvestigationPhase: 1
    };

    const defaultVisitorQuests: VisitorQuestState = {
      activeQuests: [],
      completedQuests: [],
      readyQuests: [],
      deliveringQuests: [],
      questProgress: {},
      chapterEvaluations: [],
      totalScore: 0,
      currentChapterScore: 0,
      questHistory: []
    };

    const defaultReadingRoom: ReadingRoomState = {
      unlockedCharacters: ['char_amber'],
      unlockedEvents: ['event_amber_birth'],
      viewedCharacters: [],
      viewedEvents: [],
      searchHistory: [],
      favoriteClues: []
    };

    const defaultAuthenticity: AuthenticityState = {
      currentRelic: null,
      verifiedRelics: [],
      checkPointProgress: {},
      derivedPassword: '',
      attempts: 0,
      maxAttempts: 3,
      rewards: JSON.parse(JSON.stringify(AUTHENTICITY_REWARDS))
    };

    const defaultMemoryCorridor: MemoryCorridorState = {
      currentPhase: 1,
      completedPhases: [],
      unlockedEndings: [],
      achievedEndings: [],
      madeChoices: {},
      fragmentSortingProgress: 0,
      isMemoryComplete: false,
      currentEnding: null
    };

    const defaultBreakpoint: BreakpointState = {
      currentExhibition: 'exhibition_1',
      currentChapter: 'chapter_1',
      mechanismProgress: {
        solvedMechanisms: [],
        activeMechanismId: null,
        mechanismInputState: {},
        linkedMechanismProgress: {}
      },
      narrativeProgress: {
        triggeredStoryNodes: [],
        completedKeyPoints: [],
        playedRecordings: [],
        unlockedTimelineEvents: [],
        madeBranchChoices: {},
        viewedCharacters: [],
        viewedEvents: []
      },
      savedAt: Date.now(),
      playTime: 0,
      autoSave: false
    };

    const defaultEndingEvaluation: EndingEvaluationState = {
      mechanismSolveRecords: [],
      sideQuestProgress: [],
      hiddenCluesCollected: [],
      mechanismAttemptCounts: {},
      mechanismHintCounts: {},
      mechanismStartTime: {},
      optimalMechanisms: []
    };

    this.state = savedState || {
      currentChapter: 'chapter_1',
      currentExhibition: 'exhibition_1',
      collectedClues: [],
      solvedMechanisms: [],
      unlockedExhibitions: ['exhibition_1', 'exhibition_2', 'exhibition_3'],
      investigatedHotspots: [],
      settings: {
        bgmVolume: 0.5,
        sfxVolume: 0.7,
        bgmMuted: false,
        sfxMuted: false
      },
      archive: defaultArchive,
      nightPatrol: defaultNightPatrol,
      restoration: defaultRestoration,
      dualHall: defaultDualHall,
      visitorQuests: defaultVisitorQuests,
      readingRoom: defaultReadingRoom,
      authenticity: defaultAuthenticity,
      memoryCorridor: defaultMemoryCorridor,
      memoryPuzzleRecovery: {},
      breakpoint: defaultBreakpoint,
      endingEvaluation: defaultEndingEvaluation
    };

    if (!this.state.archive) {
      this.state.archive = defaultArchive;
    }

    if (!this.state.nightPatrol) {
      this.state.nightPatrol = defaultNightPatrol;
    }

    if (!this.state.restoration) {
      this.state.restoration = defaultRestoration;
    }

    if (!this.state.dualHall) {
      this.state.dualHall = defaultDualHall;
    }

    if (!this.state.visitorQuests) {
      this.state.visitorQuests = defaultVisitorQuests;
    }

    if (!this.state.readingRoom) {
      this.state.readingRoom = defaultReadingRoom;
    }

    if (!this.state.authenticity) {
      this.state.authenticity = defaultAuthenticity;
    }

    if (!this.state.memoryCorridor) {
      this.state.memoryCorridor = defaultMemoryCorridor;
    }

    if (!this.state.memoryPuzzleRecovery) {
      this.state.memoryPuzzleRecovery = {};
    }

    if (!this.state.breakpoint) {
      this.state.breakpoint = defaultBreakpoint;
    }

    if (!this.state.endingEvaluation) {
      this.state.endingEvaluation = defaultEndingEvaluation;
    }

    if (savedState && savedState.breakpoint) {
      this.gameStartTime = Date.now() - savedState.breakpoint.playTime;
    }

    this.applyStateToData();
    this.startAutoSave();

    eventBus.on('chapter:enter', (data: { chapterId: string }) => {
      this.triggerStoryNode(`chapter:${data.chapterId}:start`);

      const recording = this.recordings.find(r => r.id === `rec_${data.chapterId}_unlock`);
      if (recording && recording.unlocked && !recording.played) {
        setTimeout(() => {
          eventBus.emit('recording:auto-play', { recordingId: recording.id });
        }, 2000);
      }
    });

    eventBus.on('exhibition:enter', (data: { exhibitionId: string }) => {
      this.triggerStoryNode(`exhibition:${data.exhibitionId}:enter`);
      this.tryCompleteKeyPoints('story', data.exhibitionId);
    });

    eventBus.on('hotspot:investigate', (data: { hotspotId: string }) => {
      this.triggerStoryNode(`hotspot:${data.hotspotId}:investigate`);
    });

    eventBus.on('chapter:complete', (data: { chapterId: string }) => {
      this.triggerStoryNode(`chapter:${data.chapterId}:end`);
    });

    eventBus.on('memorycorridor:phase-complete', (data: { phase: number }) => {
      if (data.phase === 2) {
        const recording = this.recordings.find(r => r.id === 'rec_ch6_phase1_complete');
        if (recording && recording.unlocked && !recording.played) {
          setTimeout(() => {
            eventBus.emit('recording:auto-play', { recordingId: recording.id });
          }, 2000);
        }
      }
    });

    eventBus.on('memorycorridor:memory-complete', () => {
      const recording = this.recordings.find(r => r.id === 'rec_ch6_memory_complete');
      if (recording && recording.unlocked && !recording.played) {
        setTimeout(() => {
          eventBus.emit('recording:auto-play', { recordingId: recording.id });
        }, 2000);
      }
    });

    eventBus.on('memorycorridor:ending-achieved', (data: { endingId: string }) => {
      const recording = this.recordings.find(r => r.endingId === data.endingId);
      if (recording && recording.unlocked && !recording.played) {
        setTimeout(() => {
          eventBus.emit('recording:auto-play', { recordingId: recording.id });
        }, 2000);
      }
    });
  }

  private loadFromStorage(): GameState | null {
    try {
      const saved = localStorage.getItem('amber-memory-hall-save');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('amber-memory-hall-save', JSON.stringify(this.state));
    } catch {
      // Ignore storage errors
    }
  }

  private applyStateToData(): void {
    this.state.collectedClues.forEach(id => {
      const clue = this.clues.find(c => c.id === id);
      if (clue) clue.collected = true;
    });

    this.state.solvedMechanisms.forEach(id => {
      const mech = this.mechanisms.find(m => m.id === id);
      if (mech) mech.solved = true;
    });

    this.state.unlockedExhibitions.forEach(id => {
      const exh = this.exhibitions.find(e => e.id === id);
      if (exh) exh.unlocked = true;
    });

    this.chapters.forEach(ch => {
      const allCluesCollected = ch.requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );
      if (allCluesCollected) ch.completed = true;
    });

    if (this.state.archive) {
      this.state.archive.unlockedRecordings.forEach(id => {
        const rec = this.recordings.find(r => r.id === id);
        if (rec) rec.unlocked = true;
      });
      this.state.archive.playedRecordings.forEach(id => {
        const rec = this.recordings.find(r => r.id === id);
        if (rec) rec.played = true;
      });
    }

    if (this.state.nightPatrol) {
      this.state.nightPatrol.activeEvents.forEach(id => {
        const event = this.nightEvents.find(e => e.id === id);
        if (event) event.triggered = true;
      });
      this.state.nightPatrol.resolvedEvents.forEach(id => {
        const event = this.nightEvents.find(e => e.id === id);
        if (event) event.resolved = true;
      });
      this.state.nightPatrol.resetMechanisms.forEach(id => {
        const mech = this.mechanisms.find(m => m.id === id);
        if (mech) mech.solved = false;
      });

      if (this.state.nightPatrol.powerOutage) {
        this.state.nightPatrol.powerOutage.activeEvents.forEach(id => {
          const event = this.powerOutageEvents.find(e => e.id === id);
          if (event) event.triggered = true;
        });
        this.state.nightPatrol.powerOutage.completedEvents.forEach(id => {
          const event = this.powerOutageEvents.find(e => e.id === id);
          if (event) event.completed = true;
        });
        this.state.nightPatrol.powerOutage.revealedHotspots.forEach(id => {
          const hotspot = this.hiddenHotspots.find(h => h.id === id);
          if (hotspot) hotspot.activated = true;
        });
        this.state.nightPatrol.powerOutage.activeTimedMechanisms.forEach(id => {
          const mech = this.timedMechanisms.find(m => m.id === id);
          if (mech) mech.active = true;
        });
        this.state.nightPatrol.powerOutage.completedTimedMechanisms.forEach(id => {
          const mech = this.timedMechanisms.find(m => m.id === id);
          if (mech) mech.completed = true;
        });
        this.state.nightPatrol.powerOutage.failedTimedMechanisms.forEach(id => {
          const mech = this.timedMechanisms.find(m => m.id === id);
          if (mech) mech.failed = true;
        });
      }
    }

    if (this.state.restoration) {
      this.state.restoration.collectedMaterials.forEach(id => {
        const material = this.restorationMaterials.find(m => m.id === id);
        if (material) material.collected = true;
      });
      this.state.restoration.restoredRelics.forEach(id => {
        const relic = this.relics.find(r => r.id === id);
        if (relic) relic.restored = true;
      });
    }

    if (this.state.dualHall) {
      this.state.dualHall.sharedClues.forEach(id => {
        const clue = this.clues.find(c => c.id === id);
        if (clue) clue.collected = true;
      });
      Object.keys(this.state.dualHall.linkedMechanismProgress).forEach(mechId => {
        const mech = this.mechanisms.find(m => m.id === mechId);
        if (mech) {
          mech.linkedProgress = this.state.dualHall.linkedMechanismProgress[mechId];
        }
      });
    }

    if (this.state.visitorQuests) {
      this.state.visitorQuests.activeQuests.forEach(id => {
        const quest = this.visitorQuests.find(q => q.id === id);
        if (quest) quest.status = 'accepted';
      });
      this.state.visitorQuests.readyQuests.forEach(id => {
        const quest = this.visitorQuests.find(q => q.id === id);
        if (quest) quest.status = 'ready';
      });
      this.state.visitorQuests.deliveringQuests.forEach(id => {
        const quest = this.visitorQuests.find(q => q.id === id);
        if (quest) quest.status = 'delivering';
      });
      this.state.visitorQuests.completedQuests.forEach(id => {
        const quest = this.visitorQuests.find(q => q.id === id);
        if (quest) quest.status = 'completed';
      });
      Object.keys(this.state.visitorQuests.questProgress).forEach(questId => {
        const quest = this.visitorQuests.find(q => q.id === questId);
        if (quest && this.state.visitorQuests!.questProgress[questId]) {
          const progress = this.state.visitorQuests!.questProgress[questId];
          quest.requiredItems.forEach(item => {
            if (progress[item.id] && progress[item.id] >= item.quantity) {
              item.collected = true;
            }
          });
        }
      });
      this.updateQuestStatuses();
    }

    if (this.state.readingRoom) {
      this.state.readingRoom.unlockedCharacters.forEach(id => {
        const character = this.characters.find(c => c.id === id);
        if (character) character.unlocked = true;
      });
      this.state.readingRoom.unlockedEvents.forEach(id => {
        const event = this.timelineEvents.find(e => e.id === id);
        if (event) event.unlocked = true;
      });
    }

    if (this.state.authenticity) {
      this.state.authenticity.verifiedRelics.forEach(id => {
        const relic = this.authenticityRelics.find(r => r.id === id);
        if (relic) {
          relic.verified = true;
        }
      });
      Object.keys(this.state.authenticity.checkPointProgress).forEach(relicId => {
        const relic = this.authenticityRelics.find(r => r.id === relicId);
        if (relic) {
          const checkedIds = this.state.authenticity!.checkPointProgress[relicId];
          relic.checkPoints.forEach(cp => {
            if (checkedIds.includes(cp.id)) {
              cp.checked = true;
            }
          });
        }
      });
      this.state.authenticity.rewards.forEach((reward, index) => {
        if (this.authenticityRewards[index]) {
          this.authenticityRewards[index].claimed = reward.claimed;
        }
      });
    }

    if (this.state.memoryCorridor) {
      this.state.memoryCorridor.unlockedEndings.forEach(id => {
        const ending = this.endings.find(e => e.id === id);
        if (ending) ending.unlocked = true;
      });
      this.state.memoryCorridor.achievedEndings.forEach(id => {
        const ending = this.endings.find(e => e.id === id);
        if (ending) ending.achieved = true;
      });
      Object.keys(this.state.memoryCorridor.madeChoices).forEach(branchId => {
        const branch = this.branchChoices.find(b => b.id === branchId);
        if (branch) {
          branch.selectedChoiceId = this.state.memoryCorridor!.madeChoices[branchId];
        }
      });
    }

    if (this.state.breakpoint) {
      const bp = this.state.breakpoint;
      
      this.chapters.forEach(ch => {
        if (bp.narrativeProgress.completedKeyPoints) {
          ch.keyPoints?.forEach(kp => {
            if (bp.narrativeProgress.completedKeyPoints.includes(kp.id)) {
              kp.isCompleted = true;
            }
          });
        }
      });

      this.activeMechanismId = bp.mechanismProgress.activeMechanismId;
      this.mechanismInputState = { ...bp.mechanismProgress.mechanismInputState };
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  getClues(): Clue[] {
    return this.clues.map(c => ({ ...c }));
  }

  getClueById(id: string): Clue | undefined {
    return this.clues.find(c => c.id === id);
  }

  getExhibitions(): Exhibition[] {
    return this.exhibitions.map(e => ({ ...e }));
  }

  getExhibitionById(id: string): Exhibition | undefined {
    return this.exhibitions.find(e => e.id === id);
  }

  getChapters(): Chapter[] {
    return this.chapters.map(c => ({ ...c }));
  }

  getChapterById(chapterId: string): Chapter | undefined {
    return this.chapters.find(c => c.id === chapterId);
  }

  getCurrentChapter(): Chapter | undefined {
    return this.chapters.find(c => c.id === this.state.currentChapter);
  }

  getCurrentExhibition(): Exhibition | undefined {
    return this.exhibitions.find(e => e.id === this.state.currentExhibition);
  }

  getMechanisms(): Mechanism[] {
    return this.mechanisms.map(m => ({ ...m }));
  }

  getMechanismById(id: string): Mechanism | undefined {
    return this.mechanisms.find(m => m.id === id);
  }

  getCollectedClues(): Clue[] {
    return this.clues.filter(c => c.collected).map(c => ({ ...c }));
  }

  getMemoryFragments(chapterId: string): Clue[] {
    return this.clues.filter(c => c.chapterId === chapterId && c.isMemory && c.collected)
      .map(c => ({ ...c }));
  }

  collectClue(clueId: string): boolean {
    if (this.state.collectedClues.includes(clueId)) return false;

    const clue = this.clues.find(c => c.id === clueId);
    if (!clue) return false;

    clue.collected = true;
    this.state.collectedClues.push(clueId);

    this.checkAndUnlockRecordings(clueId);
    this.checkAndUnlockContent(clueId);
    this.checkAndUnlockBranchChoices(clueId);

    this.updateQuestProgressOnClueCollect(clueId);

    const currentChapter = this.getCurrentChapter();
    if (currentChapter) {
      const allCollected = currentChapter.requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );
      if (allCollected && !currentChapter.completed) {
        currentChapter.completed = true;
        eventBus.emit('chapter:complete', { chapterId: currentChapter.id });
      }
    }

    this.tryCompleteKeyPoints('clue', clueId);

    eventBus.emit('clue:collect', { clueId });
    this.saveToStorage();
    this.saveBreakpoint(false);
    return true;
  }

  investigateHotspot(hotspotId: string): boolean {
    if (this.state.investigatedHotspots.includes(hotspotId)) return false;
    this.state.investigatedHotspots.push(hotspotId);

    const exhibition = this.exhibitions.find(e =>
      e.hotspots.some(h => h.id === hotspotId)
    );
    if (exhibition) {
      const hotspot = exhibition.hotspots.find(h => h.id === hotspotId);
      if (hotspot) {
        hotspot.investigated = true;
      }
    }

    eventBus.emit('hotspot:investigate', { hotspotId });
    this.saveToStorage();
    return true;
  }

  isHotspotInvestigated(hotspotId: string): boolean {
    return this.state.investigatedHotspots.includes(hotspotId);
  }

  getInvestigatedHotspots(): string[] {
    return [...this.state.investigatedHotspots];
  }

  checkMechanismPassword(mechanismId: string, password: string): boolean {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || mech.type !== 'password') return false;
    if (this.state.solvedMechanisms.includes(mechanismId)) return false;
    
    this.recordMechanismAttempt(mechanismId);
    
    const isCorrect = password === mech.answer;
    if (isCorrect) {
      return this.solveMechanism(mechanismId, [`password:${password}`]);
    }
    return false;
  }

  solveMechanism(mechanismId: string, solutionPath: string[] = []): boolean {
    if (this.state.solvedMechanisms.includes(mechanismId)) return false;

    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) return false;

    const attempts = this.state.endingEvaluation.mechanismAttemptCounts[mechanismId] || 1;
    const hintsUsed = this.state.endingEvaluation.mechanismHintCounts[mechanismId] || 0;
    const startTime = this.state.endingEvaluation.mechanismStartTime[mechanismId] || Date.now();
    const solveTime = Date.now() - startTime;
    const isOptimal = attempts === 1 && hintsUsed === 0;

    const solveRecord: MechanismSolveRecord = {
      mechanismId,
      solvedAt: Date.now(),
      attempts,
      hintsUsed,
      solveTime,
      solutionPath,
      isOptimal
    };

    this.state.endingEvaluation.mechanismSolveRecords.push(solveRecord);
    if (isOptimal) {
      this.state.endingEvaluation.optimalMechanisms.push(mechanismId);
    }

    mech.solved = true;
    this.state.solvedMechanisms.push(mechanismId);

    if (mech.reward.startsWith('exhibition_')) {
      this.unlockExhibition(mech.reward);
      const chapter = this.chapters.find(ch => ch.exhibitions.includes(mech.reward));
      if (chapter) {
        this.unlockChapterRecordings(chapter.id);
      }
    }

    if (mech.reward === 'unlock_auth_final') {
      this.unlockExhibition('exhibition_auth_final');
      this.unlockExhibition('exhibition_auth_1');
      this.state.currentChapter = 'chapter_5';
      eventBus.emit('chapter:enter', { chapterId: 'chapter_5' });
    }

    if (mech.reward === 'start_memory_corridor') {
      this.unlockChapter('chapter_6');
      this.state.currentChapter = 'chapter_6';
      this.unlockExhibition('exhibition_corridor_entrance');
      this.startMemoryCorridor();
      this.unlockChapterRecordings('chapter_6');
      eventBus.emit('chapter:enter', { chapterId: 'chapter_6' });
    }

    if (mech.reward === 'unlock_corridor_phase_2') {
      this.completeMemoryCorridorPhase(2);
      this.unlockExhibition('exhibition_corridor_youth');
      this.unlockChapterRecordings('chapter_6');
    }

    if (mech.reward === 'unlock_corridor_phase_3') {
      this.completeMemoryCorridorPhase(3);
      this.unlockExhibition('exhibition_corridor_present');
    }

    if (mech.reward === 'unlock_corridor_final') {
      this.completeMemoryCorridorPhase(4);
      this.setMemoryComplete(true);
      this.unlockChapterCompleteRecording('chapter_6');
    }

    if (mech.reward === 'unlock_ending_hall') {
      this.unlockExhibition('exhibition_corridor_ending');
    }

    if (mech.reward === 'complete_memory_corridor') {
      this.unlockExhibition('exhibition_corridor_ending');
      const currentEndingId = this.state.memoryCorridor.currentEnding;
      if (!currentEndingId) {
        const finalEnding = this.determineEnding();
        if (finalEnding && !this.state.memoryCorridor.achievedEndings.includes(finalEnding.id)) {
          this.achieveEnding(finalEnding.id);
        }
      } else {
        const currentEnding = this.getEndingById(currentEndingId);
        if (currentEnding && !currentEnding.achieved) {
          this.achieveEnding(currentEndingId);
        }
      }
      this.endings.forEach(ending => {
        if (this.checkEndingUnlockConditions(ending.id)) {
          this.unlockEnding(ending.id);
        }
      });
      this.addTimelineEventIfNotExists('timeline_cor_complete');
      eventBus.emit('memorycorridor:complete');
    }

    this.tryCompleteKeyPoints('mechanism', mechanismId);

    eventBus.emit('mechanism:solve', { mechanismId, reward: mech.reward });
    this.saveToStorage();
    this.saveBreakpoint(false);
    return true;
  }

  unlockExhibition(exhibitionId: string): boolean {
    if (this.state.unlockedExhibitions.includes(exhibitionId)) return false;

    const exh = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exh) return false;

    exh.unlocked = true;
    this.state.unlockedExhibitions.push(exhibitionId);
    if (!this.newlyUnlockedExhibitions.includes(exhibitionId)) {
      this.newlyUnlockedExhibitions.push(exhibitionId);
    }

    eventBus.emit('exhibition:unlock', { exhibitionId });
    this.saveToStorage();
    return true;
  }

  setCurrentExhibition(exhibitionId: string): boolean {
    const exh = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exh || !exh.unlocked) return false;

    this.state.currentExhibition = exhibitionId;

    const chapter = this.chapters.find(ch => ch.exhibitions.includes(exhibitionId));
    if (chapter) {
      this.state.currentChapter = chapter.id;
      eventBus.emit('chapter:enter', { chapterId: chapter.id });
    }

    eventBus.emit('exhibition:enter', { exhibitionId });
    this.saveToStorage();
    this.saveBreakpoint(false);
    return true;
  }

  updateSettings(settings: Partial<GameSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    eventBus.emit('settings:update', { settings: this.state.settings });
    this.saveToStorage();
  }

  getSettings(): GameSettings {
    return { ...this.state.settings };
  }

  getRecordings(): AudioRecording[] {
    return this.recordings.map(r => ({ ...r }));
  }

  getRecordingById(id: string): AudioRecording | undefined {
    return this.recordings.find(r => r.id === id);
  }

  getUnlockedRecordings(): AudioRecording[] {
    return this.recordings.filter(r => r.unlocked).map(r => ({ ...r }));
  }

  getUnlockedExhibitions(): { id: string; name: string; chapterId: string }[] {
    return this.state.unlockedExhibitions.map(id => {
      const exhibition = this.exhibitions.find(e => e.id === id);
      const chapter = this.chapters.find(ch => ch.exhibitions.includes(id));
      return {
        id,
        name: exhibition?.name || id,
        chapterId: chapter?.id || ''
      };
    }).filter(e => e.name !== e.id);
  }

  getRecordingsByChapter(chapterId: string): AudioRecording[] {
    return this.recordings.filter(r => r.chapterId === chapterId).map(r => ({ ...r }));
  }

  getArchiveState(): ArchiveState {
    return { ...this.state.archive };
  }

  unlockRecording(recordingId: string): boolean {
    if (this.state.archive.unlockedRecordings.includes(recordingId)) return false;

    const rec = this.recordings.find(r => r.id === recordingId);
    if (!rec) return false;

    rec.unlocked = true;
    this.state.archive.unlockedRecordings.push(recordingId);

    eventBus.emit('recording:unlock', { recordingId });
    this.saveToStorage();
    this.saveBreakpoint(false);
    return true;
  }

  markRecordingAsPlayed(recordingId: string): boolean {
    if (this.state.archive.playedRecordings.includes(recordingId)) return false;
    if (!this.state.archive.unlockedRecordings.includes(recordingId)) return false;

    const rec = this.recordings.find(r => r.id === recordingId);
    if (!rec) return false;

    rec.played = true;
    this.state.archive.playedRecordings.push(recordingId);

    eventBus.emit('recording:play', { recordingId });
    this.saveToStorage();
    this.saveBreakpoint(false);
    return true;
  }

  archiveClue(clueId: string): boolean {
    if (this.state.archive.archivedClues.includes(clueId)) return false;
    if (!this.state.collectedClues.includes(clueId)) return false;

    const clue = this.clues.find(c => c.id === clueId);
    if (!clue) return false;

    const entry: ArchiveEntry = {
      id: `archive_${Date.now()}_${clueId}`,
      chapterId: clue.chapterId,
      clueId,
      archivedAt: Date.now(),
      notes: ''
    };

    this.state.archive.archivedClues.push(clueId);
    this.state.archive.archiveEntries.push(entry);

    eventBus.emit('clue:archived', { clueId, entry });
    this.saveToStorage();

    this.checkAndUnlockRecordings(clueId);
    return true;
  }

  getArchivedClues(): Clue[] {
    return this.clues.filter(c => this.state.archive.archivedClues.includes(c.id)).map(c => ({ ...c }));
  }

  getArchiveEntries(): ArchiveEntry[] {
    return this.state.archive.archiveEntries.map(e => ({ ...e }));
  }

  getArchiveEntriesByChapter(chapterId: string): ArchiveEntry[] {
    return this.state.archive.archiveEntries.filter(e => e.chapterId === chapterId).map(e => ({ ...e }));
  }

  completeChapterArchive(chapterId: string): boolean {
    if (this.state.archive.completedChapters.includes(chapterId)) return false;

    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return false;

    const allCluesArchived = chapter.requiredClues.every(id =>
      this.state.archive.archivedClues.includes(id)
    );
    if (!allCluesArchived) return false;

    this.state.archive.completedChapters.push(chapterId);

    eventBus.emit('archive:chapter-complete', { chapterId });
    this.saveToStorage();

    this.unlockChapterCompleteRecording(chapterId);
    return true;
  }

  isChapterArchiveComplete(chapterId: string): boolean {
    return this.state.archive.completedChapters.includes(chapterId);
  }

  completeChapter(chapterId: string): boolean {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter || chapter.completed) return false;

    chapter.completed = true;
    eventBus.emit('chapter:complete', { chapterId });
    this.saveToStorage();
    return true;
  }

  private checkAndUnlockRecordings(clueId: string): void {
    this.recordings.forEach(rec => {
      if (rec.unlocked) return;
      if (rec.requiredClues && rec.requiredClues.includes(clueId)) {
        const allCluesCollected = rec.requiredClues.every(
          id => this.state.collectedClues.includes(id)
        );
        if (allCluesCollected) {
          this.unlockRecording(rec.id);
        }
      }
    });
  }

  unlockChapterCompleteRecording(chapterId: string): void {
    const recording = this.recordings.find(
      r => r.chapterId === chapterId && r.requiredMemoryComplete
    );
    if (recording && !recording.unlocked) {
      this.unlockRecording(recording.id);
    }
  }

  unlockChapterRecordings(chapterId: string): void {
    const recording = this.recordings.find(
      r => r.chapterId === chapterId && r.id === `rec_${chapterId.split('_')[1]}_unlock`
    );
    if (recording && !recording.unlocked) {
      this.unlockRecording(recording.id);
    }
  }

  unlockFinalRecording(): void {
    const recording = this.recordings.find(r => r.id === 'rec_final');
    if (recording && !recording.unlocked) {
      this.unlockRecording(recording.id);
    }
  }

  resetGame(): void {
    localStorage.removeItem('amber-memory-hall-save');
    this.clues = JSON.parse(JSON.stringify(CLUES)).concat(JSON.parse(JSON.stringify(POWER_OUTAGE_CLUES)));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.exhibitions.forEach(exhibition => {
      exhibition.hotspots.forEach(hotspot => {
        if (hotspot.investigated === undefined) {
          hotspot.investigated = false;
        }
      });
    });
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS)).concat(JSON.parse(JSON.stringify(POWER_OUTAGE_MECHANISMS)));
    this.recordings = JSON.parse(JSON.stringify(RECORDINGS));
    this.nightEvents = JSON.parse(JSON.stringify(NIGHT_EVENTS));
    this.relics = JSON.parse(JSON.stringify(RELICS));
    this.restorationMaterials = JSON.parse(JSON.stringify(RESTORATION_MATERIALS));
    this.visitorQuests = JSON.parse(JSON.stringify(VISITOR_QUESTS));
    this.characters = JSON.parse(JSON.stringify(CHARACTERS));
    this.timelineEvents = JSON.parse(JSON.stringify(TIMELINE_EVENTS));
    this.authenticityRelics = JSON.parse(JSON.stringify(AUTHENTICITY_RELICS));
    this.authenticityRewards = JSON.parse(JSON.stringify(AUTHENTICITY_REWARDS));
    this.endings = JSON.parse(JSON.stringify(ENDINGS));
    this.branchChoices = JSON.parse(JSON.stringify(BRANCH_CHOICES));
    this.hiddenHotspots = JSON.parse(JSON.stringify(HIDDEN_HOTSPOTS));
    this.timedMechanisms = JSON.parse(JSON.stringify(TIMED_MECHANISMS));
    this.powerOutageEvents = JSON.parse(JSON.stringify(POWER_OUTAGE_EVENTS));
    this.chapterStartTime = Date.now();
    this.state = {
      currentChapter: 'chapter_1',
      currentExhibition: 'exhibition_1',
      collectedClues: [],
      solvedMechanisms: [],
      unlockedExhibitions: ['exhibition_1', 'exhibition_2', 'exhibition_3'],
      investigatedHotspots: [],
      settings: this.state.settings,
      archive: {
        unlockedRecordings: ['rec_intro', 'rec_ch1_unlock'],
        playedRecordings: [],
        archivedClues: [],
        archiveEntries: [],
        completedChapters: []
      },
      nightPatrol: {
        mode: 'day',
        activeEvents: [],
        resolvedEvents: [],
        resetMechanisms: [],
        patrolStartTime: 0,
        totalEventsResolved: 0,
        powerOutage: {
          active: false,
          currentPhase: 'idle',
          currentExhibitionId: '',
          activeEvents: [],
          completedEvents: [],
          lightingState: 'normal',
          revealedHotspots: [],
          activeTimedMechanisms: [],
          completedTimedMechanisms: [],
          failedTimedMechanisms: [],
          eventStartTime: 0,
          totalPowerOutages: 0
        }
      },
      restoration: {
        collectedMaterials: [],
        restoredRelics: [],
        currentRestoration: null
      },
      dualHall: {
        activeHall: 'history',
        historyProgress: 0,
        artProgress: 0,
        sharedClues: [],
        unlockedHalls: [],
        linkedMechanismProgress: {},
        currentInvestigationPhase: 1
      },
      visitorQuests: {
        activeQuests: [],
        completedQuests: [],
        readyQuests: [],
        deliveringQuests: [],
        questProgress: {},
        chapterEvaluations: [],
        totalScore: 0,
        currentChapterScore: 0,
        questHistory: []
      },
      readingRoom: {
        unlockedCharacters: ['char_amber'],
        unlockedEvents: ['event_amber_birth'],
        viewedCharacters: [],
        viewedEvents: [],
        searchHistory: [],
        favoriteClues: []
      },
      authenticity: {
        currentRelic: null,
        verifiedRelics: [],
        checkPointProgress: {},
        derivedPassword: '',
        attempts: 0,
        maxAttempts: 3,
        rewards: JSON.parse(JSON.stringify(AUTHENTICITY_REWARDS))
      },
      memoryCorridor: {
        currentPhase: 1,
        completedPhases: [],
        unlockedEndings: [],
        achievedEndings: [],
        madeChoices: {},
        fragmentSortingProgress: 0,
        isMemoryComplete: false,
        currentEnding: null
      },
      memoryPuzzleRecovery: {},
      breakpoint: {
        currentExhibition: 'exhibition_1',
        currentChapter: 'chapter_1',
        mechanismProgress: {
          solvedMechanisms: [],
          activeMechanismId: null,
          mechanismInputState: {},
          linkedMechanismProgress: {}
        },
        narrativeProgress: {
          triggeredStoryNodes: [],
          completedKeyPoints: [],
          playedRecordings: [],
          unlockedTimelineEvents: [],
          madeBranchChoices: {},
          viewedCharacters: [],
          viewedEvents: []
        },
        savedAt: Date.now(),
        playTime: 0,
        autoSave: false
      },
      endingEvaluation: {
        mechanismSolveRecords: [],
        sideQuestProgress: [],
        hiddenCluesCollected: [],
        mechanismAttemptCounts: {},
        mechanismHintCounts: {},
        mechanismStartTime: {},
        optimalMechanisms: []
      }
    };
    this.gameStartTime = Date.now();
    this.activeMechanismId = null;
    this.mechanismInputState = {};
    this.applyStateToData();
    this.saveBreakpoint(false);
    eventBus.emit('game:reset');
  }

  checkMemoryOrder(fragmentIds: string[]): boolean {
    const fragments = fragmentIds.map(id => this.getClueById(id)).filter(Boolean) as Clue[];
    for (let i = 0; i < fragments.length; i++) {
      if (fragments[i].memoryOrder !== i + 1) return false;
    }
    return true;
  }

  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveTimer = window.setInterval(() => {
      this.saveBreakpoint(true);
    }, GAME_CONFIG.AUTO_SAVE_INTERVAL || 30000);
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  saveBreakpoint(autoSave: boolean = false): boolean {
    try {
      const playTime = Date.now() - this.gameStartTime;

      const narrativeProgress: NarrativeProgress = {
        triggeredStoryNodes: [...this.state.breakpoint.narrativeProgress.triggeredStoryNodes],
        completedKeyPoints: [...this.state.breakpoint.narrativeProgress.completedKeyPoints],
        playedRecordings: [...this.state.archive.playedRecordings],
        unlockedTimelineEvents: [...this.state.readingRoom.unlockedEvents],
        madeBranchChoices: { ...this.state.memoryCorridor.madeChoices },
        viewedCharacters: [...this.state.readingRoom.viewedCharacters],
        viewedEvents: [...this.state.readingRoom.viewedEvents]
      };

      const mechanismProgress: MechanismProgress = {
        solvedMechanisms: [...this.state.solvedMechanisms],
        activeMechanismId: this.activeMechanismId,
        mechanismInputState: { ...this.mechanismInputState },
        linkedMechanismProgress: { ...this.state.dualHall.linkedMechanismProgress }
      };

      const breakpoint: BreakpointState = {
        currentExhibition: this.state.currentExhibition,
        currentChapter: this.state.currentChapter,
        mechanismProgress,
        narrativeProgress,
        savedAt: Date.now(),
        playTime,
        autoSave
      };

      this.state.breakpoint = breakpoint;
      this.saveToStorage();
      eventBus.emit('breakpoint:saved', { breakpoint, autoSave });
      return true;
    } catch (e) {
      console.error('Failed to save breakpoint:', e);
      return false;
    }
  }

  hasBreakpoint(): boolean {
    return this.state.breakpoint && 
           this.state.breakpoint.playTime > 0 &&
           this.state.breakpoint.savedAt > 0;
  }

  getBreakpoint(): BreakpointState | null {
    if (!this.hasBreakpoint()) return null;
    return { ...this.state.breakpoint };
  }

  getNarrativeProgressSummary(): {
    triggeredStoryNodes: string[];
    completedKeyPoints: string[];
    playedRecordings: string[];
    totalStoryNodes: number;
    totalKeyPoints: number;
  } {
    const allKeyPoints = this.chapters.flatMap(ch => ch.keyPoints || []);
    return {
      triggeredStoryNodes: [...this.state.breakpoint.narrativeProgress.triggeredStoryNodes],
      completedKeyPoints: [...this.state.breakpoint.narrativeProgress.completedKeyPoints],
      playedRecordings: [...this.state.archive.playedRecordings],
      totalStoryNodes: this.state.breakpoint.narrativeProgress.triggeredStoryNodes.length,
      totalKeyPoints: allKeyPoints.length
    };
  }

  getPlayTime(): number {
    return Date.now() - this.gameStartTime;
  }

  setActiveMechanism(mechanismId: string | null): void {
    this.activeMechanismId = mechanismId;
    if (mechanismId && !this.state.endingEvaluation.mechanismStartTime[mechanismId]) {
      this.state.endingEvaluation.mechanismStartTime[mechanismId] = Date.now();
    }
    if (mechanismId) {
      this.saveBreakpoint(false);
    }
  }

  recordMechanismAttempt(mechanismId: string): void {
    if (!this.state.solvedMechanisms.includes(mechanismId)) {
      this.state.endingEvaluation.mechanismAttemptCounts[mechanismId] = 
        (this.state.endingEvaluation.mechanismAttemptCounts[mechanismId] || 0) + 1;
      this.saveToStorage();
    }
  }

  recordMechanismHintUsed(mechanismId: string): void {
    if (!this.state.solvedMechanisms.includes(mechanismId)) {
      this.state.endingEvaluation.mechanismHintCounts[mechanismId] = 
        (this.state.endingEvaluation.mechanismHintCounts[mechanismId] || 0) + 1;
      this.saveToStorage();
    }
  }

  getMechanismSolveRecord(mechanismId: string): MechanismSolveRecord | undefined {
    return this.state.endingEvaluation.mechanismSolveRecords.find(r => r.mechanismId === mechanismId);
  }

  collectHiddenClue(clueId: string): boolean {
    if (this.state.endingEvaluation.hiddenCluesCollected.includes(clueId)) return false;
    
    const clue = this.clues.find(c => c.id === clueId);
    if (!clue) return false;

    this.state.endingEvaluation.hiddenCluesCollected.push(clueId);
    const collected = this.collectClue(clueId);
    
    eventBus.emit('hiddenclue:collect', { clueId });
    this.saveToStorage();
    return collected;
  }

  getHiddenCluesCollected(): string[] {
    return [...this.state.endingEvaluation.hiddenCluesCollected];
  }

  updateSideQuestProgress(questId: string, completed: boolean, choicesMade: string[] = []): boolean {
    const existingIndex = this.state.endingEvaluation.sideQuestProgress.findIndex(q => q.questId === questId);
    
    if (existingIndex >= 0) {
      if (this.state.endingEvaluation.sideQuestProgress[existingIndex].completed) return false;
      this.state.endingEvaluation.sideQuestProgress[existingIndex] = {
        ...this.state.endingEvaluation.sideQuestProgress[existingIndex],
        completed,
        completedAt: completed ? Date.now() : undefined,
        choicesMade: [...this.state.endingEvaluation.sideQuestProgress[existingIndex].choicesMade, ...choicesMade]
      };
    } else {
      this.state.endingEvaluation.sideQuestProgress.push({
        questId,
        completed,
        completedAt: completed ? Date.now() : undefined,
        choicesMade
      });
    }

    eventBus.emit('sidequest:update', { questId, completed });
    this.saveToStorage();
    return true;
  }

  getSideQuestProgress(questId: string): SideQuestProgress | undefined {
    return this.state.endingEvaluation.sideQuestProgress.find(q => q.questId === questId);
  }

  getCompletedSideQuests(): string[] {
    return this.state.endingEvaluation.sideQuestProgress
      .filter(q => q.completed)
      .map(q => q.questId);
  }

  setMechanismInput(mechanismId: string, input: string): void {
    this.mechanismInputState[mechanismId] = input;
  }

  getMechanismInput(mechanismId: string): string {
    return this.mechanismInputState[mechanismId] || '';
  }

  clearMechanismInput(mechanismId: string): void {
    delete this.mechanismInputState[mechanismId];
  }

  completeKeyPoint(keyPointId: string): boolean {
    if (this.state.breakpoint.narrativeProgress.completedKeyPoints.includes(keyPointId)) {
      return false;
    }
    this.state.breakpoint.narrativeProgress.completedKeyPoints.push(keyPointId);
    this.saveBreakpoint(false);
    eventBus.emit('keypoint:complete', { keyPointId });
    return true;
  }

  isKeyPointCompleted(keyPointId: string): boolean {
    return this.state.breakpoint.narrativeProgress.completedKeyPoints.includes(keyPointId);
  }

  private tryCompleteKeyPoints(type: string, targetId: string): void {
    this.chapters.forEach(chapter => {
      chapter.keyPoints?.forEach(kp => {
        if (kp.type === type && kp.targetId === targetId && !kp.isCompleted) {
          this.completeKeyPoint(kp.id);
        }
      });
    });
  }

  triggerStoryNode(storyNode: string): boolean {
    if (this.state.breakpoint.narrativeProgress.triggeredStoryNodes.includes(storyNode)) {
      return false;
    }
    this.state.breakpoint.narrativeProgress.triggeredStoryNodes.push(storyNode);
    this.saveBreakpoint(false);
    eventBus.emit('story:trigger', { storyNode });
    return true;
  }

  hasTriggeredStoryNode(storyNode: string): boolean {
    return this.state.breakpoint.narrativeProgress.triggeredStoryNodes.includes(storyNode);
  }

  resumeFromBreakpoint(): boolean {
    if (!this.hasBreakpoint()) return false;

    const breakpoint = this.state.breakpoint;
    
    this.gameStartTime = Date.now() - breakpoint.playTime;
    this.activeMechanismId = breakpoint.mechanismProgress.activeMechanismId;
    this.mechanismInputState = { ...breakpoint.mechanismProgress.mechanismInputState };

    if (breakpoint.currentChapter && this.state.currentChapter !== breakpoint.currentChapter) {
      this.state.currentChapter = breakpoint.currentChapter;
    }

    if (breakpoint.currentExhibition && this.state.currentExhibition !== breakpoint.currentExhibition) {
      this.state.currentExhibition = breakpoint.currentExhibition;
    }

    if (breakpoint.narrativeProgress.triggeredStoryNodes) {
      this.state.breakpoint.narrativeProgress.triggeredStoryNodes = [...breakpoint.narrativeProgress.triggeredStoryNodes];
    }

    if (breakpoint.narrativeProgress.completedKeyPoints) {
      this.state.breakpoint.narrativeProgress.completedKeyPoints = [...breakpoint.narrativeProgress.completedKeyPoints];
    }

    this.applyStateToData();
    this.saveToStorage();

    eventBus.emit('breakpoint:resume', { breakpoint });

    setTimeout(() => {
      this.resumeNarrativePlayback(breakpoint);
    }, 1000);

    return true;
  }

  private resumeNarrativePlayback(breakpoint: BreakpointState): void {
    const currentChapterId = breakpoint.currentChapter;
    const pendingRecordings = this.recordings.filter(r => 
      r.unlocked && !r.played && r.chapterId === currentChapterId
    );

    pendingRecordings.forEach((recording, index) => {
      setTimeout(() => {
        if (!store.getRecordingById(recording.id)?.played) {
          eventBus.emit('recording:auto-play', { recordingId: recording.id });
        }
      }, index * 2500);
    });

    if (breakpoint.narrativeProgress.unlockedTimelineEvents) {
      breakpoint.narrativeProgress.unlockedTimelineEvents.forEach(eventId => {
        this.addTimelineEventIfNotExists(eventId);
      });
    }

    if (breakpoint.narrativeProgress.madeBranchChoices) {
      Object.entries(breakpoint.narrativeProgress.madeBranchChoices).forEach(([branchId, choiceId]) => {
        const branch = this.branchChoices.find(b => b.id === branchId);
        if (branch && branch.selectedChoiceId === null) {
          branch.selectedChoiceId = choiceId;
          this.state.memoryCorridor.madeChoices[branchId] = choiceId;
        }
      });
    }

    eventBus.emit('breakpoint:narrative-resumed', { breakpoint });
  }

  getNightPatrolState(): NightPatrolState {
    return { ...this.state.nightPatrol };
  }

  getExhibitionMode(): ExhibitionMode {
    return this.state.nightPatrol.mode;
  }

  setExhibitionMode(mode: ExhibitionMode): boolean {
    if (this.state.nightPatrol.mode === mode) return false;

    this.state.nightPatrol.mode = mode;

    if (mode === 'night') {
      this.state.nightPatrol.patrolStartTime = Date.now();
      this.state.nightPatrol.activeEvents = [];
      this.state.nightPatrol.resolvedEvents = [];
      this.resetNightEvents();
      eventBus.emit('nightpatrol:start');
    } else {
      this.state.nightPatrol.activeEvents = [];
      this.restoreMechanisms();
      eventBus.emit('nightpatrol:end');
    }

    eventBus.emit('exhibition:mode-change', { mode });
    this.saveToStorage();
    return true;
  }

  private resetNightEvents(): void {
    this.nightEvents.forEach(event => {
      event.triggered = false;
      event.resolved = false;
    });
  }

  getNightEvents(): NightEvent[] {
    return this.nightEvents.map(e => ({ ...e }));
  }

  getNightEventsByExhibition(exhibitionId: string): NightEvent[] {
    return this.nightEvents.filter(e => e.exhibitionId === exhibitionId).map(e => ({ ...e }));
  }

  getActiveNightEvents(exhibitionId: string): NightEvent[] {
    return this.nightEvents.filter(
      e => e.exhibitionId === exhibitionId && e.triggered && !e.resolved
    ).map(e => ({ ...e }));
  }

  getNightEventById(eventId: string): NightEvent | undefined {
    return this.nightEvents.find(e => e.id === eventId);
  }

  triggerRandomNightEvent(exhibitionId: string): NightEvent | null {
    if (this.state.nightPatrol.mode !== 'night') return null;

    const availableEvents = this.nightEvents.filter(
      e => e.exhibitionId === exhibitionId && !e.triggered && !e.resolved
    );

    if (availableEvents.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    const event = availableEvents[randomIndex];

    event.triggered = true;
    this.state.nightPatrol.activeEvents.push(event.id);

    eventBus.emit('nightpatrol:event-trigger', { eventId: event.id, event });
    this.saveToStorage();

    return { ...event };
  }

  resolveNightEvent(eventId: string): boolean {
    const event = this.nightEvents.find(e => e.id === eventId);
    if (!event || event.resolved) return false;

    event.resolved = true;
    this.state.nightPatrol.resolvedEvents.push(eventId);
    this.state.nightPatrol.activeEvents = this.state.nightPatrol.activeEvents.filter(id => id !== eventId);
    this.state.nightPatrol.totalEventsResolved++;

    if (event.reward && event.reward.startsWith('clue_')) {
      this.collectClue(event.reward);
    }

    eventBus.emit('nightpatrol:event-resolve', { eventId, event });
    this.saveToStorage();

    return true;
  }

  resetMechanism(mechanismId: string): boolean {
    if (this.state.nightPatrol.mode !== 'night') return false;
    if (!this.state.solvedMechanisms.includes(mechanismId)) return false;
    if (this.state.nightPatrol.resetMechanisms.includes(mechanismId)) return false;

    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) return false;

    mech.solved = false;
    this.state.solvedMechanisms = this.state.solvedMechanisms.filter(id => id !== mechanismId);
    this.state.nightPatrol.resetMechanisms.push(mechanismId);

    eventBus.emit('nightpatrol:mechanism-reset', { mechanismId });
    this.saveToStorage();

    return true;
  }

  private restoreMechanisms(): void {
    this.state.nightPatrol.resetMechanisms.forEach(mechanismId => {
      const mech = this.mechanisms.find(m => m.id === mechanismId);
      if (mech) {
        mech.solved = true;
        if (!this.state.solvedMechanisms.includes(mechanismId)) {
          this.state.solvedMechanisms.push(mechanismId);
        }
      }
    });
    this.state.nightPatrol.resetMechanisms = [];
  }

  getTotalEventsResolved(): number {
    return this.state.nightPatrol.totalEventsResolved;
  }

  getPowerOutageState(): PowerOutageState {
    return { ...this.state.nightPatrol.powerOutage };
  }

  getLightingState(): LightingState {
    return this.state.nightPatrol.powerOutage.lightingState;
  }

  setLightingState(lightingState: LightingState): boolean {
    if (this.state.nightPatrol.powerOutage.lightingState === lightingState) return false;

    this.state.nightPatrol.powerOutage.lightingState = lightingState;
    eventBus.emit('poweroutage:lighting-change', { lightingState });
    this.saveToStorage();
    return true;
  }

  startPowerOutage(exhibitionId: string = 'exhibition_1'): boolean {
    if (this.state.nightPatrol.powerOutage.active) return false;

    this.state.nightPatrol.powerOutage.active = true;
    this.state.nightPatrol.powerOutage.currentPhase = 'warning';
    this.state.nightPatrol.powerOutage.currentExhibitionId = exhibitionId;
    this.state.nightPatrol.powerOutage.eventStartTime = Date.now();
    this.state.nightPatrol.powerOutage.totalPowerOutages++;

    eventBus.emit('poweroutage:start', { exhibitionId });
    this.saveToStorage();

    setTimeout(() => {
      this.advancePowerOutagePhase();
    }, GAME_CONFIG.POWER_OUTAGE.WARNING_DURATION);

    return true;
  }

  private advancePowerOutagePhase(): void {
    const currentPhase = this.state.nightPatrol.powerOutage.currentPhase;
    const currentExhibitionId = this.state.nightPatrol.powerOutage.currentExhibitionId;

    const phaseOrder: PowerOutagePhase[] = ['warning', 'outage', 'recovery', 'complete'];
    const currentIndex = phaseOrder.indexOf(currentPhase);

    if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      this.state.nightPatrol.powerOutage.currentPhase = nextPhase;

      const nextEvent = this.powerOutageEvents.find(
        e => e.phase === nextPhase && e.exhibitionId === currentExhibitionId && !e.triggered
      );

      if (nextEvent) {
        this.triggerPowerOutageEvent(nextEvent.id);
      } else if (nextPhase === 'complete') {
        this.endPowerOutage();
      }
    }
  }

  triggerPowerOutageEvent(eventId: string): PowerOutageEvent | null {
    const event = this.powerOutageEvents.find(e => e.id === eventId);
    if (!event || event.triggered) return null;

    event.triggered = true;
    this.state.nightPatrol.powerOutage.activeEvents.push(eventId);
    this.state.nightPatrol.powerOutage.currentExhibitionId = event.exhibitionId;

    this.setLightingState(event.lightingState);

    event.revealHiddenHotspots.forEach(hotspotId => {
      this.revealHiddenHotspot(hotspotId);
    });

    event.triggerTimedMechanisms.forEach(timedMechId => {
      this.startTimedMechanism(timedMechId);
    });

    eventBus.emit('poweroutage:event-trigger', { eventId, event });
    this.saveToStorage();

    if (event.duration > 0) {
      setTimeout(() => {
        this.completePowerOutageEvent(eventId);
      }, event.duration);
    }

    return { ...event };
  }

  completePowerOutageEvent(eventId: string): boolean {
    const event = this.powerOutageEvents.find(e => e.id === eventId);
    if (!event || event.completed) return false;

    event.completed = true;
    this.state.nightPatrol.powerOutage.completedEvents.push(eventId);
    this.state.nightPatrol.powerOutage.activeEvents = this.state.nightPatrol.powerOutage.activeEvents.filter(id => id !== eventId);

    if (event.phase === 'outage') {
      const remainingOutageEvents = this.powerOutageEvents.filter(
        e => e.phase === 'outage' && e.exhibitionId === event.exhibitionId && !e.completed
      );
      if (remainingOutageEvents.length === 0) {
        setTimeout(() => {
          this.advancePowerOutagePhase();
        }, 2000);
      }
    }

    eventBus.emit('poweroutage:event-complete', { eventId, event });
    this.saveToStorage();
    return true;
  }

  endPowerOutage(): boolean {
    if (!this.state.nightPatrol.powerOutage.active) return false;

    this.state.nightPatrol.powerOutage.active = false;
    this.state.nightPatrol.powerOutage.currentPhase = 'complete';
    this.state.nightPatrol.powerOutage.lightingState = 'normal';

    this.timedMechanisms.forEach(mech => {
      if (mech.active && !mech.completed && !mech.failed) {
        this.failTimedMechanism(mech.id);
      }
    });

    eventBus.emit('poweroutage:end', {});
    eventBus.emit('poweroutage:lighting-change', { lightingState: 'normal' });
    this.saveToStorage();
    return true;
  }

  getPowerOutageEvents(): PowerOutageEvent[] {
    return this.powerOutageEvents.map(e => ({ ...e }));
  }

  getActivePowerOutageEvents(exhibitionId?: string): PowerOutageEvent[] {
    return this.powerOutageEvents.filter(e => {
      const matchesExhibition = exhibitionId ? e.exhibitionId === exhibitionId : true;
      return matchesExhibition && e.triggered && !e.completed;
    }).map(e => ({ ...e }));
  }

  getPowerOutageEventById(eventId: string): PowerOutageEvent | undefined {
    return this.powerOutageEvents.find(e => e.id === eventId);
  }

  getHiddenHotspots(): HiddenHotspot[] {
    return this.hiddenHotspots.map(h => ({ ...h }));
  }

  getVisibleHiddenHotspots(lightingState: LightingState): HiddenHotspot[] {
    return this.hiddenHotspots.filter(h => {
      const isRevealed = this.state.nightPatrol.powerOutage.revealedHotspots.includes(h.id);
      const lightingMatch = !h.requiredLighting || h.requiredLighting === lightingState;
      return h.visibleInDark && isRevealed && lightingMatch;
    }).map(h => ({ ...h }));
  }

  getRevealedHiddenHotspots(): HiddenHotspot[] {
    return this.hiddenHotspots.filter(h =>
      this.state.nightPatrol.powerOutage.revealedHotspots.includes(h.id)
    ).map(h => ({ ...h }));
  }

  getHiddenHotspotById(hotspotId: string): HiddenHotspot | undefined {
    return this.hiddenHotspots.find(h => h.id === hotspotId);
  }

  revealHiddenHotspot(hotspotId: string): boolean {
    if (this.state.nightPatrol.powerOutage.revealedHotspots.includes(hotspotId)) return false;

    const hotspot = this.hiddenHotspots.find(h => h.id === hotspotId);
    if (!hotspot) return false;

    this.state.nightPatrol.powerOutage.revealedHotspots.push(hotspotId);
    eventBus.emit('poweroutage:hotspot-reveal', { hotspotId, hotspot });
    this.saveToStorage();
    return true;
  }

  interactWithHiddenHotspot(hotspotId: string): { success: boolean; type: string; targetId: string; reason?: string } {
    const hotspot = this.hiddenHotspots.find(h => h.id === hotspotId);
    if (!hotspot) return { success: false, type: 'unknown', targetId: '', reason: '热点不存在' };
    if (!this.state.nightPatrol.powerOutage.revealedHotspots.includes(hotspotId)) {
      return { success: false, type: hotspot.type, targetId: hotspot.targetId, reason: '热点未显现' };
    }

    const currentLighting = this.state.nightPatrol.powerOutage.lightingState;
    if (hotspot.requiredLighting && hotspot.requiredLighting !== currentLighting) {
      return { success: false, type: hotspot.type, targetId: hotspot.targetId, reason: '照明状态不匹配' };
    }

    if (hotspot.type === 'clue') {
      const collected = this.collectClue(hotspot.targetId);
      if (collected) {
        hotspot.activated = true;
        eventBus.emit('poweroutage:hotspot-interact', { hotspotId, hotspot, result: 'collected' });
        this.saveToStorage();
        return { success: true, type: 'clue', targetId: hotspot.targetId };
      }
      return { success: false, type: 'clue', targetId: hotspot.targetId, reason: '线索已收集' };
    } else if (hotspot.type === 'mechanism') {
      return { success: true, type: 'mechanism', targetId: hotspot.targetId };
    } else if (hotspot.type === 'story') {
      hotspot.activated = true;
      eventBus.emit('poweroutage:hotspot-interact', { hotspotId, hotspot, result: 'story' });
      this.saveToStorage();
      return { success: true, type: 'story', targetId: hotspot.targetId };
    }

    return { success: false, type: hotspot.type, targetId: hotspot.targetId, reason: '未知交互类型' };
  }

  getTimedMechanisms(): TimedMechanism[] {
    return this.timedMechanisms.map(m => ({ ...m }));
  }

  getTimedMechanismById(mechId: string): TimedMechanism | undefined {
    return this.timedMechanisms.find(m => m.id === mechId);
  }

  getActiveTimedMechanisms(exhibitionId?: string): TimedMechanism[] {
    return this.timedMechanisms.filter(m => {
      const matchesExhibition = exhibitionId ? m.exhibitionId === exhibitionId : true;
      return matchesExhibition && m.active && !m.completed && !m.failed;
    }).map(m => ({ ...m }));
  }

  startTimedMechanism(timedMechId: string): boolean {
    const timedMech = this.timedMechanisms.find(m => m.id === timedMechId);
    if (!timedMech || timedMech.active || timedMech.completed || timedMech.failed) return false;

    const now = Date.now();
    timedMech.active = true;
    timedMech.startTime = now;
    timedMech.endTime = now + timedMech.timeLimit * 1000;

    this.state.nightPatrol.powerOutage.activeTimedMechanisms.push(timedMechId);

    eventBus.emit('poweroutage:timed-mechanism-start', { timedMechId, timedMech });
    this.saveToStorage();

    setTimeout(() => {
      const currentMech = this.timedMechanisms.find(m => m.id === timedMechId);
      if (currentMech && currentMech.active && !currentMech.completed) {
        this.failTimedMechanism(timedMechId);
      }
    }, timedMech.timeLimit * 1000);

    return true;
  }

  getRemainingTimeForMechanism(timedMechId: string): number {
    const timedMech = this.timedMechanisms.find(m => m.id === timedMechId);
    if (!timedMech || !timedMech.active || timedMech.completed || timedMech.failed) return 0;

    const remaining = timedMech.endTime - Date.now();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  completeTimedMechanism(timedMechId: string): boolean {
    const timedMech = this.timedMechanisms.find(m => m.id === timedMechId);
    if (!timedMech || !timedMech.active || timedMech.completed || timedMech.failed) return false;

    const remaining = this.getRemainingTimeForMechanism(timedMechId);
    if (remaining <= 0) {
      this.failTimedMechanism(timedMechId);
      return false;
    }

    timedMech.completed = true;
    timedMech.active = false;

    this.state.nightPatrol.powerOutage.activeTimedMechanisms = this.state.nightPatrol.powerOutage.activeTimedMechanisms.filter(id => id !== timedMechId);
    this.state.nightPatrol.powerOutage.completedTimedMechanisms.push(timedMechId);

    if (timedMech.reward) {
      if (timedMech.reward.startsWith('clue_')) {
        this.collectClue(timedMech.reward);
      } else if (timedMech.reward === 'complete_power_outage') {
        this.endPowerOutage();
      }
    }

    eventBus.emit('poweroutage:timed-mechanism-complete', { timedMechId, timedMech, remaining });
    this.saveToStorage();
    return true;
  }

  failTimedMechanism(timedMechId: string): boolean {
    const timedMech = this.timedMechanisms.find(m => m.id === timedMechId);
    if (!timedMech || timedMech.completed || timedMech.failed) return false;

    timedMech.failed = true;
    timedMech.active = false;

    this.state.nightPatrol.powerOutage.activeTimedMechanisms = this.state.nightPatrol.powerOutage.activeTimedMechanisms.filter(id => id !== timedMechId);
    this.state.nightPatrol.powerOutage.failedTimedMechanisms.push(timedMechId);

    eventBus.emit('poweroutage:timed-mechanism-fail', { timedMechId, timedMech });
    this.saveToStorage();
    return true;
  }

  checkTimedMechanismPassword(timedMechId: string, password: string): boolean {
    const timedMech = this.timedMechanisms.find(m => m.id === timedMechId);
    if (!timedMech || !timedMech.active || timedMech.completed || timedMech.failed) return false;

    const mech = this.mechanisms.find(m => m.id === timedMech.mechanismId);
    if (!mech || mech.type !== 'password') return false;

    return password === mech.answer;
  }

  solveTimedMechanism(timedMechId: string): boolean {
    const timedMech = this.timedMechanisms.find(m => m.id === timedMechId);
    if (!timedMech || !timedMech.active || timedMech.completed || timedMech.failed) return false;

    const mech = this.mechanisms.find(m => m.id === timedMech.mechanismId);
    if (mech) {
      mech.solved = true;
      if (!this.state.solvedMechanisms.includes(mech.id)) {
        this.state.solvedMechanisms.push(mech.id);
      }
      eventBus.emit('mechanism:solve', { mechanismId: mech.id, reward: mech.reward });
    }

    return this.completeTimedMechanism(timedMechId);
  }

  getRestorationMaterials(): RestorationMaterial[] {
    return this.restorationMaterials.map(m => ({ ...m }));
  }

  getRestorationMaterialById(id: string): RestorationMaterial | undefined {
    return this.restorationMaterials.find(m => m.id === id);
  }

  getRelics(): Relic[] {
    return this.relics.map(r => ({ ...r }));
  }

  getRelicById(id: string): Relic | undefined {
    return this.relics.find(r => r.id === id);
  }

  getRestorationState(): RestorationState {
    return { ...this.state.restoration };
  }

  collectMaterial(materialId: string): boolean {
    if (this.state.restoration.collectedMaterials.includes(materialId)) return false;

    const material = this.restorationMaterials.find(m => m.id === materialId);
    if (!material) return false;

    material.collected = true;
    this.state.restoration.collectedMaterials.push(materialId);

    eventBus.emit('restoration:material-collect', { materialId });
    this.saveToStorage();
    return true;
  }

  restoreRelic(relicId: string): boolean {
    if (this.state.restoration.restoredRelics.includes(relicId)) return false;

    const relic = this.relics.find(r => r.id === relicId);
    if (!relic) return false;

    relic.restored = true;
    this.state.restoration.restoredRelics.push(relicId);

    eventBus.emit('restoration:relic-restored', { relicId });
    this.saveToStorage();
    return true;
  }

  checkRestorationOrder(relicId: string, stepOrder: number[]): boolean {
    const relic = this.relics.find(r => r.id === relicId);
    if (!relic) return false;

    const correctOrder = relic.steps.map(s => s.order).sort((a, b) => a - b);
    if (stepOrder.length !== correctOrder.length) return false;

    return stepOrder.every((val, idx) => val === correctOrder[idx]);
  }

  setCurrentRestoration(relicId: string | null): void {
    this.state.restoration.currentRestoration = relicId;
    this.saveToStorage();
  }

  getDualHallState(): DualHallState {
    return { ...this.state.dualHall };
  }

  switchHall(hallType: HallType): boolean {
    if (!this.state.dualHall.unlockedHalls.includes(hallType)) {
      return false;
    }
    this.state.dualHall.activeHall = hallType;
    eventBus.emit('dualhall:switch', { hallType });
    this.saveToStorage();
    return true;
  }

  unlockHall(hallType: HallType): boolean {
    if (this.state.dualHall.unlockedHalls.includes(hallType)) {
      return false;
    }
    this.state.dualHall.unlockedHalls.push(hallType);
    eventBus.emit('dualhall:unlock', { hallType });
    this.saveToStorage();
    return true;
  }

  canCollectClue(clueId: string): boolean {
    const clue = this.clues.find(c => c.id === clueId);
    if (!clue) return false;
    if (this.state.collectedClues.includes(clueId)) return false;

    if (clue.isShared && clue.requiredClueFromOtherHall) {
      return this.state.collectedClues.includes(clue.requiredClueFromOtherHall);
    }
    return true;
  }

  checkSharedClueUnlock(clueId: string): string | null {
    const clue = this.clues.find(c => c.id === clueId);
    if (!clue || !clue.isShared || !clue.linkedClueId) return null;

    if (this.state.collectedClues.includes(clue.linkedClueId)) {
      return clue.linkedClueId;
    }
    return null;
  }

  collectDualHallClue(clueId: string): boolean {
    if (!this.canCollectClue(clueId)) return false;

    const clue = this.clues.find(c => c.id === clueId);
    if (!clue) return false;

    clue.collected = true;
    this.state.collectedClues.push(clueId);

    if (clue.isShared) {
      if (!this.state.dualHall.sharedClues.includes(clueId)) {
        this.state.dualHall.sharedClues.push(clueId);
      }
      eventBus.emit('dualhall:shared-clue-collect', { clueId, hallOrigin: clue.hallOrigin });
    }

    this.updateHallProgress();
    this.checkAndUnlockRecordings(clueId);
    this.checkAndUnlockContent(clueId);
    this.checkAndUnlockBranchChoices(clueId);

    const linkedClueId = clue.linkedClueId;
    if (linkedClueId && this.state.collectedClues.includes(linkedClueId)) {
      const sharedClue = this.clues.find(c =>
        c.linkedClueId === clueId || c.linkedClueId === linkedClueId
      );
      if (sharedClue && sharedClue.requiredClueFromOtherHall) {
        this.collectClue(sharedClue.id);
        eventBus.emit('dualhall:cross-evidence-complete', {
          clue1: clueId,
          clue2: linkedClueId,
          unlockedSharedClue: sharedClue.id
        });
      }
    }

    this.mechanisms.filter(m => m.isLinked).forEach(mech => {
      this.updateLinkedMechanismProgress(mech.id);
    });

    this.updateQuestProgressOnClueCollect(clueId);

    const currentChapter = this.getCurrentChapter();
    if (currentChapter) {
      const allCollected = currentChapter.requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );
      if (allCollected && !currentChapter.completed) {
        currentChapter.completed = true;
        eventBus.emit('chapter:complete', { chapterId: currentChapter.id });
      }
    }

    eventBus.emit('clue:collect', { clueId });
    this.saveToStorage();
    return true;
  }

  private updateHallProgress(): void {
    const chapter = this.chapters.find(c => c.isDualHall);
    if (!chapter || !chapter.historyExhibitions || !chapter.artExhibitions) return;

    const historyClues = this.clues.filter(c => c.hallOrigin === 'history' && c.collected);
    const artClues = this.clues.filter(c => c.hallOrigin === 'art' && c.collected);

    const totalHistoryClues = this.clues.filter(c => c.hallOrigin === 'history').length;
    const totalArtClues = this.clues.filter(c => c.hallOrigin === 'art').length;

    this.state.dualHall.historyProgress = totalHistoryClues > 0
      ? Math.round((historyClues.length / totalHistoryClues) * 100)
      : 0;
    this.state.dualHall.artProgress = totalArtClues > 0
      ? Math.round((artClues.length / totalArtClues) * 100)
      : 0;

    eventBus.emit('dualhall:progress-update', {
      historyProgress: this.state.dualHall.historyProgress,
      artProgress: this.state.dualHall.artProgress
    });
  }

  getLinkedMechanismProgress(mechanismId: string): number {
    return this.state.dualHall.linkedMechanismProgress[mechanismId] || 0;
  }

  updateLinkedMechanismProgress(mechanismId: string): number {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || !mech.isLinked) return 0;

    const requiredHistory = mech.requiredHistoryClues || [];
    const requiredArt = mech.requiredArtClues || [];
    const totalRequired = requiredHistory.length + requiredArt.length;

    if (totalRequired === 0) return 0;

    const collectedHistory = requiredHistory.filter(id =>
      this.state.collectedClues.includes(id)
    ).length;
    const collectedArt = requiredArt.filter(id =>
      this.state.collectedClues.includes(id)
    ).length;

    const totalCollected = collectedHistory + collectedArt;
    const progress = Math.round((totalCollected / totalRequired) * 100);

    this.state.dualHall.linkedMechanismProgress[mechanismId] = progress;
    mech.linkedProgress = progress;

    eventBus.emit('dualhall:linked-mechanism-progress', {
      mechanismId,
      progress,
      collectedHistory,
      requiredHistory: requiredHistory.length,
      collectedArt,
      requiredArt: requiredArt.length
    });

    this.saveToStorage();
    return progress;
  }

  canSolveLinkedMechanism(mechanismId: string): boolean {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || !mech.isLinked || mech.solved) return false;

    const requiredHistory = mech.requiredHistoryClues || [];
    const requiredArt = mech.requiredArtClues || [];

    const allHistoryCollected = requiredHistory.every(id =>
      this.state.collectedClues.includes(id)
    );
    const allArtCollected = requiredArt.every(id =>
      this.state.collectedClues.includes(id)
    );

    return allHistoryCollected && allArtCollected;
  }

  solveLinkedMechanism(mechanismId: string, solutionPath: string[] = []): boolean {
    if (!this.canSolveLinkedMechanism(mechanismId)) return false;

    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) return false;

    const attempts = this.state.endingEvaluation.mechanismAttemptCounts[mechanismId] || 1;
    const hintsUsed = this.state.endingEvaluation.mechanismHintCounts[mechanismId] || 0;
    const startTime = this.state.endingEvaluation.mechanismStartTime[mechanismId] || Date.now();
    const solveTime = Date.now() - startTime;
    const isOptimal = attempts === 1 && hintsUsed === 0;

    const solveRecord: MechanismSolveRecord = {
      mechanismId,
      solvedAt: Date.now(),
      attempts,
      hintsUsed,
      solveTime,
      solutionPath,
      isOptimal
    };

    this.state.endingEvaluation.mechanismSolveRecords.push(solveRecord);
    if (isOptimal) {
      this.state.endingEvaluation.optimalMechanisms.push(mechanismId);
    }

    mech.solved = true;
    this.state.solvedMechanisms.push(mechanismId);

    if (mech.reward === 'unlock_phase_2') {
      this.unlockDualHallPhase(2);
      this.unlockExhibition('exhibition_history_2');
      this.unlockExhibition('exhibition_art_2');
    } else if (mech.reward === 'unlock_phase_3') {
      this.unlockDualHallPhase(3);
      this.unlockExhibition('exhibition_history_3');
      this.unlockExhibition('exhibition_art_3');
      this.unlockExhibition('exhibition_auth_1');
    } else if (mech.reward === 'unlock_chapter_5') {
      const chapter = this.chapters.find(c => c.id === 'chapter_4');
      if (chapter) {
        chapter.completed = true;
        eventBus.emit('chapter:complete', { chapterId: 'chapter_4' });
      }
      this.unlockExhibition('exhibition_auth_1');
      this.state.currentChapter = 'chapter_5';
      eventBus.emit('chapter:enter', { chapterId: 'chapter_5' });
    }

    eventBus.emit('dualhall:linked-mechanism-solve', {
      mechanismId,
      reward: mech.reward
    });
    eventBus.emit('mechanism:solve', { mechanismId, reward: mech.reward });

    this.saveToStorage();
    return true;
  }

  unlockDualHallPhase(phase: number): boolean {
    if (this.state.dualHall.currentInvestigationPhase >= phase) {
      return false;
    }
    this.state.dualHall.currentInvestigationPhase = phase;
    eventBus.emit('dualhall:phase-unlock', { phase });
    this.saveToStorage();
    return true;
  }

  startDualHallInvestigation(): boolean {
    const chapter = this.chapters.find(c => c.id === 'chapter_4');
    if (!chapter) return false;

    this.state.dualHall.currentInvestigationPhase = 1;
    this.unlockHall('history');
    this.unlockHall('art');
    this.unlockExhibition('exhibition_history_1');
    this.unlockExhibition('exhibition_art_1');

    eventBus.emit('dualhall:start', { chapterId: 'chapter_4' });
    this.saveToStorage();
    return true;
  }

  getHallExhibitions(hallType: HallType): Exhibition[] {
    return this.exhibitions.filter(e => e.hallType === hallType).map(e => ({ ...e }));
  }

  getCluesByHall(hallType: HallType): Clue[] {
    return this.clues.filter(c => c.hallOrigin === hallType).map(c => ({ ...c }));
  }

  getCollectedCluesByHall(hallType: HallType): Clue[] {
    return this.clues.filter(
      c => c.hallOrigin === hallType && c.collected
    ).map(c => ({ ...c }));
  }

  getLinkedMechanisms(): Mechanism[] {
    return this.mechanisms.filter(m => m.isLinked).map(m => ({ ...m }));
  }

  getVisitorQuests(): VisitorQuest[] {
    return this.visitorQuests.map(q => ({ ...q }));
  }

  getVisitorQuestsByChapter(chapterId: string): VisitorQuest[] {
    return this.visitorQuests.filter(q => q.chapterId === chapterId).map(q => ({ ...q }));
  }

  getAvailableQuests(chapterId: string): VisitorQuest[] {
    return this.visitorQuests.filter(q =>
      q.chapterId === chapterId &&
      this.isQuestAvailable(q)
    ).map(q => ({ ...q }));
  }

  getActiveQuests(): VisitorQuest[] {
    return this.visitorQuests.filter(q =>
      q.status === 'accepted' || q.status === 'ready' || q.status === 'delivering'
    ).map(q => ({ ...q }));
  }

  getCompletedQuests(chapterId?: string): VisitorQuest[] {
    if (chapterId) {
      return this.visitorQuests.filter(q =>
        q.chapterId === chapterId && q.status === 'completed'
      ).map(q => ({ ...q }));
    }
    return this.visitorQuests.filter(q => q.status === 'completed').map(q => ({ ...q }));
  }

  getQuestById(questId: string): VisitorQuest | undefined {
    return this.visitorQuests.find(q => q.id === questId);
  }

  getVisitorQuestState(): VisitorQuestState {
    return { ...this.state.visitorQuests };
  }

  private isQuestAvailable(quest: VisitorQuest): boolean {
    if (quest.status !== 'available' && quest.status !== 'locked') return false;

    if (!quest.unlockCondition) return quest.status === 'available';

    const { requiredClues, requiredCompletedQuests } = quest.unlockCondition;

    if (requiredClues && requiredClues.length > 0) {
      const allCluesCollected = requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );
      if (!allCluesCollected) return false;
    }

    if (requiredCompletedQuests && requiredCompletedQuests.length > 0) {
      const allQuestsCompleted = requiredCompletedQuests.every(id =>
        this.state.visitorQuests.completedQuests.includes(id)
      );
      if (!allQuestsCompleted) return false;
    }

    return true;
  }

  private updateQuestStatuses(): void {
    this.visitorQuests.forEach(quest => {
      if (quest.status === 'locked' && this.isQuestAvailable(quest)) {
        quest.status = 'available';
        eventBus.emit('quest:unlock', { questId: quest.id });
      }
    });
  }

  acceptQuest(questId: string): boolean {
    const quest = this.visitorQuests.find(q => q.id === questId);
    if (!quest) return false;
    if (quest.status !== 'available') return false;
    if (this.state.visitorQuests.activeQuests.includes(questId)) return false;

    quest.status = 'accepted';
    this.state.visitorQuests.activeQuests.push(questId);
    this.state.visitorQuests.questProgress[questId] = {};

    quest.requiredItems.forEach(item => {
      this.state.visitorQuests.questProgress[questId][item.id] = 0;
      if (item.source?.type === 'clue' && this.state.collectedClues.includes(item.source.targetId)) {
        this.state.visitorQuests.questProgress[questId][item.id] = item.quantity;
        item.collected = true;
      }
    });

    const historyEntry: QuestHistoryEntry = {
      questId,
      chapterId: quest.chapterId,
      acceptedAt: Date.now(),
      completedAt: 0,
      scoreEarned: 0
    };
    this.state.visitorQuests.questHistory.push(historyEntry);

    this.checkQuestReady(questId);

    eventBus.emit('quest:accept', { questId, quest });
    this.saveToStorage();
    return true;
  }

  private updateQuestProgressOnClueCollect(clueId: string): void {
    this.state.visitorQuests.activeQuests.forEach(questId => {
      const quest = this.visitorQuests.find(q => q.id === questId);
      if (!quest) return;

      quest.requiredItems.forEach(item => {
        if (item.source?.type === 'clue' && item.source.targetId === clueId) {
          if (!this.state.visitorQuests.questProgress[questId]) {
            this.state.visitorQuests.questProgress[questId] = {};
          }
          const currentProgress = this.state.visitorQuests.questProgress[questId][item.id] || 0;
          if (currentProgress < item.quantity) {
            this.state.visitorQuests.questProgress[questId][item.id] = currentProgress + 1;
            if (this.state.visitorQuests.questProgress[questId][item.id] >= item.quantity) {
              item.collected = true;
            }
            eventBus.emit('quest:progress', {
              questId,
              itemId: item.id,
              progress: this.state.visitorQuests.questProgress[questId][item.id],
              total: item.quantity
            });
          }
        }
      });

      this.checkQuestReady(questId);
    });

    this.updateQuestStatuses();
  }

  private checkQuestReady(questId: string): boolean {
    const quest = this.visitorQuests.find(q => q.id === questId);
    if (!quest || quest.status !== 'accepted') return false;

    const allItemsCollected = quest.requiredItems.every(item => {
      const progress = this.state.visitorQuests.questProgress[questId]?.[item.id] || 0;
      return progress >= item.quantity;
    });

    if (allItemsCollected) {
      quest.status = 'ready';
      this.state.visitorQuests.activeQuests = this.state.visitorQuests.activeQuests.filter(id => id !== questId);
      this.state.visitorQuests.readyQuests.push(questId);
      eventBus.emit('quest:ready', { questId, quest });
      return true;
    }
    return false;
  }

  deliverQuest(questId: string): { success: boolean; story: string; alreadyDelivered: boolean } {
    const quest = this.visitorQuests.find(q => q.id === questId);
    if (!quest) return { success: false, story: '', alreadyDelivered: false };
    if (quest.status === 'delivering') return { success: true, story: quest.storyDeliver, alreadyDelivered: true };
    if (quest.status !== 'ready') return { success: false, story: '', alreadyDelivered: false };

    quest.status = 'delivering';
    this.state.visitorQuests.readyQuests = this.state.visitorQuests.readyQuests.filter(id => id !== questId);
    this.state.visitorQuests.deliveringQuests.push(questId);

    const historyEntry = this.state.visitorQuests.questHistory.find(h => h.questId === questId);
    if (historyEntry) {
      historyEntry.deliveredAt = Date.now();
      historyEntry.itemsDelivered = quest.requiredItems.map(item => ({ ...item }));
    }

    this.saveToStorage();
    return { success: true, story: quest.storyDeliver, alreadyDelivered: false };
  }

  completeQuest(questId: string): boolean {
    const quest = this.visitorQuests.find(q => q.id === questId);
    if (!quest) return false;
    if (quest.status !== 'delivering') return false;

    quest.status = 'completed';
    this.state.visitorQuests.deliveringQuests = this.state.visitorQuests.deliveringQuests.filter(id => id !== questId);
    this.state.visitorQuests.completedQuests.push(questId);
    
    this.updateSideQuestProgress(questId, true);

    let scoreEarned = 0;
    if (quest.reward.type === 'score') {
      scoreEarned = typeof quest.reward.value === 'number' ? quest.reward.value : 0;
      this.state.visitorQuests.currentChapterScore += scoreEarned;
      this.state.visitorQuests.totalScore += scoreEarned;
    }

    const historyEntry = this.state.visitorQuests.questHistory.find(h => h.questId === questId);
    if (historyEntry) {
      historyEntry.completedAt = Date.now();
      historyEntry.scoreEarned = scoreEarned;
    }

    this.updateQuestStatuses();

    eventBus.emit('quest:complete', {
      questId,
      quest,
      scoreEarned,
      totalScore: this.state.visitorQuests.totalScore
    });
    this.saveToStorage();
    return true;
  }

  getQuestProgress(questId: string): Record<string, number> {
    return this.state.visitorQuests.questProgress[questId] || {};
  }

  getQuestItemProgress(questId: string, itemId: string): number {
    return this.state.visitorQuests.questProgress[questId]?.[itemId] || 0;
  }

  canAcceptQuest(questId: string): boolean {
    const quest = this.visitorQuests.find(q => q.id === questId);
    if (!quest) return false;
    return this.isQuestAvailable(quest);
  }

  canDeliverQuest(questId: string): boolean {
    const quest = this.visitorQuests.find(q => q.id === questId);
    if (!quest) return false;
    return quest.status === 'ready' || quest.status === 'delivering';
  }

  evaluateChapter(chapterId: string): ChapterEvaluation | null {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return null;

    const existingEvaluation = this.state.visitorQuests.chapterEvaluations.find(e => e.chapterId === chapterId);
    if (existingEvaluation?.evaluated) return { ...existingEvaluation };

    const mainStoryScore = chapter.completed ? 500 : 0;
    const sideQuestsScore = this.state.visitorQuests.currentChapterScore;

    const collectedChapterClues = this.state.collectedClues.filter(id => {
      const clue = this.clues.find(c => c.id === id);
      return clue?.chapterId === chapterId;
    });
    const totalChapterClues = this.clues.filter(c => c.chapterId === chapterId).length;
    const collectionScore = totalChapterClues > 0
      ? Math.round((collectedChapterClues.length / totalChapterClues) * 300)
      : 0;

    const completionTime = Date.now() - this.chapterStartTime;
    const expectedTime = 30 * 60 * 1000;
    const efficiencyScore = completionTime < expectedTime
      ? Math.round((1 - completionTime / expectedTime) * 200)
      : 0;

    const totalScore = mainStoryScore + sideQuestsScore + collectionScore + efficiencyScore;

    let rank: 'S' | 'A' | 'B' | 'C' = 'C';
    if (totalScore >= 900) rank = 'S';
    else if (totalScore >= 750) rank = 'A';
    else if (totalScore >= 600) rank = 'B';

    const completedChapterQuests = this.state.visitorQuests.completedQuests.filter(id => {
      const quest = this.visitorQuests.find(q => q.id === id);
      return quest?.chapterId === chapterId;
    });

    const evaluation: ChapterEvaluation = {
      chapterId,
      mainStoryScore,
      sideQuestsScore,
      collectionScore,
      efficiencyScore,
      totalScore,
      rank,
      completedQuests: completedChapterQuests,
      completionTime,
      evaluated: true
    };

    const existingIndex = this.state.visitorQuests.chapterEvaluations.findIndex(e => e.chapterId === chapterId);
    if (existingIndex >= 0) {
      this.state.visitorQuests.chapterEvaluations[existingIndex] = evaluation;
    } else {
      this.state.visitorQuests.chapterEvaluations.push(evaluation);
    }

    eventBus.emit('chapter:evaluate', {
      chapterId,
      evaluation
    });

    this.state.visitorQuests.currentChapterScore = 0;
    this.chapterStartTime = Date.now();

    this.saveToStorage();
    return { ...evaluation };
  }

  getChapterEvaluation(chapterId: string): ChapterEvaluation | undefined {
    return this.state.visitorQuests.chapterEvaluations.find(e => e.chapterId === chapterId);
  }

  getAllChapterEvaluations(): ChapterEvaluation[] {
    return this.state.visitorQuests.chapterEvaluations.map(e => ({ ...e }));
  }

  getTotalScore(): number {
    return this.state.visitorQuests.totalScore;
  }

  getCurrentChapterScore(): number {
    return this.state.visitorQuests.currentChapterScore;
  }

  getQuestHistory(): QuestHistoryEntry[] {
    return this.state.visitorQuests.questHistory.map(h => ({ ...h }));
  }

  getCompletedQuestsCount(chapterId?: string): number {
    if (chapterId) {
      return this.visitorQuests.filter(q =>
        q.chapterId === chapterId && q.status === 'completed'
      ).length;
    }
    return this.state.visitorQuests.completedQuests.length;
  }

  getTotalQuestsCount(chapterId?: string): number {
    if (chapterId) {
      return this.visitorQuests.filter(q => q.chapterId === chapterId).length;
    }
    return this.visitorQuests.length;
  }

  getCharacters(): Character[] {
    return this.characters.map(c => ({ ...c }));
  }

  getCharacterById(id: string): Character | undefined {
    return this.characters.find(c => c.id === id);
  }

  getUnlockedCharacters(): Character[] {
    return this.characters.filter(c => c.unlocked).map(c => ({ ...c }));
  }

  getCharactersByChapter(chapterId: string): Character[] {
    return this.characters.filter(c => c.chapterId === chapterId).map(c => ({ ...c }));
  }

  unlockChapter(chapterId: string): boolean {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return false;
    if (chapter.unlocked) return false;

    chapter.unlocked = true;

    this.addTimelineEventIfNotExists(`timeline_chapter_${chapterId}_unlock`);

    eventBus.emit('chapter:unlock', { chapterId, chapter });
    this.saveToStorage();
    return true;
  }

  unlockCharacter(characterId: string): boolean {
    if (this.state.readingRoom.unlockedCharacters.includes(characterId)) return false;

    const character = this.characters.find(c => c.id === characterId);
    if (!character) return false;

    character.unlocked = true;
    this.state.readingRoom.unlockedCharacters.push(characterId);

    eventBus.emit('readingroom:character-unlock', { characterId });
    this.saveToStorage();
    return true;
  }

  markCharacterAsViewed(characterId: string): boolean {
    if (this.state.readingRoom.viewedCharacters.includes(characterId)) return false;
    if (!this.state.readingRoom.unlockedCharacters.includes(characterId)) return false;

    this.state.readingRoom.viewedCharacters.push(characterId);
    this.saveToStorage();
    return true;
  }

  getTimelineEvents(): TimelineEvent[] {
    return this.timelineEvents.map(e => ({ ...e }));
  }

  getTimelineEventById(id: string): TimelineEvent | undefined {
    return this.timelineEvents.find(e => e.id === id);
  }

  getUnlockedTimelineEvents(): TimelineEvent[] {
    return this.timelineEvents.filter(e => e.unlocked).sort((a, b) => a.order - b.order);
  }

  getTimelineEventsByChapter(chapterId: string): TimelineEvent[] {
    return this.timelineEvents.filter(e => e.chapterId === chapterId).sort((a, b) => a.order - b.order);
  }

  unlockTimelineEvent(eventId: string): boolean {
    if (this.state.readingRoom.unlockedEvents.includes(eventId)) return false;

    const event = this.timelineEvents.find(e => e.id === eventId);
    if (!event) return false;

    event.unlocked = true;
    this.state.readingRoom.unlockedEvents.push(eventId);

    eventBus.emit('readingroom:event-unlock', { eventId });
    this.saveToStorage();
    return true;
  }

  addTimelineEventIfNotExists(eventId: string): boolean {
    if (this.state.readingRoom.unlockedEvents.includes(eventId)) return false;

    const event = this.timelineEvents.find(e => e.id === eventId);
    if (!event) return false;

    return this.unlockTimelineEvent(eventId);
  }

  markEventAsViewed(eventId: string): boolean {
    if (this.state.readingRoom.viewedEvents.includes(eventId)) return false;
    if (!this.state.readingRoom.unlockedEvents.includes(eventId)) return false;

    this.state.readingRoom.viewedEvents.push(eventId);
    this.saveToStorage();
    return true;
  }

  getReadingRoomState(): ReadingRoomState {
    return { ...this.state.readingRoom };
  }

  addToSearchHistory(query: string): void {
    if (!query.trim()) return;
    const history = this.state.readingRoom.searchHistory.filter(h => h !== query);
    history.unshift(query);
    this.state.readingRoom.searchHistory = history.slice(0, 20);
    this.saveToStorage();
  }

  clearSearchHistory(): void {
    this.state.readingRoom.searchHistory = [];
    this.saveToStorage();
  }

  toggleFavoriteClue(clueId: string): boolean {
    const index = this.state.readingRoom.favoriteClues.indexOf(clueId);
    if (index >= 0) {
      this.state.readingRoom.favoriteClues.splice(index, 1);
      eventBus.emit('readingroom:favorite-removed', { clueId });
      this.saveToStorage();
      return false;
    } else {
      this.state.readingRoom.favoriteClues.push(clueId);
      eventBus.emit('readingroom:favorite-added', { clueId });
      this.saveToStorage();
      return true;
    }
  }

  isFavoriteClue(clueId: string): boolean {
    return this.state.readingRoom.favoriteClues.includes(clueId);
  }

  getFavoriteClues(): Clue[] {
    return this.clues.filter(c => this.state.readingRoom.favoriteClues.includes(c.id)).map(c => ({ ...c }));
  }

  searchClues(query: string): Clue[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return this.clues.filter(c =>
      c.collected && (
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.id.toLowerCase().includes(lowerQuery)
      )
    );
  }

  searchCharacters(query: string): Character[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return this.characters.filter(c =>
      c.unlocked && (
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.role.toLowerCase().includes(lowerQuery)
      )
    );
  }

  searchTimelineEvents(query: string): TimelineEvent[] {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return this.timelineEvents.filter(e =>
      e.unlocked && (
        e.title.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.date.toLowerCase().includes(lowerQuery)
      )
    ).sort((a, b) => a.order - b.order);
  }

  checkAndUnlockContent(clueId: string): void {
    const clue = this.getClueById(clueId);
    if (!clue) return;

    this.characters.forEach(character => {
      if (!character.unlocked && character.relatedClues.includes(clueId)) {
        const allRequiredCluesCollected = character.relatedClues.every(
          cid => this.state.collectedClues.includes(cid)
        );
        if (allRequiredCluesCollected) {
          this.unlockCharacter(character.id);
        }
      }
    });

    this.timelineEvents.forEach(event => {
      if (!event.unlocked && event.relatedClueIds.includes(clueId)) {
        const allRequiredCluesCollected = event.relatedClueIds.every(
          cid => this.state.collectedClues.includes(cid)
        );
        if (allRequiredCluesCollected) {
          this.unlockTimelineEvent(event.id);
        }
      }
    });
  }

  isClueCollected(clueId: string): boolean {
    return this.state.collectedClues.includes(clueId);
  }

  isChapterCompleted(chapterId: string): boolean {
    const chapter = this.chapters.find(c => c.id === chapterId);
    return chapter?.completed || false;
  }

  getCluesByChapter(chapterId: string): Clue[] {
    return this.clues.filter(c => c.chapterId === chapterId).map(c => ({ ...c }));
  }

  getCollectedCluesByChapter(chapterId: string): Clue[] {
    return this.clues.filter(
      c => c.chapterId === chapterId && this.state.collectedClues.includes(c.id)
    ).map(c => ({ ...c }));
  }

  getUnreadCount(): number {
    const newCharacters = this.state.readingRoom.unlockedCharacters.filter(
      id => !this.state.readingRoom.viewedCharacters.includes(id)
    ).length;
    const newEvents = this.state.readingRoom.unlockedEvents.filter(
      id => !this.state.readingRoom.viewedEvents.includes(id)
    ).length;
    return newCharacters + newEvents;
  }

  getAuthenticityRelics(): AuthenticityRelic[] {
    return this.authenticityRelics.map(r => ({ ...r }));
  }

  getAuthenticityRelicById(id: string): AuthenticityRelic | undefined {
    return this.authenticityRelics.find(r => r.id === id);
  }

  getAuthenticityState(): AuthenticityState {
    return { ...this.state.authenticity };
  }

  getAuthenticityRelicsByChapter(chapterId: string): AuthenticityRelic[] {
    return this.authenticityRelics.filter(r => r.chapterId === chapterId).map(r => ({ ...r }));
  }

  setCurrentAuthenticityRelic(relicId: string | null): void {
    this.state.authenticity.currentRelic = relicId;
    this.saveToStorage();
  }

  checkAuthenticityCheckPoint(relicId: string, checkPointId: string, verdict: 'genuine' | 'fake'): { correct: boolean; evidence: string } {
    const relic = this.authenticityRelics.find(r => r.id === relicId);
    if (!relic) return { correct: false, evidence: '藏品不存在' };

    const checkPoint = relic.checkPoints.find(cp => cp.id === checkPointId);
    if (!checkPoint) return { correct: false, evidence: '检查点不存在' };

    const isCorrect = (verdict === 'genuine' && checkPoint.isGenuine) ||
                      (verdict === 'fake' && !checkPoint.isGenuine);

    checkPoint.checked = true;
    checkPoint.correctVerdict = isCorrect;

    if (!this.state.authenticity.checkPointProgress[relicId]) {
      this.state.authenticity.checkPointProgress[relicId] = [];
    }
    if (!this.state.authenticity.checkPointProgress[relicId].includes(checkPointId)) {
      this.state.authenticity.checkPointProgress[relicId].push(checkPointId);
    }

    eventBus.emit('authenticity:checkpoint', {
      relicId,
      checkPointId,
      verdict,
      correct: isCorrect
    });

    this.saveToStorage();

    return {
      correct: isCorrect,
      evidence: isCorrect ? checkPoint.genuineEvidence : checkPoint.fakeEvidence
    };
  }

  getCheckPointProgress(relicId: string): number {
    const relic = this.authenticityRelics.find(r => r.id === relicId);
    if (!relic) return 0;
    const checkedCount = relic.checkPoints.filter(cp => cp.checked).length;
    return Math.round((checkedCount / relic.checkPoints.length) * 100);
  }

  canSubmitVerdict(relicId: string): boolean {
    const relic = this.authenticityRelics.find(r => r.id === relicId);
    if (!relic || relic.verified) return false;
    return relic.checkPoints.every(cp => cp.checked);
  }

  submitRelicVerdict(relicId: string, verdict: 'genuine' | 'fake'): { correct: boolean; digit: number; position: number; clue: string } {
    const relic = this.authenticityRelics.find(r => r.id === relicId);
    if (!relic || relic.verified) {
      return { correct: false, digit: 0, position: 0, clue: '' };
    }

    const isCorrect = (verdict === 'genuine' && relic.isGenuine) ||
                      (verdict === 'fake' && !relic.isGenuine);

    relic.verified = true;
    relic.verdict = verdict;

    if (!this.state.authenticity.verifiedRelics.includes(relicId)) {
      this.state.authenticity.verifiedRelics.push(relicId);
    }

    if (isCorrect) {
      const passwordArr = this.state.authenticity.derivedPassword.split('');
      while (passwordArr.length < relic.digitPosition) {
        passwordArr.push('?');
      }
      passwordArr[relic.digitPosition - 1] = relic.passwordDigit.toString();
      this.state.authenticity.derivedPassword = passwordArr.join('');
    }

    eventBus.emit('authenticity:verdict', {
      relicId,
      verdict,
      correct: isCorrect,
      digit: isCorrect ? relic.passwordDigit : null,
      position: isCorrect ? relic.digitPosition : null
    });

    this.saveToStorage();

    return {
      correct: isCorrect,
      digit: isCorrect ? relic.passwordDigit : 0,
      position: isCorrect ? relic.digitPosition : 0,
      clue: isCorrect ? relic.passwordClue : ''
    };
  }

  getDerivedPassword(): string {
    return this.state.authenticity.derivedPassword;
  }

  getAuthenticityAttempts(): { current: number; max: number } {
    return {
      current: this.state.authenticity.attempts,
      max: this.state.authenticity.maxAttempts
    };
  }

  validateAuthenticityPassword(password: string): { correct: boolean; rewards: AuthenticityReward[] } {
    const mechanism = this.mechanisms.find(m => m.type === 'authenticity');
    if (!mechanism || mechanism.solved) {
      return { correct: false, rewards: [] };
    }

    this.state.authenticity.attempts++;

    const isCorrect = password === mechanism.answer;

    if (isCorrect) {
      mechanism.solved = true;
      this.state.solvedMechanisms.push(mechanism.id);

      const rewards = this.claimAuthenticityRewards();

      eventBus.emit('authenticity:complete', {
        mechanismId: mechanism.id,
        password,
        rewards
      });

      eventBus.emit('mechanism:solve', {
        mechanismId: mechanism.id,
        reward: mechanism.reward
      });

      this.saveToStorage();

      return { correct: true, rewards };
    } else {
      eventBus.emit('authenticity:password-error', {
        attempts: this.state.authenticity.attempts,
        maxAttempts: this.state.authenticity.maxAttempts
      });

      this.saveToStorage();

      return { correct: false, rewards: [] };
    }
  }

  private claimAuthenticityRewards(): AuthenticityReward[] {
    const claimedRewards: AuthenticityReward[] = [];

    this.authenticityRewards.forEach((reward, index) => {
      if (reward.claimed) return;

      reward.claimed = true;
      this.state.authenticity.rewards[index].claimed = true;
      claimedRewards.push({ ...reward });

      if (reward.type === 'score' && typeof reward.value === 'number') {
        this.state.visitorQuests.totalScore += reward.value;
        this.state.visitorQuests.currentChapterScore += reward.value;
        eventBus.emit('quest:score', { score: reward.value, totalScore: this.state.visitorQuests.totalScore });
      } else if (reward.type === 'clue' && typeof reward.value === 'string') {
        this.collectClue(reward.value);
      } else if (reward.type === 'unlock' && typeof reward.value === 'string') {
        if (reward.value.startsWith('exhibition_')) {
          this.unlockExhibition(reward.value);
        }
      } else if (reward.type === 'story' && typeof reward.value === 'string') {
        eventBus.emit('authenticity:story', { story: reward.value });
      }
    });

    return claimedRewards;
  }

  getAuthenticityRewards(): AuthenticityReward[] {
    return this.authenticityRewards.map(r => ({ ...r }));
  }

  isAuthenticityComplete(): boolean {
    const mechanism = this.mechanisms.find(m => m.type === 'authenticity');
    return mechanism?.solved || false;
  }

  resetAuthenticityProgress(): void {
    this.authenticityRelics.forEach(relic => {
      relic.verified = false;
      relic.verdict = null;
      relic.checkPoints.forEach(cp => {
        cp.checked = false;
        cp.correctVerdict = undefined;
      });
    });

    this.state.authenticity.currentRelic = null;
    this.state.authenticity.verifiedRelics = [];
    this.state.authenticity.checkPointProgress = {};
    this.state.authenticity.derivedPassword = '';
    this.state.authenticity.attempts = 0;

    this.authenticityRewards.forEach((reward, index) => {
      reward.claimed = false;
      this.state.authenticity.rewards[index].claimed = false;
    });

    const mechanism = this.mechanisms.find(m => m.type === 'authenticity');
    if (mechanism) {
      mechanism.solved = false;
      this.state.solvedMechanisms = this.state.solvedMechanisms.filter(id => id !== mechanism.id);
    }

    eventBus.emit('authenticity:reset');
    this.saveToStorage();
  }

  getMemoryCorridorState(): MemoryCorridorState {
    return { ...this.state.memoryCorridor };
  }

  getEndings(): Ending[] {
    return this.endings.map(e => ({ ...e }));
  }

  getEndingById(id: string): Ending | undefined {
    return this.endings.find(e => e.id === id);
  }

  getEndingsByChapter(chapterId: string): Ending[] {
    return this.endings.filter(e => e.chapterId === chapterId).map(e => ({ ...e }));
  }

  getUnlockedEndings(): Ending[] {
    return this.endings.filter(e => e.unlocked).map(e => ({ ...e }));
  }

  getAchievedEndings(): Ending[] {
    return this.endings.filter(e => e.achieved).map(e => ({ ...e }));
  }

  unlockEnding(endingId: string): boolean {
    if (this.state.memoryCorridor.unlockedEndings.includes(endingId)) return false;

    const ending = this.endings.find(e => e.id === endingId);
    if (!ending) return false;

    ending.unlocked = true;
    this.state.memoryCorridor.unlockedEndings.push(endingId);

    const recording = this.recordings.find(r => r.endingId === endingId);
    if (recording) {
      this.unlockRecording(recording.id);
    }

    eventBus.emit('memorycorridor:ending-unlocked', { endingId });
    this.saveToStorage();
    return true;
  }

  achieveEnding(endingId: string): boolean {
    if (this.state.memoryCorridor.achievedEndings.includes(endingId)) return false;

    const ending = this.endings.find(e => e.id === endingId);
    if (!ending) return false;

    ending.achieved = true;
    this.state.memoryCorridor.achievedEndings.push(endingId);
    this.state.memoryCorridor.currentEnding = endingId;

    if (!this.state.memoryCorridor.unlockedEndings.includes(endingId)) {
      this.unlockEnding(endingId);
    }

    const recording = this.recordings.find(r => r.endingId === endingId);
    if (recording) {
      this.markRecordingAsPlayed(recording.id);
    }

    eventBus.emit('memorycorridor:ending-achieved', { endingId, ending });
    this.saveToStorage();
    return true;
  }

  calculateHiddenClueCompletionRate(): number {
    const allHiddenClues = this.clues.filter(c => c.isEndingClue);
    if (allHiddenClues.length === 0) return 1.0;
    
    const collected = allHiddenClues.filter(c => 
      this.state.endingEvaluation.hiddenCluesCollected.includes(c.id) ||
      this.state.collectedClues.includes(c.id)
    );
    
    return collected.length / allHiddenClues.length;
  }

  calculateSideQuestCompletionRate(): number {
    const allSideQuests = this.visitorQuests.filter(q => q.priority === 'rare' || q.priority === 'epic');
    if (allSideQuests.length === 0) return 1.0;
    
    const completed = allSideQuests.filter(q => 
      this.state.endingEvaluation.sideQuestProgress.some(p => 
        p.questId === q.id && p.completed
      ) || this.state.visitorQuests.completedQuests.includes(q.id)
    );
    
    return completed.length / allSideQuests.length;
  }

  calculateMechanismQualityScore(mechanismId: string): number {
    const record = this.getMechanismSolveRecord(mechanismId);
    if (!record) return 0;
    
    let score = 100;
    
    if (record.attempts > 1) {
      score -= (record.attempts - 1) * 10;
    }
    
    if (record.hintsUsed > 0) {
      score -= record.hintsUsed * 15;
    }
    
    if (record.solveTime > 60000) {
      score -= Math.floor((record.solveTime - 60000) / 30000) * 5;
    }
    
    return Math.max(0, score);
  }

  calculateOverallMechanismQuality(): number {
    const solvedMechanisms = this.state.solvedMechanisms;
    if (solvedMechanisms.length === 0) return 100;
    
    const totalScore = solvedMechanisms.reduce((sum, mechId) => {
      return sum + this.calculateMechanismQualityScore(mechId);
    }, 0);
    
    return totalScore / solvedMechanisms.length;
  }

  getOptimalMechanismRate(): number {
    const solvedMechanisms = this.state.solvedMechanisms;
    if (solvedMechanisms.length === 0) return 0;
    
    return this.state.endingEvaluation.optimalMechanisms.length / solvedMechanisms.length;
  }

  calculateEndingScore(ending: Ending): { totalScore: number; maxScore: number; conditions: EndingConditionSatisfaction[] } {
    const conditions: EndingConditionSatisfaction[] = [];
    const weights = ending.unlockConditions.weights || {
      cluesWeight: 25,
      choicesWeight: 25,
      hiddenCluesWeight: 20,
      sideQuestsWeight: 15,
      mechanismQualityWeight: 10,
      memoryCompleteWeight: 5
    };

    const { requiredClues, requiredChoices, requiredMemoryComplete, 
            requiredHiddenClues, requiredSideQuests, requiredMechanismQuality,
            minHiddenClueCompletionRate, minSideQuestCompletionRate,
            excludedChoices, requiredDualHallProgress, requiredAuthenticityProgress,
            requiredNightPatrolProgress } = ending.unlockConditions;

    if (requiredClues && requiredClues.length > 0) {
      const collected = requiredClues.filter(id => this.state.collectedClues.includes(id));
      const rate = collected.length / requiredClues.length;
      const satisfied = rate >= 1;
      conditions.push({
        type: 'clues',
        description: '收集必需线索',
        satisfied,
        currentValue: collected.length,
        requiredValue: requiredClues.length,
        weight: weights.cluesWeight,
        score: rate * weights.cluesWeight
      });
    }

    if (requiredChoices && requiredChoices.length > 0) {
      const madeChoiceIds = Object.values(this.state.memoryCorridor.madeChoices);
      const correct = requiredChoices.filter(id => madeChoiceIds.includes(id));
      const rate = correct.length / requiredChoices.length;
      const satisfied = rate >= 1;
      conditions.push({
        type: 'choices',
        description: '做出正确选择',
        satisfied,
        currentValue: correct.length,
        requiredValue: requiredChoices.length,
        weight: weights.choicesWeight,
        score: rate * weights.choicesWeight
      });
    }

    if (excludedChoices && excludedChoices.length > 0) {
      const madeChoiceIds = Object.values(this.state.memoryCorridor.madeChoices);
      const badChoices = excludedChoices.filter(id => madeChoiceIds.includes(id));
      const satisfied = badChoices.length === 0;
      const penalty = badChoices.length * 20;
      conditions.push({
        type: 'excluded_choices',
        description: '避免错误选择',
        satisfied,
        currentValue: badChoices.length,
        requiredValue: 0,
        weight: 20,
        score: satisfied ? 20 : Math.max(0, 20 - penalty)
      });
    }

    if (requiredMemoryComplete !== undefined) {
      const satisfied = this.state.memoryCorridor.isMemoryComplete === requiredMemoryComplete;
      conditions.push({
        type: 'memory_complete',
        description: '完成记忆回廊',
        satisfied,
        currentValue: this.state.memoryCorridor.isMemoryComplete ? 1 : 0,
        requiredValue: requiredMemoryComplete ? 1 : 0,
        weight: weights.memoryCompleteWeight,
        score: satisfied ? weights.memoryCompleteWeight : 0
      });
    }

    if (requiredHiddenClues && requiredHiddenClues.length > 0) {
      const collected = requiredHiddenClues.filter(id => 
        this.state.endingEvaluation.hiddenCluesCollected.includes(id) ||
        this.state.collectedClues.includes(id)
      );
      const rate = collected.length / requiredHiddenClues.length;
      const satisfied = rate >= 1;
      conditions.push({
        type: 'hidden_clues',
        description: '发现隐藏线索',
        satisfied,
        currentValue: collected.length,
        requiredValue: requiredHiddenClues.length,
        weight: weights.hiddenCluesWeight,
        score: rate * weights.hiddenCluesWeight
      });
    }

    if (minHiddenClueCompletionRate !== undefined) {
      const currentRate = this.calculateHiddenClueCompletionRate();
      const satisfied = currentRate >= minHiddenClueCompletionRate;
      conditions.push({
        type: 'hidden_clue_rate',
        description: '隐藏线索完成率',
        satisfied,
        currentValue: Math.round(currentRate * 100),
        requiredValue: Math.round(minHiddenClueCompletionRate * 100),
        weight: weights.hiddenCluesWeight,
        score: Math.min(1, currentRate / minHiddenClueCompletionRate) * weights.hiddenCluesWeight
      });
    }

    if (requiredSideQuests && requiredSideQuests.length > 0) {
      const completed = requiredSideQuests.filter(id => 
        this.state.visitorQuests.completedQuests.includes(id)
      );
      const rate = completed.length / requiredSideQuests.length;
      const satisfied = rate >= 1;
      conditions.push({
        type: 'side_quests',
        description: '完成支线任务',
        satisfied,
        currentValue: completed.length,
        requiredValue: requiredSideQuests.length,
        weight: weights.sideQuestsWeight,
        score: rate * weights.sideQuestsWeight
      });
    }

    if (minSideQuestCompletionRate !== undefined) {
      const currentRate = this.calculateSideQuestCompletionRate();
      const satisfied = currentRate >= minSideQuestCompletionRate;
      conditions.push({
        type: 'side_quest_rate',
        description: '支线任务完成率',
        satisfied,
        currentValue: Math.round(currentRate * 100),
        requiredValue: Math.round(minSideQuestCompletionRate * 100),
        weight: weights.sideQuestsWeight,
        score: Math.min(1, currentRate / minSideQuestCompletionRate) * weights.sideQuestsWeight
      });
    }

    if (requiredMechanismQuality && requiredMechanismQuality.length > 0) {
      let totalMechScore = 0;
      let maxMechScore = 0;
      
      requiredMechanismQuality.forEach(req => {
        const qualityScore = this.calculateMechanismQualityScore(req.mechanismId);
        let satisfied = true;
        
        if (req.maxAttempts !== undefined) {
          const record = this.getMechanismSolveRecord(req.mechanismId);
          if (record && record.attempts > req.maxAttempts) satisfied = false;
        }
        if (req.maxHintsUsed !== undefined) {
          const record = this.getMechanismSolveRecord(req.mechanismId);
          if (record && record.hintsUsed > req.maxHintsUsed) satisfied = false;
        }
        if (req.minOptimalRate !== undefined) {
          const optimalRate = this.getOptimalMechanismRate();
          if (optimalRate < req.minOptimalRate) satisfied = false;
        }
        
        totalMechScore += qualityScore * (satisfied ? 1 : 0.5);
        maxMechScore += 100;
      });
      
      const rate = maxMechScore > 0 ? totalMechScore / maxMechScore : 0;
      conditions.push({
        type: 'mechanism_quality',
        description: '机关解法质量',
        satisfied: rate >= 0.8,
        currentValue: Math.round(rate * 100),
        requiredValue: 80,
        weight: weights.mechanismQualityWeight,
        score: rate * weights.mechanismQualityWeight
      });
    }

    if (requiredDualHallProgress) {
      const { minHistoryProgress = 0, minArtProgress = 0 } = requiredDualHallProgress;
      const historyOk = this.state.dualHall.historyProgress >= minHistoryProgress;
      const artOk = this.state.dualHall.artProgress >= minArtProgress;
      const satisfied = historyOk && artOk;
      const avgProgress = (this.state.dualHall.historyProgress + this.state.dualHall.artProgress) / 2;
      const minRequired = (minHistoryProgress + minArtProgress) / 2;
      
      conditions.push({
        type: 'dual_hall_progress',
        description: '双展厅探索进度',
        satisfied,
        currentValue: avgProgress,
        requiredValue: minRequired,
        weight: 10,
        score: satisfied ? 10 : Math.min(1, avgProgress / Math.max(1, minRequired)) * 10
      });
    }

    if (requiredAuthenticityProgress) {
      const { minVerifiedRelics = 0, minCorrectVerdicts = 0 } = requiredAuthenticityProgress;
      const verifiedOk = this.state.authenticity.verifiedRelics.length >= minVerifiedRelics;
      
      let correctVerdicts = 0;
      this.authenticityRelics.forEach(relic => {
        if (relic.verdict && relic.verdict === (relic.isGenuine ? 'genuine' : 'fake')) {
          correctVerdicts++;
        }
      });
      const verdictOk = correctVerdicts >= minCorrectVerdicts;
      const satisfied = verifiedOk && verdictOk;
      
      conditions.push({
        type: 'authenticity_progress',
        description: '真伪鉴定进度',
        satisfied,
        currentValue: this.state.authenticity.verifiedRelics.length,
        requiredValue: minVerifiedRelics,
        weight: 10,
        score: satisfied ? 10 : (this.state.authenticity.verifiedRelics.length / Math.max(1, minVerifiedRelics)) * 10
      });
    }

    if (requiredNightPatrolProgress) {
      const { minEventsResolved = 0, minPowerOutagesCompleted = 0 } = requiredNightPatrolProgress;
      const eventsOk = this.state.nightPatrol.totalEventsResolved >= minEventsResolved;
      const outagesOk = this.state.nightPatrol.powerOutage.totalPowerOutages >= minPowerOutagesCompleted;
      const satisfied = eventsOk && outagesOk;
      
      conditions.push({
        type: 'night_patrol_progress',
        description: '夜间巡逻进度',
        satisfied,
        currentValue: this.state.nightPatrol.totalEventsResolved,
        requiredValue: minEventsResolved,
        weight: 10,
        score: satisfied ? 10 : (this.state.nightPatrol.totalEventsResolved / Math.max(1, minEventsResolved)) * 10
      });
    }

    const totalScore = conditions.reduce((sum, c) => sum + c.score, 0);
    const maxScore = conditions.reduce((sum, c) => sum + c.weight, 0);

    return { totalScore, maxScore, conditions };
  }

  checkEndingUnlockConditions(endingId: string): boolean {
    const ending = this.endings.find(e => e.id === endingId);
    if (!ending) return false;

    const scoreResult = this.calculateEndingScore(ending);
    const { minOverallScore } = ending.unlockConditions;
    
    const threshold = minOverallScore !== undefined ? minOverallScore : 0.85;
    const satisfactionRate = scoreResult.maxScore > 0 
      ? scoreResult.totalScore / scoreResult.maxScore 
      : 0;

    const allHardConditionsMet = scoreResult.conditions.every(c => c.satisfied);
    
    if (minOverallScore !== undefined) {
      return satisfactionRate >= threshold;
    }
    
    return allHardConditionsMet || satisfactionRate >= threshold;
  }

  determineEnding(): Ending | null {
    const chapterEndings = this.endings.filter(e => e.chapterId === 'chapter_6');
    
    const endingScores: { ending: Ending; score: number; satisfactionRate: number }[] = [];
    
    for (const ending of chapterEndings) {
      const scoreResult = this.calculateEndingScore(ending);
      const satisfactionRate = scoreResult.maxScore > 0 
        ? scoreResult.totalScore / scoreResult.maxScore 
        : 0;
      
      endingScores.push({
        ending,
        score: scoreResult.totalScore,
        satisfactionRate
      });
    }
    
    endingScores.sort((a, b) => b.score - a.score);
    
    const typePriority: Record<string, number> = {
      'true': 4,
      'good': 3,
      'neutral': 2,
      'bad': 1
    };
    
    for (const candidate of endingScores) {
      if (this.checkEndingUnlockConditions(candidate.ending.id)) {
        const isBadEnding = candidate.ending.type === 'bad';
        const badEndingConditions = candidate.ending.unlockConditions.requiredChoices || [];
        const madeChoiceIds = Object.values(this.state.memoryCorridor.madeChoices);
        const hasBadChoice = badEndingConditions.some(id => madeChoiceIds.includes(id));
        
        if (isBadEnding && hasBadChoice) {
          return { ...candidate.ending };
        }
        
        if (!isBadEnding) {
          return { ...candidate.ending };
        }
      }
    }
    
    const qualifiedEndings = endingScores.filter(e => e.satisfactionRate >= 0.5);
    if (qualifiedEndings.length > 0) {
      qualifiedEndings.sort((a, b) => 
        (typePriority[b.ending.type] || 0) - (typePriority[a.ending.type] || 0)
      );
      return { ...qualifiedEndings[0].ending };
    }
    
    const neutralEnding = chapterEndings.find(e => e.type === 'neutral');
    return neutralEnding ? { ...neutralEnding } : null;
  }

  analyzeEndingConditions(endingId: string): EndingAnalysis | null {
    const ending = this.endings.find(e => e.id === endingId);
    if (!ending) return null;

    const scoreResult = this.calculateEndingScore(ending);
    const satisfactionRate = scoreResult.maxScore > 0 
      ? scoreResult.totalScore / scoreResult.maxScore 
      : 0;

    const unsatisfiedConditions = scoreResult.conditions.filter(c => !c.satisfied);
    let hint = '';
    
    if (unsatisfiedConditions.length > 0) {
      const hints: string[] = [];
      unsatisfiedConditions.forEach(c => {
        if (c.type === 'clues') {
          hints.push(`还需要收集 ${c.requiredValue - c.currentValue} 个线索`);
        } else if (c.type === 'hidden_clues' || c.type === 'hidden_clue_rate') {
          hints.push('继续探索隐藏区域，发现更多秘密');
        } else if (c.type === 'choices') {
          hints.push('在关键选择点做出更符合角色心意的决定');
        } else if (c.type === 'side_quests' || c.type === 'side_quest_rate') {
          hints.push('完成更多支线任务可以提升结局评价');
        } else if (c.type === 'mechanism_quality') {
          hints.push('尝试以更少的尝试次数和提示来解开机关');
        } else if (c.type === 'excluded_choices') {
          hints.push('某些选择可能会导向不好的结局');
        } else if (c.type === 'dual_hall_progress') {
          hints.push('平衡历史厅和艺术厅的探索进度');
        } else if (c.type === 'memory_complete') {
          hints.push('完成记忆回廊的所有阶段');
        }
      });
      hint = hints.join('；') + '。';
    } else {
      hint = '所有条件已满足！';
    }

    return {
      endingId: ending.id,
      endingTitle: ending.title,
      endingType: ending.type,
      isUnlocked: ending.unlocked,
      isAchieved: ending.achieved,
      totalScore: Math.round(scoreResult.totalScore),
      maxPossibleScore: scoreResult.maxScore,
      satisfactionRate: Math.round(satisfactionRate * 100),
      conditions: scoreResult.conditions,
      hint
    };
  }

  getAllEndingAnalysis(): EndingAnalysis[] {
    return this.endings
      .filter(e => e.chapterId === 'chapter_6')
      .map(e => this.analyzeEndingConditions(e.id))
      .filter((e): e is EndingAnalysis => e !== null)
      .sort((a, b) => b.satisfactionRate - a.satisfactionRate);
  }

  getBranchChoices(): BranchChoice[] {
    return this.branchChoices.map(b => ({ ...b }));
  }

  getBranchChoiceById(id: string): BranchChoice | undefined {
    return this.branchChoices.find(b => b.id === id);
  }

  getBranchChoicesByChapter(chapterId: string): BranchChoice[] {
    return this.branchChoices.filter(b => b.chapterId === chapterId).map(b => ({ ...b }));
  }

  getUnlockedBranchChoices(): BranchChoice[] {
    return this.branchChoices.filter(b => b.unlocked).map(b => ({ ...b }));
  }

  makeChoice(branchId: string, choiceId: string): { success: boolean; consequence: string; endingId?: string; unlocksClue?: string; unlocksExhibition?: string } {
    const branch = this.branchChoices.find(b => b.id === branchId);
    if (!branch || branch.selectedChoiceId !== null) {
      return { success: false, consequence: '' };
    }

    if (branch.requiredClues && branch.requiredClues.length > 0) {
      const allCluesCollected = branch.requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );
      if (!allCluesCollected) {
        return { success: false, consequence: '' };
      }
    }

    const choice = branch.choices.find(c => c.id === choiceId);
    if (!choice) {
      return { success: false, consequence: '' };
    }

    branch.selectedChoiceId = choiceId;
    branch.madeAt = Date.now();
    this.state.memoryCorridor.madeChoices[branchId] = choiceId;

    if (choice.unlocksClue) {
      this.collectClue(choice.unlocksClue);
    }

    if (choice.unlocksExhibition) {
      this.unlockExhibition(choice.unlocksExhibition);
    }

    if (choice.leadsToEnding) {
      this.achieveEnding(choice.leadsToEnding);
    }

    eventBus.emit('memorycorridor:choice-made', {
      branchId,
      choiceId,
      choice,
      consequence: choice.consequence
    });

    this.saveToStorage();
    this.saveBreakpoint(false);

    return {
      success: true,
      consequence: choice.consequence,
      endingId: choice.leadsToEnding,
      unlocksClue: choice.unlocksClue,
      unlocksExhibition: choice.unlocksExhibition
    };
  }

  checkMemoryCorridorPhaseUnlock(phase: number): boolean {
    const chapter = this.chapters.find(c => c.id === 'chapter_6');
    if (!chapter || !chapter.memoryPhases) return false;

    const phaseData = chapter.memoryPhases.find(p => p.phase === phase);
    if (!phaseData) return false;

    const allCluesCollected = phaseData.requiredClues.every(id =>
      this.state.collectedClues.includes(id)
    );

    return allCluesCollected;
  }

  completeMemoryCorridorPhase(phase: number): boolean {
    if (this.state.memoryCorridor.completedPhases.includes(phase)) return false;

    this.state.memoryCorridor.completedPhases.push(phase);
    this.state.memoryCorridor.currentPhase = Math.max(phase, this.state.memoryCorridor.currentPhase);

    const chapter = this.chapters.find(c => c.id === 'chapter_6');
    if (chapter?.memoryPhases) {
      const phaseData = chapter.memoryPhases.find(p => p.phase === phase);
      if (phaseData) {
        this.unlockExhibition(phaseData.exhibitionId);
      }
    }

    eventBus.emit('memorycorridor:phase-complete', { phase });
    this.saveToStorage();
    return true;
  }

  checkMemorySortOrder(fragmentIds: string[]): boolean {
    const fragments = fragmentIds.map(id => this.getClueById(id)).filter(Boolean) as Clue[];
    
    if (fragments.length !== fragmentIds.length) return false;

    for (let i = 0; i < fragments.length; i++) {
      const current = fragments[i];
      if (current.memoryOrder === undefined || current.memoryOrder === null) {
        return false;
      }
      if (i > 0) {
        const prev = fragments[i - 1];
        if (prev.memoryOrder === undefined || prev.memoryOrder === null) {
          return false;
        }
        if (current.memoryOrder <= prev.memoryOrder) {
          return false;
        }
      }
    }

    return true;
  }

  checkMechanismMemorySort(mechanismId: string, fragmentIds: string[]): boolean {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || mech.type !== 'memory_sort') return false;

    const expectedFragmentIds = mech.memoryCorridorPhase?.fragmentIds || [];
    
    if (expectedFragmentIds.length !== fragmentIds.length) return false;

    const sortedFragments = fragmentIds
      .map(id => this.getClueById(id))
      .filter(Boolean) as Clue[];

    if (sortedFragments.length !== expectedFragmentIds.length) return false;

    for (let i = 0; i < sortedFragments.length; i++) {
      const current = sortedFragments[i];
      if (current.memoryOrder === undefined || current.memoryOrder === null) {
        return false;
      }
      if (i > 0) {
        const prev = sortedFragments[i - 1];
        if (prev.memoryOrder === undefined || prev.memoryOrder === null) {
          return false;
        }
        if (current.memoryOrder <= prev.memoryOrder) {
          return false;
        }
      }
    }

    const progress = Math.round((sortedFragments.length / expectedFragmentIds.length) * 100);
    this.state.memoryCorridor.fragmentSortingProgress = Math.max(
      this.state.memoryCorridor.fragmentSortingProgress,
      progress
    );

    eventBus.emit('memorycorridor:sort-progress', { mechanismId, progress });
    this.saveToStorage();

    return true;
  }

  initMemoryPuzzleState(puzzleId: string, chapterId: string): MemoryPuzzleState {
    const existing = this.state.memoryPuzzleRecovery[puzzleId];
    if (existing) {
      return { ...existing };
    }

    const state: MemoryPuzzleState = {
      puzzleId,
      chapterId,
      attempts: [],
      hintsUsed: 0,
      maxHints: 3,
      skipped: false,
      skipCost: 0,
      startTime: Date.now(),
      completedTime: null,
      completed: false,
      baseScore: GAME_CONFIG.MEMORY_PUZZLE.BASE_SCORE,
      finalScore: GAME_CONFIG.MEMORY_PUZZLE.BASE_SCORE,
      scoreMultiplier: GAME_CONFIG.MEMORY_PUZZLE.SCORE_MULTIPLIER_ONCE,
      solutionPath: []
    };

    this.state.memoryPuzzleRecovery[puzzleId] = state;
    this.saveToStorage();
    return { ...state };
  }

  getMemoryPuzzleState(puzzleId: string): MemoryPuzzleState | null {
    const state = this.state.memoryPuzzleRecovery[puzzleId];
    return state ? { ...state } : null;
  }

  getMemoryPuzzleAttemptCount(puzzleId: string): number {
    const state = this.state.memoryPuzzleRecovery[puzzleId];
    return state?.attempts.length || 0;
  }

  updateMemoryPuzzleState(puzzleId: string, state: MemoryPuzzleState): boolean {
    if (!this.state.memoryPuzzleRecovery[puzzleId]) {
      return false;
    }
    this.state.memoryPuzzleRecovery[puzzleId] = { ...state };
    this.saveToStorage();
    return true;
  }

  private analyzeMemorySortResult(
    arrangedIds: string[],
    correctOrder: string[]
  ): {
    correctPositions: number[];
    wrongPositions: number[];
    correctCount: number;
  } {
    const correctPositions: number[] = [];
    const wrongPositions: number[] = [];

    for (let i = 0; i < arrangedIds.length; i++) {
      if (arrangedIds[i] === correctOrder[i]) {
        correctPositions.push(i);
      } else {
        wrongPositions.push(i);
      }
    }

    return {
      correctPositions,
      wrongPositions,
      correctCount: correctPositions.length
    };
  }

  private getCorrectOrder(fragmentIds: string[]): string[] {
    const fragments = fragmentIds
      .map(id => this.getClueById(id))
      .filter(Boolean) as Clue[];
    
    return fragments
      .sort((a, b) => (a.memoryOrder || 0) - (b.memoryOrder || 0))
      .map(f => f.id);
  }

  generateMemorySortHint(
    puzzleId: string,
    arrangedIds: string[],
    fragmentIds: string[]
  ): MemorySortHint | null {
    const state = this.state.memoryPuzzleRecovery[puzzleId];
    if (!state) return null;
    if (state.hintsUsed >= state.maxHints) return null;

    const correctOrder = this.getCorrectOrder(fragmentIds);
    const analysis = this.analyzeMemorySortResult(arrangedIds, correctOrder);
    const hintLevel = (state.hintsUsed + 1) as 1 | 2 | 3;

    let message = '';
    let suggestedSwaps: { from: number; to: number; fragmentId: string }[] | undefined;
    let firstWrongPosition: number | undefined;
    let correctFragmentAtPosition: { position: number; fragmentId: string } | undefined;

    if (hintLevel === 1) {
      message = `你已正确排列 ${analysis.correctCount}/${fragmentIds.length} 个碎片。继续尝试！`;
    } else if (hintLevel === 2) {
      if (analysis.wrongPositions.length > 0) {
        firstWrongPosition = analysis.wrongPositions[0];
        message = `位置 ${firstWrongPosition + 1} 的碎片不正确。仔细想想这块记忆应该在什么时候发生？`;
      } else {
        message = '排列看起来都正确！';
      }
    } else if (hintLevel === 3) {
      if (analysis.wrongPositions.length > 0) {
        firstWrongPosition = analysis.wrongPositions[0];
        correctFragmentAtPosition = {
          position: firstWrongPosition,
          fragmentId: correctOrder[firstWrongPosition]
        };
        const correctFragment = this.getClueById(correctFragmentAtPosition.fragmentId);
        message = `位置 ${firstWrongPosition + 1} 应该是「${correctFragment?.name || '未知碎片'}」。`;

        if (analysis.wrongPositions.length >= 2) {
          const wrongId = arrangedIds[firstWrongPosition];
          const correctPos = correctOrder.indexOf(wrongId);
          if (correctPos !== -1) {
            suggestedSwaps = [{
              from: firstWrongPosition,
              to: correctPos,
              fragmentId: wrongId
            }];
          }
        }
      } else {
        message = '排列完全正确！';
      }
    }

    state.hintsUsed++;
    this.saveToStorage();

    eventBus.emit('memorypuzzle:hint-used', {
      puzzleId,
      hintLevel,
      hintCost: GAME_CONFIG.MEMORY_PUZZLE.HINT_COST
    });

    return {
      level: hintLevel,
      message,
      correctPositions: analysis.correctPositions,
      suggestedSwaps,
      firstWrongPosition,
      correctFragmentAtPosition
    };
  }

  calculateSkipCost(puzzleId: string): number {
    const state = this.state.memoryPuzzleRecovery[puzzleId];
    if (!state) return GAME_CONFIG.MEMORY_PUZZLE.SKIP_BASE_COST;

    const attemptCount = state.attempts.length;
    const cost = GAME_CONFIG.MEMORY_PUZZLE.SKIP_BASE_COST - 
      attemptCount * GAME_CONFIG.MEMORY_PUZZLE.SKIP_COST_REDUCTION_PER_ATTEMPT;
    
    return Math.max(cost, GAME_CONFIG.MEMORY_PUZZLE.MIN_SKIP_COST);
  }

  skipMemoryPuzzle(puzzleId: string, mechanismId?: string): MemorySortSkipResult {
    const state = this.state.memoryPuzzleRecovery[puzzleId];
    if (!state) {
      return {
        success: false,
        skipCost: 0,
        finalScore: 0,
        message: '记忆拼图状态不存在'
      };
    }

    if (state.completed) {
      return {
        success: false,
        skipCost: 0,
        finalScore: state.finalScore,
        message: '记忆拼图已完成'
      };
    }

    const skipCost = this.calculateSkipCost(puzzleId);
    state.skipped = true;
    state.skipCost = skipCost;
    state.completed = true;
    state.completedTime = Date.now();
    state.scoreMultiplier = GAME_CONFIG.MEMORY_PUZZLE.SCORE_MULTIPLIER_SKIPPED;

    const scoreResult = this.calculateMemoryPuzzleScore(puzzleId);
    state.finalScore = scoreResult.finalScore;

    if (mechanismId) {
      const mech = this.mechanisms.find(m => m.id === mechanismId);
      if (mech && !mech.solved) {
        this.solveMechanism(mechanismId);
      }
    }

    const chapter = this.chapters.find(c => c.id === state.chapterId);
    if (chapter) {
      this.state.visitorQuests.currentChapterScore += state.finalScore;
      this.state.visitorQuests.totalScore += state.finalScore;
    }

    this.saveToStorage();

    eventBus.emit('memorypuzzle:skipped', {
      puzzleId,
      skipCost,
      finalScore: state.finalScore
    });

    return {
      success: true,
      skipCost,
      finalScore: state.finalScore,
      message: `已跳过记忆拼图，扣除 ${skipCost} 分，获得 ${state.finalScore} 分`
    };
  }

  calculateMemoryPuzzleScore(puzzleId: string): MemoryPuzzleScoreResult {
    const state = this.state.memoryPuzzleRecovery[puzzleId];
    if (!state) {
      return {
        baseScore: 0,
        attemptPenalty: 0,
        hintPenalty: 0,
        skipPenalty: 0,
        speedBonus: 0,
        perfectBonus: 0,
        finalScore: 0,
        rank: 'C',
        multiplier: 0
      };
    }

    const config = GAME_CONFIG.MEMORY_PUZZLE;
    const attemptCount = state.attempts.length;
    
    let attemptPenalty = 0;
    if (attemptCount > config.MAX_ATTEMPTS_FOR_FULL_SCORE) {
      attemptPenalty = (attemptCount - config.MAX_ATTEMPTS_FOR_FULL_SCORE) * config.ATTEMPT_PENALTY;
    }

    const hintPenalty = state.hintsUsed * config.HINT_COST;
    const skipPenalty = state.skipped ? state.skipCost : 0;

    let speedBonus = 0;
    if (!state.skipped && state.completedTime) {
      const duration = state.completedTime - state.startTime;
      if (duration < config.SPEED_BONUS_THRESHOLD) {
        speedBonus = Math.round(
          (1 - duration / config.SPEED_BONUS_THRESHOLD) * config.SPEED_BONUS_MAX
        );
      }
    }

    let perfectBonus = 0;
    if (!state.skipped && attemptCount === 1 && state.hintsUsed === 0) {
      perfectBonus = config.PERFECT_BONUS;
    }

    let multiplier: number = config.SCORE_MULTIPLIER_ONCE;
    if (state.skipped) {
      multiplier = config.SCORE_MULTIPLIER_SKIPPED;
    } else if (state.hintsUsed > 0) {
      multiplier = config.SCORE_MULTIPLIER_HINT;
    }

    const rawScore = config.BASE_SCORE - attemptPenalty - hintPenalty - skipPenalty + speedBonus + perfectBonus;
    const finalScore = Math.max(Math.round(rawScore * multiplier), 0);

    let rank: 'S' | 'A' | 'B' | 'C' = 'C';
    if (finalScore >= 450) rank = 'S';
    else if (finalScore >= 350) rank = 'A';
    else if (finalScore >= 250) rank = 'B';

    return {
      baseScore: config.BASE_SCORE,
      attemptPenalty,
      hintPenalty,
      skipPenalty,
      speedBonus,
      perfectBonus,
      finalScore,
      rank,
      multiplier
    };
  }

  setMemoryComplete(complete: boolean): void {
    this.state.memoryCorridor.isMemoryComplete = complete;
    
    if (complete) {
      eventBus.emit('memorycorridor:memory-complete');
      
      this.endings.forEach(ending => {
        if (this.checkEndingUnlockConditions(ending.id)) {
          this.unlockEnding(ending.id);
        }
      });
    }

    this.saveToStorage();
  }

  getMemoryFragmentSortingProgress(): number {
    return this.state.memoryCorridor.fragmentSortingProgress;
  }

  isMemoryComplete(): boolean {
    return this.state.memoryCorridor.isMemoryComplete;
  }

  getCurrentEnding(): Ending | null {
    const endingId = this.state.memoryCorridor.currentEnding;
    if (!endingId) return null;
    return this.getEndingById(endingId) || null;
  }

  startMemoryCorridor(): boolean {
    if (this.state.currentChapter === 'chapter_6') return false;

    this.unlockExhibition('exhibition_corridor_entrance');
    this.state.currentChapter = 'chapter_6';
    this.state.currentExhibition = 'exhibition_corridor_entrance';
    this.state.memoryCorridor.currentPhase = 1;

    const branchChoices = this.branchChoices.filter(b => b.chapterId === 'chapter_6');
    branchChoices.forEach(branch => {
      if (!branch.requiredClues || branch.requiredClues.length === 0) {
        branch.unlocked = true;
      } else {
        const allCluesCollected = branch.requiredClues.every(id =>
          this.state.collectedClues.includes(id)
        );
        if (allCluesCollected) {
          branch.unlocked = true;
        }
      }
    });

    this.unlockChapterRecordings('chapter_6');

    eventBus.emit('memorycorridor:start');
    eventBus.emit('chapter:enter', { chapterId: 'chapter_6' });
    eventBus.emit('exhibition:enter', { exhibitionId: 'exhibition_corridor_entrance' });

    this.saveToStorage();
    return true;
  }

  checkAndUnlockBranchChoices(clueId: string): void {
    this.branchChoices.forEach(branch => {
      if (branch.unlocked) return;
      if (!branch.requiredClues?.includes(clueId)) return;

      const allCluesCollected = branch.requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );

      if (allCluesCollected) {
        branch.unlocked = true;
        eventBus.emit('memorycorridor:branch-unlocked', { branchId: branch.id });
      }
    });

    this.saveToStorage();
  }

  interactWithMechanism(mechanismId: string): MechanismInteractionResult {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) {
      return { success: false, type: 'unknown', reason: '机关不存在' };
    }

    if (mech.solved) {
      return { success: false, type: 'already_solved', reason: '机关已解开', mechanism: mech };
    }

    if (mech.type === 'memory_sort') {
      const phaseInfo = mech.memoryCorridorPhase;
      const fragmentIds = phaseInfo?.fragmentIds || [];
      const fragments = this.clues.filter(c => fragmentIds.includes(c.id));
      const collectedFragments = fragments.filter(f => this.state.collectedClues.includes(f.id));

      if (collectedFragments.length < fragments.length) {
        return {
          success: false,
          type: 'memory_sort',
          reason: '碎片不足',
          mechanism: mech,
          memorySortData: {
            phase: phaseInfo?.phase || 1,
            fragments,
            collectedFragments,
            requiredCount: fragments.length,
            collectedCount: collectedFragments.length
          }
        };
      }

      return {
        success: true,
        type: 'memory_sort',
        mechanism: mech,
        memorySortData: {
          phase: phaseInfo?.phase || 1,
          fragments,
          collectedFragments,
          requiredCount: fragments.length,
          collectedCount: collectedFragments.length
        }
      };
    }

    if (mech.type === 'branch_choice') {
      const branchChoiceId = mech.branchChoiceId;
      if (!branchChoiceId) {
        return { success: false, type: 'branch_choice', reason: '分支配置错误', mechanism: mech };
      }

      const branch = this.branchChoices.find(b => b.id === branchChoiceId);
      if (!branch) {
        return { success: false, type: 'branch_choice', reason: '分支不存在', mechanism: mech };
      }

      if (!branch.unlocked) {
        return { success: false, type: 'branch_choice', reason: '分支未解锁', mechanism: mech, branch };
      }

      if (branch.selectedChoiceId) {
        return {
          success: false,
          type: 'branch_choice',
          reason: '已做出选择',
          mechanism: mech,
          branch,
          selectedChoice: branch.choices.find(c => c.id === branch.selectedChoiceId)
        };
      }

      return {
        success: true,
        type: 'branch_choice',
        mechanism: mech,
        branch
      };
    }

    if (mech.type === 'password') {
      return {
        success: true,
        type: 'password',
        mechanism: mech,
        passwordData: {
          hint: mech.hint,
          displayName: mech.displayName
        }
      };
    }

    if (mech.type === 'sequence') {
      return {
        success: true,
        type: 'sequence',
        mechanism: mech
      };
    }

    if (mech.type === 'authenticity') {
      return {
        success: true,
        type: 'authenticity',
        mechanism: mech,
        authenticityData: {
          relicIds: mech.authenticityRelicIds || []
        }
      };
    }

    if (mech.type === 'restoration') {
      return {
        success: true,
        type: 'restoration',
        mechanism: mech
      };
    }

    if (mech.type === 'linked') {
      return {
        success: true,
        type: 'linked',
        mechanism: mech
      };
    }

    return { success: false, type: 'unknown', reason: '未知机关类型', mechanism: mech };
  }

  submitMemorySort(mechanismId: string, sortedFragmentIds: string[]): MemorySortSubmitResult {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || mech.type !== 'memory_sort') {
      return { success: false, reason: '无效的排序机关' };
    }

    if (mech.solved) {
      return { success: false, reason: '机关已解开' };
    }

    const puzzleId = mechanismId;
    const chapterId = this.state.currentChapter;
    const state = this.initMemoryPuzzleState(puzzleId, chapterId);

    if (state.completed) {
      return { success: false, reason: '记忆拼图已完成' };
    }

    const fragmentIds = mech.memoryCorridorPhase?.fragmentIds || 
      this.getMemoryFragments(chapterId).map(f => f.id);
    
    const correctOrder = this.getCorrectOrder(fragmentIds);
    const analysis = this.analyzeMemorySortResult(sortedFragmentIds, correctOrder);
    const isCorrect = analysis.wrongPositions.length === 0;

    this.recordMechanismAttempt(mechanismId);
    
    const solutionPathStep = `sort:${sortedFragmentIds.join(',')}`;
    state.solutionPath = state.solutionPath || [];
    state.solutionPath.push(solutionPathStep);
    
    const attempt: MemoryPuzzleAttempt = {
      attemptNumber: state.attempts.length + 1,
      arrangedIds: [...sortedFragmentIds],
      correctCount: analysis.correctCount,
      correctPositions: analysis.correctPositions,
      wrongPositions: analysis.wrongPositions,
      timestamp: Date.now()
    };
    state.attempts.push(attempt);
    this.state.memoryPuzzleRecovery[puzzleId] = state;

    if (isCorrect) {
      state.solutionPath.push('success');
      const checkResult = this.checkMechanismMemorySort(mechanismId, sortedFragmentIds);
      if (checkResult) {
        const solved = this.solveMechanism(mechanismId, state.solutionPath);
        if (solved) {
          state.completed = true;
          state.completedTime = Date.now();
          
          const scoreResult = this.calculateMemoryPuzzleScore(puzzleId);
          state.finalScore = scoreResult.finalScore;
          state.scoreMultiplier = scoreResult.multiplier;
          
          const chapter = this.chapters.find(c => c.id === chapterId);
          if (chapter) {
            this.state.visitorQuests.currentChapterScore += state.finalScore;
            this.state.visitorQuests.totalScore += state.finalScore;
          }
          
          this.state.memoryPuzzleRecovery[puzzleId] = state;
          this.saveToStorage();

          eventBus.emit('memorypuzzle:complete', {
            puzzleId,
            attemptCount: state.attempts.length,
            hintsUsed: state.hintsUsed,
            score: state.finalScore,
            scoreInfo: scoreResult
          });

          return {
            success: true,
            correct: true,
            reward: mech.reward,
            message: '记忆碎片排序正确！',
            attempts: state.attempts.length,
            correctPositions: analysis.correctPositions,
            wrongPositions: analysis.wrongPositions,
            correctCount: analysis.correctCount,
            totalCount: fragmentIds.length,
            scoreInfo: scoreResult,
            canGetHint: state.hintsUsed < state.maxHints,
            hintCost: GAME_CONFIG.MEMORY_PUZZLE.HINT_COST,
            canSkip: !state.completed,
            skipCost: this.calculateSkipCost(puzzleId)
          };
        }
      }
      return { success: false, reason: '解锁失败' };
    }

    this.saveToStorage();

    const progress = this.getMemoryFragmentSortingProgress();
    const canGetHint = state.hintsUsed < state.maxHints;
    
    let hint: MemorySortHint | undefined;
    if (state.attempts.length >= 2 && canGetHint) {
      const autoHint = this.generateMemorySortHint(puzzleId, sortedFragmentIds, fragmentIds);
      if (autoHint) {
        hint = autoHint;
      }
    }

    state.solutionPath.push('error');
    this.state.memoryPuzzleRecovery[puzzleId] = state;
    
    eventBus.emit('memorypuzzle:failed', {
      puzzleId,
      attemptNumber: attempt.attemptNumber,
      correctCount: analysis.correctCount,
      totalCount: fragmentIds.length
    });

    return {
      success: true,
      correct: false,
      progress,
      message: `顺序不正确，你正确排列了 ${analysis.correctCount}/${fragmentIds.length} 个碎片`,
      attempts: state.attempts.length,
      hint,
      correctPositions: analysis.correctPositions,
      wrongPositions: analysis.wrongPositions,
      correctCount: analysis.correctCount,
      totalCount: fragmentIds.length,
      canGetHint,
      hintCost: GAME_CONFIG.MEMORY_PUZZLE.HINT_COST,
      canSkip: !state.completed,
      skipCost: this.calculateSkipCost(puzzleId)
    };
  }

  submitBranchChoice(mechanismId: string, choiceId: string): BranchChoiceSubmitResult {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || mech.type !== 'branch_choice') {
      return { success: false, reason: '无效的分支机关' };
    }

    if (mech.solved) {
      return { success: false, reason: '机关已解开' };
    }

    const branchChoiceId = mech.branchChoiceId;
    if (!branchChoiceId) {
      return { success: false, reason: '机关配置错误' };
    }

    const result = this.makeChoice(branchChoiceId, choiceId);
    if (!result.success) {
      return { success: false, reason: result.consequence };
    }

    const solved = this.solveMechanism(mechanismId);

    return {
      success: true,
      consequence: result.consequence,
      endingId: result.endingId,
      unlocksClue: result.unlocksClue,
      unlocksExhibition: result.unlocksExhibition,
      reward: solved ? mech.reward : undefined
    };
  }

  getClueSummary(): FinalReviewClueSummary[] {
    const summaries: FinalReviewClueSummary[] = [];
    
    for (const chapter of this.chapters) {
      const chapterClues = this.clues.filter(c => c.chapterId === chapter.id);
      const collectedList = chapterClues.filter(c => this.state.collectedClues.includes(c.id));
      const missingList = chapterClues.filter(c => !this.state.collectedClues.includes(c.id));
      
      summaries.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        totalClues: chapterClues.length,
        collectedClues: collectedList.length,
        collectedClueList: collectedList.map(c => ({ ...c })),
        missingClueList: missingList.map(c => ({ ...c })),
        completionRate: chapterClues.length > 0 
          ? Math.round((collectedList.length / chapterClues.length) * 100) 
          : 0
      });
    }
    
    return summaries;
  }

  getMechanismSummary(): FinalReviewMechanismSummary[] {
    const summaries: FinalReviewMechanismSummary[] = [];
    
    for (const chapter of this.chapters) {
      const chapterExhibitionIds = chapter.exhibitions;
      const chapterMechanisms: Mechanism[] = [];
      
      for (const exhId of chapterExhibitionIds) {
        const exh = this.exhibitions.find(e => e.id === exhId);
        if (exh) {
          const mechHotspots = exh.hotspots.filter(h => h.type === 'mechanism');
          for (const hotspot of mechHotspots) {
            const mech = this.mechanisms.find(m => m.id === hotspot.targetId);
            if (mech && !chapterMechanisms.find(cm => cm.id === mech.id)) {
              chapterMechanisms.push(mech);
            }
          }
        }
      }
      
      const solvedList = chapterMechanisms.filter(m => this.state.solvedMechanisms.includes(m.id));
      const unsolvedList = chapterMechanisms.filter(m => !this.state.solvedMechanisms.includes(m.id));
      
      summaries.push({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        totalMechanisms: chapterMechanisms.length,
        solvedMechanisms: solvedList.length,
        solvedMechanismList: solvedList.map(m => ({ ...m })),
        unsolvedMechanismList: unsolvedList.map(m => ({ ...m })),
        completionRate: chapterMechanisms.length > 0
          ? Math.round((solvedList.length / chapterMechanisms.length) * 100)
          : 0
      });
    }
    
    return summaries;
  }

  getChoiceSummary(): FinalReviewChoiceSummary[] {
    const summaries: FinalReviewChoiceSummary[] = [];
    
    for (const branch of this.branchChoices) {
      const selectedChoice = branch.selectedChoiceId 
        ? branch.choices.find(c => c.id === branch.selectedChoiceId)
        : null;
      
      summaries.push({
        branchId: branch.id,
        branchTitle: branch.text,
        branchDescription: branch.description,
        selectedChoiceId: branch.selectedChoiceId,
        selectedChoiceText: selectedChoice?.text || null,
        selectedChoiceConsequence: selectedChoice?.consequence || null,
        allChoices: branch.choices.map(c => ({
          id: c.id,
          text: c.text,
          consequence: c.consequence,
          selected: c.id === branch.selectedChoiceId,
          leadsToEnding: c.leadsToEnding
        })),
        madeAt: branch.madeAt
      });
    }
    
    return summaries;
  }

  getEndingConditions(): FinalReviewEndingCondition[] {
    const conditions: FinalReviewEndingCondition[] = [];
    const madeChoiceIds = Object.values(this.state.memoryCorridor.madeChoices);
    
    for (const ending of this.endings) {
      const { requiredClues, requiredChoices, requiredMemoryComplete } = ending.unlockConditions;
      const requiredConditions: FinalReviewEndingCondition['requiredConditions'] = [];
      let satisfiedCount = 0;
      let totalConditions = 0;
      
      if (requiredMemoryComplete !== undefined) {
        totalConditions++;
        const satisfied = this.state.memoryCorridor.isMemoryComplete === requiredMemoryComplete;
        if (satisfied) satisfiedCount++;
        requiredConditions.push({
          type: 'memory_complete',
          description: '记忆回廊完整度',
          satisfied,
          currentValue: this.state.memoryCorridor.isMemoryComplete ? '完整' : '不完整',
          requiredValue: requiredMemoryComplete ? '完整' : '任意'
        });
      }
      
      if (requiredClues && requiredClues.length > 0) {
        const collectedCount = requiredClues.filter(id => 
          this.state.collectedClues.includes(id)
        ).length;
        totalConditions++;
        const satisfied = collectedCount === requiredClues.length;
        if (satisfied) satisfiedCount++;
        
        const clueNames = requiredClues.map(id => {
          const clue = this.clues.find(c => c.id === id);
          return clue?.name || id;
        }).join('、');
        
        requiredConditions.push({
          type: 'clue',
          description: `收集关键线索 (${collectedCount}/${requiredClues.length})`,
          targetId: requiredClues.join(','),
          targetName: clueNames,
          satisfied,
          currentValue: `${collectedCount}个`,
          requiredValue: `${requiredClues.length}个`
        });
        
        for (const clueId of requiredClues) {
          const clue = this.clues.find(c => c.id === clueId);
          if (clue) {
            totalConditions++;
            const clueSatisfied = this.state.collectedClues.includes(clueId);
            if (clueSatisfied) satisfiedCount++;
            requiredConditions.push({
              type: 'clue',
              description: `线索: ${clue.name}`,
              targetId: clueId,
              targetName: clue.name,
              satisfied: clueSatisfied,
              currentValue: clueSatisfied ? '已收集' : '未收集',
              requiredValue: '已收集'
            });
          }
        }
      }
      
      if (requiredChoices && requiredChoices.length > 0) {
        const madeCount = requiredChoices.filter(id => 
          madeChoiceIds.includes(id)
        ).length;
        totalConditions++;
        const satisfied = madeCount === requiredChoices.length;
        if (satisfied) satisfiedCount++;
        
        const choiceTexts = requiredChoices.map(id => {
          for (const branch of this.branchChoices) {
            const choice = branch.choices.find(c => c.id === id);
            if (choice) return choice.text;
          }
          return id;
        }).join('、');
        
        requiredConditions.push({
          type: 'choice',
          description: `做出关键抉择 (${madeCount}/${requiredChoices.length})`,
          targetId: requiredChoices.join(','),
          targetName: choiceTexts,
          satisfied,
          currentValue: `${madeCount}个`,
          requiredValue: `${requiredChoices.length}个`
        });
        
        for (const choiceId of requiredChoices) {
          let choiceText = choiceId;
          let branchText = '';
          for (const branch of this.branchChoices) {
            const choice = branch.choices.find(c => c.id === choiceId);
            if (choice) {
              choiceText = choice.text;
              branchText = branch.text;
              break;
            }
          }
          totalConditions++;
          const choiceSatisfied = madeChoiceIds.includes(choiceId);
          if (choiceSatisfied) satisfiedCount++;
          requiredConditions.push({
            type: 'choice',
            description: `抉择: ${choiceText}`,
            targetId: choiceId,
            targetName: branchText,
            satisfied: choiceSatisfied,
            currentValue: choiceSatisfied ? '已选择' : '未选择',
            requiredValue: '已选择'
          });
        }
      }
      
      const hint = this.generateEndingHint(ending, requiredConditions);
      
      conditions.push({
        endingId: ending.id,
        endingTitle: ending.title,
        endingType: ending.type,
        endingIcon: ending.icon,
        isUnlocked: ending.unlocked,
        isAchieved: ending.achieved,
        unlockProgress: totalConditions > 0 
          ? Math.round((satisfiedCount / totalConditions) * 100) 
          : 0,
        requiredConditions,
        hint
      });
    }
    
    return conditions;
  }

  private generateEndingHint(
    ending: Ending, 
    conditions: FinalReviewEndingCondition['requiredConditions']
  ): string {
    const unsatisfied = conditions.filter(c => !c.satisfied);
    
    if (unsatisfied.length === 0) {
      return '🎉 所有条件已满足，你可以达成这个结局！';
    }
    
    if (ending.type === 'true') {
      const clueCondition = unsatisfied.find(c => c.type === 'clue' && !c.targetId?.includes(','));
      const choiceCondition = unsatisfied.find(c => c.type === 'choice' && !c.targetId?.includes(','));
      const memoryCondition = unsatisfied.find(c => c.type === 'memory_complete');
      
      if (memoryCondition) {
        return '💡 提示：收集所有记忆碎片，完成记忆拼图。';
      }
      if (clueCondition) {
        return `💡 提示：还缺少线索「${clueCondition.targetName}」，继续探索吧。`;
      }
      if (choiceCondition) {
        return `💡 提示：在「${choiceCondition.targetName}」中，做出不同的选择。`;
      }
    }
    
    if (ending.type === 'bad') {
      return '⚠️  这是一个坏结局，建议尝试其他选择路径。';
    }
    
    const firstUnsatisfied = unsatisfied[0];
    if (firstUnsatisfied.type === 'clue') {
      return `💡 提示：还需要收集 ${firstUnsatisfied.requiredValue} 线索，当前已有 ${firstUnsatisfied.currentValue}。`;
    }
    if (firstUnsatisfied.type === 'choice') {
      return `💡 提示：还需要做出 ${firstUnsatisfied.requiredValue} 关键抉择，当前已有 ${firstUnsatisfied.currentValue}。`;
    }
    
    return '💡 继续探索，收集更多线索，做出你的选择。';
  }

  getFinalReviewData(): FinalReviewData {
    const clueSummaries = this.getClueSummary();
    const mechanismSummaries = this.getMechanismSummary();
    const choiceSummaries = this.getChoiceSummary();
    const endingConditions = this.getEndingConditions();
    
    const totalClues = clueSummaries.reduce((sum, s) => sum + s.totalClues, 0);
    const collectedClues = clueSummaries.reduce((sum, s) => sum + s.collectedClues, 0);
    const totalMechanisms = mechanismSummaries.reduce((sum, s) => sum + s.totalMechanisms, 0);
    const solvedMechanisms = mechanismSummaries.reduce((sum, s) => sum + s.solvedMechanisms, 0);
    const totalChoices = choiceSummaries.length;
    const madeChoices = choiceSummaries.filter(s => s.selectedChoiceId !== null).length;
    
    const clueProgress = totalClues > 0 ? (collectedClues / totalClues) : 0;
    const mechProgress = totalMechanisms > 0 ? (solvedMechanisms / totalMechanisms) : 0;
    const choiceProgress = totalChoices > 0 ? (madeChoices / totalChoices) : 0;
    const overallProgress = Math.round(((clueProgress + mechProgress + choiceProgress) / 3) * 100);
    
    return {
      totalClues,
      collectedClues,
      totalMechanisms,
      solvedMechanisms,
      totalChoices,
      madeChoices,
      clueSummaries,
      mechanismSummaries,
      choiceSummaries,
      endingConditions,
      overallProgress,
      playTime: Date.now() - this.chapterStartTime,
      currentEnding: this.getCurrentEnding(),
      memoryComplete: this.state.memoryCorridor.isMemoryComplete
    };
  }

  getCluesByExhibition(exhibitionId: string): Clue[] {
    const exhibition = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exhibition) return [];
    
    const clueIds = exhibition.hotspots
      .filter(h => h.type === 'clue')
      .map(h => h.targetId);
    
    return this.clues.filter(c => clueIds.includes(c.id)).map(c => ({ ...c }));
  }

  getCollectedCluesByExhibition(exhibitionId: string): Clue[] {
    const clues = this.getCluesByExhibition(exhibitionId);
    return clues.filter(c => c.collected);
  }

  getCluesByMechanism(mechanismId: string): Clue[] {
    return this.clues.filter(c => 
      c.mechanismPurpose?.some(p => p.mechanismId === mechanismId)
    ).map(c => ({ ...c }));
  }

  getCollectedCluesByMechanism(mechanismId: string): Clue[] {
    const clues = this.getCluesByMechanism(mechanismId);
    return clues.filter(c => c.collected);
  }

  getAvailableCluesForMechanism(mechanismId: string): Clue[] {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech || mech.solved) return [];

    const requiredClueIds: string[] = [];
    
    if (mech.requiredHistoryClues) {
      requiredClueIds.push(...mech.requiredHistoryClues);
    }
    if (mech.requiredArtClues) {
      requiredClueIds.push(...mech.requiredArtClues);
    }
    if (mech.memoryCorridorPhase?.fragmentIds) {
      requiredClueIds.push(...mech.memoryCorridorPhase.fragmentIds);
    }
    if (mech.type === 'restoration' && mech.relicId) {
      const relic = this.relics.find(r => r.id === mech.relicId);
      if (relic) {
        const materialIds = relic.steps.map(s => s.materialId);
        requiredClueIds.push(...materialIds);
      }
    }

    const purposeClueIds = this.clues
      .filter(c => c.mechanismPurpose?.some(p => p.mechanismId === mechanismId))
      .map(c => c.id);
    
    requiredClueIds.push(...purposeClueIds);

    const uniqueIds = [...new Set(requiredClueIds)];
    return this.clues.filter(c => 
      uniqueIds.includes(c.id) && c.collected
    ).map(c => ({ ...c }));
  }

  getAvailableCluesForExhibition(exhibitionId: string): Clue[] {
    const exhibition = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exhibition) return [];

    const mechIds = exhibition.hotspots
      .filter(h => h.type === 'mechanism')
      .map(h => h.targetId);
    
    const availableClueIds: string[] = [];
    for (const mechId of mechIds) {
      const mech = this.mechanisms.find(m => m.id === mechId);
      if (mech && !mech.solved) {
        const clues = this.getAvailableCluesForMechanism(mechId);
        availableClueIds.push(...clues.map(c => c.id));
      }
    }

    const uniqueIds = [...new Set(availableClueIds)];
    return this.clues.filter(c => 
      uniqueIds.includes(c.id) && c.collected
    ).map(c => ({ ...c }));
  }

  isClueUsefulForExhibition(clueId: string, exhibitionId: string): boolean {
    const availableClues = this.getAvailableCluesForExhibition(exhibitionId);
    return availableClues.some(c => c.id === clueId);
  }

  getCluesFiltered(filters: {
    chapterId?: string;
    hallType?: HallType;
    exhibitionId?: string;
    mechanismId?: string;
    onlyCollected?: boolean;
    onlyAvailable?: boolean;
  }): Clue[] {
    let clues = this.clues.map(c => ({ ...c }));

    if (filters.chapterId) {
      clues = clues.filter(c => c.chapterId === filters.chapterId);
    }

    if (filters.hallType) {
      clues = clues.filter(c => c.hallOrigin === filters.hallType);
    }

    if (filters.exhibitionId) {
      const exhibition = this.exhibitions.find(e => e.id === filters.exhibitionId);
      if (exhibition) {
        const clueIds = exhibition.hotspots
          .filter(h => h.type === 'clue')
          .map(h => h.targetId);
        clues = clues.filter(c => clueIds.includes(c.id));
      }
    }

    if (filters.mechanismId) {
      clues = clues.filter(c => 
        c.mechanismPurpose?.some(p => p.mechanismId === filters.mechanismId)
      );
    }

    if (filters.onlyCollected) {
      clues = clues.filter(c => c.collected);
    }

    if (filters.onlyAvailable) {
      let availableClueIds: string[] = [];
      
      if (filters.mechanismId) {
        availableClueIds = this.getAvailableCluesForMechanism(filters.mechanismId).map(c => c.id);
      } else if (filters.exhibitionId) {
        availableClueIds = this.getAvailableCluesForExhibition(filters.exhibitionId).map(c => c.id);
      } else {
        availableClueIds = this.getAvailableCluesForCurrentExhibition().map(c => c.id);
      }
      
      if (availableClueIds.length > 0) {
        clues = clues.filter(c => availableClueIds.includes(c.id));
      } else {
        clues = [];
      }
    }

    return clues;
  }

  getMechanismsByClue(clueId: string): Mechanism[] {
    const clue = this.clues.find(c => c.id === clueId);
    if (!clue?.mechanismPurpose) return [];

    const mechanismIds = clue.mechanismPurpose.map(p => p.mechanismId);
    return this.mechanisms.filter(m => 
      mechanismIds.includes(m.id)
    ).map(m => ({ ...m }));
  }

  getCurrentExhibitionMechanisms(): Mechanism[] {
    const currentExhibition = this.getCurrentExhibition();
    if (!currentExhibition) return [];

    const mechIds = currentExhibition.hotspots
      .filter(h => h.type === 'mechanism')
      .map(h => h.targetId);

    return this.mechanisms.filter(m => 
      mechIds.includes(m.id) && !m.solved
    ).map(m => ({ ...m }));
  }

  getAvailableCluesForCurrentExhibition(): Clue[] {
    const mechanisms = this.getCurrentExhibitionMechanisms();
    const availableClueIds: string[] = [];

    for (const mech of mechanisms) {
      const clues = this.getAvailableCluesForMechanism(mech.id);
      availableClueIds.push(...clues.map(c => c.id));
    }

    const uniqueIds = [...new Set(availableClueIds)];
    return this.clues.filter(c => 
      uniqueIds.includes(c.id) && c.collected
    ).map(c => ({ ...c }));
  }

  isClueUsefulForMechanism(clueId: string, mechanismId: string): boolean {
    const clue = this.clues.find(c => c.id === clueId);
    if (!clue?.collected) return false;
    return clue.mechanismPurpose?.some(p => p.mechanismId === mechanismId) || false;
  }

  isClueUsefulInCurrentExhibition(clueId: string): boolean {
    const mechanisms = this.getCurrentExhibitionMechanisms();
    return mechanisms.some(m => this.isClueUsefulForMechanism(clueId, m.id));
  }

  getClueMechanismPurpose(clueId: string): MechanismPurpose[] {
    const clue = this.clues.find(c => c.id === clueId);
    return clue?.mechanismPurpose?.map(p => ({ ...p })) || [];
  }

  getCluePurposeDisplay(clueId: string): string {
    const purposes = this.getClueMechanismPurpose(clueId);
    if (purposes.length === 0) return '暂无明确用途';
    return purposes.map(p => `${p.mechanismName}：${p.purpose}`).join('\n');
  }

  getDistinctMechanismPurposes(): { id: string; name: string }[] {
    const purposeSet = new Map<string, string>();
    
    this.clues.forEach(clue => {
      clue.mechanismPurpose?.forEach(p => {
        if (!purposeSet.has(p.mechanismId)) {
          purposeSet.set(p.mechanismId, p.mechanismName);
        }
      });
    });

    return Array.from(purposeSet.entries()).map(([id, name]) => ({ id, name }));
  }

  getDistinctExhibitionsForCollectedClues(): { id: string; name: string; chapterId: string }[] {
    const exhibitionSet = new Map<string, { name: string; chapterId: string }>();
    
    const unlockedExhibitions = this.getUnlockedExhibitions();
    unlockedExhibitions.forEach(exhibition => {
      if (!exhibitionSet.has(exhibition.id)) {
        exhibitionSet.set(exhibition.id, {
          name: exhibition.name,
          chapterId: exhibition.chapterId
        });
      }
    });
    
    this.clues.filter(c => c.collected).forEach(clue => {
      clue.mechanismPurpose?.forEach(p => {
        if (p.exhibitionId && !exhibitionSet.has(p.exhibitionId)) {
          const exhibition = this.exhibitions.find(e => e.id === p.exhibitionId);
          if (exhibition) {
            const chapter = this.chapters.find(ch => ch.exhibitions.includes(p.exhibitionId!));
            exhibitionSet.set(p.exhibitionId, { 
              name: exhibition.name, 
              chapterId: chapter?.id || '' 
            });
          }
        }
      });
    });

    return Array.from(exhibitionSet.entries())
      .map(([id, data]) => ({ 
        id, 
        name: data.name, 
        chapterId: data.chapterId 
      }))
      .sort((a, b) => {
        if (a.chapterId !== b.chapterId) {
          return a.chapterId.localeCompare(b.chapterId);
        }
        return a.name.localeCompare(b.name, 'zh-CN');
      });
  }

  getChapterKeyPoints(chapterId: string): ChapterKeyPoint[] {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return [];

    return chapter.keyPoints.map(kp => {
      let isCompleted = false;

      if (kp.type === 'clue') {
        isCompleted = this.state.collectedClues.includes(kp.targetId);
      } else if (kp.type === 'mechanism') {
        isCompleted = this.state.solvedMechanisms.includes(kp.targetId);
      } else if (kp.type === 'exhibition') {
        isCompleted = this.state.unlockedExhibitions.includes(kp.targetId);
      } else if (kp.type === 'story') {
        if (kp.targetId.startsWith('chapter_')) {
          const targetChapter = this.chapters.find(c => c.id === kp.targetId);
          isCompleted = targetChapter?.unlocked || false;
        } else {
          isCompleted = true;
        }
      } else if (kp.type === 'choice') {
        isCompleted = this.state.memoryCorridor.madeChoices[kp.targetId] !== undefined;
      }

      return {
        ...kp,
        isCompleted,
        completedAt: isCompleted ? Date.now() : undefined
      };
    });
  }

  updateKeyPointCompletion(chapterId: string, keyPointId: string): boolean {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return false;

    const keyPoint = chapter.keyPoints.find(kp => kp.id === keyPointId);
    if (!keyPoint) return false;

    keyPoint.isCompleted = true;
    keyPoint.completedAt = Date.now();

    eventBus.emit('chapter:keypoint-complete', { chapterId, keyPointId, keyPoint });
    this.saveToStorage();
    return true;
  }

  getIncompleteConditions(chapterId: string): ChapterIncompleteCondition[] {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return [];

    const conditions: ChapterIncompleteCondition[] = [];

    chapter.requiredClues.forEach((clueId, index) => {
      const clue = this.clues.find(c => c.id === clueId);
      if (!clue || this.state.collectedClues.includes(clueId)) return;

      const exhibition = this.findExhibitionForClue(clueId);

      conditions.push({
        id: `cond_${chapterId}_clue_${index}`,
        chapterId,
        type: 'clue',
        targetId: clueId,
        targetName: clue.name,
        description: `还未收集线索「${clue.name}」`,
        hint: clue.hint || this.generateClueHint(clue),
        location: exhibition?.name || '未知区域',
        exhibitionId: exhibition?.id,
        priority: 'high'
      });
    });

    const chapterMechanisms = this.getChapterMechanisms(chapterId);
    chapterMechanisms.forEach((mech, index) => {
      if (this.state.solvedMechanisms.includes(mech.id)) return;

      const exhibition = this.findExhibitionForMechanism(mech.id);
      const requiredClues = this.getRequiredCluesForMechanism(mech.id);
      const missingClues = requiredClues.filter(cid => !this.state.collectedClues.includes(cid));

      conditions.push({
        id: `cond_${chapterId}_mech_${index}`,
        chapterId,
        type: 'mechanism',
        targetId: mech.id,
        targetName: mech.displayName,
        description: `还未解开机关「${mech.displayName}」`,
        hint: missingClues.length > 0 
          ? `需要先收集线索：${missingClues.map(cid => this.clues.find(c => c.id === cid)?.name).join('、')}` 
          : mech.hint,
        location: exhibition?.name || '未知区域',
        exhibitionId: exhibition?.id,
        priority: missingClues.length > 0 ? 'medium' : 'high'
      });
    });

    if (chapter.branchChoices) {
      chapter.branchChoices.forEach((branchId, index) => {
        if (this.state.memoryCorridor.madeChoices[branchId]) return;

        const branch = this.branchChoices.find(b => b.id === branchId);
        const requiredClues = branch?.requiredClues || [];
        const missingClues = requiredClues.filter(cid => !this.state.collectedClues.includes(cid));

        conditions.push({
          id: `cond_${chapterId}_choice_${index}`,
          chapterId,
          type: 'choice',
          targetId: branchId,
          targetName: branch?.text || '关键抉择',
          description: `还未做出抉择「${branch?.text || '关键抉择'}」`,
          hint: missingClues.length > 0
            ? `需要先收集线索：${missingClues.map(cid => this.clues.find(c => c.id === cid)?.name).join('、')}`
            : '准备好后即可面对人生的重要选择',
          priority: missingClues.length > 0 ? 'medium' : 'high'
        });
      });
    }

    const memoryClues = this.clues.filter(c => c.chapterId === chapterId && c.isMemory);
    memoryClues.forEach((clue, index) => {
      if (this.state.collectedClues.includes(clue.id)) return;

      const exhibition = this.findExhibitionForClue(clue.id);

      conditions.push({
        id: `cond_${chapterId}_memory_${index}`,
        chapterId,
        type: 'memory',
        targetId: clue.id,
        targetName: clue.name,
        description: `记忆碎片「${clue.name}」还未收集`,
        hint: `探索${exhibition?.name || '相关区域'}，寻找隐藏的记忆碎片`,
        location: exhibition?.name || '未知区域',
        exhibitionId: exhibition?.id,
        priority: 'medium'
      });
    });

    return conditions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  getMemoryFragmentGaps(chapterId: string): MemoryFragmentGap[] {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return [];

    const memoryClues = this.clues.filter(c => c.chapterId === chapterId && c.isMemory);
    
    return memoryClues.map(clue => {
      const exhibition = this.findExhibitionForClue(clue.id);
      const nearbyClues = this.findNearbyClues(clue.id, exhibition?.id);
      const isCollected = this.state.collectedClues.includes(clue.id);

      let requiredForPhase: number | undefined;
      if (chapter.memoryPhases) {
        for (const phase of chapter.memoryPhases) {
          if (phase.requiredClues.includes(clue.id)) {
            requiredForPhase = phase.phase;
            break;
          }
        }
      }

      return {
        id: `gap_${chapterId}_${clue.id}`,
        chapterId,
        fragmentId: clue.id,
        fragmentName: clue.name,
        memoryOrder: clue.memoryOrder || 0,
        description: clue.description,
        location: exhibition?.name || '未知区域',
        exhibitionId: exhibition?.id || '',
        hint: this.generateMemoryGapHint(clue, isCollected, requiredForPhase),
        nearbyClues,
        isCollected,
        requiredForPhase
      };
    }).sort((a, b) => a.memoryOrder - b.memoryOrder);
  }

  analyzeChapterProgress(chapterId: string): ChapterProgressAnalysis {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) {
      return {
        chapterId,
        chapterTitle: '未知章节',
        completionPercentage: 0,
        totalKeyPoints: 0,
        completedKeyPoints: 0,
        keyPoints: [],
        incompleteConditions: [],
        memoryGaps: [],
        totalMemoryFragments: 0,
        collectedMemoryFragments: 0,
        nextSuggestion: '章节不存在',
        estimatedRemainingTime: '0分钟'
      };
    }

    const keyPoints = this.getChapterKeyPoints(chapterId);
    const completedKeyPoints = keyPoints.filter(kp => kp.isCompleted).length;
    const incompleteConditions = this.getIncompleteConditions(chapterId);
    const memoryGaps = this.getMemoryFragmentGaps(chapterId);
    const totalMemoryFragments = memoryGaps.length;
    const collectedMemoryFragments = memoryGaps.filter(g => g.isCollected).length;

    const clueProgress = chapter.requiredClues.length > 0
      ? chapter.requiredClues.filter(id => this.state.collectedClues.includes(id)).length / chapter.requiredClues.length
      : 1;

    const keyPointProgress = keyPoints.length > 0 ? completedKeyPoints / keyPoints.length : 1;
    const memoryProgress = totalMemoryFragments > 0 ? collectedMemoryFragments / totalMemoryFragments : 1;

    const completionPercentage = Math.round(((clueProgress + keyPointProgress + memoryProgress) / 3) * 100);

    const nextSuggestion = this.generateNextSuggestion(incompleteConditions, memoryGaps);
    const estimatedRemainingTime = this.estimateRemainingTime(incompleteConditions.length, memoryGaps.filter(g => !g.isCollected).length);

    return {
      chapterId,
      chapterTitle: chapter.title,
      completionPercentage,
      totalKeyPoints: keyPoints.length,
      completedKeyPoints,
      keyPoints,
      incompleteConditions,
      memoryGaps,
      totalMemoryFragments,
      collectedMemoryFragments,
      nextSuggestion,
      estimatedRemainingTime
    };
  }

  getChapterKeyPointReview(chapterId: string): ChapterKeyPointReview | null {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.completed) return null;

    const completedKeyPoints = this.getChapterKeyPoints(chapterId).filter(kp => kp.isCompleted);
    const memoryFragments = this.getMemoryFragments(chapterId);
    const importantChoices = this.getChoiceSummary().filter(c => {
      const branch = this.branchChoices.find(b => b.id === c.branchId);
      return branch?.chapterId === chapterId;
    });

    return {
      chapterId,
      chapterTitle: chapter.title,
      completedKeyPoints,
      totalPlayTime: Date.now() - this.chapterStartTime,
      chapterPlayTime: Date.now() - this.chapterStartTime,
      storySummary: chapter.storyText,
      memoryFragmentsCollected: memoryFragments,
      importantChoices
    };
  }

  private findExhibitionForClue(clueId: string): Exhibition | undefined {
    for (const exhibition of this.exhibitions) {
      const clueHotspot = exhibition.hotspots.find(h => h.type === 'clue' && h.targetId === clueId);
      if (clueHotspot) return exhibition;
    }
    return undefined;
  }

  private findExhibitionForMechanism(mechanismId: string): Exhibition | undefined {
    for (const exhibition of this.exhibitions) {
      const mechHotspot = exhibition.hotspots.find(h => h.type === 'mechanism' && h.targetId === mechanismId);
      if (mechHotspot) return exhibition;
    }
    return undefined;
  }

  private findNearbyClues(clueId: string, exhibitionId?: string): string[] {
    if (!exhibitionId) return [];
    
    const exhibition = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exhibition) return [];

    return exhibition.hotspots
      .filter(h => h.type === 'clue' && h.targetId !== clueId)
      .map(h => h.targetId);
  }

  private getChapterMechanisms(chapterId: string): Mechanism[] {
    const chapter = this.chapters.find(c => c.id === chapterId);
    if (!chapter) return [];

    const mechanisms: Mechanism[] = [];
    for (const exhId of chapter.exhibitions) {
      const exhibition = this.exhibitions.find(e => e.id === exhId);
      if (exhibition) {
        for (const hotspot of exhibition.hotspots) {
          if (hotspot.type === 'mechanism') {
            const mech = this.mechanisms.find(m => m.id === hotspot.targetId);
            if (mech && !mechanisms.find(m => m.id === mech.id)) {
              mechanisms.push(mech);
            }
          }
        }
      }
    }
    return mechanisms;
  }

  private getRequiredCluesForMechanism(mechanismId: string): string[] {
    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) return [];

    const requiredClues: string[] = [];
    
    if (mech.requiredHistoryClues) {
      requiredClues.push(...mech.requiredHistoryClues);
    }
    if (mech.requiredArtClues) {
      requiredClues.push(...mech.requiredArtClues);
    }
    if (mech.memoryCorridorPhase?.fragmentIds) {
      requiredClues.push(...mech.memoryCorridorPhase.fragmentIds);
    }

    const purposeClues = this.clues
      .filter(c => c.mechanismPurpose?.some(p => p.mechanismId === mechanismId))
      .map(c => c.id);
    
    requiredClues.push(...purposeClues);

    return [...new Set(requiredClues)];
  }

  private generateClueHint(clue: Clue): string {
    if (clue.mechanismPurpose && clue.mechanismPurpose.length > 0) {
      const purpose = clue.mechanismPurpose[0];
      return `这个线索与「${purpose.mechanismName}」有关，${purpose.purpose}`;
    }
    return '仔细探索周围的环境，寻找隐藏的线索';
  }

  private generateMemoryGapHint(clue: Clue, isCollected: boolean, requiredForPhase?: number): string {
    if (isCollected) {
      return '✅ 已收集';
    }
    
    if (clue.mechanismPurpose && clue.mechanismPurpose.length > 0) {
      const purpose = clue.mechanismPurpose[0];
      return `💡 这个记忆碎片将用于「${purpose.mechanismName}」`;
    }
    
    if (requiredForPhase) {
      return `💡 这是第${requiredForPhase}阶段需要的记忆碎片`;
    }
    
    return '💡 继续探索，找到隐藏的记忆碎片';
  }

  private generateNextSuggestion(conditions: ChapterIncompleteCondition[], gaps: MemoryFragmentGap[]): string {
    if (conditions.length === 0 && gaps.every(g => g.isCollected)) {
      return '🎉 本章节所有内容已完成！';
    }

    const highPriorityCondition = conditions.find(c => c.priority === 'high');
    if (highPriorityCondition) {
      return `💡 建议先去「${highPriorityCondition.location}」${highPriorityCondition.hint}`;
    }

    const uncollectedGap = gaps.find(g => !g.isCollected);
    if (uncollectedGap) {
      return `💡 建议前往「${uncollectedGap.location}」寻找记忆碎片「${uncollectedGap.fragmentName}」`;
    }

    const mediumPriorityCondition = conditions.find(c => c.priority === 'medium');
    if (mediumPriorityCondition) {
      return `💡 建议前往「${mediumPriorityCondition.location}」${mediumPriorityCondition.hint}`;
    }

    return '继续探索博物馆，发现更多秘密';
  }

  private estimateRemainingTime(incompleteCount: number, missingMemoryCount: number): string {
    const totalTasks = incompleteCount + missingMemoryCount;
    const estimatedMinutes = Math.max(1, Math.round(totalTasks * 3));
    
    if (estimatedMinutes < 60) {
      return `约${estimatedMinutes}分钟`;
    }
    
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    
    if (minutes === 0) {
      return `约${hours}小时`;
    }
    return `约${hours}小时${minutes}分钟`;
  }

  navigateToExhibition(exhibitionId: string): boolean {
    const exhibition = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exhibition) return false;
    if (!exhibition.unlocked) {
      eventBus.emit('navigation:blocked', { exhibitionId, reason: '展区未解锁' });
      return false;
    }

    return this.setCurrentExhibition(exhibitionId);
  }

  getNextChapter(currentChapterId: string): Chapter | null {
    const chapters = this.getChapters();
    const currentIndex = chapters.findIndex(c => c.id === currentChapterId);
    if (currentIndex === -1 || currentIndex >= chapters.length - 1) return null;
    return chapters[currentIndex + 1];
  }

  getChapterUnlockedExhibitions(chapterId: string): Exhibition[] {
    const chapter = this.getChapterById(chapterId);
    if (!chapter) return [];
    
    return chapter.exhibitions
      .map(exhId => this.getExhibitionById(exhId))
      .filter((exh): exh is Exhibition => exh !== undefined && exh.unlocked);
  }

  getChapterNewExhibitions(chapterId: string): Exhibition[] {
    const chapter = this.getChapterById(chapterId);
    if (!chapter) return [];
    
    return this.newlyUnlockedExhibitions
      .filter(exhId => chapter.exhibitions.includes(exhId))
      .map(exhId => this.getExhibitionById(exhId))
      .filter((exh): exh is Exhibition => exh !== undefined && exh.unlocked);
  }

  clearNewlyUnlockedExhibitions(): void {
    this.newlyUnlockedExhibitions = [];
  }

  getArchiveProgressForChapter(chapterId: string): { total: number; archived: number; unarchived: string[] } {
    const chapter = this.getChapterById(chapterId);
    if (!chapter) return { total: 0, archived: 0, unarchived: [] };

    const requiredClues = chapter.requiredClues;
    const archivedClues = requiredClues.filter(id => 
      this.state.archive.archivedClues.includes(id)
    );
    const unarchivedClues = requiredClues.filter(id => 
      this.state.collectedClues.includes(id) && 
      !this.state.archive.archivedClues.includes(id)
    );

    return {
      total: requiredClues.length,
      archived: archivedClues.length,
      unarchived: unarchivedClues
    };
  }

  getNavigationHint(targetId: string, targetType: 'clue' | 'mechanism' | 'exhibition'): { path: string[]; hint: string } {
    const currentExhibition = this.getCurrentExhibition();
    const path: string[] = [];
    let hint = '';

    if (targetType === 'exhibition') {
      const targetExhibition = this.exhibitions.find(e => e.id === targetId);
      if (targetExhibition) {
        if (currentExhibition?.id === targetId) {
          hint = '你已在目标展区';
        } else if (!targetExhibition.unlocked) {
          hint = '目标展区尚未解锁，需要完成前置任务';
        } else {
          path.push(targetId);
          hint = `前往「${targetExhibition.name}」`;
        }
      }
    } else if (targetType === 'clue') {
      const targetExhibition = this.findExhibitionForClue(targetId);
      const clue = this.clues.find(c => c.id === targetId);
      
      if (targetExhibition && clue) {
        if (currentExhibition?.id === targetExhibition.id) {
          path.push(targetExhibition.id);
          hint = `在「${targetExhibition.name}」中寻找「${clue.name}」`;
        } else if (!targetExhibition.unlocked) {
          hint = `「${clue.name}」所在的「${targetExhibition.name}」尚未解锁`;
        } else {
          path.push(targetExhibition.id);
          hint = `先前往「${targetExhibition.name}」，然后寻找「${clue.name}」`;
        }
      }
    } else if (targetType === 'mechanism') {
      const targetExhibition = this.findExhibitionForMechanism(targetId);
      const mechanism = this.mechanisms.find(m => m.id === targetId);
      
      if (targetExhibition && mechanism) {
        if (currentExhibition?.id === targetExhibition.id) {
          path.push(targetExhibition.id);
          hint = `在「${targetExhibition.name}」中寻找「${mechanism.displayName}」`;
        } else if (!targetExhibition.unlocked) {
          hint = `「${mechanism.displayName}」所在的「${targetExhibition.name}」尚未解锁`;
        } else {
          path.push(targetExhibition.id);
          hint = `先前往「${targetExhibition.name}」，然后寻找「${mechanism.displayName}」`;
        }
      }
    }

    return { path, hint };
  }
}

export const store = new Store();
