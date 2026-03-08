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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { FileDown, Printer, Map as MapIcon, BookOpen, ClipboardCheck, Users, TrendingUp, Activity, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import { getLevelColor } from '@/types/demo';
import type { Level } from '@/types/demo';
import { IGNITE_PACKS, computePackStatusForUser } from '@/pages/Ignite';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';

function KPICard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
function DeltaBadge({ current, previous, suffix = '' }: { current: number; previous: number | null; suffix?: string }) {
  if (previous === null) return <span className="text-xs text-muted-foreground">—</span>;
  const delta = current - previous;
  if (delta === 0) return <span className="text-xs text-muted-foreground">No change</span>;
  const isUp = delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(delta)}{suffix}
    </span>
  );
}

/* ── Authenticated Reports (DB-backed, org-wide for admin, team-scoped for manager) ── */
function AuthenticatedReports() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { members, teams, checkIns, loading } = useTeamData();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('whole');

  const filteredMembers = useMemo(() => {
    if (selectedTeam === 'all') return members;
    return members.filter(m => m.teamId === selectedTeam);
  }, [selectedTeam, members]);

  const filteredMemberIds = useMemo(() => new Set(filteredMembers.map(m => m.id)), [filteredMembers]);

  const filteredCheckIns = useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;
    if (dateRange === '7') cutoff = new Date(now.getTime() - 7 * 86400000);
    else if (dateRange === '30') cutoff = new Date(now.getTime() - 30 * 86400000);
    return checkIns.filter(ci => {
      if (!filteredMemberIds.has(ci.userId)) return false;
      if (cutoff && new Date(ci.createdAt) < cutoff) return false;
      return true;
    });
  }, [checkIns, filteredMemberIds, dateRange]);

  const thisWeek = getWeekRange();
  const lastWeek = getLastWeekRange();

  const ciThisWeek = useMemo(() => {
    return new Set(filteredCheckIns.filter(ci => {
      const d = new Date(ci.createdAt).getTime();
      return d >= thisWeek.start.getTime() && d <= thisWeek.end.getTime();
    }).map(ci => ci.userId));
  }, [filteredCheckIns, thisWeek]);

  const ciLastWeek = useMemo(() => {
    return new Set(checkIns.filter(ci => {
      if (!filteredMemberIds.has(ci.userId)) return false;
      const d = new Date(ci.createdAt).getTime();
      return d >= lastWeek.start.getTime() && d <= lastWeek.end.getTime();
    }).map(ci => ci.userId));
  }, [checkIns, filteredMemberIds, lastWeek]);

  const activeStreaks = useMemo(() => filteredMembers.filter(m => m.streak > 0).length, [filteredMembers]);

  const checkInsByWeek = useMemo(() => {
    const map: Record<number, number> = {};
    filteredCheckIns.forEach(ci => {
      const wn = ci.weekNumber ?? 0;
      map[wn] = (map[wn] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => +a - +b).map(([week, count]) => ({ week: `Week ${week}`, count }));
  }, [filteredCheckIns]);

  const learnerData = useMemo(() => {
    return filteredMembers.map(m => {
      const userCIs = checkIns.filter(ci => ci.userId === m.id);
      const lastActivity = userCIs.length > 0
        ? new Date(Math.max(...userCIs.map(ci => new Date(ci.createdAt).getTime()))).toLocaleDateString()
        : 'N/A';
      return { name: m.fullName, role: m.role, xp: m.xp, streak: m.streak, level: m.level, lastActivity, teamName: m.teamName };
    });
  }, [filteredMembers, checkIns]);

  const activeRate = filteredMembers.length > 0
    ? Math.round((ciThisWeek.size / filteredMembers.length) * 100)
    : 0;
  const lastWeekActiveRate = filteredMembers.length > 0 && ciLastWeek.size > 0
    ? Math.round((ciLastWeek.size / filteredMembers.length) * 100)
    : null;

  const exportCSV = () => {
    const csv = [
      'Name,Role,Team,XP,Streak,Level,Last Activity',
      ...learnerData.map(l => `${l.name},${l.role},${l.teamName},${l.xp},${l.streak},${l.level},${l.lastActivity}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'igniteup-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartConfig = {
    count: { label: 'Check-ins', color: 'hsl(var(--primary))' },
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted-foreground">Loading reports…</p></div>;
  }

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Progress, practice signals, and team snapshot.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print report
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-black">IgniteUp — Reporting Pack</h1>
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Scope selector */}
      {teams.length > 1 && (
        <div className="flex gap-3 print:hidden">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Team" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All My Teams</SelectItem>
              {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="whole">Whole journey</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      {teams.length <= 1 && (
        <div className="flex gap-3 print:hidden">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="whole">Whole journey</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Executive Summary */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Executive summary</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/20">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Participation (7d)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">{activeRate}%</span>
                <DeltaBadge current={activeRate} previous={lastWeekActiveRate} suffix="%" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Check-ins (7d)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">{ciThisWeek.size}/{filteredMembers.length}</span>
                <DeltaBadge current={ciThisWeek.size} previous={ciLastWeek.size > 0 ? ciLastWeek.size : null} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/20">
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground">Active Streaks</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">{activeStreaks}/{filteredMembers.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <KPICard icon={Users} label="Team Members" value={String(filteredMembers.length)} />
        <KPICard icon={Activity} label="Total Check-ins" value={String(filteredCheckIns.length)} />
        <KPICard icon={Flame} label="Avg XP" value={filteredMembers.length > 0 ? String(Math.round(filteredMembers.reduce((s, m) => s + m.xp, 0) / filteredMembers.length)) : '0'} />
        <KPICard icon={TrendingUp} label="Avg Streak" value={filteredMembers.length > 0 ? String(Math.round(filteredMembers.reduce((s, m) => s + m.streak, 0) / filteredMembers.length)) : '0'} />
      </div>

      {/* Practice Activity Chart */}
      {checkInsByWeek.length > 0 ? (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Practice Activity by Week</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={checkInsByWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-8">No check-in activity yet. Data will appear as team members submit check-ins.</p>
          </CardContent>
        </Card>
      )}

      {/* Learner Progress Table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Team Members</CardTitle></CardHeader>
        <CardContent>
          {learnerData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">XP</TableHead>
                  <TableHead className="text-center">Streak</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {learnerData.map(l => (
                  <TableRow key={l.name}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{l.role}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.teamName}</TableCell>
                    <TableCell className="text-center">{l.xp}</TableCell>
                    <TableCell className="text-center">{l.streak}</TableCell>
                    <TableCell><span className={getLevelColor(l.level as Level)}>{l.level}</span></TableCell>
                    <TableCell>{l.lastActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No team members found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Demo Executive Summary (unchanged) ── */
function DemoExecutiveSummary({ users, checkIns }: { users: { id: string }[]; checkIns: { userId: string; createdAt: string }[] }) {
  const thisWeek = getWeekRange();
  const lastWeek = getLastWeekRange();

  const computeActiveCount = () => {
    return users.filter(user => {
      const unitProg = getSeededUnitProgressForUser(user.id);
      const packStatuses = IGNITE_PACKS.map(pack =>
        computePackStatusForUser(pack, unitProg, checkIns, user.id)
      );
      return packStatuses.every(ps => ps.status === 'active');
    }).length;
  };

  const activeCount = computeActiveCount();
  const activeRate = users.length > 0 ? Math.round((activeCount / users.length) * 100) : 0;
  const dueCount = users.length - activeCount;

  const checkInsThisWeek = checkIns.filter(ci => {
    const d = new Date(ci.createdAt).getTime();
    return d >= thisWeek.start.getTime() && d <= thisWeek.end.getTime();
  });
  const checkInsLastWeek = checkIns.filter(ci => {
    const d = new Date(ci.createdAt).getTime();
    return d >= lastWeek.start.getTime() && d <= lastWeek.end.getTime();
  });

  const ciThisWeekUsers = new Set(checkInsThisWeek.map(ci => ci.userId));
  const ciLastWeekUsers = new Set(checkInsLastWeek.map(ci => ci.userId));

  const lastWeekActiveRate = users.length > 0 ? Math.round((ciLastWeekUsers.size / users.length) * 100) : null;
  const lastWeekDue = ciLastWeekUsers.size > 0 ? users.length - ciLastWeekUsers.size : null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Executive summary</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-primary/20">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Active rate</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{activeRate}%</span>
              <DeltaBadge current={activeRate} previous={lastWeekActiveRate} suffix="%" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Due</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{dueCount}</span>
              <DeltaBadge current={dueCount} previous={lastWeekDue} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Check-ins (7 days)</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold">{ciThisWeekUsers.size}/{users.length}</span>
              <DeltaBadge current={ciThisWeekUsers.size} previous={ciLastWeekUsers.size > 0 ? ciLastWeekUsers.size : null} />
            </div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Deltas compare this week vs last week.</p>
    </div>
  );
}

/* ── Demo Reports (original, untouched logic) ── */
function DemoReports() {
  const { state } = useDemo();
  const { modules, journey, moduleProgress, unitProgress } = useJourney();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('whole');
  const isManager = state.currentRole === 'manager' || state.currentRole === 'admin';
  const activeUsers = state.users.filter(u => u.role !== 'admin');

  const filteredUsers = useMemo(() => {
    if (selectedTeam === 'all') return state.users;
    return state.users.filter(u => u.teamId === selectedTeam);
  }, [selectedTeam, state.users]);

  const filteredUserIds = useMemo(() => new Set(filteredUsers.map(u => u.id)), [filteredUsers]);

  const filteredCheckIns = useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;
    if (dateRange === '7') cutoff = new Date(now.getTime() - 7 * 86400000);
    else if (dateRange === '30') cutoff = new Date(now.getTime() - 30 * 86400000);
    return state.checkIns.filter(ci => {
      if (!filteredUserIds.has(ci.userId)) return false;
      if (cutoff && new Date(ci.createdAt) < cutoff) return false;
      return true;
    });
  }, [state.checkIns, filteredUserIds, dateRange]);

  const journeyModuleIds = useMemo(() => [...new Set(journey.steps.map(s => s.moduleId))], [journey.steps]);
  const modulesCompleted = useMemo(() => journeyModuleIds.filter(id => moduleProgress[id]?.status === 'completed').length, [journeyModuleIds, moduleProgress]);
  const totalModules = journeyModuleIds.length;

  const allUnitIds = useMemo(() => modules.flatMap(m => (m.units || []).map(u => u.unitId)), [modules]);
  const unitsCompleted = useMemo(() => allUnitIds.filter(id => unitProgress[id]?.status === 'completed').length, [allUnitIds, unitProgress]);
  const totalUnits = allUnitIds.length;

  const checkInsCompleted = filteredCheckIns.length;
  const activeStreaks = useMemo(() => filteredUsers.filter(u => u.streak > 0).length, [filteredUsers]);

  const activeUsersCount = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const ids = new Set(
      state.checkIns
        .filter(ci => filteredUserIds.has(ci.userId) && new Date(ci.createdAt) >= sevenDaysAgo)
        .map(ci => ci.userId)
    );
    return ids.size;
  }, [state.checkIns, filteredUserIds]);

  const filteredBarometer = useMemo(() => state.barometerResponses.filter(br => filteredUserIds.has(br.userId)), [state.barometerResponses, filteredUserIds]);

  const barometerAgg = useMemo(() => {
    const dims = ['confidence', 'engagement', 'clarity'] as const;
    const maxWeek = filteredBarometer.length > 0 ? Math.max(...filteredBarometer.map(b => b.weekNumber)) : 1;
    return dims.map(dim => {
      const week1 = filteredBarometer.filter(br => br.weekNumber === 1);
      const latest = filteredBarometer.filter(br => br.weekNumber === maxWeek);
      const baseline = week1.length > 0 ? week1.reduce((s, br) => s + br.scores[dim], 0) / week1.length : 0;
      const current = latest.length > 0 ? latest.reduce((s, br) => s + br.scores[dim], 0) / latest.length : 0;
      return { dimension: dim, baseline: +baseline.toFixed(1), current: +current.toFixed(1), delta: +(current - baseline).toFixed(1) };
    });
  }, [filteredBarometer]);

  const checkInsByWeek = useMemo(() => {
    const map: Record<number, number> = {};
    filteredCheckIns.forEach(ci => { map[ci.weekNumber] = (map[ci.weekNumber] || 0) + 1; });
    return Object.entries(map).sort(([a], [b]) => +a - +b).map(([week, count]) => ({ week: `Week ${week}`, count }));
  }, [filteredCheckIns]);

  const unitCompletionByWeek = useMemo(() => {
    const weekMap: Record<number, { total: number; completed: number }> = {};
    journey.steps.forEach(step => {
      const mod = modules.find(m => m.id === step.moduleId);
      const units = mod?.units || [];
      if (!weekMap[step.weekNumber]) weekMap[step.weekNumber] = { total: 0, completed: 0 };
      weekMap[step.weekNumber].total += units.length || 1;
      if (units.length > 0) {
        weekMap[step.weekNumber].completed += units.filter(u => unitProgress[u.unitId]?.status === 'completed').length;
      } else if (moduleProgress[step.moduleId]?.status === 'completed') {
        weekMap[step.weekNumber].completed += 1;
      }
    });
    return Object.entries(weekMap).sort(([a], [b]) => +a - +b).map(([w, d]) => ({ week: `Week ${w}`, completed: d.completed, total: d.total }));
  }, [journey, modules, moduleProgress, unitProgress]);

  const learnerData = useMemo(() => {
    return filteredUsers.map(user => {
      const userCheckIns = state.checkIns.filter(ci => ci.userId === user.id);
      const lastActivity = userCheckIns.length > 0
        ? new Date(Math.max(...userCheckIns.map(ci => new Date(ci.createdAt).getTime()))).toLocaleDateString()
        : 'N/A';
      return { name: user.name, role: user.role, modulesCompleted, unitsCompleted, lastActivity, level: user.level };
    });
  }, [filteredUsers, state.checkIns, modulesCompleted, unitsCompleted]);

  const moduleData = useMemo(() => {
    return journeyModuleIds.map(modId => {
      const mod = modules.find(m => m.id === modId);
      if (!mod) return null;
      const units = mod.units || [];
      const isCompleted = moduleProgress[modId]?.status === 'completed';
      const pctLearners = isCompleted ? 100 : 0;
      const avgUnitCompletion = units.length > 0
        ? Math.round((units.filter(u => unitProgress[u.unitId]?.status === 'completed').length / units.length) * 100)
        : (isCompleted ? 100 : 0);
      return { title: mod.title, pctLearners, avgUnitCompletion };
    }).filter(Boolean) as { title: string; pctLearners: number; avgUnitCompletion: number }[];
  }, [journeyModuleIds, modules, moduleProgress, unitProgress]);

  const exportCSV = () => {
    const csv = [
      'Name,Role,Modules Completed,Units Completed,Last Activity,Level',
      ...learnerData.map(l => `${l.name},${l.role},${l.modulesCompleted},${l.unitsCompleted},${l.lastActivity},${l.level}`),
      '',
      'Module Completion',
      'Module Title,% Learners Completed,Avg Unit Completion',
      ...moduleData.map(m => `${m.title},${m.pctLearners}%,${m.avgUnitCompletion}%`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'igniteup-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartConfig = {
    count: { label: 'Check-ins', color: 'hsl(var(--primary))' },
    completed: { label: 'Completed', color: 'hsl(var(--primary))' },
    total: { label: 'Total', color: 'hsl(var(--muted-foreground))' },
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Progress, practice signals, and ROI snapshot.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print report
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <FileDown className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-black">IgniteUp — Reporting Pack</h1>
        <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="flex gap-3 print:hidden">
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Team / Cohort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Teams</SelectItem>
            {state.teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Date range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="whole">Whole journey</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isManager && <DemoExecutiveSummary users={activeUsers} checkIns={state.checkIns} />}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 print:grid-cols-5">
        <KPICard icon={BookOpen} label="Modules Completed" value={`${modulesCompleted} / ${totalModules}`} />
        <KPICard icon={ClipboardCheck} label="Units Completed" value={`${unitsCompleted} / ${totalUnits}`} />
        <KPICard icon={Activity} label="Check-ins" value={String(checkInsCompleted)} sub={`${activeStreaks} active streaks`} />
        <KPICard icon={Users} label="Active Users (7d)" value={String(activeUsersCount)} sub={`of ${filteredUsers.length} total`} />
        <KPICard icon={Flame} label="Ignite Status" value="—" sub="Active / At Risk / Inactive" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> ROI Barometer Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {barometerAgg.map(d => (
              <div key={d.dimension} className="text-center space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground capitalize">{d.dimension}</p>
                <p className="text-2xl font-bold">{d.current}<span className="text-sm text-muted-foreground"> / 5</span></p>
                <p className={`text-sm font-medium ${d.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {d.delta >= 0 ? '+' : ''}{d.delta} from baseline ({d.baseline})
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Unit Completion by Week</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={unitCompletionByWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} opacity={0.3} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-lg">Practice Activity by Week</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={checkInsByWeek}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Learner Progress</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Modules</TableHead>
                <TableHead className="text-center">Units</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {learnerData.map(l => (
                <TableRow key={l.name}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{l.role}</Badge></TableCell>
                  <TableCell className="text-center">{l.modulesCompleted}</TableCell>
                  <TableCell className="text-center">{l.unitsCompleted}</TableCell>
                  <TableCell>{l.lastActivity}</TableCell>
                  <TableCell><span className={getLevelColor(l.level as Level)}>{l.level}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-lg">Module Completion</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead className="text-center">% Learners Completed</TableHead>
                <TableHead className="text-center">Avg Unit Completion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduleData.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell className="text-center">{m.pctLearners}%</TableCell>
                  <TableCell className="text-center">{m.avgUnitCompletion}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Router: pick authenticated vs demo ── */
export default function Reports() {
  const { user } = useAuth();
  
  if (user) return <AuthenticatedReports />;
  return <DemoReports />;
}
