'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Copy,
  Check,
  Sparkles,
  Save,
  ArrowRight,
  Upload,
  AlertCircle,
  FileText,
  Layers,
  Clapperboard,
  Tv,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw,
  Eye,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { manualAI, ValidationResult } from '@/lib/ai/manualAI';
import { StoryBreakdownSchema, StoryBreakdownScene, StoryInput } from '@/lib/types';

export default function StoryRoomPage() {
  const {
    projects,
    activeProjectId,
    bibles,
    actionBibles,
    stories,
    characters,
    locations,
    props,
    costumes,
    episodes,
    isHydrated,
  } = useStudioStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeBible = activeProject ? bibles[activeProject.id] : undefined;
  const activeActionBible = activeProject ? actionBibles[activeProject.id] : undefined;

  // Story Input State
  const [activeTab, setActiveTab] = useState<'LOGLINE' | 'SCREENPLAY' | 'TREATMENT'>('SCREENPLAY');
  const [storyInputState, setStoryInputState] = useState<StoryInput>({
    id: `story-${activeProject?.id || 'default'}`,
    projectId: activeProject?.id || '',
    logline: '',
    screenplay: '',
    treatment: '',
    activeTab: 'SCREENPLAY',
    updatedAt: new Date().toISOString(),
  });

  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedInstruction, setCopiedInstruction] = useState(false);

  // Modal & JSON Import State
  const [modalOpen, setModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [copiedRepair, setCopiedRepair] = useState(false);
  const [selectedScenes, setSelectedScenes] = useState<Record<string, boolean>>({});
  const [importStep, setImportStep] = useState<'INPUT' | 'PREVIEW' | 'COMPLETE'>('INPUT');

  // Asset Matching & Duplicate Actions
  // Key: assetType_normalizedName, Value: 'USE_EXISTING' | 'CREATE_NEW' | 'SKIP'
  const [assetDecisions, setAssetDecisions] = useState<Record<string, 'USE_EXISTING' | 'CREATE_NEW' | 'SKIP'>>({});

  // Sync state from store once hydrated or project changes
  useEffect(() => {
    if (activeProject && isHydrated) {
      const stored = studioStore.getStoryInput(activeProject.id);
      setStoryInputState(stored);
      setActiveTab(stored.activeTab || 'SCREENPLAY');
    }
  }, [activeProject, isHydrated]);

  const handleTextChange = (value: string) => {
    setStoryInputState((prev) => {
      if (activeTab === 'LOGLINE') return { ...prev, logline: value };
      if (activeTab === 'SCREENPLAY') return { ...prev, screenplay: value };
      return { ...prev, treatment: value };
    });
  };

  const handleSaveStory = () => {
    if (!activeProject) return;
    studioStore.saveStoryInput(activeProject.id, {
      ...storyInputState,
      activeTab,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const getCurrentText = () => {
    if (activeTab === 'LOGLINE') return storyInputState.logline;
    if (activeTab === 'SCREENPLAY') return storyInputState.screenplay;
    return storyInputState.treatment;
  };

  const handleCopyInstruction = () => {
    if (!activeProject) return;
    const dynamicPrompt = manualAI.generateBreakdownPrompt({
      project: activeProject,
      bible: activeBible,
      actionBible: activeActionBible,
      storyInput: {
        ...storyInputState,
        activeTab,
      },
    });

    navigator.clipboard.writeText(dynamicPrompt);
    setCopiedInstruction(true);
    setTimeout(() => setCopiedInstruction(false), 2500);
  };

  const handleValidateJson = () => {
    const res = manualAI.validateBreakdownJson(jsonInput);
    setValidation(res);

    if (res.success && res.data) {
      // Initialize selected scenes map (default select all)
      const sel: Record<string, boolean> = {};
      const decisions: Record<string, 'USE_EXISTING' | 'CREATE_NEW' | 'SKIP'> = {};

      res.data.episodes.forEach((ep) => {
        ep.scenes.forEach((sc) => {
          const scKey = `ep${ep.episode_number}_sc${sc.scene_number}`;
          sel[scKey] = true;

          // Check Character duplicates
          sc.characters?.forEach((c) => {
            const key = `char_${c.trim().toLowerCase()}`;
            const exists = characters.some((ch) => ch.name.toLowerCase() === c.trim().toLowerCase());
            if (exists && !decisions[key]) {
              decisions[key] = 'USE_EXISTING'; // default USE EXISTING
            }
          });

          // Check Location duplicates
          if (sc.location) {
            const key = `loc_${sc.location.trim().toLowerCase()}`;
            const exists = locations.some((l) => l.name.toLowerCase() === sc.location.trim().toLowerCase());
            if (exists && !decisions[key]) {
              decisions[key] = 'USE_EXISTING';
            }
          }

          // Check Prop duplicates
          sc.props?.forEach((p) => {
            const key = `prop_${p.trim().toLowerCase()}`;
            const exists = props.some((pr) => pr.name.toLowerCase() === p.trim().toLowerCase());
            if (exists && !decisions[key]) {
              decisions[key] = 'USE_EXISTING';
            }
          });

          // Check Costume duplicates
          sc.costumes?.forEach((cos) => {
            const key = `cos_${cos.trim().toLowerCase()}`;
            const exists = costumes.some((c) => c.name.toLowerCase() === cos.trim().toLowerCase());
            if (exists && !decisions[key]) {
              decisions[key] = 'USE_EXISTING';
            }
          });
        });
      });

      setSelectedScenes(sel);
      setAssetDecisions(decisions);
      setImportStep('PREVIEW');
    }
  };

  const handleCopyRepair = () => {
    if (validation?.repairInstruction) {
      navigator.clipboard.writeText(validation.repairInstruction);
      setCopiedRepair(true);
      setTimeout(() => setCopiedRepair(false), 2500);
    }
  };

  const toggleSceneSelection = (key: string) => {
    setSelectedScenes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleExecuteImport = () => {
    if (!validation?.data || !activeProject) return;
    const data = validation.data;

    // Track newly created assets to prevent duplicate creation in this batch
    const createdCharsMap = new Map<string, string>(); // Name -> ID
    const createdLocsMap = new Map<string, string>();
    const createdPropsMap = new Map<string, string>();
    const createdCosMap = new Map<string, string>();

    // 1. Process and match all discovered assets
    data.episodes.forEach((ep) => {
      ep.scenes.forEach((sc) => {
        const scKey = `ep${ep.episode_number}_sc${sc.scene_number}`;
        if (!selectedScenes[scKey]) return;

        // Characters
        sc.characters?.forEach((charName) => {
          const trimmed = charName.trim();
          const charKey = `char_${trimmed.toLowerCase()}`;
          const existing = characters.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
          const decision = assetDecisions[charKey] || 'USE_EXISTING';

          if (existing && decision === 'USE_EXISTING') {
            createdCharsMap.set(trimmed.toUpperCase(), existing.id);
          } else if (decision === 'CREATE_NEW' || (!existing && decision !== 'SKIP')) {
            if (!createdCharsMap.has(trimmed.toUpperCase())) {
              const newChar = studioStore.addCharacter({
                projectId: activeProject.id,
                name: trimmed,
                role: '配角 Supporting',
                age: '30',
                gender: '未指定',
                personality: '坚定冷静',
                physicalDescription: `${trimmed}，身形敏捷，具有电影级微表情。`,
                hair: '黑色短发',
                face: '角质感面容',
                body: '匀称战术体魄',
                height: '178cm',
                costume: '战术作战服',
                signatureFeatures: '战术护目镜',
                performanceNotes: '动作利落',
              });
              createdCharsMap.set(trimmed.toUpperCase(), newChar.id);
            }
          }
        });

        // Locations
        if (sc.location) {
          const trimmed = sc.location.trim();
          const locKey = `loc_${trimmed.toLowerCase()}`;
          const existing = locations.find((l) => l.name.toLowerCase() === trimmed.toLowerCase());
          const decision = assetDecisions[locKey] || 'USE_EXISTING';

          if (existing && decision === 'USE_EXISTING') {
            createdLocsMap.set(trimmed.toUpperCase(), existing.id);
          } else if (decision === 'CREATE_NEW' || (!existing && decision !== 'SKIP')) {
            if (!createdLocsMap.has(trimmed.toUpperCase())) {
              const newLoc = studioStore.addLocation({
                projectId: activeProject.id,
                name: trimmed,
                description: `${trimmed} 影视取景地。`,
                architecture: '粗野工业 / 新黑色电影风格',
                environment: '潮湿路面，冷暖交叠光照',
                time: sc.time || 'NIGHT',
                weather: '微雨有雾',
                lighting: '8:1高光比明暗对照',
                colorPalette: '深冷钨丝蓝配暖钠黄',
                atmosphere: '高度压抑，随时爆发冲突',
                cameraNotes: '低角度仰拍',
              });
              createdLocsMap.set(trimmed.toUpperCase(), newLoc.id);
            }
          }
        }

        // Props
        sc.props?.forEach((propName) => {
          const trimmed = propName.trim();
          const propKey = `prop_${trimmed.toLowerCase()}`;
          const existing = props.find((p) => p.name.toLowerCase() === trimmed.toLowerCase());
          const decision = assetDecisions[propKey] || 'USE_EXISTING';

          if (existing && decision === 'USE_EXISTING') {
            createdPropsMap.set(trimmed.toUpperCase(), existing.id);
          } else if (decision === 'CREATE_NEW' || (!existing && decision !== 'SKIP')) {
            if (!createdPropsMap.has(trimmed.toUpperCase())) {
              const newProp = studioStore.addProp({
                projectId: activeProject.id,
                name: trimmed,
                description: `${trimmed} 核心剧情关键道具。`,
                material: '高强度强化合金',
                color: '哑光暗黑',
                size: '标准比例',
                function: '格斗处刑与机关解密',
                storyImportance: '关键',
              });
              createdPropsMap.set(trimmed.toUpperCase(), newProp.id);
            }
          }
        });

        // Costumes
        sc.costumes?.forEach((cosName) => {
          const trimmed = cosName.trim();
          const cosKey = `cos_${trimmed.toLowerCase()}`;
          const existing = costumes.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
          const decision = assetDecisions[cosKey] || 'USE_EXISTING';

          if (existing && decision === 'USE_EXISTING') {
            createdCosMap.set(trimmed.toUpperCase(), existing.id);
          } else if (decision === 'CREATE_NEW' || (!existing && decision !== 'SKIP')) {
            if (!createdCosMap.has(trimmed.toUpperCase())) {
              const newCos = studioStore.addCostume({
                projectId: activeProject.id,
                name: trimmed,
                description: `${trimmed} 电影级定制战服。`,
                material: '凯夫拉编织与暗黑皮革',
                color: '哑光黑',
                accessories: '战术臂甲',
                shoes: '静音战靴',
                condition: '崭新完好',
              });
              createdCosMap.set(trimmed.toUpperCase(), newCos.id);
            }
          }
        });
      });
    });

    // 2. Import Episodes and Selected Scenes
    data.episodes.forEach((ep) => {
      // Find existing episode by number or create new
      let targetEp = episodes.find((e) => e.episodeNumber === ep.episode_number);
      if (!targetEp) {
        targetEp = studioStore.addEpisode({
          projectId: activeProject.id,
          episodeNumber: ep.episode_number,
          title: ep.title || `第 0${ep.episode_number} 集`,
          logline: ep.logline || '由 AI 故事拆解导入的剧集。',
          synopsis: ep.synopsis || '',
          runtime: `${Math.round((ep.estimated_duration || 480) / 60)} 分钟`,
          status: '制作中',
          directorNotes: '遵循好莱坞大片视听标准。',
          sortOrder: ep.episode_number,
        });
      }

      ep.scenes.forEach((sc) => {
        const scKey = `ep${ep.episode_number}_sc${sc.scene_number}`;
        if (!selectedScenes[scKey]) return;

        const createdScene = studioStore.addScene(targetEp!.id, {
          sceneNumber: sc.scene_number,
          sceneTitle: sc.title || `第 ${sc.scene_number} 场`,
          intExt: sc.int_ext || 'INT',
          locationName: sc.location || 'FILM SET',
          timeOfDay: sc.time || 'NIGHT',
          characters: sc.characters || [],
          props: sc.props || [],
          costumes: sc.costumes || [],
          storyPurpose: sc.story_purpose || '',
          emotion: sc.emotion || '紧张 (Tense)',
          conflict: sc.conflict || '',
          duration: `${sc.duration || 120}s`,
          directorNotes: sc.director_intention || '',
          directorScenePurpose: sc.story_purpose || '',
          directorEmotionalArc: sc.emotion || '',
          directorAudienceExperience: '极度专注的视觉与情绪沉浸。',
          directorPacing: '紧凑有力的电影级节奏',
          directorVisualStrategy: '8:1 高反差 chiaroscuro 明暗对照',
          directorPerformanceDirection: '内敛克制，以微表情传递杀意',
          directorCameraStrategy: '低角度斯坦尼康平稳推移',
          directorLightingStrategy: '单束冷光为主匙光，硬质边缘轮廓光',
          directorTransition: 'Cut',
          productionStatus: 'SCRIPT READY',
          sortOrder: sc.scene_number,
        });

        // Add beats if present
        sc.beats?.forEach((b, idx) => {
          if (!createdScene.beats) createdScene.beats = [];
          createdScene.beats.push({
            id: `beat-${Date.now()}-${idx}`,
            sceneId: createdScene.id,
            beatNumber: b.beat_number || idx + 1,
            description: b.description,
            action: b.action,
            emotionalShift: b.emotional_shift,
            sortOrder: idx + 1,
          });
        });

        // Add shot suggestions as initial shots
        sc.shot_suggestions?.forEach((sh, sIdx) => {
          studioStore.addShot(createdScene.id, {
            shotNumber: sh.shot_number || sIdx + 1,
            shotType: (sh.shot_type as any) || 'Medium Shot',
            framing: 'Rule of thirds',
            cameraAngle: 'Low Angle',
            lens: '35mm',
            cameraMovement: sh.camera || 'Steadicam tracking',
            cameraSpeed: 'deliberate',
            subject: sc.characters?.[0] || '主要角色',
            action: sh.action || 'High kinetic movie choreography',
            performance: 'Lethal focus and calculated stillness',
            blocking: 'Deep multi-plane triangle staging',
            environment: sc.location || 'Film set',
            lighting: '8:1 contrast chiaroscuro',
            atmosphere: 'Dense atmospheric haze and dust motes',
            composition: 'Golden ratio composition',
            depth: 'Deep cinematic focus',
            visualEffects: 'Micro-particles',
            transition: 'Cut',
            duration: `${sh.duration || 3}s`,
            sortOrder: sIdx + 1,
          });
        });
      });
    });

    setImportStep('COMPLETE');
    setTimeout(() => {
      setModalOpen(false);
      setImportStep('INPUT');
      setValidation(null);
      setJsonInput('');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI SERIES PRODUCTION WORKFLOW • STEP 3</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-gold-500" />
            <span>剧本工作空间 (Story Room)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            输入并持久化保存剧本、故事梗概与分集大纲，使用动态 AI 指令在外部大模型进行工业级拆解并无缝导入。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setModalOpen(true);
              setImportStep('INPUT');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-white font-semibold text-xs border border-studio-700 transition-colors shadow-md"
          >
            <Upload className="w-3.5 h-3.5 text-gold-400" />
            <span>导入 AI 拆解数据 (IMPORT AI BREAKDOWN)</span>
          </button>

          <button
            onClick={handleSaveStory}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02]"
          >
            {savedNotice ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>剧本文档已保存！</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存剧本 (SAVE STORY)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: STORY INPUT (7 cols) */}
        <div className="lg:col-span-7 bg-studio-900 border border-studio-750 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-studio-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gold-400" />
                <span>剧本输入区 (STORY INPUT)</span>
              </span>
            </div>

            {/* Input Format Tabs */}
            <div className="flex items-center gap-1 bg-studio-950 p-1 rounded-lg border border-studio-800">
              {(['LOGLINE', 'SCREENPLAY', 'TREATMENT'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setStoryInputState((prev) => ({ ...prev, activeTab: tab }));
                  }}
                  className={`px-3 py-1 rounded text-[11px] font-mono font-bold tracking-wider transition-all ${
                    activeTab === tab
                      ? 'bg-gold-500 text-studio-950 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  [ {tab} ]
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>
                当前编辑：
                <strong className="text-gold-400 font-mono">
                  {activeTab === 'LOGLINE'
                    ? '一句话故事梗概 (LOGLINE)'
                    : activeTab === 'SCREENPLAY'
                    ? '标准电影剧本 (SCREENPLAY)'
                    : '故事大纲 / 梗概 (TREATMENT)'}
                </strong>
              </span>
              <span className="font-mono text-zinc-500">{getCurrentText()?.length || 0} 字符</span>
            </div>

            <textarea
              rows={16}
              value={getCurrentText()}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste your story here... (在此处粘贴剧本文本、场次标头与动作描述)"
              className="w-full bg-studio-950 border border-studio-750 hover:border-studio-700 rounded-lg p-4 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>输入内容在点击「保存剧本」后永久固化，刷新页面绝不丢失。</span>
            </div>

            <button
              onClick={handleSaveStory}
              className="px-3.5 py-1.5 rounded bg-studio-800 hover:bg-studio-750 text-gold-400 hover:text-gold-300 font-mono text-xs border border-gold-500/30 transition-colors"
            >
              [SAVE STORY]
            </button>
          </div>
        </div>

        {/* Right Column: AI STORY BREAKDOWN (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-studio-900 border border-studio-750 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-studio-800 pb-3">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold">
                AI 故事拆解工作流 (AI STORY BREAKDOWN)
              </h2>
            </div>

            {/* Zero API Philosophy Banner */}
            <div className="p-4 rounded-lg bg-studio-950 border border-studio-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>零 API 外部协同准则 (MANUAL AI WORKFLOW)</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                The platform does not call AI APIs.
                <br />
                <br />
                Copy the instruction below into ChatGPT or Gemini,
                <br />
                then paste the structured JSON response back here.
              </p>
            </div>

            {/* Dynamic Instruction Details */}
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="text-[11px] font-mono text-zinc-500 uppercase font-bold">
                PROMPT 动态注入参数 (DYNAMIC CONTEXT):
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-studio-950 p-2 rounded border border-studio-800">
                  <span className="text-zinc-500 block">GENRE:</span>
                  <span className="text-white truncate block">{activeProject?.genre || 'Action'}</span>
                </div>
                <div className="bg-studio-950 p-2 rounded border border-studio-800">
                  <span className="text-zinc-500 block">ASPECT RATIO:</span>
                  <span className="text-white truncate block">{activeProject?.aspectRatio || '16:9'}</span>
                </div>
                <div className="bg-studio-950 p-2 rounded border border-studio-800">
                  <span className="text-zinc-500 block">LENS KIT:</span>
                  <span className="text-white truncate block">{activeBible?.lensKitSpecs?.slice(0, 20) || 'Anamorphic'}</span>
                </div>
                <div className="bg-studio-950 p-2 rounded border border-studio-800">
                  <span className="text-zinc-500 block">ACTION PHYSICS:</span>
                  <span className="text-white truncate block">{activeActionBible?.stuntDesignStyle?.slice(0, 20) || '87Eleven'}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleCopyInstruction}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs shadow-md shadow-gold-500/20 transition-all hover:scale-[1.01]"
              >
                {copiedInstruction ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>AI 指令已复制到剪贴板！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制 AI 拆解指令 (COPY AI INSTRUCTION)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setModalOpen(true);
                  setImportStep('INPUT');
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-white font-semibold text-xs border border-studio-700 transition-colors"
              >
                <Upload className="w-4 h-4 text-gold-400" />
                <span>粘贴 JSON 结果导入 (PASTE JSON)</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/director"
              className="p-4 rounded-xl bg-studio-900 border border-studio-800 hover:border-gold-500/40 transition-all group block"
            >
              <Clapperboard className="w-4 h-4 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">前往导演工作台</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">查看已拆解分镜与 Prompt</div>
            </Link>

            <Link
              href="/episodes"
              className="p-4 rounded-xl bg-studio-900 border border-studio-800 hover:border-gold-500/40 transition-all group block"
            >
              <Tv className="w-4 h-4 text-gold-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">剧集与场次管理</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">共 {episodes.length} 集剧本结构</div>
            </Link>
          </div>
        </div>
      </div>

      {/* IMPORT AI BREAKDOWN MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-studio-750 flex items-center justify-between bg-studio-850">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold">
                  IMPORT AI BREAKDOWN • 剧本结构导入
                </span>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {importStep === 'INPUT'
                    ? '粘贴 ChatGPT / Gemini JSON 结果'
                    : importStep === 'PREVIEW'
                    ? '选择性导入预览与资产查重 (IMPORT PREVIEW)'
                    : '导入完成'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {importStep === 'INPUT' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                      Paste ChatGPT / Gemini JSON response here
                    </label>
                    <textarea
                      rows={12}
                      value={jsonInput}
                      onChange={(e) => {
                        setJsonInput(e.target.value);
                        setValidation(null);
                      }}
                      placeholder='在此处完整粘贴外部 AI 返回的结构化 JSON 数据...'
                      className="w-full bg-studio-950 border border-studio-750 rounded-lg p-4 font-mono text-xs text-zinc-200 focus:outline-none focus:border-gold-500 shadow-inner leading-relaxed"
                    />
                  </div>

                  {/* Validation Error Banner with Repair Button */}
                  {validation && !validation.success && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>⚠ Invalid JSON — {validation.error}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        检测到 JSON 格式不符合规范或语法有误。点击下方按钮一键复制专用修复指令，让 AI 修正语法并保持剧本内容不变。
                      </p>
                      <button
                        onClick={handleCopyRepair}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/40 transition-colors"
                      >
                        {copiedRepair ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>修复指令已复制！请发送给 AI</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>[COPY REPAIR INSTRUCTION] 复制修复指令</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Validation Success Banner */}
                  {validation?.success && validation.stats && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                        <ShieldCheck className="w-4 h-4" />
                        <span>✓ Valid JSON 验证通过！</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                        <div className="bg-studio-900/80 p-2 rounded border border-studio-750">
                          <span className="text-zinc-500 text-[10px] block">Episodes</span>
                          <strong className="text-white text-sm">{validation.stats.episodesCount}</strong>
                        </div>
                        <div className="bg-studio-900/80 p-2 rounded border border-studio-750">
                          <span className="text-zinc-500 text-[10px] block">Scenes</span>
                          <strong className="text-gold-400 text-sm">{validation.stats.scenesCount}</strong>
                        </div>
                        <div className="bg-studio-900/80 p-2 rounded border border-studio-750">
                          <span className="text-zinc-500 text-[10px] block">Characters</span>
                          <strong className="text-white text-sm">{validation.stats.charactersCount}</strong>
                        </div>
                        <div className="bg-studio-900/80 p-2 rounded border border-studio-750">
                          <span className="text-zinc-500 text-[10px] block">Locations</span>
                          <strong className="text-white text-sm">{validation.stats.locationsCount}</strong>
                        </div>
                        <div className="bg-studio-900/80 p-2 rounded border border-studio-750">
                          <span className="text-zinc-500 text-[10px] block">Props</span>
                          <strong className="text-white text-sm">{validation.stats.propsCount}</strong>
                        </div>
                        <div className="bg-studio-900/80 p-2 rounded border border-studio-750">
                          <span className="text-zinc-500 text-[10px] block">Costumes</span>
                          <strong className="text-white text-sm">{validation.stats.costumesCount}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {importStep === 'PREVIEW' && validation?.data && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Asset Duplicate Handling & Auto Matching Section */}
                  {Object.keys(assetDecisions).length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono uppercase">
                        <AlertCircle className="w-4 h-4" />
                        <span>检测到已有影视资产冲突或匹配项 ({Object.keys(assetDecisions).length})</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        系统默认启用<strong>【USE EXISTING】</strong>自动连接至现有资产，避免创建同名重复项。
                      </p>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {Object.entries(assetDecisions).map(([key, decision]) => {
                          const [type, ...nameParts] = key.split('_');
                          const name = nameParts.join('_').toUpperCase();
                          const typeLabel = type === 'char' ? '角色' : type === 'loc' ? '场景' : type === 'prop' ? '道具' : '服装';

                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between text-xs bg-studio-900/90 p-2.5 rounded-lg border border-studio-750"
                            >
                              <span className="text-zinc-200">
                                发现同名{typeLabel}: <strong className="text-gold-400">{name}</strong>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setAssetDecisions((prev) => ({ ...prev, [key]: 'USE_EXISTING' }))}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                    decision === 'USE_EXISTING'
                                      ? 'bg-gold-500 text-studio-950 shadow-sm'
                                      : 'bg-studio-800 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  [USE EXISTING]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAssetDecisions((prev) => ({ ...prev, [key]: 'CREATE_NEW' }))}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                    decision === 'CREATE_NEW'
                                      ? 'bg-zinc-200 text-studio-950 shadow-sm'
                                      : 'bg-studio-800 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  [CREATE NEW]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAssetDecisions((prev) => ({ ...prev, [key]: 'SKIP' }))}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                                    decision === 'SKIP'
                                      ? 'bg-red-500 text-white shadow-sm'
                                      : 'bg-studio-800 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  [SKIP]
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selective Episode & Scene Import Hierarchy */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold">
                        选择性导入场次 (SELECT SCENES TO IMPORT)
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-500">
                        勾选需要导入的项目，未勾选的场次将被跳过。
                      </span>
                    </div>

                    {validation.data.episodes.map((ep) => (
                      <div
                        key={ep.episode_number}
                        className="rounded-xl bg-studio-950 border border-studio-750 overflow-hidden"
                      >
                        <div className="p-3.5 bg-studio-850/80 border-b border-studio-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-xs font-mono font-bold">
                              EPISODE 0{ep.episode_number}: {ep.title}
                            </strong>
                            <span className="text-[10px] font-mono text-zinc-400">
                              ({ep.scenes.length} Scenes)
                            </span>
                          </div>
                        </div>

                        <div className="divide-y divide-studio-800/60 p-2 space-y-1">
                          {ep.scenes.map((sc) => {
                            const scKey = `ep${ep.episode_number}_sc${sc.scene_number}`;
                            const isSelected = !!selectedScenes[scKey];

                            return (
                              <div
                                key={sc.scene_number}
                                onClick={() => toggleSceneSelection(scKey)}
                                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                                  isSelected ? 'bg-studio-900' : 'bg-studio-950/40 opacity-60'
                                }`}
                              >
                                <button type="button" className="mt-0.5 text-gold-400">
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4 text-zinc-600" />
                                  )}
                                </button>

                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-white">
                                      SC{sc.scene_number < 10 ? `0${sc.scene_number}` : sc.scene_number}
                                    </span>
                                    <span className="text-xs text-zinc-300 font-semibold">{sc.title}</span>
                                    <span className="text-[10px] font-mono bg-studio-800 px-1.5 py-0.5 rounded text-zinc-400">
                                      {sc.location || 'UNKNOWN'}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-mono">
                                    <span>{sc.beats?.length || 0} Beats</span>
                                    <span>•</span>
                                    <span>{sc.characters?.length || 0} Characters</span>
                                    <span>•</span>
                                    <span>{sc.props?.length || 0} Props</span>
                                    <span>•</span>
                                    <span>{sc.shot_suggestions?.length || 0} Shot Suggestions</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {importStep === 'COMPLETE' && (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-bold text-white">剧本结构已成功导入！</h3>
                  <p className="text-xs text-zinc-400">
                    场次、分镜与资产已自动同步至剧集管理和导演工作台。正在关闭窗口...
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-studio-750 flex items-center justify-between bg-studio-850">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-xs font-semibold border border-studio-700 transition-colors"
              >
                取消
              </button>

              <div className="flex items-center gap-3">
                {importStep === 'INPUT' && (
                  <button
                    onClick={handleValidateJson}
                    disabled={!jsonInput.trim()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                      jsonInput.trim()
                        ? 'bg-gold-500 hover:bg-gold-400 text-studio-950 shadow-md shadow-gold-500/20'
                        : 'bg-studio-800 text-zinc-500 cursor-not-allowed border border-studio-700'
                    }`}
                  >
                    <span>[VALIDATE JSON] 验证 JSON 数据</span>
                  </button>
                )}

                {importStep === 'PREVIEW' && (
                  <>
                    <button
                      onClick={() => setImportStep('INPUT')}
                      className="px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-xs font-semibold border border-studio-700"
                    >
                      返回编辑 JSON
                    </button>
                    <button
                      onClick={handleExecuteImport}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-md shadow-gold-500/20 transition-all hover:scale-[1.02]"
                    >
                      <Upload className="w-4 h-4" />
                      <span>[IMPORT SELECTED] 确认导入选中的场次与资产</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
