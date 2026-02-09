import type { Organization, User, Team, Challenge, CheckIn, BarometerResponse, DemoState, Role } from '@/types/demo';

const organization: Organization = {
  id: 'org-1',
  name: 'Horizon Group',
};

const users: User[] = [
  { id: 'u1', name: 'Claire Dubois', role: 'admin', teamId: 't1', level: 'Or', xp: 320, streak: 4 },
  { id: 'u2', name: 'Marc Leroy', role: 'manager', teamId: 't1', level: 'Argent', xp: 180, streak: 3 },
  { id: 'u3', name: 'Sophie Martin', role: 'participant', teamId: 't1', level: 'Argent', xp: 150, streak: 2 },
  { id: 'u4', name: 'Lucas Bernard', role: 'participant', teamId: 't1', level: 'Bronze', xp: 80, streak: 1 },
  { id: 'u5', name: 'Emma Petit', role: 'manager', teamId: 't2', level: 'Or', xp: 290, streak: 4 },
  { id: 'u6', name: 'Thomas Moreau', role: 'participant', teamId: 't2', level: 'Argent', xp: 200, streak: 3 },
  { id: 'u7', name: 'Julie Fournier', role: 'participant', teamId: 't2', level: 'Bronze', xp: 60, streak: 0 },
  { id: 'u8', name: 'Nicolas Girard', role: 'participant', teamId: 't2', level: 'Argent', xp: 120, streak: 2 },
];

const teams: Team[] = [
  { id: 't1', name: 'Équipe Alpha', managerId: 'u2', memberIds: ['u2', 'u3', 'u4'] },
  { id: 't2', name: 'Équipe Beta', managerId: 'u5', memberIds: ['u5', 'u6', 'u7', 'u8'] },
];

const challenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Leadership Agile — Février 2026',
    description: 'Développez 4 habitudes clés du leadership agile en 4 semaines. Chaque semaine, réalisez les actions proposées et validez votre progression.',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'active',
    weeklyActions: [
      { id: 'a1', label: 'Donner un feedback constructif à un collègue', points: 15 },
      { id: 'a2', label: 'Animer un stand-up de 10 min avec son équipe', points: 10 },
      { id: 'a3', label: 'Prendre une décision déléguée documentée', points: 20 },
      { id: 'a4', label: 'Partager une réussite d\'équipe en réunion', points: 10 },
    ],
  },
  {
    id: 'ch-2',
    title: 'Communication Impactante — Mars 2026',
    description: 'Maîtrisez les techniques de communication exécutive pour gagner en influence.',
    startDate: '2026-03-01',
    endDate: '2026-03-28',
    status: 'upcoming',
    weeklyActions: [
      { id: 'a5', label: 'Préparer un pitch de 2 minutes', points: 15 },
      { id: 'a6', label: 'Pratiquer l\'écoute active en réunion', points: 10 },
      { id: 'a7', label: 'Rédiger un message de synthèse clair', points: 15 },
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
    currentUserId: roleUserMap[role],
    currentRole: role,
  };
}

