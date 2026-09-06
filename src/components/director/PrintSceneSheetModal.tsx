'use client';

import React from 'react';
import { Printer, Download, X, Film, FileText, Camera } from 'lucide-react';
import { Scene, Shot } from '@/lib/types';

interface PrintSceneSheetModalProps {
  scene: Scene;
  selectedShot?: Shot;
  onClose: () => void;
}

export default function PrintSceneSheetModal({ scene, selectedShot, onClose }: PrintSceneSheetModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 print:p-0 print:bg-white">
      <div className="w-full max-w-4xl bg-studio-900 print:bg-white text-zinc-100 print:text-black border border-studio-700 print:border-none rounded-2xl shadow-2xl p-6 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header Controls (Hidden during print) */}
        <div className="border-b border-studio-700/80 print:hidden pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gold-400 font-mono text-xs font-bold uppercase">
            <Printer className="w-4 h-4" />
            <span>导演现场场次拍摄指导单 (DIRECTOR PRINT VIEW)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs shadow transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>立即打印 / 导出 PDF (PRINT / SAVE PDF)</span>
            </button>
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 font-sans">
          {/* Doc Title Block */}
          <div className="border-b-2 border-zinc-700 print:border-black pb-4 space-y-1">
            <div className="flex items-center justify-between font-mono text-xs text-gold-400 print:text-zinc-600 uppercase">
              <span>R.ON DRAMA STUDIO • PRODUCTION PROTOCOL</span>
              <span>SCENE CALL SHEET</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              SCENE 0{scene.sceneNumber}: {scene.sceneTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 print:text-zinc-700 pt-1">
              <span>环境: {scene.intExt}</span>
              <span>地点: {scene.locationName}</span>
              <span>时段: {scene.storyDate || 'Day 1'} {scene.storyTime || '22:00'} ({scene.timeOfDay})</span>
              <span>预估时长: {scene.duration}</span>
            </div>
          </div>

          {/* Director's Intention Block */}
          <div className="p-4 rounded-xl bg-studio-950 print:bg-zinc-100 border border-studio-800 print:border-zinc-300 space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase text-gold-400 print:text-black">
              DIRECTOR'S VISION & AUDIENCE EXPERIENCE (导演视听基调)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-400 print:text-zinc-600 block text-[10px] font-mono">戏剧目的:</span>
                <p>{scene.storyPurpose || '推进关键叙事冲突'}</p>
              </div>
              <div>
                <span className="text-zinc-400 print:text-zinc-600 block text-[10px] font-mono">情绪弧线:</span>
                <p>{scene.directorEmotionalArc || '紧张对峙至暴力爆发'}</p>
              </div>
              <div>
                <span className="text-zinc-400 print:text-zinc-600 block text-[10px] font-mono">运镜与光影哲学:</span>
                <p>{scene.directorVisualStrategy || 'Anamorphic shallow depth of field'}</p>
              </div>
              <div>
                <span className="text-zinc-400 print:text-zinc-600 block text-[10px] font-mono">表演指导:</span>
                <p>{scene.directorPerformanceDirection || '克制高压呼吸感'}</p>
              </div>
            </div>
          </div>

          {/* Key Assets & States */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-studio-950 print:bg-zinc-50 border border-studio-800 print:border-zinc-300 space-y-1">
              <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase font-bold">出场角色 & 状态</span>
              <p className="font-bold">{scene.characters.join(', ') || 'None'}</p>
            </div>
            <div className="p-3 rounded-lg bg-studio-950 print:bg-zinc-50 border border-studio-800 print:border-zinc-300 space-y-1">
              <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase font-bold">核心道具 & 磨损</span>
              <p className="font-bold">{scene.props.join(', ') || 'None'}</p>
            </div>
            <div className="p-3 rounded-lg bg-studio-950 print:bg-zinc-50 border border-studio-800 print:border-zinc-300 space-y-1">
              <span className="text-[10px] text-zinc-400 print:text-zinc-600 uppercase font-bold">场景环境状态</span>
              <p className="font-bold">{scene.locationName} [{scene.locationState || 'Clean'}]</p>
            </div>
          </div>

          {/* Shot List Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold uppercase text-white print:text-black flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-gold-400 print:text-black" />
              <span>SHOT LIST (分镜镜头表 — 共 {scene.shots?.length || 0} 镜)</span>
            </h2>

            <div className="border border-studio-800 print:border-zinc-400 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-studio-950 print:bg-zinc-200 text-zinc-400 print:text-black border-b border-studio-800 print:border-zinc-400 text-[10px]">
                  <tr>
                    <th className="p-2.5">SHOT #</th>
                    <th className="p-2.5">FRAMING</th>
                    <th className="p-2.5">LENS / CAM</th>
                    <th className="p-2.5">SUBJECT & ACTION</th>
                    <th className="p-2.5">LIGHTING</th>
                    <th className="p-2.5">PROMPT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-800 print:divide-zinc-300">
                  {scene.shots?.map((sh) => (
                    <tr key={sh.id} className="hover:bg-studio-850 print:hover:bg-transparent">
                      <td className="p-2.5 font-bold text-gold-400 print:text-black">0{sh.shotNumber}</td>
                      <td className="p-2.5">{sh.shotType}</td>
                      <td className="p-2.5">{sh.lens} • {sh.cameraMovement}</td>
                      <td className="p-2.5 max-w-xs truncate">{sh.action || sh.subject}</td>
                      <td className="p-2.5 text-zinc-400 print:text-zinc-700">{sh.lighting?.slice(0, 30)}...</td>
                      <td className="p-2.5 font-bold">
                        {sh.prompts && sh.prompts.length > 0 ? (
                          <span className="text-emerald-400 print:text-emerald-700">✓ {sh.activePromptVersion || 'V1'}</span>
                        ) : (
                          <span className="text-zinc-500">○ 待生成</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
