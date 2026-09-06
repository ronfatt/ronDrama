'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, AlertOctagon, Check, ArrowRight, User, Sword, MapPin, Shirt, Info, ExternalLink } from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { ContinuityMatrixItem } from '@/lib/types';

export default function ContinuityMatrixView() {
  const { episodes } = useStudioStore();
  const allScenes = episodes.flatMap(e => e.scenes || []).sort((a, b) => a.sortOrder - b.sortOrder);
  const matrix: ContinuityMatrixItem[] = studioStore.getContinuityMatrix();

  const [selectedCell, setSelectedCell] = useState<{
    assetName: string;
    assetType: string;
    sceneNumber: number;
    sceneTitle: string;
    status: string;
    stateLabel?: string;
    conflictDescription?: string;
    sceneId: string;
  } | null>(null);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Character':
        return <User className="w-3.5 h-3.5 text-gold-400" />;
      case 'Prop':
        return <Sword className="w-3.5 h-3.5 text-amber-400" />;
      case 'Location':
        return <MapPin className="w-3.5 h-3.5 text-blue-400" />;
      case 'Costume':
        return <Shirt className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-studio-900 border border-studio-750">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            2D 连续剧连贯性时空矩阵 (2D CONTINUITY MATRIX)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            横向按场次推移，纵向跟踪资产基准状态。绿色：通过；黄色：状态突变警报；红色：严重阻断性冲突。
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-zinc-400">一致 (Pass)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-zinc-400">警报 (Warning)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-zinc-400">阻断 (Critical)</span>
          </div>
        </div>
      </div>

      {/* Matrix Table Container */}
      <div className="rounded-xl bg-studio-900 border border-studio-750 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="bg-studio-950 border-b border-studio-750">
                <th className="p-3 sticky left-0 z-20 bg-studio-950 min-w-[200px] border-r border-studio-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                  资产名称 / 类别 (Asset)
                </th>
                {allScenes.map((sc) => (
                  <th
                    key={sc.id}
                    className="p-3 text-center min-w-[140px] border-r border-studio-800/60 font-semibold text-zinc-300"
                  >
                    <Link
                      href={`/director?sceneId=${sc.id}`}
                      className="hover:text-gold-400 transition-colors inline-block"
                      title={`进入场次 #${sc.sceneNumber} 导演工作台`}
                    >
                      <div className="text-gold-400 font-bold">SC {String(sc.sceneNumber).padStart(2, '0')}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[120px]">{sc.sceneTitle}</div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-800/60">
              {matrix.map((row) => (
                <tr key={`${row.assetType}-${row.assetId}`} className="hover:bg-studio-850/40 transition-colors">
                  <td className="p-3 sticky left-0 z-10 bg-studio-900 border-r border-studio-800 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      {getAssetIcon(row.assetType)}
                      <span className="text-white font-bold text-xs truncate" title={row.assetName}>
                        {row.assetName}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-studio-800 text-zinc-400 border border-studio-700 uppercase">
                      {row.assetType}
                    </span>
                  </td>

                  {row.sceneStatuses.map((cell, idx) => {
                    const scene = allScenes[idx];
                    if (cell.status === 'NOT_PRESENT') {
                      return (
                        <td key={cell.sceneId} className="p-2.5 text-center border-r border-studio-800/40 text-zinc-700">
                          <span className="text-zinc-700">—</span>
                        </td>
                      );
                    }

                    const isPass = cell.status === 'PASS';
                    const isWarn = cell.status === 'WARNING';
                    const isCrit = cell.status === 'CRITICAL';

                    return (
                      <td
                        key={cell.sceneId}
                        className="p-2 text-center border-r border-studio-800/40 cursor-pointer"
                        onClick={() =>
                          setSelectedCell({
                            assetName: row.assetName,
                            assetType: row.assetType,
                            sceneNumber: cell.sceneNumber,
                            sceneTitle: scene?.sceneTitle || '',
                            status: cell.status,
                            stateLabel: cell.stateLabel,
                            conflictDescription: cell.conflictDescription,
                            sceneId: cell.sceneId,
                          })
                        }
                      >
                        <div
                          className={`px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all ${
                            isPass
                              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                              : isWarn
                              ? 'bg-amber-950/60 border border-amber-500/80 text-amber-300 animate-pulse hover:border-amber-400'
                              : 'bg-red-950/80 border border-red-500 text-red-300 animate-bounce hover:border-red-400'
                          }`}
                        >
                          {isCrit ? (
                            <AlertOctagon className="w-3 h-3 text-red-400 shrink-0" />
                          ) : isWarn ? (
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          ) : (
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[90px]">{cell.stateLabel || cell.status}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Cell Detail Modal */}
      {selectedCell && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedCell(null)}
        >
          <div
            className="w-full max-w-md bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-4 text-xs font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-studio-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getAssetIcon(selectedCell.assetType)}
                <span className="text-white font-bold uppercase">{selectedCell.assetName}</span>
              </div>
              <span className="text-zinc-500">
                SC #{selectedCell.sceneNumber}
              </span>
            </div>

            <div className="space-y-2 text-zinc-300">
              <div className="flex items-center justify-between bg-studio-950 p-2.5 rounded border border-studio-800">
                <span className="text-zinc-400">场次名称:</span>
                <span className="text-white font-bold">{selectedCell.sceneTitle}</span>
              </div>

              <div className="flex items-center justify-between bg-studio-950 p-2.5 rounded border border-studio-800">
                <span className="text-zinc-400">当前连续剧状态:</span>
                <span className="text-gold-400 font-bold">{selectedCell.stateLabel || 'NORMAL'}</span>
              </div>

              <div className="flex items-center justify-between bg-studio-950 p-2.5 rounded border border-studio-800">
                <span className="text-zinc-400">连贯性判定:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    selectedCell.status === 'PASS'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : selectedCell.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {selectedCell.status}
                </span>
              </div>

              {selectedCell.conflictDescription && (
                <div className="p-3 rounded bg-amber-950/30 border border-amber-800/80 text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>冲突详情:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{selectedCell.conflictDescription}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-studio-800">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-3 py-1.5 rounded text-zinc-400 hover:text-white"
              >
                关闭
              </button>
              <Link
                href={`/director?sceneId=${selectedCell.sceneId}`}
                className="px-4 py-1.5 rounded bg-gold-500 text-studio-950 hover:bg-gold-400 font-bold flex items-center gap-1.5"
              >
                <span>进入导演台修正</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
