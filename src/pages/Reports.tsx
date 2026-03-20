import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWeekRange, getLastWeekRange } from '@/lib/week-utils';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { useAuth } from '@/hooks/useAuth';
import { useTeamData } from '@/hooks/useTeamData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  FileDown, Printer, Map as MapIcon,
  Users, TrendingUp, Activity, Flame,
  ArrowUp, ArrowDown, Minus,
  Lightbulb, BarChart3, Target, Zap,
} from 'lucide-react';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';
import { TeamActionPanel, computeManagerActions } from '@/components/reports/TeamActionPanel';
import { KeyTakeaway, computeKeyTakeaways } from '@/components/reports/KeyTakeaway';

/* ── Shared helpers ── */

function ConsistencyBadge({ level }: { level: 'Low' | 'Medium' | 'High' }) {
  const colors = {
    Low: 'bg-destructive/15 text-destructive border-destructive/30',
    Medium: 'bg-warning/15 text-warning border-warning/30',
    High: 'bg-success/15 text-success border-success/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors[level]}`}>
      {level}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: 'increasing' | 'stable' | 'decreasing' }) {
  if (trend === 'increasing') return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><ArrowUp className="h-3 w-3" /> Increasing</span>;
  if (trend === 'decreasing') return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><ArrowDown className="h-3 w-3" /> Decreasing</span>;
  return <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><Minus className="h-3 w-3" /> Stable</span>;
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

function MetricTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function BehaviorBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InsightRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/* ── Compute behavior distribution from check-in data ── */
function computeBehaviorBreakdown(checkIns: { note: string | null }[]) {
  const categories = { Recognition: 0, Feedback: 0, Delegation: 0, Communication: 0 };
  const keywords: Record<string, string[]> = {
    Recognition: ['recogni', 'appreciat', 'thank', 'praise', 'shout', 'kudos', 'celebrated'],
    Feedback: ['feedback', 'review', 'improv', 'suggest', 'constructive', 'coaching'],
    Delegation: ['delegat', 'assign', 'empower', 'responsib', 'ownership', 'entrust'],
    Communication: ['communicat', 'align', 'clari', 'share', 'explain', 'discuss', 'update'],
  };

  checkIns.forEach(ci => {
    const text = (ci.note ?? '').toLowerCase();
    if (!text) return;
    for (const [cat, kws] of Object.entries(keywords)) {
      if (kws.some(kw => text.includes(kw))) {
        categories[cat as keyof typeof categories]++;
      }
    }
  });

  const total = Object.values(categories).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(categories).map(([label, count]) => ({
    label,
    pct: Math.round((count / total) * 100),
  }));
}

/* ── Compute AI-style insights ── */
function generateInsights(
  participationRate: number,
  avgStreak: number,
  behaviorBreakdown: { label: string; pct: number }[],
  weeklyTrend: 'increasing' | 'stable' | 'decreasing',
  consistency: 'Low' | 'Medium' | 'High',
) {
  const insights: string[] = [];

  const topBehavior = [...behaviorBreakdown].sort((a, b) => b.pct - a.pct)[0];
  const bottomBehavior = [...behaviorBreakdown].sort((a, b) => a.pct - b.pct)[0];

  if (topBehavior && topBehavior.pct > 30) {
    insights.push(`${topBehavior.label} is the most practiced leadership behavior across the team.`);
  }
  if (bottomBehavior && bottomBehavior.pct < 15) {
    insights.push(`${bottomBehavior.label} is underused — consider introducing targeted actions.`);
  }
  if (participationRate >= 80) {
    insights.push('Participation is strong — the team is consistently engaged.');
  } else if (participationRate < 50) {
    insights.push('Participation is below 50% — consider nudging inactive members.');
  }
  if (weeklyTrend === 'increasing') {
    insights.push('Weekly activity is trending upward — momentum is building.');
  } else if (weeklyTrend === 'decreasing') {
    insights.push('Weekly activity is declining — a mid-journey boost may help.');
  }
  if (avgStreak >= 3) {
    insights.push('Strong streak consistency indicates developing leadership habits.');
  } else if (avgStreak < 1) {
    insights.push('Low streak average suggests difficulty maintaining weekly habits.');
  }
  if (consistency === 'High') {
    insights.push('Team consistency is high — leadership practice is becoming routine.');
  }

  return insights.slice(0, 5);
}

/* ── Authenticated Reports ── */
function AuthenticatedReports() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const isOrgWide = role === 'admin' || role === 'sponsor';
  const { members, teams, checkIns, loading } = useTeamData({ forceOrgWide: isOrgWide });
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const showTeamSelector = isOrgWide && teams.length > 0;

  const filteredMembers = useMemo(() => {
    if (selectedTeam === 'all') return members;
    return members.filter(m => m.teamId === selectedTeam);
  }, [selectedTeam, members]);

  const filteredMemberIds = useMemo(() => new Set(filteredMembers.map(m => m.id)), [filteredMembers]);

  const filteredCheckIns = useMemo(() => {
    return checkIns.filter(ci => filteredMemberIds.has(ci.userId));
  }, [checkIns, filteredMemberIds]);

  const thisWeek = getWeekRange();

  const ciThisWeek = useMemo(() => {
    return new Set(filteredCheckIns.filter(ci => {
      const d = new Date(ci.createdAt).getTime();
      return d >= thisWeek.start.getTime() && d <= thisWeek.end.getTime();
    }).map(ci => ci.userId));
  }, [filteredCheckIns, thisWeek]);

  const participationRate = filteredMembers.length > 0 ? Math.round((ciThisWeek.size / filteredMembers.length) * 100) : 0;
  const avgActionsPerWeek = filteredCheckIns.length > 0 && filteredMembers.length > 0
    ? (filteredCheckIns.length / Math.max(filteredMembers.length, 1)).toFixed(1)
    : '0';
  const avgStreak = filteredMembers.length > 0
    ? +(filteredMembers.reduce((s, m) => s + m.streak, 0) / filteredMembers.length).toFixed(1)
    : 0;
  const consistency: 'Low' | 'Medium' | 'High' = avgStreak >= 3 ? 'High' : avgStreak >= 1 ? 'Medium' : 'Low';

  const behaviorBreakdown = useMemo(() => computeBehaviorBreakdown(filteredCheckIns), [filteredCheckIns]);
  const behaviorColors = ['bg-primary', 'bg-blue-500', 'bg-amber-500', 'bg-pink-500'];

  const checkInsByWeek = useMemo(() => {
    const map: Record<number, number> = {};
    filteredCheckIns.forEach(ci => {
      const wn = ci.weekNumber ?? 0;
      map[wn] = (map[wn] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => +a - +b).map(([week, count]) => ({ week: `W${week}`, count }));
  }, [filteredCheckIns]);

  const weeklyTrend = useMemo<'increasing' | 'stable' | 'decreasing'>(() => {
    if (checkInsByWeek.length < 2) return 'stable';
    const half = Math.floor(checkInsByWeek.length / 2);
    const firstHalf = checkInsByWeek.slice(0, half).reduce((s, w) => s + w.count, 0) / half;
    const secondHalf = checkInsByWeek.slice(half).reduce((s, w) => s + w.count, 0) / (checkInsByWeek.length - half);
    if (secondHalf > firstHalf * 1.15) return 'increasing';
    if (secondHalf < firstHalf * 0.85) return 'decreasing';
    return 'stable';
  }, [checkInsByWeek]);

  const insights = useMemo(
    () => generateInsights(participationRate, avgStreak, behaviorBreakdown, weeklyTrend, consistency),
    [participationRate, avgStreak, behaviorBreakdown, weeklyTrend, consistency],
  );

  const chartConfig = {
    count: { label: 'Actions', color: 'hsl(var(--primary))' },
  };

  const exportCSV = () => {
    const csv = [
      'Name,Role,Team,XP,Streak,Level',
      ...filteredMembers.map(m => `${m.fullName},${m.role},${m.teamName},${m.xp},${m.streak},${m.level}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadership-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted-foreground">Loading reports…</p></div>;
  }

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leadership Diagnostic</h1>
          <p className="text-muted-foreground mt-1">Behavior patterns, consistency, and actionable insights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Scope selector — visible for Admin & Sponsor only */}
      {showTeamSelector && (
        <div className="print:hidden">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Teams" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Key Takeaway — Sponsor & Admin only */}
      {(role === 'admin' || role === 'sponsor') && (
        <KeyTakeaway takeaways={computeKeyTakeaways(participationRate, behaviorBreakdown, avgStreak, consistency, weeklyTrend)} />
      )}

      {/* Team Action Panel — Manager only */}
      {role === 'manager' && (
        <TeamActionPanel {...computeManagerActions(filteredMembers, ciThisWeek, behaviorBreakdown, participationRate)} />
      )}

      {/* 1. Activity & Consistency */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader icon={Activity} title="Activity & Consistency" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricTile label="Participation rate" value={`${participationRate}%`} />
            <MetricTile label="Avg actions / week" value={avgActionsPerWeek} />
            <MetricTile label="Avg streak" value={String(avgStreak)} />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Consistency</p>
              <div className="pt-1">
                <ConsistencyBadge level={consistency} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Behavior Breakdown */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader icon={BarChart3} title="Behavior Breakdown" />
          <div className="space-y-4 max-w-lg">
            {behaviorBreakdown.map((b, i) => (
              <BehaviorBar key={b.label} label={b.label} pct={b.pct} color={behaviorColors[i % behaviorColors.length]} />
            ))}
          </div>
          {behaviorBreakdown.every(b => b.pct === 25) && (
            <p className="text-xs text-muted-foreground mt-4">Distribution is even — no dominant behavior pattern detected yet.</p>
          )}
        </CardContent>
      </Card>

      {/* 3. Progress Over Time */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={TrendingUp} title="Progress Over Time" />
            <TrendIndicator trend={weeklyTrend} />
          </div>
          {checkInsByWeek.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={checkInsByWeek}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No activity data yet.</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Leadership Insights */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader icon={Zap} title="Leadership Insights" />
          {insights.length > 0 ? (
            <div className="divide-y divide-border/50">
              {insights.map((text, i) => <InsightRow key={i} text={text} />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Not enough data to generate insights yet.</p>
          )}
        </CardContent>
      </Card>

      {/* (Team Action Panel moved to top for Managers) */}
    </div>
  );
}

/* ── Demo Reports ── */
function DemoReports() {
  const { state } = useDemo();
  const { modules, journey, moduleProgress, unitProgress } = useJourney();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  const isManager = state.currentRole === 'manager' || state.currentRole === 'admin' || state.currentRole === 'sponsor';
  const activeUsers = state.users.filter(u => u.role !== 'admin' && u.role !== 'sponsor');

  const filteredUsers = useMemo(() => {
    if (selectedTeam === 'all') return activeUsers;
    return activeUsers.filter(u => u.teamId === selectedTeam);
  }, [selectedTeam, activeUsers]);

  const filteredUserIds = useMemo(() => new Set(filteredUsers.map(u => u.id)), [filteredUsers]);

  const filteredCheckIns = useMemo(() => {
    return state.checkIns.filter(ci => filteredUserIds.has(ci.userId));
  }, [state.checkIns, filteredUserIds]);

  // Activity & Consistency
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const activeIds = useMemo(() => {
    const ids = new Set<string>();
    state.checkIns.forEach(ci => {
      if (filteredUserIds.has(ci.userId) && new Date(ci.createdAt).getTime() >= sevenDaysAgo) {
        ids.add(ci.userId);
      }
    });
    filteredUsers.forEach(user => {
      const userUnitProg = getSeededUnitProgressForUser(user.id);
      const hasRecent = Object.values(userUnitProg).some(
        p => p.status === 'completed' && p.completedAt && new Date(p.completedAt).getTime() >= sevenDaysAgo
      );
      if (hasRecent) ids.add(user.id);
    });
    return ids;
  }, [state.checkIns, filteredUserIds, filteredUsers, sevenDaysAgo]);

  const participationRate = filteredUsers.length > 0 ? Math.round((activeIds.size / filteredUsers.length) * 100) : 0;
  const avgActionsPerWeek = filteredCheckIns.length > 0 && filteredUsers.length > 0
    ? (filteredCheckIns.length / Math.max(filteredUsers.length, 1)).toFixed(1)
    : '0';
  const avgStreak = filteredUsers.length > 0
    ? +(filteredUsers.reduce((s, u) => s + u.streak, 0) / filteredUsers.length).toFixed(1)
    : 0;
  const consistency: 'Low' | 'Medium' | 'High' = avgStreak >= 3 ? 'High' : avgStreak >= 1 ? 'Medium' : 'Low';

  // Behavior Breakdown
  const behaviorBreakdown = useMemo(() => computeBehaviorBreakdown(filteredCheckIns), [filteredCheckIns]);
  const behaviorColors = ['bg-primary', 'bg-blue-500', 'bg-amber-500', 'bg-pink-500'];

  // Progress Over Time
  const checkInsByWeek = useMemo(() => {
    const map: Record<number, number> = {};
    filteredCheckIns.forEach(ci => { map[ci.weekNumber] = (map[ci.weekNumber] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => +a - +b).map(([week, count]) => ({ week: `W${week}`, count }));
  }, [filteredCheckIns]);

  const weeklyTrend = useMemo<'increasing' | 'stable' | 'decreasing'>(() => {
    if (checkInsByWeek.length < 2) return 'stable';
    const half = Math.floor(checkInsByWeek.length / 2);
    const firstHalf = checkInsByWeek.slice(0, half).reduce((s, w) => s + w.count, 0) / half;
    const secondHalf = checkInsByWeek.slice(half).reduce((s, w) => s + w.count, 0) / (checkInsByWeek.length - half);
    if (secondHalf > firstHalf * 1.15) return 'increasing';
    if (secondHalf < firstHalf * 0.85) return 'decreasing';
    return 'stable';
  }, [checkInsByWeek]);

  // Insights
  const insights = useMemo(
    () => generateInsights(participationRate, avgStreak, behaviorBreakdown, weeklyTrend, consistency),
    [participationRate, avgStreak, behaviorBreakdown, weeklyTrend, consistency],
  );

  const chartConfig = {
    count: { label: 'Actions', color: 'hsl(var(--primary))' },
  };

  const exportCSV = () => {
    const csv = [
      'Name,Role,XP,Streak,Level',
      ...filteredUsers.map(u => `${u.name},${u.role},${u.xp},${u.streak},${u.level}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leadership-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (state.currentRole === 'participant') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <h2 className="text-2xl font-semibold">Reports are available to Managers and Admins</h2>
        <p className="text-muted-foreground max-w-md">As a participant, you can track your own progress from your Journey dashboard.</p>
        <Button onClick={() => navigate('/app/journey')}><MapIcon className="h-4 w-4 mr-2" /> Go to My Journey</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leadership Diagnostic</h1>
          <p className="text-muted-foreground mt-1">Behavior patterns, consistency, and actionable insights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-black">IgniteUp — Leadership Diagnostic</h1>
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Scope selector */}
      <div className="print:hidden">
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Team" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {state.teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Team Action Panel — Manager only (demo) */}
      {state.currentRole === 'manager' && (
        <TeamActionPanel {...computeManagerActions(
          filteredUsers.map(u => ({ id: u.id, streak: u.streak })),
          activeIds,
          behaviorBreakdown,
          participationRate,
        )} />
      )}

      {/* 1. Activity & Consistency */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader icon={Activity} title="Activity & Consistency" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricTile label="Participation rate" value={`${participationRate}%`} />
            <MetricTile label="Avg actions / week" value={avgActionsPerWeek} />
            <MetricTile label="Avg streak" value={String(avgStreak)} />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Consistency</p>
              <div className="pt-1">
                <ConsistencyBadge level={consistency} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Behavior Breakdown */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader icon={BarChart3} title="Behavior Breakdown" />
          <div className="space-y-4 max-w-lg">
            {behaviorBreakdown.map((b, i) => (
              <BehaviorBar key={b.label} label={b.label} pct={b.pct} color={behaviorColors[i % behaviorColors.length]} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Progress Over Time */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={TrendingUp} title="Progress Over Time" />
            <TrendIndicator trend={weeklyTrend} />
          </div>
          {checkInsByWeek.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={checkInsByWeek}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No activity data yet.</p>
          )}
        </CardContent>
      </Card>

      {/* 4. Leadership Insights */}
      <Card>
        <CardContent className="pt-6">
          <SectionHeader icon={Zap} title="Leadership Insights" />
          {insights.length > 0 ? (
            <div className="divide-y divide-border/50">
              {insights.map((text, i) => <InsightRow key={i} text={text} />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">Not enough data to generate insights yet.</p>
          )}
        </CardContent>
      </Card>

      {/* (Team Action Panel moved to top for Managers) */}
    </div>
  );
}

/* ── Router ── */
export default function Reports() {
  const { user } = useAuth();
  const { isDemoSession } = useDemo();

  if (isDemoSession || !user) return <DemoReports />;
  return <AuthenticatedReports />;
}
