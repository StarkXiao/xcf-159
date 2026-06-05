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

export interface GameState {
  currentChapter: string;
  currentExhibition: string;
  collectedClues: string[];
  solvedMechanisms: string[];
  unlockedExhibitions: string[];
  settings: GameSettings;
}

export type SceneType = 'start' | 'game' | 'end';

export interface MemoryFragment {
  id: string;
  text: string;
  correctOrder: number;
  currentOrder: number;
}
