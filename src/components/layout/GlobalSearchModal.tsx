'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, User, MapPin, Sword, Shirt, Film, Clapperboard, ChevronRight, Sparkles } from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { useRouter } from 'next/navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const { characters, locations, props, costumes, episodes } = useStudioStore();
  const router = useRouter();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const results: Array<{
      id: string;
      title: string;
      category: string;
      snippet: string;
      link: string;
      icon: React.ElementType;
    }> = [];

    // 1. Characters (with rich contextual appearances, costumes, and shot count)
    characters.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.personality.toLowerCase().includes(q) ||
        c.physicalDescription.toLowerCase().includes(q)
      ) {
        // Calculate appearances in scenes
        const appearances: string[] = [];
        let shotCount = 0;

        episodes.forEach((ep) => {
          ep.scenes?.forEach((sc) => {
            const hasChar = sc.characters.some(
              (ch) => ch.toLowerCase() === c.name.toLowerCase() || ch.toLowerCase().includes(c.name.toLowerCase())
            );
            if (hasChar) {
              appearances.push(`EP0${ep.episodeNumber} SC0${sc.sceneNumber}`);
              sc.shots?.forEach((sh) => {
                if (
                  sh.subject.toLowerCase().includes(c.name.toLowerCase()) ||
                  sh.action.toLowerCase().includes(c.name.toLowerCase())
                ) {
                  shotCount++;
                }
              });
            }
          });
        });

        const lockedVer = c.versions.find((v) => v.id === c.lockedVersionId) || c.versions.find((v) => v.status === 'LOCKED');
        const lockedTag = lockedVer ? `Master Reference: 🔒 ${lockedVer.versionTag}` : 'DRAFT';
        const appearStr = appearances.length > 0 ? `Appears in: ${appearances.slice(0, 4).join(', ')}` : 'No scene appearances yet';

        results.push({
          id: c.id,
          title: c.name,
          category: '角色 Character',
          snippet: `${lockedTag} • ${appearStr} • Shots: ${shotCount}`,
          link: `/assets?tab=characters&id=${c.id}`,
          icon: User,
        });
      }
    });

    // 2. Locations
    locations.forEach((l) => {
      if (
        l.name.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.environment.toLowerCase().includes(q)
      ) {
        const lockedVer = l.versions.find((v) => v.id === l.lockedVersionId) || l.versions[0];
        results.push({
          id: l.id,
          title: l.name,
          category: '场景 Location',
          snippet: `🔒 ${lockedVer?.versionTag || 'V1'} • ${l.environment || l.description}`,
          link: `/assets?tab=locations&id=${l.id}`,
          icon: MapPin,
        });
      }
    });

    // 3. Props
    props.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      ) {
        const lockedVer = p.versions.find((v) => v.id === p.lockedVersionId) || p.versions[0];
        results.push({
          id: p.id,
          title: p.name,
          category: '道具 Prop',
          snippet: `🔒 ${lockedVer?.versionTag || 'V1'} • ${p.material || ''} • ${p.function || p.storyImportance}`,
          link: `/assets?tab=props&id=${p.id}`,
          icon: Sword,
        });
      }
    });

    // 4. Costumes
    costumes.forEach((cos) => {
      if (
        cos.name.toLowerCase().includes(q) ||
        cos.description.toLowerCase().includes(q) ||
        (cos.characterName && cos.characterName.toLowerCase().includes(q))
      ) {
        const lockedVer = cos.versions.find((v) => v.id === cos.lockedVersionId) || cos.versions[0];
        results.push({
          id: cos.id,
          title: cos.name,
          category: '服装 Costume',
          snippet: `🔒 ${lockedVer?.versionTag || 'V1'} • 佩戴者: ${cos.characterName || '角色'} • ${cos.condition}`,
          link: `/assets?tab=costumes&id=${cos.id}`,
          icon: Shirt,
        });
      }
    });

    // 5. Episodes, Scenes, Shots, and Prompts
    episodes.forEach((ep) => {
      if (ep.title.toLowerCase().includes(q) || ep.logline.toLowerCase().includes(q)) {
        results.push({
          id: ep.id,
          title: `第 0${ep.episodeNumber} 集: ${ep.title}`,
          category: '剧集 Episode',
          snippet: ep.logline,
          link: `/episodes`,
          icon: Film,
        });
      }

      ep.scenes?.forEach((sc) => {
        if (
          sc.sceneTitle.toLowerCase().includes(q) ||
          sc.locationName.toLowerCase().includes(q) ||
          sc.storyPurpose.toLowerCase().includes(q) ||
          sc.characters.some((ch) => ch.toLowerCase().includes(q))
        ) {
          results.push({
            id: sc.id,
            title: `EP0${ep.episodeNumber} / SC0${sc.sceneNumber}: ${sc.sceneTitle}`,
            category: '场次 Scene',
            snippet: `${sc.intExt} • 出场人物: ${sc.characters.join(', ')}`,
            link: `/director?sceneId=${sc.id}`,
            icon: Clapperboard,
          });
        }

        sc.shots?.forEach((sh) => {
          if (
            sh.subject.toLowerCase().includes(q) ||
            sh.action.toLowerCase().includes(q) ||
            sh.shotType.toLowerCase().includes(q)
          ) {
            results.push({
              id: sh.id,
              title: `SC0${sc.sceneNumber} / 分镜 #${sh.shotNumber} (${sh.shotType}): ${sh.subject}`,
              category: '分镜 Shot',
              snippet: sh.action,
              link: `/director?sceneId=${sc.id}&shotId=${sh.id}`,
              icon: Clapperboard,
            });
          }

          // Search inside prompt texts
          sh.prompts?.forEach((p) => {
            if (
              p.promptUniversal?.toLowerCase().includes(q) ||
              p.promptGoogleFlow?.toLowerCase().includes(q) ||
              p.promptDreamina?.toLowerCase().includes(q) ||
              p.promptText?.toLowerCase().includes(q)
            ) {
              results.push({
                id: p.id,
                title: `Prompt ${p.versionTag} (SC0${sc.sceneNumber} SHOT #${sh.shotNumber})`,
                category: '提示词 Prompt',
                snippet: p.promptUniversal || p.promptText || '',
                link: `/director?sceneId=${sc.id}&shotId=${sh.id}`,
                icon: Sparkles,
              });
            }
          });
        });
      });
    });

    return results;
  }, [query, characters, locations, props, costumes, episodes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-studio-900 border border-studio-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-studio-700 flex items-center gap-3 bg-studio-850">
          <Search className="w-5 h-5 text-gold-400" />
          <input
            autoFocus
            type="text"
            placeholder="搜索全剧角色、场景、道具、服装、场次、分镜、Prompt (例如: RON, Katana, 仓库)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 hover:text-white text-zinc-400">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-studio-700 text-zinc-400 border border-studio-600">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {searchResults.length === 0 && query.trim() && (
            <div className="text-center py-12 text-zinc-500 text-sm">
              未找到与 &ldquo;<span className="text-white">{query}</span>&rdquo; 匹配的内容
            </div>
          )}

          {searchResults.length === 0 && !query.trim() && (
            <div className="text-center py-10 text-zinc-500 text-xs">
              输入关键词即可跨所有剧集、影视资产与生成提示词进行秒级检索...
            </div>
          )}

          {searchResults.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={`${item.category}-${item.id}`}
                onClick={() => {
                  onClose();
                  router.push(item.link);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-studio-800/80 transition-colors flex items-center justify-between group border border-transparent hover:border-studio-700"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-studio-800 border border-studio-700 flex items-center justify-center shrink-0 text-gold-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white group-hover:text-gold-300 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-studio-700/60 text-zinc-400 border border-studio-600/40">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{item.snippet}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-gold-400 transition-colors shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
