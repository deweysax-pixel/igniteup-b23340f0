import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { IGNITE_PACKS, computePackStatusForUser, STATUS_CONFIG, type IgniteStatus } from '@/pages/Ignite';
import { getWeekRange } from '@/lib/week-utils';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Flame, Copy, BookOpen, ShieldCheck, AlertTriangle, XCircle, Users, CheckSquare, Square, LayoutList } from 'lucide-react';
import { toast } from 'sonner';
import { GlossaryTip } from '@/components/GlossaryTip';

const NUDGE_MESSAGE = "Quick nudge: to keep your Ignite pack Active, complete one unit in the pack and submit one check-in this week. It takes ~5 minutes.";
const BULK_NUDGE_MESSAGE = "Hi — quick reminder: to keep your Ignite pack Active, please complete one unit and submit your 60s check-in this week. It takes ~5 minutes. Reply if you need help.";

type SelectedCell = { userId: string; packId: string };

export default function IgniteTeam() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filter state — read ?filter=due on mount
  const [dueOnly, setDueOnly] = useState(() => searchParams.get('filter') === 'due');

  // Sync if query param changes externally
  useEffect(() => {
    if (searchParams.get('filter') === 'due') setDueOnly(true);
  }, [searchParams]);

  // Panel state
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [nudgedCells, setNudgedCells] = useState<Set<string>>(new Set()); // "userId:packId"
  const [assignOpen, setAssignOpen] = useState(false);

  // Bulk mode
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const teamMembers = useMemo(() => state.users.filter(u => u.role !== 'admin'), [state.users]);

  const heatmapData = useMemo(() => {
    return teamMembers.map(user => {
      const userUnitProgress = getSeededUnitProgressForUser(user.id);
      const packStatuses = IGNITE_PACKS.map(pack =>
        computePackStatusForUser(pack, userUnitProgress, state.checkIns, user.id)
      );
      const isDue = packStatuses.some(ps => ps.status === 'at_risk' || ps.status === 'inactive');
      return { user, packStatuses, isDue };
    });
  }, [teamMembers, state.checkIns]);

  // Due filter
  const visibleData = useMemo(() =>
    dueOnly ? heatmapData.filter(r => r.isDue) : heatmapData,
    [heatmapData, dueOnly]
  );

  // Summary counts
  const summary = useMemo(() => {
    const userOverall: Record<IgniteStatus, number> = { active: 0, at_risk: 0, inactive: 0 };
    const cellCounts: Record<IgniteStatus, number> = { active: 0, at_risk: 0, inactive: 0 };
    for (const { packStatuses } of heatmapData) {
      const uCounts: Record<IgniteStatus, number> = { active: 0, at_risk: 0, inactive: 0 };
      for (const ps of packStatuses) { cellCounts[ps.status]++; uCounts[ps.status]++; }
      if (uCounts.active >= uCounts.at_risk && uCounts.active >= uCounts.inactive) userOverall.active++;
      else if (uCounts.inactive > uCounts.at_risk) userOverall.inactive++;
      else userOverall.at_risk++;
    }
    const totalCells = cellCounts.active + cellCounts.at_risk + cellCounts.inactive;
    const activeRate = totalCells > 0 ? Math.round((cellCounts.active / totalCells) * 100) : 0;
    return { cellCounts, userOverall, activeRate };
  }, [heatmapData]);

  // Selected cell detail
  const selectedDetail = useMemo(() => {
    if (!selectedCell) return null;
    const row = heatmapData.find(r => r.user.id === selectedCell.userId);
    const packResult = row?.packStatuses.find(ps => ps.pack.packId === selectedCell.packId);
    const userCheckIns = state.checkIns
      .filter(ci => ci.userId === selectedCell.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastCheckIn = userCheckIns[0];
    return { user: row?.user, packResult, lastCheckIn };
  }, [selectedCell, heatmapData, state.checkIns]);

  // Bulk helpers
  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const selectAllDue = () => {
    const dueIds = visibleData.filter(r => r.isDue).map(r => r.user.id);
    setSelectedMembers(new Set(dueIds));
  };

  const clearSelection = () => setSelectedMembers(new Set());

  const handleCopyBulkNudge = () => {
    navigator.clipboard.writeText(BULK_NUDGE_MESSAGE);
    toast.success('Copied');
  };

  const handleCopyNudge = () => {
    navigator.clipboard.writeText(NUDGE_MESSAGE);
    toast.success('Copied');
    if (selectedCell) {
      setNudgedCells(prev => new Set(prev).add(`${selectedCell.userId}:${selectedCell.packId}`));
    }
  };

  const handleAssign = (route: string) => {
    setAssignOpen(false);
    setSelectedCell(null);
    toast.success('Assigned');
    navigate(route);
  };

  // Role gate
  if (state.currentRole === 'participant') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <h2 className="text-2xl font-semibold">Team Ignite Heatmap</h2>
        <p className="text-muted-foreground max-w-md">This view is available to Managers and Admins.</p>
        <Button onClick={() => navigate('/app/ignite')}><Flame className="h-4 w-4 mr-2" /> Go to My Ignite</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Flame className="h-6 w-6 text-primary" />
            Team Ignite Heatmap <GlossaryTip term="Ignite" /> <GlossaryTip term="Due" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Pack-level certification status across your team.</p>
          <p className="text-xs text-muted-foreground">{getWeekRange().label}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/ignite')}>
          <Flame className="h-3.5 w-3.5" /> My Ignite
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
              <p className="text-xs text-muted-foreground">Team members</p>
            </div>
          </CardContent>
        </Card>
        {([
          { status: 'active' as IgniteStatus, icon: ShieldCheck, color: 'text-emerald-400' },
          { status: 'at_risk' as IgniteStatus, icon: AlertTriangle, color: 'text-amber-400' },
          { status: 'inactive' as IgniteStatus, icon: XCircle, color: 'text-red-400' },
        ]).map(({ status: s, icon: Icon, color }) => (
          <Card key={s} className="border-border/50">
            <CardContent className="pt-5 flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold">{summary.userOverall[s]}</p>
                <p className="text-xs text-muted-foreground capitalize">{s === 'at_risk' ? 'At Risk' : s}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Pack-level active rate: <span className="font-semibold text-foreground">{summary.activeRate}%</span> ({summary.cellCounts.active} of {summary.cellCounts.active + summary.cellCounts.at_risk + summary.cellCounts.inactive} pack slots)
      </p>

      {/* Filter + Bulk toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Due only toggle */}
        <Button
          size="sm"
          variant={dueOnly ? 'default' : 'outline'}
          className="gap-2 h-8 text-xs"
          onClick={() => setDueOnly(v => !v)}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Due only {dueOnly && `(${visibleData.length})`}
        </Button>

        {/* Bulk mode toggle */}
        <Button
          size="sm"
          variant={bulkMode ? 'secondary' : 'outline'}
          className="gap-2 h-8 text-xs"
          onClick={() => { setBulkMode(v => !v); clearSelection(); }}
        >
          <LayoutList className="h-3.5 w-3.5" />
          Bulk mode
        </Button>

        {/* Bulk action bar */}
        {bulkMode && (
          <div className="flex items-center gap-2 ml-2 border-l border-border pl-2">
            <span className="text-xs text-muted-foreground">Selected: {selectedMembers.size}</span>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={selectAllDue}>
              Select all (Due)
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={clearSelection}>
              Clear
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              disabled={selectedMembers.size === 0}
              onClick={handleCopyBulkNudge}
            >
              <Copy className="h-3 w-3" />
              Copy bulk nudge
            </Button>
          </div>
        )}
      </div>

      {/* Heatmap table */}
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {bulkMode && <TableHead className="w-8" />}
                <TableHead className="min-w-[140px]">Team Member</TableHead>
                {IGNITE_PACKS.map(pack => (
                  <TableHead key={pack.packId} className="text-center text-xs min-w-[100px]">
                    {pack.title.replace('Ignite: ', '')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleData.map(({ user, packStatuses }) => {
                const isSelected = selectedMembers.has(user.id);
                return (
                  <TableRow key={user.id} className={isSelected ? 'bg-primary/5' : undefined}>
                    {bulkMode && (
                      <TableCell className="pr-0">
                        <button
                          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => toggleMember(user.id)}
                        >
                          {isSelected
                            ? <CheckSquare className="h-4 w-4 text-primary" />
                            : <Square className="h-4 w-4" />}
                        </button>
                      </TableCell>
                    )}
                    <TableCell className="font-medium text-sm">
                      {user.name}
                      <span className="block text-xs text-muted-foreground capitalize">{user.role}</span>
                    </TableCell>
                    {packStatuses.map(ps => {
                      const cfg = STATUS_CONFIG[ps.status];
                      const Icon = cfg.icon;
                      const nudgeKey = `${user.id}:${ps.pack.packId}`;
                      const isNudged = nudgedCells.has(nudgeKey);
                      return (
                        <TableCell key={ps.pack.packId} className="text-center">
                          <div className="relative inline-flex">
                            <button
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-all hover:opacity-80 ${cfg.bg} ${cfg.color}`}
                              onClick={() => { if (!bulkMode) setSelectedCell({ userId: user.id, packId: ps.pack.packId }); }}
                            >
                              <Icon className="h-3 w-3" />
                              {cfg.label}
                            </button>
                            {/* Nudged dot indicator */}
                            {isNudged && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary border border-background" title="Nudged" />
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {visibleData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={IGNITE_PACKS.length + 2} className="text-center text-sm text-muted-foreground py-8">
                    No members match the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Panel — side drawer */}
      <Sheet open={!!selectedCell} onOpenChange={(open) => { if (!open) { setSelectedCell(null); setAssignOpen(false); } }}>
        <SheetContent className="w-full sm:max-w-sm overflow-y-auto">
          {selectedDetail?.user && selectedDetail?.packResult && (() => {
            const { user, packResult, lastCheckIn } = selectedDetail;
            const cfg = STATUS_CONFIG[packResult.status];
            const StatusIcon = cfg.icon;
            const isDue = packResult.status !== 'active';
            const nudgeKey = `${user.id}:${packResult.pack.packId}`;
            const isNudged = nudgedCells.has(nudgeKey);

            const lastCheckInText = lastCheckIn
              ? `Last check-in: ${new Date(lastCheckIn.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
              : 'No check-in recorded this week.';

            const packActivityText = packResult.recentUnits > 0
              ? `${packResult.recentUnits} unit${packResult.recentUnits > 1 ? 's' : ''} completed recently.`
              : 'No recent progress in this pack.';

            const recommendedAction = isDue
              ? 'Renew this pack: complete 1 unit + submit a 60s check-in.'
              : 'Keep it Active: 1 unit + 1 check-in this week.';

            return (
              <div className="space-y-5 pt-2">
                <SheetHeader>
                  <SheetTitle className="flex flex-col gap-1 text-left">
                    <span className="text-base font-semibold">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize font-normal">{user.role}</span>
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">{packResult.pack.title.replace('Ignite: ', '')}</p>
                </SheetHeader>

                {/* Status */}
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {cfg.label}
                  </div>
                </section>

                {/* Why */}
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why this status?</p>
                  <div className="space-y-1.5 rounded-lg bg-secondary/30 p-3 text-xs text-muted-foreground">
                    <p>• {lastCheckInText}</p>
                    <p>• {packActivityText}</p>
                  </div>
                </section>

                {/* Recommended action */}
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended next action</p>
                  <p className="text-sm text-foreground leading-relaxed">{recommendedAction}</p>
                </section>

                {/* Nudged toggle */}
                <section>
                  <button
                    className={`inline-flex items-center gap-2 text-xs rounded-full px-3 py-1 border transition-colors ${
                      isNudged
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/30'
                    }`}
                    onClick={() => {
                      setNudgedCells(prev => {
                        const next = new Set(prev);
                        next.has(nudgeKey) ? next.delete(nudgeKey) : next.add(nudgeKey);
                        return next;
                      });
                    }}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isNudged ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    {isNudged ? 'Marked as nudged' : 'Mark as nudged'}
                  </button>
                </section>

                {/* Actions */}
                <section className="space-y-2 pt-1">
                  <Button className="w-full gap-2" size="sm" onClick={handleCopyNudge}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy nudge
                  </Button>

                  {/* Assign micro-action */}
                  {!assignOpen ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setAssignOpen(true)}
                    >
                      Assign micro-action
                    </Button>
                  ) : (
                    <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Choose action:</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-xs"
                        onClick={() => handleAssign('/app/checkin')}
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                        Do check-in (60s)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-xs"
                        onClick={() => handleAssign('/app/journey')}
                      >
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        Start next unit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => setAssignOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
