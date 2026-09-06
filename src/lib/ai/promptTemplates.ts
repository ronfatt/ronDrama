// ==============================================================================
// R.ON DRAMA STUDIO — DYNAMIC AI INSTRUCTION TEMPLATES (ROUND 2)
// Hollywood Pre-Production Breakdown & Directing Analysis for ChatGPT / Gemini
// Strictly NO API calls. Deterministic prompt synthesis.
// ==============================================================================

import { Project, ProjectBible, ActionBible, Scene, StoryInput } from '../types';

export const STORY_BREAKDOWN_SCHEMA_JSON = `{
  "project": {
    "title": "Series Title",
    "logline": "Core Series Logline",
    "genre": "Genre",
    "tone": "Tone"
  },
  "episodes": [
    {
      "episode_number": 1,
      "title": "Episode Title",
      "logline": "Episode Logline",
      "synopsis": "Episode Synopsis",
      "estimated_duration": 480,
      "scenes": [
        {
          "scene_number": 1,
          "title": "INT. ABANDONED WAREHOUSE - NIGHT",
          "int_ext": "INT",
          "location": "ABANDONED WAREHOUSE",
          "time": "NIGHT",
          "duration": 120,
          "story_purpose": "Establish protagonist's combat prowess and introduce syndicate threat.",
          "emotion": "Cold anticipation, sudden lethal adrenaline",
          "conflict": "Protagonist is ambushed by syndicate operatives with chained relics.",
          "director_intention": "Claustrophobic pressure cooker atmosphere building toward lightning-fast kenjutsu bursts.",
          "characters": ["RON", "KIRA"],
          "props": ["DAMASCUS STEEL KATANA", "NANO METALLIC CHAINS"],
          "costumes": ["BLACK TACTICAL COMBAT COAT", "SYNDICATE CEREMONIAL ROBE"],
          "beats": [
            {
              "beat_number": 1,
              "description": "Ron steps across rain-slicked concrete floor.",
              "action": "Slow deliberate walk, thumb pushing blade guard.",
              "emotional_shift": "Calculated vigilance."
            },
            {
              "beat_number": 2,
              "description": "Kira appears on high catwalk, triggering nano-chains.",
              "action": "Chains shoot from darkness.",
              "emotional_shift": "Sudden mortal danger."
            }
          ],
          "shot_suggestions": [
            {
              "shot_number": 1,
              "shot_type": "Medium Wide Shot",
              "action": "Ron walks slowly through floating dust beams, hand on katana hilt.",
              "camera": "Low angle Steadicam push in",
              "duration": 4
            },
            {
              "shot_number": 2,
              "shot_type": "Close Up",
              "action": "Thumb clicks katana guard forward with sharp metallic gleam.",
              "camera": "Insert macro Dutch angle",
              "duration": 2
            },
            {
              "shot_number": 3,
              "shot_type": "Extreme Wide Shot",
              "action": "Vast industrial warehouse revealed as ceiling chains begin to vibrate.",
              "camera": "High angle slow crane down",
              "duration": 5
            }
          ]
        }
      ]
    }
  ]
}`;

export interface BreakdownInstructionContext {
  project: Project;
  bible?: ProjectBible;
  actionBible?: ActionBible;
  storyInput: StoryInput;
}

export function generateDynamicBreakdownInstruction(context: BreakdownInstructionContext): string {
  const { project, bible, actionBible, storyInput } = context;

  const screenplayText = storyInput.screenplay || storyInput.treatment || storyInput.logline || project.logline;
  const activeTabName = storyInput.activeTab || 'SCREENPLAY';

  return `You are acting as an elite Hollywood Pre-Production Team for R.ON DRAMA STUDIO, operating concurrently in the following senior film industry roles:
- Senior Screenwriter (Narrative structure, dramatic pacing, character arcs)
- Script Supervisor (Scene numbering, sluglines, temporal continuity)
- Film Director (Dramatic intent, visual storytelling, staging)
- Cinematographer (Optics, camera movement, aspect ratio, lighting strategies)
- Production Designer (Environmental world-building, hero props, set dressing)
- Continuity Supervisor (Strict asset tracking, character wardrobe, state progression)

YOUR MISSION:
Perform a comprehensive, production-ready cinematic breakdown of the provided ${activeTabName}.
Transform the raw narrative text into a structured, episodic breakdown containing episodes, scenes, dramatic beats, characters, locations, hero props, costumes, director intentions, and initial shot suggestions.

---
[PRODUCTION CONTEXT & FILM BIBLE SPECIFICATIONS]:
Project Title: ${project.name}
Logline: ${project.logline || bible?.logline || 'N/A'}
Genre: ${project.genre || bible?.genre || 'Cinematic Drama'}
Tone & Mood: ${project.tone || bible?.tone || 'Tense, visceral, authentic'}
Visual Style: ${bible?.visualStyle || project.visualStyle || 'A24 / Denis Villeneuve cinematic photorealism'}
Language: ${project.language || 'Chinese & English'}
Target Episode Duration: ${project.episodeDuration || '5–10 minutes'}
Aspect Ratio: ${project.aspectRatio || '16:9'}
Director's Vision: ${bible?.directorsVision || 'High artistic integrity with razor-sharp kinetic pacing.'}
Lighting & Color: ${bible?.lightingLanguage || '8:1 contrast chiaroscuro'} | ${bible?.colorLanguage || 'Kodak Vision3 LUT'}
Camera Rig: ${bible?.lensKitSpecs || 'Panavision Anamorphic T2.0'} | ${bible?.cameraLanguage || 'Steadicam tracking'}
Action & Stunt Physics: ${actionBible?.stuntDesignStyle || '87Eleven tactical combat'} | ${actionBible?.combatPhysics || 'Physical mass inertia and momentum'}

---
[USER STORY INPUT (${activeTabName})]:
${screenplayText}

---
[CRITICAL OUTPUT RULES — ZERO TOLERANCE]:
1. RETURN JSON ONLY.
2. DO NOT include markdown code fences (do NOT wrap with \`\`\`json or \`\`\`).
3. DO NOT include any introductory greetings, conversational text, explanations, or notes.
4. Output must start immediately with "{" and end with "}".
5. Ensure ALL keys match the EXACT schema below. Numbers must be integers, strings must be quoted, arrays must be valid.

[MANDATORY JSON SCHEMA]:
${STORY_BREAKDOWN_SCHEMA_JSON}
`;
}

export function generateJsonRepairInstruction(malformedJson: string, errorDescription?: string): string {
  return `You are a strict JSON syntax and schema repair assistant for R.ON DRAMA STUDIO.

The following JSON output contains a formatting or syntax error:
${errorDescription ? `Error detail: ${errorDescription}` : 'Parsing failed.'}

CRITICAL RULES:
1. Repair this JSON so that it is 100% syntactically valid JSON.
2. DO NOT change the content, scene names, character names, or story details.
3. RETURN VALID JSON ONLY.
4. DO NOT wrap with \`\`\`json markdown fences.
5. DO NOT add any explanations or commentary. Start with "{" and end with "}".

[MALFORMED JSON TO REPAIR]:
${malformedJson}
`;
}

export interface SceneDiscussionContext {
  project: Project;
  bible?: ProjectBible;
  scene: Scene;
  characters: string[];
  location: string;
  props: string[];
  costumes: string[];
  currentDirectorNotes?: string;
  scriptExcerpt?: string;
}

export function generateSceneDirectorAnalysisInstruction(context: SceneDiscussionContext): string {
  const { project, bible, scene, characters, location, props, costumes, currentDirectorNotes, scriptExcerpt } = context;

  return `You are acting as an Academy Award-winning Film Director and Master Cinematographer conducting a deep scene-level directorial analysis for R.ON DRAMA STUDIO.

Analyze the following scene like a master film director. Do not rewrite the screenplay.

Analyze and identify:
1. Dramatic purpose (Why does this scene exist? What changes irrevocably?)
2. Emotional progression (The psychological shift from head to tail)
3. Character performance direction (Subtext, eye tracking, stillness vs micro-movement)
4. Visual storytelling & blocking (Multi-plane staging, negative space)
5. Camera strategy & movement (Focal length, movement motivation, angle psychology)
6. Shot progression (Cadence of shots from master establishing to tactile inserts)
7. Lighting strategy & shadow roll-off (Key-to-fill ratio, rim lights, practicals)
8. Pacing & temporal breathing (Tension ramp, acceleration, release)
9. Transitions (Entrance and exit cuts, auditory lead-ins)
10. Continuity risks (Costume tears, prop hands, wound progression)

---
[PROJECT & SCENE CONTEXT]:
Project: ${project.name} (${project.genre})
Visual Style: ${bible?.visualStyle || project.visualStyle}
Scene: Scene ${scene.sceneNumber}: ${scene.sceneTitle} (${scene.intExt}, ${scene.timeOfDay})
Location: ${location || scene.locationName}
Characters Present: ${characters.join(', ') || 'N/A'}
Hero Props: ${props.join(', ') || 'N/A'}
Costumes: ${costumes.join(', ') || 'N/A'}
Current Director Notes: ${currentDirectorNotes || scene.directorNotes || 'None'}

[RAW SCREENPLAY EXCERPT]:
${scriptExcerpt || scene.storyPurpose || 'Scene in production.'}

---
[OUTPUT FORMAT MANDATE]:
Return ONLY a valid JSON object without markdown fences, matching:
{
  "director_intention": {
    "scene_purpose": "...",
    "emotional_arc": "...",
    "audience_experience": "...",
    "pacing": "...",
    "visual_strategy": "...",
    "performance_direction": "...",
    "camera_strategy": "...",
    "lighting_strategy": "...",
    "sound_direction": "...",
    "transition": "...",
    "director_notes": "..."
  },
  "shot_plan": [
    {
      "shot_number": 1,
      "shot_type": "Wide Shot",
      "camera_movement": "Push In",
      "lens": "35mm",
      "subject": "Protagonist",
      "action": "...",
      "duration": "4s",
      "lighting": "..."
    }
  ],
  "continuity_notes": [
    "Strict note on wound persistence",
    "Costume tear alignment across cuts"
  ]
}
`;
}
