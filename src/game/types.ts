export interface Clue {
  id: string;
  name: string;
  description: string;
  icon: string;
  chapterId: string;
  isMemory: boolean;
  memoryOrder?: number;
  collected: boolean;
  hallOrigin?: HallType;
  isShared?: boolean;
  requiredClueFromOtherHall?: string;
  linkedClueId?: string;
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
  hallType?: HallType;
  linkedExhibitionId?: string;
  phase?: number;
}

export interface RestorationMaterial {
  id: string;
  name: string;
  icon: string;
  description: string;
  collected: boolean;
}

export interface RestorationStep {
  id: string;
  order: number;
  name: string;
  description: string;
  materialId: string;
  icon: string;
}

export interface Mechanism {
  id: string;
  type: 'password' | 'sequence' | 'restoration' | 'linked';
  answer: string | number[];
  reward: string;
  hint: string;
  solved: boolean;
  displayName: string;
  relicId?: string;
  hallOrigin?: HallType;
  isLinked?: boolean;
  requiredHistoryClues?: string[];
  requiredArtClues?: string[];
  linkedMechanismId?: string;
  linkedProgress?: number;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  exhibitions: string[];
  requiredClues: string[];
  storyText: string;
  completed: boolean;
  isDualHall?: boolean;
  historyExhibitions?: string[];
  artExhibitions?: string[];
  dualHallStoryText?: {
    history: string;
    art: string;
    combined: string;
  };
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

export type ExhibitionMode = 'day' | 'night';

export interface NightEvent {
  id: string;
  exhibitionId: string;
  name: string;
  description: string;
  type: 'anomaly' | 'sound' | 'figure' | 'whisper';
  hotspot: { x: number; y: number; width: number; height: number };
  triggered: boolean;
  resolved: boolean;
  reward?: string;
  icon: string;
  sfx: string;
}

export interface NightPatrolState {
  mode: ExhibitionMode;
  activeEvents: string[];
  resolvedEvents: string[];
  resetMechanisms: string[];
  patrolStartTime: number;
  totalEventsResolved: number;
}

export interface Relic {
  id: string;
  name: string;
  description: string;
  damagedDescription: string;
  restoredDescription: string;
  damagedIcon: string;
  restoredIcon: string;
  steps: RestorationStep[];
  chapterId: string;
  restored: boolean;
}

export interface RestorationState {
  collectedMaterials: string[];
  restoredRelics: string[];
  currentRestoration: string | null;
}

export type HallType = 'history' | 'art';

export interface DualHallState {
  activeHall: HallType;
  historyProgress: number;
  artProgress: number;
  sharedClues: string[];
  unlockedHalls: HallType[];
  linkedMechanismProgress: Record<string, number>;
  currentInvestigationPhase: number;
}

export interface VisitorQuest {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  visitorName: string;
  visitorAvatar: string;
  requiredItems: QuestItem[];
  reward: QuestReward;
  storyAccept: string;
  storyDeliver: string;
  storyComplete: string;
  status: 'locked' | 'available' | 'accepted' | 'ready' | 'delivering' | 'completed';
  unlockCondition?: {
    requiredClues?: string[];
    requiredCompletedQuests?: string[];
  };
  deadline?: number;
  priority: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface QuestItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  quantity: number;
  collected: boolean;
  source?: {
    type: 'clue' | 'exhibition' | 'mechanism' | 'trade';
    targetId: string;
  };
}

export interface QuestReward {
  type: 'score' | 'item' | 'unlock' | 'story';
  value: number | string;
  description: string;
}

export interface ChapterEvaluation {
  chapterId: string;
  mainStoryScore: number;
  sideQuestsScore: number;
  collectionScore: number;
  efficiencyScore: number;
  totalScore: number;
  rank: 'S' | 'A' | 'B' | 'C';
  completedQuests: string[];
  completionTime: number;
  evaluated: boolean;
}

export interface VisitorQuestState {
  activeQuests: string[];
  completedQuests: string[];
  readyQuests: string[];
  deliveringQuests: string[];
  questProgress: Record<string, Record<string, number>>;
  chapterEvaluations: ChapterEvaluation[];
  totalScore: number;
  currentChapterScore: number;
  questHistory: QuestHistoryEntry[];
}

export interface QuestHistoryEntry {
  questId: string;
  chapterId: string;
  acceptedAt: number;
  deliveredAt?: number;
  completedAt?: number;
  scoreEarned?: number;
  itemsDelivered?: QuestItem[];
}

export interface GameState {
  currentChapter: string;
  currentExhibition: string;
  collectedClues: string[];
  solvedMechanisms: string[];
  unlockedExhibitions: string[];
  settings: GameSettings;
  archive: ArchiveState;
  nightPatrol: NightPatrolState;
  restoration: RestorationState;
  dualHall: DualHallState;
  visitorQuests: VisitorQuestState;
}
