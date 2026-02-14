export interface ModuleContent {
  outcomes: string[];
  coreLesson: string[];
}

export interface Module {
  id: string;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  category: string;
  playbookRoute?: string;
  practiceRoute?: string;
  measureRoute?: string;
  content?: ModuleContent;
}

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface ModuleProgress {
  status: ModuleStatus;
  completedAt?: string;
}

export interface JourneyStep {
  weekNumber: number;
  moduleId: string;
  isPracticeWeek?: boolean;
}

export interface Journey {
  id: string;
  title: string;
  durationWeeks: 2 | 4 | 8 | 12 | 16 | 20 | 24;
  steps: JourneyStep[];
  currentWeek: number;
}
