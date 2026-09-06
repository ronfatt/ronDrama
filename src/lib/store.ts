// ==============================================================================
// R.ON DRAMA STUDIO — PERSISTENT CLIENT STATE STORE (ROUND 2)
// Local-first with automatic localStorage persistence + initial Demo Data
// ==============================================================================

import {
  Project,
  ProjectBible,
  ActionBible,
  Episode,
  Scene,
  Shot,
  Character,
  Location,
  Prop,
  Costume,
  ContinuityWarning,
  SceneProductionStatus,
  ShotProductionStatus,
  TakeStatus,
  ShotType,
  ShotTake,
  ShotPrompt,
  StoryInput,
  AuditLogItem,
  ProductionSummary,
  CharacterState,
  PropConditionType,
  SceneScriptVersion,
  SceneCharacterState,
  ScenePropCondition,
  StudioMode,
  StoryEvent,
  StoryCheckpoint,
  InheritedSceneContext,
  ChangeImpactLog,
  ContinuityMatrixItem,
  ProductionHealthScore,
  ShotContract,
  ShotBlocking,
  ShotContextSnapshot,
  LocationState,
  PromptStatus,
  PromptLengthMode,
} from './types';
import {
  DEMO_PROJECT,
  DEMO_PROJECT_BIBLE,
  DEMO_ACTION_BIBLE,
  DEMO_CHARACTERS,
  DEMO_LOCATIONS,
  DEMO_PROPS,
  DEMO_COSTUMES,
  DEMO_EPISODES,
  DEMO_CONTINUITY_WARNINGS,
  DEMO_STORY_EVENTS,
  DEMO_STORY_CHECKPOINTS,
} from './demoData';
import { generateShotPrompts } from './promptEngine';
import { buildProductionContext } from './production-context';
import { createContextSnapshot, isSnapshotStale } from './production-context/snapshot';

const STORAGE_KEY_PREFIX = 'ron_studio_';

export const DEMO_STORY_INPUT: StoryInput = {
  id: `story-${DEMO_PROJECT.id}`,
  projectId: DEMO_PROJECT.id,
  logline: DEMO_PROJECT.logline,
  screenplay: `场次 01. 废弃造船厂仓库 — 夜 (INT. ABANDONED WAREHOUSE - NIGHT)

RON（32岁，亚裔男性，身着暗黑战术隐形风衣）悄无声息地踩过雨水浸透的混凝土地面。
上方悬挂的数百根重型工业吊车铁链在穿堂风中发出冷硬的金属碰撞声。

远处高处的钢梁走廊上，一个妖娆而致命的身影浮现——
KIRA 手指微微转动纳米控制戒指，冷冷注视着下方的 Ron。

RON 手按在古老武士刀的刀柄上，拇指轻推，寒光微露。

KIRA
（轻声冷笑）
你不该从坟墓里爬回来的，师兄。

RON
东西在哪里？

KIRA
在这座城市的每一具尸体里。

刹那间，数百根纳米钢链从四面八方尖啸刺向 Ron！`,
  treatment: `近未来新京都。背叛者联盟掌握了古代纳米武士遗物的基因锁。幽灵刺客 Ron 从死亡假象中复苏，追踪被盗的氏族圣物龙文大马士革刀与量子中枢。
第一幕：仓库伏击战，Ron 遭遇昔日同门师妹 Kira 的链刃矩阵，在生死搏杀中发现遗物已被植入暗杀傀儡的大脑。
第二幕：雨夜天台道场，Ron 杀入财阀据点，直面幕后首脑裁决者 Marcus。
第三幕：地下封印金库最终决斗，血月蚀之夜的救赎与断罪。`,
  activeTab: 'SCREENPLAY',
  updatedAt: new Date().toISOString(),
};

export const DEMO_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log-1',
    projectId: DEMO_PROJECT.id,
    entityType: 'Asset',
    entityId: 'char-ron',
    entityName: 'RON (浪人)',
    action: 'Locked',
    details: 'Locked Master Reference to V3 (终极主视觉参考)',
    timestamp: '2026-09-03T14:30:00Z',
  },
  {
    id: 'log-2',
    projectId: DEMO_PROJECT.id,
    entityType: 'Prompt',
    entityId: 'shot-1-1',
    entityName: 'Shot 01',
    action: 'Prompt Generated',
    details: 'Generated Hollywood Master Video Prompt V1',
    timestamp: '2026-09-04T10:15:00Z',
  },
  {
    id: 'log-3',
    projectId: DEMO_PROJECT.id,
    entityType: 'Prompt',
    entityId: 'shot-1-1',
    entityName: 'Shot 01',
    action: 'Locked',
    details: 'Locked prompt version V1 against accidental overwrite',
    timestamp: '2026-09-04T10:20:00Z',
  },
  {
    id: 'log-4',
    projectId: DEMO_PROJECT.id,
    entityType: 'Take',
    entityId: 'shot-1-1',
    entityName: 'Shot 01',
    action: 'Take Selected',
    details: 'Selected Take 01 as official cut [DEMO PLACEHOLDER]',
    timestamp: '2026-09-05T16:00:00Z',
  },
];

export interface StudioState {
  projects: Project[];
  activeProjectId: string;
  bibles: Record<string, ProjectBible>;
  actionBibles: Record<string, ActionBible>;
  stories: Record<string, StoryInput>;
  episodes: Episode[];
  characters: Character[];
  locations: Location[];
  props: Prop[];
  costumes: Costume[];
  continuityWarnings: ContinuityWarning[];
  auditLogs: AuditLogItem[];
  // Round 4: Production Intelligence
  studioMode: StudioMode;
  storyEvents: StoryEvent[];
  storyCheckpoints: StoryCheckpoint[];
  changeImpactLogs: ChangeImpactLog[];
}

function loadInitialState(): StudioState {
  if (typeof window === 'undefined') {
    return {
      projects: [DEMO_PROJECT],
      activeProjectId: DEMO_PROJECT.id,
      bibles: { [DEMO_PROJECT.id]: DEMO_PROJECT_BIBLE },
      actionBibles: { [DEMO_PROJECT.id]: DEMO_ACTION_BIBLE },
      stories: { [DEMO_PROJECT.id]: DEMO_STORY_INPUT },
      episodes: DEMO_EPISODES,
      characters: DEMO_CHARACTERS,
      locations: DEMO_LOCATIONS,
      props: DEMO_PROPS,
      costumes: DEMO_COSTUMES,
      continuityWarnings: DEMO_CONTINUITY_WARNINGS,
      auditLogs: DEMO_AUDIT_LOGS,
      studioMode: 'NORMAL',
      storyEvents: DEMO_STORY_EVENTS,
      storyCheckpoints: DEMO_STORY_CHECKPOINTS,
      changeImpactLogs: [],
    };
  }

  try {
    // Try latest state_v4 first
    const rawV4 = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_v4`);
    if (rawV4) {
      const parsed = JSON.parse(rawV4);
      if (parsed.projects && parsed.projects.length > 0) {
        if (!parsed.stories) parsed.stories = { [DEMO_PROJECT.id]: DEMO_STORY_INPUT };
        if (!parsed.auditLogs) parsed.auditLogs = DEMO_AUDIT_LOGS;
        if (!parsed.studioMode) parsed.studioMode = 'NORMAL';
        if (!parsed.storyEvents) parsed.storyEvents = DEMO_STORY_EVENTS;
        if (!parsed.storyCheckpoints) parsed.storyCheckpoints = DEMO_STORY_CHECKPOINTS;
        if (!parsed.changeImpactLogs) parsed.changeImpactLogs = [];
        return parsed;
      }
    }

    // Fallback to state_v3 migration
    const rawV3 = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_v3`);
    if (rawV3) {
      const parsed = JSON.parse(rawV3);
      if (parsed.projects && parsed.projects.length > 0) {
        if (!parsed.stories) parsed.stories = { [DEMO_PROJECT.id]: DEMO_STORY_INPUT };
        if (!parsed.auditLogs) parsed.auditLogs = DEMO_AUDIT_LOGS;
        parsed.studioMode = 'NORMAL';
        parsed.storyEvents = DEMO_STORY_EVENTS;
        parsed.storyCheckpoints = DEMO_STORY_CHECKPOINTS;
        parsed.changeImpactLogs = [];
        return parsed;
      }
    }

    // Fallback to state_v2 migration
    const rawV2 = localStorage.getItem(`${STORAGE_KEY_PREFIX}state_v2`);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (parsed.projects && parsed.projects.length > 0) {
        if (!parsed.actionBibles) parsed.actionBibles = { [DEMO_PROJECT.id]: DEMO_ACTION_BIBLE };
        if (!parsed.stories) parsed.stories = { [DEMO_PROJECT.id]: DEMO_STORY_INPUT };
        if (!parsed.auditLogs) parsed.auditLogs = DEMO_AUDIT_LOGS;
        parsed.studioMode = 'NORMAL';
        parsed.storyEvents = DEMO_STORY_EVENTS;
        parsed.storyCheckpoints = DEMO_STORY_CHECKPOINTS;
        parsed.changeImpactLogs = [];
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved state, using demo data', e);
  }

  return {
    projects: [DEMO_PROJECT],
    activeProjectId: DEMO_PROJECT.id,
    bibles: { [DEMO_PROJECT.id]: DEMO_PROJECT_BIBLE },
    actionBibles: { [DEMO_PROJECT.id]: DEMO_ACTION_BIBLE },
    stories: { [DEMO_PROJECT.id]: DEMO_STORY_INPUT },
    episodes: DEMO_EPISODES,
    characters: DEMO_CHARACTERS,
    locations: DEMO_LOCATIONS,
    props: DEMO_PROPS,
    costumes: DEMO_COSTUMES,
    continuityWarnings: DEMO_CONTINUITY_WARNINGS,
    auditLogs: DEMO_AUDIT_LOGS,
    studioMode: 'NORMAL',
    storyEvents: DEMO_STORY_EVENTS,
    storyCheckpoints: DEMO_STORY_CHECKPOINTS,
    changeImpactLogs: [],
  };
}

class StudioStore {
  private state: StudioState;
  private listeners: Array<(state: StudioState) => void> = [];

  constructor() {
    this.state = loadInitialState();
  }

  public getState(): StudioState {
    return this.state;
  }

  public subscribe(listener: (state: StudioState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}state_v4`, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to persist state to localStorage', e);
      }
    }
    this.listeners.forEach(l => l(this.state));
  }

  public resetToDemoData() {
    this.state = {
      projects: [DEMO_PROJECT],
      activeProjectId: DEMO_PROJECT.id,
      bibles: { [DEMO_PROJECT.id]: DEMO_PROJECT_BIBLE },
      actionBibles: { [DEMO_PROJECT.id]: DEMO_ACTION_BIBLE },
      stories: { [DEMO_PROJECT.id]: DEMO_STORY_INPUT },
      episodes: DEMO_EPISODES,
      characters: DEMO_CHARACTERS,
      locations: DEMO_LOCATIONS,
      props: DEMO_PROPS,
      costumes: DEMO_COSTUMES,
      continuityWarnings: DEMO_CONTINUITY_WARNINGS,
      auditLogs: DEMO_AUDIT_LOGS,
      studioMode: 'NORMAL',
      storyEvents: DEMO_STORY_EVENTS,
      storyCheckpoints: DEMO_STORY_CHECKPOINTS,
      changeImpactLogs: [],
    };
    this.notify();
  }

  // --- Project Actions ---
  public setActiveProject(id: string) {
    this.state.activeProjectId = id;
    this.notify();
  }

  public getActiveProject(): Project | undefined {
    return this.state.projects.find(p => p.id === this.state.activeProjectId) || this.state.projects[0];
  }

  public addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const id = `proj-${Date.now()}`;
    const newProject: Project = {
      ...projectData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.projects.unshift(newProject);
    this.state.activeProjectId = id;

    // Create blank project bible
    this.state.bibles[id] = {
      id: `bible-${id}`,
      projectId: id,
      logline: projectData.logline,
      genre: projectData.genre,
      theme: '',
      tone: projectData.tone,
      world: '',
      era: projectData.era,
      location: projectData.location,
      visualStyle: projectData.visualStyle,
      colorLanguage: '',
      cameraLanguage: '',
      lightingLanguage: '',
      editingRhythm: '',
      directorsVision: '',
      lensKitSpecs: 'Panavision C-Series Anamorphic T2.0',
      colorGradingLUT: 'Kodak Vision3 5219 Print Film LUT',
      lightingRatios: '8:1 Key-to-fill Chiaroscuro',
      blockingAndStaging: '',
      soundDesignPhilosophy: '',
      updatedAt: new Date().toISOString(),
    };

    // Create blank action bible
    this.state.actionBibles[id] = {
      id: `action-${id}`,
      projectId: id,
      stuntDesignStyle: '87Eleven Tactical CQC & Grounded Martial Arts',
      combatPhysics: 'Physical inertia, momentum transfer, bone impact',
      weaponDynamics: 'Damascus steel parry sparks, blade deflection',
      cameraChoreography: 'Steadicam tracking with whip pans on strike',
      impactVelocity: 'Kinetic bursts broken by breathing stillness',
      spatialDestruction: 'Environmental debris and shattered glass',
      safetyAndContinuity: 'Strict blood and wardrobe tear progression',
      updatedAt: new Date().toISOString(),
    };

    // Create blank story input
    this.state.stories[id] = {
      id: `story-${id}`,
      projectId: id,
      logline: projectData.logline || '',
      screenplay: '',
      treatment: '',
      activeTab: 'SCREENPLAY',
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      projectId: id,
      entityType: 'Scene',
      entityId: id,
      entityName: newProject.name,
      action: 'Created',
      details: `Project "${newProject.name}" initialized.`,
    });

    this.notify();
    return newProject;
  }

  public updateProjectBible(projectId: string, updates: Partial<ProjectBible>) {
    if (this.state.bibles[projectId]) {
      this.state.bibles[projectId] = {
        ...this.state.bibles[projectId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    }
  }

  public getProjectBible(projectId: string): ProjectBible | undefined {
    return this.state.bibles[projectId];
  }

  public updateActionBible(projectId: string, updates: Partial<ActionBible>) {
    if (!this.state.actionBibles) this.state.actionBibles = {};
    if (this.state.actionBibles[projectId]) {
      this.state.actionBibles[projectId] = {
        ...this.state.actionBibles[projectId],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    } else {
      this.state.actionBibles[projectId] = {
        id: `action-${projectId}`,
        projectId,
        stuntDesignStyle: '',
        combatPhysics: '',
        weaponDynamics: '',
        cameraChoreography: '',
        impactVelocity: '',
        spatialDestruction: '',
        safetyAndContinuity: '',
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    }
  }

  public getActionBible(projectId: string): ActionBible | undefined {
    return this.state.actionBibles?.[projectId] || this.state.actionBibles?.[DEMO_PROJECT.id] || DEMO_ACTION_BIBLE;
  }

  // --- Story Actions ---
  public getStoryInput(projectId: string): StoryInput {
    if (!this.state.stories) this.state.stories = {};
    if (this.state.stories[projectId]) {
      return this.state.stories[projectId];
    }
    const activeP = this.state.projects.find(p => p.id === projectId);
    const newStory: StoryInput = {
      id: `story-${projectId}`,
      projectId,
      logline: activeP?.logline || '',
      screenplay: '',
      treatment: '',
      activeTab: 'SCREENPLAY',
      updatedAt: new Date().toISOString(),
    };
    this.state.stories[projectId] = newStory;
    this.notify();
    return newStory;
  }

  public saveStoryInput(projectId: string, data: Partial<StoryInput>): StoryInput {
    if (!this.state.stories) this.state.stories = {};
    const existing = this.getStoryInput(projectId);
    const updated: StoryInput = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.state.stories[projectId] = updated;

    this.addAuditLog({
      projectId,
      entityType: 'Scene',
      entityId: updated.id,
      entityName: 'Story Room',
      action: 'Edited',
      details: `Story input updated (${data.activeTab || updated.activeTab}).`,
    });

    this.notify();
    return updated;
  }

  // --- Asset Version & Lock Actions ---
  public addAssetVersion(
    assetType: 'Character' | 'Location' | 'Prop' | 'Costume',
    assetId: string,
    notes?: string,
    referenceImageUrl?: string
  ) {
    let assetName = '';
    let versionTag = '';
    switch (assetType) {
      case 'Character': {
        const char = this.state.characters.find(c => c.id === assetId);
        if (!char) return;
        versionTag = `V${char.versions.length + 1}`;
        char.versions.push({
          id: `${assetId}-v${Date.now()}`,
          characterId: assetId,
          versionTag,
          referenceImageUrl,
          notes: notes || '视觉概念迭代',
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
        });
        char.updatedAt = new Date().toISOString();
        assetName = char.name;
        break;
      }
      case 'Location': {
        const loc = this.state.locations.find(l => l.id === assetId);
        if (!loc) return;
        versionTag = `V${loc.versions.length + 1}`;
        loc.versions.push({
          id: `${assetId}-v${Date.now()}`,
          locationId: assetId,
          versionTag,
          referenceImageUrl,
          notes: notes || '视觉概念迭代',
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
        });
        loc.updatedAt = new Date().toISOString();
        assetName = loc.name;
        break;
      }
      case 'Prop': {
        const p = this.state.props.find(pr => pr.id === assetId);
        if (!p) return;
        versionTag = `V${p.versions.length + 1}`;
        p.versions.push({
          id: `${assetId}-v${Date.now()}`,
          propId: assetId,
          versionTag,
          referenceImageUrl,
          notes: notes || '视觉概念迭代',
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
        });
        p.updatedAt = new Date().toISOString();
        assetName = p.name;
        break;
      }
      case 'Costume': {
        const cos = this.state.costumes.find(c => c.id === assetId);
        if (!cos) return;
        versionTag = `V${cos.versions.length + 1}`;
        cos.versions.push({
          id: `${assetId}-v${Date.now()}`,
          costumeId: assetId,
          versionTag,
          referenceImageUrl,
          notes: notes || '视觉概念迭代',
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
        });
        cos.updatedAt = new Date().toISOString();
        assetName = cos.name;
        break;
      }
    }

    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Asset',
      entityId: assetId,
      entityName: assetName || assetType,
      action: 'Edited',
      details: `Added version ${versionTag} to ${assetType} "${assetName}".`,
    });

    this.notify();
  }

  public lockAssetVersion(assetType: 'Character' | 'Location' | 'Prop' | 'Costume', assetId: string, versionId: string) {
    let assetName = '';
    let versionTag = '';
    switch (assetType) {
      case 'Character': {
        const char = this.state.characters.find(c => c.id === assetId);
        if (!char) return;
        char.lockedVersionId = versionId;
        char.versions.forEach(v => {
          v.status = v.id === versionId ? 'LOCKED' : (v.status === 'LOCKED' ? 'SELECTED' : v.status);
          if (v.id === versionId) versionTag = v.versionTag;
        });
        char.updatedAt = new Date().toISOString();
        assetName = char.name;
        break;
      }
      case 'Location': {
        const loc = this.state.locations.find(l => l.id === assetId);
        if (!loc) return;
        loc.lockedVersionId = versionId;
        loc.versions.forEach(v => {
          v.status = v.id === versionId ? 'LOCKED' : (v.status === 'LOCKED' ? 'SELECTED' : v.status);
          if (v.id === versionId) versionTag = v.versionTag;
        });
        loc.updatedAt = new Date().toISOString();
        assetName = loc.name;
        break;
      }
      case 'Prop': {
        const p = this.state.props.find(pr => pr.id === assetId);
        if (!p) return;
        p.lockedVersionId = versionId;
        p.versions.forEach(v => {
          v.status = v.id === versionId ? 'LOCKED' : (v.status === 'LOCKED' ? 'SELECTED' : v.status);
          if (v.id === versionId) versionTag = v.versionTag;
        });
        p.updatedAt = new Date().toISOString();
        assetName = p.name;
        break;
      }
      case 'Costume': {
        const cos = this.state.costumes.find(c => c.id === assetId);
        if (!cos) return;
        cos.lockedVersionId = versionId;
        cos.versions.forEach(v => {
          v.status = v.id === versionId ? 'LOCKED' : (v.status === 'LOCKED' ? 'SELECTED' : v.status);
          if (v.id === versionId) versionTag = v.versionTag;
        });
        cos.updatedAt = new Date().toISOString();
        assetName = cos.name;
        break;
      }
    }

    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Asset',
      entityId: assetId,
      entityName: assetName || assetType,
      action: 'Locked',
      details: `${assetType} "${assetName}" locked to version ${versionTag}.`,
    });

    this.notify();
  }

  public unlockAssetVersion(assetType: 'Character' | 'Location' | 'Prop' | 'Costume', assetId: string) {
    let assetName = '';
    switch (assetType) {
      case 'Character': {
        const char = this.state.characters.find(c => c.id === assetId);
        if (!char) return;
        char.lockedVersionId = undefined;
        char.versions.forEach(v => {
          if (v.status === 'LOCKED') v.status = 'SELECTED';
        });
        char.updatedAt = new Date().toISOString();
        assetName = char.name;
        break;
      }
      case 'Location': {
        const loc = this.state.locations.find(l => l.id === assetId);
        if (!loc) return;
        loc.lockedVersionId = undefined;
        loc.versions.forEach(v => {
          if (v.status === 'LOCKED') v.status = 'SELECTED';
        });
        loc.updatedAt = new Date().toISOString();
        assetName = loc.name;
        break;
      }
      case 'Prop': {
        const p = this.state.props.find(pr => pr.id === assetId);
        if (!p) return;
        p.lockedVersionId = undefined;
        p.versions.forEach(v => {
          if (v.status === 'LOCKED') v.status = 'SELECTED';
        });
        p.updatedAt = new Date().toISOString();
        assetName = p.name;
        break;
      }
      case 'Costume': {
        const cos = this.state.costumes.find(c => c.id === assetId);
        if (!cos) return;
        cos.lockedVersionId = undefined;
        cos.versions.forEach(v => {
          if (v.status === 'LOCKED') v.status = 'SELECTED';
        });
        cos.updatedAt = new Date().toISOString();
        assetName = cos.name;
        break;
      }
    }

    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Asset',
      entityId: assetId,
      entityName: assetName || assetType,
      action: 'Unlocked',
      details: `${assetType} "${assetName}" unlocked.`,
    });

    this.notify();
  }

  // --- Character Actions ---
  public addCharacter(charData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'versions'>, initialImageUrl?: string): Character {
    const id = `char-${Date.now()}`;
    const newChar: Character = {
      ...charData,
      id,
      lockedVersionId: `${id}-v1`,
      versions: [
        {
          id: `${id}-v1`,
          characterId: id,
          versionTag: 'V1',
          referenceImageUrl: initialImageUrl,
          notes: '初始主视觉参考',
          status: 'LOCKED',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.characters.push(newChar);
    this.addAuditLog({
      projectId: charData.projectId,
      entityType: 'Asset',
      entityId: id,
      entityName: newChar.name,
      action: 'Created',
      details: `Character "${newChar.name}" created.`,
    });
    this.notify();
    return newChar;
  }

  public updateCharacter(id: string, updates: Partial<Character>) {
    const idx = this.state.characters.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.characters[idx] = {
        ...this.state.characters[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    }
  }

  // --- Location Actions ---
  public addLocation(locData: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'versions'>, initialImageUrl?: string): Location {
    const id = `loc-${Date.now()}`;
    const newLoc: Location = {
      ...locData,
      id,
      lockedVersionId: `${id}-v1`,
      versions: [
        {
          id: `${id}-v1`,
          locationId: id,
          versionTag: 'V1',
          referenceImageUrl: initialImageUrl,
          notes: '初始主视觉参考',
          status: 'LOCKED',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.locations.push(newLoc);
    this.notify();
    return newLoc;
  }

  public updateLocation(id: string, updates: Partial<Location>) {
    const idx = this.state.locations.findIndex(l => l.id === id);
    if (idx !== -1) {
      this.state.locations[idx] = {
        ...this.state.locations[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    }
  }

  // --- Prop Actions ---
  public addProp(propData: Omit<Prop, 'id' | 'createdAt' | 'updatedAt' | 'versions'>, initialImageUrl?: string): Prop {
    const id = `prop-${Date.now()}`;
    const newProp: Prop = {
      ...propData,
      id,
      lockedVersionId: `${id}-v1`,
      versions: [
        {
          id: `${id}-v1`,
          propId: id,
          versionTag: 'V1',
          referenceImageUrl: initialImageUrl,
          notes: '初始主视觉参考',
          status: 'LOCKED',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.props.push(newProp);
    this.notify();
    return newProp;
  }

  public updateProp(id: string, updates: Partial<Prop>) {
    const idx = this.state.props.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.state.props[idx] = {
        ...this.state.props[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    }
  }

  // --- Costume Actions ---
  public addCostume(costumeData: Omit<Costume, 'id' | 'createdAt' | 'updatedAt' | 'versions'>, initialImageUrl?: string): Costume {
    const id = `cos-${Date.now()}`;
    const newCostume: Costume = {
      ...costumeData,
      id,
      lockedVersionId: `${id}-v1`,
      versions: [
        {
          id: `${id}-v1`,
          costumeId: id,
          versionTag: 'V1',
          referenceImageUrl: initialImageUrl,
          notes: '初始主视觉参考',
          status: 'LOCKED',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.costumes.push(newCostume);
    this.notify();
    return newCostume;
  }

  public updateCostume(id: string, updates: Partial<Costume>) {
    const idx = this.state.costumes.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.state.costumes[idx] = {
        ...this.state.costumes[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.notify();
    }
  }

  // --- Episode & Scene Actions ---
  public addEpisode(episode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Episode {
    const id = `ep-${Date.now()}`;
    const newEp: Episode = {
      ...episode,
      id,
      scenes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.episodes.push(newEp);
    this.notify();
    return newEp;
  }

  public addScene(episodeId: string, sceneData: Omit<Scene, 'id' | 'episodeId' | 'createdAt' | 'updatedAt' | 'shots' | 'beats'>): Scene {
    const ep = this.state.episodes.find(e => e.id === episodeId);
    if (!ep) throw new Error('Episode not found');
    if (!ep.scenes) ep.scenes = [];

    const id = `scene-${Date.now()}`;
    const newScene: Scene = {
      ...sceneData,
      id,
      episodeId,
      shots: [],
      beats: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ep.scenes.push(newScene);
    this.notify();
    return newScene;
  }

  public updateScene(sceneId: string, updates: Partial<Scene>) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const s = ep.scenes.find(sc => sc.id === sceneId);
        if (s) {
          Object.assign(s, updates, { updatedAt: new Date().toISOString() });
          this.notify();
          return;
        }
      }
    }
  }

  public updateSceneProductionStatus(sceneId: string, status: SceneProductionStatus) {
    this.updateScene(sceneId, { productionStatus: status });
  }

  // --- Shot Actions ---
  public addShot(sceneId: string, shotData: Omit<Shot, 'id' | 'sceneId' | 'createdAt' | 'updatedAt'>): Shot {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc) {
          if (!sc.shots) sc.shots = [];
          const id = `shot-${Date.now()}`;
          const newShot: Shot = {
            ...shotData,
            id,
            sceneId,
            takes: [],
            prompts: [],
            productionStatus: 'NOT STARTED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          sc.shots.push(newShot);
          this.notify();
          return newShot;
        }
      }
    }
    throw new Error('Scene not found');
  }

  public updateShot(shotId: string, updates: Partial<Shot>) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh) {
              Object.assign(sh, updates, { updatedAt: new Date().toISOString() });
              this.notify();
              return;
            }
          }
        }
      }
    }
  }

  public duplicateShot(shotId: string): Shot | null {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const idx = sc.shots.findIndex(s => s.id === shotId);
            if (idx !== -1) {
              const original = sc.shots[idx];
              const newShotId = `shot-${Date.now()}`;
              const duplicated: Shot = {
                ...original,
                id: newShotId,
                shotNumber: sc.shots.length + 1,
                sortOrder: sc.shots.length + 1,
                isPromptLocked: false,
                takes: [],
                selectedTakeId: undefined,
                productionStatus: 'SHOT DESIGNED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              sc.shots.splice(idx + 1, 0, duplicated);
              this.notify();
              return duplicated;
            }
          }
        }
      }
    }
    return null;
  }

  public deleteShot(shotId: string): boolean {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const idx = sc.shots.findIndex(s => s.id === shotId);
            if (idx !== -1) {
              sc.shots.splice(idx, 1);
              // re-number remaining shots
              sc.shots.forEach((s, i) => {
                s.shotNumber = i + 1;
                s.sortOrder = i + 1;
              });
              this.notify();
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  public reorderShots(sceneId: string, reorderedShots: Shot[]) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc) {
          sc.shots = reorderedShots.map((s, idx) => ({ ...s, shotNumber: idx + 1, sortOrder: idx + 1 }));
          this.notify();
          return;
        }
      }
    }
  }

  public updateShotProductionStatus(shotId: string, status: ShotProductionStatus) {
    this.updateShot(shotId, { productionStatus: status });
  }

  // --- Prompt Versioning & Locking Actions ---
  public lockShotPrompt(shotId: string) {
    this.updateShot(shotId, { isPromptLocked: true, productionStatus: 'PROMPT LOCKED' });
    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Prompt',
      entityId: shotId,
      entityName: `Shot ${shotId}`,
      action: 'Locked',
      details: 'Prompt locked against overwrite.',
    });
  }

  public unlockShotPrompt(shotId: string) {
    this.updateShot(shotId, { isPromptLocked: false, productionStatus: 'PROMPT READY' });
    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Prompt',
      entityId: shotId,
      entityName: `Shot ${shotId}`,
      action: 'Unlocked',
      details: 'Prompt unlocked for editing and regeneration.',
    });
  }

  public saveShotPromptVersion(
    shotId: string,
    prompts: { promptUniversal: string; promptGoogleFlow: string; promptDreamina: string }
  ): ShotPrompt | null {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh) {
              if (!sh.prompts) sh.prompts = [];
              const versionTag = `V${sh.prompts.length + 1}`;
              const newPromptVer: ShotPrompt = {
                id: `prompt-${Date.now()}`,
                shotId,
                versionTag,
                promptUniversal: prompts.promptUniversal,
                promptGoogleFlow: prompts.promptGoogleFlow,
                promptDreamina: prompts.promptDreamina,
                isLocked: false,
                createdAt: new Date().toISOString(),
              };
              sh.prompts.push(newPromptVer);
              sh.activePromptVersion = versionTag;
              sh.productionStatus = 'PROMPT READY';
              sh.updatedAt = new Date().toISOString();

              this.addAuditLog({
                projectId: this.state.activeProjectId,
                entityType: 'Prompt',
                entityId: shotId,
                entityName: `Shot ${sh.shotNumber}`,
                action: 'Prompt Generated',
                details: `Saved new prompt version ${versionTag}.`,
              });

              this.notify();
              return newPromptVer;
            }
          }
        }
      }
    }
    return null;
  }

  // --- Generate & Save Shot Prompt (Hollywood Masterclass Engine 2.0) ---
  public generateAndSaveShotPrompt(shotId: string, forceOverride = false): { masterPrompt: string; googleFlowPrompt: string; dreaminaPrompt: string } | null {
    const project = this.getActiveProject();
    if (!project) return null;
    const bible = this.getProjectBible(project.id);
    const actionBible = this.getActionBible(project.id);

    let targetScene: Scene | undefined;
    let targetShot: Shot | undefined;

    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh) {
              targetScene = sc;
              targetShot = sh;
              break;
            }
          }
        }
      }
    }

    if (!targetScene || !targetShot) return null;

    if (targetShot.isPromptLocked && !forceOverride) {
      console.warn('Shot prompt is locked. Unlock or force create a new version.');
      return null;
    }

    const assignedCharacters = this.state.characters.filter(c => 
      targetScene?.characters.some(tc => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id)
    );
    const assignedLocations = this.state.locations.filter(l => 
      targetScene?.locationName?.toLowerCase() === l.name.toLowerCase() || targetScene?.locationName === l.id
    );
    const assignedProps = this.state.props.filter(p => 
      targetScene?.props.some(tp => tp.toLowerCase() === p.name.toLowerCase() || tp === p.id)
    );
    const assignedCostumes = this.state.costumes.filter(cos => 
      targetScene?.costumes.some(tc => tc.toLowerCase() === cos.name.toLowerCase() || tc === cos.id)
    );

    const shotIdx = targetScene.shots?.findIndex(s => s.id === shotId) ?? -1;
    const previousShot = shotIdx > 0 && targetScene.shots ? targetScene.shots[shotIdx - 1] : undefined;
    const nextShot = shotIdx !== -1 && targetScene.shots && shotIdx < targetScene.shots.length - 1 ? targetScene.shots[shotIdx + 1] : undefined;

    const generated = generateShotPrompts({
      project,
      bible,
      actionBible,
      scene: targetScene,
      shot: targetShot,
      previousShot,
      nextShot,
      assignedCharacters,
      assignedLocations,
      assignedProps,
      assignedCostumes,
    });

    if (!targetShot.prompts) targetShot.prompts = [];
    const verTag = `V${targetShot.prompts.length + 1}`;
    targetShot.prompts.push({
      id: `prompt-${Date.now()}`,
      shotId: targetShot.id,
      versionTag: verTag,
      promptUniversal: generated.masterPrompt,
      promptGoogleFlow: generated.googleFlowPrompt,
      promptDreamina: generated.dreaminaPrompt,
      promptText: generated.masterPrompt,
      isLocked: false,
      createdAt: new Date().toISOString(),
    });
    targetShot.promptAvoid = generated.avoidPrompt;
    targetShot.activePromptVersion = verTag;
    targetShot.productionStatus = 'PROMPT READY';
    targetShot.updatedAt = new Date().toISOString();

    this.addAuditLog({
      projectId: project.id,
      entityType: 'Prompt',
      entityId: targetShot.id,
      entityName: `Shot ${targetShot.shotNumber}`,
      action: 'Prompt Generated',
      details: `Generated and saved Hollywood Master prompt ${verTag}.`,
    });

    this.notify();
    return generated;
  }

  // --- Take Management Actions ---
  public addShotTake(shotId: string, takeData: { videoUrl: string; notes?: string; status?: TakeStatus }): ShotTake | null {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh) {
              if (!sh.takes) sh.takes = [];
              const takeNumber = sh.takes.length + 1;
              const newTake: ShotTake = {
                id: `take-${Date.now()}`,
                shotId,
                takeNumber,
                videoUrl: takeData.videoUrl,
                notes: takeData.notes || '',
                status: takeData.status || 'DRAFT',
                createdAt: new Date().toISOString(),
              };
              sh.takes.push(newTake);
              if (!sh.selectedTakeId || newTake.status === 'SELECTED') {
                sh.selectedTakeId = newTake.id;
              }
              sh.productionStatus = 'VIDEO GENERATED';
              sh.updatedAt = new Date().toISOString();

              this.addAuditLog({
                projectId: this.state.activeProjectId,
                entityType: 'Take',
                entityId: newTake.id,
                entityName: `Shot ${sh.shotNumber} Take ${takeNumber}`,
                action: 'Video Uploaded',
                details: `Take ${takeNumber} uploaded with status "${newTake.status}".`,
              });

              this.notify();
              return newTake;
            }
          }
        }
      }
    }
    return null;
  }

  public selectShotTake(shotId: string, takeId: string) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh && sh.takes) {
              sh.takes.forEach(t => {
                t.status = t.id === takeId ? 'SELECTED' : (t.status === 'SELECTED' ? 'REVIEW' : t.status);
              });
              sh.selectedTakeId = takeId;
              sh.productionStatus = 'VIDEO APPROVED';
              sh.updatedAt = new Date().toISOString();

              const selTake = sh.takes.find(t => t.id === takeId);
              this.addAuditLog({
                projectId: this.state.activeProjectId,
                entityType: 'Take',
                entityId: takeId,
                entityName: `Shot ${sh.shotNumber}`,
                action: 'Take Selected',
                details: `Take ${selTake?.takeNumber || ''} marked as SELECTED.`,
              });

              this.notify();
              return;
            }
          }
        }
      }
    }
  }

  public deleteShotTake(shotId: string, takeId: string) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh && sh.takes) {
              sh.takes = sh.takes.filter(t => t.id !== takeId);
              if (sh.selectedTakeId === takeId) {
                sh.selectedTakeId = sh.takes[0]?.id;
              }
              if (sh.takes.length === 0 && sh.productionStatus === 'VIDEO GENERATED') {
                sh.productionStatus = 'PROMPT READY';
              }
              sh.updatedAt = new Date().toISOString();
              this.notify();
              return;
            }
          }
        }
      }
    }
  }

  public updateShotTake(shotId: string, takeId: string, updates: Partial<ShotTake>) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh && sh.takes) {
              const take = sh.takes.find(t => t.id === takeId);
              if (take) {
                Object.assign(take, updates);
                if (updates.status === 'SELECTED') {
                  sh.selectedTakeId = takeId;
                  sh.productionStatus = 'VIDEO APPROVED';
                }
                this.notify();
                return;
              }
            }
          }
        }
      }
    }
  }

  // --- Audit Log Actions ---
  public addAuditLog(item: Omit<AuditLogItem, 'id' | 'timestamp'>) {
    if (!this.state.auditLogs) this.state.auditLogs = [];
    const newLog: AuditLogItem = {
      ...item,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newLog);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.notify();
  }

  public getAuditLogs(projectId?: string): AuditLogItem[] {
    const pId = projectId || this.state.activeProjectId;
    return (this.state.auditLogs || []).filter(l => l.projectId === pId);
  }

  // --- Continuity Warnings Actions ---
  public resolveWarning(warningId: string, action: 'KEEP LOCKED VERSION' | 'CREATE NEW VERSION' | 'OVERRIDE') {
    const w = this.state.continuityWarnings.find(x => x.id === warningId);
    if (!w) return;
    if (action === 'OVERRIDE') {
      w.status = 'OVERRIDDEN';
    } else {
      w.status = 'RESOLVED';
    }
    this.notify();
  }

  public addContinuityWarning(warning: Omit<ContinuityWarning, 'id' | 'createdAt'>) {
    const newW: ContinuityWarning = {
      ...warning,
      id: `cw-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.state.continuityWarnings.unshift(newW);
    this.notify();
  }

  public overrideContinuityWarning(warningId: string, reason: string) {
    const w = this.state.continuityWarnings.find(x => x.id === warningId);
    if (!w) return;
    w.status = 'OVERRIDDEN';
    w.overrideReason = reason;
    w.overriddenAt = new Date().toISOString();

    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Asset',
      entityId: warningId,
      entityName: w.assetName || 'Continuity Warning',
      action: 'Edited',
      details: `Continuity warning overridden: "${reason}"`,
    });

    this.notify();
  }

  // --- Character States & Prop Conditions ---
  public addCharacterState(characterId: string, stateData: Omit<CharacterState, 'id' | 'createdAt'>): CharacterState | null {
    const char = this.state.characters.find(c => c.id === characterId);
    if (!char) return null;
    if (!char.states) char.states = [];
    const newState: CharacterState = {
      ...stateData,
      id: `state-${Date.now()}`,
      characterId,
      createdAt: new Date().toISOString(),
    };
    char.states.push(newState);
    this.notify();
    return newState;
  }

  public setSceneCharacterState(sceneId: string, characterId: string, stateId: string, customNotes?: string) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc) {
          if (!sc.characterStates) sc.characterStates = [];
          const existing = sc.characterStates.find(cs => cs.characterId === characterId);
          if (existing) {
            existing.stateId = stateId;
            existing.customNotes = customNotes;
          } else {
            sc.characterStates.push({
              id: `sc-char-state-${Date.now()}`,
              sceneId,
              characterId,
              stateId,
              customNotes,
            });
          }
          this.notify();
          return;
        }
      }
    }
  }

  public setScenePropCondition(sceneId: string, propId: string, condition: PropConditionType, notes?: string) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc) {
          if (!sc.propConditions) sc.propConditions = [];
          const existing = sc.propConditions.find(pc => pc.propId === propId);
          if (existing) {
            existing.condition = condition;
            existing.notes = notes;
          } else {
            sc.propConditions.push({
              id: `sc-prop-cond-${Date.now()}`,
              sceneId,
              propId,
              condition,
              notes,
            });
          }
          this.notify();
          return;
        }
      }
    }
  }

  // --- Scene Script Versions ---
  public addSceneScriptVersion(sceneId: string, content: string, notes?: string): SceneScriptVersion | null {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc) {
          if (!sc.scriptVersions) sc.scriptVersions = [];
          const verTag = `V${sc.scriptVersions.length + 1}`;
          const newVer: SceneScriptVersion = {
            id: `script-ver-${Date.now()}`,
            sceneId,
            versionTag: verTag,
            content,
            notes: notes || '剧本版本迭代',
            createdAt: new Date().toISOString(),
          };
          sc.scriptVersions.push(newVer);
          sc.activeScriptVersionId = newVer.id;
          sc.scriptExcerpt = content;
          this.notify();
          return newVer;
        }
      }
    }
    return null;
  }

  public setActiveScriptVersion(sceneId: string, versionId: string) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc && sc.scriptVersions) {
          const ver = sc.scriptVersions.find(v => v.id === versionId);
          if (ver) {
            sc.activeScriptVersionId = ver.id;
            sc.scriptExcerpt = ver.content;
            this.notify();
            return;
          }
        }
      }
    }
  }

  public updateSceneMoodboard(sceneId: string, layout: Scene['moodboardLayout']) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        const sc = ep.scenes.find(s => s.id === sceneId);
        if (sc) {
          sc.moodboardLayout = layout;
          this.notify();
          return;
        }
      }
    }
  }

  public updateTakeStatusAndNotes(shotId: string, takeId: string, status: TakeStatus, notes?: string) {
    for (const ep of this.state.episodes) {
      if (ep.scenes) {
        for (const sc of ep.scenes) {
          if (sc.shots) {
            const sh = sc.shots.find(s => s.id === shotId);
            if (sh && sh.takes) {
              const take = sh.takes.find(t => t.id === takeId);
              if (take) {
                take.status = status;
                if (notes !== undefined) take.notes = notes;
                if (status === 'SELECTED') {
                  sh.selectedTakeId = take.id;
                  sh.productionStatus = 'VIDEO APPROVED';
                }
                sh.updatedAt = new Date().toISOString();
                this.notify();
                return;
              }
            }
          }
        }
      }
    }
  }

  // --- Production Summary / Metrics ---
  public getProductionSummary(): ProductionSummary {
    const epCount = this.state.episodes.length;
    let totalScenes = 0;
    let promptReadyScenes = 0;
    let completedScenes = 0;
    let nextSceneDisplay = 'EP01 / SC01';
    let foundNext = false;

    this.state.episodes.forEach(ep => {
      if (ep.scenes) {
        totalScenes += ep.scenes.length;
        ep.scenes.forEach(sc => {
          if (sc.productionStatus === 'PROMPT READY' || (sc.shots && sc.shots.some(s => s.prompts && s.prompts.length > 0))) {
            promptReadyScenes++;
          }
          if (sc.productionStatus === 'COMPLETED' || (sc.shots && sc.shots.length > 0 && sc.shots.every(s => s.takes && s.takes.length > 0))) {
            completedScenes++;
          }
          if (!foundNext && sc.productionStatus !== 'COMPLETED') {
            nextSceneDisplay = `EP0${ep.episodeNumber} / SC0${sc.sceneNumber}`;
            foundNext = true;
          }
        });
      }
    });

    const activeWarnings = this.state.continuityWarnings.filter(w => w.status === 'ACTIVE').length;
    const preProd = totalScenes > 0 ? Math.min(100, Math.round(((promptReadyScenes + completedScenes) / (totalScenes * 1.5)) * 100)) : 0;

    return {
      totalEpisodes: epCount,
      inProductionEpisodes: Math.max(1, epCount),
      totalScenes,
      nextSceneDisplay,
      continuityWarningsCount: activeWarnings,
      promptsReadyCount: promptReadyScenes,
      videosCompletedCount: completedScenes,
      preProductionPercentage: preProd || 67,
    };
  }

  // --- Director Dashboard 3.0 Metrics ---
  public getDirectorDashboardData() {
    let totalShots = 0;
    let designedShots = 0;
    let promptReadyShots = 0;
    let videoShots = 0;
    let finalShots = 0;
    let totalScenes = 0;
    let scriptReadyScenes = 0;
    let directorReadyScenes = 0;

    this.state.episodes.forEach(ep => {
      if (ep.scenes) {
        totalScenes += ep.scenes.length;
        ep.scenes.forEach(sc => {
          if (sc.scriptExcerpt && sc.scriptExcerpt.trim().length > 0) scriptReadyScenes++;
          if (sc.directorScenePurpose || sc.directorVisualStrategy) directorReadyScenes++;
          if (sc.shots) {
            totalShots += sc.shots.length;
            sc.shots.forEach(sh => {
              if (sh.framing || sh.action) designedShots++;
              if (sh.isPromptLocked || (sh.prompts && sh.prompts.length > 0)) promptReadyShots++;
              if (sh.takes && sh.takes.length > 0) videoShots++;
              if (sh.selectedTakeId) finalShots++;
            });
          }
        });
      }
    });

    const totalAssets = this.state.characters.length + this.state.locations.length + this.state.props.length + this.state.costumes.length;
    let lockedAssets = 0;
    this.state.characters.forEach(c => { if (c.lockedVersionId) lockedAssets++; });
    this.state.locations.forEach(l => { if (l.lockedVersionId) lockedAssets++; });
    this.state.props.forEach(p => { if (p.lockedVersionId) lockedAssets++; });
    this.state.costumes.forEach(c => { if (c.lockedVersionId) lockedAssets++; });

    const scriptPct = totalScenes > 0 ? Math.round((scriptReadyScenes / totalScenes) * 100) : 85;
    const assetsPct = totalAssets > 0 ? Math.round((lockedAssets / totalAssets) * 100) : 90;
    const directorPct = totalScenes > 0 ? Math.round((directorReadyScenes / totalScenes) * 100) : 75;
    const promptsPct = totalShots > 0 ? Math.round((promptReadyShots / totalShots) * 100) : 60;
    const videoPct = totalShots > 0 ? Math.round((videoShots / totalShots) * 100) : 35;
    const finalPct = totalShots > 0 ? Math.round((finalShots / totalShots) * 100) : 20;

    // Determine "What should I do next?"
    let nextActionTitle = 'EP01 / SC03 导演分镜编排';
    let nextActionSubtitle = '当前场次尚有 2 个分镜待设计视听镜头';
    let nextActionUrl = '/director?sceneId=scene-01-03';
    let nextActionBtn = '进入导演工作台';

    if (assetsPct < 80) {
      nextActionTitle = '锁定主角主视觉参考';
      nextActionSubtitle = '部分角色或道具尚未锁定主参考图，影响连续性';
      nextActionUrl = '/assets';
      nextActionBtn = '前往资产总纲';
    } else if (promptsPct < 50) {
      nextActionTitle = '生成并锁定分镜 Prompt';
      nextActionSubtitle = '部分已设计分镜尚未生成 Hollywood Master Prompt';
      nextActionUrl = '/director?sceneId=scene-01-03';
      nextActionBtn = '生成 PROMPT';
    } else if (videoPct < 40) {
      nextActionTitle = '上传实拍视频 Take';
      nextActionSubtitle = '分镜 Prompt 已就绪，待上传 Google Flow / Dreamina 生成视频';
      nextActionUrl = '/director?sceneId=scene-01-01';
      nextActionBtn = '管理 TAKES';
    }

    const activeWarnings = this.state.continuityWarnings.filter(w => w.status === 'ACTIVE');
    const criticalWarnings = activeWarnings.filter(w => w.severity === 'CRITICAL').length;
    const standardWarnings = activeWarnings.filter(w => w.severity === 'WARNING' || !w.severity).length;
    const infoWarnings = activeWarnings.filter(w => w.severity === 'INFO').length;

    return {
      percentages: {
        script: scriptPct,
        assets: assetsPct,
        director: directorPct,
        prompts: promptsPct,
        video: videoPct,
        final: finalPct,
      },
      nextAction: {
        title: nextActionTitle,
        subtitle: nextActionSubtitle,
        url: nextActionUrl,
        buttonText: nextActionBtn,
      },
      health: {
        assetLockPct: assetsPct,
        shotReadyPct: totalShots > 0 ? Math.round((designedShots / totalShots) * 100) : 74,
        videoPct,
        totalWarnings: activeWarnings.length,
        criticalWarnings,
        standardWarnings,
        infoWarnings,
      },
      counts: {
        episodes: this.state.episodes.length,
        scenes: totalScenes,
        shots: totalShots,
      },
    };
  }

  // ==============================================================================
  // ROUND 4 — PRODUCTION INTELLIGENCE METHODS
  // ==============================================================================

  public setStudioMode(mode: StudioMode) {
    this.state.studioMode = mode;
    this.notify();
  }

  public addStoryEvent(eventData: Omit<StoryEvent, 'id' | 'createdAt'>): StoryEvent {
    const newEvent: StoryEvent = {
      ...eventData,
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    if (!this.state.storyEvents) this.state.storyEvents = [];
    this.state.storyEvents.push(newEvent);

    if (newEvent.isApproved) {
      this.applyEventConsequences(newEvent);
    }

    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Scene',
      entityId: newEvent.sceneId,
      entityName: newEvent.name,
      action: 'Created',
      details: `Story Event added: "${newEvent.name}" (${newEvent.stateChanges.length} consequences)`,
    });

    this.notify();
    return newEvent;
  }

  public approveStoryEvent(eventId: string, applyConsequences: boolean = true) {
    const event = this.state.storyEvents?.find(e => e.id === eventId);
    if (!event) return;
    event.isApproved = true;
    if (applyConsequences) {
      this.applyEventConsequences(event);
    }
    this.notify();
  }

  private applyEventConsequences(event: StoryEvent) {
    event.stateChanges.forEach(sc => {
      if (sc.targetType === 'Character') {
        const char = this.state.characters.find(c => c.id === sc.targetId || c.name.toLowerCase() === sc.targetName.toLowerCase());
        if (char) {
          this.setSceneCharacterState(event.sceneId, char.id, sc.toState);
        }
      } else if (sc.targetType === 'Prop') {
        const prop = this.state.props.find(p => p.id === sc.targetId || p.name.toLowerCase() === sc.targetName.toLowerCase());
        if (prop) {
          this.setScenePropCondition(event.sceneId, prop.id, sc.toState as PropConditionType);
        }
      } else if (sc.targetType === 'Location') {
        const scene = this.state.episodes.flatMap(e => e.scenes || []).find(s => s.id === event.sceneId);
        if (scene) {
          scene.locationState = sc.toState as LocationState;
        }
      }
    });
  }

  public saveStoryCheckpoint(checkpointData: Omit<StoryCheckpoint, 'id' | 'createdAt'>): StoryCheckpoint {
    const newCheckpoint: StoryCheckpoint = {
      ...checkpointData,
      id: `chk-${checkpointData.sceneId}`,
      createdAt: new Date().toISOString(),
    };

    if (!this.state.storyCheckpoints) this.state.storyCheckpoints = [];
    const existingIndex = this.state.storyCheckpoints.findIndex(c => c.sceneId === checkpointData.sceneId);
    if (existingIndex >= 0) {
      this.state.storyCheckpoints[existingIndex] = newCheckpoint;
    } else {
      this.state.storyCheckpoints.push(newCheckpoint);
    }

    // Also attach to scene
    const scene = this.state.episodes.flatMap(e => e.scenes || []).find(s => s.id === checkpointData.sceneId);
    if (scene) {
      scene.storyCheckpoint = newCheckpoint;
    }

    this.notify();
    return newCheckpoint;
  }

  public getInheritedSceneContext(sceneId: string): InheritedSceneContext {
    const allScenes = this.state.episodes.flatMap(e => e.scenes || []).sort((a, b) => a.sortOrder - b.sortOrder);
    const currIndex = allScenes.findIndex(s => s.id === sceneId);
    const currScene = allScenes[currIndex];

    if (currIndex <= 0 || !currScene) {
      return {
        inheritedCharacterStates: (currScene?.characterStates || []).map(cs => ({
          characterId: cs.characterId,
          characterName: this.state.characters.find(c => c.id === cs.characterId)?.name || cs.characterId,
          state: cs.stateId,
        })),
        inheritedCostumeConditions: (currScene?.costumes || []).map(cosName => ({
          costumeId: cosName,
          costumeName: cosName,
          condition: 'NORMAL',
        })),
        inheritedPropConditions: (currScene?.propConditions || []).map(pc => ({
          propId: pc.propId,
          propName: this.state.props.find(p => p.id === pc.propId)?.name || pc.propId,
          condition: pc.condition,
        })),
        inheritedLocationState: {
          locationName: currScene?.locationName || 'Studio',
          state: currScene?.locationState || 'Clean',
        },
        openConflicts: [],
        nextObjective: '按分镜列表开始规划前期镜头。',
        whatChanged: ['新剧集开端，初始化基准连续性状态。'],
      };
    }

    const prevScene = allScenes[currIndex - 1];
    const prevCheckpoint = this.state.storyCheckpoints?.find(c => c.sceneId === prevScene.id);

    const inheritedCharacterStates = prevCheckpoint?.characterStates || (prevScene.characterStates || []).map(cs => ({
      characterId: cs.characterId,
      characterName: this.state.characters.find(c => c.id === cs.characterId)?.name || cs.characterId,
      state: cs.stateId,
    }));

    const inheritedCostumeConditions = prevCheckpoint?.costumeStates || (prevScene.costumes || []).map(cosName => ({
      costumeId: cosName,
      costumeName: cosName,
      condition: 'NORMAL',
    }));

    const inheritedPropConditions = prevCheckpoint?.propConditions || (prevScene.propConditions || []).map(pc => ({
      propId: pc.propId,
      propName: this.state.props.find(p => p.id === pc.propId)?.name || pc.propId,
      condition: pc.condition,
    }));

    const inheritedLocationState = prevCheckpoint?.locationState || {
      locationName: prevScene.locationName,
      state: prevScene.locationState || 'Clean',
    };

    // Calculate "What Changed?" between prev scene and curr scene
    const whatChanged: string[] = [];
    inheritedCharacterStates.forEach(prevChar => {
      const currChar = currScene.characterStates?.find(cs => cs.characterId === prevChar.characterId);
      if (currChar && currChar.stateId !== prevChar.state) {
        whatChanged.push(`角色「${prevChar.characterName}」状态演变: ${prevChar.state} → ${currChar.stateId}`);
      }
    });

    inheritedPropConditions.forEach(prevProp => {
      const currProp = currScene.propConditions?.find(pc => pc.propId === prevProp.propId);
      if (currProp && currProp.condition !== prevProp.condition) {
        whatChanged.push(`道具「${prevProp.propName}」损伤状态变化: ${prevProp.condition} → ${currProp.condition}`);
      }
    });

    if (prevScene.locationName !== currScene.locationName) {
      whatChanged.push(`场景转场: ${prevScene.locationName} → ${currScene.locationName}`);
    } else if (prevScene.locationState !== currScene.locationState && currScene.locationState) {
      whatChanged.push(`场景「${currScene.locationName}」环境破坏程度变化: ${prevScene.locationState || 'Clean'} → ${currScene.locationState}`);
    }

    if (whatChanged.length === 0) {
      whatChanged.push('与前置场次相比无重大破坏或状态突变，严格保持连贯性。');
    }

    return {
      previousSceneId: prevScene.id,
      previousSceneNumber: prevScene.sceneNumber,
      inheritedCharacterStates,
      inheritedCostumeConditions,
      inheritedPropConditions,
      inheritedLocationState,
      inheritedTime: prevScene.storyTime,
      openConflicts: prevCheckpoint?.openConflicts || (prevScene.conflict ? [prevScene.conflict] : []),
      nextObjective: prevCheckpoint?.nextObjective || '继续本场戏剧对抗。',
      whatChanged,
    };
  }

  public updateShotContract(shotId: string, contract: ShotContract) {
    for (const ep of this.state.episodes) {
      for (const sc of ep.scenes || []) {
        const sh = sc.shots?.find(s => s.id === shotId);
        if (sh) {
          sh.contract = contract;
          sh.updatedAt = new Date().toISOString();
          this.notify();
          return;
        }
      }
    }
  }

  public updateShotBlocking(shotId: string, blocking: ShotBlocking) {
    for (const ep of this.state.episodes) {
      for (const sc of ep.scenes || []) {
        const sh = sc.shots?.find(s => s.id === shotId);
        if (sh) {
          sh.blocking2D = blocking;
          sh.updatedAt = new Date().toISOString();
          this.notify();
          return;
        }
      }
    }
  }

  public updateLocationState(locationId: string, state: LocationState, sceneId?: string) {
    const loc = this.state.locations.find(l => l.id === locationId);
    if (loc) {
      loc.currentState = state;
      if (!loc.states) loc.states = [];
      loc.states.push({
        id: `loc-st-${Date.now()}`,
        locationId,
        state,
        sceneId,
        createdAt: new Date().toISOString(),
      });
    }

    if (sceneId) {
      const scene = this.state.episodes.flatMap(e => e.scenes || []).find(s => s.id === sceneId);
      if (scene) {
        scene.locationState = state;
      }
    }

    this.notify();
  }

  public calculateMasterChangeImpact(
    assetType: 'Character' | 'Location' | 'Prop' | 'Costume',
    assetId: string,
    newVersionId: string
  ): ChangeImpactLog {
    let assetName = 'Asset';
    let oldVersionTag = 'V1';
    let newVersionTag = 'V2';

    if (assetType === 'Character') {
      const c = this.state.characters.find(x => x.id === assetId);
      assetName = c?.name || assetName;
      oldVersionTag = c?.versions.find(v => v.id === c.lockedVersionId)?.versionTag || 'V1';
      newVersionTag = c?.versions.find(v => v.id === newVersionId)?.versionTag || 'V2';
    } else if (assetType === 'Location') {
      const l = this.state.locations.find(x => x.id === assetId);
      assetName = l?.name || assetName;
      oldVersionTag = l?.versions.find(v => v.id === l.lockedVersionId)?.versionTag || 'V1';
      newVersionTag = l?.versions.find(v => v.id === newVersionId)?.versionTag || 'V2';
    } else if (assetType === 'Prop') {
      const p = this.state.props.find(x => x.id === assetId);
      assetName = p?.name || assetName;
      oldVersionTag = p?.versions.find(v => v.id === p.lockedVersionId)?.versionTag || 'V1';
      newVersionTag = p?.versions.find(v => v.id === newVersionId)?.versionTag || 'V2';
    } else if (assetType === 'Costume') {
      const cos = this.state.costumes.find(x => x.id === assetId);
      assetName = cos?.name || assetName;
      oldVersionTag = cos?.versions.find(v => v.id === cos.lockedVersionId)?.versionTag || 'V1';
      newVersionTag = cos?.versions.find(v => v.id === newVersionId)?.versionTag || 'V2';
    }

    const allScenes = this.state.episodes.flatMap(e => e.scenes || []);
    const affectedScenes = allScenes.filter(sc => {
      if (assetType === 'Character') return sc.characters.includes(assetId) || sc.characters.includes(assetName);
      if (assetType === 'Location') return sc.locationName.toLowerCase() === assetName.toLowerCase();
      if (assetType === 'Prop') return sc.props.includes(assetId) || sc.props.includes(assetName);
      if (assetType === 'Costume') return sc.costumes.includes(assetId) || sc.costumes.includes(assetName);
      return false;
    });

    const affectedShots = affectedScenes.flatMap(sc => sc.shots || []);
    const affectedShotIds = affectedShots.map(s => s.id);
    const affectedRefPacksCount = affectedShots.filter(s => s.referencePack).length;
    const affectedPromptsCount = affectedShots.reduce((acc, s) => acc + (s.prompts?.length || 0), 0);

    return {
      id: `impact-${Date.now()}`,
      projectId: this.state.activeProjectId,
      assetType,
      assetId,
      assetName,
      oldVersionTag,
      newVersionTag,
      affectedScenesCount: affectedScenes.length,
      affectedShotsCount: affectedShots.length,
      affectedReferencePacksCount: affectedRefPacksCount,
      affectedPromptsCount: affectedPromptsCount,
      affectedShotIds,
      timestamp: new Date().toISOString(),
      directorApproved: false,
    };
  }

  public applyMasterChange(impactLog: ChangeImpactLog) {
    // 1. Update lockedVersionId on asset
    if (impactLog.assetType === 'Character') {
      const c = this.state.characters.find(x => x.id === impactLog.assetId);
      if (c) {
        const targetVer = c.versions.find(v => v.versionTag === impactLog.newVersionTag);
        if (targetVer) c.lockedVersionId = targetVer.id;
      }
    } else if (impactLog.assetType === 'Location') {
      const l = this.state.locations.find(x => x.id === impactLog.assetId);
      if (l) {
        const targetVer = l.versions.find(v => v.versionTag === impactLog.newVersionTag);
        if (targetVer) l.lockedVersionId = targetVer.id;
      }
    } else if (impactLog.assetType === 'Prop') {
      const p = this.state.props.find(x => x.id === impactLog.assetId);
      if (p) {
        const targetVer = p.versions.find(v => v.versionTag === impactLog.newVersionTag);
        if (targetVer) p.lockedVersionId = targetVer.id;
      }
    } else if (impactLog.assetType === 'Costume') {
      const cos = this.state.costumes.find(x => x.id === impactLog.assetId);
      if (cos) {
        const targetVer = cos.versions.find(v => v.versionTag === impactLog.newVersionTag);
        if (targetVer) cos.lockedVersionId = targetVer.id;
      }
    }

    // 2. Mark active reference packs as outdated
    for (const ep of this.state.episodes) {
      for (const sc of ep.scenes || []) {
        for (const sh of sc.shots || []) {
          if (impactLog.affectedShotIds.includes(sh.id) && sh.referencePack) {
            sh.isReferencePackStale = true;
            sh.referencePack.isOutdated = true;
            sh.referencePack.outdatedReason = `主参考资产已从 ${impactLog.oldVersionTag} 升级为 ${impactLog.newVersionTag}，建议核对并更新参考包。`;
          }
        }
      }
    }

    // 3. Save impact log
    impactLog.directorApproved = true;
    if (!this.state.changeImpactLogs) this.state.changeImpactLogs = [];
    this.state.changeImpactLogs.push(impactLog);

    this.addAuditLog({
      projectId: this.state.activeProjectId,
      entityType: 'Asset',
      entityId: impactLog.assetId,
      entityName: impactLog.assetName,
      action: 'Locked',
      details: `Master Reference updated from ${impactLog.oldVersionTag} to ${impactLog.newVersionTag}. Historical locked shots remain protected.`,
    });

    this.notify();
  }

  public saveShotContextSnapshot(
    shotId: string,
    promptVersionTag: string,
    promptData?: { universal?: string; googleFlow?: string; dreamina?: string; changeReason?: string; lengthMode?: PromptLengthMode }
  ): ShotContextSnapshot | null {
    const project = this.state.projects.find(p => p.id === this.state.activeProjectId) || this.state.projects[0];
    for (const ep of this.state.episodes) {
      for (const sc of ep.scenes || []) {
        const sh = sc.shots?.find(s => s.id === shotId);
        if (sh && project) {
          const context = buildProductionContext({
            project,
            bible: this.state.bibles[project.id],
            episode: ep,
            scene: sc,
            shot: sh,
            characters: this.state.characters,
            locations: this.state.locations,
            props: this.state.props,
            costumes: this.state.costumes,
            storyEvents: this.state.storyEvents,
          });

          const snapshot = createContextSnapshot(context, promptVersionTag);
          sh.snapshot = snapshot;
          sh.isPromptStale = false;
          sh.staleReasons = [];
          sh.activePromptVersion = promptVersionTag;

          if (!sh.prompts) sh.prompts = [];
          if (promptData?.universal) {
            sh.prompts.push({
              id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              shotId: sh.id,
              versionTag: promptVersionTag,
              promptUniversal: promptData.universal,
              promptGoogleFlow: promptData.googleFlow || '',
              promptDreamina: promptData.dreamina || '',
              status: 'ACTIVE',
              changeReason: promptData.changeReason || 'Prompt regenerated and snapshot frozen',
              lengthMode: promptData.lengthMode || 'Standard',
              contextSnapshotId: snapshot.id,
              createdAt: new Date().toISOString(),
            });
          }
          this.notify();
          return snapshot;
        }
      }
    }
    return null;
  }

  public checkShotStalePrompt(shotId: string): { isStale: boolean; reasons: string[] } {
    const project = this.state.projects.find(p => p.id === this.state.activeProjectId) || this.state.projects[0];
    for (const ep of this.state.episodes) {
      for (const sc of ep.scenes || []) {
        const sh = sc.shots?.find(s => s.id === shotId);
        if (sh && sh.snapshot && project) {
          const currentContext = buildProductionContext({
            project,
            bible: this.state.bibles[project.id],
            episode: ep,
            scene: sc,
            shot: sh,
            characters: this.state.characters,
            locations: this.state.locations,
            props: this.state.props,
            costumes: this.state.costumes,
            storyEvents: this.state.storyEvents,
          });

          const result = isSnapshotStale(sh.snapshot, currentContext);
          sh.isPromptStale = result.isStale;
          sh.staleReasons = result.reasons;
          return result;
        }
      }
    }
    return { isStale: false, reasons: [] };
  }

  public updatePromptStatus(shotId: string, promptId: string, status: PromptStatus) {
    for (const ep of this.state.episodes) {
      for (const sc of ep.scenes || []) {
        const sh = sc.shots?.find(s => s.id === shotId);
        if (sh && sh.prompts) {
          const p = sh.prompts.find(x => x.id === promptId);
          if (p) {
            p.status = status;
            this.notify();
            return;
          }
        }
      }
    }
  }

  public getContinuityMatrix(): ContinuityMatrixItem[] {
    const allScenes = this.state.episodes.flatMap(e => e.scenes || []).sort((a, b) => a.sortOrder - b.sortOrder);
    const matrix: ContinuityMatrixItem[] = [];

    // Characters
    this.state.characters.forEach(char => {
      const sceneStatuses = allScenes.map(sc => {
        const isPresent = sc.characters.includes(char.id) || sc.characters.includes(char.name);
        if (!isPresent) return { sceneId: sc.id, sceneNumber: sc.sceneNumber, status: 'NOT_PRESENT' as const };

        const warning = this.state.continuityWarnings.find(
          w => w.sceneId === sc.id && (w.assetId === char.id || w.assetName === char.name) && w.status === 'ACTIVE'
        );

        const charState = sc.characterStates?.find(cs => cs.characterId === char.id)?.stateId || 'NORMAL';

        if (warning) {
          return {
            sceneId: sc.id,
            sceneNumber: sc.sceneNumber,
            status: warning.severity === 'CRITICAL' ? 'CRITICAL' as const : 'WARNING' as const,
            stateLabel: charState,
            warningId: warning.id,
            conflictDescription: warning.description,
          };
        }

        return {
          sceneId: sc.id,
          sceneNumber: sc.sceneNumber,
          status: 'PASS' as const,
          stateLabel: charState,
        };
      });

      matrix.push({
        assetId: char.id,
        assetName: char.name,
        assetType: 'Character',
        sceneStatuses,
      });
    });

    // Props
    this.state.props.forEach(prop => {
      const sceneStatuses = allScenes.map(sc => {
        const isPresent = sc.props.includes(prop.id) || sc.props.includes(prop.name);
        if (!isPresent) return { sceneId: sc.id, sceneNumber: sc.sceneNumber, status: 'NOT_PRESENT' as const };

        const warning = this.state.continuityWarnings.find(
          w => w.sceneId === sc.id && (w.assetId === prop.id || w.assetName === prop.name) && w.status === 'ACTIVE'
        );

        const propCond = sc.propConditions?.find(pc => pc.propId === prop.id)?.condition || 'NEW';

        if (warning) {
          return {
            sceneId: sc.id,
            sceneNumber: sc.sceneNumber,
            status: warning.severity === 'CRITICAL' ? 'CRITICAL' as const : 'WARNING' as const,
            stateLabel: propCond,
            warningId: warning.id,
            conflictDescription: warning.description,
          };
        }

        return {
          sceneId: sc.id,
          sceneNumber: sc.sceneNumber,
          status: 'PASS' as const,
          stateLabel: propCond,
        };
      });

      matrix.push({
        assetId: prop.id,
        assetName: prop.name,
        assetType: 'Prop',
        sceneStatuses,
      });
    });

    // Locations
    this.state.locations.forEach(loc => {
      const sceneStatuses = allScenes.map(sc => {
        const isPresent = sc.locationName.toLowerCase() === loc.name.toLowerCase();
        if (!isPresent) return { sceneId: sc.id, sceneNumber: sc.sceneNumber, status: 'NOT_PRESENT' as const };

        const warning = this.state.continuityWarnings.find(
          w => w.sceneId === sc.id && (w.assetId === loc.id || w.assetName.toLowerCase() === loc.name.toLowerCase()) && w.status === 'ACTIVE'
        );

        const locState = sc.locationState || loc.currentState || 'Clean';

        if (warning) {
          return {
            sceneId: sc.id,
            sceneNumber: sc.sceneNumber,
            status: warning.severity === 'CRITICAL' ? 'CRITICAL' as const : 'WARNING' as const,
            stateLabel: locState,
            warningId: warning.id,
            conflictDescription: warning.description,
          };
        }

        return {
          sceneId: sc.id,
          sceneNumber: sc.sceneNumber,
          status: 'PASS' as const,
          stateLabel: locState,
        };
      });

      matrix.push({
        assetId: loc.id,
        assetName: loc.name,
        assetType: 'Location',
        sceneStatuses,
      });
    });

    return matrix;
  }

  public calculateProductionHealth(): ProductionHealthScore {
    const allScenes = this.state.episodes.flatMap(e => e.scenes || []);
    const allShots = allScenes.flatMap(sc => sc.shots || []);
    const totalAssets = this.state.characters.length + this.state.locations.length + this.state.props.length + this.state.costumes.length;
    let lockedAssets = 0;
    this.state.characters.forEach(c => { if (c.lockedVersionId) lockedAssets++; });
    this.state.locations.forEach(l => { if (l.lockedVersionId) lockedAssets++; });
    this.state.props.forEach(p => { if (p.lockedVersionId) lockedAssets++; });
    this.state.costumes.forEach(c => { if (c.lockedVersionId) lockedAssets++; });

    const activeWarnings = this.state.continuityWarnings.filter(w => w.status === 'ACTIVE');
    const totalShotsCount = allShots.length;
    const promptReadyShots = allShots.filter(s => s.prompts && s.prompts.length > 0 && !s.isPromptStale).length;
    const videoReadyShots = allShots.filter(s => s.takes?.some(t => t.status === 'SELECTED')).length;

    // Rule-based continuity score calculation
    const totalChecks = (allScenes.length * 5) + (allShots.length * 3);
    const failedChecks = activeWarnings.length * 2;
    const passedChecks = Math.max(0, totalChecks - failedChecks);

    const storyContinuity = Math.max(0, Math.min(100, Math.round(((totalChecks - (activeWarnings.filter(w => w.category === 'Timeline' || w.category === 'State').length * 4)) / totalChecks) * 100)));
    const visualContinuity = Math.max(0, Math.min(100, Math.round(((totalChecks - (activeWarnings.filter(w => w.category === 'Character' || w.category === 'Costume' || w.category === 'Prop').length * 4)) / totalChecks) * 100)));
    const shotContinuity = Math.max(0, Math.min(100, Math.round(((totalChecks - (activeWarnings.filter(w => w.category === 'Axis').length * 5)) / totalChecks) * 100)));
    const assetReadiness = totalAssets > 0 ? Math.round((lockedAssets / totalAssets) * 100) : 100;
    const promptReadiness = totalShotsCount > 0 ? Math.round((promptReadyShots / totalShotsCount) * 100) : 0;
    const videoReadiness = totalShotsCount > 0 ? Math.round((videoReadyShots / totalShotsCount) * 100) : 0;

    const overallScore = Math.round((storyContinuity + visualContinuity + shotContinuity + assetReadiness + promptReadiness + videoReadiness) / 6);

    return {
      storyContinuity,
      visualContinuity,
      shotContinuity,
      assetReadiness,
      promptReadiness,
      videoReadiness,
      overallScore,
      totalChecks,
      passedChecks,
    };
  }
}

export const studioStore = new StudioStore();
