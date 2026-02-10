export type Role = 'admin' | 'manager' | 'participant';

export type Level = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type ChallengeStatus = 'active' | 'upcoming' | 'completed';

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  teamId: string;
  avatarUrl?: string;
  level: Level;
  xp: number;
  streak: number;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  memberIds: string[];
}

export interface Action {
  id: string;
  label: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  weeklyActions: Action[];
}

export interface CheckIn {
  id: string;
  userId: string;
  challengeId: string;
  weekNumber: number;
  completedActionIds: string[];
  note: string;
  createdAt: string;
}

export interface BarometerResponse {
  id: string;
  userId: string;
  challengeId: string;
  weekNumber: number;
  scores: {
    confidence: number;
    engagement: number;
    clarity: number;
  };
}

export interface LeaderboardEntry {
  user: User;
  totalPoints: number;
  level: Level;
  streak: number;
  rank: number;
}

export interface BarometerAggregate {
  dimension: 'confidence' | 'engagement' | 'clarity';
  baseline: number;
  current: number;
  delta: number;
}

export interface DemoState {
  organization: Organization;
  users: User[];
  teams: Team[];
  challenges: Challenge[];
  checkIns: CheckIn[];
  barometerResponses: BarometerResponse[];
  currentUserId: string;
  currentRole: Role;
}

export function getLevel(xp: number): Level {
  if (xp >= 500) return 'Platinum';
  if (xp >= 250) return 'Gold';
  if (xp >= 100) return 'Silver';
  return 'Bronze';
}

export function getLevelColor(level: Level): string {
  switch (level) {
    case 'Platinum': return 'text-purple-300';
    case 'Gold': return 'text-yellow-400';
    case 'Silver': return 'text-gray-300';
    case 'Bronze': return 'text-orange-400';
  }
}
