// ==============================================================================
// R.ON DRAMA STUDIO — PROMPT ADAPTERS (ROUND 4 PRODUCTION INTELLIGENCE)
// Zero-API Deterministic Prompt Adapters for Universal, Google Flow & Dreamina
// Target Length: Standard (150–350 words), Compact (80–150 words), Detailed (300–600 words)
// ==============================================================================

import { ProductionContext, PromptLengthMode, ShotPrompt } from '../types';

export interface FormattedPromptResult {
  universalPrompt: string;
  googleFlowPrompt: string;
  dreaminaPrompt: string;
  avoidPrompt: string;
  wordCount: number;
}

export interface PromptDiffItem {
  dimension: string;
  v1Value: string;
  v2Value: string;
}

// ----------------------------------------------------------------------------
// 1. UNIVERSAL ADAPTER (Hollywood Masterclass Screenplay Format)
// ----------------------------------------------------------------------------
export class UniversalAdapter {
  public static format(context: ProductionContext, lengthMode: PromptLengthMode = 'Standard'): string {
    const { projectDna, sceneContext, characters, location, props, shotContext, directorIntention } = context;
    const hero = characters[0];
    const contract = shotContext.contract;

    if (lengthMode === 'Compact') {
      // 80 - 150 words
      const parts = [
        `Cinematic film still, ${projectDna.aspectRatio}, ${shotContext.shotType}, ${shotContext.lens} lens.`,
        `${hero?.characterName || 'Hero'} (${hero?.currentState || 'NORMAL'}, wearing ${hero?.costume || 'costume'}), ${shotContext.action}.`,
        `Performance: ${shotContext.performance}.`,
        `Setting: ${location.locationName} (${location.currentState}), ${sceneContext.timeOfDay}.`,
        `Lighting: ${shotContext.lighting}, ${projectDna.colorPalette}.`,
        `Camera: ${shotContext.cameraMovement}, facing ${shotContext.screenDirection || 'center'}.`,
        `Film stock: ${projectDna.filmGrain}, high production value, photorealistic 8k.`,
      ];
      return parts.filter(Boolean).join(' ');
    }

    if (lengthMode === 'Detailed') {
      // 300 - 600 words
      const parts = [
        `[SCENE CONTEXT]`,
        `From Episode ${context.episodeContext.episodeNumber}, Scene ${sceneContext.sceneNumber} (${sceneContext.sceneTitle}, ${sceneContext.intExt} - ${sceneContext.timeOfDay}). Story Date: ${sceneContext.storyDate}, ${sceneContext.storyTime}.`,
        `\n[VISUAL STYLE & FILM CRAFT]`,
        `Cinematic 35mm motion picture shot, captured on ARRI Alexa LF with ${shotContext.lens} Anamorphic prime lens, ${projectDna.aspectRatio} widescreen aspect ratio. Color grade: ${projectDna.colorPalette}. Film texture: ${projectDna.filmGrain}.`,
        `\n[SUBJECT & CHARACTER STATE]`,
        `Primary character: ${hero?.characterName || 'Lead Protagonist'} (locked facial master ${hero?.masterVersionTag || 'V1'}), ${hero?.hair}, wearing ${hero?.costume}. Current state: ${hero?.currentState} (continuity strictly maintained from previous scene). Physical details: perspiration, tactile fabric weave, subtle skin pores.`,
        `\n[ACTION & KINETIC BLOCKING]`,
        `Action: ${shotContext.action}.`,
        `Performance & Eye-line: ${shotContext.performance}. Eye-line directed toward ${shotContext.eyeLine || 'screen center'}.`,
        `\n[ENVIRONMENT & SET DRESSING]`,
        `Location: ${location.locationName} in [${location.currentState}] condition. Architectural features: ${location.architecture}. Environmental atmosphere: ${location.environment}, atmospheric haze, volumetric particulates.`,
        props.length > 0 ? `Featured Props: ${props.map(p => `${p.propName} (${p.currentCondition})`).join(', ')}.` : '',
        `\n[CAMERA & LIGHTING DESIGN]`,
        `Framing & Movement: ${shotContext.shotType}, camera position side ${shotContext.cameraSide || 'A'}, executing ${shotContext.cameraMovement} at deliberate pacing. Screen motion vector: ${shotContext.screenDirection || 'neutral'}.`,
        `Lighting setup: ${shotContext.lighting}, consistent with ${directorIntention.lightingStrategy}. High contrast chiaroscuro, natural rim separation.`,
        `\n[SHOT CONTRACT & CONTINUITY MANDATE]`,
        contract ? `MUST KEEP: ${contract.mustKeep.join('; ')}.\nMUST CHANGE: ${contract.mustChange.join('; ')}.\nMUST NOT CHANGE: ${contract.mustNotChange.join('; ')}.` : '',
      ];
      return parts.filter(Boolean).join('\n');
    }

    // Default: STANDARD MODE (150 - 350 words)
    const standardParagraphs = [
      `Cinematic 35mm film still, ${projectDna.aspectRatio}, ${shotContext.shotType} framed with ${shotContext.lens} anamorphic prime.`,
      `Subject: ${hero?.characterName || 'Hero'} (${hero?.currentState} state, ${hero?.costume}), executing: ${shotContext.action}. Performance conveys ${shotContext.performance}.`,
      `Spatial Vector: Moving ${shotContext.screenDirection || 'across frame'}, camera on side ${shotContext.cameraSide || 'A'} tracking via ${shotContext.cameraMovement}.`,
      `Environment: ${location.locationName} (${location.currentState} state) under ${sceneContext.timeOfDay} illumination. ${location.environment}.`,
      props.length > 0 ? `Key Prop: ${props.map(p => `${p.propName} (${p.currentCondition})`).join(', ')}.` : '',
      `Lighting & Color: ${shotContext.lighting}, styled in ${projectDna.colorPalette}. Subtle atmosphere: ${shotContext.atmosphere}.`,
      contract ? `Continuity Mandate: Maintain ${contract.mustKeep.slice(0, 2).join(', ')}. Disallow changes to ${contract.mustNotChange.slice(0, 2).join(', ')}.` : '',
      `Kodak 5219 film emulsion texture, authentic optical bokeh, photorealistic depth.`
    ];

    return standardParagraphs.filter(Boolean).join(' ');
  }
}

// ----------------------------------------------------------------------------
// 2. GOOGLE FLOW ADAPTER (Camera Physics, Motion Index, Shutter & Lens Flags)
// ----------------------------------------------------------------------------
export class GoogleFlowAdapter {
  public static format(context: ProductionContext, lengthMode: PromptLengthMode = 'Standard'): string {
    const { shotContext, projectDna, characters, location } = context;
    const hero = characters[0];

    // Derive motion index from camera movement
    let motionValue = 5;
    if (['Tracking', 'Whip Pan', 'Crane'].includes(shotContext.cameraMovement)) motionValue = 7;
    if (['Static', 'Dolly In', 'Tilt'].includes(shotContext.cameraMovement)) motionValue = 4;
    if (shotContext.cameraMovement.includes('Handheld')) motionValue = 6;

    const baseUniversal = UniversalAdapter.format(context, lengthMode === 'Detailed' ? 'Standard' : lengthMode);

    // Google Flow parameter flags
    const flowParams = [
      `--ar ${projectDna.aspectRatio.replace(':', '_')}`,
      `--motion ${motionValue}`,
      `--shutter 180deg`,
      `--lens ${shotContext.lens.toLowerCase().replace(/[^a-z0-9]/g, '')}_anamorphic`,
      `--camera_move "${shotContext.cameraMovement}"`,
      `--vector "${shotContext.screenDirection || 'neutral'}"`,
      `--subject "${hero?.characterName || 'Lead'} (${hero?.currentState})"`
    ].join(' ');

    return `${baseUniversal}\n\n${flowParams}`;
  }
}

// ----------------------------------------------------------------------------
// 3. DREAMINA ADAPTER (High Visual Fidelity, Filmic Tone, Avoid Negative Prompt)
// ----------------------------------------------------------------------------
export class DreaminaAdapter {
  public static format(context: ProductionContext, lengthMode: PromptLengthMode = 'Standard'): string {
    const { shotContext, projectDna, characters, location, directorIntention } = context;
    const hero = characters[0];

    const base = UniversalAdapter.format(context, lengthMode === 'Detailed' ? 'Standard' : lengthMode);

    // Dreamina specific visual enhancers
    const dreaminaEnhancers = [
      `masterpiece, raw film grain, high dynamic range, ${directorIntention.visualStrategy}, 8k UHD, realistic reflections on damp surfaces, cinematic tone curve, deep shadow retention.`,
    ].join(', ');

    return `${base}\n\n[STYLE REFINEMENTS]: ${dreaminaEnhancers}`;
  }

  public static formatAvoid(context: ProductionContext): string {
    const customAvoid = context.shotContext.contract?.mustNotChange || [];
    const baseAvoidList = [
      'blurry',
      'low resolution',
      'deformed anatomy',
      'extra limbs',
      'unnatural facial morphing',
      'cartoonish',
      '3D render glossy look',
      'overexposed highlights',
      'flat lighting',
      'incorrect costume color',
      'clean clothes in battle scene',
      'missing wounds or healed injuries abruptly',
      'disjointed camera axis',
      'text overlay',
      'watermarks',
      ...customAvoid.map(c => `altering ${c}`),
    ];

    return baseAvoidList.join(', ');
  }
}

// ----------------------------------------------------------------------------
// 4. PROMPT DIFF GENERATOR (Compare V1 vs V2)
// ----------------------------------------------------------------------------
export function diffPrompts(v1: ShotPrompt, v2: ShotPrompt): PromptDiffItem[] {
  const diffs: PromptDiffItem[] = [];

  // Version tag
  diffs.push({
    dimension: 'Prompt Version',
    v1Value: v1.versionTag,
    v2Value: v2.versionTag,
  });

  // Length Mode
  if (v1.lengthMode || v2.lengthMode) {
    diffs.push({
      dimension: 'Length Mode',
      v1Value: v1.lengthMode || 'Standard',
      v2Value: v2.lengthMode || 'Standard',
    });
  }

  // Change Reason
  if (v2.changeReason) {
    diffs.push({
      dimension: 'Revision Reason',
      v1Value: 'Base Version',
      v2Value: v2.changeReason,
    });
  }

  // Quick text diff extraction (Universal)
  const v1Text = v1.promptUniversal || v1.promptText || '';
  const v2Text = v2.promptUniversal || v2.promptText || '';

  const extractKeyword = (text: string, regex: RegExp) => {
    const m = text.match(regex);
    return m ? m[1] || m[0] : 'None';
  };

  const v1Lens = extractKeyword(v1Text, /(18mm|24mm|28mm|35mm|50mm|85mm|100mm|135mm|200mm|Anamorphic)/i);
  const v2Lens = extractKeyword(v2Text, /(18mm|24mm|28mm|35mm|50mm|85mm|100mm|135mm|200mm|Anamorphic)/i);
  if (v1Lens !== v2Lens) {
    diffs.push({
      dimension: 'Lens / Focal Length',
      v1Value: v1Lens,
      v2Value: v2Lens,
    });
  }

  const v1Move = extractKeyword(v1Text, /(Static|Pan|Tilt|Dolly In|Dolly Out|Tracking|Steadicam|Handheld|Push In|Arc|Crane)/i);
  const v2Move = extractKeyword(v2Text, /(Static|Pan|Tilt|Dolly In|Dolly Out|Tracking|Steadicam|Handheld|Push In|Arc|Crane)/i);
  if (v1Move !== v2Move) {
    diffs.push({
      dimension: 'Camera Movement',
      v1Value: v1Move,
      v2Value: v2Move,
    });
  }

  const v1State = extractKeyword(v1Text, /(NORMAL|INJURED|BLOODIED|EXHAUSTED|BATTLE DAMAGED|WET)/i);
  const v2State = extractKeyword(v2Text, /(NORMAL|INJURED|BLOODIED|EXHAUSTED|BATTLE DAMAGED|WET)/i);
  if (v1State !== v2State) {
    diffs.push({
      dimension: 'Character State',
      v1Value: v1State,
      v2Value: v2State,
    });
  }

  return diffs;
}
