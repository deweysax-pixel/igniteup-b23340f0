export interface Module {
  id: string;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  category: 'feedback' | 'communication' | 'delegation' | 'coaching' | 'strategy';
  playbookRoute?: string;
  practiceRoute?: string;
  measureRoute?: string;
}

export interface JourneyStep {
  weekNumber: number;
  moduleId: string;
}

export interface Journey {
  id: string;
  title: string;
  durationWeeks: 4 | 8;
  steps: JourneyStep[];
  currentWeek: number;
}
