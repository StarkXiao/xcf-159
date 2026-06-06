export interface Clue {
  id: string;
  name: string;
  description: string;
  icon: string;
  chapterId: string;
  isMemory: boolean;
  memoryOrder?: number;
  collected: boolean;
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'clue' | 'mechanism' | 'exit';
  targetId: string;
  hint: string;
  activated: boolean;
}

export interface Exhibition {
  id: string;
  name: string;
  bgColor: number;
  hotspots: Hotspot[];
  unlocked: boolean;
  description: string;
}

export interface Mechanism {
  id: string;
  type: 'password' | 'sequence';
  answer: string | number[];
  reward: string;
  hint: string;
  solved: boolean;
  displayName: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  exhibitions: string[];
  requiredClues: string[];
  storyText: string;
  completed: boolean;
}

export interface GameSettings {
  bgmVolume: number;
  sfxVolume: number;
  bgmMuted: boolean;
  sfxMuted: boolean;
}

export type SceneType = 'start' | 'game' | 'end';

export interface MemoryFragment {
  id: string;
  text: string;
  correctOrder: number;
  currentOrder: number;
}

export interface AudioRecording {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  transcript: string;
  duration: number;
  frequency: number;
  unlocked: boolean;
  played: boolean;
  requiredClues?: string[];
  requiredMemoryComplete?: boolean;
}

export interface ArchiveEntry {
  id: string;
  chapterId: string;
  clueId: string;
  archivedAt: number;
  notes: string;
}

export interface ArchiveState {
  unlockedRecordings: string[];
  playedRecordings: string[];
  archivedClues: string[];
  archiveEntries: ArchiveEntry[];
  completedChapters: string[];
}

export interface GameState {
  currentChapter: string;
  currentExhibition: string;
  collectedClues: string[];
  solvedMechanisms: string[];
  unlockedExhibitions: string[];
  settings: GameSettings;
  archive: ArchiveState;
}
