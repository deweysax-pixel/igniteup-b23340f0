import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { IGNITE_PACKS, computePackStatusForUser } from '@/pages/Ignite';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, ClipboardCheck, BarChart3, Info } from 'lucide-react';
import { useMemo } from 'react';

/** Manager-grade per-member overall status for Dashboard summary only.
 *  Does NOT affect pack badges or Ignite heatmap. */
function computeMemberOverallForDashboard(
  user: { id: string },
  unitProg: Record<string, { status: string; completedAt?: string }>,
  checkIns: { userId: string; createdAt: string }[],
): 'active' | 'at_risk' | 'inactive' {
  const now = Date.now();
  const windowMs = 14 * 24 * 60 * 60 * 1000;

  const packResults = IGNITE_PACKS.map(pack =>
    computePackStatusForUser(pack, unitProg, checkIns, user.id)
  );

  const inactiveCount = packResults.filter(r => r.status === 'inactive').length;
  const atRiskOrInactiveCount = packResults.filter(r => r.status !== 'active').length;

  const hasRecentCheckIn = checkIns.some(
    ci => ci.userId === user.id && (now - new Date(ci.createdAt).getTime()) <= windowMs
  );
  const hasRecentPackActivity = packResults.some(r => r.recentUnits >= 1);

  // Inactive: 3+ packs inactive OR completely dark (no check-in AND no unit activity)
  if (inactiveCount >= 3 || (!hasRecentCheckIn && !hasRecentPackActivity)) {
    return 'inactive';
  }
  // At Risk: 2+ packs at-risk/inactive OR missing check-in OR check-in but no unit activity
  if (atRiskOrInactiveCount >= 2 || !hasRecentCheckIn || (hasRecentCheckIn && !hasRecentPackActivity)) {
    return 'at_risk';
  }
  return 'active';
}

export function TeamAttentionCard() {
  const { state } = useDemo();
  const navigate = useNavigate();

  const teamMembers = useMemo(() => state.users.filter(u => u.role !== 'admin'), [state.users]);

  // 1) Ignite renewals: Active vs Due (Due = At Risk + Inactive using smarter overall logic)
  const igniteCounts = useMemo(() => {
    let active = 0;
    let due = 0;
    for (const user of teamMembers) {
      const unitProg = getSeededUnitProgressForUser(user.id);
      const overall = computeMemberOverallForDashboard(user, unitProg, state.checkIns);
      if (overall === 'active') active++;
      else due++;
    }
    return { active, due };
  }, [teamMembers, state.checkIns]);

  // 2) Check-ins in last 7 days
  const checkIn7d = useMemo(() => {
    const now = Date.now();
    const window7d = 7 * 24 * 60 * 60 * 1000;
    const usersWithCheckin = new Set(
      state.checkIns
        .filter(ci => (now - new Date(ci.createdAt).getTime()) <= window7d)
        .map(ci => ci.userId)
    );
    const teamIds = new Set(teamMembers.map(u => u.id));
    const submitted = [...usersWithCheckin].filter(id => teamIds.has(id)).length;
    return { submitted, total: teamMembers.length };
  }, [state.checkIns, teamMembers]);

  // 3) ROI signal trend (baseline vs current from barometer)
  const roiTrend = useMemo(() => {
    if (state.barometerResponses.length === 0) return null;
    const week1 = state.barometerResponses.filter(r => r.weekNumber === 1);
    const latest = state.barometerResponses.filter(r => r.weekNumber === 3);
    if (week1.length === 0 || latest.length === 0) return null;
    const avg = (arr: typeof week1) => {
      const sum = arr.reduce((a, r) => a + (r.scores.confidence + r.scores.engagement + r.scores.clarity) / 3, 0);
      return sum / arr.length;
    };
    const baseline = avg(week1);
    const current = avg(latest);
    const delta = current - baseline;
    return { baseline: baseline.toFixed(1), current: current.toFixed(1), delta: delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1) };
  }, [state.barometerResponses]);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Team attention this week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Ignite renewals */}
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium">Ignite renewals</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-xs">
                      Due = members needing renewal this week.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-2xl font-bold text-primary">{igniteCounts.active}</span>
                  <span className="text-xs text-muted-foreground ml-1">Active</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-warning">{igniteCounts.due}</span>
                  <span className="text-xs text-muted-foreground ml-1">Due</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs mt-1" onClick={() => navigate('/app/ignite-team')}>
                Open Ignite heatmap
              </Button>
            </div>
          </div>

          {/* Check-ins */}
          <div className="flex items-start gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Check-ins (7 days)</p>
              <p className="text-2xl font-bold">{checkIn7d.submitted}/{checkIn7d.total}</p>
              <p className="text-xs text-muted-foreground">submitted this week</p>
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs mt-1" onClick={() => navigate('/app/team')}>
                View Team
              </Button>
            </div>
          </div>

          {/* ROI signal trend */}
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">ROI signal trend</p>
              {roiTrend ? (
                <>
                  <p className="text-2xl font-bold">{roiTrend.delta}</p>
                  <p className="text-xs text-muted-foreground">{roiTrend.baseline} → {roiTrend.current} avg</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Not enough data yet</p>
              )}
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs mt-1" onClick={() => navigate('/app/barometer')}>
                Open ROI Barometer
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
