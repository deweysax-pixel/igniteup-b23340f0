import { AlertTriangle } from 'lucide-react';

interface KeyTakeawayProps {
  takeaways: string[];
}

export function computeKeyTakeaways(
  participationRate: number,
  behaviorBreakdown: { label: string; pct: number }[],
  avgStreak: number,
  consistency: 'Low' | 'Medium' | 'High',
  weeklyTrend: 'increasing' | 'stable' | 'decreasing',
): string[] {
  const items: string[] = [];

  // Participation
  if (participationRate < 30) items.push('Participation is critically low.');
  else if (participationRate < 50) items.push('Participation needs attention.');
  else if (participationRate >= 80) items.push('Participation is strong.');

  // Consistency / habits
  if (consistency === 'Low') items.push('Leadership habits are not forming.');
  else if (consistency === 'High' && avgStreak >= 3) items.push('Leadership habits are building well.');

  // Trend
  if (weeklyTrend === 'decreasing') items.push('Engagement is trending downward.');
  else if (weeklyTrend === 'increasing') items.push('Engagement momentum is positive.');

  // Behavior gaps
  const weak = behaviorBreakdown.filter(b => b.pct < 10);
  if (weak.length >= 2) items.push('Multiple behavior gaps detected.');
  else if (weak.length === 1) items.push(`${weak[0].label} is underrepresented.`);

  // Urgency
  if (participationRate < 30 && consistency === 'Low') {
    items.push('Immediate action is required.');
  }

  return items.slice(0, 3);
}

export function KeyTakeaway({ takeaways }: KeyTakeawayProps) {
  if (takeaways.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-primary/15">
          <AlertTriangle className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Key Takeaway</h2>
      </div>
      <ul className="space-y-1.5">
        {takeaways.map((t, i) => (
          <li key={i} className="text-sm font-medium text-foreground/90 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
