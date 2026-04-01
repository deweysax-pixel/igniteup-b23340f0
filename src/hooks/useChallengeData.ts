import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChallengeAction {
  id: string;
  challenge_id: string;
  week_number: number;
  label: string;
  points: number;
  moment_id: string | null;
  description: string | null;
}

export interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  xp_reward: number | null;
  actions: ChallengeAction[];
}

export interface ActionCompletion {
  challenge_action_id: string;
  status: string;
  xp_earned: number;
}

export interface ChallengeAssignmentRow {
  user_id: string | null;
  challenge_id: string;
  status: string | null;
  assigned_at: string;
  team_id: string | null;
}

export function getCurrentWeekFromDates(startDate: string, endDate: string, totalWeeks: number): number {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 0;
  if (now > end) return totalWeeks;
  const elapsed = now.getTime() - start.getTime();
  const total = end.getTime() - start.getTime();
  const weekLen = total / totalWeeks;
  return Math.min(Math.floor(elapsed / weekLen) + 1, totalWeeks);
}

export function useChallengeData() {
  const { user, profile } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [completions, setCompletions] = useState<ActionCompletion[]>([]);
  const [assignments, setAssignments] = useState<ChallengeAssignmentRow[]>([]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setChallenges([]);
      setCompletions([]);
      setAssignments([]);
      setTeamIds([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const [{ data: teamRows }, { data: ownAssignmentRows }, { data: completionRows }] = await Promise.all([
      supabase.from('team_members').select('team_id').eq('user_id', user.id),
      supabase
        .from('challenge_assignments')
        .select('user_id, challenge_id, status, assigned_at, team_id')
        .eq('user_id', user.id),
      supabase.from('challenge_action_completions').select('challenge_action_id, status, xp_earned').eq('user_id', user.id),
    ]);

    const currentTeamIds = (teamRows ?? []).map(row => row.team_id);

    const { data: teamAssignmentRows } = currentTeamIds.length > 0
      ? await supabase
          .from('challenge_assignments')
          .select('user_id, challenge_id, status, assigned_at, team_id')
          .in('team_id', currentTeamIds)
      : { data: [] as ChallengeAssignmentRow[] };

    const mergedAssignments = [...(ownAssignmentRows ?? []), ...(teamAssignmentRows ?? [])] as ChallengeAssignmentRow[];
    const dedupedAssignments = Array.from(
      new Map(
        mergedAssignments.map(row => [`${row.challenge_id}:${row.user_id ?? 'team'}:${row.team_id ?? 'none'}`, row]),
      ).values(),
    );

    const challengeIds = Array.from(new Set(dedupedAssignments.map(row => row.challenge_id)));

    const [{ data: challengeRows }, { data: actionRows }] = challengeIds.length > 0
      ? await Promise.all([
          supabase
            .from('challenges')
            .select('id, title, description, status, start_date, end_date, xp_reward')
            .in('id', challengeIds)
            .order('created_at', { ascending: false }),
          supabase
            .from('challenge_actions')
            .select('id, challenge_id, week_number, label, points, moment_id')
            .in('challenge_id', challengeIds)
            .order('week_number'),
        ])
      : [{ data: [] as ChallengeRow[] }, { data: [] as ChallengeAction[] }];

    const actions = (actionRows ?? []) as ChallengeAction[];
    const merged: ChallengeRow[] = (challengeRows ?? []).map(ch => ({
      ...ch,
      actions: actions.filter(a => a.challenge_id === ch.id),
    }));

    console.log('[useChallengeData] resolved data', {
      currentUserId: user.id,
      currentOrganizationId: profile?.organization_id ?? null,
      currentTeamIds,
      challengeRows: merged,
      assignmentRows: dedupedAssignments,
    });

    setChallenges(merged);
    setCompletions((completionRows ?? []) as ActionCompletion[]);
    setAssignments(dedupedAssignments);
    setTeamIds(currentTeamIds);
    setLoading(false);
  }, [profile?.organization_id, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markActionDone = useCallback(async (actionId: string, xpEarned: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('challenge_action_completions')
      .insert({
        user_id: user.id,
        challenge_action_id: actionId,
        status: 'completed',
        xp_earned: xpEarned,
      });

    if (!error) {
      // Optimistic update
      setCompletions(prev => [...prev, { challenge_action_id: actionId, status: 'completed', xp_earned: xpEarned }]);
    }

    return { error };
  }, [user]);

  const isActionCompleted = useCallback((actionId: string) => {
    return completions.some(c => c.challenge_action_id === actionId);
  }, [completions]);

  const totalXpEarned = completions.reduce((sum, c) => sum + c.xp_earned, 0);

  const activeChallenge = challenges.find(ch => ch.status === 'active') ?? null;

  return {
    challenges,
    activeChallenge,
    completions,
    assignments,
    teamIds,
    loading,
    markActionDone,
    isActionCompleted,
    totalXpEarned,
    refetch: fetchData,
  };
}
