import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Module, Journey, JourneyStep, ModuleStatus, ModuleProgress } from '@/types/journey';
import { modules as seedModules, defaultJourney } from '@/data/journey-seed';

interface JourneyContextValue {
  modules: Module[];
  journey: Journey;
  moduleProgress: Record<string, ModuleProgress>;
  addModuleToJourney: (moduleId: string) => void;
  removeModuleFromJourney: (moduleId: string) => void;
  setDuration: (weeks: 4 | 8) => void;
  generatePlan: () => void;
  saveJourney: () => void;
  getModule: (id: string) => Module | undefined;
  currentStepModule: Module | undefined;
  updateModuleStatus: (moduleId: string, status: ModuleStatus) => void;
  completedCount: number;
  firstIncompleteModule: Module | undefined;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: React.ReactNode }) {
  const [modules] = useState<Module[]>(seedModules);
  const [journey, setJourney] = useState<Journey>({ ...defaultJourney });
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});

  const getModule = useCallback((id: string) => modules.find(m => m.id === id), [modules]);

  const currentStepModule = journey.steps.find(s => s.weekNumber === journey.currentWeek)
    ? getModule(journey.steps.find(s => s.weekNumber === journey.currentWeek)!.moduleId)
    : undefined;

  const updateModuleStatus = useCallback((moduleId: string, status: ModuleStatus) => {
    setModuleProgress(prev => ({
      ...prev,
      [moduleId]: {
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined,
      },
    }));
  }, []);

  const journeyModuleIds = journey.steps.map(s => s.moduleId);
  const uniqueModuleIds = [...new Set(journeyModuleIds)];
  const completedCount = uniqueModuleIds.filter(id => moduleProgress[id]?.status === 'completed').length;

  const firstIncompleteModule = (() => {
    for (const step of journey.steps) {
      if (moduleProgress[step.moduleId]?.status !== 'completed') {
        return getModule(step.moduleId);
      }
    }
    return undefined;
  })();

  const addModuleToJourney = useCallback((moduleId: string) => {
    setJourney(prev => {
      const exists = prev.steps.some(s => s.moduleId === moduleId);
      if (exists) return prev;
      const nextWeek = prev.steps.length > 0
        ? Math.max(...prev.steps.map(s => s.weekNumber)) + 1
        : 1;
      return { ...prev, steps: [...prev.steps, { weekNumber: nextWeek, moduleId }] };
    });
  }, []);

  const removeModuleFromJourney = useCallback((moduleId: string) => {
    setJourney(prev => {
      const newSteps = prev.steps
        .filter(s => s.moduleId !== moduleId)
        .map((s, i) => ({ ...s, weekNumber: i + 1 }));
      return { ...prev, steps: newSteps };
    });
  }, []);

  const setDuration = useCallback((weeks: 2 | 4 | 8 | 12 | 16 | 20 | 24) => {
    setJourney(prev => ({ ...prev, durationWeeks: weeks }));
  }, []);

  const generatePlan = useCallback(() => {
    setJourney(prev => {
      if (prev.steps.length === 0) return prev;
      const moduleIds = prev.steps.map(s => s.moduleId);
      const newSteps: JourneyStep[] = [];

      if (prev.durationWeeks <= 8) {
        // Short journeys: distribute evenly
        for (let w = 1; w <= prev.durationWeeks; w++) {
          const modId = moduleIds[(w - 1) % moduleIds.length];
          newSteps.push({ weekNumber: w, moduleId: modId });
        }
      } else {
        // Long journeys: 2-week blocks (Learning + Practice & Embed)
        let week = 1;
        let modIndex = 0;
        while (week <= prev.durationWeeks) {
          const modId = moduleIds[modIndex % moduleIds.length];
          // Week A: Learning
          newSteps.push({ weekNumber: week, moduleId: modId });
          week++;
          // Week B: Practice & Embed (same module)
          if (week <= prev.durationWeeks) {
            newSteps.push({ weekNumber: week, moduleId: modId, isPracticeWeek: true });
            week++;
          }
          modIndex++;
        }
      }

      return { ...prev, steps: newSteps };
    });
  }, []);

  const saveJourney = useCallback(() => {
    // In demo mode this is a no-op beyond state; toast handled by caller
  }, []);

  return (
    <JourneyContext.Provider value={{
      modules, journey, moduleProgress, addModuleToJourney, removeModuleFromJourney,
      setDuration, generatePlan, saveJourney, getModule, currentStepModule,
      updateModuleStatus, completedCount, firstIncompleteModule,
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
}
