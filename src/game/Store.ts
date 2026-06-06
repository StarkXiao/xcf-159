import { GameState, GameSettings, Clue, Exhibition, Chapter, Mechanism, AudioRecording, ArchiveState, ArchiveEntry, NightEvent, ExhibitionMode, NightPatrolState } from './types';
import { CLUES } from './data/clues';
import { EXHIBITIONS, CHAPTERS, MECHANISMS } from './data/chapters';
import { RECORDINGS } from './data/recordings';
import { NIGHT_EVENTS } from './data/nightEvents';
import { eventBus } from './EventBus';

class Store {
  private state: GameState;
  private clues: Clue[];
  private exhibitions: Exhibition[];
  private chapters: Chapter[];
  private mechanisms: Mechanism[];
  private recordings: AudioRecording[];
  private nightEvents: NightEvent[];

  constructor() {
    const savedState = this.loadFromStorage();
    this.clues = JSON.parse(JSON.stringify(CLUES));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS));
    this.recordings = JSON.parse(JSON.stringify(RECORDINGS));
    this.nightEvents = JSON.parse(JSON.stringify(NIGHT_EVENTS));

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
      nightPatrol: defaultNightPatrol
    };

    if (!this.state.archive) {
      this.state.archive = defaultArchive;
    }

    if (!this.state.nightPatrol) {
      this.state.nightPatrol = defaultNightPatrol;
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

    if (mech.reward === 'ending') {
      this.unlockFinalRecording();
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
}

export const store = new Store();
