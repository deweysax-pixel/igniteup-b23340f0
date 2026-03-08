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

/**
 * Fetches team-scoped data for managers, org-wide data for admins.
 * Pass `forceOrgWide: true` to always fetch org-wide regardless of role.
 */
export function useTeamData(options?: { forceOrgWide?: boolean }) {
  const { user, role } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [checkIns, setCheckIns] = useState<TeamCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const isOrgWide = options?.forceOrgWide || role === 'admin';

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (isOrgWide) {
        // Admin: fetch ALL org teams and members
        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name');

        const allTeams = teamsData ?? [];
        const allTeamIds = allTeams.map(t => t.id);
        const teamMap = new Map(allTeams.map(t => [t.id, t.name]));
        setTeams(allTeams.map(t => ({ id: t.id, name: t.name })));

        if (allTeamIds.length === 0) {
          // Still fetch org profiles without teams
          const { data: orgProfiles } = await supabase
            .from('profiles')
            .select('id, full_name');

          if (!orgProfiles || orgProfiles.length === 0) {
            setMembers([]);
            setCheckIns([]);
            setLoading(false);
            return;
          }

          const memberUserIds = orgProfiles.map(p => p.id);
          const [{ data: roles }, { data: scores }, { data: checkInsData }] = await Promise.all([
            supabase.from('user_roles').select('user_id, role').in('user_id', memberUserIds),
            supabase.from('scores').select('user_id, xp, streak, level').in('user_id', memberUserIds),
            supabase.from('check_ins').select('id, user_id, created_at, week_number, note').in('user_id', memberUserIds),
          ]);

          const roleMap = new Map((roles ?? []).map(r => [r.user_id, r.role]));
          const scoreMap = new Map((scores ?? []).map(s => [s.user_id, s]));

          setMembers(orgProfiles.map(p => {
            const score = scoreMap.get(p.id);
            return {
              id: p.id,
              fullName: p.full_name ?? 'Unknown',
              role: roleMap.get(p.id) ?? 'collaborator',
              teamId: '',
              teamName: 'No team',
              xp: score?.xp ?? 0,
              streak: score?.streak ?? 0,
              level: score?.level ?? 'Bronze',
            };
          }));

          setCheckIns((checkInsData ?? []).map(ci => ({
            id: ci.id, userId: ci.user_id, createdAt: ci.created_at, weekNumber: ci.week_number, note: ci.note,
          })));
          setLoading(false);
          return;
        }

        // Fetch all team members across all org teams
        const { data: allTm } = await supabase
          .from('team_members')
          .select('user_id, team_id')
          .in('team_id', allTeamIds);

        const memberUserIds = [...new Set((allTm ?? []).map(tm => tm.user_id))];

        if (memberUserIds.length === 0) {
          setMembers([]);
          setCheckIns([]);
          setLoading(false);
          return;
        }

        const [{ data: profiles }, { data: roles }, { data: scores }, { data: checkInsData }] = await Promise.all([
          supabase.from('profiles').select('id, full_name').in('id', memberUserIds),
          supabase.from('user_roles').select('user_id, role').in('user_id', memberUserIds),
          supabase.from('scores').select('user_id, xp, streak, level').in('user_id', memberUserIds),
          supabase.from('check_ins').select('id, user_id, created_at, week_number, note').in('user_id', memberUserIds),
        ]);

        const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name ?? 'Unknown']));
        const roleMap = new Map((roles ?? []).map(r => [r.user_id, r.role]));
        const scoreMap = new Map((scores ?? []).map(s => [s.user_id, s]));

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
        setCheckIns((checkInsData ?? []).map(ci => ({
          id: ci.id, userId: ci.user_id, createdAt: ci.created_at, weekNumber: ci.week_number, note: ci.note,
        })));
      } else {
        // Non-admin: team-scoped (original logic)
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

        const { data: teamsData } = await supabase
          .from('teams')
          .select('id, name')
          .in('id', myTeamIds);

        const teamMap = new Map((teamsData ?? []).map(t => [t.id, t.name]));
        setTeams((teamsData ?? []).map(t => ({ id: t.id, name: t.name })));

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

        const [{ data: profiles }, { data: roles }, { data: scores }, { data: checkInsData }] = await Promise.all([
          supabase.from('profiles').select('id, full_name').in('id', memberUserIds),
          supabase.from('user_roles').select('user_id, role').in('user_id', memberUserIds),
          supabase.from('scores').select('user_id, xp, streak, level').in('user_id', memberUserIds),
          supabase.from('check_ins').select('id, user_id, created_at, week_number, note').in('user_id', memberUserIds),
        ]);

        const profileMap = new Map((profiles ?? []).map(p => [p.id, p.full_name ?? 'Unknown']));
        const roleMap = new Map((roles ?? []).map(r => [r.user_id, r.role]));
        const scoreMap = new Map((scores ?? []).map(s => [s.user_id, s]));

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
        setCheckIns((checkInsData ?? []).map(ci => ({
          id: ci.id, userId: ci.user_id, createdAt: ci.created_at, weekNumber: ci.week_number, note: ci.note,
        })));
      }
    } catch (err) {
      console.error('useTeamData error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isOrgWide]);

  useEffect(() => { load(); }, [load]);

  return { members, teams, checkIns, loading, reload: load };
}
