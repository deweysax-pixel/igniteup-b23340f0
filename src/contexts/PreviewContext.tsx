import React, { createContext, useContext, useState, useMemo } from 'react';

export type FitCheckAnswers = {
  behavior?: string;
  ambition?: string;
  audience?: string;
  teamSize?: string;
};

interface PreviewContextValue {
  isPreviewMode: boolean;
  setPreviewMode: (v: boolean) => void;
  fitCheckAnswers: FitCheckAnswers;
  setFitCheckAnswers: (a: FitCheckAnswers) => void;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [isPreviewMode, setPreviewMode] = useState(false);
  const [fitCheckAnswers, setFitCheckAnswers] = useState<FitCheckAnswers>({});

  const value = useMemo(() => ({
    isPreviewMode, setPreviewMode, fitCheckAnswers, setFitCheckAnswers,
  }), [isPreviewMode, fitCheckAnswers]);

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) throw new Error('usePreview must be used within PreviewProvider');
  return ctx;
}
