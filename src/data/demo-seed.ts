import type { Organization, User, Team, Challenge, CheckIn, BarometerResponse, DemoState, Role, ServiceRequest } from '@/types/demo';
import type { UnitProgress } from '@/types/journey';

const organization: Organization = {
  id: 'org-1',
  name: 'Horizon Group',
};

/**
 * Demo performer distribution:
 *   ★ Top (2):    Camille Roux (u9), Thomas Moreau (u6)  — Gold/Platinum, high XP, long streaks
 *   ● Solid (4):  Marc Leroy (u2), Emma Petit (u5), Léa Mercier (u11), Sophie Martin (u3)
 *   ◐ Mid (3):    Antoine Blanc (u10), Nicolas Girard (u8), Hugo Faure (u12)
 *   ▽ At Risk (2): Lucas Bernard (u4), Julie Fournier (u7)
 *   ✕ Inactive (1): Manon Gauthier (u13)
 */
const users: User[] = [
  // Admin
  { id: 'u1', name: 'Claire Dubois', role: 'admin', teamId: 't1', level: 'Gold', xp: 320, streak: 4 },
  // Sponsor — executive visibility
  { id: 'u14', name: 'Philippe Renard', role: 'sponsor', teamId: 't1', level: 'Silver', xp: 0, streak: 0 },

  // Managers
  { id: 'u2', name: 'Marc Leroy', role: 'manager', teamId: 't1', level: 'Gold', xp: 275, streak: 5 },
  { id: 'u5', name: 'Emma Petit', role: 'manager', teamId: 't2', level: 'Gold', xp: 310, streak: 6 },

  // Team Alpha — collaborators
  { id: 'u9', name: 'Camille Roux', role: 'participant', teamId: 't1', level: 'Platinum', xp: 520, streak: 8 },  // ★ Top
  { id: 'u3', name: 'Sophie Martin', role: 'participant', teamId: 't1', level: 'Silver', xp: 185, streak: 3 },   // ● Solid
  { id: 'u10', name: 'Antoine Blanc', role: 'participant', teamId: 't1', level: 'Silver', xp: 130, streak: 2 },   // ◐ Mid
  { id: 'u4', name: 'Lucas Bernard', role: 'participant', teamId: 't1', level: 'Bronze', xp: 75, streak: 0 },     // ▽ At Risk
  { id: 'u13', name: 'Manon Gauthier', role: 'participant', teamId: 't1', level: 'Bronze', xp: 25, streak: 0 },   // ✕ Inactive

  // Team Beta — collaborators
  { id: 'u6', name: 'Thomas Moreau', role: 'participant', teamId: 't2', level: 'Gold', xp: 445, streak: 7 },      // ★ Top
  { id: 'u11', name: 'Léa Mercier', role: 'participant', teamId: 't2', level: 'Silver', xp: 210, streak: 4 },     // ● Solid
  { id: 'u8', name: 'Nicolas Girard', role: 'participant', teamId: 't2', level: 'Silver', xp: 115, streak: 1 },   // ◐ Mid
  { id: 'u12', name: 'Hugo Faure', role: 'participant', teamId: 't2', level: 'Bronze', xp: 95, streak: 1 },       // ◐ Mid
  { id: 'u7', name: 'Julie Fournier', role: 'participant', teamId: 't2', level: 'Bronze', xp: 55, streak: 0 },    // ▽ At Risk
];

const teams: Team[] = [
  { id: 't1', name: 'Team Alpha', managerId: 'u2', memberIds: ['u2', 'u3', 'u4', 'u9', 'u10', 'u13'] },
  { id: 't2', name: 'Team Beta', managerId: 'u5', memberIds: ['u5', 'u6', 'u7', 'u8', 'u11', 'u12'] },
];

const challenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Agile Leadership Sprint — February',
    description: 'Build 4 key agile leadership habits over 4 weeks. Complete the proposed actions each week and track your progress.',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'active',
    themeId: 'alignment',
    weeklyActions: [
      { id: 'a1', label: 'Give constructive feedback to a colleague', points: 15, momentId: 'give-sbi-feedback' },
      { id: 'a2', label: 'Check real understanding with your team', points: 10, momentId: 'check-real-understanding' },
      { id: 'a3', label: 'Clarify ownership of a key task', points: 20, momentId: 'clarify-ownership' },
      { id: 'a4', label: 'Share a team win during a meeting', points: 10, momentId: 'share-team-win' },
    ],
  },
  {
    id: 'ch-2',
    title: 'Impactful Communication — March 2026',
    description: 'Master executive communication techniques to increase your influence and drive alignment across teams.',
    startDate: '2026-03-01',
    endDate: '2026-03-28',
    status: 'upcoming',
    themeId: 'direction',
    weeklyActions: [
      { id: 'a5', label: 'Clarify the real priority', points: 15, momentId: 'clarify-real-priority' },
      { id: 'a6', label: 'Name the decision owner', points: 10, momentId: 'name-decision-owner' },
      { id: 'a7', label: 'Recognize a contribution', points: 15, momentId: 'recognize-contribution' },
    ],
  },
];

const serviceRequests: ServiceRequest[] = [
  {
    id: 'sr-seed-1',
    createdAt: '2026-02-10T09:30:00Z',
    requesterName: 'Lucas Bernard',
    requesterEmail: 'lucas.bernard@horizongroup.com',
    role: 'participant',
    team: 'Team Alpha',
    requestType: 'coaching_session',
    moduleTitle: 'Giving Feedback Under Pressure',
    message: 'I struggle with giving feedback to senior colleagues. Would appreciate a 1-on-1 coaching session to practice.',
    status: 'scheduled',
    preferredTimeframe: 'Next week',
  },
  {
    id: 'sr-seed-2',
    createdAt: '2026-02-14T14:15:00Z',
    requesterName: 'Marc Leroy',
    requesterEmail: 'marc.leroy@horizongroup.com',
    role: 'manager',
    team: 'Team Alpha',
    requestType: 'team_workshop',
    moduleTitle: 'Delegation & Trust',
    message: 'My team is struggling with delegation. Can we schedule a workshop to work through the framework together?',
    status: 'in_review',
  },
  {
    id: 'sr-seed-3',
    createdAt: '2026-02-16T11:00:00Z',
    requesterName: 'Camille Roux',
    requesterEmail: 'camille.roux@horizongroup.com',
    role: 'participant',
    team: 'Team Alpha',
    requestType: 'ask_expert',
    moduleTitle: 'Peer Accountability',
    message: 'I want to explore how to apply the accountability framework with a cross-functional partner outside my team.',
    status: 'new',
  },
];

/*
 * Check-in generation — realistic spread:
 *   ★ Top:     u9 (4 check-ins), u6 (4 check-ins) — very recent, multiple weeks
 *   ● Solid:   u2 (3), u5 (3), u11 (3), u3 (2) — recent
 *   ◐ Mid:     u10 (2), u8 (1 recent), u12 (1 recent)
 *   ▽ At Risk: u4 (1 old, within window), u7 (1 old, edge of window)
 *   ✕ Inactive: u13 (1 very old, outside window)
 */
function generateCheckIns(): CheckIn[] {
  const ins: CheckIn[] = [];
  let counter = 1;
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  const entries: { userId: string; weeks: { day: number; actions: string[]; note: string }[] }[] = [
    // ★ Top performers — frequent, varied actions
    { userId: 'u9', weeks: [
      { day: 1, actions: ['a1', 'a2', 'a3', 'a4'], note: 'Full sweep this week. Delegation decision went really well.' },
      { day: 5, actions: ['a1', 'a3'], note: 'Had a great feedback convo with Sophie.' },
      { day: 8, actions: ['a1', 'a2', 'a4'], note: 'Shared our sprint results in the all-hands.' },
      { day: 12, actions: ['a1', 'a2'], note: '' },
    ]},
    { userId: 'u6', weeks: [
      { day: 1, actions: ['a1', 'a2', 'a3'], note: 'Delegated the client report to Hugo — will follow up.' },
      { day: 4, actions: ['a1', 'a4'], note: 'Recognized Léa\'s work in standup.' },
      { day: 7, actions: ['a1', 'a2', 'a3'], note: '' },
      { day: 11, actions: ['a2', 'a4'], note: 'Stand-ups are becoming second nature.' },
    ]},

    // ● Solid — consistent but not perfect
    { userId: 'u2', weeks: [
      { day: 1, actions: ['a1', 'a3'], note: 'Gave feedback to Antoine about project priorities.' },
      { day: 6, actions: ['a1', 'a2'], note: '' },
      { day: 10, actions: ['a2', 'a4'], note: 'Team stand-ups improving.' },
    ]},
    { userId: 'u5', weeks: [
      { day: 2, actions: ['a1', 'a2', 'a3'], note: 'Strong week — all three core actions.' },
      { day: 7, actions: ['a1', 'a4'], note: '' },
      { day: 11, actions: ['a2', 'a3'], note: 'Delegation is getting smoother.' },
    ]},
    { userId: 'u11', weeks: [
      { day: 2, actions: ['a1', 'a2'], note: 'First real feedback conversation — felt good.' },
      { day: 6, actions: ['a1'], note: '' },
      { day: 10, actions: ['a2', 'a4'], note: 'Shared team progress during retro.' },
    ]},
    { userId: 'u3', weeks: [
      { day: 3, actions: ['a1', 'a2'], note: 'Stand-up format is working well for us.' },
      { day: 8, actions: ['a1', 'a4'], note: '' },
    ]},

    // ◐ Mid — some activity
    { userId: 'u10', weeks: [
      { day: 3, actions: ['a2'], note: 'Tried the stand-up format — shorter than expected.' },
      { day: 9, actions: ['a1', 'a2'], note: '' },
    ]},
    { userId: 'u8', weeks: [
      { day: 4, actions: ['a1', 'a2'], note: 'Gave feedback but felt awkward. Will try again.' },
    ]},
    { userId: 'u12', weeks: [
      { day: 5, actions: ['a2'], note: '' },
    ]},

    // ▽ At Risk — old or edge-of-window
    { userId: 'u4', weeks: [
      { day: 12, actions: ['a1'], note: 'Quick feedback attempt.' },
    ]},
    { userId: 'u7', weeks: [
      { day: 13, actions: ['a2'], note: '' },
    ]},

    // ✕ Inactive — outside window
    { userId: 'u13', weeks: [
      { day: 22, actions: ['a1'], note: '' },
    ]},
  ];

  for (const { userId, weeks } of entries) {
    for (let i = 0; i < weeks.length; i++) {
      const w = weeks[i];
      ins.push({
        id: `ci-${counter++}`,
        userId,
        challengeId: 'ch-1',
        weekNumber: i + 1,
        completedActionIds: w.actions,
        note: w.note,
        createdAt: daysAgo(w.day),
      });
    }
  }

  return ins;
}

/*
 * Barometer responses — varied per user profile:
 *   ★ Top:     start high, climb higher
 *   ● Solid:   start mid, grow steadily
 *   ◐ Mid:     start lower, some growth, some flat
 *   ▽ At Risk: start low, slight movement
 *   ✕ Inactive: only week 1 baseline
 */
function generateBarometerResponses(): BarometerResponse[] {
  const responses: BarometerResponse[] = [];
  let counter = 1;

  const profiles: Record<string, { weeks: number; base: [number, number, number]; growth: [number, number, number] }> = {
    // [confidence, engagement, clarity] base + per-week growth
    u2:  { weeks: 3, base: [3.2, 3.5, 3.0], growth: [0.4, 0.3, 0.5] },
    u5:  { weeks: 3, base: [3.5, 3.8, 3.3], growth: [0.3, 0.2, 0.4] },
    u9:  { weeks: 3, base: [3.8, 4.0, 3.5], growth: [0.3, 0.2, 0.4] },  // ★ starts high
    u6:  { weeks: 3, base: [3.6, 3.9, 3.4], growth: [0.4, 0.3, 0.3] },  // ★
    u3:  { weeks: 3, base: [2.8, 3.2, 2.9], growth: [0.5, 0.4, 0.6] },  // ● good growth
    u11: { weeks: 3, base: [3.0, 3.3, 2.8], growth: [0.4, 0.3, 0.5] },
    u10: { weeks: 3, base: [2.5, 2.8, 2.4], growth: [0.3, 0.2, 0.3] },  // ◐ slow growth
    u8:  { weeks: 2, base: [2.3, 2.6, 2.2], growth: [0.2, 0.3, 0.2] },  // ◐ only 2 weeks
    u12: { weeks: 2, base: [2.4, 2.5, 2.3], growth: [0.2, 0.1, 0.2] },
    u4:  { weeks: 2, base: [2.0, 2.3, 2.0], growth: [0.1, 0.2, 0.1] },  // ▽ minimal growth
    u7:  { weeks: 2, base: [2.1, 2.0, 1.9], growth: [0.1, 0.1, 0.2] },  // ▽
    u13: { weeks: 1, base: [1.8, 2.0, 1.7], growth: [0, 0, 0] },        // ✕ baseline only
  };

  for (const [userId, p] of Object.entries(profiles)) {
    for (let week = 1; week <= p.weeks; week++) {
      const jitter = () => (Math.random() - 0.5) * 0.3;
      responses.push({
        id: `br-${counter++}`,
        userId,
        challengeId: 'ch-1',
        weekNumber: week,
        scores: {
          confidence: Math.min(5, Math.max(1, p.base[0] + (week - 1) * p.growth[0] + jitter())),
          engagement: Math.min(5, Math.max(1, p.base[1] + (week - 1) * p.growth[1] + jitter())),
          clarity: Math.min(5, Math.max(1, p.base[2] + (week - 1) * p.growth[2] + jitter())),
        },
      });
    }
  }
  return responses;
}

/*
 * Per-user seeded unit progress — creates heatmap variety.
 *
 * Distribution per pack (Trust, Disagreement, Decision, Accountability, Results):
 *   ★ u9:  5/5 Active — recent units in all packs
 *   ★ u6:  5/5 Active — recent units in all packs
 *   ● u2:  4/5 Active, 1 At Risk (pack 5 no unit)
 *   ● u5:  5/5 Active
 *   ● u11: 4/5 Active, 1 At Risk (pack 3 no unit)
 *   ● u3:  3/5 Active, 2 At Risk (packs 4,5 no unit)
 *   ◐ u10: 3/5 Active, 1 At Risk, 1 Inactive (packs 4 old, 5 none)
 *   ◐ u8:  2/5 At Risk (units but no recent check-in for other packs), 3 Inactive
 *   ◐ u12: 2/5 Active, 1 At Risk, 2 Inactive
 *   ▽ u4:  1/5 At Risk (has unit, no check-in), 4 Inactive
 *   ▽ u7:  1/5 At Risk, 4 Inactive
 *   ✕ u13: 0/5 all Inactive
 */
export function getSeededUnitProgressForUser(userId: string): Record<string, UnitProgress> {
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

  const completed = (packIdx: number, unitIdx: number, day: number): [string, UnitProgress] => [
    `tp${packIdx}-u${unitIdx}`,
    { status: 'completed' as const, completedAt: daysAgo(day) },
  ];

  // Helper: complete ALL units for a pack (pack sizes: tp1=9, tp2=8, tp3=8, tp4=9, tp5=8)
  const packUnitCounts: Record<number, number> = { 1: 9, 2: 8, 3: 8, 4: 9, 5: 8 };
  const fullPack = (packIdx: number, startDay: number): [string, UnitProgress][] =>
    Array.from({ length: packUnitCounts[packIdx] }, (_, i) =>
      completed(packIdx, i + 1, startDay + i)
    );

  const userPackMap: Record<string, [string, UnitProgress][]> = {
    // ★ Top — full modules completed + deep progress elsewhere
    u9: [
      ...fullPack(1, 1),   // Trust: ALL 9 units → 1 module completed
      ...fullPack(2, 2),   // Disagreement: ALL 8 units → 1 module completed
      completed(3, 1, 3), completed(3, 2, 7), completed(3, 3, 9), completed(3, 4, 11), completed(3, 5, 13),  // Decision: 5/8
      completed(4, 1, 4), completed(4, 2, 8), completed(4, 3, 10), completed(4, 4, 12),  // Accountability: 4/9
      completed(5, 1, 2), completed(5, 2, 6), completed(5, 3, 8),  // Results: 3/8
    ],
    u6: [
      ...fullPack(1, 1),   // Trust: ALL 9 units → 1 module completed
      completed(2, 1, 2), completed(2, 2, 6), completed(2, 3, 9), completed(2, 4, 11), completed(2, 5, 13), completed(2, 6, 14),  // Disagreement: 6/8
      ...fullPack(3, 3),   // Decision: ALL 8 units → 1 module completed
      completed(4, 1, 5), completed(4, 2, 10), completed(4, 3, 12),  // Accountability: 3/9
      completed(5, 1, 4), completed(5, 2, 7),  // Results: 2/8
    ],

    // ● Solid — 1 full module + good progress in others
    u2: [
      ...fullPack(1, 2),   // Trust: ALL 9 units → 1 module completed
      completed(2, 1, 3), completed(2, 2, 8), completed(2, 3, 11), completed(2, 4, 13),  // Disagreement: 4/8
      completed(3, 1, 4), completed(3, 2, 9), completed(3, 3, 12),  // Decision: 3/8
      completed(4, 1, 6), completed(4, 2, 10),  // Accountability: 2/9
      // pack 5: no unit → At Risk
    ],
    u5: [
      ...fullPack(2, 3),   // Disagreement: ALL 8 units → 1 module completed
      completed(1, 1, 1), completed(1, 2, 4), completed(1, 3, 7), completed(1, 4, 10), completed(1, 5, 12),  // Trust: 5/9
      completed(3, 1, 2), completed(3, 2, 6), completed(3, 3, 9),  // Decision: 3/8
      completed(4, 1, 5), completed(4, 2, 8),  // Accountability: 2/9
      completed(5, 1, 3),  // Results: 1/8
    ],
    u11: [
      completed(1, 1, 2), completed(1, 2, 6), completed(1, 3, 9), completed(1, 4, 11),  // Trust: 4/9
      completed(2, 1, 4), completed(2, 2, 8), completed(2, 3, 10),  // Disagreement: 3/8
      // pack 3: no unit → At Risk
      completed(4, 1, 5), completed(4, 2, 10), completed(4, 3, 12),  // Accountability: 3/9
      completed(5, 1, 3), completed(5, 2, 7),  // Results: 2/8
    ],
    u3: [
      completed(1, 1, 3), completed(1, 2, 7), completed(1, 3, 10), completed(1, 4, 12),  // Trust: 4/9
      completed(2, 1, 5), completed(2, 2, 10), completed(2, 3, 13),  // Disagreement: 3/8
      completed(3, 1, 4), completed(3, 2, 9),  // Decision: 2/8
      // packs 4,5: no unit → At Risk
    ],

    // ◐ Mid — some partial progress, no full modules
    u10: [
      completed(1, 1, 4), completed(1, 2, 8), completed(1, 3, 11),  // Trust: 3/9
      completed(2, 1, 6), completed(2, 2, 10),  // Disagreement: 2/8
      completed(3, 1, 8),  // Decision: 1/8
      ['tp4-u1', { status: 'completed', completedAt: daysAgo(16) }],  // old outside window
      // pack 5: nothing
    ],
    u8: [
      completed(1, 1, 5), completed(1, 2, 9),  // Trust: 2/9
      completed(2, 1, 9), completed(2, 2, 12),  // Disagreement: 2/8
      // packs 3,4,5: nothing
    ],
    u12: [
      completed(1, 1, 4), completed(1, 2, 8),  // Trust: 2/9
      completed(2, 1, 7),  // Disagreement: 1/8
      ['tp3-u1', { status: 'completed', completedAt: daysAgo(18) }],  // old outside window
      // packs 4,5: nothing
    ],

    // ▽ At Risk — minimal units, no full modules
    u4: [
      completed(1, 1, 8),  // Trust: 1/9
    ],
    u7: [
      ['tp1-u1', { status: 'completed', completedAt: daysAgo(15) }],  // old
    ],

    // ✕ u13: empty → all Inactive
  };

  const entries = userPackMap[userId];
  if (!entries) return {};
  return Object.fromEntries(entries);
}

/*
 * Current user (collaborator) unit progress — mid-to-good performer.
 * Shows: 3 packs strong, 1 in progress, 1 not started.
 */
export function getSeededCurrentUserUnitProgress(): Record<string, UnitProgress> {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
  return {
    // Pack 1: Trust — 3 units done (strong)
    'tp1-u1': { status: 'completed', completedAt: daysAgo(10) },
    'tp1-u2': { status: 'completed', completedAt: daysAgo(7) },
    'tp1-u3': { status: 'completed', completedAt: daysAgo(3) },
    // Pack 2: Disagreement — 2 units done
    'tp2-u1': { status: 'completed', completedAt: daysAgo(8) },
    'tp2-u2': { status: 'completed', completedAt: daysAgo(4) },
    // Pack 3: Decision — 1 unit done (in progress)
    'tp3-u1': { status: 'completed', completedAt: daysAgo(5) },
    // Pack 4: Accountability — 1 unit done
    'tp4-u1': { status: 'completed', completedAt: daysAgo(2) },
    // Pack 5: Results OS — not started yet
  };
}

export function createInitialState(role: Role = 'manager'): DemoState {
  const roleUserMap: Record<Role, string> = {
    admin: 'u1',
    sponsor: 'u14',
    manager: 'u2',
    participant: 'u3',
  };
  return {
    organization,
    users: [...users],
    teams: [...teams],
    challenges: [...challenges],
    checkIns: generateCheckIns(),
    barometerResponses: generateBarometerResponses(),
    serviceRequests: [...serviceRequests],
    evidenceLog: [],
    coachingCredits: 3,
    currentUserId: roleUserMap[role],
    currentRole: role,
    workspace: null,
    workspaceInvites: [],
    journeyAssignments: [],
    demoRequests: [],
  };
}
