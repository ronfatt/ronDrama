'use client';

import React from 'react';
import { Clock, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStudioStore } from '@/lib/useStudioStore';

interface AssetStateTimelineProps {
  assetType: 'Character' | 'Prop' | 'Costume' | 'Location';
  assetId: string;
  assetName: string;
}

export default function AssetStateTimeline({ assetType, assetId, assetName }: AssetStateTimelineProps) {
  const { episodes, storyEvents, characters } = useStudioStore();

  const char = characters.find(c => c.id === assetId || c.name.toLowerCase() === assetName.toLowerCase());

  // Find all scene mentions and associated events
  const timelinePoints: Array<{
    episodeNumber: number;
    sceneNumber: number;
    sceneTitle: string;
    state: string;
    cause?: string;
    isEventTrigger?: boolean;
  }> = [];

  for (const ep of episodes) {
    for (const sc of ep.scenes || []) {
      let state: string | null = null;
      let cause: string | undefined = undefined;

      if (assetType === 'Character') {
        const cs = sc.characterStates?.find(c => c.characterId === assetId || c.characterId.toLowerCase() === assetName.toLowerCase());
        if (cs) {
          const foundState = char?.states?.find(s => s.id === cs.stateId);
          state = foundState?.name || cs.stateId || 'NORMAL';
          const ev = storyEvents.find(e => e.sceneId === sc.id && e.charactersAffected?.some(c => c.toLowerCase() === assetName.toLowerCase() || c === assetId));
          if (ev) {
            const change = ev.stateChanges?.find(ch => ch.targetType === 'Character' && (ch.targetId === assetId || ch.targetName.toLowerCase() === assetName.toLowerCase()));
            cause = change?.cause || ev.name;
          }
        } else if (sc.characters.some(c => c.toLowerCase() === assetName.toLowerCase() || c === assetId)) {
          state = 'NORMAL';
        }
      } else if (assetType === 'Prop') {
        const ps = sc.props.some(p => p.toLowerCase() === assetName.toLowerCase() || p === assetId);
        if (ps) {
          state = 'NEW';
          const ev = storyEvents.find(e => e.sceneId === sc.id && e.propsAffected?.some(p => p.toLowerCase() === assetName.toLowerCase() || p === assetId));
          if (ev) {
            const change = ev.stateChanges?.find(ch => ch.targetType === 'Prop' && (ch.targetId === assetId || ch.targetName.toLowerCase() === assetName.toLowerCase()));
            state = change?.toState || 'DAMAGED';
            cause = change?.cause || ev.name;
          }
        }
      } else if (assetType === 'Location') {
        if (sc.locationName?.toLowerCase() === assetName.toLowerCase() || sc.locationName === assetId) {
          state = sc.locationState || 'Pristine';
          const ev = storyEvents.find(e => e.sceneId === sc.id && (e.locationAffected?.toLowerCase() === assetName.toLowerCase() || e.locationAffected === assetId));
          if (ev) {
            const change = ev.stateChanges?.find(ch => ch.targetType === 'Location');
            cause = change?.cause || ev.name;
          }
        }
      } else if (assetType === 'Costume') {
        if (sc.costumes.some(c => c.toLowerCase() === assetName.toLowerCase() || c === assetId)) {
          state = 'Clean';
          const ev = storyEvents.find(e => e.sceneId === sc.id && e.costumeAffected?.some(c => c.toLowerCase() === assetName.toLowerCase() || c === assetId));
          if (ev) {
            const change = ev.stateChanges?.find(ch => ch.targetType === 'Costume');
            cause = change?.cause || ev.name;
          }
        }
      }

      if (state) {
        timelinePoints.push({
          episodeNumber: ep.episodeNumber,
          sceneNumber: sc.sceneNumber,
          sceneTitle: sc.sceneTitle,
          state,
          cause,
          isEventTrigger: Boolean(cause),
        });
      }
    }
  }

  if (timelinePoints.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-studio-800 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-gold-400" />
          场次状态演变时间轴 (STATE TIMELINE)
        </span>
        <span className="text-[10px] text-zinc-500">{timelinePoints.length} 处出场</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar">
        {timelinePoints.map((pt, idx) => {
          const isChanged = idx > 0 && timelinePoints[idx - 1].state !== pt.state;
          return (
            <React.Fragment key={`${pt.episodeNumber}-${pt.sceneNumber}`}>
              {idx > 0 && (
                <ArrowRight className={`w-3 h-3 shrink-0 ${isChanged ? 'text-amber-400' : 'text-zinc-600'}`} />
              )}
              <div
                className={`px-2 py-1 rounded border shrink-0 transition-colors ${
                  isChanged
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 font-bold'
                    : 'bg-studio-900 border-studio-800 text-zinc-300'
                }`}
                title={`EP${pt.episodeNumber} SC${pt.sceneNumber}: ${pt.sceneTitle}${pt.cause ? ` [原因: ${pt.cause}]` : ''}`}
              >
                <div className="text-[9px] text-zinc-500">
                  EP{pt.episodeNumber} SC{pt.sceneNumber}
                </div>
                <div className="flex items-center gap-1">
                  <span>{pt.state}</span>
                  {pt.cause && (
                    <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                      ⚡
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
