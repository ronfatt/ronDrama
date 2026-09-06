'use client';

import React, { useState } from 'react';
import {
  Boxes,
  User,
  MapPin,
  Sword,
  Shirt,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  Upload,
  Copy,
  Check,
  Edit2,
  ShieldCheck,
  Eye,
  Camera,
  Layers,
} from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';
import { studioStore } from '@/lib/store';
import { Character, Location, Prop, Costume, BaseVersion } from '@/lib/types';
import { generateAssetImagePrompt, generateCharacterSheetPrompt } from '@/lib/promptEngine';
import { uploadAssetImage } from '@/lib/supabaseClient';
import MasterImpactModal from '@/components/assets/MasterImpactModal';
import AssetStateTimeline from '@/components/assets/AssetStateTimeline';

export default function AssetBiblePage() {
  const { characters, locations, props, costumes, projects, activeProjectId, bibles } = useStudioStore();
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeBible = activeProject ? bibles[activeProject.id] : undefined;

  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'props' | 'costumes'>('characters');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [imagePromptModal, setImagePromptModal] = useState<{
    open: boolean;
    prompt: string;
    assetName: string;
    copied: boolean;
  }>({ open: false, prompt: '', assetName: '', copied: false });

  // Master Change Impact Modal State
  const [impactModal, setImpactModal] = useState<{
    open: boolean;
    assetType: 'Character' | 'Location' | 'Prop' | 'Costume';
    assetId: string;
    assetName: string;
    versionId: string;
    versionTag: string;
    imageUrl?: string;
  }>({
    open: false,
    assetType: 'Character',
    assetId: '',
    assetName: '',
    versionId: '',
    versionTag: '',
  });

  // New Version upload state
  const [versionModal, setVersionModal] = useState<{
    open: boolean;
    assetType: 'Character' | 'Location' | 'Prop' | 'Costume';
    assetId: string;
    assetName: string;
    notes: string;
    imageUrl: string;
  }>({ open: false, assetType: 'Character', assetId: '', assetName: '', notes: '', imageUrl: '' });

  // Handle Quick Image Prompt Generation
  const handleOpenImagePrompt = (
    type: 'Character' | 'Location' | 'Prop' | 'Costume',
    asset: any
  ) => {
    const prompt = generateAssetImagePrompt(type, asset, activeProject, activeBible);
    setImagePromptModal({
      open: true,
      prompt,
      assetName: asset.name,
      copied: false,
    });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(imagePromptModal.prompt);
    setImagePromptModal(prev => ({ ...prev, copied: true }));
    setTimeout(() => setImagePromptModal(prev => ({ ...prev, copied: false })), 2000);
  };

  // Handle Local / Supabase Image Upload for a Version
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bucket = versionModal.assetType === 'Character'
      ? 'characters'
      : versionModal.assetType === 'Location'
      ? 'locations'
      : versionModal.assetType === 'Prop'
      ? 'props'
      : 'costumes';

    const path = `${Date.now()}-${file.name}`;
    const res = await uploadAssetImage(bucket, file, path);
    if (res.url) {
      setVersionModal(prev => ({ ...prev, imageUrl: res.url }));
    }
  };

  const handleAddVersionSubmit = () => {
    if (!versionModal.assetId) return;
    studioStore.addAssetVersion(
      versionModal.assetType,
      versionModal.assetId,
      versionModal.notes || '视觉概念迭代',
      versionModal.imageUrl || undefined
    );
    setVersionModal({ open: false, assetType: 'Character', assetId: '', assetName: '', notes: '', imageUrl: '' });
  };

  const getTypeName = () => {
    switch (activeTab) {
      case 'characters': return '角色';
      case 'locations': return '场景';
      case 'props': return '道具';
      case 'costumes': return '服装';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-700/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-gold-400 uppercase tracking-widest">
            <Boxes className="w-3.5 h-3.5" />
            <span>主视觉连续性总纲 • MASTER VISUAL CONTINUITY REGISTRY</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
            <span>影视资产库 (Asset Bible)</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            统一建立、多版本迭代、并锁定角色、场景、道具与服装的【主视觉参考 Master Reference】。
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-lg shadow-gold-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ 新建{getTypeName()}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-studio-700/60 pb-2">
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors ${
            activeTab === 'characters'
              ? 'bg-gold-500 text-studio-950'
              : 'text-zinc-400 hover:text-white bg-studio-900 border border-studio-800'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>角色库 CHARACTERS ({characters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors ${
            activeTab === 'locations'
              ? 'bg-gold-500 text-studio-950'
              : 'text-zinc-400 hover:text-white bg-studio-900 border border-studio-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>场景库 LOCATIONS ({locations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('props')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors ${
            activeTab === 'props'
              ? 'bg-gold-500 text-studio-950'
              : 'text-zinc-400 hover:text-white bg-studio-900 border border-studio-800'
          }`}
        >
          <Sword className="w-3.5 h-3.5" />
          <span>道具库 PROPS ({props.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('costumes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors ${
            activeTab === 'costumes'
              ? 'bg-gold-500 text-studio-950'
              : 'text-zinc-400 hover:text-white bg-studio-900 border border-studio-800'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>服装库 COSTUMES ({costumes.length})</span>
        </button>
      </div>

      {/* CHARACTERS GRID */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => {
            const lockedVer = char.versions.find(v => v.id === char.lockedVersionId) || char.versions.find(v => v.status === 'LOCKED');
            return (
              <div
                key={char.id}
                className="rounded-xl bg-studio-900 border border-studio-700/80 overflow-hidden flex flex-col justify-between group hover:border-studio-600 transition-all shadow-xl"
              >
                {/* Header & Lock Banner */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold">
                        {char.role}
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-gold-300 transition-colors mt-0.5">
                        {char.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {char.gender} • {char.age}岁 • 身高 {char.height}
                      </p>
                    </div>

                    {lockedVer ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold shadow-sm">
                        <Lock className="w-3.5 h-3.5" />
                        <span>🔒 已锁定主参考 ({lockedVer.versionTag})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-studio-800 border border-studio-700 text-zinc-400 text-[11px] font-mono">
                        <Unlock className="w-3 h-3" />
                        <span>未锁定</span>
                      </div>
                    )}
                  </div>

                  {/* Character Specs */}
                  <div className="space-y-2 text-xs text-zinc-300 bg-studio-850 p-3.5 rounded-lg border border-studio-750 font-sans">
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">发型 Hair:</strong> {char.hair || '暂无设定'}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">面部特征 Face:</strong> {char.face || '暂无设定'}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">服饰造型 Costume:</strong> {char.costume || '暂无设定'}</p>
                    <p className="text-zinc-400 italic mt-1 line-clamp-2">{char.personality}</p>
                  </div>

                  {/* Versions Gallery Bar */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
                      <span>视觉版本库 ({char.versions.length} 个版本)</span>
                      <button
                        onClick={() =>
                          setVersionModal({
                            open: true,
                            assetType: 'Character',
                            assetId: char.id,
                            assetName: char.name,
                            notes: '',
                            imageUrl: '',
                          })
                        }
                        className="text-gold-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加新版本</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {char.versions.map((ver) => {
                        const isLocked = ver.id === char.lockedVersionId || ver.status === 'LOCKED';
                        return (
                          <div
                            key={ver.id}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 border transition-all ${
                              isLocked
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-studio-800 border-studio-700 text-zinc-300 hover:border-studio-600'
                            }`}
                          >
                            <span>{ver.versionTag}</span>
                            {isLocked ? (
                              <button
                                onClick={() => studioStore.unlockAssetVersion('Character', char.id)}
                                title="点击解除锁定"
                                className="text-emerald-400 hover:text-emerald-200"
                              >
                                <Lock className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setImpactModal({
                                    open: true,
                                    assetType: 'Character',
                                    assetId: char.id,
                                    assetName: char.name,
                                    versionId: ver.id,
                                    versionTag: ver.versionTag,
                                    imageUrl: ver.referenceImageUrl,
                                  })
                                }
                                title="锁定为此角色的主视觉参考 (Master Reference)"
                                className="text-zinc-500 hover:text-gold-400"
                              >
                                <Unlock className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Character State Evolution Across Scenes */}
                  <AssetStateTimeline assetType="Character" assetId={char.id} assetName={char.name} />
                </div>

                {/* Footer Action: Generate Image Prompt & Turnaround Sheet */}
                <div className="p-4 bg-studio-850 border-t border-studio-750 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    主参考: {lockedVer?.versionTag || '未锁定'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const prompt = generateCharacterSheetPrompt(char);
                        setImagePromptModal({
                          open: true,
                          prompt,
                          assetName: `${char.name} [8面转向图模型]`,
                          copied: false,
                        });
                      }}
                      className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-gold-400 transition-colors"
                      title="生成角色 8 面转向图模型 Prompt"
                    >
                      <Camera className="w-3.5 h-3.5 text-gold-400" />
                      <span>8面转向图</span>
                    </button>
                    <button
                      onClick={() => handleOpenImagePrompt('Character', char)}
                      className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>单帧 PROMPT</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOCATIONS GRID */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const lockedVer = loc.versions.find(v => v.id === loc.lockedVersionId) || loc.versions.find(v => v.status === 'LOCKED');
            return (
              <div
                key={loc.id}
                className="rounded-xl bg-studio-900 border border-studio-700/80 overflow-hidden flex flex-col justify-between group hover:border-studio-600 transition-all shadow-xl"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold">
                        {loc.time} • {loc.weather}
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-gold-300 transition-colors mt-0.5">
                        {loc.name}
                      </h3>
                    </div>

                    {lockedVer ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>🔒 已锁定主参考 ({lockedVer.versionTag})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-studio-800 border border-studio-700 text-zinc-400 text-[11px] font-mono">
                        <Unlock className="w-3 h-3" />
                        <span>未锁定</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 bg-studio-850 p-3.5 rounded-lg border border-studio-750">
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">建筑形制 Architecture:</strong> {loc.architecture}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">氛围环境 Atmosphere:</strong> {loc.atmosphere}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">光影设定 Lighting:</strong> {loc.lighting}</p>
                  </div>

                  {/* Versions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
                      <span>视觉版本库 ({loc.versions.length} 个版本)</span>
                      <button
                        onClick={() =>
                          setVersionModal({
                            open: true,
                            assetType: 'Location',
                            assetId: loc.id,
                            assetName: loc.name,
                            notes: '',
                            imageUrl: '',
                          })
                        }
                        className="text-gold-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加新版本</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {loc.versions.map((ver) => {
                        const isLocked = ver.id === loc.lockedVersionId || ver.status === 'LOCKED';
                        return (
                          <div
                            key={ver.id}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 border transition-all ${
                              isLocked
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-studio-800 border-studio-700 text-zinc-300'
                            }`}
                          >
                            <span>{ver.versionTag}</span>
                            {isLocked ? (
                              <button
                                onClick={() => studioStore.unlockAssetVersion('Location', loc.id)}
                                className="text-emerald-400 hover:text-emerald-200"
                              >
                                <Lock className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setImpactModal({
                                    open: true,
                                    assetType: 'Location',
                                    assetId: loc.id,
                                    assetName: loc.name,
                                    versionId: ver.id,
                                    versionTag: ver.versionTag,
                                    imageUrl: ver.referenceImageUrl,
                                  })
                                }
                                className="text-zinc-500 hover:text-gold-400"
                              >
                                <Unlock className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location State Evolution Across Scenes */}
                  <AssetStateTimeline assetType="Location" assetId={loc.id} assetName={loc.name} />
                </div>

                <div className="p-4 bg-studio-850 border-t border-studio-750 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    主参考: {lockedVer?.versionTag || '未锁定'}
                  </span>
                  <button
                    onClick={() => handleOpenImagePrompt('Location', loc)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>生成图片 PROMPT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PROPS GRID */}
      {activeTab === 'props' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {props.map((p) => {
            const lockedVer = p.versions.find(v => v.id === p.lockedVersionId) || p.versions.find(v => v.status === 'LOCKED');
            return (
              <div
                key={p.id}
                className="rounded-xl bg-studio-900 border border-studio-700/80 overflow-hidden flex flex-col justify-between group hover:border-studio-600 transition-all shadow-xl"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold">
                        {p.storyImportance}
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-gold-300 transition-colors mt-0.5">
                        {p.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        {p.material} • 尺寸: {p.size}
                      </p>
                    </div>

                    {lockedVer ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>🔒 已锁定主参考 ({lockedVer.versionTag})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-studio-800 border border-studio-700 text-zinc-400 text-[11px] font-mono">
                        <Unlock className="w-3 h-3" />
                        <span>未锁定</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 bg-studio-850 p-3.5 rounded-lg border border-studio-750">
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">工艺细节 Details:</strong> {p.description}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">表面色彩 Color:</strong> {p.color}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">剧情功能 Function:</strong> {p.function}</p>
                  </div>

                  {/* Versions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
                      <span>视觉版本库 ({p.versions.length} 个版本)</span>
                      <button
                        onClick={() =>
                          setVersionModal({
                            open: true,
                            assetType: 'Prop',
                            assetId: p.id,
                            assetName: p.name,
                            notes: '',
                            imageUrl: '',
                          })
                        }
                        className="text-gold-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加新版本</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {p.versions.map((ver) => {
                        const isLocked = ver.id === p.lockedVersionId || ver.status === 'LOCKED';
                        return (
                          <div
                            key={ver.id}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 border transition-all ${
                              isLocked
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-studio-800 border-studio-700 text-zinc-300'
                            }`}
                          >
                            <span>{ver.versionTag}</span>
                            {isLocked ? (
                              <button
                                onClick={() => studioStore.unlockAssetVersion('Prop', p.id)}
                                className="text-emerald-400 hover:text-emerald-200"
                              >
                                <Lock className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setImpactModal({
                                    open: true,
                                    assetType: 'Prop',
                                    assetId: p.id,
                                    assetName: p.name,
                                    versionId: ver.id,
                                    versionTag: ver.versionTag,
                                    imageUrl: ver.referenceImageUrl,
                                  })
                                }
                                className="text-zinc-500 hover:text-gold-400"
                              >
                                <Unlock className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prop Condition Evolution Across Scenes */}
                  <AssetStateTimeline assetType="Prop" assetId={p.id} assetName={p.name} />
                </div>

                <div className="p-4 bg-studio-850 border-t border-studio-750 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    主参考: {lockedVer?.versionTag || '未锁定'}
                  </span>
                  <button
                    onClick={() => handleOpenImagePrompt('Prop', p)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>生成图片 PROMPT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COSTUMES GRID */}
      {activeTab === 'costumes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costumes.map((cos) => {
            const lockedVer = cos.versions.find(v => v.id === cos.lockedVersionId) || cos.versions.find(v => v.status === 'LOCKED');
            return (
              <div
                key={cos.id}
                className="rounded-xl bg-studio-900 border border-studio-700/80 overflow-hidden flex flex-col justify-between group hover:border-studio-600 transition-all shadow-xl"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold">
                        专属角色: {cos.characterName || '主要角色'}
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-gold-300 transition-colors mt-0.5">
                        {cos.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        面料: {cos.material} • 磨损状态: {cos.condition}
                      </p>
                    </div>

                    {lockedVer ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>🔒 已锁定主参考 ({lockedVer.versionTag})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-studio-800 border border-studio-700 text-zinc-400 text-[11px] font-mono">
                        <Unlock className="w-3 h-3" />
                        <span>未锁定</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300 bg-studio-850 p-3.5 rounded-lg border border-studio-750">
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">造型描述 Description:</strong> {cos.description}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">配饰挂件 Accessories:</strong> {cos.accessories || '无'}</p>
                    <p><strong className="text-zinc-400 font-mono text-[11px] uppercase">战靴/鞋履 Shoes:</strong> {cos.shoes || '暂无设定'}</p>
                  </div>

                  {/* Versions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase">
                      <span>视觉版本库 ({cos.versions.length} 个版本)</span>
                      <button
                        onClick={() =>
                          setVersionModal({
                            open: true,
                            assetType: 'Costume',
                            assetId: cos.id,
                            assetName: cos.name,
                            notes: '',
                            imageUrl: '',
                          })
                        }
                        className="text-gold-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>添加新版本</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cos.versions.map((ver) => {
                        const isLocked = ver.id === cos.lockedVersionId || ver.status === 'LOCKED';
                        return (
                          <div
                            key={ver.id}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-2 border transition-all ${
                              isLocked
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-studio-800 border-studio-700 text-zinc-300'
                            }`}
                          >
                            <span>{ver.versionTag}</span>
                            {isLocked ? (
                              <button
                                onClick={() => studioStore.unlockAssetVersion('Costume', cos.id)}
                                className="text-emerald-400 hover:text-emerald-200"
                              >
                                <Lock className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setImpactModal({
                                    open: true,
                                    assetType: 'Costume',
                                    assetId: cos.id,
                                    assetName: cos.name,
                                    versionId: ver.id,
                                    versionTag: ver.versionTag,
                                    imageUrl: ver.referenceImageUrl,
                                  })
                                }
                                className="text-zinc-500 hover:text-gold-400"
                              >
                                <Unlock className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Costume Wear Evolution Across Scenes */}
                  <AssetStateTimeline assetType="Costume" assetId={cos.id} assetName={cos.name} />
                </div>

                <div className="p-4 bg-studio-850 border-t border-studio-750 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    主参考: {lockedVer?.versionTag || '未锁定'}
                  </span>
                  <button
                    onClick={() => handleOpenImagePrompt('Costume', cos)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>生成图片 PROMPT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GENERATE IMAGE PROMPT MODAL */}
      {imagePromptModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-studio-700 flex items-center justify-between bg-studio-850">
              <div className="flex items-center gap-2 text-gold-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">
                  生成图片 Prompt: {imagePromptModal.assetName}
                </h3>
              </div>
              <button
                onClick={() => setImagePromptModal(prev => ({ ...prev, open: false }))}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                可直接复制以下专为文生图模型调优的英文提示词至 <strong>Midjourney</strong>、<strong>ChatGPT / DALL-E</strong>、<strong>Dreamina</strong> 或 <strong>Gemini</strong> 生成定妆照/设定图，生成完成后上传回本平台建立版本：
              </p>

              <textarea
                readOnly
                rows={6}
                value={imagePromptModal.prompt}
                className="w-full bg-studio-950 border border-studio-750 rounded-lg p-4 font-mono text-xs text-zinc-200 leading-relaxed focus:outline-none"
              />
            </div>

            <div className="p-6 border-t border-studio-750 bg-studio-850 flex items-center justify-end gap-3">
              <button
                onClick={() => setImagePromptModal(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-xs font-semibold"
              >
                关闭
              </button>

              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs shadow-md shadow-gold-500/20"
              >
                {imagePromptModal.copied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>已复制到剪贴板！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>复制图片 PROMPT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD VERSION MODAL */}
      {versionModal.open && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-studio-700 flex items-center justify-between bg-studio-850">
              <h3 className="text-lg font-bold text-white">
                为《{versionModal.assetName}》添加新视觉版本
              </h3>
              <button
                onClick={() => setVersionModal(prev => ({ ...prev, open: false }))}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">版本迭代说明 (Notes)</label>
                <input
                  type="text"
                  placeholder="例如: 夜战高领战术风衣形态 / 破损战损版"
                  value={versionModal.notes}
                  onChange={(e) => setVersionModal({ ...versionModal, notes: e.target.value })}
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">上传视觉参考图 (Reference Image)</label>
                <div className="border-2 border-dashed border-studio-750 hover:border-gold-500/50 rounded-xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-studio-850">
                  <Upload className="w-6 h-6 text-gold-400 mx-auto" />
                  <p className="text-xs text-zinc-300 font-semibold">点击或将图片拖拽至此处</p>
                  <p className="text-[10px] text-zinc-500">支持 PNG, JPG, WebP 格式（持久化保存在本地/云端存储中）</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-studio-700 file:text-white hover:file:bg-studio-600 cursor-pointer pt-2"
                  />
                </div>
              </div>

              {versionModal.imageUrl && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>视觉参考图已成功关联！</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-studio-750 bg-studio-850 flex items-center justify-end gap-3">
              <button
                onClick={() => setVersionModal(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleAddVersionSubmit}
                className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs"
              >
                保存为新版本
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-studio-700 flex items-center justify-between bg-studio-850">
              <h3 className="text-lg font-bold text-white">
                快速创建{getTypeName()}
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const name = fd.get('name') as string;
                if (!name || !activeProject) return;

                if (activeTab === 'characters') {
                  studioStore.addCharacter({
                    projectId: activeProject.id,
                    name,
                    role: (fd.get('role') as string) || '主角 Protagonist',
                    age: (fd.get('age') as string) || '30',
                    gender: (fd.get('gender') as string) || '男',
                    personality: (fd.get('desc') as string) || '',
                    physicalDescription: (fd.get('desc') as string) || '',
                    hair: '',
                    face: '',
                    body: '',
                    height: '',
                    costume: '',
                    signatureFeatures: '',
                    performanceNotes: '',
                  });
                } else if (activeTab === 'locations') {
                  studioStore.addLocation({
                    projectId: activeProject.id,
                    name,
                    description: (fd.get('desc') as string) || '',
                    architecture: '',
                    environment: (fd.get('desc') as string) || '',
                    time: 'NIGHT',
                    weather: 'Clear',
                    lighting: 'Cinematic chiaroscuro',
                    colorPalette: 'Dark contrast',
                    atmosphere: 'Tense',
                    cameraNotes: '',
                  });
                } else if (activeTab === 'props') {
                  studioStore.addProp({
                    projectId: activeProject.id,
                    name,
                    description: (fd.get('desc') as string) || '',
                    material: '折叠大马士革钢',
                    color: '哑光黑',
                    size: '标准',
                    function: '主角武器',
                    storyImportance: '核心圣物',
                  });
                } else if (activeTab === 'costumes') {
                  studioStore.addCostume({
                    projectId: activeProject.id,
                    name,
                    characterName: (fd.get('role') as string) || '主角',
                    description: (fd.get('desc') as string) || '',
                    material: '战术芳纶织物',
                    color: '炭黑',
                    accessories: '',
                    shoes: '分趾静音战术靴',
                    condition: '崭新隐蔽',
                  });
                }

                setCreateModalOpen(false);
              }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">{getTypeName()}名称 *</label>
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="例如: RON 或 废弃工业仓库"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">
                  {activeTab === 'characters' ? '角色定位 / 身份原型' : activeTab === 'costumes' ? '专属角色' : '类型分类'}
                </label>
                <input
                  name="role"
                  type="text"
                  placeholder="例如: 主角 / 刺客大师 (Protagonist / Master Assassin)"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-zinc-300">外观描写与核心特征</label>
                <textarea
                  name="desc"
                  rows={3}
                  placeholder="简述外形特征、发型、材质工艺或环境氛围..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="pt-4 border-t border-studio-750 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs"
                >
                  创建并锁定 V1 主参考
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MASTER IMPACT MODAL */}
      {impactModal.open && (
        <MasterImpactModal
          assetType={impactModal.assetType}
          assetId={impactModal.assetId}
          assetName={impactModal.assetName}
          versionId={impactModal.versionId}
          versionTag={impactModal.versionTag}
          imageUrl={impactModal.imageUrl}
          onClose={() => setImpactModal(prev => ({ ...prev, open: false }))}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
