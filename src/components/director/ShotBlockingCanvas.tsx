'use client';

import React, { useState } from 'react';
import {
  Compass,
  Camera,
  User,
  Move,
  RotateCw,
  Maximize2,
  Check,
  RefreshCcw,
} from 'lucide-react';
import { Shot, ShotBlocking, BlockingCharacter, BlockingCamera } from '@/lib/types';
import { studioStore } from '@/lib/store';

interface ShotBlockingCanvasProps {
  shot: Shot;
  sceneId: string;
}

export default function ShotBlockingCanvas({ shot, sceneId }: ShotBlockingCanvasProps) {
  const initialBlocking: ShotBlocking = shot.blocking2D || {
    id: `block-${shot.id}`,
    shotId: shot.id,
    sceneId,
    floorplanType: 'Warehouse',
    characters: [
      {
        id: 'char-1',
        name: shot.subject?.split(' ')[0] || 'RON',
        startX: 25,
        startY: 50,
        endX: 65,
        endY: 50,
        facingDirection: 'Right',
        color: '#f59e0b',
      },
      {
        id: 'char-2',
        name: 'KIRA',
        startX: 75,
        startY: 50,
        endX: 75,
        endY: 50,
        facingDirection: 'Left',
        color: '#ef4444',
      },
    ],
    camera: {
      x: 45,
      y: 85,
      targetX: 65,
      targetY: 50,
      movementType: shot.cameraMovement || 'Tracking',
      lensLabel: shot.lens || '35mm',
    },
    notes: 'Camera tracks alongside subject parallel to movement vector.',
  };

  const [blocking, setBlocking] = useState<ShotBlocking>(initialBlocking);
  const [selectedEntity, setSelectedEntity] = useState<'camera' | string>('camera');

  const updateCharacterPosition = (charId: string, deltaX: number, deltaY: number) => {
    setBlocking(prev => {
      const nextChars = prev.characters.map(c => {
        if (c.id === charId) {
          const newEndX = Math.min(95, Math.max(5, c.endX + deltaX));
          const newEndY = Math.min(95, Math.max(5, c.endY + deltaY));
          return { ...c, endX: newEndX, endY: newEndY };
        }
        return c;
      });
      const updated = { ...prev, characters: nextChars };
      studioStore.updateShotBlocking(shot.id, updated);
      return updated;
    });
  };

  const updateCameraPosition = (deltaX: number, deltaY: number) => {
    setBlocking(prev => {
      const newX = Math.min(95, Math.max(5, prev.camera.x + deltaX));
      const newY = Math.min(95, Math.max(5, prev.camera.y + deltaY));
      const updated = {
        ...prev,
        camera: { ...prev.camera, x: newX, y: newY },
      };
      studioStore.updateShotBlocking(shot.id, updated);
      return updated;
    });
  };

  const applyPreset = (presetName: string) => {
    let updated = { ...blocking };
    if (presetName === 'PUSH_IN') {
      updated.characters[0] = { ...updated.characters[0], startX: 40, startY: 40, endX: 50, endY: 45 };
      updated.camera = { ...updated.camera, x: 50, y: 85, targetX: 50, targetY: 45, movementType: 'Dolly In' };
    } else if (presetName === 'TRACKING_SIDE') {
      updated.characters[0] = { ...updated.characters[0], startX: 20, startY: 40, endX: 75, endY: 40 };
      updated.camera = { ...updated.camera, x: 20, y: 70, targetX: 75, targetY: 40, movementType: 'Tracking' };
    } else if (presetName === 'OVER_SHOULDER') {
      updated.characters[0] = { ...updated.characters[0], startX: 45, startY: 60, endX: 45, endY: 60 };
      if (updated.characters[1]) updated.characters[1] = { ...updated.characters[1], startX: 55, startY: 30, endX: 55, endY: 30 };
      updated.camera = { ...updated.camera, x: 42, y: 75, targetX: 55, targetY: 30, movementType: 'Over The Shoulder' };
    }
    setBlocking(updated);
    studioStore.updateShotBlocking(shot.id, updated);
  };

  return (
    <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-3.5 shadow-inner">
      <div className="flex items-center justify-between border-b border-studio-800/80 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
          <Compass className="w-4 h-4 text-gold-400" />
          <span>2D 导演场面调度俯视图 (2D DIRECTOR BLOCKING)</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-zinc-500">预设:</span>
          <button
            onClick={() => applyPreset('PUSH_IN')}
            className="px-2 py-0.5 rounded bg-studio-900 hover:bg-studio-800 text-zinc-300 border border-studio-750"
          >
            推镜特写
          </button>
          <button
            onClick={() => applyPreset('TRACKING_SIDE')}
            className="px-2 py-0.5 rounded bg-studio-900 hover:bg-studio-800 text-zinc-300 border border-studio-750"
          >
            侧身跟拍
          </button>
          <button
            onClick={() => applyPreset('OVER_SHOULDER')}
            className="px-2 py-0.5 rounded bg-studio-900 hover:bg-studio-800 text-zinc-300 border border-studio-750"
          >
            过肩对峙
          </button>
        </div>
      </div>

      {/* 2D Top-Down Floorplan Canvas */}
      <div className="relative w-full h-56 rounded-lg bg-studio-900 border border-studio-800 overflow-hidden select-none">
        {/* Floorplan Grid lines */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floorplan Labels */}
        <div className="absolute top-2 left-3 text-[10px] font-mono text-zinc-600 uppercase">
          TOP-DOWN STAGE: {blocking.floorplanType}
        </div>
        <div className="absolute top-2 right-3 text-[10px] font-mono text-zinc-600">
          STAGE BACKGROUND (UP-STAGE)
        </div>
        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-zinc-600">
          CAMERA LINE (DOWN-STAGE)
        </div>

        {/* Movement Vector Arrows & Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {blocking.characters.map(c => (
            <g key={c.id}>
              {/* Line from start to end */}
              <line
                x1={`${c.startX}%`}
                y1={`${c.startY}%`}
                x2={`${c.endX}%`}
                y2={`${c.endY}%`}
                stroke={c.color || '#f59e0b'}
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.7"
              />
            </g>
          ))}

          {/* Camera View Line */}
          <line
            x1={`${blocking.camera.x}%`}
            y1={`${blocking.camera.y}%`}
            x2={`${blocking.camera.targetX}%`}
            y2={`${blocking.camera.targetY}%`}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />
          {/* Camera View Cone */}
          <polygon
            points={`${blocking.camera.x}%,${blocking.camera.y}% ${blocking.camera.targetX - 15}%,${blocking.camera.targetY}% ${blocking.camera.targetX + 15}%,${blocking.camera.targetY}%`}
            fill="#38bdf8"
            opacity="0.06"
          />
        </svg>

        {/* Character Markers */}
        {blocking.characters.map(c => {
          const isSelected = selectedEntity === c.id;
          return (
            <div
              key={c.id}
              onClick={() => setSelectedEntity(c.id)}
              style={{ left: `${c.endX}%`, top: `${c.endY}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center gap-0.5 transition-transform ${
                isSelected ? 'scale-110 z-20' : 'z-10'
              }`}
            >
              <div
                style={{ backgroundColor: c.color || '#f59e0b' }}
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-black shadow-lg"
              >
                {c.name.slice(0, 1)}
              </div>
              <span className="text-[10px] font-mono font-bold text-white bg-black/70 px-1 rounded shadow">
                {c.name}
              </span>
            </div>
          );
        })}

        {/* Camera Marker */}
        <div
          onClick={() => setSelectedEntity('camera')}
          style={{ left: `${blocking.camera.x}%`, top: `${blocking.camera.y}%` }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center gap-0.5 z-30 transition-transform ${
            selectedEntity === 'camera' ? 'scale-110' : ''
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-sky-500 border-2 border-white flex items-center justify-center text-white shadow-xl">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono font-bold text-sky-300 bg-black/80 px-1 rounded shadow">
            CAM ({blocking.camera.lensLabel})
          </span>
        </div>
      </div>

      {/* Movement Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-zinc-400">微调选中目标:</span>
          <span className="font-bold text-white uppercase px-2 py-0.5 rounded bg-studio-900 border border-studio-800">
            {selectedEntity === 'camera' ? '摄影机机位 (CAMERA)' : blocking.characters.find(c => c.id === selectedEntity)?.name || '角色'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => (selectedEntity === 'camera' ? updateCameraPosition(-5, 0) : updateCharacterPosition(selectedEntity, -5, 0))}
              className="px-2 py-1 bg-studio-900 hover:bg-studio-800 rounded border border-studio-750 text-white font-mono"
            >
              ← 左移
            </button>
            <button
              onClick={() => (selectedEntity === 'camera' ? updateCameraPosition(5, 0) : updateCharacterPosition(selectedEntity, 5, 0))}
              className="px-2 py-1 bg-studio-900 hover:bg-studio-800 rounded border border-studio-750 text-white font-mono"
            >
              右移 →
            </button>
            <button
              onClick={() => (selectedEntity === 'camera' ? updateCameraPosition(0, -5) : updateCharacterPosition(selectedEntity, 0, -5))}
              className="px-2 py-1 bg-studio-900 hover:bg-studio-800 rounded border border-studio-750 text-white font-mono"
            >
              ↑ 前进
            </button>
            <button
              onClick={() => (selectedEntity === 'camera' ? updateCameraPosition(0, 5) : updateCharacterPosition(selectedEntity, 0, 5))}
              className="px-2 py-1 bg-studio-900 hover:bg-studio-800 rounded border border-studio-750 text-white font-mono"
            >
              后退 ↓
            </button>
          </div>
        </div>

        <span className="text-[10px] font-mono text-zinc-500">
          已自动同步注入 Universal / Google Flow 镜头运动轨迹
        </span>
      </div>
    </div>
  );
}
