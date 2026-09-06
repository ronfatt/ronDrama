'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { studioStore } from '@/lib/store';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    logline: '',
    genre: '动作 / 悬疑 / 超自然',
    language: '中文 / 英文',
    targetEpisodes: 10,
    episodeDuration: '5–10 分钟',
    aspectRatio: '16:9',
    visualStyle: '电影级写实 (Cinematic / Photorealistic)',
    era: '近未来 (Near-Future)',
    location: '都市工业区 / 地下金库',
    tone: '冷峻、高压、暗黑电影质感与高烈度动作悬念',
    referenceWorks: '《John Wick》、《银翼杀手2049》、《边境杀手》',
    status: '前期筹备 (Pre-Production)',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入连续剧项目名称。');
      return;
    }

    const created = studioStore.addProject(formData);
    router.push(`/projects/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back Link & Header */}
      <div className="flex items-center justify-between border-b border-studio-700/50 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回控制中心</span>
        </Link>
        <span className="text-[11px] font-mono text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>新建制作企划 • Project Genesis</span>
        </span>
      </div>

      <div className="bg-studio-900 border border-studio-700 rounded-xl p-8 shadow-2xl">
        <div className="border-b border-studio-700/60 pb-6 mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Film className="w-6 h-6 text-gold-500" />
            <span>创建新连续剧项目</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            确立新剧集的基础参数、世界观与视听风格法则，将作为后续分镜 Prompt 生成的母本。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name & Genre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                连续剧名称 (Project Name) <span className="text-gold-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="例如: THE LAST ASSASSIN (最后的刺客)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                类型流派 (Genre)
              </label>
              <input
                type="text"
                placeholder="例如: 动作 / 悬疑 / 超自然 (Action / Supernatural Thriller)"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Logline */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
              故事梗概 (Logline)
            </label>
            <textarea
              rows={3}
              placeholder="一句话提炼主角、触发事件、核心冲突与关键危机..."
              value={formData.logline}
              onChange={(e) => setFormData({ ...formData, logline: e.target.value })}
              className="w-full bg-studio-800 border border-studio-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
            />
          </div>

          {/* Row 2: Episodes, Duration, Aspect Ratio, Language */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                目标集数 (Target Episodes)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={formData.targetEpisodes}
                onChange={(e) => setFormData({ ...formData, targetEpisodes: parseInt(e.target.value) || 1 })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                单集时长 (Episode Duration)
              </label>
              <input
                type="text"
                value={formData.episodeDuration}
                onChange={(e) => setFormData({ ...formData, episodeDuration: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                画幅比例 (Aspect Ratio)
              </label>
              <select
                value={formData.aspectRatio}
                onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              >
                <option value="16:9">16:9 (标准电影横屏)</option>
                <option value="2.39:1">2.39:1 (变形宽银幕 Anamorphic)</option>
                <option value="9:16">9:16 (微短剧竖屏)</option>
                <option value="4:3">4:3 (复古学院画幅)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                对白语言 (Language)
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Row 3: Visual Style, Era, Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                整体视觉风格 (Visual Style)
              </label>
              <input
                type="text"
                value={formData.visualStyle}
                onChange={(e) => setFormData({ ...formData, visualStyle: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                时代背景 (Era)
              </label>
              <input
                type="text"
                value={formData.era}
                onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                主要取景地点 (Location)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Row 4: Tone & Reference Works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                氛围基调 (Tone)
              </label>
              <input
                type="text"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                参考电影/作品 (Reference Works)
              </label>
              <input
                type="text"
                value={formData.referenceWorks}
                onChange={(e) => setFormData({ ...formData, referenceWorks: e.target.value })}
                className="w-full bg-studio-800 border border-studio-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-studio-700/60 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-sm font-semibold border border-studio-700 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-sm shadow-lg shadow-gold-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>创建项目并进入设定总纲 (Bible)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
