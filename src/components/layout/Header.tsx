'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Film, AlertTriangle, RotateCcw, Clapperboard } from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import GlobalSearchModal from './GlobalSearchModal';

export default function Header() {
  const { projects, activeProjectId, continuityWarnings, isHydrated, studioMode } = useStudioStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeWarnings = isHydrated ? continuityWarnings.filter(w => w.status === 'ACTIVE').length : 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-studio-900/90 backdrop-blur border-b border-studio-700/50 px-6 flex items-center justify-between z-20 shrink-0 select-none">
        {/* Left: Active Project Selector & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-gold-500" />
            <span className="text-xs font-mono tracking-wider text-zinc-400 font-bold">当前制作项目:</span>
          </div>
          <div className="relative">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => studioStore.setActiveProject(e.target.value)}
              className="bg-studio-850 border border-studio-700 hover:border-gold-500/50 text-white font-bold text-sm rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-gold-500 appearance-none cursor-pointer transition-colors"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.genre})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
              ▼
            </div>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {activeProject?.status || '制作中'}
          </span>

          {/* Studio Mode Switcher */}
          <div className="flex items-center gap-1 bg-studio-950 p-1 rounded-md border border-studio-800 text-xs font-mono ml-2">
            <button
              onClick={() => studioStore.setStudioMode('NORMAL')}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                studioMode === 'NORMAL'
                  ? 'bg-studio-800 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              标准模式
            </button>
            <button
              onClick={() => studioStore.setStudioMode('DIRECTOR')}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center gap-1.5 ${
                studioMode === 'DIRECTOR'
                  ? 'bg-gold-500 text-studio-950 shadow-md shadow-gold-500/20'
                  : 'text-zinc-500 hover:text-gold-400'
              }`}
            >
              <Clapperboard className="w-3 h-3" />
              <span>导演模式</span>
            </button>
          </div>
        </div>

        {/* Right: Search, Continuity Alert, Actions */}
        <div className="flex items-center gap-3">
          {/* Continuity Warning Pill if any */}
          {activeWarnings > 0 && (
            <Link
              href="/continuity"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors animate-pulse"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{activeWarnings} 条连贯性警报</span>
            </Link>
          )}

          {/* Quick Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-studio-800 hover:bg-studio-750 text-zinc-400 hover:text-zinc-200 border border-studio-700 text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>搜索角色、场景、分镜...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-studio-900 text-zinc-400 border border-studio-700 ml-2">
              ⌘K
            </kbd>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('是否重置为默认的《THE LAST ASSASSIN》演示数据？')) {
                studioStore.resetToDemoData();
              }
            }}
            title="重置为默认演示数据"
            className="p-1.5 rounded-md bg-studio-800 hover:bg-studio-750 text-zinc-400 hover:text-zinc-200 border border-studio-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* New Series Button */}
          <Link
            href="/projects/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-md shadow-gold-500/10 hover:shadow-gold-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ 新建连续剧</span>
          </Link>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
