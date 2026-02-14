export interface ModuleContent {
  outcomes: string[];
  coreLesson: string[];
}

export interface Unit {
  unitId: string;
  title: string;
  durationMinutes: number;
  type: 'learn' | 'exercise' | 'reflection' | 'practice';
  summaryBullets: string[];
}

export interface Module {
  id: string;
  title: string;
  shortDescription: string;
  durationMinutes: number;
  totalDurationMinutes?: number;
  category: string;
  level?: string;
  units?: Unit[];
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

export interface UnitProgress {
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
