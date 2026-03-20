import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Target, Users, UserX, Flame } from 'lucide-react';

interface TeamActionPanelProps {
  totalMembers: number;
  activeCount: number;
  inactiveCount: number;
  highlyEngagedCount: number;
  alerts: string[];
  recommendations: string[];
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

export function TeamActionPanel({
  totalMembers,
  activeCount,
  inactiveCount,
  highlyEngagedCount,
  alerts,
  recommendations,
}: TeamActionPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <SectionHeader icon={Target} title="Team Action Panel" />

        {/* Engagement Snapshot */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Engagement Snapshot</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 p-3">
              <Users className="h-4 w-4 text-success shrink-0" />
              <div>
                <p className="text-xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 p-3">
              <UserX className="h-4 w-4 text-destructive shrink-0" />
              <div>
                <p className="text-xl font-bold">{inactiveCount}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 p-3">
              <Flame className="h-4 w-4 text-warning shrink-0" />
              <div>
                <p className="text-xl font-bold">{highlyEngagedCount}</p>
                <p className="text-xs text-muted-foreground">Highly engaged</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Alerts</p>
            <div className="space-y-2">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm">{alert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Actions */}
        {recommendations.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recommended Actions</p>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Generate alerts and recommendations from team data */
export function computeManagerActions(
  members: { id: string; streak: number }[],
  activeMemberIds: Set<string>,
  behaviorBreakdown: { label: string; pct: number }[],
  participationRate: number,
) {
  const totalMembers = members.length;
  const activeCount = activeMemberIds.size;
  const inactiveCount = totalMembers - activeCount;
  const highlyEngagedCount = members.filter(m => m.streak >= 3).length;

  const alerts: string[] = [];
  const recommendations: string[] = [];

  // Alerts
  if (inactiveCount > 0) {
    alerts.push(`${inactiveCount} member${inactiveCount > 1 ? 's' : ''} had no activity this week.`);
  }
  if (participationRate < 50) {
    alerts.push(`Participation is at ${participationRate}% — below the 50% threshold.`);
  }
  const missingBehaviors = behaviorBreakdown.filter(b => b.pct < 10);
  missingBehaviors.forEach(b => {
    alerts.push(`${b.label} is nearly absent from team actions.`);
  });

  // Recommendations
  const lowestBehavior = [...behaviorBreakdown].sort((a, b) => a.pct - b.pct)[0];
  if (lowestBehavior && lowestBehavior.pct < 20) {
    recommendations.push(`Encourage ${lowestBehavior.label.toLowerCase()} this week.`);
  }
  if (inactiveCount > 0) {
    recommendations.push(`Follow up with ${inactiveCount} inactive member${inactiveCount > 1 ? 's' : ''}.`);
  }
  const highestBehavior = [...behaviorBreakdown].sort((a, b) => b.pct - a.pct)[0];
  if (highestBehavior && highestBehavior.pct > 40) {
    recommendations.push(`${highestBehavior.label} is strong — diversify into other behaviors.`);
  }

  return { totalMembers, activeCount, inactiveCount, highlyEngagedCount, alerts: alerts.slice(0, 3), recommendations: recommendations.slice(0, 3) };
}
