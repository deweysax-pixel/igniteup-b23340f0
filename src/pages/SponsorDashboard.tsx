import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  TrendingUp,
  Flame,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Activity,
  Target,
  Shield,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const dimensions = [
  { key: 'confidence' as const, label: 'Confidence' },
  { key: 'engagement' as const, label: 'Engagement' },
  { key: 'clarity' as const, label: 'Clarity' },
];

export default function SponsorDashboard() {
  const { state } = useDemo();
  const navigate = useNavigate();

  const activeChallenge = state.challenges.find(c => c.status === 'active');
  const upcomingChallenge = state.challenges.find(c => c.status === 'upcoming');
  const activeUsers = state.users.filter(u => u.role !== 'admin' && u.role !== 'sponsor');

  // ── Org-wide KPIs ──
  const totalMembers = activeUsers.length;
  const participantsWithCheckIn = useMemo(() => {
    const fourteenDaysAgo = Date.now() - 14 * 86400000;
    return new Set(
      state.checkIns
        .filter(ci => new Date(ci.createdAt).getTime() >= fourteenDaysAgo)
        .map(ci => ci.userId)
    );
  }, [state.checkIns]);

  const participationRate = totalMembers > 0
    ? Math.round((participantsWithCheckIn.size / totalMembers) * 100)
    : 0;

  const avgXP = totalMembers > 0
    ? Math.round(activeUsers.reduce((s, u) => s + u.xp, 0) / totalMembers)
    : 0;

  const avgStreak = totalMembers > 0
    ? +(activeUsers.reduce((s, u) => s + u.streak, 0) / totalMembers).toFixed(1)
    : 0;

  const activeCount = activeUsers.filter(u => participantsWithCheckIn.has(u.id)).length;
  const atRiskCount = activeUsers.filter(u => !participantsWithCheckIn.has(u.id) && u.streak > 0).length;
  const inactiveCount = totalMembers - activeCount - atRiskCount;

  // ── Team health ──
  const teamHealth = useMemo(() => {
    return state.teams.map(team => {
      const teamUsers = activeUsers.filter(u => u.teamId === team.id);
      const teamActiveCount = teamUsers.filter(u => participantsWithCheckIn.has(u.id)).length;
      const rate = teamUsers.length > 0 ? Math.round((teamActiveCount / teamUsers.length) * 100) : 0;
      const teamAvgXP = teamUsers.length > 0
        ? Math.round(teamUsers.reduce((s, u) => s + u.xp, 0) / teamUsers.length)
        : 0;
      const manager = state.users.find(u => u.id === team.managerId);
      return {
        id: team.id,
        name: team.name,
        manager: manager?.name || '—',
        members: teamUsers.length,
        participationRate: rate,
        avgXP: teamAvgXP,
        status: rate >= 60 ? 'healthy' : rate >= 30 ? 'attention' : 'critical',
      };
    });
  }, [state.teams, activeUsers, participantsWithCheckIn, state.users]);

  // ── ROI Barometer aggregate ──
  const barometerData = useMemo(() => {
    const responses = state.barometerResponses.filter(r => r.challengeId === activeChallenge?.id);
    if (responses.length === 0) return null;
    const maxWeek = Math.max(...responses.map(r => r.weekNumber));
    return dimensions.map(d => {
      const week1 = responses.filter(r => r.weekNumber === 1);
      const latest = responses.filter(r => r.weekNumber === maxWeek);
      const baseline = week1.length > 0 ? week1.reduce((s, r) => s + r.scores[d.key], 0) / week1.length : 0;
      const current = latest.length > 0 ? latest.reduce((s, r) => s + r.scores[d.key], 0) / latest.length : 0;
      return {
        dimension: d.label,
        'Baseline': +baseline.toFixed(1),
        'Current': +current.toFixed(1),
        delta: +(current - baseline).toFixed(1),
      };
    });
  }, [state.barometerResponses, activeChallenge]);

  // ── Service requests summary ──
  const openRequests = state.serviceRequests.filter(r => r.status !== 'closed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Executive Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {state.organization.name} — Program health at a glance
        </p>
      </div>

      {/* Status ribbon */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participation</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
            <p className="text-xs text-muted-foreground">{totalMembers} members enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{activeCount}</div>
            <p className="text-xs text-muted-foreground">checked in (14d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{atRiskCount}</div>
            <p className="text-xs text-muted-foreground">no recent check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. XP</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgXP}</div>
            <p className="text-xs text-muted-foreground">avg streak: {avgStreak} wk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Service Requests</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRequests}</div>
            <p className="text-xs text-muted-foreground">open requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenge */}
      {activeChallenge && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Active Challenge</CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">In progress</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium">{activeChallenge.title}</p>
            <p className="text-xs text-muted-foreground">{activeChallenge.description}</p>
            <div className="flex items-center gap-4 pt-1">
              <div className="text-xs text-muted-foreground">
                {activeChallenge.startDate} → {activeChallenge.endDate}
              </div>
              <div className="text-xs">
                <span className="font-medium text-primary">{participantsWithCheckIn.size}</span>
                <span className="text-muted-foreground"> / {totalMembers} participated</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Health Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Team Health</h3>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate('/app/teams')}>
            View all teams <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {teamHealth.map(team => (
            <Card key={team.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{team.name}</p>
                    <p className="text-xs text-muted-foreground">{team.manager} · {team.members} members</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      team.status === 'healthy'
                        ? 'border-emerald-500/50 text-emerald-500'
                        : team.status === 'attention'
                        ? 'border-amber-500/50 text-amber-500'
                        : 'border-destructive/50 text-destructive'
                    }
                  >
                    {team.status === 'healthy' ? 'Healthy' : team.status === 'attention' ? 'Needs Attention' : 'Critical'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Participation</span>
                    <span className="font-medium">{team.participationRate}%</span>
                  </div>
                  <Progress value={team.participationRate} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Avg. XP: <span className="font-medium text-foreground">{team.avgXP}</span></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ROI Barometer */}
      {barometerData && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">ROI Barometer — Leadership Impact</h3>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => navigate('/app/barometer')}>
              Full barometer <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Deltas */}
                <div className="space-y-4">
                  {barometerData.map(d => (
                    <div key={d.dimension} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{d.dimension}</span>
                        <span className={`text-sm font-bold ${d.delta > 0 ? 'text-emerald-500' : d.delta < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {d.delta > 0 ? '+' : ''}{d.delta}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Baseline: {d['Baseline']}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>Current: {d['Current']}</span>
                      </div>
                      <Progress value={(d['Current'] / 5) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barometerData} barGap={4}>
                    <XAxis dataKey="dimension" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Baseline" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Current" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming */}
      {upcomingChallenge && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                </div>
                <p className="text-sm font-medium">{upcomingChallenge.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {upcomingChallenge.startDate} → {upcomingChallenge.endDate}
                </p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
