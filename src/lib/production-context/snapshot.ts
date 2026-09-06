// ==============================================================================
// R.ON DRAMA STUDIO — CONTEXT SNAPSHOT & IMMUTABILITY (ROUND 4)
// Preserves historical asset versions and detects when prompts become stale
// ==============================================================================

import { ProductionContext, ShotContextSnapshot } from '../types';

export function createContextSnapshot(
  context: ProductionContext,
  promptVersionTag: string
): ShotContextSnapshot {
  const characterSnapshots = context.characters.map(c => ({
    characterId: c.characterId,
    characterName: c.characterName,
    versionId: c.masterVersionId || 'v-default',
    versionTag: c.masterVersionTag || 'V1',
    stateId: c.currentState,
    stateName: c.currentState,
  }));

  const costumeSnapshots = context.costumes.map(c => ({
    costumeId: c.costumeId,
    costumeName: c.costumeName,
    versionId: c.masterVersionId || 'v-default',
    condition: c.currentCondition,
  }));

  const propSnapshots = context.props.map(p => ({
    propId: p.propId,
    propName: p.propName,
    versionId: p.masterVersionId || 'v-default',
    condition: p.currentCondition,
  }));

  const locationSnapshot = {
    locationId: context.location.locationId || 'loc-default',
    locationName: context.location.locationName,
    versionId: context.location.masterVersionId || 'v-default',
    state: context.location.currentState,
  };

  const cameraSettings = {
    shotType: context.shotContext.shotType,
    lens: context.shotContext.lens,
    movement: context.shotContext.cameraMovement,
    screenDirection: context.shotContext.screenDirection,
    cameraSide: context.shotContext.cameraSide,
    lighting: context.shotContext.lighting,
    atmosphere: context.shotContext.atmosphere,
  };

  // Generate deterministic continuity fingerprint hash
  const rawFingerprint = [
    context.shotContext.shotId,
    promptVersionTag,
    ...characterSnapshots.map(c => `${c.characterId}:${c.versionId}:${c.stateId}`),
    ...propSnapshots.map(p => `${p.propId}:${p.condition}`),
    `${locationSnapshot.locationId}:${locationSnapshot.state}`,
    cameraSettings.shotType,
    cameraSettings.lens,
    cameraSettings.movement,
  ].join('|');

  // Simple deterministic string hash
  let hash = 0;
  for (let i = 0; i < rawFingerprint.length; i++) {
    const char = rawFingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const continuityHash = `snap_${Math.abs(hash).toString(16)}`;

  return {
    id: `snap-${context.shotContext.shotId}-${Date.now()}`,
    shotId: context.shotContext.shotId,
    promptVersionTag,
    createdAt: new Date().toISOString(),
    characterSnapshots,
    costumeSnapshots,
    propSnapshots,
    locationSnapshot,
    cameraSettings,
    continuityHash,
  };
}

export function isSnapshotStale(
  snapshot: ShotContextSnapshot,
  currentContext: ProductionContext
): { isStale: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Camera / Lens changes
  if (snapshot.cameraSettings.lens !== currentContext.shotContext.lens) {
    reasons.push(
      `镜头焦段变动: 从 ${snapshot.cameraSettings.lens} 改为 ${currentContext.shotContext.lens}`
    );
  }
  if (snapshot.cameraSettings.shotType !== currentContext.shotContext.shotType) {
    reasons.push(
      `景别设置变动: 从 ${snapshot.cameraSettings.shotType} 改为 ${currentContext.shotContext.shotType}`
    );
  }
  if (snapshot.cameraSettings.movement !== currentContext.shotContext.cameraMovement) {
    reasons.push(
      `运镜方式变动: 从 ${snapshot.cameraSettings.movement} 改为 ${currentContext.shotContext.cameraMovement}`
    );
  }
  if (snapshot.cameraSettings.screenDirection !== currentContext.shotContext.screenDirection) {
    reasons.push(
      `画面运动方向变动: 从 ${snapshot.cameraSettings.screenDirection || '未指定'} 改为 ${currentContext.shotContext.screenDirection || '未指定'}`
    );
  }

  // 2. Character State changes
  currentContext.characters.forEach(currChar => {
    const snapChar = snapshot.characterSnapshots.find(sc => sc.characterId === currChar.characterId);
    if (snapChar && snapChar.stateId !== currChar.currentState) {
      reasons.push(
        `角色「${currChar.characterName}」生理/战损状态变动: 从 ${snapChar.stateId} 变为 ${currChar.currentState}`
      );
    }
  });

  // 3. Prop Condition changes
  currentContext.props.forEach(currProp => {
    const snapProp = snapshot.propSnapshots.find(sp => sp.propId === currProp.propId);
    if (snapProp && snapProp.condition !== currProp.currentCondition) {
      reasons.push(
        `道具「${currProp.propName}」损伤状态变动: 从 ${snapProp.condition} 变为 ${currProp.currentCondition}`
      );
    }
  });

  // 4. Location State changes
  if (snapshot.locationSnapshot.state !== currentContext.location.currentState) {
    reasons.push(
      `场景「${currentContext.location.locationName}」环境状态变动: 从 ${snapshot.locationSnapshot.state} 变为 ${currentContext.location.currentState}`
    );
  }

  return {
    isStale: reasons.length > 0,
    reasons,
  };
}
