import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { useDemo } from '@/contexts/DemoContext';
import { modules as seedModules } from '@/data/journey-seed';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Flame, ShieldCheck, AlertTriangle, XCircle,
  BookOpen, ClipboardCheck, BarChart3, ArrowRight,
  Repeat, Eye, Zap, Filter, FileText, Plus,
  Copy, MessageSquare, Activity,
} from 'lucide-react';
import type { EvidenceType } from '@/types/demo';
import { GlossaryTip } from '@/components/GlossaryTip';

export type IgniteStatus = 'active' | 'at_risk' | 'inactive';

/* ── Pack definitions ── */
export interface IgnitePack {
  packId: string;
  title: string;
  linkedModuleIds: string[];
  windowDays: number;
}

export const IGNITE_PACKS: IgnitePack[] = [
  { packId: 'ip-1', title: 'Ignite: Trust & Safety', linkedModuleIds: ['tp-1'], windowDays: 14 },
  { packId: 'ip-2', title: 'Ignite: Productive Disagreement', linkedModuleIds: ['tp-2'], windowDays: 14 },
  { packId: 'ip-3', title: 'Ignite: Decision Clarity', linkedModuleIds: ['tp-3'], windowDays: 14 },
  { packId: 'ip-4', title: 'Ignite: Peer Accountability', linkedModuleIds: ['tp-4'], windowDays: 14 },
  { packId: 'ip-5', title: 'Ignite: Results OS', linkedModuleIds: ['tp-5'], windowDays: 14 },
];

/* ── Per-pack status computation ── */
export interface PackStatusResult {
  pack: IgnitePack;
  status: IgniteStatus;
  recentUnits: number;
  recentCheckIns: number;
  whyLine: string;
}

export function computePackStatusForUser(
  pack: IgnitePack,
  unitProgress: Record<string, { status: string; completedAt?: string }>,
  checkIns: { userId: string; createdAt: string }[],
  userId: string,
): PackStatusResult {
  const now = Date.now();
  const windowMs = pack.windowDays * 24 * 60 * 60 * 1000;

  const linkedUnitIds = new Set<string>();
  for (const modId of pack.linkedModuleIds) {
    const mod = seedModules.find(m => m.id === modId);
    if (mod?.units) {
      for (const u of mod.units) linkedUnitIds.add(u.unitId);
    }
  }

  const recentUnits = [...linkedUnitIds].filter(uid => {
    const p = unitProgress[uid];
    return p?.status === 'completed' && p.completedAt && (now - new Date(p.completedAt).getTime()) <= windowMs;
  }).length;

  const recentCheckIns = checkIns.filter(
    ci => ci.userId === userId && (now - new Date(ci.createdAt).getTime()) <= windowMs
  ).length;

  const hasUnit = recentUnits >= 1;
  const hasCheckIn = recentCheckIns >= 1;

  let status: IgniteStatus;
  let whyLine: string;

  if (hasUnit && hasCheckIn) {
    status = 'active';
    whyLine = `${recentUnits} unit${recentUnits > 1 ? 's' : ''} completed + ${recentCheckIns} check-in${recentCheckIns > 1 ? 's' : ''} in last ${pack.windowDays} days.`;
  } else if (hasUnit) {
    status = 'at_risk';
    whyLine = `${recentUnits} unit${recentUnits > 1 ? 's' : ''} completed, missing check-in.`;
  } else if (hasCheckIn) {
    status = 'at_risk';
    whyLine = `${recentCheckIns} check-in${recentCheckIns > 1 ? 's' : ''} submitted, missing unit completion.`;
  } else {
    status = 'inactive';
    whyLine = 'No recent unit completions or check-ins.';
  }

  return { pack, status, recentUnits, recentCheckIns, whyLine };
}

/* ── Global Ignite status ── */
export function useIgniteStatus() {
  const { unitProgress, moduleProgress } = useJourney();
  const { state } = useDemo();

  return useMemo(() => {
    const now = Date.now();
    const window14d = 14 * 24 * 60 * 60 * 1000;

    const recentUnits = Object.values(unitProgress).filter(
      u => u.status === 'completed' && u.completedAt && (now - new Date(u.completedAt).getTime()) <= window14d
    ).length;
    const recentModules = Object.values(moduleProgress).filter(
      m => m.status === 'completed' && m.completedAt && (now - new Date(m.completedAt).getTime()) <= window14d
    ).length;
    const totalRecentCompletions = recentUnits + recentModules;
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

/* ── Per-pack statuses hook ── */
export function usePackStatuses(): PackStatusResult[] {
  const { unitProgress } = useJourney();
  const { state } = useDemo();

  return useMemo(
    () => IGNITE_PACKS.map(pack => computePackStatusForUser(pack, unitProgress, state.checkIns, state.currentUserId)),
    [unitProgress, state.checkIns, state.currentUserId],
  );
}

/* ── Status UI config ── */
export const STATUS_CONFIG: Record<IgniteStatus, { label: string; icon: React.ElementType; color: string; bg: string; why: string }> = {
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

const EVIDENCE_TYPE_LABELS: Record<EvidenceType, { label: string; icon: React.ElementType }> = {
  script_used: { label: 'Script', icon: Copy },
  practice_done: { label: 'Practice', icon: Activity },
  reflection: { label: 'Reflection', icon: MessageSquare },
};

type PackFilterValue = 'all' | IgniteStatus;
type EvidenceFilterValue = 'all' | EvidenceType;

export default function IgnitePage() {
  const navigate = useNavigate();
  const { status, recentUnits, recentCheckIns } = useIgniteStatus();
  const packStatuses = usePackStatuses();
  const { firstIncompleteModule } = useJourney();
  const { state, dispatch } = useDemo();
  const [packFilter, setPackFilter] = useState<PackFilterValue>('all');
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilterValue>('all');
  const [reflectionText, setReflectionText] = useState('');

  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  const filteredPacks = packFilter === 'all' ? packStatuses : packStatuses.filter(p => p.status === packFilter);

  const userEvidence = useMemo(() => {
    let items = state.evidenceLog
      .filter(e => e.userId === state.currentUserId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (evidenceFilter !== 'all') items = items.filter(e => e.type === evidenceFilter);
    return items.slice(0, 10);
  }, [state.evidenceLog, state.currentUserId, evidenceFilter]);

  const handleNextUnit = () => {
    if (firstIncompleteModule) navigate(`/app/modules/${firstIncompleteModule.id}`);
    else navigate('/app/journey');
  };

  const handleAddReflection = () => {
    if (!reflectionText.trim()) return;
    dispatch({
      type: 'ADD_EVIDENCE',
      payload: { userId: state.currentUserId, type: 'reflection', content: reflectionText.trim() },
    });
    setReflectionText('');
    toast.success('Reflection saved');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Concept */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Ignite <GlossaryTip term="Ignite" /></h1>
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

      {/* Your Global Ignite Status */}
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

      {/* Evidence Locker */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Evidence Locker</h2>
        </div>

        {/* Add reflection */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a reflection (one sentence)…"
            value={reflectionText}
            onChange={e => setReflectionText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddReflection()}
            className="flex-1"
          />
          <Button size="sm" className="gap-1.5 shrink-0" onClick={handleAddReflection} disabled={!reflectionText.trim()}>
            <Plus className="h-3.5 w-3.5" /> Save reflection
          </Button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {([
            { value: 'all' as EvidenceFilterValue, label: 'All' },
            { value: 'script_used' as EvidenceFilterValue, label: 'Scripts' },
            { value: 'practice_done' as EvidenceFilterValue, label: 'Practice' },
            { value: 'reflection' as EvidenceFilterValue, label: 'Reflections' },
          ]).map(f => (
            <Button
              key={f.value}
              size="sm"
              variant={evidenceFilter === f.value ? 'default' : 'ghost'}
              className="h-7 px-2.5 text-xs"
              onClick={() => setEvidenceFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Evidence list */}
        {userEvidence.length > 0 ? (
          <div className="space-y-2">
            {userEvidence.map(ev => {
              const typeInfo = EVIDENCE_TYPE_LABELS[ev.type];
              const TypeIcon = typeInfo.icon;
              return (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 text-sm">
                  <TypeIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{typeInfo.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ev.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{ev.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No evidence yet. Copy a template, submit a check-in, or add a reflection above.</p>
        )}
      </section>

      {/* Ignite Packs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">Ignite Packs</h2>
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(['all', 'active', 'at_risk', 'inactive'] as PackFilterValue[]).map(f => (
              <Button
                key={f}
                size="sm"
                variant={packFilter === f ? 'default' : 'ghost'}
                className="h-7 px-2.5 text-xs capitalize"
                onClick={() => setPackFilter(f)}
              >
                {f === 'at_risk' ? 'At Risk' : f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic">
          Packs stay Active through continued practice — no exams, no hours watched.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPacks.map(({ pack, status: pStatus, whyLine }) => {
            const pCfg = STATUS_CONFIG[pStatus];
            const PIcon = pCfg.icon;
            return (
              <Card key={pack.packId} className={`border ${pCfg.bg} overflow-hidden`}>
                <CardContent className="pt-5 pb-4 px-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <Flame className="h-4 w-4 text-primary shrink-0" />
                      <p className="font-semibold text-sm truncate">{pack.title}</p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 gap-1 text-xs whitespace-nowrap ${pCfg.color} border-current/30`}>
                      <PIcon className="h-3 w-3" />
                      {pCfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{whyLine}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 px-2.5" onClick={() => navigate(`/app/modules/${pack.linkedModuleIds[0]}`)}>
                      <BookOpen className="h-3 w-3 shrink-0" /> <span className="truncate">Continue</span>
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 px-2.5" onClick={() => navigate('/app/checkin')}>
                      <ClipboardCheck className="h-3 w-3 shrink-0" /> <span className="truncate">Check-in</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredPacks.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full text-center py-6">No packs match this filter.</p>
          )}
        </div>
      </section>
    </div>
  );
}
