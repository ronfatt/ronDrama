'use client';

import React, { useState } from 'react';
import { Columns, ArrowRight, Check, X, FileDiff, Sparkles } from 'lucide-react';
import { ShotPrompt } from '@/lib/types';
import { diffPrompts } from '@/lib/prompt-adapters';

interface PromptDiffModalProps {
  prompts: ShotPrompt[];
  onClose: () => void;
}

export default function PromptDiffModal({ prompts, onClose }: PromptDiffModalProps) {
  if (prompts.length < 2) return null;

  const [v1Index, setV1Index] = useState(prompts.length - 2);
  const [v2Index, setV2Index] = useState(prompts.length - 1);

  const v1 = prompts[v1Index];
  const v2 = prompts[v2Index];
  const diffs = v1 && v2 ? diffPrompts(v1, v2) : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-studio-700/80 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileDiff className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-bold text-white uppercase font-mono">
              提示词版本差异对比 (PROMPT VERSION DIFF COMPARE)
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selectors Bar */}
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-studio-950 border border-studio-800 shrink-0 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">基准版本:</span>
            <select
              value={v1Index}
              onChange={(e) => setV1Index(parseInt(e.target.value, 10))}
              className="bg-studio-850 border border-studio-700 rounded px-2.5 py-1 text-white"
            >
              {prompts.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {p.versionTag} ({new Date(p.createdAt).toLocaleTimeString()})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-gold-500" />

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">对比新版本:</span>
            <select
              value={v2Index}
              onChange={(e) => setV2Index(parseInt(e.target.value, 10))}
              className="bg-studio-850 border border-studio-700 rounded px-2.5 py-1 text-white font-bold text-gold-400"
            >
              {prompts.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {p.versionTag} ({new Date(p.createdAt).toLocaleTimeString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Differences Summary Table */}
        {diffs.length > 0 && (
          <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 shrink-0 space-y-1.5 text-xs font-mono">
            <div className="text-[10px] uppercase font-bold text-gold-400">主要演变维度分析 (KEY DIFFERENCES):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {diffs.map((d, i) => (
                <div key={i} className="p-2 rounded bg-studio-900 border border-studio-800 text-[11px] space-y-0.5">
                  <span className="text-zinc-500 block text-[10px]">{d.dimension}</span>
                  <div className="flex items-center gap-1.5 text-zinc-200">
                    <span className="text-red-400 line-through">{d.v1Value}</span>
                    <span className="text-zinc-500">→</span>
                    <span className="text-emerald-400 font-bold">{d.v2Value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-Side Prompt Text Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pt-2 text-xs">
          {/* V1 Side */}
          <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-2 flex flex-col">
            <div className="flex items-center justify-between border-b border-studio-800 pb-2">
              <span className="font-mono font-bold text-white text-xs">
                {v1.versionTag} (原始参考)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {v1.lengthMode || 'Standard'} • {v1.promptUniversal?.split(' ').length || 0} words
              </span>
            </div>
            <p className="text-zinc-300 font-mono text-[11px] leading-relaxed flex-1 whitespace-pre-wrap">
              {v1.promptUniversal || v1.promptText}
            </p>
          </div>

          {/* V2 Side */}
          <div className="p-4 rounded-xl bg-studio-950 border border-gold-500/40 space-y-2 flex flex-col">
            <div className="flex items-center justify-between border-b border-studio-800 pb-2">
              <span className="font-mono font-bold text-gold-400 text-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{v2.versionTag} (当前新版)</span>
              </span>
              <span className="text-[10px] font-mono text-gold-400">
                {v2.lengthMode || 'Standard'} • {v2.promptUniversal?.split(' ').length || 0} words
              </span>
            </div>
            <p className="text-zinc-200 font-mono text-[11px] leading-relaxed flex-1 whitespace-pre-wrap">
              {v2.promptUniversal || v2.promptText}
            </p>
          </div>
        </div>

        {/* Close */}
        <div className="pt-2 border-t border-studio-750 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-white font-semibold text-xs transition-colors"
          >
            完成对比并关闭
          </button>
        </div>
      </div>
    </div>
  );
}
