'use client';

import React from 'react';
import Link from 'next/link';
import {
  Film,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clapperboard,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Sliders,
  Check,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';

export default function DashboardPage() {
  const { projects, episodes, activeProjectId, isHydrated } = useStudioStore();
  const summary = isHydrated ? studioStore.getProductionSummary() : null;
  const directorData = isHydrated ? studioStore.getDirectorDashboardData() : null;
  const health = isHydrated ? studioStore.calculateProductionHealth() : null;
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Hero Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-studio-900 via-studio-850 to-studio-900 border border-studio-700/60 p-8 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-gold-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-gold-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>影视连续剧制作控制中心 • Production Control Center</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {activeProject?.name || '我的制作项目 (My Productions)'}
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
              {activeProject?.logline || '个人专属 AI 剧集前期筹备、视听语言设定、分镜生成与连贯性管理工作站。'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/director"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-sm shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02]"
            >
              <Clapperboard className="w-4 h-4" />
              <span>进入导演工作台</span>
            </Link>
            <Link
              href="/projects/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-200 font-semibold text-sm border border-studio-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>新建连续剧</span>
            </Link>
          </div>
        </div>

        {/* Cinematic Production Telemetry Bar */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-6 border-t border-studio-700/50">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold">总剧集数 EPISODES</span>
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-zinc-400" />
                <span className="text-xl font-bold text-white">{summary.totalEpisodes} 集</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold">总场次数 SCENES</span>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-zinc-400" />
                <span className="text-xl font-bold text-white">{summary.totalScenes} 场</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold">当前焦点 NEXT UP</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-studio-700 text-gold-400 border border-studio-600">
                  {summary.nextSceneDisplay}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold">连贯性警告 CONTINUITY</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${summary.continuityWarningsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className={`text-xl font-bold ${summary.continuityWarningsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {summary.continuityWarningsCount} 条警报
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold">PROMPT 已就绪</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span className="text-xl font-bold text-gold-400">{summary.promptsReadyCount} 组</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-bold">前期筹备进度</span>
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-emerald-400">{summary.preProductionPercentage}%</div>
                <div className="w-full bg-studio-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-gold-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${summary.preProductionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ROUND 3: DIRECTOR DASHBOARD & WHAT SHOULD I DO NEXT */}
      {directorData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Director Production Dashboard */}
          <div className="lg:col-span-2 bg-studio-900 border border-studio-800 rounded-xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-studio-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold-400" />
                <h2 className="text-sm font-mono font-bold text-studio-100 uppercase tracking-wider">
                  DIRECTOR DASHBOARD 导演制作大盘
                </h2>
              </div>
              <span className="text-xs font-mono text-studio-400">
                {directorData.counts.episodes} 集 • {directorData.counts.scenes} 场 • {directorData.counts.shots} 分镜
              </span>
            </div>

            {/* 6 Stage Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-studio-950/60 p-3.5 rounded-lg border border-studio-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-studio-400 font-semibold">1. SCRIPT 剧本</span>
                  <span className="text-emerald-400 font-bold">{directorData.percentages.script}%</span>
                </div>
                <div className="w-full bg-studio-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${directorData.percentages.script}%` }} />
                </div>
              </div>

              <div className="bg-studio-950/60 p-3.5 rounded-lg border border-studio-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-studio-400 font-semibold">2. ASSETS 资产</span>
                  <span className="text-emerald-400 font-bold">{directorData.percentages.assets}%</span>
                </div>
                <div className="w-full bg-studio-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${directorData.percentages.assets}%` }} />
                </div>
              </div>

              <div className="bg-studio-950/60 p-3.5 rounded-lg border border-studio-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-studio-400 font-semibold">3. DIRECTOR 构想</span>
                  <span className="text-emerald-400 font-bold">{directorData.percentages.director}%</span>
                </div>
                <div className="w-full bg-studio-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${directorData.percentages.director}%` }} />
                </div>
              </div>

              <div className="bg-studio-950/60 p-3.5 rounded-lg border border-studio-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-studio-400 font-semibold">4. PROMPTS 提示词</span>
                  <span className="text-gold-400 font-bold">{directorData.percentages.prompts}%</span>
                </div>
                <div className="w-full bg-studio-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gold-500 h-full" style={{ width: `${directorData.percentages.prompts}%` }} />
                </div>
              </div>

              <div className="bg-studio-950/60 p-3.5 rounded-lg border border-studio-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-studio-400 font-semibold">5. VIDEO 视频</span>
                  <span className="text-amber-400 font-bold">{directorData.percentages.video}%</span>
                </div>
                <div className="w-full bg-studio-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${directorData.percentages.video}%` }} />
                </div>
              </div>

              <div className="bg-studio-950/60 p-3.5 rounded-lg border border-studio-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-studio-400 font-semibold">6. FINAL 终剪</span>
                  <span className="text-studio-300 font-bold">{directorData.percentages.final}%</span>
                </div>
                <div className="w-full bg-studio-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${directorData.percentages.final}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: "WHAT SHOULD I DO NEXT?" & PRODUCTION HEALTH */}
          <div className="space-y-4">
            {/* What should I do next Card */}
            <div className="bg-gradient-to-br from-studio-900 to-studio-950 border border-gold-500/40 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <div className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold flex items-center gap-1.5 mb-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>WHAT SHOULD I DO NEXT? 下一步动作</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-gold-300 transition-colors">
                {directorData.nextAction.title}
              </h3>
              <p className="text-xs text-studio-400 mt-1 leading-relaxed">
                {directorData.nextAction.subtitle}
              </p>

              <div className="mt-4">
                <Link
                  href={directorData.nextAction.url}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs transition-all shadow-md shadow-gold-500/10"
                >
                  <span>{directorData.nextAction.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Production Health 2.0 */}
            <div className="bg-studio-900 border border-studio-800 rounded-xl p-4 shadow-xl text-xs font-mono space-y-2.5">
              <div className="text-studio-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-studio-800 pb-2">
                <span className="flex items-center gap-1.5 text-white">
                  <span>PRODUCTION HEALTH 2.0</span>
                  {health && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/40 font-bold">
                      {health.overallScore}%
                    </span>
                  )}
                </span>
                <Link href="/continuity" className="text-gold-400 hover:underline">查看时空矩阵 →</Link>
              </div>

              {health && (
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                  <div className="bg-studio-950 p-2 rounded border border-studio-800/80">
                    <div className="text-zinc-500">剧本连贯</div>
                    <div className="text-sm font-bold text-gold-400">{health.storyContinuity}%</div>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-studio-800/80">
                    <div className="text-zinc-500">视觉连贯</div>
                    <div className="text-sm font-bold text-emerald-400">{health.visualContinuity}%</div>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-studio-800/80">
                    <div className="text-zinc-500">镜头轴线</div>
                    <div className="text-sm font-bold text-blue-400">{health.shotContinuity}%</div>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-studio-800/80">
                    <div className="text-zinc-500">资产锁定</div>
                    <div className="text-sm font-bold text-purple-400">{health.assetReadiness}%</div>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-studio-800/80">
                    <div className="text-zinc-500">PROMPT</div>
                    <div className="text-sm font-bold text-amber-400">{health.promptReadiness}%</div>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-studio-800/80">
                    <div className="text-zinc-500">视频完成</div>
                    <div className="text-sm font-bold text-emerald-400">{health.videoReadiness}%</div>
                  </div>
                </div>
              )}

              <div className="bg-studio-950 p-2 rounded flex items-center justify-between border border-studio-800/80">
                <span className="text-studio-500">连贯性警报:</span>
                <div className="flex items-center gap-2">
                  {directorData.health.criticalWarnings > 0 && (
                    <span className="text-red-400 font-bold">🔴 {directorData.health.criticalWarnings} 严重</span>
                  )}
                  <span className="text-amber-400 font-bold">⚠ {directorData.health.standardWarnings} 警报</span>
                  <span className="text-sky-400 font-bold">ℹ {directorData.health.infoWarnings} 提示</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">我的制作项目 (My Productions)</h2>
          </div>
          <Link
            href="/projects/new"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
          >
            <span>+ 创建新连续剧项目</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isCurrent = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                className={`relative rounded-xl bg-studio-900 border transition-all duration-200 overflow-hidden group flex flex-col justify-between ${
                  isCurrent
                    ? 'border-gold-500/50 shadow-lg shadow-gold-500/5'
                    : 'border-studio-700/60 hover:border-studio-600'
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">
                        {proj.genre}
                      </span>
                      <h3 className="text-lg font-bold text-white group-hover:text-gold-300 transition-colors mt-0.5">
                        {proj.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${
                        proj.status === 'In Production' || proj.status === '制作中'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-studio-800 text-zinc-400 border-studio-700'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  {/* Logline snippet */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {proj.logline || '暂无故事大纲设定。'}
                  </p>

                  {/* Specs Pill tags */}
                  <div className="flex flex-wrap gap-2 pt-2 text-[11px] font-mono text-zinc-400">
                    <span className="px-2 py-1 rounded bg-studio-800 border border-studio-700/60">
                      {proj.targetEpisodes} 集
                    </span>
                    <span className="px-2 py-1 rounded bg-studio-800 border border-studio-700/60">
                      {proj.aspectRatio}
                    </span>
                    <span className="px-2 py-1 rounded bg-studio-800 border border-studio-700/60 truncate max-w-[140px]">
                      {proj.visualStyle}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-6 py-3.5 bg-studio-850/80 border-t border-studio-700/50 flex items-center justify-between">
                  <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>更新于 {new Date(proj.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => studioStore.setActiveProject(proj.id)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30 cursor-default'
                          : 'bg-studio-800 hover:bg-studio-700 text-zinc-300'
                      }`}
                    >
                      {isCurrent ? '当前制作中' : '设为焦点'}
                    </button>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-studio-800 transition-colors"
                      title="查看好莱坞影视母本总纲"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
