import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { DemoState, Role, CheckIn, BarometerResponse, ServiceRequest, ServiceRequestType, EvidenceItem, EvidenceType, WorkspaceInfo, WorkspaceInvite, JourneyAssignment } from '@/types/demo';
import { getLevel } from '@/types/demo';
import { createInitialState } from '@/data/demo-seed';

type DemoAction =
  | { type: 'CHECK_IN'; payload: { userId: string; challengeId: string; weekNumber: number; completedActionIds: string[]; note: string } }
  | { type: 'SUBMIT_BAROMETER'; payload: { userId: string; challengeId: string; weekNumber: number; scores: { confidence: number; engagement: number; clarity: number } } }
  | { type: 'SWITCH_ROLE'; payload: Role }
  | { type: 'RESET_DEMO' }
  | { type: 'ADD_SERVICE_REQUEST'; payload: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'> }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { id: string; status: ServiceRequest['status'] } }
  | { type: 'USE_COACHING_CREDIT' }
  | { type: 'ADD_EVIDENCE'; payload: Omit<EvidenceItem, 'id' | 'createdAt'> }
  | { type: 'SAVE_WORKSPACE'; payload: WorkspaceInfo }
  | { type: 'ADD_INVITE'; payload: { name: string; email: string } }
  | { type: 'ASSIGN_JOURNEY'; payload: { journeyTitle: string; memberIds: string[] } };

function recalculateUserXP(state: DemoState, userId: string): DemoState {
  const userCheckIns = state.checkIns.filter(ci => ci.userId === userId);
  const challenge = state.challenges.find(c => c.id === 'ch-1');
  if (!challenge) return state;

  let totalXP = 0;
  for (const ci of userCheckIns) {
    for (const actionId of ci.completedActionIds) {
      const action = challenge.weeklyActions.find(a => a.id === actionId);
      if (action) totalXP += action.points;
    }
  }

  // Calculate streak (consecutive weeks with check-ins)
  const weeks = [...new Set(userCheckIns.map(ci => ci.weekNumber))].sort();
  let streak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (i === weeks.length - 1 || weeks[i] === weeks[i + 1] - 1) {
      streak++;
    } else break;
  }

  return {
    ...state,
    users: state.users.map(u =>
      u.id === userId ? { ...u, xp: totalXP, level: getLevel(totalXP), streak } : u
    ),
  };
}

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'CHECK_IN': {
      const { userId, challengeId, weekNumber, completedActionIds, note } = action.payload;
      const newCheckIn: CheckIn = {
        id: `ci-${Date.now()}`,
        userId,
        challengeId,
        weekNumber,
        completedActionIds,
        note,
        createdAt: new Date().toISOString(),
      };
      const newState = { ...state, checkIns: [...state.checkIns, newCheckIn] };
      return recalculateUserXP(newState, userId);
    }

    case 'SUBMIT_BAROMETER': {
      const { userId, challengeId, weekNumber, scores } = action.payload;
      const newResponse: BarometerResponse = {
        id: `br-${Date.now()}`,
        userId,
        challengeId,
        weekNumber,
        scores,
      };
      return { ...state, barometerResponses: [...state.barometerResponses, newResponse] };
    }

    case 'SWITCH_ROLE':
      return createInitialState(action.payload);

    case 'RESET_DEMO':
      return createInitialState(state.currentRole);

    case 'ADD_SERVICE_REQUEST': {
      const newRequest: ServiceRequest = {
        ...action.payload,
        id: `sr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'new',
      };
      return { ...state, serviceRequests: [...state.serviceRequests, newRequest] };
    }

    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        serviceRequests: state.serviceRequests.map(r =>
          r.id === action.payload.id ? { ...r, status: action.payload.status } : r
        ),
      };

    case 'USE_COACHING_CREDIT':
      return { ...state, coachingCredits: Math.max(0, state.coachingCredits - 1) };

    case 'ADD_EVIDENCE': {
      const newEvidence: EvidenceItem = {
        ...action.payload,
        id: `ev-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      return { ...state, evidenceLog: [...state.evidenceLog, newEvidence] };
    }

    case 'SAVE_WORKSPACE':
      return { ...state, workspace: action.payload };

    case 'ADD_INVITE': {
      const invite: WorkspaceInvite = {
        id: `inv-${Date.now()}`,
        name: action.payload.name,
        email: action.payload.email,
        role: 'participant',
        status: 'pending',
      };
      return { ...state, workspaceInvites: [...state.workspaceInvites, invite] };
    }

    case 'ASSIGN_JOURNEY': {
      const assignment: JourneyAssignment = {
        id: `ja-${Date.now()}`,
        journeyTitle: action.payload.journeyTitle,
        memberIds: action.payload.memberIds,
        assignedAt: new Date().toISOString(),
      };
      return { ...state, journeyAssignments: [...state.journeyAssignments, assignment] };
    }

    default:
      return state;
  }
}

interface DemoContextValue {
  state: DemoState;
  dispatch: React.Dispatch<DemoAction>;
  currentUser: DemoState['users'][0] | undefined;
  switchRole: (role: Role) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children, initialRole = 'manager' }: { children: React.ReactNode; initialRole?: Role }) {
  const [state, dispatch] = useReducer(demoReducer, initialRole, createInitialState);

  const currentUser = state.users.find(u => u.id === state.currentUserId);
  const switchRole = useCallback((role: Role) => dispatch({ type: 'SWITCH_ROLE', payload: role }), []);
  const resetDemo = useCallback(() => dispatch({ type: 'RESET_DEMO' }), []);

  return (
    <DemoContext.Provider value={{ state, dispatch, currentUser, switchRole, resetDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
