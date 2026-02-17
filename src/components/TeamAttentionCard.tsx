import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { IGNITE_PACKS, computePackStatusForUser } from '@/pages/Ignite';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ClipboardCheck, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

export function TeamAttentionCard() {
  const { state } = useDemo();
  const navigate = useNavigate();

  const teamMembers = useMemo(() => state.users.filter(u => u.role !== 'admin'), [state.users]);

  // 1) Ignite At Risk: users with any pack at_risk or inactive
  const atRiskCount = useMemo(() => {
    let count = 0;
    for (const user of teamMembers) {
      const unitProg = getSeededUnitProgressForUser(user.id);
      const hasRisk = IGNITE_PACKS.some(pack => {
        const result = computePackStatusForUser(pack, unitProg, state.checkIns, user.id);
        return result.status === 'at_risk' || result.status === 'inactive';
      });
      if (hasRisk) count++;
    }
    return count;
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
          {/* Ignite At Risk */}
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Ignite At Risk</p>
              <p className="text-2xl font-bold">{atRiskCount}</p>
              <p className="text-xs text-muted-foreground">members need attention</p>
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
