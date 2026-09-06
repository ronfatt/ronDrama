// ==============================================================================
// R.ON DRAMA STUDIO — MANUAL AI WORKFLOW ENGINE (ROUND 2)
// Parse, validate, repair, and preview external ChatGPT / Gemini outputs
// Strictly NO API calls.
// ==============================================================================

import { StoryBreakdownSchema } from '../types';
import {
  generateDynamicBreakdownInstruction,
  generateJsonRepairInstruction,
  generateSceneDirectorAnalysisInstruction,
  BreakdownInstructionContext,
  SceneDiscussionContext,
} from './promptTemplates';

export interface ValidationResult {
  success: boolean;
  data?: StoryBreakdownSchema;
  error?: string;
  errorLine?: number;
  repairInstruction?: string;
  stats?: {
    episodesCount: number;
    scenesCount: number;
    charactersCount: number;
    locationsCount: number;
    propsCount: number;
    costumesCount: number;
  };
}

export class ManualAIWorkflow {
  /**
   * Generates dynamic AI Breakdown Prompt based on full project, bibles, and story context
   */
  public generateBreakdownPrompt(context: BreakdownInstructionContext): string {
    return generateDynamicBreakdownInstruction(context);
  }

  /**
   * Generates dynamic Scene Directorial Analysis Prompt for ChatGPT / Gemini
   */
  public generateSceneAnalysisPrompt(context: SceneDiscussionContext): string {
    return generateSceneDirectorAnalysisInstruction(context);
  }

  /**
   * Validates raw JSON string from external AI with pinpoint error tracking
   */
  public validateBreakdownJson(rawInput: string): ValidationResult {
    if (!rawInput || !rawInput.trim()) {
      return {
        success: false,
        error: '输入的 JSON 为空，请先从 ChatGPT 或 Gemini 复制并粘贴结果。',
      };
    }

    let cleaned = rawInput.trim();

    // Remove markdown code fences if user included them despite instructions
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }

    // Attempt to extract JSON from braces if extraneous text was returned
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleaned) as StoryBreakdownSchema;

      // Validate schema requirements
      if (!parsed.episodes || !Array.isArray(parsed.episodes) || parsed.episodes.length === 0) {
        return {
          success: false,
          error: 'JSON 结构缺少必需的 "episodes" 数组或数组为空。',
          repairInstruction: generateJsonRepairInstruction(rawInput, 'Missing required "episodes" array.'),
        };
      }

      // Collect statistics
      const charactersSet = new Set<string>();
      const locationsSet = new Set<string>();
      const propsSet = new Set<string>();
      const costumesSet = new Set<string>();
      let totalScenes = 0;

      for (let i = 0; i < parsed.episodes.length; i++) {
        const ep = parsed.episodes[i];
        if (!ep.scenes || !Array.isArray(ep.scenes)) {
          return {
            success: false,
            error: `第 ${i + 1} 集缺少 "scenes" 场次数组。`,
            repairInstruction: generateJsonRepairInstruction(rawInput, `Episode ${i + 1} is missing scenes array.`),
          };
        }

        totalScenes += ep.scenes.length;
        ep.scenes.forEach(sc => {
          if (sc.location) locationsSet.add(sc.location.trim().toUpperCase());
          if (Array.isArray(sc.characters)) sc.characters.forEach(c => charactersSet.add(String(c).trim().toUpperCase()));
          if (Array.isArray(sc.props)) sc.props.forEach(p => propsSet.add(String(p).trim().toUpperCase()));
          if (Array.isArray(sc.costumes)) sc.costumes.forEach(cos => costumesSet.add(String(cos).trim().toUpperCase()));
        });
      }

      return {
        success: true,
        data: parsed,
        stats: {
          episodesCount: parsed.episodes.length,
          scenesCount: totalScenes,
          charactersCount: charactersSet.size,
          locationsCount: locationsSet.size,
          propsCount: propsSet.size,
          costumesCount: costumesSet.size,
        },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      
      // Extract position / line number if available
      let errorLine: number | undefined;
      const posMatch = msg.match(/position (\d+)/);
      if (posMatch) {
        const charPos = parseInt(posMatch[1], 10);
        const upToError = cleaned.substring(0, charPos);
        errorLine = upToError.split('\n').length;
      }

      return {
        success: false,
        error: `JSON 语法错误 (第 ${errorLine || '?'} 行): ${msg}`,
        errorLine,
        repairInstruction: generateJsonRepairInstruction(rawInput, msg),
      };
    }
  }

  /**
   * Parses direct scene director analysis response
   */
  public parseDirectorAnalysisJson(rawInput: string): { success: boolean; data?: any; error?: string } {
    if (!rawInput || !rawInput.trim()) return { success: false, error: 'Empty input.' };

    let cleaned = rawInput.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleaned);
      return { success: true, data: parsed };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

export const manualAI = new ManualAIWorkflow();
