import { GameState, GameSettings, Clue, Exhibition, Chapter, Mechanism } from './types';
import { CLUES } from './data/clues';
import { EXHIBITIONS, CHAPTERS, MECHANISMS } from './data/chapters';
import { eventBus } from './EventBus';

class Store {
  private state: GameState;
  private clues: Clue[];
  private exhibitions: Exhibition[];
  private chapters: Chapter[];
  private mechanisms: Mechanism[];

  constructor() {
    const savedState = this.loadFromStorage();
    this.clues = JSON.parse(JSON.stringify(CLUES));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS));

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
      }
    };

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

  resetGame(): void {
    localStorage.removeItem('amber-memory-hall-save');
    this.clues = JSON.parse(JSON.stringify(CLUES));
    this.exhibitions = JSON.parse(JSON.stringify(EXHIBITIONS));
    this.chapters = JSON.parse(JSON.stringify(CHAPTERS));
    this.mechanisms = JSON.parse(JSON.stringify(MECHANISMS));
    this.state = {
      currentChapter: 'chapter_1',
      currentExhibition: 'exhibition_1',
      collectedClues: [],
      solvedMechanisms: [],
      unlockedExhibitions: ['exhibition_1', 'exhibition_2', 'exhibition_3'],
      settings: this.state.settings
    };
    eventBus.emit('game:reset');
  }

  checkMemoryOrder(fragmentIds: string[]): boolean {
    const fragments = fragmentIds.map(id => this.getClueById(id)).filter(Boolean) as Clue[];
    for (let i = 0; i < fragments.length; i++) {
      if (fragments[i].memoryOrder !== i + 1) return false;
    }
    return true;
  }
}

export const store = new Store();
