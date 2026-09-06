'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Check, X, Layers, Sparkles, ArrowRight, Info } from 'lucide-react';
import { ChangeImpactLog } from '@/lib/types';
import { studioStore } from '@/lib/store';

interface MasterImpactModalProps {
  assetType: 'Character' | 'Location' | 'Prop' | 'Costume';
  assetId: string;
  assetName: string;
  versionId: string;
  versionTag: string;
  imageUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MasterImpactModal({
  assetType,
  assetId,
  assetName,
  versionId,
  versionTag,
  imageUrl,
  onClose,
  onSuccess,
}: MasterImpactModalProps) {
  const impact = studioStore.calculateMasterChangeImpact(assetType, assetId, versionId);

  // Quality Checklist items
  const [checklist, setChecklist] = useState({
    resolution: true,
    angle: true,
    lighting: true,
    features: true,
    colorStyle: true,
  });

  const [policy, setPolicy] = useState<'KEEP_HISTORICAL_SNAPSHOTS' | 'MARK_ALL_DOWNSTREAM_STALE'>('KEEP_HISTORICAL_SNAPSHOTS');
  const [changeReason, setChangeReason] = useState<string>('升级主视觉参考版本至 ' + versionTag);

  const allQualityPassed = Object.values(checklist).every(Boolean);

  const handleConfirmLock = () => {
    studioStore.applyMasterChange({
      ...impact,
      policy,
      changeReason,
      directorApproved: true,
    });
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-studio-700/80 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                锁定母本主视觉参考 (LOCK MASTER REFERENCE)
              </h3>
              <p className="text-xs text-zinc-400">
                目标: <span className="text-gold-300 font-semibold">{assetName}</span> · 版本: <span className="text-gold-300 font-mono font-bold">{versionTag}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview image and basic note */}
        {imageUrl && (
          <div className="flex items-center gap-4 p-3 bg-studio-950 rounded-lg border border-studio-800">
            <img src={imageUrl} alt={versionTag} className="w-16 h-16 object-cover rounded border border-studio-700" />
            <div className="text-xs text-zinc-300 space-y-1 font-mono">
              <div className="text-gold-400 font-bold">母本版本快照冻结机制</div>
              <div className="text-[11px] text-zinc-400">
                锁定后，此图片将作为全剧各场次、分镜 Prompt 与图包的核心参考基准。
              </div>
            </div>
          </div>
        )}

        {/* 1. Asset Quality Checklist */}
        <div className="space-y-2.5 p-4 rounded-xl bg-studio-950 border border-studio-800">
          <div className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              资产质检验收清单 (QUALITY CHECKLIST)
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded ${allQualityPassed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300'}`}>
              {allQualityPassed ? '全部符合标准' : '需全部勾选确认'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-300 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={checklist.resolution}
                onChange={(e) => setChecklist({ ...checklist, resolution: e.target.checked })}
                className="rounded border-studio-700 text-gold-500 focus:ring-0"
              />
              <span>分辨率达标 (≥ 1024px，无杂质噪点与模糊伪影)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={checklist.angle}
                onChange={(e) => setChecklist({ ...checklist, angle: e.target.checked })}
                className="rounded border-studio-700 text-gold-500 focus:ring-0"
              />
              <span>标准机位角度 (正视图或 3/4 黄金构图角度)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={checklist.lighting}
                onChange={(e) => setChecklist({ ...checklist, lighting: e.target.checked })}
                className="rounded border-studio-700 text-gold-500 focus:ring-0"
              />
              <span>中性摄影棚光影 (避免极端环境光干扰基础解剖学特征)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={checklist.features}
                onChange={(e) => setChecklist({ ...checklist, features: e.target.checked })}
                className="rounded border-studio-700 text-gold-500 focus:ring-0"
              />
              <span>五官、伤疤或材质辨识特征清晰分明</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={checklist.colorStyle}
                onChange={(e) => setChecklist({ ...checklist, colorStyle: e.target.checked })}
                className="rounded border-studio-700 text-gold-500 focus:ring-0"
              />
              <span>服饰色彩及整体风格与项目 Project Bible 完全吻合</span>
            </label>
          </div>
        </div>

        {/* 2. Downstream Impact Analysis */}
        <div className="space-y-3 p-4 rounded-xl bg-studio-950 border border-studio-800">
          <div className="text-xs font-mono font-bold text-zinc-200 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gold-400" />
              下游影响评估 (DOWNSTREAM IMPACT ANALYSIS)
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              影响 {impact.affectedScenesCount} 场次 / {impact.affectedShotsCount} 分镜
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {impact.details}
          </p>

          {/* Change Policy */}
          <div className="space-y-2 pt-2 border-t border-studio-800">
            <div className="text-xs font-mono text-zinc-300 font-semibold">变更策略 (Impact Handling Policy):</div>

            <label className="flex items-start gap-2 p-2 rounded bg-studio-900/60 border border-studio-800 cursor-pointer hover:border-gold-500/40">
              <input
                type="radio"
                name="impactPolicy"
                checked={policy === 'KEEP_HISTORICAL_SNAPSHOTS'}
                onChange={() => setPolicy('KEEP_HISTORICAL_SNAPSHOTS')}
                className="mt-0.5 text-gold-500 focus:ring-0"
              />
              <div className="text-xs">
                <span className="text-gold-300 font-bold font-mono">冻结历史快照 [推荐 (Recommended)]</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  已锁定的历史分镜继续保持原基准 (如 V3)，仅对新生成的 Prompt 和后续分镜应用此新版本。
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2 p-2 rounded bg-studio-900/60 border border-studio-800 cursor-pointer hover:border-gold-500/40">
              <input
                type="radio"
                name="impactPolicy"
                checked={policy === 'MARK_ALL_DOWNSTREAM_STALE'}
                onChange={() => setPolicy('MARK_ALL_DOWNSTREAM_STALE')}
                className="mt-0.5 text-gold-500 focus:ring-0"
              />
              <div className="text-xs">
                <span className="text-amber-300 font-bold font-mono">标记全部下游为待更新 (Mark Downstream Stale)</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  所有涉及该资产的下游镜头将被标记为 STALE，提示导演重新生成新版本 Prompt。
                </p>
              </div>
            </label>
          </div>

          {/* Reason note */}
          <div className="pt-2">
            <label className="block text-[11px] font-mono text-zinc-400 mb-1">变更记录说明 (Change Reason):</label>
            <input
              type="text"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              className="w-full bg-studio-900 border border-studio-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500 font-mono"
              placeholder="例如: 升级至好莱坞 8K 正面无遮挡母本"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-studio-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono text-zinc-400 hover:text-white rounded"
          >
            取消
          </button>
          <button
            onClick={handleConfirmLock}
            disabled={!allQualityPassed}
            className="px-5 py-1.5 text-xs font-mono font-bold rounded bg-gold-500 text-studio-950 hover:bg-gold-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-gold-500/10"
          >
            <Check className="w-4 h-4" />
            确认锁定母本 (CONFIRM LOCK)
          </button>
        </div>
      </div>
    </div>
  );
}
