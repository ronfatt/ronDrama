'use client';

import React, { useState } from 'react';
import {
  History,
  GitCommit,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Flame,
  User,
  Sword,
  MapPin,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { Scene, StoryEvent, StoryCheckpoint, TransitionCause, LocationState } from '@/lib/types';
import { studioStore } from '@/lib/store';
import { useStudioStore } from '@/lib/useStudioStore';

interface SceneContextPanelProps {
  scene: Scene;
}

export default function SceneContextPanel({ scene }: SceneContextPanelProps) {
  const { storyEvents, storyCheckpoints, characters, props, locations } = useStudioStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'INHERITED' | 'CURRENT' | 'CHANGES' | 'EVENTS' | 'CHECKPOINT'>('INHERITED');
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Retrieve inherited context
  const inheritedContext = studioStore.getInheritedSceneContext(scene.id);
  const sceneEvents = (storyEvents || []).filter(e => e.sceneId === scene.id);
  const existingCheckpoint = (storyCheckpoints || []).find(c => c.sceneId === scene.id);

  // New Event Form State
  const [eventName, setEventName] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [targetCharId, setTargetCharId] = useState(scene.characters[0] || '');
  const [charToState, setCharToState] = useState('INJURED');
  const [eventCause, setEventCause] = useState<TransitionCause>('Fight');

  const handleSaveCheckpoint = () => {
    const charStates = scene.characters.map(charNameOrId => {
      const char = characters.find(c => c.id === charNameOrId || c.name === charNameOrId);
      const state = scene.characterStates?.find(cs => cs.characterId === char?.id)?.stateId || 'NORMAL';
      return {
        characterId: char?.id || charNameOrId,
        characterName: char?.name || charNameOrId,
        state,
      };
    });

    const propConditions = scene.props.map(propNameOrId => {
      const p = props.find(x => x.id === propNameOrId || x.name === propNameOrId);
      const cond = scene.propConditions?.find(pc => pc.propId === p?.id)?.condition || 'NEW';
      return {
        propId: p?.id || propNameOrId,
        propName: p?.name || propNameOrId,
        condition: cond,
      };
    });

    studioStore.saveStoryCheckpoint({
      sceneId: scene.id,
      sceneNumber: scene.sceneNumber,
      characterStates: charStates,
      costumeStates: scene.costumes.map(c => ({ costumeId: c, costumeName: c, condition: 'NORMAL' })),
      propConditions: propConditions,
      locationState: {
        locationName: scene.locationName,
        state: scene.locationState || 'Clean',
      },
      timelineDate: scene.storyDate || 'Day 1',
      timelineTime: scene.storyTime || '22:00',
      importantEvents: sceneEvents.map(e => e.name),
      openConflicts: inheritedContext.openConflicts,
      nextObjective: '承接本场戏剧冲突并推进至下一场。',
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    studioStore.addStoryEvent({
      projectId: scene.episodeId,
      sceneId: scene.id,
      sceneNumber: scene.sceneNumber,
      name: eventName.trim(),
      description: eventDesc.trim(),
      charactersAffected: [targetCharId],
      propsAffected: scene.props,
      locationAffected: scene.locationName,
      stateChanges: [
        {
          targetType: 'Character',
          targetId: targetCharId,
          targetName: characters.find(c => c.id === targetCharId)?.name || targetCharId,
          fromState: 'NORMAL',
          toState: charToState,
          cause: eventCause,
        },
      ],
      isApproved: true,
    });

    setNewEventModalOpen(false);
    setEventName('');
    setEventDesc('');
  };

  return (
    <div className="rounded-xl bg-studio-900 border border-studio-750 overflow-hidden shadow-lg transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 bg-studio-850 hover:bg-studio-800 transition-colors flex items-center justify-between cursor-pointer select-none border-b border-studio-750"
      >
        <div className="flex items-center gap-2 text-xs font-mono font-bold">
          <History className="w-4 h-4 text-gold-400" />
          <span className="text-white uppercase tracking-wider">场次生产上下文与剧情承接 (PRODUCTION CONTEXT)</span>
          {inheritedContext.whatChanged.length > 0 && inheritedContext.previousSceneNumber && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
              承接自 SC0{inheritedContext.previousSceneNumber}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-studio-950 p-0.5 rounded border border-studio-800 text-[11px] font-mono" onClick={(e) => e.stopPropagation()}>
            {(['INHERITED', 'CURRENT', 'CHANGES', 'EVENTS', 'CHECKPOINT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-0.5 rounded transition-colors ${
                  activeTab === tab ? 'bg-gold-500 text-studio-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab === 'INHERITED' ? '前置继承' : tab === 'CURRENT' ? '本场状态' : tab === 'CHANGES' ? '演变差异' : tab === 'EVENTS' ? `事件 (${sceneEvents.length})` : '定点锚'}
              </button>
            ))}
          </div>

          <button className="text-zinc-400 hover:text-white">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Panel Body */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-studio-900/60 text-xs">
          {/* TAB 1: INHERITED FROM PREVIOUS SCENE */}
          {activeTab === 'INHERITED' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="font-bold flex items-center gap-1.5 text-gold-400">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>前置场次继承基准 (INHERITED FROM SCENE 0{inheritedContext.previousSceneNumber || 1})</span>
                </span>
                <span className="text-[10px] text-zinc-500">
                  时段: {inheritedContext.inheritedTime || '22:00'} | 无需重复输入
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                {/* Inherited Characters */}
                <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-gold-400" />
                    <span>角色状态继承 (CHARACTERS)</span>
                  </div>
                  {inheritedContext.inheritedCharacterStates.length === 0 ? (
                    <div className="text-zinc-600 italic">无前置角色</div>
                  ) : (
                    inheritedContext.inheritedCharacterStates.map((cs) => (
                      <div key={cs.characterId} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-200">{cs.characterName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          ['INJURED', 'BLOODIED', 'EXHAUSTED'].includes(cs.state)
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-studio-800 text-emerald-400'
                        }`}>
                          {cs.state}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Inherited Props & Condition */}
                <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <Sword className="w-3 h-3 text-gold-400" />
                    <span>道具磨损继承 (PROPS)</span>
                  </div>
                  {inheritedContext.inheritedPropConditions.length === 0 ? (
                    <div className="text-zinc-600 italic">无前置道具</div>
                  ) : (
                    inheritedContext.inheritedPropConditions.map((pc) => (
                      <div key={pc.propId} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-200 line-clamp-1">{pc.propName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          ['DAMAGED', 'BLOODY', 'BROKEN'].includes(pc.condition)
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-studio-800 text-zinc-300'
                        }`}>
                          {pc.condition}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Inherited Location & Conflicts */}
                <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1.5">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold-400" />
                    <span>场景环境破坏度 (LOCATION)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-200">{inheritedContext.inheritedLocationState?.locationName || scene.locationName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-studio-800 text-gold-400">
                      {inheritedContext.inheritedLocationState?.state || 'Clean'}
                    </span>
                  </div>
                  {inheritedContext.openConflicts.length > 0 && (
                    <div className="pt-1 border-t border-studio-850 text-[10px] text-zinc-400 font-sans">
                      <span className="text-amber-400 font-mono font-bold">悬疑冲突: </span>
                      {inheritedContext.openConflicts.slice(0, 1).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRENT SCENE PRODUCTION STATE */}
          {activeTab === 'CURRENT' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">场次叙事核心任务</span>
                <p className="text-zinc-300 font-sans text-xs line-clamp-2">{scene.storyPurpose || '暂无叙事目的'}</p>
              </div>

              <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">环境物理状态 (LOCATION STATE)</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{scene.locationName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-studio-800 text-gold-400 border border-studio-700">
                    {scene.locationState || 'Clean'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">故事时钟锚点</span>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{scene.storyDate || 'Day 1'} • {scene.storyTime || '22:00'} ({scene.timeOfDay})</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHAT CHANGED? */}
          {activeTab === 'CHANGES' && (
            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-800 space-y-2">
              <div className="text-[11px] font-mono text-gold-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>与上一场次连贯性演变日志 (WHAT CHANGED LOG)</span>
              </div>
              <ul className="space-y-1.5">
                {inheritedContext.whatChanged.map((change, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                    <span className="text-gold-500 font-mono font-bold">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 4: STORY EVENTS */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 font-bold">
                  本场剧情触发事件与战损后果 (STORY EVENTS & CONSEQUENCES)
                </span>
                <button
                  onClick={() => setNewEventModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-studio-800 hover:bg-studio-750 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>+ 登记突发剧情事件 (如爆炸/受伤)</span>
                </button>
              </div>

              {sceneEvents.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 bg-studio-950 rounded-lg border border-studio-850">
                  本场尚未记录突发剧情事件。若发生爆炸、刀伤或环境崩塌，请点击上方按钮记录。
                </div>
              ) : (
                <div className="space-y-2">
                  {sceneEvents.map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-studio-950 border border-studio-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-bold text-white text-xs">{ev.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            已核准生效
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(ev.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">{ev.description}</p>
                      <div className="flex flex-wrap gap-2 pt-1 border-t border-studio-900">
                        {ev.stateChanges.map((sc, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-studio-900 text-amber-300 border border-studio-800">
                            {sc.targetName}: {sc.fromState} → {sc.toState} ({sc.cause})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STORY CHECKPOINT */}
          {activeTab === 'CHECKPOINT' && (
            <div className="p-4 rounded-lg bg-studio-950 border border-studio-800 space-y-3">
              <div className="flex items-center justify-between border-b border-studio-800 pb-2">
                <div>
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-gold-400" />
                    <span>场次结算定点锚 (STORY STATE CHECKPOINT)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    保存本场完结时的角色生理、道具损坏及环境状态，作为后续场次的唯一真实源。
                  </p>
                </div>

                <button
                  onClick={handleSaveCheckpoint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs transition-all shadow"
                >
                  {savedSuccess ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{savedSuccess ? '定点锚已锁定！' : '锁定本场定点锚 (SAVE CHECKPOINT)'}</span>
                </button>
              </div>

              {existingCheckpoint ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="space-y-1">
                    <span className="text-zinc-500">结算角色状态:</span>
                    <div className="text-zinc-200">
                      {existingCheckpoint.characterStates.map(cs => `${cs.characterName}: [${cs.state}]`).join(', ')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-500">结算道具磨损:</span>
                    <div className="text-zinc-200">
                      {existingCheckpoint.propConditions.map(pc => `${pc.propName}: [${pc.condition}]`).join(', ')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs italic">
                  尚未保存本场定点锚。完成所有镜头拍摄后，点击上方按钮锁定本场状态。
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE STORY EVENT MODAL */}
      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="border-b border-studio-700/60 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span>登记剧情突发事件 (Story Event)</span>
              </h3>
              <button onClick={() => setNewEventModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-mono uppercase text-zinc-300">事件名称 *</label>
                <input
                  required
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="例如: 仓库高频炸药引爆 (Explosion)"
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono uppercase text-zinc-300">事件详细描述</label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="描述事件对环境与角色的物理冲击..."
                  className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono uppercase text-zinc-300">引发原因 (Cause)</label>
                  <select
                    value={eventCause}
                    onChange={(e) => setEventCause(e.target.value as TransitionCause)}
                    className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500"
                  >
                    <option value="Fight">Fight (肉搏/器械拼杀)</option>
                    <option value="Explosion">Explosion (爆炸冲击)</option>
                    <option value="Falling">Falling (高处坠落)</option>
                    <option value="Water">Water (浸水/暴雨)</option>
                    <option value="Costume Change">Costume Change (换装)</option>
                    <option value="Time Jump">Time Jump (时间跨度自然愈合)</option>
                    <option value="Director Override">Director Override (导演指定)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-mono uppercase text-zinc-300">导致角色战损演变</label>
                  <select
                    value={charToState}
                    onChange={(e) => setCharToState(e.target.value)}
                    className="w-full bg-studio-800 border border-studio-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500"
                  >
                    <option value="INJURED">INJURED (轻伤/流血)</option>
                    <option value="BLOODIED">BLOODIED (重伤浴血)</option>
                    <option value="EXHAUSTED">EXHAUSTED (虚脱脱力)</option>
                    <option value="BATTLE DAMAGED">BATTLE DAMAGED (装甲破损)</option>
                    <option value="WET">WET (湿透泥泞)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-studio-750 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewEventModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-studio-800 text-zinc-300 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-studio-950 font-bold text-xs"
                >
                  确认登记并应用后果 (APPROVE)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
