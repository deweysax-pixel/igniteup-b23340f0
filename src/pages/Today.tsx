import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { useIgniteStatus, usePackStatuses, STATUS_CONFIG } from '@/pages/Ignite';
import type { IgniteStatus } from '@/pages/Ignite';
import { Flame, ClipboardCheck, BookOpen, Compass, Sparkles, ArrowRight, ShieldCheck, AlertTriangle, Package, Trophy, TrendingUp, Zap } from 'lucide-react';
import { getWeekRange } from '@/lib/week-utils';
import { GlossaryTip } from '@/components/GlossaryTip';

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
    </div>
  );
}
