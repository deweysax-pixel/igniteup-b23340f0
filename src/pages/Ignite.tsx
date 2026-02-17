import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Flame, ShieldCheck, AlertTriangle, XCircle,
  BookOpen, ClipboardCheck, BarChart3, ArrowRight,
  Repeat, Eye, Zap,
} from 'lucide-react';

export type IgniteStatus = 'active' | 'at_risk' | 'inactive';

export function useIgniteStatus() {
  const { unitProgress, moduleProgress } = useJourney();
  const { state } = useDemo();

  return useMemo(() => {
    const now = Date.now();
    const window14d = 14 * 24 * 60 * 60 * 1000;

    // Units completed in last 14 days
    const recentUnits = Object.values(unitProgress).filter(
      u => u.status === 'completed' && u.completedAt && (now - new Date(u.completedAt).getTime()) <= window14d
    ).length;

    // Also count module-level completions (for modules without units)
    const recentModules = Object.values(moduleProgress).filter(
      m => m.status === 'completed' && m.completedAt && (now - new Date(m.completedAt).getTime()) <= window14d
    ).length;

    const totalRecentCompletions = recentUnits + recentModules;

    // Check-ins in last 14 days
    const recentCheckIns = state.checkIns.filter(
      ci => ci.userId === state.currentUserId && (now - new Date(ci.createdAt).getTime()) <= window14d
    ).length;

    const hasUnit = totalRecentCompletions >= 1;
    const hasCheckIn = recentCheckIns >= 1;

    let status: IgniteStatus;
    if (hasUnit && hasCheckIn) status = 'active';
    else if (hasUnit || hasCheckIn) status = 'at_risk';
    else status = 'inactive';

    return { status, recentUnits: totalRecentCompletions, recentCheckIns };
  }, [unitProgress, moduleProgress, state.checkIns, state.currentUserId]);
}

const STATUS_CONFIG: Record<IgniteStatus, { label: string; icon: React.ElementType; color: string; bg: string; why: string }> = {
  active: {
    label: 'Active',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    why: 'You completed 1+ unit and submitted 1+ check-in in the last 14 days.',
  },
  at_risk: {
    label: 'At Risk',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    why: "You're missing either a recent unit completion or a recent check-in.",
  },
  inactive: {
    label: 'Inactive',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    why: 'No recent practice signals — restart with the renewal plan below.',
  },
};

const PILLARS = [
  { icon: Repeat, title: 'Practice', desc: 'Real actions, not watched videos. Complete units and apply what you learn.' },
  { icon: Eye, title: 'Consistency', desc: 'Regular check-ins prove sustained behavior change, not one-off effort.' },
  { icon: Zap, title: 'Signals', desc: 'Unit completions + check-ins = evidence. Simple, transparent, always current.' },
];

const PACKS = [
  { title: 'Ignite: Trust & Safety', moduleId: 'tp-1' },
  { title: 'Ignite: Productive Disagreement', moduleId: 'tp-2' },
  { title: 'Ignite: Decision Clarity', moduleId: 'tp-3' },
  { title: 'Ignite: Peer Accountability', moduleId: 'tp-4' },
  { title: 'Ignite: Results OS', moduleId: 'tp-5' },
];

export default function IgnitePage() {
  const navigate = useNavigate();
  const { status, recentUnits, recentCheckIns } = useIgniteStatus();
  const { firstIncompleteModule } = useJourney();
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  const handleNextUnit = () => {
    if (firstIncompleteModule) {
      navigate(`/app/modules/${firstIncompleteModule.id}`);
    } else {
      navigate('/app/journey');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Concept */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Ignite</h1>
        </div>
        <p className="text-lg font-medium text-foreground/90">
          Ignite isn't a certificate of knowledge. It's a live status of real-world capability.
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Not a diploma — no hours watched, no one-off exam.</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Proof over theory — earned through real actions and simple evidence.</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>Always alive — stays Active only if you keep practicing.</li>
        </ul>
      </section>

      {/* How it works */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PILLARS.map(p => (
            <Card key={p.title} className="border-border/50">
              <CardContent className="pt-5 space-y-2">
                <p.icon className="h-5 w-5 text-primary" />
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Statuses explainer */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Statuses</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(['active', 'at_risk', 'inactive'] as IgniteStatus[]).map(s => {
            const c = STATUS_CONFIG[s];
            const Icon = c.icon;
            return (
              <div key={s} className={`rounded-lg border p-4 space-y-1 ${c.bg}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${c.color}`} />
                  <span className={`text-sm font-semibold ${c.color}`}>{c.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{c.why}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Your Ignite Status */}
      <Card className={`border ${cfg.bg}`}>
        <CardHeader className="pb-3">
          <CardDescription className="text-xs uppercase tracking-wider text-primary">Your Ignite Status</CardDescription>
          <CardTitle className="text-xl flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${cfg.color}`} />
            <span className={cfg.color}>{cfg.label}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{cfg.why}</p>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{recentUnits}</p>
              <p className="text-xs text-muted-foreground">Units completed<br />(last 14 days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{recentCheckIns}</p>
              <p className="text-xs text-muted-foreground">Check-ins submitted<br />(last 14 days)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renewal actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Renew in 2 minutes</CardTitle>
          <CardDescription className="text-xs">Do A + B to return to Active. C is optional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleNextUnit}>
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-medium">A) Complete 1 unit</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/app/checkin')}>
            <ClipboardCheck className="h-4 w-4 text-primary" />
            <span className="font-medium">B) Do a 60-second check-in</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate('/app/barometer')}>
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-medium">C) Update ROI signal</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      {/* Ignite Packs */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Ignite Packs</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PACKS.map(pack => (
            <Card key={pack.moduleId} className="border-border/50">
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-sm">{pack.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">Criteria: 1 unit + 1 practice in 14 days</p>
                <p className="text-xs text-muted-foreground">Evidence: unit completion + check-in</p>
                <Button size="sm" variant="outline" className="gap-1.5 mt-1" onClick={() => navigate(`/app/modules/${pack.moduleId}`)}>
                  View related module <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
