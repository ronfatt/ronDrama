// ==============================================================================
// R.ON DRAMA STUDIO — PROMPT GENERATOR 2.0 (HOLLYWOOD MASTERCLASS GRADE)
// Multi-Bible Aggregator (Director Bible + Action Bible + Locked Assets + Continuity)
// Pure local deterministic synthesis. Strictly NO AI API dependencies.
// ==============================================================================

import { Project, ProjectBible, ActionBible, Scene, Shot, Character, Location, Prop, Costume, PromptLengthMode } from './types';

export interface PromptContext {
  project: Project;
  bible?: ProjectBible;
  actionBible?: ActionBible;
  scene: Scene;
  shot: Shot;
  previousShot?: Shot;
  nextShot?: Shot;
  assignedCharacters: Character[];
  assignedLocations: Location[];
  assignedProps: Prop[];
  assignedCostumes: Costume[];
  lengthMode?: PromptLengthMode;
}

export interface GeneratedPrompts {
  masterPrompt: string;       // Universal 11-Dimension Prompt
  googleFlowPrompt: string;   // Google Flow Natural Language Prompt
  dreaminaPrompt: string;     // Dreamina Cinematic Quality Prompt
  avoidPrompt: string;        // Negative / Avoid Continuity Directives
}

export const STRICT_CONTINUITY_MANDATE = `Maintain strict visual continuity with all locked references.
Do not change the character's facial identity.
Do not change hairstyle or facial hair.
Do not change body proportions or height ratio.
Do not change costume design, silhouette, or color palette.
Do not alter hero prop design or condition.
Do not redesign the environment architecture.
Preserve established spatial axis and lighting language.
Maintain cinematic photorealism and textural fidelity.`;

export function generateShotPrompts(context: PromptContext): GeneratedPrompts {
  const {
    project,
    bible,
    actionBible,
    scene,
    shot,
    previousShot,
    nextShot,
    assignedCharacters,
    assignedLocations,
    assignedProps,
    assignedCostumes,
  } = context;

  // 1. Camera Optics & Movement Specifications
  const lens = shot.lens || bible?.lensKitSpecs || 'Panavision C-Series 35mm Anamorphic Prime T2.0';
  const cameraMovement = shot.cameraMovement || scene.directorCameraStrategy || 'Steadicam tracking';
  const cameraSpeed = shot.cameraSpeed ? `at ${shot.cameraSpeed} speed` : 'with deliberate cinematic velocity';
  const cameraAngle = shot.cameraAngle || 'Eye Level';
  const framing = shot.framing || 'Cinematic composition';
  const screenDirection = shot.screenDirection ? `Screen Direction: ${shot.screenDirection}.` : '';
  const cameraSide = shot.cameraSide && shot.cameraSide !== 'Neutral' ? `Camera Side: ${shot.cameraSide}.` : '';
  const eyeLine = shot.eyeLine ? `Eye Line: ${shot.eyeLine}.` : '';
  const colorScience = bible?.colorGradingLUT || 'Arri LogC3 to Kodak Vision3 5219 print film emulation LUT';
  const shutterAngle = '180-degree cinema shutter angle, authentic 24fps kinetic cadence';

  // 2. Visual Style & Directorial Intention
  const visualStyle = bible?.visualStyle || project.visualStyle || 'A24 / Denis Villeneuve masterclass cinematic photorealism, Panavision 65mm large format anamorphic look, tactile textures, ultra-fine 35mm organic film grain';
  const directorIntention = scene.directorVisualStrategy || scene.directorScenePurpose || bible?.directorsVision || 'Intense cinematic drama with razor-sharp kinetic choreography';

  // 3. Characters & States
  let subjectBlock = '';
  let performanceBlock = shot.performance || scene.directorPerformanceDirection || 'Intense lethal focus, calculated stillness, breathing tension';

  if (assignedCharacters.length > 0) {
    subjectBlock = assignedCharacters.map(c => {
      const lockedVer = c.versions.find(v => v.id === c.lockedVersionId) || c.versions.find(v => v.status === 'LOCKED');
      const verTag = lockedVer ? `[LOCKED MASTER: ${lockedVer.versionTag}]` : '[CANONICAL]';
      
      // Look for scene character state
      const sceneCharState = scene.characterStates?.find(cs => cs.characterId === c.id);
      const stateObj = c.states?.find(s => s.id === sceneCharState?.stateId || s.name === sceneCharState?.stateId);
      const stateText = stateObj ? `State: [${stateObj.name}] - ${stateObj.description}. Face: ${stateObj.faceCondition || 'as locked'}. Hair: ${stateObj.hairCondition || 'as locked'}. Costume: ${stateObj.costumeCondition || 'as locked'}.` : 'State: [NORMAL].';

      return `${c.name} ${verTag}: ${c.gender}, age ${c.age}, ${c.physicalDescription || ''}. Hair: ${c.hair || 'as locked reference'}. Face: ${c.face || 'sharp angular chiseled features'}. ${stateText} Subsurface scattering (SSS) skin shader, authentic pore detail.`;
    }).join('\n');
  } else {
    subjectBlock = `Subject: ${shot.subject || 'Lead Operative'}, hyper-realistic human anatomy, authentic skin shader, grounded body weight.`;
  }

  // 4. Wardrobe & Fabric Realism
  let costumeBlock = '';
  if (assignedCostumes.length > 0) {
    costumeBlock = assignedCostumes.map(cos => {
      const lockedVer = cos.versions.find(v => v.id === cos.lockedVersionId) || cos.versions.find(v => v.status === 'LOCKED');
      const verTag = lockedVer ? `[LOCKED WARDROBE: ${lockedVer.versionTag}]` : '';
      return `${cos.name} ${verTag}: Worn by ${cos.characterName || 'Lead'}. Material: ${cos.material || 'ballistic aramid weave'}. Color: ${cos.color || 'matte charcoal black'}. Accessories: ${cos.accessories || 'tactical bracers'}. Condition: ${cos.condition || 'tactical field wear'}. Natural micro-weave fabric friction.`;
    }).join('\n');
  } else {
    costumeBlock = 'Wardrobe: Bespoke cinematic costuming with authentic seam construction and non-reflective tactical fabrics.';
  }

  // 5. Action & Stunt Dynamics
  const stuntStyle = actionBible?.stuntDesignStyle || '87Eleven tactical combat choreography, grounded martial arts';
  const combatPhysics = actionBible?.combatPhysics || 'Deterministic physical inertia, bone-crushing mass impact, authentic weapon recoil';
  const weaponDynamics = actionBible?.weaponDynamics || 'Folded steel blade parry sparks, sharp specular light reflection';
  const actionDescription = shot.action || 'High-velocity kinetic choreography executed with surgical precision';
  const blockingDescription = shot.blocking || bible?.blockingAndStaging || 'Deep multi-plane staging with triangular geometry';

  // 6. Location, Architecture & Atmosphere
  let locationBlock = '';
  if (assignedLocations.length > 0) {
    const loc = assignedLocations[0];
    const lockedVer = loc.versions.find(v => v.id === loc.lockedVersionId) || loc.versions.find(v => v.status === 'LOCKED');
    const verTag = lockedVer ? `[LOCKED ENVIRONMENT: ${lockedVer.versionTag}]` : '';
    locationBlock = `${scene.intExt}. ${loc.name} (${scene.timeOfDay}) ${verTag}: Architecture: ${loc.architecture || 'brutalist industrial'}. Environment: ${shot.environment || loc.environment || ''}. Weather: ${loc.weather || ''}. Wet specular reflections.`;
  } else {
    locationBlock = `${scene.intExt}. ${scene.locationName || 'Film Set'} (${scene.timeOfDay})`;
  }

  // 7. Lighting & Chiaroscuro
  const lightingBlock = shot.lighting || bible?.lightingLanguage || bible?.lightingRatios || 'High-contrast Hollywood chiaroscuro (8:1 key-to-fill ratio). Single cold moonlight beam key from skylight, high-intensity tungsten edge rim light, volumetric atmospheric haze.';
  const atmosphereBlock = shot.atmosphere || 'Dense atmospheric tension, floating dust motes and micro-mist droplets catching backlight';

  // 8. Hero Props & Conditions
  let propsBlock = '';
  if (assignedProps.length > 0) {
    propsBlock = assignedProps.map(p => {
      const lockedVer = p.versions.find(v => v.id === p.lockedVersionId) || p.versions.find(v => v.status === 'LOCKED');
      const verTag = lockedVer ? `[LOCKED PROP: ${lockedVer.versionTag}]` : '';
      const scenePropCond = scene.propConditions?.find(pc => pc.propId === p.id);
      const condText = scenePropCond ? `Condition: [${scenePropCond.condition}]` : 'Condition: [NEW]';
      return `${p.name} ${verTag} (${p.material || 'Damascus steel'}, ${p.color || 'matte black'}, size: ${p.size || 'standard'}, ${condText})`;
    }).join(', ');
  }

  const duration = shot.duration || '3s';
  const aspectRatio = project.aspectRatio || '16:9';
  const pacing = shot.pacing || 'Normal';
  const transitionText = shot.transitionIn || shot.transitionOut ? `Transition: ${shot.transitionIn || 'Cut'} in / ${shot.transitionOut || 'Cut'} out.` : '';

  // Spatial context from previous and next shots
  let spatialContinuityText = '';
  if (previousShot) {
    spatialContinuityText += `Carrying over visual momentum from Shot #${previousShot.shotNumber} (${previousShot.shotType}, ${previousShot.cameraMovement}). `;
  }
  if (nextShot) {
    spatialContinuityText += `Establishing eyeline and spatial vector leading into Shot #${nextShot.shotNumber} (${nextShot.shotType}). `;
  }

  // ============================================================================
  // MASTER PROMPT 3.0: 11-DIMENSION STRUCTURED PROMPT
  // ============================================================================
  const masterPrompt = [
    `[SUBJECT]`,
    subjectBlock,
    costumeBlock ? `Wardrobe: ${costumeBlock}` : '',
    propsBlock ? `Props: ${propsBlock}` : '',
    ``,
    `[ACTION]`,
    actionDescription,
    `Stunt Style: ${stuntStyle}. Physics: ${combatPhysics}. Weapon Dynamics: ${weaponDynamics}.`,
    ``,
    `[PERFORMANCE]`,
    performanceBlock,
    eyeLine ? eyeLine : '',
    ``,
    `[CAMERA]`,
    `Optics: Shot on Arri Alexa 65 Large Format with ${lens}. Framing: ${framing}, Camera Angle: ${cameraAngle}.`,
    cameraSide ? cameraSide : '',
    `Color Science: ${colorScience}. Shutter: ${shutterAngle}. Visual Style: ${visualStyle}.`,
    ``,
    `[MOVEMENT]`,
    `Camera Movement: ${cameraMovement} ${cameraSpeed}.`,
    screenDirection ? screenDirection : '',
    blockingDescription ? `Blocking: ${blockingDescription}.` : '',
    ``,
    `[ENVIRONMENT]`,
    locationBlock,
    scene.storyDate || scene.storyTime ? `Story Timeline: ${scene.storyDate || ''} ${scene.storyTime || ''}` : '',
    ``,
    `[LIGHTING]`,
    lightingBlock,
    ``,
    `[ATMOSPHERE]`,
    atmosphereBlock,
    ``,
    `[COMPOSITION]`,
    `Composition: ${shot.composition || 'Strict golden ratio with strong foreground geometric depth'}.`,
    `Depth of Field: ${shot.depth || 'Shallow focal plane with anamorphic oval bokeh'}.`,
    ``,
    `[CONTINUITY]`,
    STRICT_CONTINUITY_MANDATE,
    spatialContinuityText ? spatialContinuityText : '',
    ``,
    `[TIMING]`,
    `Duration: ${duration}. Pacing: ${pacing}. Aspect Ratio: ${aspectRatio}. ${transitionText} 24fps cinematic motion.`
  ].filter(Boolean).join('\n');

  // ============================================================================
  // GOOGLE FLOW PROMPT: Natural Language Cinematic Trajectory
  // ============================================================================
  const googleFlowPrompt = [
    `A cinematic film sequence from a high-budget action thriller, shot with ${lens} at ${cameraAngle}.`,
    `Camera executes ${cameraMovement.toLowerCase()} ${cameraSpeed.toLowerCase()}, maintaining ${framing.toLowerCase()}${screenDirection ? ` with ${screenDirection.toLowerCase()}` : ''}.`,
    `${subjectBlock.replace(/\[.*?\]/g, '').replace(/\n/g, ' ')}.`,
    `${costumeBlock.replace(/\[.*?\]/g, '').replace(/\n/g, ' ')}.`,
    `Action and performance: ${actionDescription}. ${performanceBlock}. Stunt dynamics feature ${stuntStyle.toLowerCase()} with ${combatPhysics.toLowerCase()}.`,
    `Setting: ${locationBlock.replace(/\[.*?\]/g, '').replace(/\n/g, ' ')}${propsBlock ? ` featuring ${propsBlock.replace(/\[.*?\]/g, '')}` : ''}.`,
    `Lighting and atmosphere: ${lightingBlock.replace(/\n/g, ' ')}. ${atmosphereBlock}. Graded with ${colorScience}, 180-degree cinema shutter.`,
    `Visual continuity: Strictly maintain character facial identity, hair silhouette, wardrobe details, and environmental architecture from established reference keys.`,
    `Pacing is ${pacing.toLowerCase()}, duration ${duration}, 16:9 cinematic aspect ratio, 24fps motion.`
  ].filter(Boolean).join(' ');

  // ============================================================================
  // DREAMINA PROMPT: Natural Language Photorealistic Cinema
  // ============================================================================
  const dreaminaPrompt = [
    `Award-winning Hollywood action cinema frame, ultra-detailed 8k resolution, ${visualStyle}.`,
    `Filmed on Panavision Large Format Anamorphic with ${lens}, ${shot.shotType}, ${cameraMovement} ${cameraSpeed}, ${cameraAngle}.`,
    `${subjectBlock.replace(/\[.*?\]/g, '').replace(/\n/g, ' ')}.`,
    `${costumeBlock.replace(/\[.*?\]/g, '').replace(/\n/g, ' ')}.`,
    `Setting: ${locationBlock.replace(/\[.*?\]/g, '').replace(/\n/g, ' ')}.`,
    propsBlock ? `Hero props: ${propsBlock.replace(/\[.*?\]/g, '')}.` : '',
    `Action: ${actionDescription}. Combat physics: ${combatPhysics}, realistic physical weight and impact recoil.`,
    `Lighting: ${lightingBlock.replace(/\n/g, ' ')}. Atmosphere: ${atmosphereBlock}.`,
    `Color grading: ${colorScience}, horizontal anamorphic streak flares, deep black roll-off, authentic skin subsurface scattering.`,
    `Continuity: Absolute visual lock on actor facial anatomy, costume wear, and environment architecture.`,
    `Pacing ${pacing}, duration ${duration}, aspect ratio ${aspectRatio}, 24fps cinematic motion.`
  ].filter(Boolean).join(' ');

  // ============================================================================
  // AVOID / NEGATIVE PROMPT: Continuity Defenses
  // ============================================================================
  const avoidPrompt = [
    `Do not change character facial identity, facial structure, or bone geometry.`,
    `Do not alter established hairstyle, hair color, or hairline.`,
    `Do not redesign or alter the costume fabric, color palette, or silhouette.`,
    `Do not repair or remove established wounds, blood stains, or costume battle damage.`,
    `Do not redesign the location architecture, room layout, or lighting source positions.`,
    `Do not change hero prop dimensions, material finish, or blade design.`,
    `Do not reverse established screen direction (${shot.screenDirection || 'established screen vector'}).`,
    `Do not change the time of day, weather, or atmospheric haze density.`,
    `Do not introduce extra unscheduled background characters or modern anachronisms.`,
    `Do not produce plastic skin smoothing, cartoonish CGI artifacts, or floating physics.`
  ].join('\n');

  return {
    masterPrompt,
    googleFlowPrompt,
    dreaminaPrompt,
    avoidPrompt,
  };
}

export function generateAssetImagePrompt(
  assetType: 'Character' | 'Location' | 'Prop' | 'Costume',
  assetData: Record<string, unknown>,
  project?: Project,
  bible?: ProjectBible,
  actionBible?: ActionBible
): string {
  const visualStyle = bible?.visualStyle || project?.visualStyle || 'Hollywood feature film production master still, 8k Arri Alexa 65';
  const lighting = bible?.lightingLanguage || bible?.lightingRatios || 'Dramatic cinematic Rembrandt chiaroscuro, 8:1 contrast ratio, sharp edge rim light, atmospheric haze';
  const color = bible?.colorGradingLUT || bible?.colorLanguage || 'Kodak 2383 film stock emulation, obsidian blacks, rich tungsten highlights';

  switch (assetType) {
    case 'Character': {
      const name = String(assetData.name || 'Character');
      const role = String(assetData.role || 'Protagonist');
      const gender = String(assetData.gender || '');
      const age = String(assetData.age || '');
      const desc = String(assetData.physicalDescription || '');
      const hair = String(assetData.hair || '');
      const face = String(assetData.face || '');
      const costume = String(assetData.costume || '');
      const features = String(assetData.signatureFeatures || '');

      return `Masterclass Hollywood character reference portrait of ${name}, ${role}. ${gender}, age ${age}, ${desc}. Facial details: ${face}. Hair: ${hair}. Wardrobe: ${costume}. Distinguishing marks: ${features}. Shot on Hasselblad H6D-100c with 100mm f/2.2 portrait prime lens. Authentic skin micro-texture, visible skin pores, subsurface scattering (SSS), natural moisture sheen. ${lighting}, ${color}. Clean studio negative fill backdrop, cinematic film still, photorealistic 8k reference sheet, razor-sharp focus, master asset canon.`;
    }

    case 'Location': {
      const name = String(assetData.name || 'Location');
      const arch = String(assetData.architecture || '');
      const env = String(assetData.environment || '');
      const time = String(assetData.time || 'Night');
      const weather = String(assetData.weather || '');
      const atmo = String(assetData.atmosphere || '');

      return `Award-winning feature film location master reference still of ${name}, set during ${time}. Architectural style: ${arch}. Setting: ${env}. Weather condition: ${weather}. Atmosphere: ${atmo}. Shot on Panavision Millennium DXL2 with Primo 21mm Anamorphic lens, 2.39:1 aspect ratio. Volumetric light shafts, wet specular reflections on concrete, atmospheric condensation haze, ${lighting}, ${color}. Hyper-detailed set dressing, master cinematographic composition, 8k resolution.`;
    }

    case 'Prop': {
      const name = String(assetData.name || 'Prop');
      const material = String(assetData.material || '');
      const colorDesc = String(assetData.color || '');
      const size = String(assetData.size || '');
      const desc = String(assetData.description || '');

      return `Hero prop studio reference photograph of ${name}. Handcrafted craftsmanship: ${material}, Color and finish: ${colorDesc}, Scale: ${size}. Structural details: ${desc}. Macro 100mm f/2.8 anamorphic lens, shallow depth of field, dramatic studio edge rim lighting, tactile metal grain and folded Damascus steel wave textures, micro-abrasions from battle use. Pitch black velvet studio backdrop, 8k ultra-sharp product cinematography.`;
    }

    case 'Costume': {
      const name = String(assetData.name || 'Costume');
      const charName = String(assetData.characterName || 'Character');
      const material = String(assetData.material || '');
      const colorDesc = String(assetData.color || '');
      const acc = String(assetData.accessories || '');
      const shoes = String(assetData.shoes || '');
      const cond = String(assetData.condition || 'Pristine');

      return `Hollywood cinematic costume design reference plate for ${name} worn by ${charName}. Fabric materials: ${material}. Color scheme: ${colorDesc}. Hardware and accessories: ${acc}. Footwear: ${shoes}. Wear condition: ${cond}. Front view, 3/4 dynamic posture view, extreme close-up of fabric weave and reinforced stitch seams. Studio lighting with defined key and rim, Kodak Vision3 5219 film grain, 8k photorealistic costume bible sheet.`;
    }
  }
}

// ----------------------------------------------------------------------------
// CHARACTER SHEET GENERATION TEMPLATE (ROUND 4 REQUIREMENT 32)
// ----------------------------------------------------------------------------
export function generateCharacterSheetPrompt(character: Character): string {
  const name = character.name || 'Hero';
  const gender = character.gender || '';
  const age = character.age || '';
  const face = character.face || 'sharp angular features';
  const hair = character.hair || 'dark cropped hair';
  const costume = character.costume || 'tactical suit';
  const features = character.signatureFeatures || 'scar over left eyebrow';

  return `CHARACTER TURNAROUND REFERENCE SHEET: ${name}
Subject: ${name}, ${gender}, age ${age}.
Facial Structure: ${face}.
Hair Silhouette: ${hair}.
Costume & Apparel: ${costume}.
Distinctive Markings: ${features}.

Layout: Comprehensive 8-Panel Character Model Sheet on neutral studio grey background (#808080):
1. FRONT FULL-BODY VIEW (A-pose, neutral stance, grounded weight)
2. 3/4 THREE-QUARTER VIEW (subtle head turn)
3. PROFILE SIDE VIEW (90-degree ear-to-nose profile)
4. BACK FULL-BODY VIEW (cape/jacket seam and shoulder blade geometry)
5. HEAD CLOSE-UP (Macro portrait, visible pores, neutral expression)
6. HEAD EXPRESSION (Intense combat focus, furrowed brow)
7. HANDS & FOOTWEAR DETAIL (glove texture, boots traction)
8. SILHOUETTE OUTLINE (high-contrast black silhouette)

Optics: 85mm f/5.6 flat studio portrait lens, ultra-flat even diffuse illumination, zero lens distortion, 1:1 consistent character geometry across all panels, 8k resolution, cinematic model bible standard.`;
}

