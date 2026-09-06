// ==============================================================================
// R.ON DRAMA STUDIO — CONTINUITY ENGINE 3.0 (HOLLYWOOD MASTERCLASS AUDIT)
// Comprehensive Visual, Spatial, Temporal, State & 180-Degree Axis Defense
// ==============================================================================

import { Scene, Shot, Character, Location, Prop, Costume, ContinuityWarning } from './types';

export function runContinuityAudit(params: {
  projectId: string;
  scenes: Scene[];
  characters: Character[];
  locations: Location[];
  props: Prop[];
  costumes: Costume[];
}): ContinuityWarning[] {
  const warnings: ContinuityWarning[] = [];
  const { projectId, scenes, characters, locations, props, costumes } = params;

  // Sort scenes chronologically for cross-scene state analysis
  const sortedScenes = [...scenes].sort((a, b) => a.sortOrder - b.sortOrder);

  // ----------------------------------------------------------------------------
  // 1. CRITICAL ASSET AUDIT: Missing Master References
  // ----------------------------------------------------------------------------
  sortedScenes.forEach(scene => {
    scene.characters.forEach(charNameOrId => {
      const char = characters.find(
        c => c.id === charNameOrId || c.name.toLowerCase() === charNameOrId.toLowerCase()
      );
      if (char) {
        const lockedVer = char.versions.find(v => v.id === char.lockedVersionId) || char.versions.find(v => v.status === 'LOCKED');
        if (!lockedVer || !lockedVer.referenceImageUrl) {
          warnings.push({
            id: `cw-crit-${scene.id}-${char.id}-no-master`,
            projectId,
            sceneId: scene.id,
            sceneTitle: scene.sceneTitle,
            assetType: 'Character',
            assetId: char.id,
            assetName: char.name,
            conflictType: '缺少锁定人脸主参考 (Missing Face Master)',
            lockedValue: '未锁定主视觉图片 (No Locked Image)',
            currentValue: '已分配至当前场次',
            description: `角色「${char.name}」尚未在资产总纲中锁定已审核的主视觉参考图，生成分镜时无法强制锁定人脸特征。`,
            severity: 'CRITICAL',
            category: 'Character',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  });

  // ----------------------------------------------------------------------------
  // 2. CROSS-SCENE STATE CONTINUITY (Character States & Prop Conditions)
  // ----------------------------------------------------------------------------
  for (let i = 1; i < sortedScenes.length; i++) {
    const prevScene = sortedScenes[i - 1];
    const currScene = sortedScenes[i];

    // Character State Progression (e.g. INJURED -> NORMAL)
    currScene.characters.forEach(charNameOrId => {
      if (prevScene.characters.includes(charNameOrId)) {
        const char = characters.find(
          c => c.id === charNameOrId || c.name.toLowerCase() === charNameOrId.toLowerCase()
        );
        if (char) {
          const prevStateRel = prevScene.characterStates?.find(cs => cs.characterId === char.id);
          const currStateRel = currScene.characterStates?.find(cs => cs.characterId === char.id);

          const prevStateName = prevStateRel?.stateId?.toUpperCase() || 'NORMAL';
          const currStateName = currStateRel?.stateId?.toUpperCase() || 'NORMAL';

          const damagedStates = ['INJURED', 'BLOODIED', 'EXHAUSTED', 'BATTLE DAMAGED', 'WET'];
          if (damagedStates.includes(prevStateName) && currStateName === 'NORMAL') {
            warnings.push({
              id: `cw-state-${prevScene.id}-${currScene.id}-${char.id}`,
              projectId,
              sceneId: currScene.id,
              sceneTitle: currScene.sceneTitle,
              assetType: 'State',
              assetId: char.id,
              assetName: char.name,
              conflictType: '角色状态连续性冲突 (Character State Continuity)',
              lockedValue: `前一场 (SC${prevScene.sceneNumber}) 状态: [${prevStateName}]`,
              currentValue: `当前场 (SC${currScene.sceneNumber}) 状态: [${currStateName}]`,
              description: `角色「${char.name}」在上一场处于【${prevStateName}】状态，但本场突然重置为【NORMAL】，可能导致战损妆造连续性断层。`,
              severity: 'WARNING',
              category: 'State',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    // Prop Condition Progression (e.g. DAMAGED -> NEW)
    currScene.props?.forEach(propNameOrId => {
      if (prevScene.props?.includes(propNameOrId)) {
        const prop = props.find(
          p => p.id === propNameOrId || p.name.toLowerCase() === propNameOrId.toLowerCase()
        );
        if (prop) {
          const prevPropCond = prevScene.propConditions?.find(pc => pc.propId === prop.id)?.condition || 'NEW';
          const currPropCond = currScene.propConditions?.find(pc => pc.propId === prop.id)?.condition || 'NEW';

          if (['DAMAGED', 'BLOODY', 'BROKEN'].includes(prevPropCond) && currPropCond === 'NEW') {
            warnings.push({
              id: `cw-prop-cond-${prevScene.id}-${currScene.id}-${prop.id}`,
              projectId,
              sceneId: currScene.id,
              sceneTitle: currScene.sceneTitle,
              assetType: 'Prop',
              assetId: prop.id,
              assetName: prop.name,
              conflictType: '道具损伤连续性冲突 (Prop Condition Continuity)',
              lockedValue: `前一场 (SC${prevScene.sceneNumber}) 状态: [${prevPropCond}]`,
              currentValue: `当前场 (SC${currScene.sceneNumber}) 状态: [${currPropCond}]`,
              description: `道具「${prop.name}」上一场已处于【${prevPropCond}】状态，本场重置为【NEW】，请核对战损修缮逻辑。`,
              severity: 'WARNING',
              category: 'Prop',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    });

    // Story Timeline Jump
    if (prevScene.storyDate && currScene.storyDate && prevScene.storyDate !== currScene.storyDate) {
      warnings.push({
        id: `cw-time-${prevScene.id}-${currScene.id}`,
        projectId,
        sceneId: currScene.id,
        sceneTitle: currScene.sceneTitle,
        assetType: 'Timeline',
        assetId: currScene.id,
        assetName: 'Timeline',
        conflictType: '故事时间跨度跳跃 (Story Timeline Jump)',
        lockedValue: `上一场故事日期: ${prevScene.storyDate} ${prevScene.storyTime || ''}`,
        currentValue: `当前场故事日期: ${currScene.storyDate} ${currScene.storyTime || ''}`,
        description: `从 ${prevScene.storyDate} 跳跃至 ${currScene.storyDate}，请注意时间过渡与日夜光线匹配。`,
        severity: 'INFO',
        category: 'Timeline',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // ----------------------------------------------------------------------------
  // 3. SHOT-TO-SHOT 180-DEGREE AXIS & SCREEN DIRECTION AUDIT
  // ----------------------------------------------------------------------------
  sortedScenes.forEach(scene => {
    const shots = scene.shots || [];
    for (let k = 1; k < shots.length; k++) {
      const prevShot = shots[k - 1];
      const currShot = shots[k];

      const prevDir = prevShot.screenDirection;
      const currDir = currShot.screenDirection;

      if (prevDir && currDir) {
        const isAxisBreak = (prevDir === 'Left → Right' && currDir === 'Right → Left') ||
                            (prevDir === 'Right → Left' && currDir === 'Left → Right');

        const hasNeutralBridge = prevShot.cameraSide === 'Neutral' || 
                                currShot.cameraSide === 'Neutral' ||
                                ['Insert', 'POV', 'Aerial Shot'].includes(currShot.shotType);

        if (isAxisBreak && !hasNeutralBridge) {
          warnings.push({
            id: `cw-axis-${scene.id}-${prevShot.id}-${currShot.id}`,
            projectId,
            sceneId: scene.id,
            sceneTitle: scene.sceneTitle,
            shotId: currShot.id,
            shotNumber: currShot.shotNumber,
            assetType: 'Axis',
            assetId: currShot.id,
            assetName: `Shot #${currShot.shotNumber}`,
            conflictType: '可能越轴冲突 (Possible 180° Axis Break)',
            lockedValue: `前一分镜 (#${prevShot.shotNumber}) 运动朝向: ${prevDir}`,
            currentValue: `当前分镜 (#${currShot.shotNumber}) 运动朝向: ${currDir}`,
            description: `连续分镜视线/运动向量出现反向倒转 (${prevDir} 紧接 ${currDir})，且无中性机位过桥，可能导致观众空间迷向。`,
            severity: 'WARNING',
            category: 'Axis',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  });

  // ----------------------------------------------------------------------------
  // 4. IN-SHOT ASSET ATTRIBUTE FIDELITY AUDIT (Hair, Costume, Props, Locations)
  // ----------------------------------------------------------------------------
  sortedScenes.forEach(scene => {
    scene.characters.forEach(charNameOrId => {
      const char = characters.find(
        c => c.id === charNameOrId || c.name.toLowerCase() === charNameOrId.toLowerCase()
      );
      if (!char) return;

      const lockedVer = char.versions.find(v => v.id === char.lockedVersionId) || char.versions.find(v => v.status === 'LOCKED');
      if (lockedVer) {
        scene.shots?.forEach(shot => {
          const shotText = `${shot.subject || ''} ${shot.action || ''} ${shot.performance || ''}`.toLowerCase();

          // Hair discrepancy
          if (char.hair) {
            const lockedHair = char.hair.toLowerCase();
            if (lockedHair.includes('short') && (shotText.includes('long hair') || shotText.includes('ponytail'))) {
              warnings.push({
                id: `cw-${scene.id}-${shot.id}-hair`,
                projectId,
                sceneId: scene.id,
                sceneTitle: scene.sceneTitle,
                shotId: shot.id,
                shotNumber: shot.shotNumber,
                assetType: 'Character',
                assetId: char.id,
                assetName: char.name,
                conflictType: '发型轮廓冲突 (Hair Silhouette)',
                lockedValue: `锁定主参考 (${lockedVer.versionTag}): ${char.hair}`,
                currentValue: `分镜 #${shot.shotNumber} 出现不同发型描述`,
                description: `角色「${char.name}」已锁定发型为 "${char.hair}"，但在分镜中描述为长发/马尾，可能导致 AI 渲染脸部形变。`,
                severity: 'WARNING',
                category: 'Character',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
              });
            }
          }

          // Costume discrepancy check
          if (char.costume) {
            const lockedCostume = char.costume.toLowerCase();
            if (lockedCostume.includes('black') && (shotText.includes('white robe') || shotText.includes('white ceremonial') || shotText.includes('white suit'))) {
              warnings.push({
                id: `cw-${scene.id}-${shot.id}-costume`,
                projectId,
                sceneId: scene.id,
                sceneTitle: scene.sceneTitle,
                shotId: shot.id,
                shotNumber: shot.shotNumber,
                assetType: 'Costume',
                assetId: char.id,
                assetName: char.name,
                conflictType: '服装配色冲突 (Costume Palette)',
                lockedValue: `锁定主参考 (${lockedVer.versionTag}): ${char.costume}`,
                currentValue: `分镜 #${shot.shotNumber} 提及白色服饰 (White robe)`,
                description: `角色「${char.name}」主参考设定为暗色战术服，但该分镜描述出现反差白色长袍。`,
                severity: 'WARNING',
                category: 'Costume',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
              });
            }
          }
        });
      }
    });

    // Location Audits: Time of Day
    if (scene.locationName) {
      const loc = locations.find(
        l => l.id === scene.locationName || l.name.toLowerCase() === scene.locationName.toLowerCase()
      );
      if (loc) {
        const lockedVer = loc.versions.find(v => v.id === loc.lockedVersionId) || loc.versions.find(v => v.status === 'LOCKED');
        if (lockedVer && loc.time) {
          if (loc.time.toUpperCase() !== scene.timeOfDay.toUpperCase() && !scene.timeOfDay.includes(loc.time)) {
            warnings.push({
              id: `cw-${scene.id}-loc-time`,
              projectId,
              sceneId: scene.id,
              sceneTitle: scene.sceneTitle,
              assetType: 'Location',
              assetId: loc.id,
              assetName: loc.name,
              conflictType: '时段光照冲突 (Time of Day)',
              lockedValue: `锁定场景主参考 (${lockedVer.versionTag}): ${loc.time}`,
              currentValue: `当前场次时段设定: ${scene.timeOfDay}`,
              description: `场景「${loc.name}」基底锁定为 ${loc.time}，但场次时段被设为 ${scene.timeOfDay}，可能破坏环境主光比。`,
              severity: 'INFO',
              category: 'Location',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // Prop Audits: Material, Color, Condition
    scene.props?.forEach(propNameOrId => {
      const prop = props.find(
        p => p.id === propNameOrId || p.name.toLowerCase() === propNameOrId.toLowerCase()
      );
      if (!prop) return;

      const lockedVer = prop.versions.find(v => v.id === prop.lockedVersionId) || prop.versions.find(v => v.status === 'LOCKED');
      if (lockedVer && prop.color) {
        scene.shots?.forEach(shot => {
          const text = `${shot.subject || ''} ${shot.action || ''}`.toLowerCase();
          if (text.includes(prop.name.toLowerCase()) && text.includes('silver blade') && prop.color.toLowerCase().includes('damascus')) {
            warnings.push({
              id: `cw-${scene.id}-${shot.id}-prop-color`,
              projectId,
              sceneId: scene.id,
              sceneTitle: scene.sceneTitle,
              shotId: shot.id,
              shotNumber: shot.shotNumber,
              assetType: 'Prop',
              assetId: prop.id,
              assetName: prop.name,
              conflictType: '道具材质颜色冲突 (Prop Finish)',
              lockedValue: `锁定道具 (${lockedVer.versionTag}): ${prop.color} (${prop.material})`,
              currentValue: `分镜 #${shot.shotNumber} 提及纯银亮面 (Silver blade)`,
              description: `道具「${prop.name}」已锁定为暗色折叠大马士革波纹钢，分镜提及纯银光洁质感。`,
              severity: 'WARNING',
              category: 'Prop',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            });
          }
        });
      }
    });
  });

  return warnings;
}

export function quickCheckSceneContinuity(
  scene: Scene,
  characters: Character[],
  locations: Location[],
  props: Prop[],
  allScenes?: Scene[]
): ContinuityWarning[] {
  return runContinuityAudit({
    projectId: scene.episodeId,
    scenes: allScenes && allScenes.length > 0 ? allScenes : [scene],
    characters,
    locations,
    props,
    costumes: [],
  }).filter(w => w.sceneId === scene.id);
}
