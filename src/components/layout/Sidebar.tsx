'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  BookOpen,
  Boxes,
  Clapperboard,
  Tv,
  Kanban,
  ShieldAlert,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { continuityWarnings, isHydrated } = useStudioStore();

  const activeWarningsCount = isHydrated
    ? continuityWarnings.filter(w => w.status === 'ACTIVE').length
    : 0;

  const navItems = [
    { label: '作品项目', sub: 'PROJECTS', href: '/', icon: Film },
    { label: '剧本空间', sub: 'STORY ROOM', href: '/story', icon: BookOpen },
    { label: '资产总纲', sub: 'ASSET BIBLE', href: '/assets', icon: Boxes },
    { label: '剧集管理', sub: 'EPISODES', href: '/episodes', icon: Tv },
    { label: '导演工作台', sub: 'DIRECTOR ROOM', href: '/director', icon: Clapperboard },
    { label: '制作看板', sub: 'PRODUCTION BOARD', href: '/board', icon: Kanban },
    { 
      label: '连贯性检查', 
      sub: 'CONTINUITY',
      href: '/continuity', 
      icon: ShieldAlert,
      badge: activeWarningsCount > 0 ? activeWarningsCount : undefined,
    },
    { label: '系统设置', sub: 'SETTINGS', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.startsWith('/projects');
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-studio-950 border-r border-studio-700/50 flex flex-col justify-between shrink-0 select-none z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-studio-700/40">
          <Link href="/" className="group block">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-studio-950 font-black text-sm tracking-wider shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
                R
              </div>
              <div>
                <span className="text-xl font-bold tracking-widest text-white block leading-none group-hover:text-gold-400 transition-colors">
                  R.ON
                </span>
                <span className="text-[10px] font-semibold tracking-[0.25em] text-zinc-400 block mt-1 uppercase">
                  DRAMA STUDIO
                </span>
              </div>
            </div>
            <div className="mt-3 text-[11px] text-zinc-300 flex items-center gap-1.5 font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 inline-block animate-pulse"></span>
              AI 影视连续剧制作工作台
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.sub}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-semibold tracking-wider transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-400 border-l-2 border-gold-500 pl-3'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-studio-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-gold-400' : 'text-zinc-500'}`} />
                  <div>
                    <span className="block leading-none text-sm font-bold">{item.label}</span>
                    <span className="block text-[9px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">{item.sub}</span>
                  </div>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-studio-700/40 bg-studio-900/60">
        <div className="flex items-center justify-between text-zinc-300 text-[11px]">
          <div>
            <p className="font-semibold text-zinc-300">R.ON Studio</p>
            <p className="text-[10px] text-zinc-400 font-mono">MVP v0.1</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-300 bg-studio-800/80 px-2 py-1 rounded border border-studio-700">
            <Sparkles className="w-3 h-3 text-gold-500" />
            <span>专业影视版</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
