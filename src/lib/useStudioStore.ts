'use client';

import { useState, useEffect } from 'react';
import { studioStore, StudioState } from './store';

export function useStudioStore(): StudioState & { isHydrated: boolean } {
  const [state, setState] = useState<StudioState>(studioStore.getState());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setState(studioStore.getState());
    const unsubscribe = studioStore.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  return {
    ...state,
    isHydrated,
  };
}
