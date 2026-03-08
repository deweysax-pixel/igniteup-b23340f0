import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  teamId: string;
  teamName: string;
  xp: number;
  streak: number;
  level: string;
}

export interface TeamCheckIn {
  id: string;
  userId: string;
  createdAt: string;
  weekNumber: number | null;
  note: string | null;
}

export interface TeamInfo {
  id: string;
  name: string;
}

export function useTeamData() {
  const { user, role } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [checkIns, setCheckIns] = useState<TeamCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get teams the current user belongs to
      const { data: myTeamMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      const myTeamIds = (myTeamMemberships ?? []).map(tm => tm.team_id);

      if (myTeamIds.length === 0) {
        setMembers([]);
        setTeams([]);
        setCheckIns([]);
        setLoading(false);
        return;
      }

      // 2. Fetch team names
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', myTeamIds);

      const teamMap = new Map((teamsData ?? []).map(t => [t.id, t.name]));
      setTeams((teamsData ?? []).map(t => ({ id: t.id, name: t.name })));

      // 3. Fetch all team members in those teams
      const { data: allTm } = await supabase
        .from('team_members')
        .select('user_id, team_id')
        .in('team_id', myTeamIds);

      const memberUserIds = [...new Set((allTm ?? []).map(tm => tm.user_id))];
      if (memberUserIds.length === 0) {
        setMembers([]);
        setCheckIns([]);
        setLoading(false);
        return;
      }

      // 4. Fetch profiles, roles, scores for those members
      const [{ data: profiles }, { data: roles }, { data: scores }, { data: checkInsData }] = await Promise.all([
        supabase.from('profiles').select('id, full_name').in('id', memberUserIds),
        supabase.from('user_roles').select('user_id, role').in('user_id', memberUserIds),
        supabase.from('scores').select('user_id, xp, streak, level').in('user_id', memberUserIds),
        supabase.from('check_ins').select('id, user_id, created_at, week_number, note').in('user_id', memberUserIds),
      ]);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name ?? 'Unknown']));
      const roleMap = new Map((roles ?? []).map(r => [r.user_id, r.role]));
      const scoreMap = new Map((scores ?? []).map(s => [s.user_id, s]));

      // Build member list (deduplicated)
      const memberList: TeamMember[] = [];
      const seen = new Set<string>();
      for (const tm of (allTm ?? [])) {
        if (seen.has(tm.user_id)) continue;
        seen.add(tm.user_id);
        const score = scoreMap.get(tm.user_id);
        memberList.push({
          id: tm.user_id,
          fullName: profileMap.get(tm.user_id) ?? 'Unknown',
          role: roleMap.get(tm.user_id) ?? 'collaborator',
          teamId: tm.team_id,
          teamName: teamMap.get(tm.team_id) ?? 'Unknown',
          xp: score?.xp ?? 0,
          streak: score?.streak ?? 0,
          level: score?.level ?? 'Bronze',
        });
      }

      setMembers(memberList);
      setCheckIns(
        (checkInsData ?? []).map(ci => ({
          id: ci.id,
          userId: ci.user_id,
          createdAt: ci.created_at,
          weekNumber: ci.week_number,
          note: ci.note,
        }))
      );
    } catch (err) {
      console.error('useTeamData error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  return { members, teams, checkIns, loading, reload: load };
}
