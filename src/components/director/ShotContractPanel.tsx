'use client';

import React, { useState } from 'react';
import { Lock, Sparkles, Ban, Plus, X, ShieldCheck } from 'lucide-react';
import { Shot, ShotContract } from '@/lib/types';
import { studioStore } from '@/lib/store';

interface ShotContractPanelProps {
  shot: Shot;
}

export default function ShotContractPanel({ shot }: ShotContractPanelProps) {
  const contract: ShotContract = shot.contract || {
    mustKeep: [
      'Character identity & facial geometry',
      'Tactical wardrobe & color palette',
      'Screen direction & camera axis',
    ],
    mustChange: [
      `Subject movement: ${shot.action || 'kinetic action'}`,
      `Camera framing: ${shot.shotType}`,
    ],
    mustNotChange: [
      'Facial silhouette & hair style',
      'Costume design patterns',
      'Location architecture',
    ],
  };

  const [newTagInput, setNewTagInput] = useState<{ section: 'keep' | 'change' | 'notChange' | null; text: string }>({
    section: null,
    text: '',
  });

  const handleAddTag = (section: 'keep' | 'change' | 'notChange') => {
    if (!newTagInput.text.trim()) return;
    const updated: ShotContract = {
      mustKeep: section === 'keep' ? [...contract.mustKeep, newTagInput.text.trim()] : [...contract.mustKeep],
      mustChange: section === 'change' ? [...contract.mustChange, newTagInput.text.trim()] : [...contract.mustChange],
      mustNotChange: section === 'notChange' ? [...contract.mustNotChange, newTagInput.text.trim()] : [...contract.mustNotChange],
    };
    studioStore.updateShotContract(shot.id, updated);
    setNewTagInput({ section: null, text: '' });
  };

  const handleRemoveTag = (section: 'keep' | 'change' | 'notChange', index: number) => {
    const updated: ShotContract = {
      mustKeep: section === 'keep' ? contract.mustKeep.filter((_, i) => i !== index) : [...contract.mustKeep],
      mustChange: section === 'change' ? contract.mustChange.filter((_, i) => i !== index) : [...contract.mustChange],
      mustNotChange: section === 'notChange' ? contract.mustNotChange.filter((_, i) => i !== index) : [...contract.mustNotChange],
    };
    studioStore.updateShotContract(shot.id, updated);
  };

  return (
    <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-3.5 shadow-inner">
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>分镜硬性契约规范 (SHOT CONTRACT)</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          生成 Prompt 时强制锁定物理约束
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* 1. MUST KEEP */}
        <div className="p-3 rounded-lg bg-studio-900 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>🔒 必须保持 (MUST KEEP)</span>
            </span>
            <button
              onClick={() => setNewTagInput({ section: 'keep', text: '' })}
              className="text-[10px] text-zinc-400 hover:text-white"
            >
              + 添加
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {contract.mustKeep.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-950/40 text-emerald-200 border border-emerald-500/30"
              >
                <span>{item}</span>
                <button onClick={() => handleRemoveTag('keep', idx)} className="hover:text-red-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          {newTagInput.section === 'keep' && (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                autoFocus
                type="text"
                value={newTagInput.text}
                onChange={(e) => setNewTagInput({ section: 'keep', text: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag('keep'); }}
                placeholder="输入保持项并按回车..."
                className="w-full bg-studio-950 border border-studio-700 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-emerald-500"
              />
              <button onClick={() => handleAddTag('keep')} className="text-emerald-400 font-bold px-1.5">✓</button>
            </div>
          )}
        </div>

        {/* 2. MUST CHANGE */}
        <div className="p-3 rounded-lg bg-studio-900 border border-gold-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-gold-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              <span>🎬 必须改变 (MUST CHANGE)</span>
            </span>
            <button
              onClick={() => setNewTagInput({ section: 'change', text: '' })}
              className="text-[10px] text-zinc-400 hover:text-white"
            >
              + 添加
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {contract.mustChange.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-gold-950/40 text-gold-200 border border-gold-500/30"
              >
                <span>{item}</span>
                <button onClick={() => handleRemoveTag('change', idx)} className="hover:text-red-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          {newTagInput.section === 'change' && (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                autoFocus
                type="text"
                value={newTagInput.text}
                onChange={(e) => setNewTagInput({ section: 'change', text: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag('change'); }}
                placeholder="输入改变项并按回车..."
                className="w-full bg-studio-950 border border-studio-700 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-gold-500"
              />
              <button onClick={() => handleAddTag('change')} className="text-gold-400 font-bold px-1.5">✓</button>
            </div>
          )}
        </div>

        {/* 3. MUST NOT CHANGE */}
        <div className="p-3 rounded-lg bg-studio-900 border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-red-400 flex items-center gap-1.5">
              <Ban className="w-3 h-3" />
              <span>🚫 严禁改变 (MUST NOT CHANGE)</span>
            </span>
            <button
              onClick={() => setNewTagInput({ section: 'notChange', text: '' })}
              className="text-[10px] text-zinc-400 hover:text-white"
            >
              + 添加
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {contract.mustNotChange.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-950/40 text-red-200 border border-red-500/30"
              >
                <span>{item}</span>
                <button onClick={() => handleRemoveTag('notChange', idx)} className="hover:text-red-400">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          {newTagInput.section === 'notChange' && (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                autoFocus
                type="text"
                value={newTagInput.text}
                onChange={(e) => setNewTagInput({ section: 'notChange', text: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag('notChange'); }}
                placeholder="输入严禁变动项..."
                className="w-full bg-studio-950 border border-studio-700 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-red-500"
              />
              <button onClick={() => handleAddTag('notChange')} className="text-red-400 font-bold px-1.5">✓</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
