'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Download,
  FileText,
  Printer,
  Copy,
  Check,
  Tv,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { Episode } from '@/lib/types';

export default function ExportPage() {
  const { episodes, projects, activeProjectId, characters, locations, props, costumes, bibles } = useStudioStore();
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeBible = activeProject ? bibles[activeProject.id] : undefined;

  const [selectedEpId, setSelectedEpId] = useState<string>(episodes[0]?.id || '');
  const [copiedMd, setCopiedMd] = useState(false);

  const selectedEpisode = episodes.find(e => e.id === selectedEpId) || episodes[0];

  // Helper to assemble comprehensive markdown export
  const buildMarkdownExport = (ep?: Episode): string => {
    if (!ep || !activeProject) return '';

    let md = `# 影视制作打包总册 (PRODUCTION PACKAGE): ${activeProject.name}\n`;
    md += `**连续剧类型:** ${activeProject.genre} | **画幅比例:** ${activeProject.aspectRatio} | **整体视觉风格:** ${activeProject.visualStyle}\n\n`;
    md += `## 第 0${ep.episodeNumber} 集: ${ep.title.toUpperCase()}\n`;
    md += `**单集梗概 (Logline):** ${ep.logline}\n\n`;
    md += `**详细大纲 (Synopsis):** ${ep.synopsis}\n\n`;
    md += `**预估时长:** ${ep.runtime} | **制作阶段:** ${ep.status}\n\n`;
    md += `---\n\n`;

    ep.scenes?.forEach(sc => {
      md += `### 场次 0${sc.sceneNumber}: ${sc.sceneTitle} (${sc.intExt}, ${sc.timeOfDay})\n`;
      md += `**场景地点:** ${sc.locationName} | **时长:** ${sc.duration}\n`;
      md += `**叙事目的:** ${sc.storyPurpose}\n`;
      md += `**出场角色:** ${sc.characters.join(', ') || '无'}\n`;
      md += `**关键道具:** ${sc.props.join(', ') || '无'}\n`;
      md += `**导演意图设计 (Director's Intention):**\n`;
      md += `- *场次目的:* ${sc.directorScenePurpose || '未设定'}\n`;
      md += `- *叙事节奏:* ${sc.directorPacing || '紧凑'}\n`;
      md += `- *运镜机位策略:* ${sc.directorCameraStrategy || '未设定'}\n`;
      md += `- *灯光光影策略:* ${sc.directorLightingStrategy || '未设定'}\n\n`;

      if (sc.shots && sc.shots.length > 0) {
        md += `#### 分镜镜头表 (SHOT LIST)\n\n`;
        sc.shots.forEach(sh => {
          md += `* **分镜 0${sh.shotNumber} (${sh.shotType} / ${sh.lens} / ${sh.cameraMovement})**\n`;
          md += `  - **主体:** ${sh.subject}\n`;
          md += `  - **动作轨迹:** ${sh.action}\n`;
          md += `  - **光影:** ${sh.lighting || '默认'}\n`;
          md += `  - **时长:** ${sh.duration}\n`;
          if (sh.prompts && sh.prompts.length > 0) {
            md += `  - **已生成的视频 Prompt (English):**\n`;
            md += `    \`\`\`text\n    ${sh.prompts[sh.prompts.length - 1].promptText}\n    \`\`\`\n`;
          }
          md += `\n`;
        });
      }
      md += `---\n\n`;
    });

    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = buildMarkdownExport(selectedEpisode);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.name || 'series'}-EP0${selectedEpisode?.episodeNumber || 1}-production-package.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = {
      project: activeProject,
      bible: activeBible,
      episode: selectedEpisode,
      lockedAssets: {
        characters: characters.filter(c => c.lockedVersionId),
        locations: locations.filter(l => l.lockedVersionId),
        props: props.filter(p => p.lockedVersionId),
        costumes: costumes.filter(c => c.lockedVersionId),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject?.name || 'series'}-EP0${selectedEpisode?.episodeNumber || 1}-breakdown.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const markdownContent = buildMarkdownExport(selectedEpisode);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
            <Film className="w-3.5 h-3.5" />
            <span>制作打包与资产导出 • PRODUCTION PACKAGING & EXPORT</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            导出工作台 (Export Studio)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            将选定剧集的导演分镜表、设定总纲、各分镜视频生成 Prompt 一键打包导出为多种格式。
          </p>
        </div>

        {/* Episode Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 uppercase font-bold">选择剧集:</span>
          <select
            value={selectedEpId}
            onChange={(e) => setSelectedEpId(e.target.value)}
            className="bg-studio-850 border border-studio-700 hover:border-gold-500/50 text-white font-bold text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            {episodes.map(ep => (
              <option key={ep.id} value={ep.id}>
                第 0{ep.episodeNumber} 集: {ep.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Action Bar */}
      <div className="p-4 rounded-xl bg-studio-900 border border-studio-700 flex flex-wrap items-center justify-between gap-4 print:hidden shadow-xl">
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-gold-400"></span>
          <span>
            导出目标: <strong>第 0{selectedEpisode?.episodeNumber} 集：{selectedEpisode?.title}</strong> ({selectedEpisode?.scenes?.length || 0} 个场次)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-white text-xs font-semibold border border-studio-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span>打印 / 导出 PDF</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-cyan-400 text-xs font-semibold border border-studio-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 JSON 数据包</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-md shadow-gold-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 Markdown 文档 (.md)</span>
          </button>
        </div>
      </div>

      {/* Document Preview Box */}
      <div className="p-8 rounded-xl bg-studio-900 border border-studio-700 shadow-2xl space-y-6 text-zinc-200">
        <div className="flex items-center justify-between border-b border-studio-750 pb-4 print:border-zinc-300">
          <div>
            <h2 className="text-xl font-black text-white print:text-black">
              《{activeProject?.name}》— 第 0{selectedEpisode?.episodeNumber} 集: {selectedEpisode?.title}
            </h2>
            <p className="text-xs text-zinc-400 print:text-zinc-600 mt-0.5">
              导演工作本与分镜执行标准总册 (Production Bible & Shot Execution Specification)
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(markdownContent);
              setCopiedMd(true);
              setTimeout(() => setCopiedMd(false), 2000);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 print:hidden"
          >
            {copiedMd ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMd ? '已复制 Markdown！' : '复制原始 Markdown'}</span>
          </button>
        </div>

        {/* Rendered Preview */}
        <div className="space-y-6 text-xs leading-relaxed">
          <div className="p-4 rounded-lg bg-studio-850 border border-studio-750 print:bg-transparent print:border-zinc-300 space-y-2">
            <p><strong>单集梗概 (Logline):</strong> {selectedEpisode?.logline}</p>
            <p><strong>大纲情节 (Synopsis):</strong> {selectedEpisode?.synopsis}</p>
            <p><strong>预估时长:</strong> {selectedEpisode?.runtime} | <strong>制作状态:</strong> {selectedEpisode?.status}</p>
          </div>

          <div className="space-y-6">
            {selectedEpisode?.scenes?.map((sc) => (
              <div key={sc.id} className="border-t border-studio-750 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white print:text-black">
                    场次 0{sc.sceneNumber}: {sc.sceneTitle} ({sc.intExt} • {sc.timeOfDay})
                  </h3>
                  <span className="font-mono text-[11px] text-gold-400 print:text-zinc-700">
                    {sc.duration}
                  </span>
                </div>

                <p className="text-zinc-400 print:text-zinc-700">
                  <strong>叙事目的:</strong> {sc.storyPurpose}
                </p>

                <div className="text-[11px] font-mono text-zinc-400 flex flex-wrap gap-3">
                  <span>出场人物: {sc.characters.join(', ') || '无'}</span>
                  <span>•</span>
                  <span>关键道具: {sc.props.join(', ') || '无'}</span>
                  <span>•</span>
                  <span>节奏: {sc.directorPacing}</span>
                </div>

                {sc.shots && sc.shots.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[11px]">
                      分镜列表 (共 {sc.shots.length} 个镜头):
                    </h4>
                    <div className="space-y-2 pl-3 border-l border-gold-500/30">
                      {sc.shots.map((sh) => (
                        <div key={sh.id} className="space-y-1">
                          <p className="font-bold text-white print:text-black">
                            分镜 0{sh.shotNumber} ({sh.shotType}, {sh.lens}, {sh.cameraMovement}, {sh.duration})
                          </p>
                          <p className="text-zinc-400 print:text-zinc-700">{sh.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
