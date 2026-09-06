'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Layers, ShieldAlert } from 'lucide-react';
import { Shot } from '@/lib/types';
import { studioStore } from '@/lib/store';

interface PromptStaleBannerProps {
  shot: Shot;
  onRegeneratePrompt: () => void;
  onUpdateRefPack: () => void;
}

export default function PromptStaleBanner({
  shot,
  onRegeneratePrompt,
  onUpdateRefPack,
}: PromptStaleBannerProps) {
  const isPromptStale = shot.isPromptStale;
  const isRefPackStale = shot.isReferencePackStale || shot.referencePack?.isOutdated;
  const reasons = shot.staleReasons || [];

  if (!isPromptStale && !isRefPackStale) return null;

  return (
    <div className="space-y-2 animate-in fade-in duration-200">
      {/* 1. Prompt Stale Banner */}
      {isPromptStale && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold uppercase text-amber-400">
                  ⚠️ 提示词已失效过时 (PROMPT OUT OF DATE)
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300">
                  STALE
                </span>
              </div>
              <p className="text-zinc-300 font-sans">
                检测到分镜参数修改，历史生成的 Prompt 与当前摄影设计不一致：
              </p>
              {reasons.length > 0 && (
                <ul className="text-[11px] font-mono text-amber-300/90 list-disc list-inside">
                  {reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={onRegeneratePrompt}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-studio-950 font-bold text-xs shadow transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重新生成新版本 (REGENERATE)</span>
          </button>
        </div>
      )}

      {/* 2. Reference Pack Outdated Banner */}
      {isRefPackStale && (
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/50 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold uppercase text-blue-400">
                  📦 视觉参考包待同步 (REFERENCE PACK OUTDATED)
                </span>
              </div>
              <p className="text-zinc-300 font-sans">
                {shot.referencePack?.outdatedReason ||
                  '本分镜依赖的主视觉资产已升级新版本，请核验是否更新参考包以同步最新特征。'}
              </p>
            </div>
          </div>

          <button
            onClick={onUpdateRefPack}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-blue-300 border border-blue-500/40 font-semibold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>同步更新参考包 (UPDATE PACK)</span>
          </button>
        </div>
      )}
    </div>
  );
}
