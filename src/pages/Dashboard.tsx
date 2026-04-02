import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/hooks/useAuth';
import { useTeamData } from '@/hooks/useTeamData';
import { useChallengeData, getCurrentWeekFromDates } from '@/hooks/useChallengeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLevelColor } from '@/types/demo';
import { Users, PlayCircle, Grid3X3, Building2, Loader2, CheckCircle2, TrendingUp, Lightbulb, Flame, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';
import { TeamAttentionCard } from '@/components/TeamAttentionCard';
import { WeeklyActionCard } from '@/components/WeeklyActionCard';
import { WeeklyReviewModal } from '@/components/WeeklyReviewModal';
import { SparkNudgeCard } from '@/components/SparkNudgeCard';
import { getWeekRange } from '@/lib/week-utils';
import { supabase } from '@/integrations/supabase/client';

/* ── Team Leadership Dashboard (real DB data, team-scoped) ── */
function AuthenticatedDashboard() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { members, teams, loading: teamLoading } = useTeamData();
  const { activeChallenge, completions } = useChallengeData();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [teamCompletions, setTeamCompletions] = useState<{ userId: string; actionId: string }[]>([]);
  const [teamCompletionsLoading, setTeamCompletionsLoading] = useState(true);

  const isManager = role === 'manager';
  const isAdmin = role === 'admin';
  const isManagerOrAdmin = isManager || isAdmin;
  const weekLabel = getWeekRange().label;
  const teamName = teams.map(t => t.name).join(', ');

  // Determine current week number from challenge dates
  const currentWeek = useMemo(() => {
    if (!activeChallenge?.start_date || !activeChallenge?.end_date || !activeChallenge?.actions?.length) return 0;
    const totalWeeks = Math.max(...activeChallenge.actions.map(a => a.week_number));
    return getCurrentWeekFromDates(activeChallenge.start_date, activeChallenge.end_date, totalWeeks);
  }, [activeChallenge]);

  // Current week's action
  const currentAction = useMemo(() => {
    if (!activeChallenge || currentWeek === 0) return null;
    return activeChallenge.actions.find(a => a.week_number === currentWeek) ?? null;
  }, [activeChallenge, currentWeek]);

  // Fetch all team members' completions for the current action
  useEffect(() => {
    async function fetchTeamCompletions() {
      if (!currentAction || members.length === 0) {
        setTeamCompletions([]);
        setTeamCompletionsLoading(false);
        return;
      }
      const memberIds = members.map(m => m.id);
      const { data } = await supabase
        .from('challenge_action_completions')
        .select('user_id, challenge_action_id')
        .eq('challenge_action_id', currentAction.id)
        .in('user_id', memberIds);
      setTeamCompletions((data ?? []).map(r => ({ userId: r.user_id, actionId: r.challenge_action_id })));
      setTeamCompletionsLoading(false);
    }
    fetchTeamCompletions();
  }, [currentAction, members]);

  // KPI: Participation %
  const completedCount = teamCompletions.length;
  const totalMembers = members.length;
  const participationRate = totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0;

  // KPI: Momentum — consecutive weeks with ≥1 completion (team level)
  const [momentum, setMomentum] = useState(0);
  useEffect(() => {
    async function calcMomentum() {
      if (!activeChallenge?.actions?.length || members.length === 0 || currentWeek === 0) {
        setMomentum(0);
        return;
      }
      const actionIds = activeChallenge.actions
        .filter(a => a.week_number <= currentWeek)
        .sort((a, b) => b.week_number - a.week_number)
        .map(a => a.id);

      if (actionIds.length === 0) { setMomentum(0); return; }

      const memberIds = members.map(m => m.id);
      const { data } = await supabase
        .from('challenge_action_completions')
        .select('challenge_action_id')
        .in('challenge_action_id', actionIds)
        .in('user_id', memberIds);

      const completedActionIds = new Set((data ?? []).map(r => r.challenge_action_id));
      let streak = 0;
      for (const aid of actionIds) {
        if (completedActionIds.has(aid)) streak++;
        else break;
      }
      setMomentum(streak);
    }
    calcMomentum();
  }, [activeChallenge, members, currentWeek]);

  // Leaderboard — top 3, XP from challenge_action_completions
  const [leaderboardXp, setLeaderboardXp] = useState<Map<string, number>>(new Map());
  useEffect(() => {
    async function fetchLeaderboardXp() {
      if (members.length === 0) { setLeaderboardXp(new Map()); return; }
      const memberIds = members.map(m => m.id);
      const { data } = await supabase
        .from('challenge_action_completions')
        .select('user_id, xp_earned')
        .in('user_id', memberIds);
      const xpMap = new Map<string, number>();
      for (const row of (data ?? [])) {
        xpMap.set(row.user_id, (xpMap.get(row.user_id) ?? 0) + row.xp_earned);
      }
      setLeaderboardXp(xpMap);
    }
    fetchLeaderboardXp();
  }, [members, teamCompletions]);

  const leaderboard = useMemo(() => {
    return [...members]
      .map(m => ({ ...m, xp: leaderboardXp.get(m.id) ?? 0 }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 3);
  }, [members, leaderboardXp]);

  // Team Insight — dynamic text
  const insight = useMemo(() => {
    if (totalMembers === 0) return 'No team members found yet.';
    if (teamCompletionsLoading) return 'Loading team data…';
    if (completedCount === 0) return `0 out of ${totalMembers} members completed this week's action. No activity yet this week.`;
    if (completedCount === totalMembers) return `All ${totalMembers} members completed this week's action. Great execution!`;
    if (completedCount / totalMembers >= 0.5) return `${completedCount} out of ${totalMembers} members completed this week's action. Engagement is growing.`;
    return `${completedCount} out of ${totalMembers} members completed this week's action. Consider a follow-up nudge.`;
  }, [completedCount, totalMembers, teamCompletionsLoading]);

  const loading = teamLoading || teamCompletionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Leadership Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{weekLabel}</p>
          {teamName && <p className="text-sm text-muted-foreground mt-1">{isAdmin ? 'Organization-wide' : teamName}</p>}
        </div>
        {isManagerOrAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button className="gap-2" onClick={() => setReviewOpen(true)}>
              <PlayCircle className="h-4 w-4" />
              Run weekly review
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/app/ignite-team?filter=due')}>
              <Grid3X3 className="h-4 w-4" />
              Ignite heatmap
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/app/workspace')}>
                <Building2 className="h-4 w-4" />
                Workspace
              </Button>
            )}
          </div>
        )}
      </div>

      {/* KPI Cards — 4 metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participation</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
            <p className="text-xs text-muted-foreground">of team completed this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount} / {totalMembers}</div>
            <p className="text-xs text-muted-foreground">members this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Momentum</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{momentum} wk</div>
            <p className="text-xs text-muted-foreground">consecutive active weeks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{isAdmin ? 'Org Members' : 'Team Size'}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Insight */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Team Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{insight}</p>
        </CardContent>
      </Card>

      {/* Leaderboard — top 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 3 — Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No team data yet.</p>
          ) : (
            leaderboard.map((member, i) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    #{i + 1}
                  </span>
                  <span className="text-sm">{member.fullName}</span>
                </div>
                <span className="text-sm text-muted-foreground w-14 text-right">{member.xp} XP</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isManagerOrAdmin && (
        <WeeklyReviewModal open={reviewOpen} onOpenChange={setReviewOpen} />
      )}
    </div>
  );
}

/* ── Demo Dashboard (seed data, unchanged) ── */
function DemoDashboard() {
  const { state, currentUser } = useDemo();
  const navigate = useNavigate();
  const [reviewOpen, setReviewOpen] = useState(false);
  const isManager = state.currentRole === 'manager' || state.currentRole === 'admin' || state.currentRole === 'sponsor';
  const activeChallenge = state.challenges.find(c => c.status === 'active');
  const weekLabel = getWeekRange().label;

  const activeUsers = state.users.filter(u => u.role !== 'admin');
  const participantsWithCheckIn = new Set(
    state.checkIns.filter(ci => ci.challengeId === activeChallenge?.id).map(ci => ci.userId)
  );
  const participationRate = activeUsers.length > 0
    ? Math.round((participantsWithCheckIn.size / activeUsers.length) * 100)
    : 0;
  const avgStreak = activeUsers.length > 0
    ? (activeUsers.reduce((s, u) => s + u.streak, 0) / activeUsers.length).toFixed(1)
    : '0';
  const avgXP = activeUsers.length > 0
    ? Math.round(activeUsers.reduce((s, u) => s + u.xp, 0) / activeUsers.length)
    : 0;

  const leaderboard = [...activeUsers]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const handleCopySBI = async () => {
    await copyToClipboard(SBI_TEMPLATE);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{weekLabel}</p>
          {activeChallenge && (
            <p className="text-sm text-muted-foreground mt-1">{activeChallenge.title}</p>
          )}
        </div>
        {isManager && (
          <div className="flex items-center gap-2 shrink-0">
            <Button className="gap-2" onClick={() => setReviewOpen(true)}>
              <PlayCircle className="h-4 w-4" />
              Run weekly review (10 min)
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/app/ignite-team?filter=due')}>
              <Grid3X3 className="h-4 w-4" />
              Open Ignite heatmap
            </Button>
            {/* No workspace activation in demo — demo is fully configured */}
          </div>
        )}
      </div>

      {isManager && (
        <div className="flex items-center">
          <button
            onClick={() => navigate('/app/reports')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            View what changed since last week →
          </button>
        </div>
      )}

      {isManager && <TeamAttentionCard />}

      {/* Spark coaching nudge */}
      <SparkNudgeCard />

      {/* Leadership action this week */}
      <WeeklyActionCard showJourneyLink />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participation</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Streak</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStreak} wk</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. XP</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgXP}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Level</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {currentUser && (
              <div className={`text-2xl font-bold ${getLevelColor(currentUser.level)}`}>
                {currentUser.level}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mini Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 — Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.map((user, i) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  #{i + 1}
                </span>
                <span className="text-sm">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getLevelColor(user.level)} border-current text-xs`}>
                  {user.level}
                </Badge>
                <span className="text-sm text-muted-foreground w-14 text-right">{user.xp} XP</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {isManager && (
        <WeeklyReviewModal open={reviewOpen} onOpenChange={setReviewOpen} />
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { state, isDemoSession } = useDemo();
  
  // Demo session always uses demo data, even if real auth exists
  const useDemo_ = isDemoSession || !user;
  
  // Sponsor gets dedicated executive dashboard
  if (useDemo_ && state.currentRole === 'sponsor') {
    const SponsorDashboard = lazy(() => import('./SponsorDashboard'));
    return (
      <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
        <SponsorDashboard />
      </Suspense>
    );
  }
  
  return useDemo_ ? <DemoDashboard /> : <AuthenticatedDashboard />;
}
