'use client';

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Cpu,
  RotateCcw,
  Download,
  Upload,
  Check,
  Shield,
  Layers,
  Sparkles,
  Film,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SettingsPage() {
  const state = useStudioStore();

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ron-drama-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-studio-700/50 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
          <Settings className="w-3.5 h-3.5" />
          <span>系统架构与偏好设定 • SYSTEM PREFERENCES</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">
          系统设置与工作台状态
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          查看本地存储与数据库状态、AI 手动协同接口模式、备份与恢复全站影视数据。
        </p>
      </div>

      {/* Grid of Settings Cards */}
      <div className="space-y-6">
        {/* Card 1: AI Provider Architecture */}
        <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI 接口架构 (AI Provider Engine)</h3>
                <p className="text-xs text-zinc-400">零 API 调用的本地手动协同模式</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              当前状态: 手动协同模式 (ManualAIProvider)
            </span>
          </div>

          <div className="p-4 rounded-lg bg-studio-850 border border-studio-750 text-xs text-zinc-300 space-y-2">
            <p>
              严格按照产品定位：R.ON DRAMA STUDIO <strong>严禁并完全未调用任何外部付费 AI API</strong>。所有视频与图片 Prompt 均由本地纯模板引擎毫秒级合成。
            </p>
            <p className="text-zinc-500">
              支持一键复制导出的外部影视工具：<strong>Google Flow</strong>、<strong>Dreamina</strong>、<strong>Midjourney</strong>、<strong>ChatGPT Pro</strong>、<strong>Gemini Pro</strong>。
            </p>
          </div>
        </div>

        {/* Card 2: Database & Storage Status */}
        <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-studio-800 border border-studio-700 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">数据库与存储 (Database & Storage)</h3>
                <p className="text-xs text-zinc-400">双模式：PostgreSQL / 本地优先响应存储</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                isSupabaseConfigured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-studio-800 text-gold-400 border border-gold-500/30'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase 已直连' : '本地持久化存储 (当前活跃)'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-studio-850 border border-studio-750 text-xs text-zinc-300 space-y-2">
            <p>
              完整 22 张生产级数据表 SQL 定义已就绪于 <code className="text-gold-400 font-mono">supabase/schema.sql</code>。
            </p>
            <p className="text-zinc-500">
              如需连接真实 Supabase 云数据库与云端 Storage 存储桶，仅需在 <code className="text-zinc-400 font-mono">.env.local</code> 中配置：
            </p>
            <pre className="p-2.5 rounded bg-studio-950 text-[11px] font-mono text-zinc-300 overflow-x-auto">
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </div>
        </div>

        {/* Card 3: Export Hub Link */}
        <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-gold-400" />
              <span>整剧制作打包中心 (Export Studio)</span>
            </h3>
            <p className="text-xs text-zinc-400">
              将剧集场次、分镜列表、已生成的 Prompt 和导演笔记批量打包为 PDF、Markdown 或 JSON。
            </p>
          </div>
          <Link
            href="/export"
            className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs shadow transition-all"
          >
            打开导出工作台
          </Link>
        </div>

        {/* Card 4: Backup & Reset */}
        <div className="p-6 rounded-xl bg-studio-900 border border-studio-700/80 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-studio-800 border border-studio-700 flex items-center justify-center text-zinc-300">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">数据备份与环境重置</h3>
              <p className="text-xs text-zinc-400">一键导出当前完整制作数据，或恢复出厂演示工程</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-white text-xs font-semibold border border-studio-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载完整 JSON 备份</span>
            </button>

            <button
              onClick={() => {
                if (confirm('确定将整个工作区重置为默认的《THE LAST ASSASSIN》演示数据？所有未备份的本地修改将被覆盖。')) {
                  studioStore.resetToDemoData();
                  alert('已成功重置为演示工程！');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置为默认演示数据</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
