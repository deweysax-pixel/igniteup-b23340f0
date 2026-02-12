import type { Module, Journey } from '@/types/journey';

export const modules: Module[] = [
  {
    id: 'mod-1',
    title: 'Weekly Feedback',
    shortDescription: 'Build a habit of giving and receiving feedback every week using the SBI framework.',
    durationMinutes: 15,
    category: 'feedback',
    playbookRoute: '/app/playbooks',
    practiceRoute: '/app/checkin',
    measureRoute: '/app/barometer',
  },
  {
    id: 'mod-2',
    title: 'Effective Delegation',
    shortDescription: 'Learn to delegate with clarity: define outcomes, set boundaries, and follow up.',
    durationMinutes: 20,
    category: 'delegation',
    practiceRoute: '/app/challenges',
  },
  {
    id: 'mod-3',
    title: 'Impactful Stand-ups',
    shortDescription: 'Run focused 10-minute stand-ups that align the team and surface blockers fast.',
    durationMinutes: 10,
    category: 'communication',
    practiceRoute: '/app/challenges',
  },
  {
    id: 'mod-4',
    title: 'Coaching Conversations',
    shortDescription: 'Use the GROW model to coach direct reports toward their own solutions.',
    durationMinutes: 25,
    category: 'coaching',
  },
  {
    id: 'mod-5',
    title: 'Executive Communication',
    shortDescription: 'Craft concise messages that drive decisions at the leadership level.',
    durationMinutes: 15,
    category: 'communication',
    playbookRoute: '/app/playbooks',
  },
];

export const defaultJourney: Journey = {
  id: 'j-1',
  title: 'Agile Leadership Essentials',
  durationWeeks: 4,
  steps: [
    { weekNumber: 1, moduleId: 'mod-1' },
    { weekNumber: 2, moduleId: 'mod-3' },
    { weekNumber: 3, moduleId: 'mod-2' },
    { weekNumber: 4, moduleId: 'mod-4' },
  ],
  currentWeek: 2,
};
