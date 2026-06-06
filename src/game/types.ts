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
  branchChoiceId?: string;
  isEndingClue?: boolean;
  endingId?: string;
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

export interface AuthenticityCheckPoint {
  id: string;
  name: string;
  description: string;
  icon: string;
  isGenuine: boolean;
  genuineEvidence: string;
  fakeEvidence: string;
  position: { x: number; y: number };
  checked: boolean;
  correctVerdict?: boolean;
}

export interface AuthenticityRelic {
  id: string;
  name: string;
  description: string;
  genuineDescription: string;
  fakeDescription: string;
  icon: string;
  isGenuine: boolean;
  chapterId: string;
  checkPoints: AuthenticityCheckPoint[];
  passwordClue: string;
  passwordDigit: number;
  digitPosition: number;
  verified: boolean;
  verdict?: 'genuine' | 'fake' | null;
}

export interface AuthenticityState {
  currentRelic: string | null;
  verifiedRelics: string[];
  checkPointProgress: Record<string, string[]>;
  derivedPassword: string;
  attempts: number;
  maxAttempts: number;
  rewards: AuthenticityReward[];
}

export interface AuthenticityReward {
  type: 'score' | 'clue' | 'unlock' | 'story';
  value: number | string;
  description: string;
  claimed: boolean;
}

export interface Mechanism {
  id: string;
  type: 'password' | 'sequence' | 'restoration' | 'linked' | 'authenticity' | 'memory_sort' | 'branch_choice';
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
  authenticityRelicIds?: string[];
  memoryCorridorPhase?: {
    phase: number;
    fragmentIds?: string[];
  };
  branchChoiceId?: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  exhibitions: string[];
  requiredClues: string[];
  storyText: string;
  completed: boolean;
  unlocked: boolean;
  isDualHall?: boolean;
  historyExhibitions?: string[];
  artExhibitions?: string[];
  dualHallStoryText?: {
    history: string;
    art: string;
    combined: string;
  };
  isAuthenticity?: boolean;
  isMemoryCorridor?: boolean;
  memoryPhases?: {
    phase: number;
    name: string;
    exhibitionId: string;
    description: string;
    requiredClues: string[];
  }[];
  branchChoices?: string[];
  endings?: string[];
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
  endingId?: string;
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

export type LightingState = 'normal' | 'flickering' | 'dim' | 'dark' | 'emergency';
export type PowerOutagePhase = 'idle' | 'warning' | 'outage' | 'recovery' | 'complete';
export type HiddenHotspotType = 'clue' | 'mechanism' | 'exit' | 'story';

export interface HiddenHotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: HiddenHotspotType;
  targetId: string;
  hint: string;
  activated: boolean;
  visibleInDark: boolean;
  requiredLighting?: LightingState;
}

export interface TimedMechanism {
  id: string;
  mechanismId: string;
  exhibitionId: string;
  timeLimit: number;
  startTime: number;
  endTime: number;
  active: boolean;
  completed: boolean;
  failed: boolean;
  reward?: string;
  penalty?: string;
}

export interface PowerOutageEvent {
  id: string;
  exhibitionId: string;
  phase: PowerOutagePhase;
  name: string;
  description: string;
  triggered: boolean;
  completed: boolean;
  lightingState: LightingState;
  duration: number;
  revealHiddenHotspots: string[];
  triggerTimedMechanisms: string[];
  audioTransition: {
    from: string;
    to: string;
    sfx: string;
  };
  icon: string;
}

export interface PowerOutageState {
  active: boolean;
  currentPhase: PowerOutagePhase;
  currentExhibitionId: string;
  activeEvents: string[];
  completedEvents: string[];
  lightingState: LightingState;
  revealedHotspots: string[];
  activeTimedMechanisms: string[];
  completedTimedMechanisms: string[];
  failedTimedMechanisms: string[];
  eventStartTime: number;
  totalPowerOutages: number;
}

export interface NightPatrolState {
  mode: ExhibitionMode;
  activeEvents: string[];
  resolvedEvents: string[];
  resetMechanisms: string[];
  patrolStartTime: number;
  totalEventsResolved: number;
  powerOutage: PowerOutageState;
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

export interface Ending {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  storyText: string;
  type: 'good' | 'neutral' | 'bad' | 'true';
  unlockConditions: {
    requiredClues?: string[];
    requiredChoices?: string[];
    requiredMemoryComplete?: boolean;
  };
  unlocked: boolean;
  achieved: boolean;
  icon: string;
  epilogueText: string;
}

export interface BranchChoice {
  id: string;
  chapterId: string;
  text: string;
  description: string;
  choices: {
    id: string;
    text: string;
    consequence: string;
    leadsToEnding?: string;
    unlocksClue?: string;
    unlocksExhibition?: string;
  }[];
  selectedChoiceId: string | null;
  madeAt: number | null;
  requiredClues?: string[];
  unlocked: boolean;
}

export interface MemoryCorridorState {
  currentPhase: number;
  completedPhases: number[];
  unlockedEndings: string[];
  achievedEndings: string[];
  madeChoices: Record<string, string>;
  fragmentSortingProgress: number;
  isMemoryComplete: boolean;
  currentEnding: string | null;
}

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

export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  role: string;
  relationships: CharacterRelationship[];
  chapterId: string;
  unlocked: boolean;
  relatedClues: string[];
  relatedEvents: string[];
}

export interface CharacterRelationship {
  targetId: string;
  relationshipType: 'family' | 'friend' | 'teacher' | 'enemy' | 'mysterious';
  description: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  chapterId: string;
  order: number;
  type: 'story' | 'clue' | 'mechanism' | 'character' | 'important';
  relatedClueIds: string[];
  relatedCharacterIds: string[];
  unlocked: boolean;
  image?: string;
}

export interface ReadingRoomState {
  unlockedCharacters: string[];
  unlockedEvents: string[];
  viewedCharacters: string[];
  viewedEvents: string[];
  searchHistory: string[];
  favoriteClues: string[];
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
  readingRoom: ReadingRoomState;
  authenticity: AuthenticityState;
  memoryCorridor: MemoryCorridorState;
}

export interface MemorySortData {
  phase: number;
  fragments: Clue[];
  collectedFragments: Clue[];
  requiredCount: number;
  collectedCount: number;
}

export interface PasswordData {
  hint: string;
  displayName: string;
}

export interface AuthenticityData {
  relicIds: string[];
}

export type MechanismInteractionType =
  | 'unknown'
  | 'already_solved'
  | 'password'
  | 'sequence'
  | 'restoration'
  | 'linked'
  | 'authenticity'
  | 'memory_sort'
  | 'branch_choice';

export interface MechanismInteractionResult {
  success: boolean;
  type: MechanismInteractionType;
  reason?: string;
  mechanism?: Mechanism;
  memorySortData?: MemorySortData;
  passwordData?: PasswordData;
  authenticityData?: AuthenticityData;
  branch?: BranchChoice;
  selectedChoice?: BranchChoice['choices'][number];
}

export interface MemorySortSubmitResult {
  success: boolean;
  correct?: boolean;
  reason?: string;
  reward?: string;
  message?: string;
  progress?: number;
}

export interface BranchChoiceSubmitResult {
  success: boolean;
  reason?: string;
  consequence?: string;
  endingId?: string;
  unlocksClue?: string;
  unlocksExhibition?: string;
  reward?: string;
}

export interface TimedMechanismResult {
  success: boolean;
  mechanismId: string;
  timedMechanismId: string;
  timeRemaining?: number;
  completed?: boolean;
  failed?: boolean;
  reward?: string;
  penalty?: string;
  message?: string;
}

export interface PowerOutageResult {
  success: boolean;
  eventId: string;
  phase: PowerOutagePhase;
  lightingState: LightingState;
  revealedHotspots?: string[];
  triggeredMechanisms?: string[];
  message?: string;
}

export interface HiddenHotspotInteractionResult {
  success: boolean;
  hotspotId: string;
  targetId: string;
  type: HiddenHotspotType;
  unlocked?: boolean;
  message?: string;
}
