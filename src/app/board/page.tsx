'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Kanban,
  Tv,
  Clapperboard,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Filter,
  ListTree,
  Video,
  FileCheck,
  Check,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { Scene, SceneProductionStatus } from '@/lib/types';

const KANBAN_STAGES: Array<{ id: SceneProductionStatus; title: string; subtitle: string; color: string }> = [
  { id: 'NOT STARTED', title: '未开始', subtitle: 'NOT STARTED', color: 'border-zinc-700 text-zinc-400' },
  { id: 'SCRIPT READY', title: '剧本就绪', subtitle: 'SCRIPT READY', color: 'border-blue-500/50 text-blue-400' },
  { id: 'ASSETS READY', title: '资产就绪', subtitle: 'ASSETS READY', color: 'border-purple-500/50 text-purple-400' },
  { id: 'PROMPT READY', title: 'PROMPT就绪', subtitle: 'PROMPT READY', color: 'border-gold-500/50 text-gold-400' },
  { id: 'VIDEO GENERATED', title: '视频生成', subtitle: 'VIDEO GENERATED', color: 'border-amber-500/50 text-amber-400' },
  { id: 'COMPLETED', title: '制作完成', subtitle: 'COMPLETED', color: 'border-emerald-500/50 text-emerald-400' },
];

export default function ProductionBoardPage() {
  const { episodes, projects, activeProjectId } = useStudioStore();
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const [viewMode, setViewMode] = useState<'TREE' | 'KANBAN'>('TREE');
  const [filterEpisodeId, setFilterEpisodeId] = useState<string>('ALL');

  // Gather scenes based on filter
  const targetEpisodes = filterEpisodeId === 'ALL'
    ? episodes
    : episodes.filter((e) => e.id === filterEpisodeId);

  const allScenesWithEp: Array<{ epNumber: number; scene: Scene }> = [];
  targetEpisodes.forEach((ep) => {
    ep.scenes?.forEach((sc) => {
      allScenesWithEp.push({ epNumber: ep.episodeNumber, scene: sc });
    });
  });

  const handleStageChange = (sceneId: string, newStatus: SceneProductionStatus) => {
    studioStore.updateSceneProductionStatus(sceneId, newStatus);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
            <Kanban className="w-3.5 h-3.5" />
            <span>PRODUCTION BOARD 2.0 • 制作流程看板</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>制作看板 (Production Board)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            全景看板追踪剧集 → 场次 → 分镜 Prompt 就绪率与视频成片上传进度。
          </p>
        </div>

        {/* View Switcher & Episode Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-studio-850 p-1 rounded-lg border border-studio-750">
            <button
              onClick={() => setViewMode('TREE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                viewMode === 'TREE'
                  ? 'bg-gold-500 text-studio-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              <span>分层状态树 (EPISODE TREE)</span>
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-gold-500 text-studio-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>阶段看板 (KANBAN)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-gold-400" />
            <select
              value={filterEpisodeId}
              onChange={(e) => setFilterEpisodeId(e.target.value)}
              className="bg-studio-850 border border-studio-700 hover:border-gold-500/50 text-white font-bold text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="ALL">全部剧集 ({episodes.length} 集)</option>
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>
                  第 0{ep.episodeNumber} 集: {ep.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: HIERARCHICAL PRODUCTION TREE (EPISODE → SCENES → SHOT STATUS) */}
      {viewMode === 'TREE' && (
        <div className="space-y-6 animate-in fade-in">
          {targetEpisodes.map((ep) => {
            const totalEpShots = ep.scenes?.reduce((acc, sc) => acc + (sc.shots?.length || 0), 0) || 0;
            const totalEpPromptsReady = ep.scenes?.reduce(
              (acc, sc) => acc + (sc.shots?.filter((s) => s.prompts && s.prompts.length > 0).length || 0),
              0
            ) || 0;
            const totalEpVideosUploaded = ep.scenes?.reduce(
              (acc, sc) => acc + (sc.shots?.filter((s) => s.takes && s.takes.length > 0).length || 0),
              0
            ) || 0;

            return (
              <div
                key={ep.id}
                className="rounded-xl bg-studio-900 border border-studio-750 overflow-hidden shadow-xl"
              >
                {/* Episode Banner */}
                <div className="p-4 bg-studio-850 border-b border-studio-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-studio-800 font-mono font-black text-gold-400 text-xs flex items-center justify-center border border-studio-700">
                      EP0{ep.episodeNumber}
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white tracking-wide">
                        第 0{ep.episodeNumber} 集：{ep.title}
                      </h2>
                      <p className="text-xs text-zinc-400 line-clamp-1">{ep.logline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-gold-400" />
                      <span>{ep.scenes?.length || 0} 场次</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-gold-400" />
                      <span>
                        {totalEpPromptsReady} / {totalEpShots} prompts ready
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {totalEpVideosUploaded} / {totalEpShots} videos uploaded
                      </span>
                    </span>
                  </div>
                </div>

                {/* Scenes Table Breakdown */}
                <div className="divide-y divide-studio-800/80 p-3 space-y-2">
                  {ep.scenes?.map((sc) => {
                    const shotsCount = sc.shots?.length || 0;
                    const promptsReady = sc.shots?.filter((s) => s.prompts && s.prompts.length > 0).length || 0;
                    const videosUploaded = sc.shots?.filter((s) => s.takes && s.takes.length > 0).length || 0;
                    const shotsDesigned = sc.shots?.filter((s) => s.action || s.subject).length || 0;

                    const promptPercent = shotsCount > 0 ? Math.round((promptsReady / shotsCount) * 100) : 0;
                    const videoPercent = shotsCount > 0 ? Math.round((videosUploaded / shotsCount) * 100) : 0;

                    return (
                      <div
                        key={sc.id}
                        className="p-3.5 rounded-lg bg-studio-950/60 hover:bg-studio-950 border border-studio-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                      >
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-gold-400">
                              SC0{sc.sceneNumber}
                            </span>
                            <span className="text-xs font-bold text-white">{sc.sceneTitle}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-studio-800 text-zinc-400">
                              {sc.locationName}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1">{sc.storyPurpose}</p>
                        </div>

                        {/* Telemetry Metrics */}
                        <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono min-w-[340px]">
                          <div className="p-2 rounded bg-studio-900 border border-studio-800">
                            <div className="text-[10px] text-zinc-500 uppercase">Shots Designed</div>
                            <div className="text-white font-bold text-xs mt-0.5">
                              {shotsDesigned} / {shotsCount}
                            </div>
                          </div>

                          <div className="p-2 rounded bg-studio-900 border border-studio-800">
                            <div className="text-[10px] text-gold-400 uppercase">Prompts Ready</div>
                            <div className="text-gold-400 font-bold text-xs mt-0.5">
                              {promptsReady} / {shotsCount} ({promptPercent}%)
                            </div>
                          </div>

                          <div className="p-2 rounded bg-studio-900 border border-studio-800">
                            <div className="text-[10px] text-emerald-400 uppercase">Videos Uploaded</div>
                            <div className="text-emerald-400 font-bold text-xs mt-0.5">
                              {videosUploaded} / {shotsCount} ({videoPercent}%)
                            </div>
                          </div>
                        </div>

                        {/* Quick Jump Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/director?sceneId=${sc.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-studio-800 hover:bg-studio-750 text-gold-400 text-xs font-semibold border border-studio-700 transition-colors"
                          >
                            <Clapperboard className="w-3.5 h-3.5" />
                            <span>前往导演工作台 →</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: KANBAN BOARD */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start animate-in fade-in">
          {KANBAN_STAGES.map((stage) => {
            const scenesInStage = allScenesWithEp.filter((s) => s.scene.productionStatus === stage.id);
            return (
              <div
                key={stage.id}
                className="rounded-xl bg-studio-900 border border-studio-750 flex flex-col min-h-[520px] shadow-xl overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-studio-750 bg-studio-850 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide">{stage.title}</h3>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">{stage.subtitle}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${stage.color}`}>
                    {scenesInStage.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {scenesInStage.map((item) => {
                    const sc = item.scene;
                    const shotsCount = sc.shots?.length || 0;
                    return (
                      <div
                        key={sc.id}
                        className="p-3.5 rounded-lg bg-studio-950 border border-studio-800 hover:border-gold-500/40 transition-all space-y-2.5 shadow-sm group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-gold-400">
                            EP0{item.epNumber} / SC0{sc.sceneNumber}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">{sc.duration}</span>
                        </div>

                        <h4 className="text-xs font-bold text-zinc-200 line-clamp-1 leading-snug">
                          {sc.sceneTitle}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span>{sc.locationName || 'SET'}</span>
                          <span>{shotsCount} 分镜</span>
                        </div>

                        {/* Stage Mover Selector */}
                        <div className="pt-2 border-t border-studio-850 flex items-center justify-between">
                          <select
                            value={sc.productionStatus}
                            onChange={(e) => handleStageChange(sc.id, e.target.value as SceneProductionStatus)}
                            className="bg-studio-900 border border-studio-800 text-zinc-300 text-[10px] font-mono rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {KANBAN_STAGES.map((st) => (
                              <option key={st.id} value={st.id}>
                                → {st.title}
                              </option>
                            ))}
                          </select>

                          <Link
                            href={`/director?sceneId=${sc.id}`}
                            className="text-zinc-500 hover:text-gold-400 p-0.5"
                            title="前往导演台"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
