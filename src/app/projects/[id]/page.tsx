'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Film,
  BookOpen,
  Save,
  Check,
  Clapperboard,
  Sparkles,
  Camera,
  SunMedium,
  Palette,
  Eye,
  Scissors,
  Globe,
  Zap,
  ShieldAlert,
  Sliders,
  Flame,
  Volume2,
  Crosshair,
  Layers,
  Wand2,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { ProjectBible, ActionBible } from '@/lib/types';
import { DEMO_PROJECT_BIBLE, DEMO_ACTION_BIBLE } from '@/lib/demoData';

export default function ProjectBiblePage() {
  const params = useParams();
  const projectId = params.id as string;
  const { projects, bibles, actionBibles } = useStudioStore();

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const bible = bibles[projectId] || (project ? bibles[project.id] : undefined);
  const actionBible = actionBibles?.[projectId] || (project ? actionBibles?.[project.id] : undefined);

  const [activeTab, setActiveTab] = useState<'director' | 'action' | 'narrative'>('director');
  const [saved, setSaved] = useState(false);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ProjectBible>>({});
  const [actionFormData, setActionFormData] = useState<Partial<ActionBible>>({});

  useEffect(() => {
    if (bible) {
      setFormData(bible);
    }
    if (actionBible) {
      setActionFormData(actionBible);
    } else {
      setActionFormData(DEMO_ACTION_BIBLE);
    }
  }, [bible, actionBible]);

  const handleSave = () => {
    if (project) {
      studioStore.updateProjectBible(project.id, formData);
      studioStore.updateActionBible(project.id, actionFormData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const applyHollywoodMasterPreset = () => {
    setFormData((prev) => ({
      ...prev,
      lensKitSpecs: 'Arri Alexa 65 Large Format, Panavision C-Series Anamorphic T2.0 Prime Lenses, 180° Shutter Angle',
      colorGradingLUT: 'Arri LogC3 to Kodak Vision3 5219 / 2383 Print Film Emulation LUT, Deep Cyan Shadows, Warm Amber Highlights',
      lightingRatios: '8:1 High-contrast Key-to-Fill (Chiaroscuro), Volumetric Atmospheric Haze, Hard Tungsten Rim Light',
      blockingAndStaging: 'Deep multi-plane staging, triangular subject geometry, leading lines framing characters against monolithic backdrops',
      soundDesignPhilosophy: 'Sub-bass visceral resonance, hyper-tactile metallic foley, high dynamic range silence juxtaposed with thunderous impacts',
      visualStyle: 'Photorealistic Hollywood feature film aesthetic, authentic 35mm grain, organic lens breathing, anamorphic oval bokeh',
      editingRhythm: 'Intense rhythmic tension, disciplined deliberate pacing broken by explosive micro-bursts of kinetic momentum',
    }));

    setActionFormData((prev) => ({
      ...prev,
      stuntDesignStyle: '87Eleven Tactical Gun-Fu & Japanese Kenjutsu, grounded brutal choreographies without wirework floatiness',
      combatPhysics: 'Strict mass momentum conservation, visceral bone-shattering blunt force, heavy kinetic inertia, weight transfer',
      weaponDynamics: 'Damascus carbon steel blade parry sparks, muzzle flash chamber smoke venting, spent brass casing ejecting, realistic slide recoil',
      cameraChoreography: 'Dynamic steadicam tracking matching fighter speed, fluid orbital tracking shots, rapid whip-pans strictly on physical impact points',
      impactVelocity: 'Explosive kinetic accelerations punctuated by brief dramatic pauses, high frame integrity without disorienting shaky cam',
      spatialDestruction: 'Environmental destruction: micro-glass particle shattering, drywall dust bursts, concrete spalling, shattered wood splinters',
      safetyAndContinuity: 'Progressive wound accumulation, blood spatter persistence on skin and fabric, consistent clothing tears and abrasions across takes',
    }));

    setPresetNotice('已一键加载「87Eleven / 维伦纽瓦」好莱坞顶级动作与视听工业母本设定！');
    setTimeout(() => setPresetNotice(null), 3500);
  };

  if (!project) {
    return (
      <div className="p-8 text-center text-zinc-400">
        未找到该连续剧项目。{' '}
        <Link href="/" className="text-gold-400 underline">
          返回制作控制中心
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumbs and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-zinc-300">
              PRODUCTIONS
            </Link>
            <span>/</span>
            <span className="text-gold-400">{project.name}</span>
            <span>/</span>
            <span>DIRECTOR & ACTION MASTER BIBLES</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-gold-500" />
            <span>影视母本总纲 (Master Bibles)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            涵盖国际院线级【导演视听总纲】与【动作设计总纲】，直接注入 Google Flow / Dreamina 分镜生成引擎，确保成片具备好莱坞电影级质感与动作连贯性。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={applyHollywoodMasterPreset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-gold-400 hover:text-gold-300 font-medium text-xs border border-gold-500/30 transition-all"
            title="快速填充好莱坞院线级（87Eleven动作体系 + 维伦纽瓦视听摄影）标准参数"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>应用好莱坞电影级预设</span>
          </button>

          <Link
            href="/director"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-200 font-semibold text-xs border border-studio-700 transition-colors"
          >
            <Clapperboard className="w-3.5 h-3.5 text-gold-400" />
            <span>前往导演工作台</span>
          </Link>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-md shadow-gold-500/20 transition-all hover:scale-[1.02]"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>总纲设定已保存！</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存母本总纲 (Save All)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {presetNotice && (
        <div className="p-3 bg-gold-500/10 border border-gold-500/30 rounded-lg flex items-center justify-between text-xs text-gold-300 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>{presetNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">点击右上角「保存母本总纲」即可固化到项目</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-studio-800 space-x-2">
        <button
          onClick={() => setActiveTab('director')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'director'
              ? 'border-gold-500 text-gold-400 bg-gold-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Clapperboard className="w-4 h-4" />
          <span>导演视听总纲 (Director Bible)</span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-gold-500/20 text-gold-300 font-mono">
            HOLLYWOOD CINEMATOGRAPHY
          </span>
        </button>

        <button
          onClick={() => setActiveTab('action')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'action'
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>动作设计总纲 (Action Bible)</span>
          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono">
            87ELEVEN STUNT SPEC
          </span>
        </button>

        <button
          onClick={() => setActiveTab('narrative')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'narrative'
              ? 'border-blue-500 text-blue-400 bg-blue-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
        >
          <Globe className="w-4 h-4 text-blue-400" />
          <span>叙事与世界观 (Narrative & World)</span>
        </button>
      </div>

      {/* Tab 1: Director Bible (Hollywood Cinematography Standard) */}
      {activeTab === 'director' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-gradient-to-r from-studio-900 via-studio-900 to-studio-850 border border-gold-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>好莱坞电影工业视听标准设定 (International Feature-Film Quality)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-gold-500/20 text-gold-300 border border-gold-500/30">
                    MASTER PROMPT INJECTION
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  以下光学镜头、色彩科学、光比与构图将作为核心权重，在生成分镜 Prompt 时自动注入底模与控制网。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optics & Color Science */}
            <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-5">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>光学规格与色彩科学 (OPTICS & COLOR SCIENCE)</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-gold-500" />
                    <span>镜头光学与机身规格 (Lens Kit & Optical Profile)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">PROMPT: OPTICS</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.lensKitSpecs || ''}
                  onChange={(e) => setFormData({ ...formData, lensKitSpecs: e.target.value })}
                  placeholder="例如: Arri Alexa 65 Large Format, Panavision C-Series Anamorphic T2.0, 180° shutter angle, shallow depth of field..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-gold-500" />
                    <span>调色体系与胶片模拟 LUT (Color Grading & Film Stock)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">PROMPT: COLOR SCIENCE</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.colorGradingLUT || ''}
                  onChange={(e) => setFormData({ ...formData, colorGradingLUT: e.target.value })}
                  placeholder="例如: Kodak Vision3 5219 / 2383 Print Film Emulation LUT, deep cyan in shadows, warm skin-tones, muted midtones..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <SunMedium className="w-3.5 h-3.5 text-gold-500" />
                    <span>光比与照明哲学 (Lighting Ratios & Philosophy)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">PROMPT: LIGHTING</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.lightingRatios || ''}
                  onChange={(e) => setFormData({ ...formData, lightingRatios: e.target.value })}
                  placeholder="例如: 8:1 high contrast key-to-fill ratio, moody chiaroscuro, volumetric atmospheric haze, hard tungsten edge backlight..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                  <span>视觉基调总述 (Overall Visual Style)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.visualStyle || ''}
                  onChange={(e) => setFormData({ ...formData, visualStyle: e.target.value })}
                  placeholder="Cinematic / Photorealistic, authentic 35mm grain, organic lens breathing, anamorphic oval bokeh..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Staging, Movement & Auditory Physics */}
            <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-5">
              <h2 className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>场面调度、运镜与声学 (STAGING, CAMERA & SOUND)</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-gold-500" />
                    <span>演员走位与场面调度 (Blocking & Staging Philosophy)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">PROMPT: STAGING</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.blockingAndStaging || ''}
                  onChange={(e) => setFormData({ ...formData, blockingAndStaging: e.target.value })}
                  placeholder="例如: Deep staging with multi-plane depth, triangular blocking, characters isolated against industrial architecture..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-gold-500" />
                    <span>摄影机运动规律 (Camera Language & Dynamics)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">GOOGLE FLOW / DREAMINA</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.cameraLanguage || ''}
                  onChange={(e) => setFormData({ ...formData, cameraLanguage: e.target.value })}
                  placeholder="例如: 低机位缓慢推移、斯坦尼康平稳跟焦、对决瞬间采用精准水平横移 (Dolly tracking)..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-gold-500" />
                    <span>剪辑呼吸与节奏 (Editing Rhythm & Tension)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">PACING</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.editingRhythm || ''}
                  onChange={(e) => setFormData({ ...formData, editingRhythm: e.target.value })}
                  placeholder="例如: 极度克制的呼吸感凝滞与突如其来的雷霆瞬间爆发交替，长镜头保持张力..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-gold-500" />
                    <span>声音设计与拟音哲学 (Sound Design & Foley Philosophy)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">AUDITORY ATMOSPHERE</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.soundDesignPhilosophy || ''}
                  onChange={(e) => setFormData({ ...formData, soundDesignPhilosophy: e.target.value })}
                  placeholder="例如: 超低频次声共鸣 (Sub-bass drone)、金属刀锋出鞘高保真拟音、枪机回膛微机械声..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Full Width: Director's Vision */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-3">
              <label className="text-xs font-mono uppercase tracking-widest text-gold-400 font-bold flex items-center gap-2">
                <Clapperboard className="w-4 h-4" />
                <span>导演终极构想 (Director&apos;s Grand Vision & Thematic Core)</span>
              </label>
              <textarea
                rows={3}
                value={formData.directorsVision || ''}
                onChange={(e) => setFormData({ ...formData, directorsVision: e.target.value })}
                placeholder="在此写下整部连续剧在艺术与工业层面的终极追求：例如「将冷酷写实的东欧新黑色电影美学，与极致精确的现代战术格斗融为一体，每个镜头都必须达到大银幕放映标准」..."
                className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Action Bible (International Stunt & Physics Specification) */}
      {activeTab === 'action' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-gradient-to-r from-studio-900 via-studio-900 to-studio-850 border border-amber-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>国际专业级动作设计总纲 (Hollywood Action & Stunt Bible)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    87ELEVEN / CHAD STAHELSKI STANDARD
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  严禁悬浮虚假摆拍，确立质量惯性、冷兵器与枪械动力学、运镜协同与环境破坏物理准则，确保生成的连续剧打戏具有硬核大片张力。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Combat Style & Kinetic Physics */}
            <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-5">
              <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span>特技流派与打击物理法则 (STUNT & COMBAT PHYSICS)</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>动作武指流派 (Stunt Design & Martial Style)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">TACTICAL / MARTIAL</span>
                </label>
                <textarea
                  rows={2}
                  value={actionFormData.stuntDesignStyle || ''}
                  onChange={(e) => setActionFormData({ ...actionFormData, stuntDesignStyle: e.target.value })}
                  placeholder="例如: 87Eleven Tactical Gun-Fu & Japanese Kenjutsu, grounded brutal choreographies without wirework floatiness..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>打击感与质量惯性物理法则 (Combat Physics & Inertia)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">MASS & MOMENTUM</span>
                </label>
                <textarea
                  rows={2}
                  value={actionFormData.combatPhysics || ''}
                  onChange={(e) => setActionFormData({ ...actionFormData, combatPhysics: e.target.value })}
                  placeholder="例如: Strict mass momentum conservation, visceral bone-shattering blunt force, heavy kinetic inertia, realistic recoil..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>发力节奏与打击律动 (Impact Velocity & Cadence)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">EXPLOSION & STILLNESS</span>
                </label>
                <textarea
                  rows={2}
                  value={actionFormData.impactVelocity || ''}
                  onChange={(e) => setActionFormData({ ...actionFormData, impactVelocity: e.target.value })}
                  placeholder="例如: Explosive kinetic accelerations punctuated by brief dramatic pauses, high frame integrity without disorienting shaky cam..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Column 2: Weapons, Camera & Environmental Destruction */}
            <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-5">
              <h2 className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                <Crosshair className="w-4 h-4" />
                <span>武器力学、运镜协同与物理破坏 (DYNAMICS & CHOREOGRAPHY)</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>武器交互与弹道轨迹动力学 (Weapon Dynamics & Mechanics)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">WEAPONS & BALLISTICS</span>
                </label>
                <textarea
                  rows={2}
                  value={actionFormData.weaponDynamics || ''}
                  onChange={(e) => setActionFormData({ ...actionFormData, weaponDynamics: e.target.value })}
                  placeholder="例如: Damascus carbon steel blade parry sparks, muzzle flash chamber smoke venting, spent brass casing ejecting..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>摄影机与打斗动作同步调度 (Camera Choreography & Sync)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">STEADICAM & WHIP PANS</span>
                </label>
                <textarea
                  rows={2}
                  value={actionFormData.cameraChoreography || ''}
                  onChange={(e) => setActionFormData({ ...actionFormData, cameraChoreography: e.target.value })}
                  placeholder="例如: Dynamic steadicam tracking matching fighter speed, fluid orbital tracking shots, rapid whip-pans strictly on physical impact points..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-300 uppercase flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>环境物理交互与破坏规范 (Spatial Destruction & Physics)</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">ENVIRONMENTAL INTERACTION</span>
                </label>
                <textarea
                  rows={2}
                  value={actionFormData.spatialDestruction || ''}
                  onChange={(e) => setActionFormData({ ...actionFormData, spatialDestruction: e.target.value })}
                  placeholder="例如: Environmental destruction: micro-glass particle shattering, drywall dust bursts, concrete spalling, shattered wood splinters..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>
            </div>

            {/* Full Width: Continuity & Wound Progression */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-3">
              <label className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>动作连贯性与伤害递进规范 (Stunt Continuity & Wound / Wardrobe Progression)</span>
              </label>
              <textarea
                rows={3}
                value={actionFormData.safetyAndContinuity || ''}
                onChange={(e) => setActionFormData({ ...actionFormData, safetyAndContinuity: e.target.value })}
                placeholder="例如: 伤痕与血迹在分镜间严格保留递增，撕裂衣物纤维需维持磨损位置一致；替身切换保持头身比例与动作发力方向的完全守恒..."
                className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Narrative & World Foundation */}
      {activeTab === 'narrative' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* Left Column: Narrative Foundation */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>故事叙事基底 (NARRATIVE FOUNDATION)</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">故事梗概 LOGLINE</label>
                <textarea
                  rows={3}
                  value={formData.logline || ''}
                  onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">类型流派 GENRE</label>
                <input
                  type="text"
                  value={formData.genre || ''}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">主题思想 THEME</label>
                <textarea
                  rows={2}
                  value={formData.theme || ''}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  placeholder="核心道德困境、哲学命题..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">氛围基调 TONE</label>
                <input
                  type="text"
                  value={formData.tone || ''}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">时代 ERA</label>
                  <input
                    type="text"
                    value={formData.era || ''}
                    onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                    className="w-full bg-studio-800 border border-studio-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">主要地点 LOCATION</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-studio-800 border border-studio-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: World Rules & Social Structure */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>世界观构架与法则 (WORLD LAWS & SOCIETY)</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">
                  世界法则、势力结构与科技/社会背景
                </label>
                <textarea
                  rows={8}
                  value={formData.world || ''}
                  onChange={(e) => setFormData({ ...formData, world: e.target.value })}
                  placeholder="定义世界背后的隐秘规则、暗杀组织协议、权力机构、社会底层生态与科技水平..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-4 rounded-lg bg-studio-950 border border-studio-800 text-xs text-zinc-400 space-y-2">
                <div className="font-mono text-gold-400 text-[11px] uppercase font-bold">
                  💡 导演工作流提示 (DIRECTOR WORKFLOW TIP)
                </div>
                <p>
                  设定总纲中的【世界观法则】、【镜头光学规格】与【动作设计物理参数】将在「导演工作台」中自动作为上下文参数传递给各个分镜。如果某场次需要特殊的动作风格，可直接在分镜编辑面板中进行局部覆盖。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
