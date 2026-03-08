import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
import { useTeamData } from '@/hooks/useTeamData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Flame, TrendingUp, AlertTriangle, ShieldCheck, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { getWeekRange } from '@/lib/week-utils';

type TeamSummary = {
  id: string;
  name: string;
  managerName: string | null;
  memberCount: number;
  checkedInCount: number;
  avgXP: number;
  avgStreak: number;
  status: 'healthy' | 'attention' | 'critical';
};

function AuthenticatedAdminTeams() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { members, teams, checkIns, loading } = useTeamData();
  const weekLabel = getWeekRange().label;

  const teamSummaries: TeamSummary[] = useMemo(() => {
    if (teams.length === 0) return [];

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentCheckInUserIds = new Set(
      checkIns
        .filter(ci => new Date(ci.createdAt).getTime() >= sevenDaysAgo)
        .map(ci => ci.userId)
    );

    return teams.map(team => {
      const teamMembers = members.filter(m => m.teamId === team.id);
      const manager = teamMembers.find(m => m.role === 'manager' || m.role === 'admin');
      const checkedIn = teamMembers.filter(m => recentCheckInUserIds.has(m.id));
      const avgXP = teamMembers.length > 0
        ? Math.round(teamMembers.reduce((s, m) => s + m.xp, 0) / teamMembers.length)
        : 0;
      const avgStreak = teamMembers.length > 0
        ? Math.round(teamMembers.reduce((s, m) => s + m.streak, 0) / teamMembers.length * 10) / 10
        : 0;

      const participationRate = teamMembers.length > 0
        ? checkedIn.length / teamMembers.length
        : 0;

      let status: 'healthy' | 'attention' | 'critical' = 'healthy';
      if (participationRate < 0.3) status = 'critical';
      else if (participationRate < 0.6) status = 'attention';

      return {
        id: team.id,
        name: team.name,
        managerName: manager?.fullName ?? null,
        memberCount: teamMembers.length,
        checkedInCount: checkedIn.length,
        avgXP,
        avgStreak,
        status,
      };
    });
  }, [teams, members, checkIns]);

  const statusConfig = {
    healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: ShieldCheck },
    attention: { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
    critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
  };

  const statusCounts = useMemo(() => {
    const counts = { healthy: 0, attention: 0, critical: 0 };
    teamSummaries.forEach(t => counts[t.status]++);
    return counts;
  }, [teamSummaries]);

  const totalMembers = useMemo(() => members.length, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
        <p className="text-sm text-muted-foreground mt-1">Organization-wide team monitoring</p>
        <p className="text-xs text-muted-foreground">{weekLabel}</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{teams.length}</p>
              <p className="text-xs text-muted-foreground">Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{totalMembers}</p>
              <p className="text-xs text-muted-foreground">Total members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{statusCounts.healthy}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{statusCounts.attention + statusCounts.critical}</p>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams table */}
      {teamSummaries.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">All Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Check-ins (7d)</TableHead>
                  <TableHead className="text-center">Avg XP</TableHead>
                  <TableHead className="text-center">Avg Streak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamSummaries.map(team => {
                  const cfg = statusConfig[team.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <TableRow key={team.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/app/team?team=${team.id}`)}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{team.managerName ?? <span className="italic">No manager</span>}</TableCell>
                      <TableCell className="text-center">{team.memberCount}</TableCell>
                      <TableCell className="text-center">
                        <span className={team.checkedInCount === 0 && team.memberCount > 0 ? 'text-red-400' : ''}>
                          {team.checkedInCount}/{team.memberCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{team.avgXP}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="h-3 w-3 text-muted-foreground" />
                          {team.avgStreak}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${cfg.color} border-current text-xs gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              No teams found. Create teams in the Workspace to start monitoring.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Demo Teams (seed data) ── */
function DemoAdminTeams() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const weekLabel = getWeekRange().label;

  const activeUsers = state.users.filter(u => u.role !== 'admin' && u.role !== 'sponsor');

  const teamSummaries = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const recentCheckInUserIds = new Set(
      state.checkIns
        .filter(ci => new Date(ci.createdAt).getTime() >= sevenDaysAgo)
        .map(ci => ci.userId)
    );

    return state.teams.map(team => {
      const teamMembers = activeUsers.filter(u => u.teamId === team.id);
      const manager = state.users.find(u => u.id === team.managerId);
      const checkedIn = teamMembers.filter(u => recentCheckInUserIds.has(u.id));
      const avgXP = teamMembers.length > 0
        ? Math.round(teamMembers.reduce((s, u) => s + u.xp, 0) / teamMembers.length)
        : 0;
      const avgStreak = teamMembers.length > 0
        ? Math.round(teamMembers.reduce((s, u) => s + u.streak, 0) / teamMembers.length * 10) / 10
        : 0;

      const participationRate = teamMembers.length > 0
        ? checkedIn.length / teamMembers.length
        : 0;

      let status: 'healthy' | 'attention' | 'critical' = 'healthy';
      if (participationRate < 0.3) status = 'critical';
      else if (participationRate < 0.6) status = 'attention';

      return {
        id: team.id,
        name: team.name,
        managerName: manager?.name ?? null,
        memberCount: teamMembers.length,
        checkedInCount: checkedIn.length,
        avgXP,
        avgStreak,
        status,
      };
    });
  }, [state.teams, activeUsers, state.checkIns, state.users]);

  const statusConfig = {
    healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: ShieldCheck },
    attention: { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
    critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
  };

  const statusCounts = useMemo(() => {
    const counts = { healthy: 0, attention: 0, critical: 0 };
    teamSummaries.forEach(t => counts[t.status]++);
    return counts;
  }, [teamSummaries]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
        <p className="text-sm text-muted-foreground mt-1">Organization-wide team monitoring</p>
        <p className="text-xs text-muted-foreground">{weekLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{state.teams.length}</p>
              <p className="text-xs text-muted-foreground">Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="text-2xl font-bold">{activeUsers.length}</p>
              <p className="text-xs text-muted-foreground">Total members</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{statusCounts.healthy}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-2xl font-bold">{statusCounts.attention + statusCounts.critical}</p>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-center">Members</TableHead>
                <TableHead className="text-center">Check-ins (7d)</TableHead>
                <TableHead className="text-center">Avg XP</TableHead>
                <TableHead className="text-center">Avg Streak</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamSummaries.map(team => {
                const cfg = statusConfig[team.status];
                const StatusIcon = cfg.icon;
                return (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{team.managerName ?? <span className="italic">No manager</span>}</TableCell>
                    <TableCell className="text-center">{team.memberCount}</TableCell>
                    <TableCell className="text-center">{team.checkedInCount}/{team.memberCount}</TableCell>
                    <TableCell className="text-center">{team.avgXP}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1">
                        <Flame className="h-3 w-3 text-muted-foreground" />
                        {team.avgStreak}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${cfg.color} border-current text-xs gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminTeams() {
  const { user } = useAuth();
  const { isDemoSession } = useDemo();
  return (isDemoSession || !user) ? <DemoAdminTeams /> : <AuthenticatedAdminTeams />;
}
