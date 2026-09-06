// ==============================================================================
// R.ON DRAMA STUDIO — PRODUCTION CONTEXT ENGINE (ROUND 4)
// Synthesizes Project DNA, Story State, Transitions, Shot Contract & Continuity
// ==============================================================================

import {
  ProductionContext,
  SceneContext,
  ShotContext,
  CharacterContext,
  LocationContext,
  PropContext,
  CostumeContext,
  Project,
  Episode,
  Scene,
  Shot,
  Character,
  Location,
  Prop,
  Costume,
  StoryEvent,
  TransitionCause,
  LocationState,
  ProjectBible,
} from '../types';

export interface BuildProductionContextParams {
  project: Project;
  bible?: ProjectBible;
  episode: Episode;
  scene: Scene;
  shot: Shot;
  allScenes?: Scene[];
  characters: Character[];
  locations: Location[];
  props: Prop[];
  costumes: Costume[];
  storyEvents?: StoryEvent[];
}

export function buildProductionContext(params: BuildProductionContextParams): ProductionContext {
  const {
    project,
    bible,
    episode,
    scene,
    shot,
    allScenes = episode.scenes || [],
    characters,
    locations,
    props,
    costumes,
    storyEvents = [],
  } = params;

  // 1. Sort scenes chronologically
  const sortedScenes = [...allScenes].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentSceneIndex = sortedScenes.findIndex(s => s.id === scene.id);
  const prevScene = currentSceneIndex > 0 ? sortedScenes[currentSceneIndex - 1] : undefined;
  const nextScene = currentSceneIndex >= 0 && currentSceneIndex < sortedScenes.length - 1 ? sortedScenes[currentSceneIndex + 1] : undefined;

  // 2. Sort shots chronologically
  const sceneShots = [...(scene.shots || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const currentShotIndex = sceneShots.findIndex(s => s.id === shot.id);
  const prevShot = currentShotIndex > 0 ? sceneShots[currentShotIndex - 1] : undefined;
  const nextShot = currentShotIndex >= 0 && currentShotIndex < sceneShots.length - 1 ? sceneShots[currentShotIndex + 1] : undefined;

  // 3. Extract Project DNA
  const projectDna = {
    projectId: project.id,
    name: project.name,
    genre: project.genre || 'Neo-Noir Cyberpunk Action Drama',
    aspectRatio: project.aspectRatio || '2.39:1',
    colorPalette: bible?.colorLanguage || bible?.colorGradingLUT || 'Cold Cyan & Neon Amber with Deep OLED Blacks',
    lightingPhilosophy: bible?.lightingLanguage || bible?.lightingRatios || '8:1 Chiaroscuro & High-Contrast Rim Lighting',
    lensPackage: bible?.lensKitSpecs || '40mm / 65mm Anamorphic Prime',
    filmGrain: '35mm Fine Grain Kodak 5219',
  };

  // 4. Character Contexts in this Scene
  const characterContexts: CharacterContext[] = scene.characters.map(charNameOrId => {
    const char = characters.find(
      c => c.id === charNameOrId || c.name.toLowerCase() === charNameOrId.toLowerCase()
    );

    const lockedVer = char?.versions.find(v => v.id === char.lockedVersionId) || char?.versions[0];
    
    // Determine current state in scene
    const currStateRel = scene.characterStates?.find(cs => cs.characterId === char?.id);
    const currState = currStateRel?.stateId?.toUpperCase() || 'NORMAL';

    // Determine previous scene state
    const prevStateRel = prevScene?.characterStates?.find(cs => cs.characterId === char?.id);
    const prevState = prevStateRel?.stateId?.toUpperCase() || (currentSceneIndex > 0 ? 'NORMAL' : undefined);

    // Determine expected next scene state
    const nextStateRel = nextScene?.characterStates?.find(cs => cs.characterId === char?.id);
    const expectedNextState = nextStateRel?.stateId?.toUpperCase() || currState;

    // Detect transition cause from events
    const matchingEvent = storyEvents.find(ev => 
      ev.sceneId === scene.id && 
      ev.stateChanges.some(sc => sc.targetId === char?.id || sc.targetName.toLowerCase() === (char?.name || '').toLowerCase())
    );
    const transitionCause: TransitionCause | undefined = matchingEvent ? 
      matchingEvent.stateChanges.find(sc => sc.targetId === char?.id)?.cause : 
      (currState !== prevState && prevState ? 'Director Override' : undefined);

    return {
      characterId: char?.id || charNameOrId,
      characterName: char?.name || charNameOrId,
      masterVersionId: lockedVer?.id,
      masterVersionTag: lockedVer?.versionTag || 'V1',
      masterImageUrl: lockedVer?.referenceImageUrl,
      currentState: currState,
      previousState: prevState,
      expectedNextState,
      transitionCause,
      hair: char?.hair || 'Dark cropped hair',
      costume: char?.costume || 'Black tactical jacket',
    };
  });

  // 5. Location Context
  const matchedLoc = locations.find(
    l => l.name.toLowerCase() === scene.locationName.toLowerCase() || l.id === scene.locationName
  );
  const locLockedVer = matchedLoc?.versions.find(v => v.id === matchedLoc.lockedVersionId) || matchedLoc?.versions[0];
  const currLocState: LocationState = scene.locationState || matchedLoc?.currentState || 'Clean';
  const prevLocState: LocationState | undefined = prevScene?.locationState || (prevScene?.locationName === scene.locationName ? 'Clean' : undefined);
  const nextLocState: LocationState | undefined = nextScene?.locationState || currLocState;

  const locationContext: LocationContext = {
    locationId: matchedLoc?.id,
    locationName: scene.locationName || 'Studio Stage',
    masterVersionId: locLockedVer?.id,
    masterVersionTag: locLockedVer?.versionTag || 'V1',
    masterImageUrl: locLockedVer?.referenceImageUrl,
    currentState: currLocState,
    previousState: prevLocState,
    expectedNextState: nextLocState,
    architecture: matchedLoc?.architecture || 'Industrial warehouse architecture with steel trusses',
    environment: matchedLoc?.environment || 'Rain-soaked ground, concrete pillars, broken glass',
    lighting: matchedLoc?.lighting || 'Cold volumetric shafts with sodium vapor amber backlight',
  };

  // 6. Prop Contexts
  const propContexts: PropContext[] = scene.props.map(propNameOrId => {
    const p = props.find(
      x => x.id === propNameOrId || x.name.toLowerCase() === propNameOrId.toLowerCase()
    );
    const pLockedVer = p?.versions.find(v => v.id === p.lockedVersionId) || p?.versions[0];

    const currCond = scene.propConditions?.find(pc => pc.propId === p?.id)?.condition || 'NEW';
    const prevCond = prevScene?.propConditions?.find(pc => pc.propId === p?.id)?.condition || (currentSceneIndex > 0 ? 'NEW' : undefined);
    const nextCond = nextScene?.propConditions?.find(pc => pc.propId === p?.id)?.condition || currCond;

    return {
      propId: p?.id || propNameOrId,
      propName: p?.name || propNameOrId,
      masterVersionId: pLockedVer?.id,
      masterVersionTag: pLockedVer?.versionTag || 'V1',
      masterImageUrl: pLockedVer?.referenceImageUrl,
      currentCondition: currCond,
      previousCondition: prevCond,
      expectedNextCondition: nextCond,
    };
  });

  // 7. Costume Contexts
  const costumeContexts: CostumeContext[] = scene.costumes.map(costumeNameOrId => {
    const c = costumes.find(
      x => x.id === costumeNameOrId || x.name.toLowerCase() === costumeNameOrId.toLowerCase()
    );
    const cLockedVer = c?.versions.find(v => v.id === c.lockedVersionId) || c?.versions[0];

    return {
      costumeId: c?.id || costumeNameOrId,
      costumeName: c?.name || costumeNameOrId,
      masterVersionId: cLockedVer?.id,
      masterVersionTag: cLockedVer?.versionTag || 'V1',
      currentCondition: c?.condition || 'NORMAL',
    };
  });

  // 8. Shot Context
  const shotContext: ShotContext = {
    shotId: shot.id,
    shotNumber: shot.shotNumber,
    shotType: shot.shotType,
    lens: shot.lens,
    cameraMovement: shot.cameraMovement,
    cameraSide: shot.cameraSide,
    screenDirection: shot.screenDirection,
    eyeLine: shot.eyeLine,
    subject: shot.subject,
    action: shot.action,
    performance: shot.performance,
    lighting: shot.lighting,
    atmosphere: shot.atmosphere,
    composition: shot.composition,
    duration: shot.duration,
    previousShotSummary: prevShot ? {
      shotNumber: prevShot.shotNumber,
      screenDirection: prevShot.screenDirection,
      cameraSide: prevShot.cameraSide,
      subject: prevShot.subject,
      action: prevShot.action,
    } : undefined,
    nextShotSummary: nextShot ? {
      shotNumber: nextShot.shotNumber,
      expectedAction: nextShot.action,
    } : undefined,
    contract: shot.contract || {
      mustKeep: [
        `${characterContexts[0]?.characterName || 'Hero'} identity & face geometry`,
        `${locationContext.locationName} (${locationContext.currentState})`,
        `Screen direction: ${shot.screenDirection || 'Consistent'}`,
        `Color temperature: ${projectDna.colorPalette}`,
      ],
      mustChange: [
        `Subject movement: ${shot.action}`,
        `Camera viewpoint: ${shot.shotType} ${shot.cameraMovement}`,
      ],
      mustNotChange: [
        'Hairstyle & facial silhouette',
        'Costume design patterns',
        'Core architectural layout',
      ],
    },
    blocking2D: shot.blocking2D,
  };

  // 9. Scene Context
  const sceneContext: SceneContext = {
    sceneId: scene.id,
    sceneNumber: scene.sceneNumber,
    sceneTitle: scene.sceneTitle,
    intExt: scene.intExt,
    timeOfDay: scene.timeOfDay,
    storyDate: scene.storyDate || 'Day 1',
    storyTime: scene.storyTime || '22:00',
    storyPurpose: scene.storyPurpose,
    locationState: currLocState,
    previousSceneSummary: prevScene ? {
      sceneNumber: prevScene.sceneNumber,
      sceneTitle: prevScene.sceneTitle,
      endingLocationState: prevScene.locationState,
      endingCharacterStates: prevScene.characterStates?.map(cs => ({
        characterName: characters.find(c => c.id === cs.characterId)?.name || cs.characterId,
        state: cs.stateId,
      })),
    } : undefined,
    nextSceneSummary: nextScene ? {
      sceneNumber: nextScene.sceneNumber,
      sceneTitle: nextScene.sceneTitle,
    } : undefined,
  };

  // 10. Director Intention
  const directorIntention = {
    visualStrategy: scene.directorVisualStrategy || 'Anamorphic shallow depth of field with high-speed tracking',
    emotionalArc: scene.directorEmotionalArc || 'Tension building to sudden violent kinetic climax',
    pacing: scene.directorPacing || 'Kinetic',
    lightingStrategy: scene.directorLightingStrategy || 'Low-key Chiaroscuro with cold rim lighting',
    cameraStrategy: scene.directorCameraStrategy || 'Steadicam tracking leading into abrupt push-in',
    transition: scene.directorTransition || 'Hard Cut',
  };

  // 11. Relevant Events in Scene
  const sceneEvents = storyEvents.filter(e => e.sceneId === scene.id);

  // 12. Open Conflicts (from scene conflict description and checkpoints)
  const openConflicts: string[] = [];
  if (scene.conflict) openConflicts.push(scene.conflict);
  if (currLocState === 'Damaged' || currLocState === 'Burning') openConflicts.push(`Location ${scene.locationName} is ${currLocState}`);
  characterContexts.forEach(c => {
    if (['INJURED', 'BLOODIED', 'EXHAUSTED'].includes(c.currentState)) {
      openConflicts.push(`${c.characterName} is ${c.currentState}`);
    }
  });

  return {
    projectDna,
    episodeContext: {
      episodeId: episode.id,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
    },
    sceneContext,
    characters: characterContexts,
    location: locationContext,
    props: propContexts,
    costumes: costumeContexts,
    shotContext,
    directorIntention,
    storyEventsInScene: sceneEvents,
    openConflicts,
  };
}
