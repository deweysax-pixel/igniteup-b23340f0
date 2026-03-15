import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/hooks/useAuth';
import { useTeamData } from '@/hooks/useTeamData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLevelColor } from '@/types/demo';
import { TrendingUp, Users, Flame, Trophy, Copy, BookOpen, PlayCircle, Grid3X3, FileBarChart, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';
import { TeamAttentionCard } from '@/components/TeamAttentionCard';
import { WeeklyActionCard } from '@/components/WeeklyActionCard';
import { WeeklyReviewModal } from '@/components/WeeklyReviewModal';
import { getWeekRange } from '@/lib/week-utils';

/* ── Authenticated Dashboard (real DB data, team-scoped for managers) ── */
function AuthenticatedDashboard() {
  const navigate = useNavigate();
  const { role, profile } = useAuth();
  const { members, teams, checkIns, loading } = useTeamData();
  const [reviewOpen, setReviewOpen] = useState(false);
  const isManager = role === 'manager';
  const isAdmin = role === 'admin';
  const isManagerOrAdmin = isManager || isAdmin;
  const weekLabel = getWeekRange().label;
  const teamName = teams.map(t => t.name).join(', ');

  const participationRate = useMemo(() => {
    if (members.length === 0) return 0;
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const withCheckIn = new Set(
      checkIns
        .filter(ci => new Date(ci.createdAt).getTime() >= sevenDaysAgo)
        .map(ci => ci.userId)
    );
    const active = members.filter(m => withCheckIn.has(m.id)).length;
    return Math.round((active / members.length) * 100);
  }, [members, checkIns]);

  const avgStreak = useMemo(() => {
    if (members.length === 0) return '0';
    return (members.reduce((s, m) => s + m.streak, 0) / members.length).toFixed(1);
  }, [members]);

  const avgXP = useMemo(() => {
    if (members.length === 0) return 0;
    return Math.round(members.reduce((s, m) => s + m.xp, 0) / members.length);
  }, [members]);

  const leaderboard = useMemo(() => {
    return [...members].sort((a, b) => b.xp - a.xp).slice(0, 5);
  }, [members]);

  const handleCopySBI = async () => {
    await copyToClipboard(SBI_TEMPLATE);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{weekLabel}</p>
          {teamName && <p className="text-sm text-muted-foreground mt-1">{isAdmin ? 'Organization-wide' : teamName}</p>}
        </div>
        {isManagerOrAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button className="gap-2" onClick={() => setReviewOpen(true)}>
              <PlayCircle className="h-4 w-4" />
              Run weekly review (10 min)
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/app/ignite-team?filter=due')}>
              <Grid3X3 className="h-4 w-4" />
              Open Ignite heatmap
            </Button>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/app/workspace')}>
                <Building2 className="h-4 w-4" />
                Activate workspace
              </Button>
            )}
          </div>
        )}
      </div>

      {isManagerOrAdmin && (
        <div className="flex items-center">
          <button
            onClick={() => navigate('/app/reports')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
          >
            View what changed since last week →
          </button>
        </div>
      )}

      {/* This week's focus */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">This week's focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Goal:</span>
            <span className="text-muted-foreground">1 feedback conversation</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Tip:</span>
            <span className="text-muted-foreground">Keep it under 2 minutes.</span>
          </div>
          {isManagerOrAdmin && (
            <p className="text-xs text-muted-foreground italic">
              Suggested move: pick 1 member who's Due and run 1 feedback conversation.
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="default" className="gap-2" onClick={() => navigate('/app/playbooks')}>
              <BookOpen className="h-3.5 w-3.5" />
              Open Weekly Feedback Playbook
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={handleCopySBI}>
              <Copy className="h-3.5 w-3.5" />
              Copy SBI Template
            </Button>
            {isManagerOrAdmin && (
              <Button size="sm" variant="secondary" className="gap-2" onClick={() => navigate('/app/ignite-team?filter=due')}>
                <Users className="h-3.5 w-3.5" />
                Pick a Due member
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participation</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
            <p className="text-xs text-muted-foreground">{members.length} {isAdmin ? 'member' : 'team member'}{members.length !== 1 ? 's' : ''}</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">{isAdmin ? 'Org Members' : 'Team Size'}</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Leaderboard — team-scoped */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 — Leaderboard</CardTitle>
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getLevelColor(member.level as any)} border-current text-xs`}>
                    {member.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground w-14 text-right">{member.xp} XP</span>
                </div>
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

      {/* Leadership action this week */}
      <WeeklyActionCard showJourneyLink />



        </CardContent>
      </Card>

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
