'use client';

import React, { useState, useMemo } from 'react';
import {
  CINEMATIQUE_LIBRARY,
  CINEMATIQUE_CATEGORIES,
  searchCinematiqueTechniques,
  getCinematiqueByCategory,
  type CinematiqueTechnique,
  type CinematiqueCategory
} from '@/lib/cinematiqueLibrary';

interface CinematiqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTechnique?: (technique: CinematiqueTechnique) => void;
  onApplyToShot?: (technique: CinematiqueTechnique) => void;
  onApplyToBible?: (technique: CinematiqueTechnique) => void;
  currentShotDescription?: string;
}

export default function CinematiqueModal({
  isOpen,
  onClose,
  onSelectTechnique,
  onApplyToShot,
  onApplyToBible,
  currentShotDescription
}: CinematiqueModalProps) {
  const [activeCategory, setActiveCategory] = useState<CinematiqueCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState<CinematiqueTechnique | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customSubject, setCustomSubject] = useState(currentShotDescription || '');

  // Keep customSubject in sync if currentShotDescription changes
  React.useEffect(() => {
    if (currentShotDescription) {
      setCustomSubject(currentShotDescription);
    }
  }, [currentShotDescription]);

  const filteredTechniques = useMemo(() => {
    let list: CinematiqueTechnique[] = [];
    if (searchQuery.trim()) {
      list = searchCinematiqueTechniques(searchQuery);
      if (activeCategory !== 'ALL') {
        list = list.filter(t => t.category === activeCategory);
      }
    } else if (activeCategory === 'ALL') {
      list = CINEMATIQUE_LIBRARY;
    } else {
      list = getCinematiqueByCategory(activeCategory);
    }
    return list;
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleCopyPrompt = (tech: CinematiqueTechnique) => {
    const prompt = customSubject.trim()
      ? tech.promptTemplate.replace(/\[Subject\]/g, customSubject.trim()).replace(/\[Scene Context\]/g, customSubject.trim())
      : tech.promptTemplate;
    navigator.clipboard.writeText(prompt);
    setCopiedId(tech.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getResolvedPrompt = (tech: CinematiqueTechnique) => {
    if (customSubject.trim()) {
      return tech.promptTemplate
        .replace(/\[Subject\]/g, customSubject.trim())
        .replace(/\[Scene Context\]/g, customSubject.trim());
    }
    return tech.promptTemplate;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] flex flex-col bg-zinc-950 border border-amber-500/30 rounded-xl shadow-2xl shadow-amber-950/20 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-bold text-lg shadow-inner">
              🎬
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">
                  VVSVS Cinematique 150 镜头大师语汇与 Prompt 库
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  150 MASTER TECHNIQUES
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                涵盖摄影运镜、电影光影、大师级构图、非线性剪辑与导演视听语法，即插即用于 Midjourney / Google Flow / Dreamina
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/40 flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Categories Tab */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === 'ALL'
                  ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              全部 (150)
            </button>
            {CINEMATIQUE_CATEGORIES.map(cat => {
              const count = CINEMATIQUE_LIBRARY.filter(t => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <span>{cat.nameZh}</span>
                  <span className={`text-[10px] opacity-75 ${activeCategory === cat.id ? 'text-black' : 'text-zinc-400'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <span className="absolute left-3 top-2.5 text-zinc-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="搜索镜头技法、导演、光影或术语..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-lg pl-8 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Quick Subject Override bar */}
        <div className="px-6 py-2 bg-amber-950/20 border-b border-amber-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-zinc-300">
            <span className="text-amber-400 font-medium">🎯 替换 [Subject] 主体:</span>
            <input
              type="text"
              placeholder="例如: 林萧与顾里在暴雪夜的外滩对峙 / 戴墨镜的冷面杀手疾步穿过霓虹雨巷"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-xs text-amber-200 w-96 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
          <span className="text-zinc-500 text-[11px]">
            输入你的镜头主体后，点击任意技法即可自动填入并一键复制 Hollywood Prompt
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Technique List Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin">
            <div className="text-xs text-zinc-400 mb-2 flex items-center justify-between">
              <span>找到 <strong className="text-amber-400">{filteredTechniques.length}</strong> 种大师级视听技法</span>
              <span className="text-[11px] text-zinc-500">点击卡片可查看完整导演解析与参数指令</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredTechniques.map((tech) => {
                const isSelected = selectedTech?.id === tech.id;
                return (
                  <div
                    key={tech.id}
                    onClick={() => setSelectedTech(tech)}
                    className={`group relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-zinc-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-900/50 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* Badge & Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-amber-400/90 border border-zinc-700/60">
                          {tech.categoryZh}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          #{tech.id}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition-colors flex items-center space-x-1.5">
                        <span>{tech.name}</span>
                        <span className="text-xs text-zinc-400 font-normal">({tech.nameZh})</span>
                      </h3>

                      {/* Description Preview */}
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyPrompt(tech);
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                          copiedId === tech.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        {copiedId === tech.id ? '✓ 已复制 Prompt' : '⚡ 复制 Prompt'}
                      </button>

                      <div className="flex items-center space-x-1">
                        {onApplyToShot && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyToShot(tech);
                            }}
                            title="将此运镜/光影技法直接套用到当前激活的分镜 Shot"
                            className="px-2 py-1 rounded text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
                          >
                            + 注入分镜
                          </button>
                        )}
                        {onApplyToBible && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplyToBible(tech);
                            }}
                            title="将此风格纳入项目视觉圣经 (Project Visual DNA)"
                            className="px-2 py-1 rounded text-[10px] bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-colors"
                          >
                            + 视觉DNA
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Technique Detailed Inspector */}
          {selectedTech ? (
            <div className="w-96 border-l border-zinc-800 bg-zinc-950/70 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {selectedTech.categoryZh} · {selectedTech.category}
                  </span>
                  <button
                    onClick={() => setSelectedTech(null)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs"
                  >
                    收起
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{selectedTech.name}</h3>
                  <p className="text-sm font-medium text-amber-400">{selectedTech.nameZh}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 space-y-2 leading-relaxed">
                  <div className="font-semibold text-zinc-200 flex items-center space-x-1.5">
                    <span>🎬 导演视听与美学解析:</span>
                  </div>
                  <p>{selectedTech.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">💎 即用 Hollywood AI Prompt:</span>
                    <span className="text-[10px] text-zinc-500">已自动注入主体</span>
                  </div>
                  <div className="relative group">
                    <div className="p-3 rounded-lg bg-zinc-900 border border-amber-500/30 font-mono text-[11px] text-amber-100/90 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                      {getResolvedPrompt(selectedTech)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="mt-6 pt-4 border-t border-zinc-800 space-y-2">
                <button
                  onClick={() => handleCopyPrompt(selectedTech)}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    copiedId === selectedTech.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  }`}
                >
                  <span>{copiedId === selectedTech.id ? '✓ 已复制到剪贴板' : '⚡ 复制此镜头 Prompt'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {onApplyToShot && (
                    <button
                      onClick={() => onApplyToShot(selectedTech)}
                      className="py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
                    >
                      🎯 应用到当前分镜
                    </button>
                  )}
                  {onApplyToBible && (
                    <button
                      onClick={() => onApplyToBible(selectedTech)}
                      className="py-2 rounded-lg text-xs font-semibold bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/60 transition-colors"
                    >
                      📖 加入项目视觉库
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-80 border-l border-zinc-800 bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl mb-3">
                👈
              </div>
              <h4 className="text-sm font-semibold text-zinc-300">选择任意技法</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                点击左侧 150 款大师运镜或光影构图卡片，即可在这里查看完整 AI 提示词并一键注入你的分镜板。
              </p>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-2.5 border-t border-zinc-800/80 bg-zinc-950 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Powered by VVSVS Cinematique Masterclass</span>
            <span>•</span>
            <span>无缝支持 Midjourney v6 / Kling / Google Veo / Runway Gen-3</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white text-xs"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
}
