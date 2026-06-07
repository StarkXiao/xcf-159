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
  hint?: string;
  mechanismPurpose?: MechanismPurpose[];
  supplementaryDescription?: string;
}

export interface MechanismPurpose {
  mechanismId: string;
  mechanismName: string;
  purpose: string;
  exhibitionId?: string;
  hallType?: HallType;
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
  investigated?: boolean;
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
  keyPoints: ChapterKeyPoint[];
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
  investigatedHotspots: string[];
  settings: GameSettings;
  archive: ArchiveState;
  nightPatrol: NightPatrolState;
  restoration: RestorationState;
  dualHall: DualHallState;
  visitorQuests: VisitorQuestState;
  readingRoom: ReadingRoomState;
  authenticity: AuthenticityState;
  memoryCorridor: MemoryCorridorState;
  memoryPuzzleRecovery: MemoryPuzzleRecoveryState;
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

export interface FinalReviewClueSummary {
  chapterId: string;
  chapterTitle: string;
  totalClues: number;
  collectedClues: number;
  collectedClueList: Clue[];
  missingClueList: Clue[];
  completionRate: number;
}

export interface FinalReviewMechanismSummary {
  chapterId: string;
  chapterTitle: string;
  totalMechanisms: number;
  solvedMechanisms: number;
  solvedMechanismList: Mechanism[];
  unsolvedMechanismList: Mechanism[];
  completionRate: number;
}

export interface FinalReviewChoiceSummary {
  branchId: string;
  branchTitle: string;
  branchDescription: string;
  selectedChoiceId: string | null;
  selectedChoiceText: string | null;
  selectedChoiceConsequence: string | null;
  allChoices: {
    id: string;
    text: string;
    consequence: string;
    selected: boolean;
    leadsToEnding?: string;
  }[];
  madeAt: number | null;
}

export interface FinalReviewEndingCondition {
  endingId: string;
  endingTitle: string;
  endingType: 'good' | 'neutral' | 'bad' | 'true';
  endingIcon: string;
  isUnlocked: boolean;
  isAchieved: boolean;
  unlockProgress: number;
  requiredConditions: {
    type: 'clue' | 'choice' | 'memory_complete';
    description: string;
    targetId?: string;
    targetName?: string;
    satisfied: boolean;
    currentValue?: string;
    requiredValue?: string;
  }[];
  hint: string;
}

export interface FinalReviewData {
  totalClues: number;
  collectedClues: number;
  totalMechanisms: number;
  solvedMechanisms: number;
  totalChoices: number;
  madeChoices: number;
  clueSummaries: FinalReviewClueSummary[];
  mechanismSummaries: FinalReviewMechanismSummary[];
  choiceSummaries: FinalReviewChoiceSummary[];
  endingConditions: FinalReviewEndingCondition[];
  overallProgress: number;
  playTime: number;
  currentEnding: Ending | null;
  memoryComplete: boolean;
}

export interface FinalReviewTab {
  id: 'clues' | 'mechanisms' | 'choices' | 'endings';
  label: string;
  icon: string;
}

export interface ChapterKeyPoint {
  id: string;
  chapterId: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  type: 'clue' | 'mechanism' | 'exhibition' | 'story' | 'choice';
  targetId: string;
  isCompleted: boolean;
  completedAt?: number;
  hint?: string;
  exhibitionId?: string;
  requiredForPhase?: number;
  relatedClueIds?: string[];
  relatedMechanismIds?: string[];
}

export interface ChapterIncompleteCondition {
  id: string;
  chapterId: string;
  type: 'clue' | 'mechanism' | 'exhibition' | 'choice' | 'memory';
  targetId: string;
  targetName: string;
  description: string;
  hint: string;
  location?: string;
  exhibitionId?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MemoryFragmentGap {
  id: string;
  chapterId: string;
  fragmentId: string;
  fragmentName: string;
  memoryOrder: number;
  description: string;
  location: string;
  exhibitionId: string;
  hint: string;
  nearbyClues: string[];
  isCollected: boolean;
  requiredForPhase?: number;
}

export interface ChapterProgressAnalysis {
  chapterId: string;
  chapterTitle: string;
  completionPercentage: number;
  totalKeyPoints: number;
  completedKeyPoints: number;
  keyPoints: ChapterKeyPoint[];
  incompleteConditions: ChapterIncompleteCondition[];
  memoryGaps: MemoryFragmentGap[];
  totalMemoryFragments: number;
  collectedMemoryFragments: number;
  nextSuggestion: string;
  estimatedRemainingTime: string;
}

export interface ChapterProgressState {
  currentChapterKeyPoints: ChapterKeyPoint[];
  viewedKeyPoints: string[];
  lastProgressCheck: number;
  gapNotificationShown: string[];
}

export interface ChapterKeyPointReview {
  chapterId: string;
  chapterTitle: string;
  completedKeyPoints: ChapterKeyPoint[];
  totalPlayTime: number;
  chapterPlayTime: number;
  storySummary: string;
  memoryFragmentsCollected: Clue[];
  importantChoices: FinalReviewChoiceSummary[];
}

export type ProgressPanelTab = 'overview' | 'keypoints' | 'incomplete' | 'memorygaps';

export interface ProgressEvents {
  'chapter:keypoint-complete': { chapterId: string; keyPointId: string; keyPoint: ChapterKeyPoint };
  'progress:chapter-complete': { chapterId: string };
  'progress:gap-detected': { chapterId: string; gap: MemoryFragmentGap };
  'progress:incomplete-found': { chapterId: string; condition: ChapterIncompleteCondition };
  'navigation:blocked': { exhibitionId: string; reason: string };
  'exhibition:change': { exhibitionId: string };
}

export type MechanismErrorType =
  | 'incomplete_input'
  | 'format_error'
  | 'partial_correct'
  | 'completely_wrong'
  | 'attempts_exhausted';

export interface MechanismErrorFeedback {
  type: MechanismErrorType;
  message: string;
  sfx: string;
  hintText: string;
  correctPositions?: number[];
  wrongPositions?: number[];
  remainingAttempts?: number;
}

export interface MemoryPuzzleAttempt {
  attemptNumber: number;
  arrangedIds: string[];
  correctCount: number;
  correctPositions: number[];
  wrongPositions: number[];
  timestamp: number;
}

export interface MemoryPuzzleState {
  puzzleId: string;
  chapterId: string;
  attempts: MemoryPuzzleAttempt[];
  hintsUsed: number;
  maxHints: number;
  skipped: boolean;
  skipCost: number;
  startTime: number;
  completedTime: number | null;
  completed: boolean;
  baseScore: number;
  finalScore: number;
  scoreMultiplier: number;
}

export interface MemoryPuzzleScoreResult {
  baseScore: number;
  attemptPenalty: number;
  hintPenalty: number;
  skipPenalty: number;
  speedBonus: number;
  perfectBonus: number;
  finalScore: number;
  rank: 'S' | 'A' | 'B' | 'C';
  multiplier: number;
}

export interface MemorySortHint {
  level: 1 | 2 | 3;
  message: string;
  correctPositions: number[];
  suggestedSwaps?: { from: number; to: number; fragmentId: string }[];
  firstWrongPosition?: number;
  correctFragmentAtPosition?: { position: number; fragmentId: string };
}

export interface MemorySortSkipResult {
  success: boolean;
  skipCost: number;
  finalScore: number;
  message: string;
}

export interface MemoryPuzzleRecoveryState {
  [puzzleId: string]: MemoryPuzzleState;
}

export interface MemorySortSubmitResult {
  success: boolean;
  correct?: boolean;
  reason?: string;
  reward?: string;
  message?: string;
  progress?: number;
  attempts?: number;
  hint?: MemorySortHint;
  correctPositions?: number[];
  wrongPositions?: number[];
  correctCount?: number;
  totalCount?: number;
  scoreInfo?: MemoryPuzzleScoreResult;
  canGetHint?: boolean;
  hintCost?: number;
  canSkip?: boolean;
  skipCost?: number;
}

export type ExhibitionAtmosphere = 
  | 'serene' 
  | 'mysterious' 
  | 'tense' 
  | 'nostalgic' 
  | 'grand' 
  | 'warm' 
  | 'eerie' 
  | 'hopeful' 
  | 'triumphant' 
  | 'melancholic';

export type PuzzlePhase = 
  | 'exploration' 
  | 'investigation' 
  | 'puzzle_active' 
  | 'puzzle_solved' 
  | 'memory_reconstruction' 
  | 'branch_choice';

export type StoryNodeType = 
  | 'chapter_start' 
  | 'chapter_end' 
  | 'key_moment' 
  | 'memory_complete' 
  | 'ending_reveal' 
  | 'power_outage' 
  | 'power_restored';

export interface AudioLayerConfig {
  bgm?: string;
  ambient?: string[];
  sfx?: string;
  volume?: {
    bgm?: number;
    ambient?: number;
    sfx?: number;
  };
  fadeDuration?: number;
}

export interface SceneAudioConfig {
  atmosphere: ExhibitionAtmosphere;
  audio: AudioLayerConfig;
}

export interface PuzzleAudioConfig {
  phase: PuzzlePhase;
  audio: AudioLayerConfig;
}

export interface StoryAudioConfig {
  nodeType: StoryNodeType;
  audio: AudioLayerConfig;
}

export interface ExhibitionAudioMap {
  [exhibitionId: string]: {
    default: SceneAudioConfig;
    atmospheres?: Partial<Record<ExhibitionAtmosphere, SceneAudioConfig>>;
  };
}

export interface ChapterAudioMap {
  [chapterId: string]: {
    storyNodes: Partial<Record<StoryNodeType, StoryAudioConfig>>;
  };
}

export interface MechanismAudioMap {
  [mechanismId: string]: {
    phases: Partial<Record<PuzzlePhase, PuzzleAudioConfig>>;
  };
}

export interface SceneAudioState {
  currentExhibition: string;
  currentAtmosphere: ExhibitionAtmosphere;
  currentPuzzlePhase: PuzzlePhase | null;
  currentStoryNode: StoryNodeType | null;
  activeAmbientTracks: string[];
  activeMechanismId: string | null;
}
