'use client';

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clapperboard,
  Sparkles,
  Copy,
  Check,
  Plus,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Layers,
  Eye,
  Camera,
  SunMedium,
  Heart,
  Activity,
  Save,
  Trash2,
  Tv,
  Film,
  Flame,
  Copy as DuplicateIcon,
  Video,
  Play,
  Upload,
  AlertTriangle,
  FileText,
  Clock,
  Compass,
  MessageSquare,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Minimize2,
  Download,
  Image as ImageIcon,
  ZoomIn,
  X,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import {
  Scene,
  Shot,
  ShotType,
  CameraMovement,
  LensType,
  ShotTake,
  TakeStatus,
  ScreenDirection,
  CameraSide,
  EyeLine,
  ShotTransition,
  ShotPacing,
  PropConditionType,
  PromptLengthMode,
} from '@/lib/types';
import { generateShotPrompts } from '@/lib/promptEngine';
import { manualAI } from '@/lib/ai/manualAI';
import { downloadReferencePackZip } from '@/lib/zipExport';
import SceneContextPanel from '@/components/director/SceneContextPanel';
import ShotContractPanel from '@/components/director/ShotContractPanel';
import ShotBlockingCanvas from '@/components/director/ShotBlockingCanvas';
import PromptStaleBanner from '@/components/director/PromptStaleBanner';
import PromptDiffModal from '@/components/director/PromptDiffModal';
import SceneReadinessModal from '@/components/director/SceneReadinessModal';
import PrintSceneSheetModal from '@/components/director/PrintSceneSheetModal';

const SHOT_TYPES_CONFIG: Array<{ value: ShotType; label: string }> = [
  { value: 'Extreme Wide Shot', label: '大远景 (Extreme Wide Shot)' },
  { value: 'Wide Shot', label: '远景/全景 (Wide Shot)' },
  { value: 'Medium Wide Shot', label: '中全景 (Medium Wide Shot)' },
  { value: 'Medium Shot', label: '中景 (Medium Shot)' },
  { value: 'Medium Close Up', label: '中近景 (Medium Close Up)' },
  { value: 'Close Up', label: '特写 (Close Up)' },
  { value: 'Extreme Close Up', label: '大特写 (Extreme Close Up)' },
  { value: 'Over The Shoulder', label: '过肩镜头 (Over The Shoulder)' },
  { value: 'POV', label: '主观视角 (POV)' },
  { value: 'Insert', label: '插入特写 (Insert)' },
  { value: 'Two Shot', label: '双人镜头 (Two Shot)' },
  { value: 'Tracking Shot', label: '跟拍镜头 (Tracking Shot)' },
  { value: 'Aerial Shot', label: '俯冲/鸟瞰 (Aerial Shot)' },
  { value: 'Low Angle', label: '仰拍角度 (Low Angle)' },
  { value: 'High Angle', label: '俯拍角度 (High Angle)' },
  { value: 'Dutch Angle', label: '荷兰斜角 (Dutch Angle)' },
];

const CAMERA_MOVEMENTS_CONFIG: Array<{ value: CameraMovement; label: string }> = [
  { value: 'Static', label: '固定机位 (Static)' },
  { value: 'Pan', label: '水平摇镜 (Pan)' },
  { value: 'Tilt', label: '垂直俯仰 (Tilt)' },
  { value: 'Dolly In', label: '轨道推镜 (Dolly In)' },
  { value: 'Dolly Out', label: '轨道拉镜 (Dolly Out)' },
  { value: 'Truck', label: '横移跟拍 (Truck)' },
  { value: 'Arc', label: '弧形环绕 (Arc)' },
  { value: 'Crane', label: '摇臂升降 (Crane)' },
  { value: 'Handheld', label: '手持呼吸感 (Handheld)' },
  { value: 'Steadicam', label: '斯坦尼康稳定跟拍 (Steadicam)' },
  { value: 'Tracking', label: '主体同步追踪 (Tracking)' },
  { value: 'Push In', label: '缓慢推进 (Push In)' },
  { value: 'Pull Back', label: '缓慢拉远 (Pull Back)' },
  { value: 'Orbit', label: '360°环绕 (Orbit)' },
  { value: 'Whip Pan', label: '急速甩镜 (Whip Pan)' },
];

const LENSES_CONFIG: Array<{ value: LensType; label: string }> = [
  { value: '18mm', label: '18mm (超广角视野)' },
  { value: '24mm', label: '24mm (电影级宏大场面)' },
  { value: '28mm', label: '28mm (自然广角透视)' },
  { value: '35mm', label: '35mm (好莱坞经典叙事镜头)' },
  { value: '50mm', label: '50mm (标准人眼透视)' },
  { value: '85mm', label: '85mm (经典肖像浅景深)' },
  { value: '100mm Macro', label: '100mm Macro (微距极细腻局部)' },
  { value: '135mm', label: '135mm (强空间压缩特写)' },
  { value: '200mm', label: '200mm (远距长焦孤立主体)' },
  { value: 'Anamorphic', label: 'Anamorphic (变形宽银幕椭圆光斑)' },
];

const SCREEN_DIRECTIONS_CONFIG: Array<{ value: ScreenDirection; label: string }> = [
  { value: 'Left → Right', label: '左向右 (Left → Right)' },
  { value: 'Right → Left', label: '右向左 (Right → Left)' },
  { value: 'Toward Camera', label: '迎面冲向机位 (Toward Camera)' },
  { value: 'Away From Camera', label: '背向远离机位 (Away From Camera)' },
  { value: 'Static', label: '静止无位移 (Static)' },
];

const CAMERA_SIDES_CONFIG: Array<{ value: CameraSide; label: string }> = [
  { value: 'A', label: 'A面 (Primary Axis)' },
  { value: 'B', label: 'B面 (Opposite Reverse)' },
  { value: 'Neutral', label: '中性正面/俯仰 (Neutral Bridge)' },
];

const EYE_LINES_CONFIG: Array<{ value: EyeLine; label: string }> = [
  { value: 'Camera', label: '直视镜头 (Camera)' },
  { value: 'Screen Left', label: '看画面左侧 (Screen Left)' },
  { value: 'Screen Right', label: '看画面右侧 (Screen Right)' },
  { value: 'Up', label: '仰视 (Up)' },
  { value: 'Down', label: '俯视 (Down)' },
  { value: 'Character A', label: '注视对手 A (Character A)' },
  { value: 'Character B', label: '注视对手 B (Character B)' },
  { value: 'Object', label: '注视道具/焦点物 (Object)' },
];

const PACING_CONFIG: Array<{ value: ShotPacing; label: string }> = [
  { value: 'Very Slow', label: '极慢压抑 (Very Slow)' },
  { value: 'Slow', label: '慢速沉浸 (Slow)' },
  { value: 'Normal', label: '标准叙事 (Normal)' },
  { value: 'Fast', label: '快速凌厉 (Fast)' },
  { value: 'Very Fast', label: '极速风暴 (Very Fast)' },
  { value: 'Impact', label: '强冲击瞬间 (Impact)' },
];

function DirectorRoomContent() {
  const searchParams = useSearchParams();
  const initialSceneId = searchParams.get('sceneId');
  const initialShotId = searchParams.get('shotId');

  const {
    episodes,
    projects,
    activeProjectId,
    characters,
    locations,
    props,
    costumes,
    bibles,
    actionBibles,
    continuityWarnings,
    studioMode,
  } = useStudioStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activeBible = activeProject ? bibles[activeProject.id] : undefined;
  const activeActionBible = activeProject ? actionBibles[activeProject.id] : undefined;

  // Flatten all scenes to easily switch
  const allScenes: Array<{ episodeTitle: string; episodeNumber: number; scene: Scene }> = [];
  episodes.forEach((ep) => {
    ep.scenes?.forEach((sc) => {
      allScenes.push({
        episodeTitle: ep.title,
        episodeNumber: ep.episodeNumber,
        scene: sc,
      });
    });
  });

  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    initialSceneId || allScenes[0]?.scene.id || ''
  );

  const currentItem = allScenes.find((s) => s.scene.id === selectedSceneId) || allScenes[0];
  const currentScene = currentItem?.scene;

  // Selected Shot State
  const [selectedShotId, setSelectedShotId] = useState<string>(
    initialShotId || currentScene?.shots?.[0]?.id || ''
  );

  // Sync selected shot if scene changes
  useEffect(() => {
    if (currentScene?.shots && currentScene.shots.length > 0) {
      if (!currentScene.shots.some((s) => s.id === selectedShotId)) {
        setSelectedShotId(currentScene.shots[0].id);
      }
    } else {
      setSelectedShotId('');
    }
  }, [currentScene, selectedShotId]);

  const selectedShot = currentScene?.shots?.find((s) => s.id === selectedShotId) || currentScene?.shots?.[0];

  // Fullscreen Director Mode
  const [directorMode, setDirectorMode] = useState(false);
  const isDirectorActive = studioMode === 'DIRECTOR' || directorMode;

  // Director Quick Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string } | null>(null);
  const showToast = useCallback((title: string, subtitle?: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => setToastMessage(null), 2500);
  }, []);

  // Autosave status indicator
  const [saveStatus, setSaveStatus] = useState<'SAVED' | 'SAVING'>('SAVED');

  // Script Panel State
  const [scriptCollapsed, setScriptCollapsed] = useState(false);
  const [scriptEditing, setScriptEditing] = useState(false);
  const [scriptContent, setScriptContent] = useState('');
  const [activeScriptVersionTag, setActiveScriptVersionTag] = useState('V1');

  useEffect(() => {
    if (currentScene) {
      setScriptContent(currentScene.scriptExcerpt || '');
      if (currentScene.scriptVersions && currentScene.scriptVersions.length > 0) {
        const active = currentScene.scriptVersions.find(v => v.id === currentScene.activeScriptVersionId);
        setActiveScriptVersionTag(active ? active.versionTag : currentScene.scriptVersions[currentScene.scriptVersions.length - 1].versionTag);
      }
    }
  }, [currentScene]);

  // Director's Intention State
  const [intentionState, setIntentionState] = useState<Partial<Scene>>({});
  const [intentionExpanded, setIntentionExpanded] = useState(false);

  useEffect(() => {
    if (currentScene) {
      setIntentionState(currentScene);
    }
  }, [currentScene]);

  // Shot Editor Form State
  const [shotForm, setShotForm] = useState<Partial<Shot>>({});

  useEffect(() => {
    if (selectedShot) {
      setShotForm(selectedShot);
    }
  }, [selectedShot]);

  // Debounced Autosave for Shot Form and Intention Form
  const saveShotDebounced = useCallback((updates: Partial<Shot>) => {
    if (!selectedShot) return;
    setSaveStatus('SAVING');
    studioStore.updateShot(selectedShot.id, updates);
    setTimeout(() => setSaveStatus('SAVED'), 600);
  }, [selectedShot]);

  const saveIntentionDebounced = useCallback((updates: Partial<Scene>) => {
    if (!currentScene) return;
    setSaveStatus('SAVING');
    studioStore.updateScene(currentScene.id, updates);
    setTimeout(() => setSaveStatus('SAVED'), 600);
  }, [currentScene]);

  // Quick Add Shot Modal State
  const [quickAddModal, setQuickAddModal] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState<{
    shotType: ShotType;
    duration: string;
    action: string;
  }>({
    shotType: 'Medium Shot',
    duration: '3s',
    action: '',
  });

  // Reference Pack Modal State
  const [referencePackModal, setReferencePackModal] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Scene Review Modal State
  const [sceneReviewModal, setSceneReviewModal] = useState(false);
  const [activeReviewTakeIndex, setActiveReviewTakeIndex] = useState(0);

  // AI Discussion with Director Modal
  const [aiDiscussionModal, setAiDiscussionModal] = useState(false);
  const [copiedDirectorPrompt, setCopiedDirectorPrompt] = useState(false);
  const [aiAnalysisInput, setAiAnalysisInput] = useState('');
  const [analysisResultNotice, setAnalysisResultNotice] = useState<string | null>(null);

  // Fullscreen Image Preview
  const [previewImageModal, setPreviewImageModal] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: '',
  });

  // Video Prompt Modal State
  const [promptModal, setPromptModal] = useState<{
    open: boolean;
    activeTab: 'MASTER' | 'GOOGLE_FLOW' | 'DREAMINA' | 'AVOID';
    masterPrompt: string;
    googleFlowPrompt: string;
    dreaminaPrompt: string;
    avoidPrompt: string;
    copiedType: string | null;
    lengthMode: PromptLengthMode;
  }>({
    open: false,
    activeTab: 'MASTER',
    masterPrompt: '',
    googleFlowPrompt: '',
    dreaminaPrompt: '',
    avoidPrompt: '',
    copiedType: null,
    lengthMode: 'Standard',
  });

  // Intelligence Modals State
  const [sceneReadinessModalOpen, setSceneReadinessModalOpen] = useState(false);
  const [printSheetModalOpen, setPrintSheetModalOpen] = useState(false);
  const [promptDiffModalOpen, setPromptDiffModalOpen] = useState(false);

  // Take Upload Modal State
  const [takeModalOpen, setTakeModalOpen] = useState(false);
  const [takeForm, setTakeForm] = useState<{ videoUrl: string; notes: string; status: TakeStatus }>({
    videoUrl: '',
    notes: '',
    status: 'REVIEW',
  });

  // Calculate Scene Total Duration from Shots
  const totalSceneDurationSeconds = useMemo(() => {
    if (!currentScene?.shots) return 0;
    return currentScene.shots.reduce((acc, s) => {
      const match = s.duration?.match(/\d+/);
      return acc + (match ? parseInt(match[0], 10) : 3);
    }, 0);
  }, [currentScene]);

  // Continuity Warnings for this scene
  const sceneWarnings = useMemo(() => {
    if (!currentScene) return [];
    return continuityWarnings.filter(w => w.sceneId === currentScene.id && w.status === 'ACTIVE');
  }, [continuityWarnings, currentScene]);

  // Scene Completion Evaluation
  const sceneCompletionChecks = useMemo(() => {
    if (!currentScene) return { script: false, director: false, shots: false, prompts: false, takes: false, noCritical: true, allComplete: false };
    const hasScript = Boolean(currentScene.scriptExcerpt && currentScene.scriptExcerpt.trim().length > 0);
    const hasDirector = Boolean(currentScene.directorScenePurpose || currentScene.directorVisualStrategy);
    const hasShots = Boolean(currentScene.shots && currentScene.shots.length > 0 && currentScene.shots.every(s => s.action || s.framing));
    const hasPrompts = Boolean(currentScene.shots && currentScene.shots.length > 0 && currentScene.shots.every(s => s.isPromptLocked || (s.prompts && s.prompts.length > 0)));
    const hasTakes = Boolean(currentScene.shots && currentScene.shots.length > 0 && currentScene.shots.every(s => s.selectedTakeId));
    const noCritical = !sceneWarnings.some(w => w.severity === 'CRITICAL');
    const allComplete = hasScript && hasDirector && hasShots && hasPrompts && hasTakes && noCritical;
    return {
      script: hasScript,
      director: hasDirector,
      shots: hasShots,
      prompts: hasPrompts,
      takes: hasTakes,
      noCritical,
      allComplete,
    };
  }, [currentScene, sceneWarnings]);

  const handleOpenPromptModal = useCallback((shot: Shot, lengthMode: PromptLengthMode = 'Standard') => {
    if (!currentScene || !activeProject) return;

    const assignedChars = characters.filter((c) =>
      currentScene.characters.some((tc) => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id)
    );
    const assignedLocs = locations.filter(
      (l) => currentScene.locationName?.toLowerCase() === l.name.toLowerCase() || currentScene.locationName === l.id
    );
    const assignedPrs = props.filter((p) =>
      currentScene.props.some((tp) => tp.toLowerCase() === p.name.toLowerCase() || tp === p.id)
    );
    const assignedCos = costumes.filter((cos) =>
      currentScene.costumes.some((tc) => tc.toLowerCase() === cos.name.toLowerCase() || tc === cos.id)
    );

    const shotIdx = currentScene.shots?.findIndex((s) => s.id === shot.id) ?? -1;
    const previousShot = shotIdx > 0 && currentScene.shots ? currentScene.shots[shotIdx - 1] : undefined;
    const nextShot =
      shotIdx !== -1 && currentScene.shots && shotIdx < currentScene.shots.length - 1
        ? currentScene.shots[shotIdx + 1]
        : undefined;

    const generated = generateShotPrompts({
      project: activeProject,
      bible: activeBible,
      actionBible: activeActionBible,
      scene: currentScene,
      shot,
      previousShot,
      nextShot,
      assignedCharacters: assignedChars,
      assignedLocations: assignedLocs,
      assignedProps: assignedPrs,
      assignedCostumes: assignedCos,
      lengthMode,
    });

    setPromptModal({
      open: true,
      activeTab: 'MASTER',
      masterPrompt: generated.masterPrompt,
      googleFlowPrompt: generated.googleFlowPrompt,
      dreaminaPrompt: generated.dreaminaPrompt,
      avoidPrompt: generated.avoidPrompt,
      copiedType: null,
      lengthMode,
    });
  }, [currentScene, activeProject, characters, locations, props, costumes, activeBible, activeActionBible]);

  const handleQuickCopyPrompt = useCallback(
    (shot: Shot, platform: 'GOOGLE_FLOW' | 'DREAMINA' | 'MASTER') => {
      if (!currentScene || !activeProject) return;

      const assignedChars = characters.filter((c) =>
        currentScene.characters.some((tc) => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id)
      );
      const assignedLocs = locations.filter(
        (l) => currentScene.locationName?.toLowerCase() === l.name.toLowerCase() || currentScene.locationName === l.id
      );
      const assignedPrs = props.filter((p) =>
        currentScene.props.some((tp) => tp.toLowerCase() === p.name.toLowerCase() || tp === p.id)
      );
      const assignedCos = costumes.filter((cos) =>
        currentScene.costumes.some((tc) => tc.toLowerCase() === cos.name.toLowerCase() || tc === cos.id)
      );

      const shotIdx = currentScene.shots?.findIndex((s) => s.id === shot.id) ?? -1;
      const previousShot = shotIdx > 0 && currentScene.shots ? currentScene.shots[shotIdx - 1] : undefined;
      const nextShot =
        shotIdx !== -1 && currentScene.shots && shotIdx < currentScene.shots.length - 1
          ? currentScene.shots[shotIdx + 1]
          : undefined;

      const generated = generateShotPrompts({
        project: activeProject,
        bible: activeBible,
        actionBible: activeActionBible,
        scene: currentScene,
        shot,
        previousShot,
        nextShot,
        assignedCharacters: assignedChars,
        assignedLocations: assignedLocs,
        assignedProps: assignedPrs,
        assignedCostumes: assignedCos,
        lengthMode: promptModal.lengthMode || 'Standard',
      });

      const textToCopy =
        platform === 'GOOGLE_FLOW'
          ? generated.googleFlowPrompt
          : platform === 'DREAMINA'
          ? generated.dreaminaPrompt
          : generated.masterPrompt;

      navigator.clipboard.writeText(textToCopy);
      const label =
        platform === 'GOOGLE_FLOW' ? 'Google Flow' : platform === 'DREAMINA' ? 'Dreamina' : 'Master Prompt';
      showToast(`已复制 SHOT #${shot.shotNumber} [${label}] 提示词`, '已存入剪贴板，可直接在 AI 视频工具中粘贴生成');
    },
    [
      currentScene,
      activeProject,
      characters,
      locations,
      props,
      costumes,
      activeBible,
      activeActionBible,
      promptModal.lengthMode,
      showToast,
    ]
  );

  // Keyboard Shortcuts Handler (Hollywood Fast Keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when inside input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        const nextMode = !isDirectorActive;
        studioStore.setStudioMode(nextMode ? 'DIRECTOR' : 'NORMAL');
        setDirectorMode(nextMode);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setQuickAddModal(true);
      } else if (e.key === '1' || e.key === 'f' || e.key === 'F') {
        if (selectedShot) {
          e.preventDefault();
          handleQuickCopyPrompt(selectedShot, 'GOOGLE_FLOW');
        }
      } else if (e.key === '2' || e.key === 'm' || e.key === 'M') {
        if (selectedShot) {
          e.preventDefault();
          handleQuickCopyPrompt(selectedShot, 'DREAMINA');
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setActiveReviewTakeIndex(0);
        setSceneReviewModal(true);
      } else if (e.key === 'Escape') {
        setQuickAddModal(false);
        setReferencePackModal(false);
        setSceneReviewModal(false);
        setAiDiscussionModal(false);
        setPreviewImageModal((prev) => ({ ...prev, open: false }));
        setPromptModal((prev) => ({ ...prev, open: false }));
        setTakeModalOpen(false);
      } else if (e.key === 'p' || e.key === 'P') {
        if (selectedShot) {
          e.preventDefault();
          handleOpenPromptModal(selectedShot);
        }
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        if (currentScene?.shots && currentScene.shots.length > 0) {
          const idx = currentScene.shots.findIndex((s) => s.id === selectedShotId);
          if (idx < currentScene.shots.length - 1) {
            setSelectedShotId(currentScene.shots[idx + 1].id);
          }
        }
      } else if (e.key === 'ArrowLeft' || e.key === '[') {
        if (currentScene?.shots && currentScene.shots.length > 0) {
          const idx = currentScene.shots.findIndex((s) => s.id === selectedShotId);
          if (idx > 0) {
            setSelectedShotId(currentScene.shots[idx - 1].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShot, currentScene, selectedShotId, isDirectorActive, handleQuickCopyPrompt]);

  // Handlers
  const handleSaveScript = () => {
    if (!currentScene) return;
    studioStore.addSceneScriptVersion(currentScene.id, scriptContent, `手动修订 (${activeScriptVersionTag})`);
    setScriptEditing(false);
  };

  const handleQuickAddShot = () => {
    if (!currentScene) return;
    const count = (currentScene.shots?.length || 0) + 1;
    const newShot = studioStore.addShot(currentScene.id, {
      shotNumber: count,
      shotType: quickAddForm.shotType,
      framing: 'Rule of thirds',
      cameraAngle: 'Eye-level',
      lens: '35mm',
      cameraMovement: 'Static',
      cameraSpeed: 'steady',
      screenDirection: 'Left → Right',
      cameraSide: 'A',
      eyeLine: 'Screen Right',
      pacing: 'Normal',
      transitionIn: 'Cut',
      transitionOut: 'Cut',
      subject: `${currentScene.characters[0] || 'Lead Character'} in action`,
      action: quickAddForm.action || 'Characters move and engage inside the environment.',
      performance: 'Focused and intense.',
      blocking: 'Cinematic composition.',
      environment: currentScene.locationName,
      lighting: 'Chiaroscuro contrast.',
      atmosphere: 'Cinematic atmospheric haze.',
      composition: 'Rule of thirds.',
      depth: 'Deep staging.',
      visualEffects: 'None',
      transition: 'Cut',
      duration: quickAddForm.duration || '3s',
      sortOrder: count,
    });
    setQuickAddModal(false);
    setQuickAddForm({ shotType: 'Medium Shot', duration: '3s', action: '' });
    setSelectedShotId(newShot.id);
  };

  const handleMoveShot = (index: number, direction: 'UP' | 'DOWN') => {
    if (!currentScene?.shots) return;
    const shots = [...currentScene.shots];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= shots.length) return;

    const temp = shots[index];
    shots[index] = shots[targetIndex];
    shots[targetIndex] = temp;

    studioStore.reorderShots(currentScene.id, shots);
  };

  const handleCopyDirectorPrompt = () => {
    if (!currentScene || !activeProject) return;
    const prompt = manualAI.generateSceneAnalysisPrompt({
      project: activeProject,
      bible: activeBible,
      scene: currentScene,
      characters: currentScene.characters,
      location: currentScene.locationName,
      props: currentScene.props,
      costumes: currentScene.costumes,
      currentDirectorNotes: currentScene.directorNotes,
      scriptExcerpt: currentScene.scriptExcerpt,
    });
    navigator.clipboard.writeText(prompt);
    setCopiedDirectorPrompt(true);
    setTimeout(() => setCopiedDirectorPrompt(false), 2500);
  };

  const handleApplyAiAnalysis = (mode: 'REPLACE' | 'MERGE') => {
    const res = manualAI.parseDirectorAnalysisJson(aiAnalysisInput);
    if (!res.success || !res.data) {
      setAnalysisResultNotice('AI 分析结果解析失败，请检查是否返回标准 JSON。');
      return;
    }

    const data = res.data;
    if (data.director_intention) {
      const updates: Partial<Scene> = {
        directorScenePurpose:
          mode === 'REPLACE' || !currentScene?.directorScenePurpose
            ? data.director_intention.scene_purpose
            : currentScene.directorScenePurpose,
        directorEmotionalArc:
          mode === 'REPLACE' || !currentScene?.directorEmotionalArc
            ? data.director_intention.emotional_arc
            : currentScene.directorEmotionalArc,
        directorAudienceExperience:
          mode === 'REPLACE' || !currentScene?.directorAudienceExperience
            ? data.director_intention.audience_experience
            : currentScene.directorAudienceExperience,
        directorPacing:
          mode === 'REPLACE' || !currentScene?.directorPacing
            ? data.director_intention.pacing
            : currentScene.directorPacing,
        directorVisualStrategy:
          mode === 'REPLACE' || !currentScene?.directorVisualStrategy
            ? data.director_intention.visual_strategy
            : currentScene.directorVisualStrategy,
        directorPerformanceDirection:
          mode === 'REPLACE' || !currentScene?.directorPerformanceDirection
            ? data.director_intention.performance_direction
            : currentScene.directorPerformanceDirection,
        directorCameraStrategy:
          mode === 'REPLACE' || !currentScene?.directorCameraStrategy
            ? data.director_intention.camera_strategy
            : currentScene.directorCameraStrategy,
        directorLightingStrategy:
          mode === 'REPLACE' || !currentScene?.directorLightingStrategy
            ? data.director_intention.lighting_strategy
            : currentScene.directorLightingStrategy,
        directorTransition:
          mode === 'REPLACE' || !currentScene?.directorTransition
            ? data.director_intention.transition
            : currentScene.directorTransition,
      };

      studioStore.updateScene(currentScene!.id, updates);
      setIntentionState((prev) => ({ ...prev, ...updates }));
    }

    setAnalysisResultNotice('已成功合并 AI 导演深度分析！');
    setTimeout(() => {
      setAiDiscussionModal(false);
      setAnalysisResultNotice(null);
      setAiAnalysisInput('');
    }, 1500);
  };

  const handleSavePromptVersion = (shotId: string) => {
    if (!selectedShot) return;
    const versionNumber = (selectedShot.prompts?.length || 0) + 1;
    const versionTag = `V${versionNumber}`;
    studioStore.saveShotContextSnapshot(shotId, versionTag, {
      universal: promptModal.masterPrompt,
      googleFlow: promptModal.googleFlowPrompt,
      dreamina: promptModal.dreaminaPrompt,
      changeReason: `Director refined prompt (${promptModal.lengthMode} length mode)`,
      lengthMode: promptModal.lengthMode,
    });
  };

  const handleCopyPromptText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setPromptModal((prev) => ({ ...prev, copiedType: type }));
    setTimeout(() => {
      setPromptModal((prev) => ({ ...prev, copiedType: null }));
    }, 2000);
  };

  const handleLockPrompt = (shotId: string) => {
    if (!selectedShot) return;
    if (selectedShot.isPromptLocked) {
      studioStore.unlockShotPrompt(shotId);
    } else {
      studioStore.lockShotPrompt(shotId);
    }
  };

  // Build Reference Pack Items for current selected shot
  const referencePackItems = useMemo(() => {
    if (!selectedShot || !currentScene) return [];
    const items: Array<{ title: string; type: string; imageUrl?: string; notes: string; filename: string }> = [];

    // 1. Character Master
    const heroChar = characters.find(c => currentScene.characters.some(tc => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id));
    if (heroChar) {
      const lockedVer = heroChar.versions.find(v => v.id === heroChar.lockedVersionId) || heroChar.versions.find(v => v.status === 'LOCKED');
      items.push({
        title: `Character Master: ${heroChar.name}`,
        type: 'CHARACTER MASTER',
        imageUrl: lockedVer?.referenceImageUrl,
        notes: `已锁定主角主参考 (${lockedVer?.versionTag || 'Canonical'})`,
        filename: `01_CHARACTER_${heroChar.name.replace(/\s+/g, '_')}.jpg`,
      });

      // 2. Character State
      const sceneState = currentScene.characterStates?.find(cs => cs.characterId === heroChar.id);
      const stateObj = heroChar.states?.find(s => s.id === sceneState?.stateId || s.name === sceneState?.stateId);
      items.push({
        title: `Character State: ${stateObj?.name || 'NORMAL'}`,
        type: 'CHARACTER STATE',
        imageUrl: stateObj?.referenceImageUrl || lockedVer?.referenceImageUrl,
        notes: stateObj ? `${stateObj.description} - ${stateObj.faceCondition || ''}` : '完好潜行状态',
        filename: `02_CHARACTER_STATE_${stateObj?.name || 'NORMAL'}.jpg`,
      });
    }

    // 3. Costume
    const heroCos = costumes.find(c => currentScene.costumes.some(tc => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id));
    if (heroCos) {
      const lockedVer = heroCos.versions.find(v => v.id === heroCos.lockedVersionId) || heroCos.versions.find(v => v.status === 'LOCKED');
      items.push({
        title: `Costume: ${heroCos.name}`,
        type: 'COSTUME',
        imageUrl: lockedVer?.referenceImageUrl,
        notes: `${heroCos.color} ${heroCos.material} (${heroCos.condition})`,
        filename: `03_COSTUME_${heroCos.name.replace(/\s+/g, '_')}.jpg`,
      });
    }

    // 4. Location Master
    const heroLoc = locations.find(l => currentScene.locationName?.toLowerCase() === l.name.toLowerCase() || currentScene.locationName === l.id);
    if (heroLoc) {
      const lockedVer = heroLoc.versions.find(v => v.id === heroLoc.lockedVersionId) || heroLoc.versions.find(v => v.status === 'LOCKED');
      items.push({
        title: `Location: ${heroLoc.name}`,
        type: 'LOCATION MASTER',
        imageUrl: lockedVer?.referenceImageUrl,
        notes: `${heroLoc.architecture} - ${heroLoc.time}`,
        filename: `04_LOCATION_${heroLoc.name.replace(/\s+/g, '_')}.jpg`,
      });
    }

    // 5. Hero Prop
    const heroProp = props.find(p => currentScene.props.some(tp => tp.toLowerCase() === p.name.toLowerCase() || tp === p.id));
    if (heroProp) {
      const lockedVer = heroProp.versions.find(v => v.id === heroProp.lockedVersionId) || heroProp.versions.find(v => v.status === 'LOCKED');
      const propCond = currentScene.propConditions?.find(pc => pc.propId === heroProp.id)?.condition || 'NEW';
      items.push({
        title: `Prop: ${heroProp.name} [${propCond}]`,
        type: 'PROP MASTER',
        imageUrl: lockedVer?.referenceImageUrl,
        notes: `${heroProp.material}, ${heroProp.color}. 状态: ${propCond}`,
        filename: `05_PROP_${heroProp.name.replace(/\s+/g, '_')}.jpg`,
      });
    }

    // 6. Previous Shot Reference
    const shotIdx = currentScene.shots?.findIndex(s => s.id === selectedShot.id) ?? -1;
    if (shotIdx > 0 && currentScene.shots) {
      const prev = currentScene.shots[shotIdx - 1];
      items.push({
        title: `Previous Shot: #${prev.shotNumber}`,
        type: 'PREVIOUS SHOT',
        imageUrl: prev.storyboardImageUrl,
        notes: `Shot #${prev.shotNumber} (${prev.shotType}, ${prev.cameraMovement})`,
        filename: `06_PREVIOUS_SHOT_${prev.shotNumber}.jpg`,
      });
    }

    // 7. Current Storyboard
    items.push({
      title: `Current Storyboard: #${selectedShot.shotNumber}`,
      type: 'CURRENT STORYBOARD',
      imageUrl: selectedShot.storyboardImageUrl,
      notes: `${selectedShot.shotType} - ${selectedShot.action}`,
      filename: `07_STORYBOARD_${selectedShot.shotNumber}.jpg`,
    });

    return items;
  }, [selectedShot, currentScene, characters, costumes, locations, props]);

  const handleDownloadReferencePack = async () => {
    if (!selectedShot) return;
    setDownloadingZip(true);
    try {
      const folderName = `SHOT_${String(selectedShot.shotNumber).padStart(2, '0')}_REFERENCE_PACK`;
      const filesToZip: Array<{ filename: string; textContent?: string; dataUrl?: string }> = [];

      // Add shot info text summary
      filesToZip.push({
        filename: 'SHOT_DIRECTOR_SPEC.txt',
        textContent: `R.ON DRAMA STUDIO - SHOT REFERENCE PACK\n` +
          `Project: ${activeProject?.name}\n` +
          `Scene: SC${currentScene?.sceneNumber} - ${currentScene?.sceneTitle}\n` +
          `Shot: #${selectedShot.shotNumber} (${selectedShot.shotType})\n` +
          `Lens: ${selectedShot.lens}\n` +
          `Movement: ${selectedShot.cameraMovement}\n` +
          `Screen Direction: ${selectedShot.screenDirection || 'Unspecified'}\n` +
          `Eye Line: ${selectedShot.eyeLine || 'Unspecified'}\n` +
          `Action: ${selectedShot.action}\n` +
          `Duration: ${selectedShot.duration}\n` +
          `Generated At: ${new Date().toISOString()}\n`,
      });

      // Add image entries
      for (const item of referencePackItems) {
        if (item.imageUrl) {
          filesToZip.push({
            filename: item.filename,
            dataUrl: item.imageUrl,
          });
        } else {
          filesToZip.push({
            filename: `${item.filename}.notes.txt`,
            textContent: `[NO IMAGE AVAILABLE]\nType: ${item.type}\nTitle: ${item.title}\nNotes: ${item.notes}`,
          });
        }
      }

      await downloadReferencePackZip(folderName, filesToZip);
    } catch (err) {
      console.error('Failed to download zip', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  // Check 180° axis break on the current shot
  const axisBreakWarning = useMemo(() => {
    if (!currentScene?.shots || !selectedShot) return null;
    const idx = currentScene.shots.findIndex(s => s.id === selectedShot.id);
    if (idx > 0) {
      const prev = currentScene.shots[idx - 1];
      const prevDir = prev.screenDirection;
      const currDir = selectedShot.screenDirection;
      if (prevDir && currDir) {
        const isReversed = (prevDir === 'Left → Right' && currDir === 'Right → Left') ||
                          (prevDir === 'Right → Left' && currDir === 'Left → Right');
        const hasNeutral = prev.cameraSide === 'Neutral' || selectedShot.cameraSide === 'Neutral';
        if (isReversed && !hasNeutral) {
          return `可能越轴 (Axis Break): 前一分镜为「${prevDir}」，当前分镜为「${currDir}」，且无中性机位缓冲。`;
        }
      }
    }
    return null;
  }, [currentScene, selectedShot]);

  if (!activeProject || !currentScene) {
    return (
      <div className="p-12 text-center text-studio-400">
        <p>未找到当前项目或场次数据。</p>
        <Link href="/episodes" className="mt-4 inline-block text-gold-400 underline">
          返回剧集列表
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pb-24 transition-all duration-300 ${directorMode ? 'max-w-full px-4' : 'max-w-7xl mx-auto'}`}>
      {/* 1. SCENE HEADER & WORKSPACE NAVIGATION */}
      <div className="bg-studio-900/90 border border-studio-800 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-studio-400 uppercase tracking-wider mb-1">
              <Link href="/" className="hover:text-gold-400 transition-colors">
                {activeProject.name}
              </Link>
              <span>/</span>
              <Link href="/episodes" className="hover:text-gold-400 transition-colors">
                EP{String(currentItem.episodeNumber).padStart(2, '0')}
              </Link>
              <span>/</span>
              <span className="text-gold-400 font-semibold">
                SC{String(currentScene.sceneNumber).padStart(2, '0')}
              </span>
            </div>

            {/* Title & Quick Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-studio-100 tracking-tight">
                {currentScene.sceneTitle}
              </h1>

              <select
                value={selectedSceneId}
                onChange={(e) => setSelectedSceneId(e.target.value)}
                className="bg-studio-800 border border-studio-700 text-xs font-mono text-studio-200 rounded px-2.5 py-1 focus:outline-none focus:border-gold-500"
              >
                {allScenes.map((item) => (
                  <option key={item.scene.id} value={item.scene.id}>
                    EP{String(item.episodeNumber).padStart(2, '0')} SC{String(item.scene.sceneNumber).padStart(2, '0')}: {item.scene.sceneTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Action Badges & Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            {/* Autosave Status */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border ${
              saveStatus === 'SAVED'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : 'bg-amber-950/40 text-amber-400 border-amber-800/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'SAVED' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              {saveStatus === 'SAVED' ? '已自动保存' : '保存中...'}
            </span>

            {/* Total Duration & Shots */}
            <span className="bg-studio-800 text-studio-300 px-3 py-1 rounded border border-studio-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              {totalSceneDurationSeconds}s ({currentScene.shots?.length || 0} Shots)
            </span>

            {/* Continuity Warning Badge */}
            {sceneWarnings.length > 0 ? (
              <span className="bg-amber-950/60 text-amber-300 px-3 py-1 rounded border border-amber-700/60 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                ⚠ {sceneWarnings.length} 连贯性警报
              </span>
            ) : (
              <span className="bg-emerald-950/40 text-emerald-400 px-3 py-1 rounded border border-emerald-800/40 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                连贯性正常
              </span>
            )}

            {/* Action Stunt Bible Active Skills Pill */}
            {activeActionBible?.selectedSkills && activeActionBible.selectedSkills.length > 0 && (
              <Link
                href={`/projects/${activeProject.id}`}
                className="bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 border border-amber-600/40 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                title="查看本项目激活的动作流派与招牌连招库 (前往配置)"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  武指: {activeActionBible.selectedSkills.length}项流派 ({activeActionBible.stuntCombos?.length || 0}套连招)
                </span>
              </Link>
            )}

            {/* Scene Readiness Checklist Modal Button */}
            <button
              onClick={() => setSceneReadinessModalOpen(true)}
              className="bg-studio-800 hover:bg-studio-700 text-gold-400 border border-gold-500/40 px-3 py-1 rounded flex items-center gap-1.5 transition-all text-xs font-mono font-semibold"
              title="查看当前场次 10 项工业就绪检查"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              就绪检查 (READINESS)
            </button>

            {/* Print Scene Sheet Button */}
            <button
              onClick={() => setPrintSheetModalOpen(true)}
              className="bg-studio-800 hover:bg-studio-700 text-studio-300 border border-studio-700 px-3 py-1 rounded flex items-center gap-1.5 transition-all text-xs font-mono"
              title="生成并打印导演现场拍摄单"
            >
              <FileText className="w-3.5 h-3.5 text-gold-400" />
              打印拍摄单 (PRINT)
            </button>

            {/* Play Scene Button */}
            <button
              onClick={() => {
                setActiveReviewTakeIndex(0);
                setSceneReviewModal(true);
              }}
              className="bg-gold-500 hover:bg-gold-400 text-studio-950 font-sans font-semibold px-3 py-1 rounded flex items-center gap-1.5 transition-all shadow-md shadow-gold-500/10"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              播放整场 (PLAY SCENE)
            </button>

            {/* Director Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = !isDirectorActive;
                studioStore.setStudioMode(nextMode ? 'DIRECTOR' : 'NORMAL');
                setDirectorMode(nextMode);
              }}
              title="切换导演全屏专注模式 (快捷键: D)"
              className={`px-2.5 py-1 rounded border transition-all flex items-center gap-1.5 text-xs font-mono font-bold ${
                isDirectorActive
                  ? 'bg-gold-500 text-studio-950 border-gold-400 shadow-md shadow-gold-500/20'
                  : 'bg-studio-800 text-studio-400 border-studio-700 hover:text-gold-400'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>{isDirectorActive ? '导演模式 ON' : '导演模式 (D)'}</span>
            </button>
          </div>
        </div>

        {/* 2. VISUAL SCENE STATUS PROGRESS BAR */}
        <div className="mt-4 pt-3 border-t border-studio-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
            {/* Step 1: SCRIPT */}
            <div className={`flex items-center gap-1.5 ${sceneCompletionChecks.script ? 'text-emerald-400 font-semibold' : 'text-studio-500'}`}>
              <span>{sceneCompletionChecks.script ? '✓' : '○'}</span>
              <span>SCRIPT</span>
            </div>
            <span className="text-studio-700">›</span>

            {/* Step 2: DIRECTOR */}
            <div className={`flex items-center gap-1.5 ${sceneCompletionChecks.director ? 'text-emerald-400 font-semibold' : 'text-studio-500'}`}>
              <span>{sceneCompletionChecks.director ? '✓' : '○'}</span>
              <span>DIRECTOR</span>
            </div>
            <span className="text-studio-700">›</span>

            {/* Step 3: SHOT DESIGN */}
            <div className={`flex items-center gap-1.5 ${sceneCompletionChecks.shots ? 'text-emerald-400 font-semibold' : 'text-studio-500'}`}>
              <span>{sceneCompletionChecks.shots ? '✓' : '○'}</span>
              <span>SHOT DESIGN</span>
            </div>
            <span className="text-studio-700">›</span>

            {/* Step 4: PROMPT */}
            <div className={`flex items-center gap-1.5 ${sceneCompletionChecks.prompts ? 'text-emerald-400 font-semibold' : 'text-studio-500'}`}>
              <span>{sceneCompletionChecks.prompts ? '✓' : '○'}</span>
              <span>PROMPT</span>
            </div>
            <span className="text-studio-700">›</span>

            {/* Step 5: VIDEO */}
            <div className={`flex items-center gap-1.5 ${sceneCompletionChecks.takes ? 'text-emerald-400 font-semibold' : 'text-gold-400 font-semibold'}`}>
              <span>{sceneCompletionChecks.takes ? '✓' : '●'}</span>
              <span>VIDEO</span>
            </div>
            <span className="text-studio-700">›</span>

            {/* Step 6: FINAL */}
            <div className={`flex items-center gap-1.5 ${sceneCompletionChecks.allComplete ? 'text-emerald-400 font-bold' : 'text-studio-600'}`}>
              <span>{sceneCompletionChecks.allComplete ? '✓' : '○'}</span>
              <span>FINAL</span>
            </div>
          </div>

          {/* Scene Complete Badge */}
          {sceneCompletionChecks.allComplete && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-gold-500/20 text-gold-400 border border-gold-500/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
              SCENE COMPLETE
            </span>
          )}
        </div>
      </div>

      {/* 2.5 SCENE CONTEXT & STORY EVENT CONTINUITY PANEL */}
      <div className="mb-6">
        <SceneContextPanel scene={currentScene} />
      </div>

      {/* 3. MAIN WORKSPACE SPLIT: LEFT SCRIPT PANEL & RIGHT SCENE MOODBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: SCRIPT PANEL (Collapsible) */}
        <div className={`transition-all duration-300 ${scriptCollapsed ? 'lg:col-span-1' : 'lg:col-span-4'}`}>
          <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 shadow-xl flex flex-col h-full min-h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-studio-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold-400" />
                {!scriptCollapsed && (
                  <span className="text-xs font-mono font-bold text-studio-200 uppercase tracking-wider">
                    SCRIPT 原文
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!scriptCollapsed && (
                  <>
                    <span className="text-[10px] font-mono bg-studio-800 text-gold-400 px-2 py-0.5 rounded border border-studio-700">
                      {activeScriptVersionTag}
                    </span>
                    <button
                      onClick={() => setScriptEditing(prev => !prev)}
                      className="text-xs text-studio-400 hover:text-studio-200 underline"
                    >
                      {scriptEditing ? '取消' : '编辑'}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setScriptCollapsed(prev => !prev)}
                  className="p-1 rounded text-studio-500 hover:text-studio-300 hover:bg-studio-800"
                  title={scriptCollapsed ? '展开剧本' : '折叠剧本'}
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${scriptCollapsed ? '' : 'rotate-180'}`} />
                </button>
              </div>
            </div>

            {!scriptCollapsed ? (
              <div className="mt-3 flex-1 flex flex-col">
                {scriptEditing ? (
                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      value={scriptContent}
                      onChange={(e) => setScriptContent(e.target.value)}
                      className="flex-1 w-full bg-studio-950 border border-studio-700 rounded p-3 text-xs font-mono text-studio-200 leading-relaxed resize-none focus:outline-none focus:border-gold-500 min-h-[260px]"
                      placeholder="在此处输入或修订当前场次的影视剧本原文..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSaveScript}
                        className="bg-gold-500 hover:bg-gold-400 text-studio-950 text-xs font-semibold px-3 py-1 rounded transition-colors"
                      >
                        保存剧本 (SAVE SCRIPT)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 text-xs font-serif text-studio-300 leading-relaxed whitespace-pre-wrap selection:bg-gold-500/30">
                    {currentScene.scriptExcerpt || (
                      <span className="italic text-studio-500">
                        暂无该场次独立剧本摘录。点击上方“编辑”按钮添加。
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 flex-1 flex items-center justify-center">
                <span className="[writing-mode:vertical-lr] text-xs font-mono text-studio-500 tracking-widest uppercase">
                  SCRIPT PANEL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SCENE MOODBOARD (Cinematic Concept Layout) */}
        <div className={`transition-all duration-300 ${scriptCollapsed ? 'lg:col-span-11' : 'lg:col-span-8'}`}>
          <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-studio-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-mono font-bold text-studio-200 uppercase tracking-wider">
                  SCENE MOODBOARD 视听情绪板
                </span>
              </div>
              <span className="text-[11px] font-mono text-studio-400">
                已自动关联资产库已锁定主参考 (Auto-Linked Master References)
              </span>
            </div>

            {/* Moodboard Visual Cards Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* 1. Hero Character Card */}
              {characters.filter(c => currentScene.characters.some(tc => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id)).map(char => {
                const lockedVer = char.versions.find(v => v.id === char.lockedVersionId) || char.versions.find(v => v.status === 'LOCKED');
                const sceneState = currentScene.characterStates?.find(cs => cs.characterId === char.id);
                return (
                  <div
                    key={char.id}
                    className="group relative bg-studio-950 border border-studio-800 rounded-lg overflow-hidden flex flex-col hover:border-gold-500/50 transition-all cursor-pointer"
                    onClick={() => lockedVer?.referenceImageUrl && setPreviewImageModal({ open: true, url: lockedVer.referenceImageUrl, title: `${char.name} [LOCKED]` })}
                  >
                    <div className="h-32 w-full bg-studio-900 flex items-center justify-center overflow-hidden relative">
                      {lockedVer?.referenceImageUrl ? (
                        <img
                          src={lockedVer.referenceImageUrl}
                          alt={char.name}
                          className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-studio-600 gap-1">
                          <Eye className="w-6 h-6" />
                          <span className="text-[10px] font-mono">NO MASTER IMAGE</span>
                        </div>
                      )}
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-studio-950/80 text-gold-400 border border-gold-500/40 px-1.5 py-0.5 rounded">
                        HERO CHARACTER
                      </span>
                    </div>
                    <div className="p-2 bg-studio-900/60 border-t border-studio-800">
                      <div className="text-xs font-semibold text-studio-200 truncate">{char.name}</div>
                      <div className="text-[10px] font-mono text-studio-400 truncate mt-0.5">
                        状态: <span className="text-gold-400 font-bold">{sceneState?.stateId || 'NORMAL'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 2. Hero Location Card */}
              {locations.filter(l => currentScene.locationName?.toLowerCase() === l.name.toLowerCase() || currentScene.locationName === l.id).map(loc => {
                const lockedVer = loc.versions.find(v => v.id === loc.lockedVersionId) || loc.versions.find(v => v.status === 'LOCKED');
                return (
                  <div
                    key={loc.id}
                    className="group relative bg-studio-950 border border-studio-800 rounded-lg overflow-hidden flex flex-col hover:border-gold-500/50 transition-all cursor-pointer"
                    onClick={() => lockedVer?.referenceImageUrl && setPreviewImageModal({ open: true, url: lockedVer.referenceImageUrl, title: `${loc.name} [LOCATION]` })}
                  >
                    <div className="h-32 w-full bg-studio-900 flex items-center justify-center overflow-hidden relative">
                      {lockedVer?.referenceImageUrl ? (
                        <img
                          src={lockedVer.referenceImageUrl}
                          alt={loc.name}
                          className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-studio-600 gap-1">
                          <Compass className="w-6 h-6" />
                          <span className="text-[10px] font-mono">NO MASTER IMAGE</span>
                        </div>
                      )}
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-studio-950/80 text-sky-400 border border-sky-500/40 px-1.5 py-0.5 rounded">
                        LOCATION
                      </span>
                    </div>
                    <div className="p-2 bg-studio-900/60 border-t border-studio-800">
                      <div className="text-xs font-semibold text-studio-200 truncate">{loc.name}</div>
                      <div className="text-[10px] font-mono text-studio-400 truncate mt-0.5">
                        时段: {loc.time}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 3. Hero Props Card */}
              {props.filter(p => currentScene.props.some(tp => tp.toLowerCase() === p.name.toLowerCase() || tp === p.id)).map(pr => {
                const lockedVer = pr.versions.find(v => v.id === pr.lockedVersionId) || pr.versions.find(v => v.status === 'LOCKED');
                const propCond = currentScene.propConditions?.find(pc => pc.propId === pr.id)?.condition || 'NEW';
                return (
                  <div
                    key={pr.id}
                    className="group relative bg-studio-950 border border-studio-800 rounded-lg overflow-hidden flex flex-col hover:border-gold-500/50 transition-all cursor-pointer"
                    onClick={() => lockedVer?.referenceImageUrl && setPreviewImageModal({ open: true, url: lockedVer.referenceImageUrl, title: `${pr.name} [PROP]` })}
                  >
                    <div className="h-32 w-full bg-studio-900 flex items-center justify-center overflow-hidden relative">
                      {lockedVer?.referenceImageUrl ? (
                        <img
                          src={lockedVer.referenceImageUrl}
                          alt={pr.name}
                          className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-studio-600 gap-1">
                          <Film className="w-6 h-6" />
                          <span className="text-[10px] font-mono">NO MASTER IMAGE</span>
                        </div>
                      )}
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-studio-950/80 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded">
                        HERO PROP
                      </span>
                    </div>
                    <div className="p-2 bg-studio-900/60 border-t border-studio-800">
                      <div className="text-xs font-semibold text-studio-200 truncate">{pr.name}</div>
                      <div className="text-[10px] font-mono text-studio-400 truncate mt-0.5">
                        状态: <span className="text-amber-400 font-bold">{propCond}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 4. Costumes Card */}
              {costumes.filter(cos => currentScene.costumes.some(tc => tc.toLowerCase() === cos.name.toLowerCase() || tc === cos.id)).map(c => {
                const lockedVer = c.versions.find(v => v.id === c.lockedVersionId) || c.versions.find(v => v.status === 'LOCKED');
                return (
                  <div
                    key={c.id}
                    className="group relative bg-studio-950 border border-studio-800 rounded-lg overflow-hidden flex flex-col hover:border-gold-500/50 transition-all cursor-pointer"
                    onClick={() => lockedVer?.referenceImageUrl && setPreviewImageModal({ open: true, url: lockedVer.referenceImageUrl, title: `${c.name} [COSTUME]` })}
                  >
                    <div className="h-32 w-full bg-studio-900 flex items-center justify-center overflow-hidden relative">
                      {lockedVer?.referenceImageUrl ? (
                        <img
                          src={lockedVer.referenceImageUrl}
                          alt={c.name}
                          className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-studio-600 gap-1">
                          <Layers className="w-6 h-6" />
                          <span className="text-[10px] font-mono">NO MASTER IMAGE</span>
                        </div>
                      )}
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-studio-950/80 text-purple-400 border border-purple-500/40 px-1.5 py-0.5 rounded">
                        WARDROBE
                      </span>
                    </div>
                    <div className="p-2 bg-studio-900/60 border-t border-studio-800">
                      <div className="text-xs font-semibold text-studio-200 truncate">{c.name}</div>
                      <div className="text-[10px] font-mono text-studio-400 truncate mt-0.5">
                        {c.color} {c.condition}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. DIRECTOR'S INTENTION (10 Dimensions + State Controls + AI Assist) */}
      <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-800">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gold-400" />
              <h2 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider">
                DIRECTOR'S INTENTION 导演意图与视听决策
              </h2>
            </div>
            <p className="text-xs text-studio-400 mt-1">
              包含 10 个好莱坞核心导演维度与角色战损状态设定。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setAiDiscussionModal(true)}
              className="bg-studio-800 hover:bg-studio-700 text-gold-400 border border-gold-500/30 text-xs font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              AI 导演深度讨论 (NO API)
            </button>
            <button
              onClick={() => setIntentionExpanded(prev => !prev)}
              className="bg-studio-800 text-studio-300 hover:text-studio-100 text-xs font-mono px-3 py-1.5 rounded border border-studio-700"
            >
              {intentionExpanded ? '收起字段' : '展开 10 维视听决策'}
            </button>
          </div>
        </div>

        {/* Character State & Prop Condition Selectors */}
        <div className="mt-4 pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-studio-950/60 p-3 rounded-lg border border-studio-800/80 text-xs">
          {characters.filter(c => currentScene.characters.some(tc => tc.toLowerCase() === c.name.toLowerCase() || tc === c.id)).map(char => {
            const currentState = currentScene.characterStates?.find(cs => cs.characterId === char.id)?.stateId || 'NORMAL';
            return (
              <div key={char.id} className="flex items-center justify-between gap-2">
                <span className="font-mono text-studio-400 truncate">{char.name} 状态:</span>
                <select
                  value={currentState}
                  onChange={(e) => {
                    studioStore.setSceneCharacterState(currentScene.id, char.id, e.target.value);
                  }}
                  className="bg-studio-900 border border-studio-700 text-gold-400 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-gold-500"
                >
                  <option value="NORMAL">NORMAL (正常完好)</option>
                  <option value="INJURED">INJURED (受袭负伤)</option>
                  <option value="BATTLE DAMAGED">BATTLE DAMAGED (极度战损)</option>
                  <option value="BLOODIED">BLOODIED (满身血迹)</option>
                  <option value="EXHAUSTED">EXHAUSTED (体能虚脱)</option>
                  <option value="WET">WET (浑身湿透)</option>
                  <option value="ANGRY">ANGRY (暴怒状态)</option>
                </select>
              </div>
            );
          })}

          {props.filter(p => currentScene.props.some(tp => tp.toLowerCase() === p.name.toLowerCase() || tp === p.id)).map(pr => {
            const currentCond = currentScene.propConditions?.find(pc => pc.propId === pr.id)?.condition || 'NEW';
            return (
              <div key={pr.id} className="flex items-center justify-between gap-2">
                <span className="font-mono text-studio-400 truncate">{pr.name} 损伤:</span>
                <select
                  value={currentCond}
                  onChange={(e) => {
                    studioStore.setScenePropCondition(currentScene.id, pr.id, e.target.value);
                  }}
                  className="bg-studio-900 border border-studio-700 text-amber-400 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-gold-500"
                >
                  <option value="NEW">NEW (崭新完好)</option>
                  <option value="DAMAGED">DAMAGED (轻度磨损/缺口)</option>
                  <option value="BLOODY">BLOODY (沾满血迹)</option>
                  <option value="BROKEN">BROKEN (断裂报废)</option>
                </select>
              </div>
            );
          })}
        </div>

        {/* 10 Dimensions Accordion / Form */}
        {intentionExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                1. 戏剧目的 (Dramatic Purpose)
              </label>
              <textarea
                value={intentionState.directorScenePurpose || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorScenePurpose: e.target.value });
                  saveIntentionDebounced({ directorScenePurpose: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded p-2 text-xs font-sans text-studio-200 resize-none h-16 focus:outline-none focus:border-gold-500"
                placeholder="为什么这一场非存在不可？推动了什么关键转折？"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                2. 观众情感体验 (Audience Experience)
              </label>
              <textarea
                value={intentionState.directorAudienceExperience || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorAudienceExperience: e.target.value });
                  saveIntentionDebounced({ directorAudienceExperience: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded p-2 text-xs font-sans text-studio-200 resize-none h-16 focus:outline-none focus:border-gold-500"
                placeholder="期望观众在胸腔中感受到什么具体情绪？"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                3. 情绪弧度 (Emotional Arc)
              </label>
              <input
                type="text"
                value={intentionState.directorEmotionalArc || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorEmotionalArc: e.target.value });
                  saveIntentionDebounced({ directorEmotionalArc: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded px-2 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-gold-500"
                placeholder="例如：精密潜入 → 发现圈套的瞬间冷静 → 爆发雷霆斩杀"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                4. 节奏与律动 (Pacing)
              </label>
              <input
                type="text"
                value={intentionState.directorPacing || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorPacing: e.target.value });
                  saveIntentionDebounced({ directorPacing: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded px-2 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-gold-500"
                placeholder="例如：催眠般压迫的慢速推移，骤然撕裂为超音速招式互换"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                5. 视觉策略 (Visual Strategy)
              </label>
              <textarea
                value={intentionState.directorVisualStrategy || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorVisualStrategy: e.target.value });
                  saveIntentionDebounced({ directorVisualStrategy: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded p-2 text-xs font-sans text-studio-200 resize-none h-16 focus:outline-none focus:border-gold-500"
                placeholder="机位高低、景深选择、构图几何与色彩对比策略"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                6. 表演指导 (Performance Direction)
              </label>
              <textarea
                value={intentionState.directorPerformanceDirection || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorPerformanceDirection: e.target.value });
                  saveIntentionDebounced({ directorPerformanceDirection: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded p-2 text-xs font-sans text-studio-200 resize-none h-16 focus:outline-none focus:border-gold-500"
                placeholder="演员面部微表情、肌肉紧绷程度、呼吸停顿与眼神焦点"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                7. 摄影机策略 (Camera Strategy)
              </label>
              <input
                type="text"
                value={intentionState.directorCameraStrategy || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorCameraStrategy: e.target.value });
                  saveIntentionDebounced({ directorCameraStrategy: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded px-2 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-gold-500"
                placeholder="斯坦尼康低机位推进、轨道跟跑、格挡瞬间微冲"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                8. 光比策略 (Lighting Strategy)
              </label>
              <input
                type="text"
                value={intentionState.directorLightingStrategy || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorLightingStrategy: e.target.value });
                  saveIntentionDebounced({ directorLightingStrategy: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded px-2 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-gold-500"
                placeholder="8:1 Chiaroscuro 强反差，单束冷蓝天窗主光，暖黄侧轮廓"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                9. 声音与拟音哲学 (Sound Direction)
              </label>
              <input
                type="text"
                value={intentionState.directorSoundDirection || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorSoundDirection: e.target.value });
                  saveIntentionDebounced({ directorSoundDirection: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded px-2 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-gold-500"
                placeholder="次低音轰鸣持续压迫，雨滴击打锌铁屋顶回响，拔刀高频微鸣"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                10. 转场方式 (Transition)
              </label>
              <input
                type="text"
                value={intentionState.directorTransition || ''}
                onChange={(e) => {
                  setIntentionState({ ...intentionState, directorTransition: e.target.value });
                  saveIntentionDebounced({ directorTransition: e.target.value });
                }}
                className="w-full bg-studio-950 border border-studio-800 rounded px-2 py-1.5 text-xs text-studio-200 focus:outline-none focus:border-gold-500"
                placeholder="刀刃雷霆碰撞瞬间重击跳切"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. SHOT BOARD (Cards, Add Shot, Drag & Drop / Reordering) */}
      <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-800">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-gold-400" />
            <h2 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider">
              SHOT BOARD 分镜镜头编排板 ({currentScene.shots?.length || 0} SHOTS)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-studio-400">
              总时长: <strong className="text-gold-400">{totalSceneDurationSeconds}s</strong>
            </span>
            <button
              onClick={() => setQuickAddModal(true)}
              className="bg-gold-500 hover:bg-gold-400 text-studio-950 text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm shadow-gold-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              + 添加分镜 (ADD SHOT)
            </button>
          </div>
        </div>

        {/* Shot Cards Horizontal Flow / Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {currentScene.shots?.map((shot, idx) => {
            const isSelected = shot.id === selectedShot?.id;
            const hasTake = Boolean(shot.selectedTakeId || (shot.takes && shot.takes.length > 0));
            const hasPrompt = Boolean(shot.isPromptLocked || (shot.prompts && shot.prompts.length > 0));

            return (
              <div
                key={shot.id}
                onClick={() => setSelectedShotId(shot.id)}
                className={`relative flex flex-col justify-between p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-studio-850 border-gold-500/80 ring-1 ring-gold-500/50 shadow-lg'
                    : 'bg-studio-950/70 border-studio-800 hover:border-studio-700'
                }`}
              >
                <div>
                  {/* Top Bar: Shot Number & Up/Down Actions */}
                  <div className="flex items-center justify-between pb-2 border-b border-studio-800/80">
                    <span className="text-xs font-mono font-bold text-gold-400">
                      SHOT {String(shot.shotNumber).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveShot(idx, 'UP');
                        }}
                        disabled={idx === 0}
                        className="text-studio-500 hover:text-studio-200 disabled:opacity-30 p-0.5"
                        title="向前移"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveShot(idx, 'DOWN');
                        }}
                        disabled={idx === (currentScene.shots?.length || 0) - 1}
                        className="text-studio-500 hover:text-studio-200 disabled:opacity-30 p-0.5"
                        title="向后移"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail / Storyboard Reference */}
                  <div className="mt-2 h-20 bg-studio-900 rounded border border-studio-800 overflow-hidden flex items-center justify-center relative">
                    {shot.storyboardImageUrl ? (
                      <img
                        src={shot.storyboardImageUrl}
                        alt="Storyboard"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-studio-600 gap-1">
                        <Clapperboard className="w-5 h-5" />
                        <span className="text-[9px] font-mono">{shot.lens}</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-studio-950/80 text-studio-300 px-1 rounded">
                      {shot.duration || '3s'}
                    </span>
                  </div>

                  {/* Shot Type & Short Action */}
                  <div className="mt-2 text-xs font-semibold text-studio-200 truncate">
                    {shot.shotType}
                  </div>
                  <div className="text-[11px] text-studio-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {shot.action || '未指定动作描述'}
                  </div>
                </div>

                {/* Bottom Status Tags & 1-Click Fast Actions */}
                <div className="mt-3 pt-2 border-t border-studio-800/80 flex items-center justify-between text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    {shot.isPromptLocked ? (
                      <span className="text-gold-400" title="Prompt 已锁定">🔒</span>
                    ) : hasPrompt ? (
                      <span className="text-emerald-400" title="Prompt 已就绪">●</span>
                    ) : (
                      <span className="text-studio-600" title="未生成 Prompt">○</span>
                    )}

                    {hasTake ? (
                      <span className="text-emerald-400 font-bold" title="已有实拍 Take">✓ TAKE</span>
                    ) : (
                      <span className="text-studio-600" title="无 Take">NO TAKE</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickCopyPrompt(shot, 'GOOGLE_FLOW');
                      }}
                      title="一键复制 Google Flow 提示词"
                      className="px-1.5 py-0.5 rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/40 transition-colors text-[9px] font-mono"
                    >
                      Flow
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickCopyPrompt(shot, 'DREAMINA');
                      }}
                      title="一键复制 Dreamina 提示词"
                      className="px-1.5 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/40 transition-colors text-[9px] font-mono"
                    >
                      Dream
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. SELECTED SHOT DETAIL WORKSPACE (Design / References / Prompt / Takes) */}
      {selectedShot && (
        <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 sm:p-6 shadow-2xl space-y-6">
          {/* Header of Selected Shot */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-gold-500/20 text-gold-400 px-2.5 py-0.5 rounded border border-gold-500/40 font-bold">
                  SHOT #{selectedShot.shotNumber}
                </span>
                <h3 className="text-lg font-serif font-bold text-studio-100">
                  {selectedShot.shotType} — {selectedShot.cameraMovement}
                </h3>
              </div>
              <p className="text-xs text-studio-400 mt-1">
                镜头光学参数、180° 轴线判定、多维度 Master Prompt 3.0 与视频 Take 管理。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 1-Click Fast Copy Google Flow Prompt */}
              <button
                onClick={() => handleQuickCopyPrompt(selectedShot, 'GOOGLE_FLOW')}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/50 text-xs font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                title="一键复制 Google Flow 格式提示词 (快捷键: 1 或 F)"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>复制 Flow 词 (1)</span>
              </button>

              {/* 1-Click Fast Copy Dreamina Prompt */}
              <button
                onClick={() => handleQuickCopyPrompt(selectedShot, 'DREAMINA')}
                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/50 text-xs font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                title="一键复制 Dreamina 格式提示词 (快捷键: 2 或 M)"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>复制 Dreamina 词 (2)</span>
              </button>

              {/* Reference Pack Button */}
              <button
                onClick={() => setReferencePackModal(true)}
                className="bg-studio-800 hover:bg-studio-700 text-gold-400 border border-gold-500/40 text-xs font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                REFERENCE PACK ({referencePackItems.length} 图)
              </button>

              {/* Compare Prompt Versions Button */}
              <button
                onClick={() => setPromptDiffModalOpen(true)}
                disabled={!selectedShot.prompts || selectedShot.prompts.length < 2}
                className="bg-studio-800 hover:bg-studio-700 disabled:opacity-40 text-studio-300 border border-studio-700 text-xs font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                title={selectedShot.prompts && selectedShot.prompts.length >= 2 ? '对比提示词版本差异' : '需要至少2个版本才能对比'}
              >
                <Sliders className="w-3.5 h-3.5 text-gold-400" />
                版本对比 ({selectedShot.prompts?.length || 0})
              </button>

              {/* Generate Prompt Button */}
              <button
                onClick={() => handleOpenPromptModal(selectedShot)}
                className="bg-gold-500 hover:bg-gold-400 text-studio-950 font-sans font-semibold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm shadow-gold-500/10"
              >
                <Sparkles className="w-3.5 h-3.5" />
                完整 PROMPT
              </button>

              {/* Lock / Unlock Prompt Button */}
              <button
                onClick={() => handleLockPrompt(selectedShot.id)}
                className={`p-1.5 rounded border text-xs transition-colors ${
                  selectedShot.isPromptLocked
                    ? 'bg-gold-500/20 text-gold-400 border-gold-500/40'
                    : 'bg-studio-800 text-studio-400 border-studio-700 hover:text-studio-200'
                }`}
                title={selectedShot.isPromptLocked ? 'Prompt 已锁定 (点击解锁)' : '锁定 Prompt 防止误篡改'}
              >
                {selectedShot.isPromptLocked ? <Lock className="w-4 h-4 text-gold-400" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Prompt Stale Warning Banner */}
          <PromptStaleBanner
            shot={selectedShot}
            onRegeneratePrompt={() => handleOpenPromptModal(selectedShot, promptModal.lengthMode || 'Standard')}
            onUpdateRefPack={() => setReferencePackModal(true)}
          />

          {/* 180° Axis Break Alert if detected */}
          {axisBreakWarning && (
            <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3 text-xs text-amber-300 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{axisBreakWarning}</span>
            </div>
          )}

          {/* Form: Shot Choreography & Spatial Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Camera, Lens, Direction & Axis */}
            <div className="space-y-4 bg-studio-950/60 p-4 rounded-lg border border-studio-800">
              <h4 className="text-xs font-mono font-bold text-studio-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-gold-400" />
                光学机位与 180° 轴线
              </h4>

              <div>
                <label className="block text-[11px] font-mono text-studio-400 mb-1">景别 (Shot Type)</label>
                <select
                  value={shotForm.shotType || selectedShot.shotType}
                  onChange={(e) => {
                    setShotForm({ ...shotForm, shotType: e.target.value as ShotType });
                    saveShotDebounced({ shotType: e.target.value as ShotType });
                  }}
                  className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                >
                  {SHOT_TYPES_CONFIG.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-studio-400 mb-1">镜头焦段 (Lens)</label>
                  <select
                    value={shotForm.lens || selectedShot.lens}
                    onChange={(e) => {
                      setShotForm({ ...shotForm, lens: e.target.value });
                      saveShotDebounced({ lens: e.target.value });
                    }}
                    className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2 py-1.5 focus:outline-none focus:border-gold-500"
                  >
                    {LENSES_CONFIG.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-studio-400 mb-1">机位运动 (Movement)</label>
                  <select
                    value={shotForm.cameraMovement || selectedShot.cameraMovement}
                    onChange={(e) => {
                      setShotForm({ ...shotForm, cameraMovement: e.target.value });
                      saveShotDebounced({ cameraMovement: e.target.value });
                    }}
                    className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2 py-1.5 focus:outline-none focus:border-gold-500"
                  >
                    {CAMERA_MOVEMENTS_CONFIG.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              {/* 180-Degree Rule Controls */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-studio-800">
                <div>
                  <label className="block text-[11px] font-mono text-studio-400 mb-1">屏幕运动朝向 (Screen Vector)</label>
                  <select
                    value={shotForm.screenDirection || selectedShot.screenDirection || 'Left → Right'}
                    onChange={(e) => {
                      setShotForm({ ...shotForm, screenDirection: e.target.value as ScreenDirection });
                      saveShotDebounced({ screenDirection: e.target.value as ScreenDirection });
                    }}
                    className="w-full bg-studio-900 border border-studio-700 text-xs text-gold-400 rounded px-2 py-1.5 focus:outline-none focus:border-gold-500"
                  >
                    {SCREEN_DIRECTIONS_CONFIG.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-studio-400 mb-1">机位面侧 (Camera Side)</label>
                  <select
                    value={shotForm.cameraSide || selectedShot.cameraSide || 'A'}
                    onChange={(e) => {
                      setShotForm({ ...shotForm, cameraSide: e.target.value as CameraSide });
                      saveShotDebounced({ cameraSide: e.target.value as CameraSide });
                    }}
                    className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2 py-1.5 focus:outline-none focus:border-gold-500"
                  >
                    {CAMERA_SIDES_CONFIG.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Eye Line & Pacing */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono text-studio-400 mb-1">视线方向 (Eye Line)</label>
                  <select
                    value={shotForm.eyeLine || selectedShot.eyeLine || 'Screen Right'}
                    onChange={(e) => {
                      setShotForm({ ...shotForm, eyeLine: e.target.value as EyeLine });
                      saveShotDebounced({ eyeLine: e.target.value as EyeLine });
                    }}
                    className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2 py-1.5 focus:outline-none focus:border-gold-500"
                  >
                    {EYE_LINES_CONFIG.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-studio-400 mb-1">节奏律动 (Pacing)</label>
                  <select
                    value={shotForm.pacing || selectedShot.pacing || 'Normal'}
                    onChange={(e) => {
                      setShotForm({ ...shotForm, pacing: e.target.value as ShotPacing });
                      saveShotDebounced({ pacing: e.target.value as ShotPacing });
                    }}
                    className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2 py-1.5 focus:outline-none focus:border-gold-500"
                  >
                    {PACING_CONFIG.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-studio-400 mb-1">分镜时长 (Duration)</label>
                <input
                  type="text"
                  value={shotForm.duration || selectedShot.duration || '3s'}
                  onChange={(e) => {
                    setShotForm({ ...shotForm, duration: e.target.value });
                    saveShotDebounced({ duration: e.target.value });
                  }}
                  className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500 font-mono"
                  placeholder="例如: 3s, 4s"
                />
              </div>
            </div>

            {/* Middle: Action, Performance & Staging */}
            <div className="space-y-4 bg-studio-950/60 p-4 rounded-lg border border-studio-800">
              <h4 className="text-xs font-mono font-bold text-studio-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-gold-400" />
                动作、走位与武术表演
              </h4>

              <div>
                <label className="block text-[11px] font-mono text-studio-400 mb-1">动作描述 (Action Description)</label>
                <textarea
                  value={shotForm.action || selectedShot.action || ''}
                  onChange={(e) => {
                    setShotForm({ ...shotForm, action: e.target.value });
                    saveShotDebounced({ action: e.target.value });
                  }}
                  className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded p-2.5 resize-none h-20 focus:outline-none focus:border-gold-500"
                  placeholder="具体发生什么动作？如: Ron 拔刀格挡横向甩出火花..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-studio-400 mb-1">表演微反应 (Performance Direction)</label>
                <textarea
                  value={shotForm.performance || selectedShot.performance || ''}
                  onChange={(e) => {
                    setShotForm({ ...shotForm, performance: e.target.value });
                    saveShotDebounced({ performance: e.target.value });
                  }}
                  className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded p-2.5 resize-none h-16 focus:outline-none focus:border-gold-500"
                  placeholder="演员面部焦点、呼吸顿挫、杀意内敛程度..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-studio-400 mb-1">光比与环境反应 (Lighting & Environment)</label>
                <input
                  type="text"
                  value={shotForm.lighting || selectedShot.lighting || ''}
                  onChange={(e) => {
                    setShotForm({ ...shotForm, lighting: e.target.value });
                    saveShotDebounced({ lighting: e.target.value });
                  }}
                  className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                  placeholder="如: 8:1 contrast chiaroscuro, 天窗冷月光, 飞溅火花照明"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-studio-400 mb-1">声音拟音 (Sound & Foley)</label>
                <input
                  type="text"
                  value={shotForm.sound || selectedShot.sound || ''}
                  onChange={(e) => {
                    setShotForm({ ...shotForm, sound: e.target.value });
                    saveShotDebounced({ sound: e.target.value });
                  }}
                  className="w-full bg-studio-900 border border-studio-700 text-xs text-studio-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-gold-500"
                  placeholder="如: 刀锋刺入空气破风声、重低音心跳嗡鸣"
                />
              </div>
            </div>

            {/* Right: Video Takes Workspace */}
            <div className="space-y-4 bg-studio-950/60 p-4 rounded-lg border border-studio-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-studio-800">
                  <h4 className="text-xs font-mono font-bold text-studio-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-gold-400" />
                    实拍 TAKES ({selectedShot.takes?.length || 0})
                  </h4>
                  <button
                    onClick={() => setTakeModalOpen(true)}
                    className="text-xs font-mono text-gold-400 hover:text-gold-300 underline"
                  >
                    + 上传 TAKE
                  </button>
                </div>

                {/* Selected Active Take Preview */}
                <div className="mt-3">
                  {selectedShot.takes && selectedShot.takes.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedShot.takes.map((take) => {
                        const isSelectedTake = take.id === selectedShot.selectedTakeId;
                        return (
                          <div
                            key={take.id}
                            className={`p-2.5 rounded border transition-all ${
                              isSelectedTake
                                ? 'bg-gold-950/20 border-gold-500/60 ring-1 ring-gold-500/30'
                                : 'bg-studio-900/80 border-studio-800 hover:border-studio-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-studio-200">
                                TAKE {String(take.takeNumber).padStart(2, '0')}
                              </span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                take.status === 'SELECTED'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : take.status === 'REVIEW'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-studio-800 text-studio-400'
                              }`}>
                                {take.status}
                              </span>
                            </div>

                            {take.notes && (
                              <p className="text-[11px] text-studio-400 mt-1 italic">
                                "{take.notes}"
                              </p>
                            )}

                            {/* Take Actions */}
                            <div className="mt-2 pt-2 border-t border-studio-800/80 flex items-center justify-between text-xs">
                              {!isSelectedTake && (
                                <button
                                  onClick={() => studioStore.selectShotTake(selectedShot.id, take.id)}
                                  className="text-gold-400 hover:text-gold-300 font-mono text-[11px] underline"
                                >
                                  设为主选用镜 (SELECT)
                                </button>
                              )}
                              {isSelectedTake && (
                                <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                                  ✓ 已选用 (HERO TAKE)
                                </span>
                              )}
                              <button
                                onClick={() => studioStore.deleteShotTake(selectedShot.id, take.id)}
                                className="text-studio-500 hover:text-red-400"
                                title="删除此 Take"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-studio-500 text-xs font-mono border border-dashed border-studio-800 rounded">
                      暂无上传的实拍视频 Take。<br />
                      复制 Google Flow / Dreamina Prompt 生成视频后，点击上方「+ 上传 TAKE」录入。
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Tools */}
              <div className="pt-3 border-t border-studio-800 flex items-center justify-between text-xs font-mono">
                <button
                  onClick={() => studioStore.duplicateShot(selectedShot.id)}
                  className="text-studio-400 hover:text-studio-200 flex items-center gap-1"
                >
                  <DuplicateIcon className="w-3.5 h-3.5" /> 复制分镜
                </button>
                <button
                  onClick={() => {
                    const confirmDel = confirm(`确定删除分镜 #${selectedShot.shotNumber} 吗？`);
                    if (confirmDel) studioStore.deleteShot(selectedShot.id);
                  }}
                  className="text-red-400/80 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 删除分镜
                </button>
              </div>
            </div>
          </div>

          {/* 6.5 Intelligence: Shot Continuity Contract & 2D Blocking Floorplan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-studio-800">
            <ShotContractPanel shot={selectedShot} />
            <ShotBlockingCanvas sceneId={currentScene.id} shot={selectedShot} />
          </div>
        </div>
      )}

      {/* MODAL 1: QUICK ADD SHOT */}
      {quickAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider">
                + 新建分镜 (QUICK ADD SHOT)
              </h3>
              <button onClick={() => setQuickAddModal(false)} className="text-studio-400 hover:text-studio-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">分镜景别 (Shot Type)</label>
              <select
                value={quickAddForm.shotType}
                onChange={(e) => setQuickAddForm({ ...quickAddForm, shotType: e.target.value as ShotType })}
                className="w-full bg-studio-950 border border-studio-700 text-xs text-studio-200 rounded px-3 py-2 focus:outline-none focus:border-gold-500"
              >
                {SHOT_TYPES_CONFIG.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">预估时长 (Duration)</label>
              <input
                type="text"
                value={quickAddForm.duration}
                onChange={(e) => setQuickAddForm({ ...quickAddForm, duration: e.target.value })}
                className="w-full bg-studio-950 border border-studio-700 text-xs text-studio-200 rounded px-3 py-2 focus:outline-none focus:border-gold-500 font-mono"
                placeholder="例如: 3s, 4s"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">动作简述 (Action)</label>
              <textarea
                value={quickAddForm.action}
                onChange={(e) => setQuickAddForm({ ...quickAddForm, action: e.target.value })}
                className="w-full bg-studio-950 border border-studio-700 text-xs text-studio-200 rounded p-2.5 resize-none h-20 focus:outline-none focus:border-gold-500"
                placeholder="简短描述该镜头发生的核心动作与视觉事件..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-studio-800">
              <button
                onClick={() => setQuickAddModal(false)}
                className="px-3 py-1.5 text-xs text-studio-400 hover:text-studio-200"
              >
                取消
              </button>
              <button
                onClick={handleQuickAddShot}
                className="bg-gold-500 hover:bg-gold-400 text-studio-950 text-xs font-semibold px-4 py-1.5 rounded transition-colors"
              >
                添加并进入设计
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REFERENCE PACK VIEWER & EXPORT */}
      {referencePackModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <div>
                <h3 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gold-400" />
                  SHOT #{selectedShot?.shotNumber} 镜头参考图包 (REFERENCE PACK)
                </h3>
                <p className="text-xs text-studio-400 mt-0.5">
                  聚合锁定资产、角色状态、道具、前一分镜与故事板参考 ({referencePackItems.length} 项)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReferencePack}
                  disabled={downloadingZip}
                  className="bg-gold-500 hover:bg-gold-400 text-studio-950 text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {downloadingZip ? '正在打包 ZIP...' : '下载参考图包 (DOWNLOAD ZIP)'}
                </button>
                <button onClick={() => setReferencePackModal(false)} className="text-studio-400 hover:text-studio-200 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reference Pack Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {referencePackItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-studio-950 border border-studio-800 rounded-lg overflow-hidden flex flex-col group cursor-pointer hover:border-gold-500/50 transition-all"
                  onClick={() => item.imageUrl && setPreviewImageModal({ open: true, url: item.imageUrl, title: item.title })}
                >
                  <div className="h-32 bg-studio-900 flex items-center justify-center overflow-hidden relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-studio-600 text-[10px] font-mono flex flex-col items-center">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        NO IMAGE
                      </div>
                    )}
                    <span className="absolute top-1.5 left-1.5 text-[9px] font-mono bg-studio-950/80 text-gold-400 px-1.5 py-0.5 rounded border border-gold-500/40">
                      {item.type}
                    </span>
                  </div>
                  <div className="p-2 border-t border-studio-800 bg-studio-900/60">
                    <div className="text-xs font-semibold text-studio-200 truncate">{item.title}</div>
                    <div className="text-[10px] text-studio-400 truncate mt-0.5">{item.notes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SCENE REVIEW (SEQUENCE PLAYER) */}
      {sceneReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 max-w-4xl w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <div>
                <h3 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-gold-400" />
                  SCENE REVIEW — 场次连续镜放映 ({currentScene.shots?.length || 0} 分镜)
                </h3>
                <p className="text-xs text-studio-400 mt-0.5">
                  依次预览各分镜已选定 (Selected) 的 Hero Take
                </p>
              </div>
              <button onClick={() => setSceneReviewModal(false)} className="text-studio-400 hover:text-studio-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sequence Player Frame */}
            {(() => {
              const currentReviewShot = currentScene.shots?.[activeReviewTakeIndex];
              const heroTake = currentReviewShot?.takes?.find(t => t.id === currentReviewShot.selectedTakeId) || currentReviewShot?.takes?.[0];

              return (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg border border-studio-800 flex items-center justify-center relative overflow-hidden">
                    {heroTake ? (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-studio-300">
                        <Play className="w-12 h-12 text-gold-400 mb-3 animate-pulse" />
                        <span className="font-mono text-xs text-gold-400 uppercase tracking-widest font-bold">
                          [DEMO PLAYBACK] SHOT #{currentReviewShot?.shotNumber} TAKE {heroTake.takeNumber}
                        </span>
                        <p className="text-xs text-studio-400 mt-2 max-w-lg">
                          "{currentReviewShot?.action}"
                        </p>
                        <span className="text-[11px] font-mono text-studio-500 mt-2">
                          Duration: {currentReviewShot?.duration || '3s'} | Status: {heroTake.status}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 text-amber-400">
                        <AlertTriangle className="w-10 h-10 mb-2" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider">
                          ⚠ 分镜 #{currentReviewShot?.shotNumber} 尚未选定实拍 Take
                        </span>
                        <p className="text-xs text-studio-400 mt-1">
                          跳过此镜头或前往该分镜上传生成视频。
                        </p>
                      </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 bg-studio-950/80 px-2.5 py-1 rounded text-xs font-mono text-gold-400 border border-gold-500/40">
                      SHOT #{currentReviewShot?.shotNumber} / {currentScene.shots?.length}
                    </div>
                  </div>

                  {/* Playhead Stepper Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => setActiveReviewTakeIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeReviewTakeIndex === 0}
                      className="bg-studio-800 hover:bg-studio-700 disabled:opacity-40 text-studio-200 text-xs font-mono px-3 py-1.5 rounded border border-studio-700"
                    >
                      ← 上一镜头
                    </button>

                    <div className="flex items-center gap-1.5">
                      {currentScene.shots?.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => setActiveReviewTakeIndex(idx)}
                          className={`w-7 h-7 rounded text-xs font-mono transition-all ${
                            idx === activeReviewTakeIndex
                              ? 'bg-gold-500 text-studio-950 font-bold'
                              : s.selectedTakeId
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-studio-800 text-studio-500 border border-studio-700'
                          }`}
                        >
                          {s.shotNumber}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveReviewTakeIndex(prev => Math.min((currentScene.shots?.length || 1) - 1, prev + 1))}
                      disabled={activeReviewTakeIndex === (currentScene.shots?.length || 1) - 1}
                      className="bg-studio-800 hover:bg-studio-700 disabled:opacity-40 text-studio-200 text-xs font-mono px-3 py-1.5 rounded border border-studio-700"
                    >
                      下一镜头 →
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 4: MASTER PROMPT 3.0 DIALOG */}
      {promptModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <div>
                <h3 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  MASTER PROMPT 3.0 (好莱坞级电影提示词)
                </h3>
                <p className="text-xs text-studio-400 mt-0.5">
                  已聚合当前项目的 Project Bible、87Eleven Action Bible 与已锁定资产
                </p>
              </div>
              <button onClick={() => setPromptModal(prev => ({ ...prev, open: false }))} className="text-studio-400 hover:text-studio-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt Length Mode & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-studio-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPromptModal(prev => ({ ...prev, activeTab: 'MASTER' }))}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold transition-colors border-b-2 ${
                    promptModal.activeTab === 'MASTER'
                      ? 'text-gold-400 border-gold-400'
                      : 'text-studio-400 border-transparent hover:text-studio-200'
                  }`}
                >
                  11-DIMENSION MASTER
                </button>
                <button
                  onClick={() => setPromptModal(prev => ({ ...prev, activeTab: 'GOOGLE_FLOW' }))}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold transition-colors border-b-2 ${
                    promptModal.activeTab === 'GOOGLE_FLOW'
                      ? 'text-gold-400 border-gold-400'
                      : 'text-studio-400 border-transparent hover:text-studio-200'
                  }`}
                >
                  GOOGLE FLOW
                </button>
                <button
                  onClick={() => setPromptModal(prev => ({ ...prev, activeTab: 'DREAMINA' }))}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold transition-colors border-b-2 ${
                    promptModal.activeTab === 'DREAMINA'
                      ? 'text-gold-400 border-gold-400'
                      : 'text-studio-400 border-transparent hover:text-studio-200'
                  }`}
                >
                  DREAMINA
                </button>
                <button
                  onClick={() => setPromptModal(prev => ({ ...prev, activeTab: 'AVOID' }))}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold transition-colors border-b-2 ${
                    promptModal.activeTab === 'AVOID'
                      ? 'text-amber-400 border-amber-400'
                      : 'text-studio-400 border-transparent hover:text-studio-200'
                  }`}
                >
                  AVOID (反向连贯性约束)
                </button>
              </div>

              {/* Length Mode Selector */}
              <div className="flex items-center gap-1 bg-studio-950 p-1 rounded border border-studio-800 text-[11px] font-mono">
                <span className="text-studio-500 px-1.5">长度:</span>
                {(['Compact', 'Standard', 'Detailed'] as PromptLengthMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      if (selectedShot) handleOpenPromptModal(selectedShot, mode);
                    }}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      promptModal.lengthMode === mode
                        ? 'bg-gold-500 text-studio-950 font-bold'
                        : 'text-studio-400 hover:text-studio-200'
                    }`}
                  >
                    {mode === 'Compact' ? '精简 (80-150)' : mode === 'Standard' ? '标准 (150-350)' : '详尽 (300-600)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Display Area */}
            <div className="relative">
              <textarea
                readOnly
                value={
                  promptModal.activeTab === 'MASTER'
                    ? promptModal.masterPrompt
                    : promptModal.activeTab === 'GOOGLE_FLOW'
                    ? promptModal.googleFlowPrompt
                    : promptModal.activeTab === 'DREAMINA'
                    ? promptModal.dreaminaPrompt
                    : promptModal.avoidPrompt
                }
                className="w-full bg-studio-950 border border-studio-800 rounded p-4 text-xs font-mono text-studio-200 leading-relaxed h-72 resize-none focus:outline-none select-all"
              />
              <button
                onClick={() => {
                  const text =
                    promptModal.activeTab === 'MASTER'
                      ? promptModal.masterPrompt
                      : promptModal.activeTab === 'GOOGLE_FLOW'
                      ? promptModal.googleFlowPrompt
                      : promptModal.activeTab === 'DREAMINA'
                      ? promptModal.dreaminaPrompt
                      : promptModal.avoidPrompt;
                  handleCopyPromptText(text, promptModal.activeTab);
                }}
                className="absolute top-3 right-3 bg-studio-800/90 hover:bg-studio-700 text-gold-400 border border-gold-500/40 text-xs font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors backdrop-blur-sm"
              >
                {promptModal.copiedType === promptModal.activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    已复制到剪贴板
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制 PROMPT
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-studio-800 text-xs font-mono text-studio-500">
              <span>零 AI API 依赖：完全由本地影视母本多级引擎生成。</span>
              <div className="flex items-center gap-2">
                {selectedShot && (
                  <button
                    onClick={() => {
                      handleSavePromptVersion(selectedShot.id);
                      setPromptModal(prev => ({ ...prev, open: false }));
                    }}
                    className="bg-gold-500 hover:bg-gold-400 text-studio-950 px-3.5 py-1.5 rounded font-sans font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    保存为新版本并冻结快照
                  </button>
                )}
                <button
                  onClick={() => setPromptModal(prev => ({ ...prev, open: false }))}
                  className="bg-studio-800 text-studio-200 px-4 py-1.5 rounded hover:bg-studio-700"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: UPLOAD TAKE */}
      {takeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-gold-400" />
                录入新视频 TAKE
              </h3>
              <button onClick={() => setTakeModalOpen(false)} className="text-studio-400 hover:text-studio-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">视频来源 URL / 本地标识</label>
              <input
                type="text"
                value={takeForm.videoUrl}
                onChange={(e) => setTakeForm({ ...takeForm, videoUrl: e.target.value })}
                className="w-full bg-studio-950 border border-studio-700 text-xs text-studio-200 rounded px-3 py-2 focus:outline-none focus:border-gold-500 font-mono"
                placeholder="blob:my-video-clip 或 http://..."
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">初始审核状态 (Status)</label>
              <select
                value={takeForm.status}
                onChange={(e) => setTakeForm({ ...takeForm, status: e.target.value as TakeStatus })}
                className="w-full bg-studio-950 border border-studio-700 text-xs text-studio-200 rounded px-3 py-2 focus:outline-none focus:border-gold-500 font-mono"
              >
                <option value="DRAFT">DRAFT (草稿测试)</option>
                <option value="REVIEW">REVIEW (待审核)</option>
                <option value="SELECTED">SELECTED (直接设为选用镜头)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">导演反馈笔记 (Notes)</label>
              <textarea
                value={takeForm.notes}
                onChange={(e) => setTakeForm({ ...takeForm, notes: e.target.value })}
                className="w-full bg-studio-950 border border-studio-700 text-xs text-studio-200 rounded p-2.5 resize-none h-20 focus:outline-none focus:border-gold-500"
                placeholder="例如: 动作物理惯性好，第2秒摄影机推进速度稍快..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-studio-800">
              <button
                onClick={() => setTakeModalOpen(false)}
                className="px-3 py-1.5 text-xs text-studio-400 hover:text-studio-200"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!selectedShot) return;
                  studioStore.addShotTake(selectedShot.id, {
                    videoUrl: takeForm.videoUrl || `blob:take-${Date.now()}`,
                    notes: takeForm.notes || '导演录入镜头',
                    status: takeForm.status,
                  });
                  setTakeModalOpen(false);
                  setTakeForm({ videoUrl: '', notes: '', status: 'REVIEW' });
                }}
                className="bg-gold-500 hover:bg-gold-400 text-studio-950 text-xs font-semibold px-4 py-1.5 rounded transition-colors"
              >
                录入并保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: AI DIRECTOR DISCUSSION */}
      {aiDiscussionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <h3 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                AI 导演深度视听讨论指令 (ZERO API PROTOCOL)
              </h3>
              <button onClick={() => setAiDiscussionModal(false)} className="text-studio-400 hover:text-studio-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-studio-950 p-4 rounded border border-studio-800 text-xs font-sans text-studio-300 leading-relaxed space-y-2">
              <p className="font-semibold text-gold-400">第一步：复制下方指令发给 ChatGPT Pro / Gemini Pro</p>
              <p className="text-studio-400 text-[11px]">
                指令已自动整合当前剧集总纲、87Eleven动作设计、剧本原文、出场角色与当前道具状态。
              </p>
              <button
                onClick={handleCopyDirectorPrompt}
                className="bg-gold-500 hover:bg-gold-400 text-studio-950 font-mono text-xs font-semibold px-3.5 py-1.5 rounded flex items-center gap-1.5 transition-colors"
              >
                {copiedDirectorPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDirectorPrompt ? '已复制指令！' : '复制导演视听分析指令'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono text-studio-400 mb-1">
                第二步：将外部 AI 回传的标准 JSON 粘贴在此处
              </label>
              <textarea
                value={aiAnalysisInput}
                onChange={(e) => setAiAnalysisInput(e.target.value)}
                className="w-full bg-studio-950 border border-studio-800 rounded p-3 text-xs font-mono text-studio-200 resize-none h-44 focus:outline-none focus:border-gold-500"
                placeholder="粘贴包含 director_intention, visual_strategy 等字段的 JSON 文本..."
              />
            </div>

            {analysisResultNotice && (
              <div className="p-2.5 rounded text-xs font-mono bg-studio-800 text-gold-300 border border-gold-500/30">
                {analysisResultNotice}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-studio-800">
              <button
                onClick={() => setAiDiscussionModal(false)}
                className="px-3 py-1.5 text-xs text-studio-400 hover:text-studio-200"
              >
                取消
              </button>
              <button
                onClick={() => handleApplyAiAnalysis('MERGE')}
                className="bg-studio-800 hover:bg-studio-700 text-studio-200 text-xs px-3 py-1.5 rounded border border-studio-700"
              >
                增量合并 (Merge)
              </button>
              <button
                onClick={() => handleApplyAiAnalysis('REPLACE')}
                className="bg-gold-500 hover:bg-gold-400 text-studio-950 text-xs font-semibold px-4 py-1.5 rounded"
              >
                全量替换 (Replace)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6.1: PROMPT VERSION DIFF MODAL */}
      {promptDiffModalOpen && selectedShot && selectedShot.prompts && selectedShot.prompts.length >= 2 && (
        <PromptDiffModal
          prompts={selectedShot.prompts}
          onClose={() => setPromptDiffModalOpen(false)}
        />
      )}

      {/* MODAL 6.2: SCENE 10-ITEM READINESS MODAL */}
      {sceneReadinessModalOpen && currentScene && (
        <SceneReadinessModal
          scene={currentScene}
          selectedShot={selectedShot}
          onClose={() => setSceneReadinessModalOpen(false)}
        />
      )}

      {/* MODAL 6.3: PRINT SCENE DIRECTING CALL SHEET */}
      {printSheetModalOpen && currentScene && (
        <PrintSceneSheetModal
          scene={currentScene}
          selectedShot={selectedShot}
          onClose={() => setPrintSheetModalOpen(false)}
        />
      )}

      {/* MODAL 7: FULLSCREEN IMAGE PREVIEW */}
      {previewImageModal.open && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImageModal(prev => ({ ...prev, open: false }))}
        >
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center gap-2">
            <img
              src={previewImageModal.url}
              alt={previewImageModal.title}
              className="max-w-full max-h-[80vh] object-contain rounded border border-studio-700"
            />
            <span className="text-xs font-mono text-studio-400">
              {previewImageModal.title} (点击任意处关闭)
            </span>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION (DIRECTOR HUD) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-studio-950/95 border border-gold-500/80 text-studio-100 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-gold-400">{toastMessage.title}</div>
            {toastMessage.subtitle && (
              <div className="text-[11px] text-zinc-400 mt-0.5">{toastMessage.subtitle}</div>
            )}
          </div>
        </div>
      )}

      {/* DIRECTOR ON-SET FAST HUD (FLOATING CONSOLE) */}
      {selectedShot && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-5xl bg-studio-950/95 border rounded-2xl p-2.5 px-4 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 transition-all duration-300 ${
            isDirectorActive
              ? 'border-gold-500/80 shadow-gold-500/10'
              : 'border-studio-750/70 hover:border-gold-500/40'
          }`}
        >
          {/* Current Shot Info */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isDirectorActive ? 'bg-gold-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-mono font-bold text-gold-400">
              SC{String(currentScene.sceneNumber).padStart(2, '0')} / SHOT {String(selectedShot.shotNumber).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono text-zinc-300 hidden md:inline-block">
              {selectedShot.shotType} · {selectedShot.lens} · {selectedShot.cameraMovement}
            </span>
          </div>

          {/* Center 1-Click Fast Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickCopyPrompt(selectedShot, 'GOOGLE_FLOW')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
              title="一键复制 Google Flow 提示词 (快捷键: 1 或 F)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flow (1)</span>
            </button>

            <button
              onClick={() => handleQuickCopyPrompt(selectedShot, 'DREAMINA')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-md transition-all flex items-center gap-1.5"
              title="一键复制 Dreamina 提示词 (快捷键: 2 或 M)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dreamina (2)</span>
            </button>

            <button
              onClick={() => handleOpenPromptModal(selectedShot)}
              className="bg-studio-800 hover:bg-studio-700 text-gold-400 border border-gold-500/40 text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all hidden sm:flex items-center gap-1"
              title="查看完整 11 维 Master Prompt (快捷键: P)"
            >
              <span>Master (P)</span>
            </button>

            <button
              onClick={() => {
                setActiveReviewTakeIndex(0);
                setSceneReviewModal(true);
              }}
              className="bg-studio-800 hover:bg-studio-700 text-studio-200 border border-studio-700 text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all hidden sm:flex items-center gap-1"
              title="现场预演全场镜头序列 (快捷键: V)"
            >
              <Play className="w-3 h-3 fill-current text-gold-400" />
              <span>预演 (V)</span>
            </button>

            <button
              onClick={() => setTakeModalOpen(true)}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1"
              title="录入拍摄生成的实拍 Take"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Take</span>
            </button>
          </div>

          {/* Right: Quick Prev / Next Shot & Mode Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (currentScene?.shots && currentScene.shots.length > 0) {
                  const idx = currentScene.shots.findIndex((s) => s.id === selectedShotId);
                  if (idx > 0) setSelectedShotId(currentScene.shots[idx - 1].id);
                }
              }}
              title="上一镜头 (快捷键: [ 或 ←)"
              className="p-1.5 px-2 rounded-lg bg-studio-900 hover:bg-studio-800 text-zinc-300 border border-studio-800 text-xs font-mono"
            >
              ◀ [
            </button>

            <button
              onClick={() => {
                if (currentScene?.shots && currentScene.shots.length > 0) {
                  const idx = currentScene.shots.findIndex((s) => s.id === selectedShotId);
                  if (idx < currentScene.shots.length - 1) setSelectedShotId(currentScene.shots[idx + 1].id);
                }
              }}
              title="下一镜头 (快捷键: ] 或 →)"
              className="p-1.5 px-2 rounded-lg bg-studio-900 hover:bg-studio-800 text-zinc-300 border border-studio-800 text-xs font-mono"
            >
              ] ▶
            </button>

            <button
              onClick={() => {
                const next = !isDirectorActive;
                studioStore.setStudioMode(next ? 'DIRECTOR' : 'NORMAL');
                setDirectorMode(next);
              }}
              title={isDirectorActive ? '退出全屏导演模式' : '开启全屏导演模式 (快捷键: D)'}
              className={`p-1.5 rounded-lg border text-xs font-mono ml-1 transition-colors ${
                isDirectorActive
                  ? 'bg-gold-500/20 text-gold-400 border-gold-500/50'
                  : 'bg-studio-900 text-zinc-400 border-studio-800 hover:text-zinc-200'
              }`}
            >
              {isDirectorActive ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DirectorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-studio-400 font-mono text-xs">加载导演工作台...</div>}>
      <DirectorRoomContent />
    </Suspense>
  );
}
