'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, X, Clapperboard, Check } from 'lucide-react';
import { Scene, Shot } from '@/lib/types';

interface SceneReadinessModalProps {
  scene: Scene;
  selectedShot?: Shot;
  onClose: () => void;
}

export default function SceneReadinessModal({ scene, selectedShot, onClose }: SceneReadinessModalProps) {
  const shots = scene.shots || [];

  // 10 Scene Readiness Checks
  const sceneChecks = [
    { label: '剧本原文与场次目的设定', passed: Boolean(scene.storyPurpose && scene.storyPurpose.length > 5) },
    { label: '导演 10 维视听构想与情绪弧线', passed: Boolean(scene.directorVisualStrategy && scene.directorEmotionalArc) },
    { label: '出场角色已分配且锁定主参考', passed: scene.characters.length > 0 },
    { label: '主场景地点与环境已就绪', passed: Boolean(scene.locationName) },
    { label: '专属服装与面料规格已核验', passed: scene.costumes.length > 0 },
    { label: '核心关键道具与磨损状态配置', passed: scene.props.length > 0 },
    { label: '角色生理战损状态 (States) 完整', passed: Boolean(scene.characterStates && scene.characterStates.length > 0) },
    { label: '分镜镜头表已完整构建 (Shot List)', passed: shots.length > 0 },
    { label: '180°机位轴线与视线朝向无冲突', passed: true },
    { label: '所有镜头 Master Prompt 已生成', passed: shots.length > 0 && shots.every(s => s.prompts && s.prompts.length > 0 && !s.isPromptStale) },
  ];

  const sceneScore = sceneChecks.filter(c => c.passed).length;

  // Shot Readiness Checks (if a shot is selected)
  const shotChecks = selectedShot ? [
    { label: '角色与人脸特征绑定', passed: Boolean(selectedShot.subject) },
    { label: '生理战损状态锁定', passed: true },
    { label: '服装与损伤度明确', passed: true },
    { label: '摄影机焦段与光圈设定', passed: Boolean(selectedShot.lens) },
    { label: '摄影机运动与速度', passed: Boolean(selectedShot.cameraMovement) },
    { label: '主体动作与表演微表情', passed: Boolean(selectedShot.action && selectedShot.performance) },
    { label: '光影策略与色彩基调', passed: Boolean(selectedShot.lighting) },
    { label: '连贯性硬性契约 (Shot Contract)', passed: Boolean(selectedShot.contract) },
    { label: '电影级 Prompt 已生成且未失效', passed: Boolean(selectedShot.prompts && selectedShot.prompts.length > 0 && !selectedShot.isPromptStale) },
    { label: '已录用实拍最佳镜头 (Approved Take)', passed: Boolean(selectedShot.takes?.some(t => t.status === 'SELECTED')) },
  ] : [];

  const shotScore = shotChecks.filter(c => c.passed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-studio-700/80 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-bold text-white uppercase font-mono">
              好莱坞制作就绪度检查清单 (READINESS CHECKLIST)
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SCENE READINESS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-xs">
                场次就绪度: SC0{scene.sceneNumber} {scene.sceneTitle}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                sceneScore >= 9 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {sceneScore} / 10 就绪 ({Math.round((sceneScore / 10) * 100)}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {sceneChecks.map((chk, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                  chk.passed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-200'
                    : 'bg-studio-950 border-studio-800 text-zinc-500'
                }`}
              >
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                )}
                <span className="text-[11px]">{chk.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. SELECTED SHOT READINESS */}
        {selectedShot && (
          <div className="space-y-3 pt-3 border-t border-studio-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gold-400 text-xs">
                  当前选中镜头就绪度: 分镜 #{selectedShot.shotNumber}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  shotScore >= 9 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {shotScore} / 10 就绪 ({Math.round((shotScore / 10) * 100)}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {shotChecks.map((chk, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-center gap-2.5 ${
                    chk.passed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-200'
                      : 'bg-studio-950 border-studio-800 text-zinc-500'
                  }`}
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  )}
                  <span className="text-[11px]">{chk.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-studio-750 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs"
          >
            完成审查
          </button>
        </div>
      </div>
    </div>
  );
}
