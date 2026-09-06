'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Clapperboard,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  XCircle,
  FileEdit,
  History,
  Table,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { runContinuityAudit } from '@/lib/continuityEngine';
import { ContinuityWarning } from '@/lib/types';
import ContinuityMatrixView from '@/components/continuity/ContinuityMatrixView';

export default function ContinuityPage() {
  const { continuityWarnings, episodes, characters, locations, props, costumes, projects, activeProjectId } = useStudioStore();
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const [auditing, setAuditing] = useState(false);
  const [viewMode, setViewMode] = useState<'WARNINGS' | 'MATRIX'>('WARNINGS');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED' | 'OVERRIDDEN'>('ACTIVE');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Override Modal state
  const [overrideModalWarning, setOverrideModalWarning] = useState<ContinuityWarning | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Production Health 2.0 Score
  const health = studioStore.calculateProductionHealth();

  // Collect all scenes
  const allScenes = episodes.flatMap(e => e.scenes || []);

  const handleRunAudit = () => {
    if (!activeProject) return;
    setAuditing(true);
    setTimeout(() => {
      const detected = runContinuityAudit({
        projectId: activeProject.id,
        scenes: allScenes,
        characters,
        locations,
        props,
        costumes,
      });

      // Add detected warnings if not already present
      detected.forEach(w => {
        if (!continuityWarnings.some(cw => cw.id === w.id)) {
          studioStore.addContinuityWarning(w);
        }
      });
      setAuditing(false);
    }, 600);
  };

  const handleConfirmOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalWarning || !overrideReason.trim()) return;
    studioStore.overrideContinuityWarning(overrideModalWarning.id, overrideReason.trim());
    setOverrideModalWarning(null);
    setOverrideReason('');
  };

  const filteredWarnings = continuityWarnings.filter(w => {
    if (filterStatus !== 'ALL' && w.status !== filterStatus) return false;
    if (filterSeverity !== 'ALL') {
      const wSev = w.severity || 'WARNING';
      if (wSev !== filterSeverity) return false;
    }
    if (filterCategory !== 'ALL') {
      const wCat = w.category || w.assetType;
      if (wCat !== filterCategory) return false;
    }
    return true;
  });

  const activeCount = continuityWarnings.filter(w => w.status === 'ACTIVE').length;
  const criticalCount = continuityWarnings.filter(w => w.status === 'ACTIVE' && (w.severity === 'CRITICAL')).length;
  const warningCount = continuityWarnings.filter(w => w.status === 'ACTIVE' && (w.severity === 'WARNING' || !w.severity)).length;
  const infoCount = continuityWarnings.filter(w => w.status === 'ACTIVE' && w.severity === 'INFO').length;

  const categories = [
    { id: 'ALL', label: '全部范畴 (ALL)' },
    { id: 'Character', label: '角色面容一致性 (Character)' },
    { id: 'Costume', label: '服装与妆造 (Costume)' },
    { id: 'Location', label: '场景与环境 (Location)' },
    { id: 'Prop', label: '道具与战损 (Prop)' },
    { id: 'Timeline', label: '时间线与日夜 (Timeline)' },
    { id: 'State', label: '生理/战损状态 (State)' },
    { id: 'Axis', label: '180°机位轴线 (Axis)' },
    { id: 'Lighting', label: '光影色调 (Lighting)' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>视觉连贯性防御系统 • VISUAL INTEGRITY DEFENSE SYSTEM 3.0</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>连贯性检查引擎 (Continuity Engine)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            全维度审查剧作时间线、角色生理状态演变、道具战损损伤度、180°机位轴线翻转及服装发型冲突，彻底杜绝 AI 影视穿帮。
          </p>
        </div>

        <button
          disabled={auditing}
          onClick={handleRunAudit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-gold-400 border border-gold-500/30 text-xs font-bold transition-all shadow hover:shadow-gold-500/10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${auditing ? 'animate-spin' : ''}`} />
          <span>{auditing ? '正在审查全剧场次...' : '执行全剧连贯性审查 (RUN AUDIT)'}</span>
        </button>
      </div>

      {/* Production Health 2.0 Continuity & Readiness Bar */}
      <div className="p-4 rounded-xl bg-studio-900 border border-gold-500/30 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              全剧制作健康度与连贯性指数 (PRODUCTION HEALTH 2.0)
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-zinc-400">综合健康评分:</span>
            <span className="text-base font-black text-gold-400">{health.overallScore}%</span>
            <span className="text-[10px] text-zinc-500">({health.passedChecks}/{health.totalChecks} 项达标)</span>
          </div>
        </div>

        {/* 6 Dimension Health Meters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-[11px] font-mono">
          <div className="p-2 rounded bg-studio-950 border border-studio-800 space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>剧本连贯:</span>
              <span className="text-gold-400 font-bold">{health.storyContinuity}%</span>
            </div>
            <div className="w-full bg-studio-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gold-500 h-full rounded-full transition-all" style={{ width: `${health.storyContinuity}%` }} />
            </div>
          </div>

          <div className="p-2 rounded bg-studio-950 border border-studio-800 space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>视觉连贯:</span>
              <span className="text-emerald-400 font-bold">{health.visualContinuity}%</span>
            </div>
            <div className="w-full bg-studio-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${health.visualContinuity}%` }} />
            </div>
          </div>

          <div className="p-2 rounded bg-studio-950 border border-studio-800 space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>镜头轴线:</span>
              <span className="text-blue-400 font-bold">{health.shotContinuity}%</span>
            </div>
            <div className="w-full bg-studio-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${health.shotContinuity}%` }} />
            </div>
          </div>

          <div className="p-2 rounded bg-studio-950 border border-studio-800 space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>资产锁定:</span>
              <span className="text-purple-400 font-bold">{health.assetReadiness}%</span>
            </div>
            <div className="w-full bg-studio-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: `${health.assetReadiness}%` }} />
            </div>
          </div>

          <div className="p-2 rounded bg-studio-950 border border-studio-800 space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Prompt就绪:</span>
              <span className="text-amber-400 font-bold">{health.promptReadiness}%</span>
            </div>
            <div className="w-full bg-studio-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${health.promptReadiness}%` }} />
            </div>
          </div>

          <div className="p-2 rounded bg-studio-950 border border-studio-800 space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>视频完成:</span>
              <span className="text-emerald-400 font-bold">{health.videoReadiness}%</span>
            </div>
            <div className="w-full bg-studio-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${health.videoReadiness}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-studio-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('WARNINGS')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-2 ${
              viewMode === 'WARNINGS'
                ? 'bg-gold-500 text-studio-950'
                : 'bg-studio-900 text-zinc-400 hover:text-white border border-studio-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>连贯性防御与警报清单 ({activeCount})</span>
          </button>

          <button
            onClick={() => setViewMode('MATRIX')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-2 ${
              viewMode === 'MATRIX'
                ? 'bg-gold-500 text-studio-950'
                : 'bg-studio-900 text-zinc-400 hover:text-white border border-studio-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>2D 连续剧连贯性时空矩阵</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-zinc-500">
          严格零 API 规则引擎判定
        </span>
      </div>

      {/* CONDITIONAL CONTENT: MATRIX VIEW vs WARNINGS VIEW */}
      {viewMode === 'MATRIX' ? (
        <ContinuityMatrixView />
      ) : (
        <>
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-750 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">待处理冲突 ACTIVE</span>
            <div className="text-2xl font-black text-amber-400">{activeCount} 项</div>
          </div>
          <AlertTriangle className={`w-7 h-7 ${activeCount > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
        </div>

        <div className="p-4 rounded-xl bg-studio-900 border border-red-500/30 bg-red-950/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-red-400 font-bold">严重阻断 CRITICAL</span>
            <div className="text-2xl font-black text-red-400">{criticalCount} 项</div>
          </div>
          <AlertOctagon className="w-7 h-7 text-red-400" />
        </div>

        <div className="p-4 rounded-xl bg-studio-900 border border-studio-750 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">已锁定的主参考 LOCKED</span>
            <div className="text-2xl font-black text-emerald-400">
              {characters.filter(c => c.lockedVersionId).length +
                locations.filter(l => l.lockedVersionId).length +
                props.filter(p => p.lockedVersionId).length +
                costumes.filter(c => c.lockedVersionId).length} 项
            </div>
          </div>
          <Lock className="w-7 h-7 text-emerald-400" />
        </div>

        <div className="p-4 rounded-xl bg-studio-900 border border-studio-750 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">已解决/导演覆盖 RESOLVED</span>
            <div className="text-2xl font-black text-zinc-300">
              {continuityWarnings.filter(w => w.status !== 'ACTIVE').length} 项
            </div>
          </div>
          <ShieldCheck className="w-7 h-7 text-zinc-500" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-studio-900 border border-studio-750 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-studio-950 p-1 rounded-lg border border-studio-800 text-xs font-mono">
            {(['ACTIVE', 'ALL', 'RESOLVED', 'OVERRIDDEN'] as const).map((st) => {
              const label = st === 'ACTIVE' ? '待处理' : st === 'ALL' ? '全部记录' : st === 'RESOLVED' ? '已修正' : '已覆盖';
              const cnt = continuityWarnings.filter(w => (st === 'ALL' ? true : w.status === st)).length;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded transition-colors font-bold ${
                    filterStatus === st
                      ? 'bg-gold-500 text-studio-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label} ({cnt})
                </button>
              );
            })}
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-zinc-500 text-[10px] uppercase font-bold mr-1">级别:</span>
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => {
              const active = filterSeverity === sev;
              const colorClass =
                sev === 'CRITICAL'
                  ? active ? 'bg-red-500 text-white' : 'text-red-400 bg-red-950/30 border-red-800/50'
                  : sev === 'WARNING'
                  ? active ? 'bg-amber-500 text-studio-950' : 'text-amber-400 bg-amber-950/30 border-amber-800/50'
                  : sev === 'INFO'
                  ? active ? 'bg-blue-500 text-white' : 'text-blue-400 bg-blue-950/30 border-blue-800/50'
                  : active ? 'bg-zinc-200 text-studio-950' : 'text-zinc-400 bg-studio-800 border-studio-700';

              return (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded border text-[11px] font-bold transition-all ${colorClass}`}
                >
                  {sev === 'ALL' ? '全部' : sev}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8 Check Categories Filter */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-studio-800 text-xs">
          <span className="text-zinc-500 text-[10px] font-mono uppercase font-bold mr-1">审查类别:</span>
          {categories.map((c) => {
            const isSelected = filterCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  isSelected
                    ? 'bg-studio-750 text-gold-400 font-bold border border-gold-500/40'
                    : 'text-zinc-400 hover:text-zinc-200 bg-studio-950 border border-studio-800'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Warnings List */}
      <div className="space-y-4">
        {filteredWarnings.length === 0 ? (
          <div className="p-12 text-center bg-studio-900 rounded-xl border border-studio-750 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">视觉连贯性完美吻合</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              当前过滤条件下未检测到连续性冲突。全剧所有主参考、角色状态变化、180°机位轴线均保持严谨一致。
            </p>
          </div>
        ) : (
          filteredWarnings.map((warning) => {
            const isActive = warning.status === 'ACTIVE';
            const isCritical = warning.severity === 'CRITICAL';
            const isInfo = warning.severity === 'INFO';

            return (
              <div
                key={warning.id}
                className={`p-6 rounded-xl bg-studio-900 border transition-all shadow-xl space-y-4 ${
                  !isActive
                    ? 'border-studio-750 opacity-70'
                    : isCritical
                    ? 'border-red-500/80 shadow-red-500/10 bg-red-950/10'
                    : isInfo
                    ? 'border-blue-500/40'
                    : 'border-amber-500/60 shadow-amber-500/5'
                }`}
              >
                {/* Warning Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-studio-750/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                        isCritical
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : isInfo
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon className="w-5 h-5 animate-pulse" />
                      ) : isInfo ? (
                        <Info className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white uppercase font-mono">
                          {warning.conflictType} : {warning.assetName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase border ${
                            isCritical
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : isInfo
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {warning.severity || 'WARNING'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-studio-800 text-gold-400 border border-studio-700">
                          范畴: {warning.category || warning.assetType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>发生场次: {warning.sceneTitle || '全剧范围'}</span>
                        {warning.shotNumber && (
                          <span className="text-gold-400 font-mono font-bold">
                            (分镜 #{warning.shotNumber})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                        isActive
                          ? isCritical
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : warning.status === 'OVERRIDDEN'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : 'bg-studio-800 text-zinc-400 border border-studio-700'
                      }`}
                    >
                      {warning.status === 'ACTIVE' ? '待处理' : warning.status === 'RESOLVED' ? '已修正' : '已强制覆盖'}
                    </span>
                  </div>
                </div>

                {/* Comparison Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>已锁定的主参考值 / 基准前置状态 (LOCKED / PREV STATE)</span>
                    </span>
                    <p className="text-zinc-200">{warning.lockedValue}</p>
                  </div>

                  <div
                    className={`p-3 rounded-lg border space-y-1 ${
                      isCritical
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                        isCritical ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>当前场次或分镜中的配置 (CURRENT SCENE / SHOT)</span>
                    </span>
                    <p className="text-zinc-200">{warning.currentValue}</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {warning.description}
                </p>

                {/* If Overridden, show override reason */}
                {warning.status === 'OVERRIDDEN' && warning.overrideReason && (
                  <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs space-y-1 font-mono">
                    <div className="flex items-center gap-2 text-purple-300 font-bold">
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>导演艺术决策覆盖理由 (DIRECTOR OVERRIDE REASON):</span>
                    </div>
                    <p className="text-purple-200 font-sans italic">"{warning.overrideReason}"</p>
                    {warning.overriddenAt && (
                      <span className="text-[10px] text-zinc-500">
                        覆盖时间: {new Date(warning.overriddenAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 border-t border-studio-750 flex flex-wrap items-center justify-between gap-3">
                  {/* Jump directly to workstation */}
                  {warning.sceneId ? (
                    <Link
                      href={warning.shotId ? `/director?sceneId=${warning.sceneId}&shotId=${warning.shotId}` : `/director?sceneId=${warning.sceneId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-colors"
                    >
                      <Clapperboard className="w-3.5 h-3.5" />
                      <span>在导演工作台定位此场次/分镜</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <div />
                  )}

                  {isActive && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => studioStore.resolveWarning(warning.id, 'KEEP LOCKED VERSION')}
                        className="px-3.5 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-white text-xs font-semibold border border-studio-700 transition-colors"
                      >
                        [标记已修正]
                      </button>

                      <Link
                        href={`/assets?tab=${warning.assetType.toLowerCase()}s`}
                        className="px-3.5 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-gold-400 text-xs font-semibold border border-gold-500/30 transition-colors flex items-center gap-1"
                      >
                        <span>[检查总纲资产]</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => {
                          setOverrideModalWarning(warning);
                          setOverrideReason('');
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-studio-950 text-xs font-bold transition-colors"
                      >
                        [强制覆盖 (OVERRIDE)]
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  )}

      {/* DIRECTORS OVERRIDE MODAL */}
      {overrideModalWarning && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-studio-900 border border-amber-500/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-studio-700/60 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>导演强制覆盖确认 • DIRECTOR OVERRIDE</span>
              </div>
              <button
                onClick={() => setOverrideModalWarning(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-800 text-xs space-y-2">
              <div className="text-white font-bold">{overrideModalWarning.conflictType}</div>
              <div className="text-zinc-400 font-mono text-[11px]">
                目标资产: {overrideModalWarning.assetName} | 场次: {overrideModalWarning.sceneTitle || '未知'}
              </div>
              <p className="text-zinc-300 text-xs">{overrideModalWarning.description}</p>
            </div>

            <form onSubmit={handleConfirmOverride} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300 flex items-center justify-between">
                  <span>填写艺术覆盖理由 (ARTISTIC JUSTIFICATION) *</span>
                  <span className="text-amber-400 text-[10px]">必填</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="例如: 故意打破180度轴线以表达主角内心的混乱状态；或者：场次之间已过3天，角色轻伤已自然愈合。"
                  className="w-full px-3 py-2 bg-studio-950 border border-studio-700 focus:border-amber-500 rounded-lg text-white text-xs outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalWarning(null)}
                  className="px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!overrideReason.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-studio-950 text-xs font-bold transition-colors"
                >
                  确认记录并覆盖 (CONFIRM OVERRIDE)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
