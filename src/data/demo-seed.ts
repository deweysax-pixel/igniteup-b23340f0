import type { Organization, User, Team, Challenge, CheckIn, BarometerResponse, DemoState, Role } from '@/types/demo';
import type { UnitProgress } from '@/types/journey';

const organization: Organization = {
  id: 'org-1',
  name: 'Horizon Group',
};

const users: User[] = [
  { id: 'u1', name: 'Claire Dubois', role: 'admin', teamId: 't1', level: 'Gold', xp: 320, streak: 4 },
  { id: 'u2', name: 'Marc Leroy', role: 'manager', teamId: 't1', level: 'Silver', xp: 180, streak: 3 },
  { id: 'u3', name: 'Sophie Martin', role: 'participant', teamId: 't1', level: 'Silver', xp: 150, streak: 2 },
  { id: 'u4', name: 'Lucas Bernard', role: 'participant', teamId: 't1', level: 'Bronze', xp: 80, streak: 1 },
  { id: 'u5', name: 'Emma Petit', role: 'manager', teamId: 't2', level: 'Gold', xp: 290, streak: 4 },
  { id: 'u6', name: 'Thomas Moreau', role: 'participant', teamId: 't2', level: 'Silver', xp: 200, streak: 3 },
  { id: 'u7', name: 'Julie Fournier', role: 'participant', teamId: 't2', level: 'Bronze', xp: 60, streak: 0 },
  { id: 'u8', name: 'Nicolas Girard', role: 'participant', teamId: 't2', level: 'Silver', xp: 120, streak: 2 },
  // New users
  { id: 'u9', name: 'Camille Roux', role: 'participant', teamId: 't1', level: 'Gold', xp: 260, streak: 3 },
  { id: 'u10', name: 'Antoine Blanc', role: 'participant', teamId: 't1', level: 'Silver', xp: 140, streak: 2 },
  { id: 'u11', name: 'Léa Mercier', role: 'participant', teamId: 't2', level: 'Silver', xp: 170, streak: 3 },
  { id: 'u12', name: 'Hugo Faure', role: 'participant', teamId: 't2', level: 'Bronze', xp: 90, streak: 1 },
  { id: 'u13', name: 'Manon Gauthier', role: 'participant', teamId: 't1', level: 'Bronze', xp: 40, streak: 0 },
];

const teams: Team[] = [
  { id: 't1', name: 'Team Alpha', managerId: 'u2', memberIds: ['u2', 'u3', 'u4', 'u9', 'u10', 'u13'] },
  { id: 't2', name: 'Team Beta', managerId: 'u5', memberIds: ['u5', 'u6', 'u7', 'u8', 'u11', 'u12'] },
];

const challenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Challenge of the Month: Weekly Feedback',
    description: 'Build 4 key agile leadership habits over 4 weeks. Complete the proposed actions each week and track your progress.',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'active',
    weeklyActions: [
      { id: 'a1', label: 'Give constructive feedback to a colleague', points: 15 },
      { id: 'a2', label: 'Run a 10-min stand-up with your team', points: 10 },
      { id: 'a3', label: 'Make a documented delegated decision', points: 20 },
      { id: 'a4', label: 'Share a team win during a meeting', points: 10 },
    ],
  },
  {
    id: 'ch-2',
    title: 'Impactful Communication — March 2026',
    description: 'Master executive communication techniques to increase your influence.',
    startDate: '2026-03-01',
    endDate: '2026-03-28',
    status: 'upcoming',
    weeklyActions: [
      { id: 'a5', label: 'Prepare a 2-minute pitch', points: 15 },
      { id: 'a6', label: 'Practice active listening in a meeting', points: 10 },
      { id: 'a7', label: 'Write a clear summary message', points: 15 },
    ],
  },
];

/*
 * Check-in generation targeting Ignite distribution:
 *   Active  (7): u2, u3, u5, u6, u9, u10, u11  → recent check-ins + recent units
 *   At Risk (3): u4 (units, no check-in), u8 (check-in, no units), u12 (check-in, units outside window)
 *   Inactive(2): u7, u13 → no recent check-ins, no recent units
 */
function generateCheckIns(): CheckIn[] {
  const ins: CheckIn[] = [];
  let counter = 1;
  const now = new Date('2026-02-17T12:00:00Z').getTime();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  // Users with recent check-ins (within 14 days)
  const recentEntries: { userId: string; days: number[] }[] = [
    // Active users — spread across last 14 days, 3+ within last 3 days
    { userId: 'u2', days: [1, 8] },
    { userId: 'u3', days: [2, 7] },
    { userId: 'u5', days: [1, 10] },
    { userId: 'u6', days: [3, 9] },
    { userId: 'u9', days: [2, 6] },
    { userId: 'u10', days: [3, 11] },
    { userId: 'u11', days: [1, 5] },
    // At Risk — has check-ins but no units
    { userId: 'u8', days: [4, 12] },
    // At Risk — has check-in within window, units outside window
    { userId: 'u12', days: [6] },
  ];

  for (const { userId, days } of recentEntries) {
    for (let i = 0; i < days.length; i++) {
      ins.push({
        id: `ci-${counter++}`,
        userId,
        challengeId: 'ch-1',
        weekNumber: i + 1,
        completedActionIds: ['a1', 'a2'],
        note: '',
        createdAt: daysAgo(days[i]),
      });
    }
  }

  // Old check-ins outside 14-day window for inactive & at-risk-no-checkin users
  for (const { userId, daysBack } of [
    { userId: 'u7', daysBack: 20 },
    { userId: 'u13', daysBack: 25 },
    { userId: 'u4', daysBack: 18 },
  ]) {
    ins.push({
      id: `ci-${counter++}`,
      userId,
      challengeId: 'ch-1',
      weekNumber: 1,
      completedActionIds: ['a1'],
      note: '',
      createdAt: daysAgo(daysBack),
    });
  }

  return ins;
}

function generateBarometerResponses(): BarometerResponse[] {
  const responses: BarometerResponse[] = [];
  let counter = 1;

  for (const user of users.filter(u => u.role !== 'admin')) {
    for (let week = 1; week <= 3; week++) {
      responses.push({
        id: `br-${counter++}`,
        userId: user.id,
        challengeId: 'ch-1',
        weekNumber: week,
        scores: {
          confidence: Math.min(5, 2 + week * 0.5 + Math.random()),
          engagement: Math.min(5, 2.5 + week * 0.4 + Math.random()),
          clarity: Math.min(5, 2 + week * 0.6 + Math.random()),
        },
      });
    }
  }
  return responses;
}

/*
 * Per-user seeded unit progress for the Team Ignite Heatmap.
 * Maps userId → Record<unitId, UnitProgress>.
 */
export function getSeededUnitProgressForUser(userId: string): Record<string, UnitProgress> {
  const now = new Date('2026-02-17T12:00:00Z').getTime();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  // Active users: one unit completed per pack within 14 days
  const activeUsers = ['u2', 'u3', 'u5', 'u6', 'u9', 'u10', 'u11'];
  if (activeUsers.includes(userId)) {
    const idx = activeUsers.indexOf(userId);
    const base = idx * 1.5 + 1; // spread 1-11 days ago
    return {
      'tp1-u1': { status: 'completed', completedAt: daysAgo(base) },
      'tp2-u1': { status: 'completed', completedAt: daysAgo(base + 1) },
      'tp3-u1': { status: 'completed', completedAt: daysAgo(base + 0.5) },
      'tp4-u1': { status: 'completed', completedAt: daysAgo(base + 2) },
      'tp5-u1': { status: 'completed', completedAt: daysAgo(base + 1.5) },
    };
  }

  // At Risk — u4: has units within window, no recent check-ins
  if (userId === 'u4') {
    return {
      'tp1-u1': { status: 'completed', completedAt: daysAgo(5) },
      'tp2-u1': { status: 'completed', completedAt: daysAgo(7) },
      'tp3-u1': { status: 'completed', completedAt: daysAgo(6) },
      'tp4-u1': { status: 'completed', completedAt: daysAgo(8) },
      'tp5-u1': { status: 'completed', completedAt: daysAgo(9) },
    };
  }

  // At Risk — u12: units OUTSIDE 14-day window, check-in within window
  if (userId === 'u12') {
    return {
      'tp1-u1': { status: 'completed', completedAt: daysAgo(16) },
      'tp2-u1': { status: 'completed', completedAt: daysAgo(18) },
    };
  }

  // u8 (at risk — check-ins only, no units), u7, u13 (inactive)
  return {};
}

/*
 * Initial unit progress for the current logged-in user (seeded for /app/ignite).
 */
export function getSeededCurrentUserUnitProgress(): Record<string, UnitProgress> {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  return {
    'tp1-u1': { status: 'completed', completedAt: daysAgo(2) },
    'tp2-u1': { status: 'completed', completedAt: daysAgo(3) },
    'tp3-u1': { status: 'completed', completedAt: daysAgo(4) },
    'tp4-u1': { status: 'completed', completedAt: daysAgo(5) },
    'tp5-u1': { status: 'completed', completedAt: daysAgo(6) },
  };
}

export function createInitialState(role: Role = 'manager'): DemoState {
  const roleUserMap = { admin: 'u1', manager: 'u2', participant: 'u3' };
  return {
    organization,
    users: [...users],
    teams: [...teams],
    challenges: [...challenges],
    checkIns: generateCheckIns(),
    barometerResponses: generateBarometerResponses(),
    serviceRequests: [],
    evidenceLog: [],
    coachingCredits: 3,
    currentUserId: roleUserMap[role],
    currentRole: role,
  };
}
