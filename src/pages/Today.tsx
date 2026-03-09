import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { useIgniteStatus, usePackStatuses, STATUS_CONFIG, IGNITE_PACKS, computePackStatusForUser } from '@/pages/Ignite';
import type { IgniteStatus } from '@/pages/Ignite';
import { Flame, ClipboardCheck, BookOpen, Compass, Sparkles, ArrowRight, ShieldCheck, AlertTriangle, Package, Trophy, TrendingUp, Zap, Users, BarChart3, Eye } from 'lucide-react';
import { getWeekRange } from '@/lib/week-utils';
import { GlossaryTip } from '@/components/GlossaryTip';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';

type RuleId = 'no_journey' | 'ignite_renewal' | 'low_signal' | 'momentum';

interface TodayDecision {
  rule: RuleId;
  focus: string;
  why: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel: string;
  secondaryTo: string;
}

function useTodayDecision(): TodayDecision {
  const { state, currentUser } = useDemo();
  const { journey, firstIncompleteModule } = useJourney();
  const { status: igniteStatus } = useIgniteStatus();
  const packStatuses = usePackStatuses();
  const isManager = state.currentRole === 'manager';

  return useMemo(() => {
    // RULE 1: No journey
    const hasJourney = journey.steps.length > 0;
    if (!hasJourney) {
      return {
        rule: 'no_journey',
        focus: 'Build your journey to get momentum.',
        why: 'A clear path turns intention into weekly action.',
        primaryLabel: 'Build my journey',
        primaryTo: '/app/onboarding',
        secondaryLabel: 'Browse catalog',
        secondaryTo: '/app/catalog',
      };
    }

    // RULE 2: Ignite renewal due
    const duePacks = packStatuses.filter(p => p.status === 'at_risk' || p.status === 'inactive').length;
    if (igniteStatus === 'at_risk' || igniteStatus === 'inactive' || duePacks >= 1) {
      return {
        rule: 'ignite_renewal',
        focus: 'Renew your Ignite status (5 minutes).',
        why: 'Complete 1 unit in a Due pack + submit one check-in to return to Active.',
        primaryLabel: isManager ? 'Review Due' : 'Renew now',
        primaryTo: isManager ? '/app/ignite-team?filter=due' : '/app/ignite',
        secondaryLabel: 'Do check-in (60s)',
        secondaryTo: '/app/checkin',
      };
    }

    // RULE 3: Low practice signal
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const recentCheckIn = state.checkIns.some(
      ci => ci.userId === state.currentUserId && (now - new Date(ci.createdAt).getTime()) <= sevenDaysMs
    );
    if (!recentCheckIn) {
      return {
        rule: 'low_signal',
        focus: 'Keep progress visible with a 60-second check-in.',
        why: 'Signals create momentum — learning sticks when practice is tracked.',
        primaryLabel: 'Do check-in (60s)',
        primaryTo: '/app/checkin',
        secondaryLabel: 'Start next unit',
        secondaryTo: '/app/journey',
      };
    }

    // RULE 4: Default momentum
    const nextUnitTo = firstIncompleteModule
      ? `/app/modules/${firstIncompleteModule.id}`
      : '/app/journey';
    return {
      rule: 'momentum',
      focus: 'Complete your next unit and keep momentum.',
      why: 'Small weekly actions compound into real progress.',
      primaryLabel: 'Start next unit',
      primaryTo: nextUnitTo,
      secondaryLabel: 'Open Playbook',
      secondaryTo: '/app/playbooks',
    };
  }, [journey, igniteStatus, packStatuses, state.checkIns, state.currentUserId, state.currentRole, firstIncompleteModule]);
}

/* ── Snapshot chip ── */
function SnapshotChip({ label, value, colorClass, to }: { label: string; value: string; colorClass: string; to: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-left hover:border-primary/40 transition-colors flex-1 min-w-0"
    >
      <span className={`text-sm font-semibold ${colorClass}`}>{value}</span>
      <span className="text-xs text-muted-foreground truncate">{label}</span>
    </button>
  );
}

const IGNITE_CHIP_COLOR: Record<IgniteStatus, string> = {
  active: 'text-emerald-400',
  at_risk: 'text-amber-400',
  inactive: 'text-red-400',
};

export default function TodayPage() {
  const { state } = useDemo();

  if (state.currentRole === 'sponsor') {
    return <SponsorTodayPage />;
  }

  return <OperationalTodayPage />;
}

/* ── Sponsor Today — executive macro view ── */
function SponsorTodayPage() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const weekLabel = getWeekRange().label;
  const activeUsers = state.users.filter(u => u.role !== 'admin' && u.role !== 'sponsor');

  const stats = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const activeIds = new Set<string>();

    state.checkIns.forEach(ci => {
      if (activeUsers.some(u => u.id === ci.userId) && new Date(ci.createdAt).getTime() >= sevenDaysAgo) {
        activeIds.add(ci.userId);
      }
    });
    activeUsers.forEach(user => {
      const prog = getSeededUnitProgressForUser(user.id);
      if (Object.values(prog).some(p => p.completedAt && new Date(p.completedAt).getTime() >= sevenDaysAgo)) {
        activeIds.add(user.id);
      }
    });

    const participation = activeUsers.length > 0 ? Math.round((activeIds.size / activeUsers.length) * 100) : 0;
    const totalStreaks = activeUsers.filter(u => u.streak > 0).length;
    const avgXP = activeUsers.length > 0 ? Math.round(activeUsers.reduce((s, u) => s + u.xp, 0) / activeUsers.length) : 0;

    // Team health
    const teamHealth = state.teams.map(team => {
      const members = activeUsers.filter(u => u.teamId === team.id);
      const teamActive = members.filter(u => activeIds.has(u.id)).length;
      const rate = members.length > 0 ? Math.round((teamActive / members.length) * 100) : 0;
      return { name: team.name, rate, active: teamActive, total: members.length };
    });

    // Recent wins
    const recentCheckIns = state.checkIns.filter(ci => new Date(ci.createdAt).getTime() >= sevenDaysAgo);
    const totalUnitsCompleted = activeUsers.reduce((sum, u) => {
      const prog = getSeededUnitProgressForUser(u.id);
      return sum + Object.values(prog).filter(p => p.status === 'completed').length;
    }, 0);

    return { participation, activeCount: activeIds.size, totalStreaks, avgXP, teamHealth, recentCheckIns: recentCheckIns.length, totalUnitsCompleted };
  }, [state, activeUsers]);

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Program Overview</h2>
          <span className="text-xs text-muted-foreground">{weekLabel}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Organization momentum at a glance — {state.organization.name}</p>
      </div>

      {/* Macro KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Participation (7d)</p>
            <p className="text-2xl font-bold mt-1">{stats.participation}%</p>
            <p className="text-xs text-muted-foreground">{stats.activeCount} of {activeUsers.length} active</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Active Streaks</p>
            <p className="text-2xl font-bold mt-1">{stats.totalStreaks}</p>
            <p className="text-xs text-muted-foreground">of {activeUsers.length} learners</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Avg XP</p>
            <p className="text-2xl font-bold mt-1">{stats.avgXP}</p>
            <p className="text-xs text-muted-foreground">{stats.totalUnitsCompleted} units done</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent wins */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Program momentum</p>
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2">
          <TrendingUp className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="text-sm text-foreground/90">{stats.recentCheckIns} check-ins submitted in the last 7 days across the organization.</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2">
          <Zap className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-sm text-foreground/90">{stats.totalStreaks} learners are maintaining active learning streaks.</span>
        </div>
        {stats.participation >= 60 && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2">
            <Trophy className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground/90">Participation rate above 60% — the program is gaining traction.</span>
          </div>
        )}
      </div>

      {/* Teams to watch */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Team health</p>
        {stats.teamHealth.map(t => (
          <div key={t.name} className="flex items-center justify-between rounded-lg border border-border/40 bg-secondary/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${t.rate >= 70 ? 'text-emerald-400' : t.rate >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {t.rate}%
              </span>
              <span className="text-xs text-muted-foreground">{t.active}/{t.total} active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/app/reports')}>
          <BarChart3 className="h-3.5 w-3.5" /> View Reports <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate('/app/barometer')}>
          <Eye className="h-3.5 w-3.5" /> ROI Barometer
        </Button>
      </div>
    </div>
  );
}

/* ── Operational Today — Manager / Collaborator ── */
function OperationalTodayPage() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const decision = useTodayDecision();
  const { status: igniteStatus } = useIgniteStatus();
  const packStatuses = usePackStatuses();
  const weekLabel = getWeekRange().label;
  const isManager = state.currentRole === 'manager';

  const duePacks = packStatuses.filter(p => p.status === 'at_risk' || p.status === 'inactive').length;

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const hasRecentCheckIn = state.checkIns.some(
    ci => ci.userId === state.currentUserId && (now - new Date(ci.createdAt).getTime()) <= sevenDaysMs
  );

  const igniteLabel = STATUS_CONFIG[igniteStatus].label;

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">
      {/* Header + branding */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Today <GlossaryTip term="Check-in" /></h2>
          <span className="text-xs text-muted-foreground">{weekLabel}</span>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary text-xs tracking-widest uppercase px-2 py-0.5 mt-1.5">
          Human Skills OS
        </Badge>
        <div className="mt-1 space-y-0">
          <p className="text-sm text-foreground font-medium">A Human Skills OS for real progress.</p>
          <p className="text-xs text-muted-foreground">Learn, practice, measure, repeat.</p>
        </div>
      </div>

      {/* Focus card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-5 pb-5 space-y-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <Badge variant="outline" className="text-[10px] tracking-wider uppercase border-primary/30 text-primary px-1.5 py-0">
                Adaptive suggestion
              </Badge>
              <p className="text-base font-semibold text-foreground leading-snug">{decision.focus}</p>
              <p className="text-xs text-muted-foreground">{decision.why}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-1.5" onClick={() => navigate(decision.primaryTo)}>
              {decision.primaryLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(decision.secondaryTo)}>
              {decision.secondaryLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress snapshot */}
      <div className="flex gap-2">
        <SnapshotChip
          label="Ignite"
          value={igniteLabel}
          colorClass={IGNITE_CHIP_COLOR[igniteStatus]}
          to="/app/ignite"
        />
        <SnapshotChip
          label="Due packs"
          value={String(duePacks)}
          colorClass={duePacks > 0 ? 'text-amber-400' : 'text-emerald-400'}
          to={isManager ? '/app/ignite-team?filter=due' : '/app/ignite'}
        />
        <SnapshotChip
          label="Check-in (7d)"
          value={hasRecentCheckIn ? 'Yes' : 'No'}
          colorClass={hasRecentCheckIn ? 'text-emerald-400' : 'text-amber-400'}
          to="/app/checkin"
        />
      </div>

      {/* Micro-success moments */}
      <MicroSuccessMoments />
    </div>
  );
}

/* ── Micro-success moments ── */
function MicroSuccessMoments() {
  const { state, currentUser } = useDemo();
  const { unitProgress } = useJourney();
  const isManager = state.currentRole === 'manager';

  const moments = useMemo(() => {
    const items: { icon: React.ElementType; text: string; colorClass: string }[] = [];

    // Streak moment
    if (currentUser && currentUser.streak >= 3) {
      items.push({
        icon: Zap,
        text: `${currentUser.streak}-week learning streak — you're building real consistency.`,
        colorClass: 'text-amber-400',
      });
    }

    // Units completed
    const completedUnits = Object.values(unitProgress).filter(u => u.status === 'completed').length;
    if (completedUnits >= 5) {
      items.push({
        icon: Trophy,
        text: `${completedUnits} units completed — you're ahead of the team average.`,
        colorClass: 'text-emerald-400',
      });
    }

    // XP milestone
    if (currentUser && currentUser.xp >= 150) {
      items.push({
        icon: TrendingUp,
        text: `${currentUser.xp} XP earned — ${currentUser.level} level. Keep going!`,
        colorClass: 'text-primary',
      });
    }

    // Manager: team momentum
    if (isManager) {
      const teamMembers = state.users.filter(u => u.role === 'participant' && u.teamId === currentUser?.teamId);
      const activeCount = teamMembers.filter(u => u.streak >= 2).length;
      if (activeCount >= 2) {
        items.push({
          icon: TrendingUp,
          text: `${activeCount} of ${teamMembers.length} team members have active streaks.`,
          colorClass: 'text-emerald-400',
        });
      }
    }

    return items.slice(0, 3);
  }, [currentUser, unitProgress, state.users, state.currentRole]);

  if (moments.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent wins</p>
      {moments.map((m, i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 px-3 py-2">
          <m.icon className={`h-4 w-4 shrink-0 ${m.colorClass}`} />
          <span className="text-sm text-foreground/90">{m.text}</span>
        </div>
      ))}
    </div>
  );
}
