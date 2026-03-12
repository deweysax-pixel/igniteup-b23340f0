export type Role = 'admin' | 'sponsor' | 'manager' | 'participant';

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

export type LeadershipThemeId = 'direction' | 'alignment' | 'ownership' | 'energy';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  themeId?: LeadershipThemeId;
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

export type ServiceRequestType = 'coaching_session' | 'ask_expert' | 'team_workshop';
export type ServiceRequestStatus = 'new' | 'in_review' | 'scheduled' | 'closed';

export interface ServiceRequest {
  id: string;
  createdAt: string;
  requesterName: string;
  requesterEmail?: string;
  role: Role;
  team?: string;
  requestType: ServiceRequestType;
  moduleId?: string;
  moduleTitle?: string;
  message: string;
  status: ServiceRequestStatus;
  preferredTimeframe?: string;
}

export type EvidenceType = 'script_used' | 'practice_done' | 'reflection';

export interface EvidenceItem {
  id: string;
  createdAt: string;
  userId: string;
  type: EvidenceType;
  packId?: string;
  moduleId?: string;
  content: string;
}

export interface WorkspaceInvite {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'pending';
}

export interface JourneyAssignment {
  id: string;
  journeyTitle: string;
  memberIds: string[];
  assignedAt: string;
}

export type DemoRequestStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export interface DemoRequest {
  id: string;
  createdAt: string;
  fullName: string;
  workEmail: string;
  company: string;
  role: string;
  teamSize: string;
  biggestChallenge: string;
  notes: string;
  source: string;
  status: DemoRequestStatus;
  internalNotes: string;
}

export interface WorkspaceInfo {
  name: string;
  industry: string;
  teamSize: string;
}

export interface DemoState {
  organization: Organization;
  users: User[];
  teams: Team[];
  challenges: Challenge[];
  checkIns: CheckIn[];
  barometerResponses: BarometerResponse[];
  serviceRequests: ServiceRequest[];
  evidenceLog: EvidenceItem[];
  coachingCredits: number;
  currentUserId: string;
  currentRole: Role;
  workspace: WorkspaceInfo | null;
  workspaceInvites: WorkspaceInvite[];
  journeyAssignments: JourneyAssignment[];
  demoRequests: DemoRequest[];
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
