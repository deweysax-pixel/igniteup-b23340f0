import { useEffect, useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DbTeam {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

interface DbChallenge {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export default function Admin() {
  const { state } = useDemo();
  const { user, organizationName, profile } = useAuth();
  const isAuthenticated = !!user;

  const [dbTeams, setDbTeams] = useState<DbTeam[]>([]);
  const [dbChallenges, setDbChallenges] = useState<DbChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !profile?.organization_id) return;

    const orgId = profile.organization_id;
    setLoading(true);

    Promise.all([
      supabase
        .from('teams')
        .select('id, name, description')
        .eq('organization_id', orgId),
      supabase
        .from('challenges')
        .select('id, title, description, status, start_date, end_date')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false }),
      supabase
        .from('team_members')
        .select('team_id'),
    ]).then(([teamsRes, challengesRes, membersRes]) => {
      const teams = (teamsRes.data ?? []).map(t => {
        const memberCount = (membersRes.data ?? []).filter(m => m.team_id === t.id).length;
        return { ...t, memberCount };
      });
      setDbTeams(teams);
      setDbChallenges(challengesRes.data ?? []);
      setLoading(false);
    });
  }, [isAuthenticated, profile?.organization_id]);

  const orgName = isAuthenticated ? (organizationName ?? 'Your Organization') : state.organization.name;

  // Demo fallback data
  const demoTeamsData = state.teams.map(team => {
    const members = state.users.filter(u => team.memberIds.includes(u.id));
    const avgXP = members.length > 0 ? Math.round(members.reduce((s, u) => s + u.xp, 0) / members.length) : 0;
    const checkIns = state.checkIns.filter(ci => members.some(m => m.id === ci.userId));
    return { ...team, members, avgXP, totalCheckIns: checkIns.length };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">{orgName}</p>
        </div>
        {isAuthenticated && (
          <Badge variant="outline" className="text-xs">DB-backed</Badge>
        )}
      </div>

      {/* Teams */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Teams</h3>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : isAuthenticated ? (
          dbTeams.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dbTeams.map(team => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <CardDescription>{team.description || 'No description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-semibold">{team.memberCount}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No teams yet. Invite members and create teams to get started.
              </CardContent>
            </Card>
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {demoTeamsData.map(team => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="text-base">{team.name}</CardTitle>
                  <CardDescription>{team.members.length} members · {team.totalCheckIns} check-ins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg. XP</span>
                    <span className="text-lg font-bold">{team.avgXP}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {team.members.map(m => (
                      <div key={m.id} className="flex items-center justify-between text-sm">
                        <span>{m.name}</span>
                        <span className="text-muted-foreground">{m.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Challenge Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isAuthenticated ? (
            dbChallenges.length > 0 ? (
              dbChallenges.map(ch => (
                <div key={ch.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{ch.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ch.start_date ?? '—'} → {ch.end_date ?? '—'}
                    </p>
                  </div>
                  <Badge variant={ch.status === 'active' ? 'default' : 'secondary'}>
                    {ch.status === 'active' ? 'Active' : ch.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No challenges created yet.</p>
            )
          ) : (
            state.challenges.map(ch => (
              <div key={ch.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{ch.title}</p>
                  <p className="text-xs text-muted-foreground">{ch.startDate} → {ch.endDate}</p>
                </div>
                <Badge variant={ch.status === 'active' ? 'default' : 'secondary'}>
                  {ch.status === 'active' ? 'Active' : ch.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
