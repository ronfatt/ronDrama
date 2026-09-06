'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tv,
  Plus,
  Clapperboard,
  Layers,
  ChevronDown,
  ChevronRight,
  Clock,
  Sparkles,
  Users,
  MapPin,
  Sword,
  Shirt,
  CheckCircle2,
  AlertTriangle,
  Film,
  Video,
  PlaySquare,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { Episode, Scene } from '@/lib/types';

export default function EpisodesPage() {
  const { episodes, projects, activeProjectId, continuityWarnings } = useStudioStore();
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const [expandedEpisodeId, setExpandedEpisodeId] = useState<string>(episodes[0]?.id || '');
  const [newEpModalOpen, setNewEpModalOpen] = useState(false);
  const [newSceneModal, setNewSceneModal] = useState<{ open: boolean; episodeId: string }>({
    open: false,
    episodeId: '',
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
            <Tv className="w-3.5 h-3.5" />
            <span>剧集与场次结构管理 • EPISODIC ARCHITECTURE & REVIEW</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>剧集与场次 (Episodes & Scenes)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            管理《{activeProject?.name || '当前作品'}》的分集剧本结构、场次矩阵审核、连贯性穿帮预警与导演拍摄进度。
          </p>
        </div>

        <button
          onClick={() => setNewEpModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ 添加新剧集</span>
        </button>
      </div>

      {/* Episodes Accordion */}
      <div className="space-y-6">
        {episodes.map((ep) => {
          const isExpanded = expandedEpisodeId === ep.id;
          const scenes = ep.scenes || [];
          const scenesCount = scenes.length;

          // Episode stats calculation
          const totalShots = scenes.reduce((acc, sc) => acc + (sc.shots?.length || 0), 0);
          const shotsWithTakes = scenes.reduce((acc, sc) => {
            return acc + (sc.shots?.filter(sh => sh.takes && sh.takes.length > 0).length || 0);
          }, 0);
          const completedTakesCount = scenes.reduce((acc, sc) => {
            return acc + (sc.shots?.filter(sh => sh.takes?.some(t => t.status === 'SELECTED')).length || 0);
          }, 0);

          // Runtime calculation
          const totalPlannedSec = scenes.reduce((acc, sc) => {
            const match = sc.duration?.match(/\d+/);
            return acc + (match ? parseInt(match[0], 10) : 120);
          }, 0);
          const completedSec = scenes.reduce((acc, sc) => {
            return acc + (sc.shots?.filter(sh => sh.takes?.some(t => t.status === 'SELECTED')).reduce((shotAcc, sh) => {
              const durNum = typeof sh.duration === 'number' ? sh.duration : parseInt(String(sh.duration || '4'), 10) || 4;
              return shotAcc + durNum;
            }, 0) || 0);
          }, 0);

          // Continuity warnings for this episode's scenes
          const epWarnings = continuityWarnings.filter(w =>
            w.status === 'ACTIVE' && scenes.some(sc => sc.id === w.sceneId)
          );

          // Missing shots: scenes that have 0 shots
          const scenesWithoutShots = scenes.filter(sc => !sc.shots || sc.shots.length === 0).length;

          return (
            <div
              key={ep.id}
              className="rounded-xl bg-studio-900 border border-studio-700/80 overflow-hidden shadow-xl"
            >
              {/* Episode Header Bar */}
              <div
                onClick={() => setExpandedEpisodeId(isExpanded ? '' : ep.id)}
                className="p-5 flex items-center justify-between cursor-pointer bg-studio-850 hover:bg-studio-800 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-lg bg-studio-800 border border-studio-700 flex items-center justify-center font-mono font-black text-gold-400 text-sm">
                    EP{ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-wide">
                        第 0{ep.episodeNumber} 集：{ep.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {ep.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{ep.logline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-gold-400" />
                      <span>{scenesCount} 场次</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-gold-400" />
                      <span>{totalShots} 分镜</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>目标 {ep.runtime}</span>
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  )}
                </div>
              </div>

              {/* Episode Body */}
              {isExpanded && (
                <div className="p-6 border-t border-studio-750 bg-studio-900/60 space-y-6">
                  {/* ========================================================================= */}
                  {/* 1. EPISODE REVIEW WIDGET & SCENE MATRIX (ROUND 3 CORE) */}
                  {/* ========================================================================= */}
                  <div className="p-5 rounded-xl bg-studio-950 border border-gold-500/20 space-y-4 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-studio-800 pb-3">
                      <div className="flex items-center gap-2">
                        <PlaySquare className="w-4 h-4 text-gold-400" />
                        <h3 className="text-xs font-mono uppercase font-black tracking-widest text-white">
                          本集制片矩阵与全局巡审 (EPISODE REVIEW & SCENE MATRIX)
                        </h3>
                      </div>

                      {scenes.length > 0 && (
                        <Link
                          href={`/director?sceneId=${scenes[0].id}`}
                          className="flex items-center gap-1.5 px-3 py-1 rounded bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-bold transition-colors"
                        >
                          <Clapperboard className="w-3.5 h-3.5" />
                          <span>一键进入本集导演工作台</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    {/* Quick Metrics Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-lg bg-studio-900 border border-studio-800 space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">总时长 / 已完成时长</span>
                        <div className="text-white font-bold text-sm">
                          {Math.floor(totalPlannedSec / 60)}m {totalPlannedSec % 60}s / <span className="text-emerald-400">{Math.floor(completedSec / 60)}m {completedSec % 60}s</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-studio-900 border border-studio-800 space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">分镜构建率</span>
                        <div className="text-white font-bold text-sm">
                          {totalShots} 镜头 <span className="text-zinc-500 text-xs font-normal">({totalShots > 0 ? Math.round((shotsWithTakes / totalShots) * 100) : 0}% 产出)</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-studio-900 border border-studio-800 space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">空缺分镜场次 (MISSING)</span>
                        <div className={`font-bold text-sm ${scenesWithoutShots > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {scenesWithoutShots} 场缺分镜
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-studio-900 border border-studio-800 space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">连贯性冲突警报 (CONTINUITY)</span>
                        <div className={`font-bold text-sm ${epWarnings.length > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                          {epWarnings.length > 0 ? `${epWarnings.length} 项需处理` : '0 穿帮冲突 ✓'}
                        </div>
                      </div>
                    </div>

                    {/* Scene Status Matrix (SC01 ✓, SC02 ✓, SC03 ⚠, SC04 ○, SC05 ○) */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>场次视觉与制作状态矩阵 (SCENE AUDIT MATRIX):</span>
                        <span className="text-[10px] text-zinc-500">点击任意场次直达工作台</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                        {scenes.map((sc) => {
                          const scWarnings = epWarnings.filter(w => w.sceneId === sc.id);
                          const scShots = sc.shots || [];
                          const hasShots = scShots.length > 0;
                          const hasApprovedTakes = hasShots && scShots.every(sh => sh.takes?.some(t => t.status === 'SELECTED'));

                          // Status determination
                          let statusSymbol = '○';
                          let statusColor = 'text-zinc-500 border-studio-800 bg-studio-900/60';
                          let statusText = '筹备中';

                          if (scWarnings.length > 0) {
                            statusSymbol = '⚠';
                            statusColor = 'text-amber-400 border-amber-500/50 bg-amber-950/20';
                            statusText = `${scWarnings.length}项警报`;
                          } else if (hasApprovedTakes) {
                            statusSymbol = '✓';
                            statusColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';
                            statusText = '已完成';
                          } else if (hasShots) {
                            statusSymbol = '●';
                            statusColor = 'text-gold-400 border-gold-500/40 bg-gold-950/20';
                            statusText = `${scShots.length}分镜进行中`;
                          }

                          return (
                            <Link
                              key={sc.id}
                              href={`/director?sceneId=${sc.id}`}
                              className={`p-3 rounded-lg border transition-all hover:scale-[1.02] flex flex-col justify-between gap-2 group cursor-pointer ${statusColor}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-black text-xs text-white group-hover:text-gold-400 transition-colors">
                                  SC0{sc.sceneNumber}
                                </span>
                                <span className="font-black text-sm">{statusSymbol}</span>
                              </div>

                              <div className="space-y-0.5">
                                <div className="text-[11px] font-bold text-zinc-200 line-clamp-1 group-hover:text-white">
                                  {sc.sceneTitle}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 line-clamp-1">
                                  {sc.locationName || sc.intExt}
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                <span>{statusText}</span>
                                <span>{scShots.length} 镜</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* 2. DETAILED SCENE BREAKDOWN LIST */}
                  {/* ========================================================================= */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                      场次细化列表 (SCENE BREAKDOWN LIST)
                    </span>
                    <button
                      onClick={() => setNewSceneModal({ open: true, episodeId: ep.id })}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>为第 0{ep.episodeNumber} 集添加新场次</span>
                    </button>
                  </div>

                  {scenes.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs bg-studio-850 rounded-lg border border-studio-750">
                      该集尚未添加场次，点击上方“添加场次”开始规划。
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scenes.map((sc) => {
                        const shotsCount = sc.shots?.length || 0;
                        const scWarnings = epWarnings.filter(w => w.sceneId === sc.id);

                        return (
                          <div
                            key={sc.id}
                            className="p-4 rounded-lg bg-studio-850 border border-studio-750 hover:border-studio-650 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                          >
                            <div className="space-y-2 max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-studio-800 text-gold-400 border border-studio-700">
                                  场次 0{sc.sceneNumber}
                                </span>
                                <span className="font-bold text-sm text-white">{sc.sceneTitle}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-studio-800">
                                  {sc.intExt}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-studio-800">
                                  {sc.timeOfDay}
                                </span>
                                {scWarnings.length > 0 && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-500/40">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>{scWarnings.length} 项连贯性冲突</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-zinc-400 line-clamp-1">{sc.storyPurpose}</p>

                              {/* Asset tags assigned to this scene */}
                              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                                {sc.characters.length > 0 && (
                                  <span className="flex items-center gap-1 text-zinc-400 bg-studio-800 px-2 py-0.5 rounded border border-studio-700">
                                    <Users className="w-3 h-3 text-gold-400" />
                                    <span>角色: {sc.characters.join(', ')}</span>
                                  </span>
                                )}
                                {sc.locationName && (
                                  <span className="flex items-center gap-1 text-zinc-400 bg-studio-800 px-2 py-0.5 rounded border border-studio-700">
                                    <MapPin className="w-3 h-3 text-gold-400" />
                                    <span>场景: {sc.locationName}</span>
                                  </span>
                                )}
                                {sc.props.length > 0 && (
                                  <span className="flex items-center gap-1 text-zinc-400 bg-studio-800 px-2 py-0.5 rounded border border-studio-700">
                                    <Sword className="w-3 h-3 text-gold-400" />
                                    <span>道具: {sc.props.join(', ')}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="px-2 py-1 rounded text-[10px] font-mono uppercase bg-studio-800 text-zinc-300 border border-studio-700">
                                {sc.productionStatus}
                              </span>

                              <Link
                                href={`/director?sceneId=${sc.id}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-colors"
                              >
                                <Clapperboard className="w-3.5 h-3.5" />
                                <span>进入导演工作台 ({shotsCount} 个分镜)</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ADD EPISODE MODAL */}
      {newEpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-studio-700/60 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">添加新剧集</h3>
              <button onClick={() => setNewEpModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const title = fd.get('title') as string;
                if (!title || !activeProject) return;

                studioStore.addEpisode({
                  projectId: activeProject.id,
                  episodeNumber: episodes.length + 1,
                  title,
                  logline: (fd.get('logline') as string) || '',
                  synopsis: (fd.get('synopsis') as string) || '',
                  runtime: (fd.get('runtime') as string) || '8 分钟',
                  status: '前期筹备',
                  directorNotes: '',
                  sortOrder: episodes.length + 1,
                });
                setNewEpModalOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">本集标题 Title *</label>
                <input
                  required
                  name="title"
                  type="text"
                  placeholder="例如: 血契破裂 (THE BLOOD COVENANT)"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">单集故事梗概 Logline</label>
                <textarea
                  name="logline"
                  rows={2}
                  placeholder="简述本集核心事件与悬念钩子..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">预估单集时长</label>
                <input
                  name="runtime"
                  type="text"
                  defaultValue="8 分钟"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="pt-4 border-t border-studio-750 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewEpModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-studio-800 text-zinc-300 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs"
                >
                  创建剧集
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SCENE MODAL */}
      {newSceneModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-studio-700/60 pb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">添加新场次</h3>
              <button onClick={() => setNewSceneModal({ open: false, episodeId: '' })} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const title = fd.get('title') as string;
                if (!title) return;

                const ep = episodes.find(ep => ep.id === newSceneModal.episodeId);
                const sceneNum = (ep?.scenes?.length || 0) + 1;

                studioStore.addScene(newSceneModal.episodeId, {
                  sceneNumber: sceneNum,
                  sceneTitle: title,
                  intExt: (fd.get('intExt') as 'INT' | 'EXT') || 'INT',
                  locationName: (fd.get('locationName') as string) || '默认片场',
                  timeOfDay: (fd.get('timeOfDay') as string) || 'NIGHT',
                  characters: ((fd.get('characters') as string) || '').split(',').map(s => s.trim()).filter(Boolean),
                  props: ((fd.get('props') as string) || '').split(',').map(s => s.trim()).filter(Boolean),
                  costumes: [],
                  storyPurpose: (fd.get('storyPurpose') as string) || '',
                  emotion: '紧张',
                  conflict: '',
                  duration: '2 分钟',
                  directorNotes: '',
                  directorScenePurpose: '',
                  directorEmotionalArc: '',
                  directorAudienceExperience: '',
                  directorPacing: '紧凑',
                  directorVisualStrategy: '',
                  directorPerformanceDirection: '',
                  directorCameraStrategy: '',
                  directorLightingStrategy: '',
                  directorTransition: '切 (Cut)',
                  productionStatus: 'SCRIPT READY',
                  sortOrder: sceneNum,
                });

                setNewSceneModal({ open: false, episodeId: '' });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">场次标题 Scene Title *</label>
                <input
                  required
                  name="title"
                  type="text"
                  placeholder="例如: 废弃造船厂仓库内 — 夜 (INT. ABANDONED WAREHOUSE - NIGHT)"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-300">内景/外景 (INT / EXT)</label>
                  <select
                    name="intExt"
                    className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="INT">INT 内景</option>
                    <option value="EXT">EXT 外景</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-300">拍摄时间 Time of Day</label>
                  <input
                    name="timeOfDay"
                    type="text"
                    defaultValue="NIGHT 夜晚"
                    className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">场景地点 Location</label>
                <input
                  name="locationName"
                  type="text"
                  placeholder="例如: 废弃造船厂仓库"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">出场角色 (逗号隔开)</label>
                <input
                  name="characters"
                  type="text"
                  placeholder="RON, KIRA"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">场次目的 Story Purpose</label>
                <textarea
                  name="storyPurpose"
                  rows={2}
                  placeholder="本场次的核心叙事目的与戏剧任务..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="pt-4 border-t border-studio-750 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewSceneModal({ open: false, episodeId: '' })}
                  className="px-4 py-2 rounded-lg bg-studio-800 text-zinc-300 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs"
                >
                  确认添加场次
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
