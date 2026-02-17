import type { Organization, User, Team, Challenge, CheckIn, BarometerResponse, DemoState, Role } from '@/types/demo';

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
];

const teams: Team[] = [
  { id: 't1', name: 'Team Alpha', managerId: 'u2', memberIds: ['u2', 'u3', 'u4'] },
  { id: 't2', name: 'Team Beta', managerId: 'u5', memberIds: ['u5', 'u6', 'u7', 'u8'] },
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

// Generate check-ins for weeks 1-3 (current week 4 not yet done for current user)
function generateCheckIns(): CheckIn[] {
  const ins: CheckIn[] = [];
  let counter = 1;
  const actionIds = ['a1', 'a2', 'a3', 'a4'];

  for (const user of users.filter(u => u.role !== 'admin')) {
    for (let week = 1; week <= 3; week++) {
      const completed = actionIds.slice(0, Math.floor(Math.random() * 3) + 2);
      ins.push({
        id: `ci-${counter++}`,
        userId: user.id,
        challengeId: 'ch-1',
        weekNumber: week,
        completedActionIds: completed,
        note: '',
        createdAt: `2026-02-${String(week * 7).padStart(2, '0')}T10:00:00Z`,
      });
    }
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
