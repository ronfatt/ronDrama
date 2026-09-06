// ==============================================================================
// R.ON DRAMA STUDIO — AI PROVIDER ARCHITECTURE
// Note: MVP does NOT invoke external AI APIs. Default is ManualAIProvider.
// ==============================================================================

export interface BreakdownResultJSON {
  episodeTitle?: string;
  episodeNumber?: number;
  scenes: Array<{
    sceneNumber: number;
    sceneTitle: string;
    intExt: 'INT' | 'EXT';
    locationName: string;
    timeOfDay: string;
    characters: string[];
    props: string[];
    costumes: string[];
    storyPurpose: string;
    emotion: string;
    conflict: string;
    duration: string;
    directorNotes: string;
    directorIntention?: {
      scenePurpose?: string;
      emotionalArc?: string;
      audienceExperience?: string;
      pacing?: string;
      visualStrategy?: string;
      performanceDirection?: string;
      cameraStrategy?: string;
      lightingStrategy?: string;
      transition?: string;
    };
    beats?: Array<{
      beatNumber: number;
      description: string;
      characters?: string;
      action?: string;
      emotionalShift?: string;
    }>;
    shots?: Array<{
      shotNumber: number;
      shotType: string;
      framing?: string;
      cameraAngle?: string;
      lens?: string;
      cameraMovement?: string;
      subject?: string;
      action?: string;
      performance?: string;
      environment?: string;
      lighting?: string;
      atmosphere?: string;
      composition?: string;
      depth?: string;
      visualEffects?: string;
      transition?: string;
      duration?: string;
      dialogue?: string;
      sound?: string;
      directorNotes?: string;
    }>;
  }>;
  discoveredAssets?: {
    characters?: Array<{
      name: string;
      role?: string;
      description?: string;
      costume?: string;
    }>;
    locations?: Array<{
      name: string;
      description?: string;
      atmosphere?: string;
    }>;
    props?: Array<{
      name: string;
      description?: string;
      importance?: string;
    }>;
  };
}

export interface AIProvider {
  name: string;
  isManual: boolean;
  generateBreakdownInstruction(screenplayText: string, context?: Record<string, unknown>): string;
  parseBreakdownResponse(rawText: string): { success: boolean; data?: BreakdownResultJSON; error?: string };
}
