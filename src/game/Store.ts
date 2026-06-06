import { GameState, GameSettings, Clue, Exhibition, Chapter, Mechanism, AudioRecording, ArchiveState, ArchiveEntry, NightEvent, ExhibitionMode, NightPatrolState, Relic, RestorationMaterial, RestorationState, HallType, DualHallState, VisitorQuest, VisitorQuestState, ChapterEvaluation, QuestHistoryEntry, Character, TimelineEvent, ReadingRoomState, AuthenticityRelic, AuthenticityState, AuthenticityReward, Ending, BranchChoice, MemoryCorridorState, MechanismInteractionResult, MemorySortSubmitResult, BranchChoiceSubmitResult } from './types';
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
import { eventBus } from './EventBus';

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
  private chapterStartTime: number = Date.now();

  constructor() {
    const savedState = this.loadFromStorage();
    this.clues = JSON.parse(JSON.stringify(CLUES));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS));
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

    const defaultArchive: ArchiveState = {
      unlockedRecordings: ['rec_intro', 'rec_ch1_unlock'],
      playedRecordings: [],
      archivedClues: [],
      archiveEntries: [],
      completedChapters: []
    };

    const defaultNightPatrol: NightPatrolState = {
      mode: 'day',
      activeEvents: [],
      resolvedEvents: [],
      resetMechanisms: [],
      patrolStartTime: 0,
      totalEventsResolved: 0
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

    this.state = savedState || {
      currentChapter: 'chapter_1',
      currentExhibition: 'exhibition_1',
      collectedClues: [],
      solvedMechanisms: [],
      unlockedExhibitions: ['exhibition_1', 'exhibition_2', 'exhibition_3'],
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
      memoryCorridor: defaultMemoryCorridor
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

    this.applyStateToData();
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

    eventBus.emit('clue:collect', { clueId });
    this.saveToStorage();
    return true;
  }

  solveMechanism(mechanismId: string): boolean {
    if (this.state.solvedMechanisms.includes(mechanismId)) return false;

    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) return false;

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

    eventBus.emit('mechanism:solve', { mechanismId, reward: mech.reward });
    this.saveToStorage();
    return true;
  }

  unlockExhibition(exhibitionId: string): boolean {
    if (this.state.unlockedExhibitions.includes(exhibitionId)) return false;

    const exh = this.exhibitions.find(e => e.id === exhibitionId);
    if (!exh) return false;

    exh.unlocked = true;
    this.state.unlockedExhibitions.push(exhibitionId);

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
    this.clues = JSON.parse(JSON.stringify(CLUES));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS));
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
    this.chapterStartTime = Date.now();
    this.state = {
      currentChapter: 'chapter_1',
      currentExhibition: 'exhibition_1',
      collectedClues: [],
      solvedMechanisms: [],
      unlockedExhibitions: ['exhibition_1', 'exhibition_2', 'exhibition_3'],
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
        totalEventsResolved: 0
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
      }
    };
    this.applyStateToData();
    eventBus.emit('game:reset');
  }

  checkMemoryOrder(fragmentIds: string[]): boolean {
    const fragments = fragmentIds.map(id => this.getClueById(id)).filter(Boolean) as Clue[];
    for (let i = 0; i < fragments.length; i++) {
      if (fragments[i].memoryOrder !== i + 1) return false;
    }
    return true;
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

  solveLinkedMechanism(mechanismId: string): boolean {
    if (!this.canSolveLinkedMechanism(mechanismId)) return false;

    const mech = this.mechanisms.find(m => m.id === mechanismId);
    if (!mech) return false;

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

  checkEndingUnlockConditions(endingId: string): boolean {
    const ending = this.endings.find(e => e.id === endingId);
    if (!ending) return false;

    const { requiredClues, requiredChoices, requiredMemoryComplete } = ending.unlockConditions;

    if (requiredMemoryComplete && !this.state.memoryCorridor.isMemoryComplete) {
      return false;
    }

    if (requiredClues && requiredClues.length > 0) {
      const allCluesCollected = requiredClues.every(id =>
        this.state.collectedClues.includes(id)
      );
      if (!allCluesCollected) return false;
    }

    if (requiredChoices && requiredChoices.length > 0) {
      const allChoicesMade = requiredChoices.every(choiceId => {
        const madeChoiceIds = Object.values(this.state.memoryCorridor.madeChoices);
        return madeChoiceIds.includes(choiceId);
      });
      if (!allChoicesMade) return false;
    }

    return true;
  }

  determineEnding(): Ending | null {
    const chapterEndings = this.endings.filter(e => e.chapterId === 'chapter_6');
    
    for (const ending of chapterEndings) {
      if (this.checkEndingUnlockConditions(ending.id)) {
        return { ...ending };
      }
    }
    
    return null;
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

    const isCorrect = this.checkMechanismMemorySort(mechanismId, sortedFragmentIds);

    if (isCorrect) {
      const solved = this.solveMechanism(mechanismId);
      if (solved) {
        return {
          success: true,
          correct: true,
          reward: mech.reward,
          message: '记忆碎片排序正确！'
        };
      }
      return { success: false, reason: '解锁失败' };
    }

    const progress = this.getMemoryFragmentSortingProgress();
    return {
      success: true,
      correct: false,
      progress,
      message: '顺序不正确，请重新排列'
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
}

export const store = new Store();
