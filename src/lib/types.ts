// ==============================================================================
// R.ON DRAMA STUDIO — CORE TYPES (ROUND 2 HOLLYWOOD MASTERCLASS GRADE)
// ==============================================================================

export type AssetLockStatus = 'DRAFT' | 'SELECTED' | 'LOCKED' | 'ARCHIVED';

export type SceneProductionStatus = 
  | 'NOT STARTED'
  | 'SCRIPT READY'
  | 'ASSETS READY'
  | 'SHOT DESIGNED'
  | 'PROMPT READY'
  | 'VIDEO GENERATED'
  | 'COMPLETED';

export type ShotProductionStatus =
  | 'NOT STARTED'
  | 'SHOT DESIGNED'
  | 'PROMPT READY'
  | 'PROMPT LOCKED'
  | 'VIDEO GENERATED'
  | 'VIDEO APPROVED';

export type TakeStatus = 'DRAFT' | 'REVIEW' | 'SELECTED' | 'REJECTED';

export type ShotType =
  | 'Extreme Wide Shot'
  | 'Wide Shot'
  | 'Medium Wide Shot'
  | 'Medium Shot'
  | 'Medium Close Up'
  | 'Close Up'
  | 'Extreme Close Up'
  | 'Over The Shoulder'
  | 'POV'
  | 'Insert'
  | 'Two Shot'
  | 'Tracking Shot'
  | 'Aerial Shot'
  | 'Low Angle'
  | 'High Angle'
  | 'Dutch Angle'
  // Backward compatibility aliases
  | 'Extreme Wide'
  | 'Wide'
  | 'Medium Wide'
  | 'Medium'
  | 'Over Shoulder'
  | 'Tracking'
  | 'Aerial';

export type CameraMovement =
  | 'Static'
  | 'Pan'
  | 'Tilt'
  | 'Dolly In'
  | 'Dolly Out'
  | 'Truck'
  | 'Arc'
  | 'Crane'
  | 'Handheld'
  | 'Steadicam'
  | 'Tracking'
  | 'Push In'
  | 'Pull Back'
  | 'Orbit'
  | 'Whip Pan';

export type LensType =
  | '18mm'
  | '24mm'
  | '28mm'
  | '35mm'
  | '50mm'
  | '85mm'
  | '100mm Macro'
  | '135mm'
  | '200mm'
  | 'Anamorphic';

export type ScreenDirection = 
  | 'Left → Right' 
  | 'Right → Left' 
  | 'Toward Camera' 
  | 'Away From Camera' 
  | 'Static';

export type CameraSide = 'A' | 'B' | 'Neutral';

export type EyeLine = 
  | 'Camera' 
  | 'Screen Left' 
  | 'Screen Right' 
  | 'Up' 
  | 'Down' 
  | 'Character A' 
  | 'Character B' 
  | 'Object';

export type ShotTransition = 
  | 'Cut' 
  | 'Match Cut' 
  | 'Jump Cut' 
  | 'Dissolve' 
  | 'Fade' 
  | 'Whip Transition' 
  | 'Action Match' 
  | 'Graphic Match' 
  | 'L-Cut' 
  | 'J-Cut';

export type ShotPacing = 
  | 'Very Slow' 
  | 'Slow' 
  | 'Normal' 
  | 'Fast' 
  | 'Very Fast' 
  | 'Impact';

export type PropConditionType = 'NEW' | 'DAMAGED' | 'BLOODY' | 'BROKEN' | string;

export interface CharacterState {
  id: string;
  characterId: string;
  name: 'NORMAL' | 'INJURED' | 'BLOODIED' | 'EXHAUSTED' | 'WET' | 'BATTLE DAMAGED' | 'ANGRY' | string;
  description: string;
  faceCondition?: string;
  hairCondition?: string;
  costumeCondition?: string;
  bodyCondition?: string;
  accessories?: string;
  performance?: string;
  referenceImageUrl?: string;
  createdAt?: string;
}

export interface SceneCharacterState {
  id: string;
  sceneId: string;
  characterId: string;
  stateId: string;
  customNotes?: string;
}

export interface ScenePropCondition {
  id: string;
  sceneId: string;
  propId: string;
  condition: PropConditionType;
  notes?: string;
}

export interface SceneScriptVersion {
  id: string;
  sceneId: string;
  versionTag: string; // V1, V2, V3...
  content: string;
  notes?: string;
  createdAt: string;
}

export interface DirectorNotesVersion {
  id: string;
  sceneId: string;
  versionTag: string;
  content: string;
  createdAt: string;
}

export type ReferencePriority = 'PRIMARY' | 'SECONDARY' | 'OPTIONAL';

export interface ShotReferencePackItem {
  id?: string;
  type: 'CHARACTER MASTER' | 'CHARACTER STATE' | 'COSTUME' | 'LOCATION MASTER' | 'PROP MASTER' | 'PREVIOUS SHOT' | 'CURRENT STORYBOARD' | 'NEXT SHOT' | string;
  title: string;
  filename: string;
  imageUrl?: string;
  notes?: string;
  priority?: ReferencePriority;
  usageNote?: string;
  isOutdated?: boolean;
}

export interface ShotReferencePack {
  shotId: string;
  shotNumber: number;
  items: ShotReferencePackItem[];
  totalImages: number;
  generatedAt: string;
  isOutdated?: boolean;
  outdatedReason?: string;
}

export interface ContinuityOverride {
  id: string;
  warningId: string;
  reason: string;
  overriddenBy: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  logline: string;
  genre: string;
  language: string;
  targetEpisodes: number;
  episodeDuration: string;
  aspectRatio: string;
  visualStyle: string;
  era: string;
  location: string;
  tone: string;
  referenceWorks: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryInput {
  id: string;
  projectId: string;
  logline: string;
  screenplay: string;
  treatment: string;
  activeTab: 'LOGLINE' | 'SCREENPLAY' | 'TREATMENT';
  updatedAt: string;
}

export interface ActionBible {
  id: string;
  projectId: string;
  stuntDesignStyle: string;      // 动作流派 (e.g. 87Eleven Gun-Fu, Tactical CQC, Kenjutsu)
  combatPhysics: string;         // 打击感与质量惯性 (Momentum, Impact, Weight)
  weaponDynamics: string;        // 武器交互与弹道轨迹 (Edge parrying, draw mechanics, muzzle flash)
  cameraChoreography: string;    // 摄影机与动作同步调度 (Camera tracking, whip pans on contact)
  impactVelocity: string;        // 发力节奏与打击律动 (Kinetic explosions vs stillness)
  spatialDestruction: string;    // 环境破坏与物理交互 (Debris, glass shatter, chain sway, splashes)
  safetyAndContinuity: string;   // 动作连贯性规范 (Stunt doubles continuity, blood/scuff progression)
  updatedAt: string;
}

export interface ProjectBible {
  id: string;
  projectId: string;
  logline: string;
  genre: string;
  theme: string;
  tone: string;
  world: string;
  era: string;
  location: string;
  visualStyle: string;
  colorLanguage: string;
  cameraLanguage: string;
  lightingLanguage: string;
  editingRhythm: string;
  directorsVision: string;
  
  // Hollywood Masterclass Additions
  lensKitSpecs?: string;         // 镜头光学规格 (e.g. Panavision C-Series Anamorphic T2.0)
  colorGradingLUT?: string;      // 调色与色彩科学 (e.g. Arri LogC3 to Kodak 2383 Print LUT)
  lightingRatios?: string;       // 光比与照明哲学 (e.g. 8:1 Key-to-fill, hard rim, volumetric haze)
  blockingAndStaging?: string;   // 演员走位与场面调度哲学 (Deep staging, triangle blocking)
  soundDesignPhilosophy?: string;// 声音与拟音哲学 (Sub-bass, hyper-tactile metallic foley)
  updatedAt: string;
}

export interface BaseVersion {
  id: string;
  versionTag: string; // V1, V2, V3, etc.
  referenceImageUrl?: string;
  notes?: string;
  status: AssetLockStatus;
  createdAt: string;
}

export interface CharacterVersion extends BaseVersion {
  characterId: string;
}

export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  age: string;
  gender: string;
  personality: string;
  physicalDescription: string;
  hair: string;
  face: string;
  body: string;
  height: string;
  costume: string;
  signatureFeatures: string;
  performanceNotes: string;
  lockedVersionId?: string;
  versions: CharacterVersion[];
  states?: CharacterState[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationVersion extends BaseVersion {
  locationId: string;
}

export type LocationState = 
  | 'Clean' 
  | 'Damaged' 
  | 'Burning' 
  | 'Flooded' 
  | 'Destroyed' 
  | 'Foggy' 
  | 'Crowded' 
  | 'Empty';

export interface LocationStateRecord {
  id: string;
  locationId: string;
  state: LocationState;
  sceneId?: string;
  sceneNumber?: number;
  description?: string;
  createdAt: string;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  description: string;
  architecture: string;
  environment: string;
  time: string;
  weather: string;
  lighting: string;
  colorPalette: string;
  atmosphere: string;
  cameraNotes: string;
  currentState?: LocationState;
  states?: LocationStateRecord[];
  lockedVersionId?: string;
  versions: LocationVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface PropVersion extends BaseVersion {
  propId: string;
}

export interface Prop {
  id: string;
  projectId: string;
  name: string;
  description: string;
  material: string;
  color: string;
  size: string;
  function: string;
  storyImportance: string;
  lockedVersionId?: string;
  versions: PropVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface CostumeVersion extends BaseVersion {
  costumeId: string;
}

export interface Costume {
  id: string;
  projectId: string;
  characterId?: string;
  characterName?: string;
  name: string;
  description: string;
  material: string;
  color: string;
  accessories: string;
  shoes: string;
  condition: string;
  lockedVersionId?: string;
  versions: CostumeVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ShotTake {
  id: string;
  shotId: string;
  takeNumber: number;
  videoUrl: string;
  notes?: string;
  status: TakeStatus;
  createdAt: string;
}

export type PromptStatus = 'CURRENT' | 'STALE' | 'LOCKED' | 'ACTIVE';
export type PromptLengthMode = 'Compact' | 'Standard' | 'Detailed';

export interface ShotPrompt {
  id: string;
  shotId: string;
  versionTag: string; // V1, V2, V3...
  promptUniversal: string;
  promptGoogleFlow: string;
  promptDreamina: string;
  isLocked?: boolean;
  status?: PromptStatus;
  changeReason?: string;
  lengthMode?: PromptLengthMode;
  contextSnapshotId?: string;
  // Backward compatibility alias
  promptText?: string;
  createdAt: string;
}

export interface ShotContract {
  mustKeep: string[];      // Character identity, costume, state, location, prop, screen direction, camera axis, lighting
  mustChange: string[];    // Character movement, prop position, expression, camera position
  mustNotChange: string[]; // Face, hair, costume design, location architecture, prop design
  notes?: string;
}

export interface BlockingCharacter {
  id: string;
  name: string;
  startX: number; // 0 to 100%
  startY: number;
  endX: number;
  endY: number;
  facingDirection: string; // 'Left', 'Right', 'Toward Camera', 'Away'
  color?: string;
}

export interface BlockingCamera {
  x: number; // 0 to 100%
  y: number;
  targetX: number;
  targetY: number;
  movementType: string;
  lensLabel?: string;
}

export interface ShotBlocking {
  id: string;
  shotId: string;
  sceneId: string;
  characters: BlockingCharacter[];
  camera: BlockingCamera;
  notes?: string;
  floorplanType?: 'Warehouse' | 'Corridor' | 'Room' | 'Rooftop' | 'Street' | 'Generic';
}

export interface ShotContextSnapshot {
  id: string;
  shotId: string;
  promptVersionTag: string;
  createdAt: string;
  characterSnapshots: Array<{
    characterId: string;
    characterName: string;
    versionId: string;
    versionTag: string;
    stateId: string;
    stateName: string;
  }>;
  costumeSnapshots: Array<{
    costumeId: string;
    costumeName: string;
    versionId: string;
    condition: string;
  }>;
  propSnapshots: Array<{
    propId: string;
    propName: string;
    versionId: string;
    condition: string;
  }>;
  locationSnapshot: {
    locationId: string;
    locationName: string;
    versionId: string;
    state: LocationState;
  };
  cameraSettings: {
    shotType: string;
    lens: string;
    movement: string;
    screenDirection?: string;
    cameraSide?: string;
    lighting: string;
    atmosphere: string;
  };
  continuityHash: string;
}

export interface Shot {
  id: string;
  sceneId: string;
  shotNumber: number;
  shotType: ShotType;
  framing: string;
  cameraAngle: string;
  lens: string;
  cameraMovement: string;
  cameraSpeed?: string;
  subject: string;
  action: string;
  performance: string;
  blocking?: string;
  blocking2D?: ShotBlocking;
  contract?: ShotContract;
  snapshot?: ShotContextSnapshot;
  isPromptStale?: boolean;
  staleReasons?: string[];
  isReferencePackStale?: boolean;
  environment: string;
  lighting: string;
  atmosphere: string;
  composition: string;
  depth: string;
  visualEffects: string;
  transition: string;
  duration: string;
  dialogue?: string;
  sound?: string;
  directorNotes?: string;
  sortOrder: number;
  productionStatus?: ShotProductionStatus;
  isPromptLocked?: boolean;
  storyboardImageUrl?: string;
  screenDirection?: ScreenDirection;
  cameraSide?: CameraSide;
  eyeLine?: EyeLine;
  transitionIn?: ShotTransition;
  transitionOut?: ShotTransition;
  pacing?: ShotPacing;
  promptAvoid?: string;
  referencePack?: ShotReferencePack;
  prompts?: ShotPrompt[];
  activePromptVersion?: string;
  takes?: ShotTake[];
  selectedTakeId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Beat {
  id: string;
  sceneId: string;
  beatNumber: number;
  description: string;
  characters?: string;
  action?: string;
  emotionalShift?: string;
  sortOrder: number;
}

export interface Scene {
  id: string;
  episodeId: string;
  sceneNumber: number;
  sceneTitle: string;
  intExt: 'INT' | 'EXT';
  locationName: string;
  timeOfDay: string;
  storyDate?: string;
  storyTime?: string;
  characters: string[];
  props: string[];
  costumes: string[];
  storyPurpose: string;
  emotion: string;
  conflict: string;
  duration: string;
  directorNotes: string;
  
  // Script Excerpt & Versions
  scriptExcerpt?: string;
  scriptVersions?: SceneScriptVersion[];
  activeScriptVersionId?: string;
  directorNotesVersions?: DirectorNotesVersion[];
  
  // Character States & Prop Conditions in this Scene
  characterStates?: SceneCharacterState[];
  propConditions?: ScenePropCondition[];
  locationState?: LocationState;

  // Story Events & Checkpoints
  storyCheckpoint?: StoryCheckpoint;
  storyEvents?: StoryEvent[];

  // Visual Moodboard Layout
  moodboardLayout?: Array<{
    id: string;
    assetType: 'Character' | 'Location' | 'Costume' | 'Prop' | 'Lighting' | 'Camera' | 'Color';
    assetId?: string;
    title: string;
    imageUrl?: string;
    size: 'hero' | 'standard' | 'compact';
    sortOrder: number;
    hidden?: boolean;
  }>;
  
  // Director Intention (International Benchmark)
  directorScenePurpose: string;
  directorEmotionalArc: string;
  directorAudienceExperience: string;
  directorPacing: string;
  directorVisualStrategy: string;
  directorPerformanceDirection: string;
  directorCameraStrategy: string;
  directorLightingStrategy: string;
  directorSoundDirection?: string;
  directorTransition: string;
  
  productionStatus: SceneProductionStatus;
  sortOrder: number;
  beats?: Beat[];
  shots?: Shot[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Episode {
  id: string;
  projectId: string;
  episodeNumber: number;
  title: string;
  logline: string;
  synopsis: string;
  runtime: string;
  status: string;
  directorNotes: string;
  sortOrder: number;
  scenes?: Scene[];
  createdAt: string;
  updatedAt: string;
}

export interface ContinuityWarning {
  id: string;
  projectId: string;
  sceneId?: string;
  sceneTitle?: string;
  shotId?: string;
  shotNumber?: number;
  assetType: 'Character' | 'Location' | 'Prop' | 'Costume' | 'Timeline' | 'State' | 'Axis';
  assetId: string;
  assetName: string;
  conflictType: string;
  lockedValue: string;
  currentValue: string;
  description: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  category?: 'Character' | 'Costume' | 'Location' | 'Prop' | 'Timeline' | 'State' | 'Axis' | 'Lighting';
  overrideReason?: string;
  overriddenAt?: string;
  status: 'ACTIVE' | 'OVERRIDDEN' | 'RESOLVED';
  createdAt: string;
}

export interface ProductionSummary {
  totalEpisodes: number;
  inProductionEpisodes: number;
  totalScenes: number;
  nextSceneDisplay: string;
  continuityWarningsCount: number;
  promptsReadyCount: number;
  videosCompletedCount: number;
  preProductionPercentage: number;
}

export interface AuditLogItem {
  id: string;
  projectId: string;
  entityType: 'Asset' | 'Shot' | 'Scene' | 'Prompt' | 'Take';
  entityId: string;
  entityName: string;
  action: 'Created' | 'Edited' | 'Locked' | 'Unlocked' | 'Prompt Generated' | 'Prompt Updated' | 'Video Uploaded' | 'Take Selected';
  details?: string;
  timestamp: string;
}

// ==============================================================================
// STANDARD AI STORY BREAKDOWN SCHEMA (Zero API Contract)
// ==============================================================================

export interface StoryBreakdownScene {
  scene_number: number;
  title: string;
  int_ext: 'INT' | 'EXT';
  location: string;
  time: string;
  duration: number;
  story_purpose: string;
  emotion: string;
  conflict: string;
  director_intention: string;
  characters: string[];
  props: string[];
  costumes: string[];
  beats?: Array<{
    beat_number?: number;
    description: string;
    action?: string;
    emotional_shift?: string;
  }>;
  shot_suggestions?: Array<{
    shot_number?: number;
    shot_type?: string;
    action?: string;
    camera?: string;
    duration?: number;
  }>;
}

export interface StoryBreakdownEpisode {
  episode_number: number;
  title: string;
  logline: string;
  synopsis: string;
  estimated_duration: number;
  scenes: StoryBreakdownScene[];
}

export interface StoryBreakdownSchema {
  project: {
    title: string;
    logline: string;
    genre: string;
    tone: string;
  };
  episodes: StoryBreakdownEpisode[];
}

// ==============================================================================
// ROUND 4 — PRODUCTION INTELLIGENCE TYPES
// ==============================================================================

export type StudioMode = 'NORMAL' | 'DIRECTOR';

export type TransitionCause = 
  | 'Fight' 
  | 'Explosion' 
  | 'Falling' 
  | 'Water' 
  | 'Costume Change' 
  | 'Time Jump' 
  | 'Recovery' 
  | 'Director Override';

export interface StoryEvent {
  id: string;
  projectId: string;
  sceneId: string;
  sceneNumber: number;
  beatId?: string;
  name: string;
  description: string;
  charactersAffected: string[];
  propsAffected: string[];
  locationAffected?: string;
  costumeAffected?: string[];
  stateChanges: Array<{
    targetType: 'Character' | 'Prop' | 'Location' | 'Costume';
    targetId: string;
    targetName: string;
    fromState: string;
    toState: string;
    cause: TransitionCause;
  }>;
  isApproved: boolean;
  createdAt: string;
}

export interface StoryCheckpoint {
  id: string;
  sceneId: string;
  sceneNumber: number;
  characterStates: Array<{ characterId: string; characterName: string; state: string }>;
  costumeStates: Array<{ costumeId: string; costumeName: string; condition: string }>;
  propConditions: Array<{ propId: string; propName: string; condition: string }>;
  locationState: { locationId?: string; locationName: string; state: LocationState };
  timelineDate: string;
  timelineTime: string;
  importantEvents: string[];
  openConflicts: string[];
  nextObjective: string;
  createdAt: string;
}

export interface InheritedSceneContext {
  previousSceneId?: string;
  previousSceneNumber?: number;
  inheritedCharacterStates: Array<{ characterId: string; characterName: string; state: string }>;
  inheritedCostumeConditions: Array<{ costumeId: string; costumeName: string; condition: string }>;
  inheritedPropConditions: Array<{ propId: string; propName: string; condition: string }>;
  inheritedLocationState?: { locationName: string; state: LocationState };
  inheritedTime?: string;
  openConflicts: string[];
  nextObjective: string;
  whatChanged: string[];
}

export interface ChangeImpactLog {
  id: string;
  projectId: string;
  assetType: 'Character' | 'Location' | 'Prop' | 'Costume';
  assetId: string;
  assetName: string;
  oldVersionTag: string;
  newVersionTag: string;
  affectedScenesCount: number;
  affectedShotsCount: number;
  affectedReferencePacksCount: number;
  affectedPromptsCount: number;
  affectedShotIds: string[];
  timestamp: string;
  directorApproved: boolean;
  policy?: 'KEEP_HISTORICAL_SNAPSHOTS' | 'MARK_ALL_DOWNSTREAM_STALE';
  changeReason?: string;
  details?: string;
}

export interface ContinuityMatrixItem {
  assetId: string;
  assetName: string;
  assetType: 'Character' | 'Costume' | 'Prop' | 'Location' | 'State' | 'Axis';
  sceneStatuses: Array<{
    sceneId: string;
    sceneNumber: number;
    status: 'PASS' | 'WARNING' | 'CRITICAL' | 'NOT_PRESENT';
    stateLabel?: string;
    warningId?: string;
    conflictDescription?: string;
  }>;
}

export interface ProductionHealthScore {
  storyContinuity: number;   // e.g. 96%
  visualContinuity: number;  // e.g. 91%
  shotContinuity: number;    // e.g. 87%
  assetReadiness: number;    // e.g. 100%
  promptReadiness: number;   // e.g. 74%
  videoReadiness: number;    // e.g. 38%
  overallScore: number;      // e.g. 81%
  totalChecks: number;
  passedChecks: number;
}

// --- Production Context Engine Types ---

export interface CharacterContext {
  characterId: string;
  characterName: string;
  masterVersionId?: string;
  masterVersionTag?: string;
  masterImageUrl?: string;
  currentState: string;
  previousState?: string;
  expectedNextState?: string;
  transitionCause?: TransitionCause;
  hair: string;
  costume: string;
}

export interface LocationContext {
  locationId?: string;
  locationName: string;
  masterVersionId?: string;
  masterVersionTag?: string;
  masterImageUrl?: string;
  currentState: LocationState;
  previousState?: LocationState;
  expectedNextState?: LocationState;
  architecture: string;
  environment: string;
  lighting: string;
}

export interface PropContext {
  propId: string;
  propName: string;
  masterVersionId?: string;
  masterVersionTag?: string;
  masterImageUrl?: string;
  currentCondition: string;
  previousCondition?: string;
  expectedNextCondition?: string;
}

export interface CostumeContext {
  costumeId: string;
  costumeName: string;
  masterVersionId?: string;
  masterVersionTag?: string;
  currentCondition: string;
}

export interface SceneContext {
  sceneId: string;
  sceneNumber: number;
  sceneTitle: string;
  intExt: 'INT' | 'EXT';
  timeOfDay: string;
  storyDate?: string;
  storyTime?: string;
  storyPurpose: string;
  locationState?: LocationState;
  previousSceneSummary?: {
    sceneNumber: number;
    sceneTitle: string;
    endingLocationState?: LocationState;
    endingCharacterStates?: Array<{ characterName: string; state: string }>;
  };
  nextSceneSummary?: {
    sceneNumber: number;
    sceneTitle: string;
  };
}

export interface ShotContext {
  shotId: string;
  shotNumber: number;
  shotType: ShotType;
  lens: string;
  cameraMovement: string;
  cameraSide?: CameraSide;
  screenDirection?: ScreenDirection;
  eyeLine?: EyeLine;
  subject: string;
  action: string;
  performance: string;
  lighting: string;
  atmosphere: string;
  composition: string;
  duration: string;
  previousShotSummary?: {
    shotNumber: number;
    screenDirection?: ScreenDirection;
    cameraSide?: CameraSide;
    subject: string;
    action: string;
  };
  nextShotSummary?: {
    shotNumber: number;
    expectedAction?: string;
  };
  contract?: ShotContract;
  blocking2D?: ShotBlocking;
}

export interface ProductionContext {
  projectDna: {
    projectId: string;
    name: string;
    genre: string;
    aspectRatio: string;
    colorPalette: string;
    lightingPhilosophy: string;
    lensPackage: string;
    filmGrain: string;
  };
  episodeContext: {
    episodeId: string;
    episodeNumber: number;
    title: string;
  };
  sceneContext: SceneContext;
  characters: CharacterContext[];
  location: LocationContext;
  props: PropContext[];
  costumes: CostumeContext[];
  shotContext: ShotContext;
  directorIntention: {
    visualStrategy: string;
    emotionalArc: string;
    pacing: string;
    lightingStrategy: string;
    cameraStrategy: string;
    transition: string;
  };
  storyEventsInScene: StoryEvent[];
  openConflicts: string[];
}
