import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/hooks/useAuth';
import { useTeamData } from '@/hooks/useTeamData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLevelColor } from '@/types/demo';
import { Flame, Copy, AlertTriangle, ClipboardCheck, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { IGNITE_PACKS, computePackStatusForUser, STATUS_CONFIG, type IgniteStatus } from '@/pages/Ignite';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';
import { getWeekRange } from '@/lib/week-utils';

const CHECK_IN_NUDGE = "Quick reminder: please submit your 60s check-in this week — it keeps your progress visible. Reply if you need support.";

/* ── Authenticated team page (real DB data) ── */
function AuthenticatedTeamLeaderboard() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { members, teams, checkIns, loading } = useTeamData();
  const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');
  const weekLabel = getWeekRange().label;
  const isManager = role === 'manager';
  const teamName = teams.map(t => t.name).join(', ');

  const sorted = useMemo(() => {
    return [...members].sort((a, b) =>
      sortBy === 'xp' ? b.xp - a.xp : b.streak - a.streak
    );
  }, [members, sortBy]);

  // Missing check-ins (no check-in in last 7 days)
  const missingCheckIns = useMemo(() => {
    if (!isManager) return [];
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    return members.filter(m => {
      const recent = checkIns.some(
        ci => ci.userId === m.id && new Date(ci.createdAt).getTime() >= sevenDaysAgo
      );
      return !recent;
    }).slice(0, 3);
  }, [isManager, members, checkIns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{weekLabel}</p>
        {teamName && <p className="text-sm text-muted-foreground mt-1">{teamName}</p>}
      </div>

      {/* Team Health cards — Manager only */}
      {isManager && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Missing check-ins */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Missing check-ins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missingCheckIns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Everyone checked in this week.</p>
              ) : (
                <>
                  {missingCheckIns.map(m => (
                    <div key={m.id} className="flex items-center justify-between">
                      <span className="text-sm">{m.fullName}</span>
                      <Badge variant="outline" className="text-xs text-muted-foreground">No check-in</Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mt-1"
                    onClick={() => {
                      navigator.clipboard.writeText(CHECK_IN_NUDGE);
                      toast.success('Copied');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy nudge
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">View:</span>
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            className={`px-3 py-1 text-xs font-medium transition-colors ${sortBy === 'xp' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSortBy('xp')}
          >
            XP
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium transition-colors ${sortBy === 'streak' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSortBy('streak')}
          >
            Streak
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardContent className="pt-6 space-y-1">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No team members yet.</p>
          ) : (
            sorted.map((member, i) => (
              <div
                key={member.id}
                className={`flex items-center justify-between py-3 px-3 rounded-md ${i === 0 ? 'bg-accent/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold w-8 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{member.fullName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {member.streak > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3" />
                      {member.streak}
                    </div>
                  )}
                  <Badge variant="outline" className={`${getLevelColor(member.level as any)} border-current text-xs`}>
                    {member.level}
                  </Badge>
                  <span className="text-sm font-medium w-16 text-right">
                    {sortBy === 'xp' ? `${member.xp} XP` : `${member.streak} wk`}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Demo team page (seed data, unchanged) ── */
function DemoTeamLeaderboard() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<'xp' | 'streak'>('xp');

  const isManager = state.currentRole === 'manager' || state.currentRole === 'admin';

  const activeUsers = state.users.filter(u => u.role !== 'admin');
  const currentUser = state.users.find(u => u.id === state.currentUserId);
  const visibleUsers = state.currentRole === 'admin'
    ? activeUsers
    : activeUsers.filter(u => u.teamId === currentUser?.teamId);
  const teamName = state.teams.find(t => t.id === currentUser?.teamId)?.name;
  const weekLabel = getWeekRange().label;

  // Due members (At Risk / Inactive overall)
  const dueMembers = useMemo(() => {
    if (!isManager) return [];
    return activeUsers.filter(user => {
      const unitProg = getSeededUnitProgressForUser(user.id);
      const packStatuses = IGNITE_PACKS.map(pack =>
        computePackStatusForUser(pack, unitProg, state.checkIns, user.id)
      );
      return packStatuses.some(ps => ps.status === 'at_risk' || ps.status === 'inactive');
    }).slice(0, 3);
  }, [isManager, activeUsers, state.checkIns]);

  // Missing check-ins (no check-in in last 7 days)
  const missingCheckIns = useMemo(() => {
    if (!isManager) return [];
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    return activeUsers.filter(user => {
      const recent = state.checkIns.some(
        ci => ci.userId === user.id && new Date(ci.createdAt).getTime() >= sevenDaysAgo
      );
      return !recent;
    }).slice(0, 3);
  }, [isManager, activeUsers, state.checkIns]);

  // Sorted leaderboard
  const sorted = useMemo(() => {
    return [...visibleUsers].sort((a, b) =>
      sortBy === 'xp' ? b.xp - a.xp : b.streak - a.streak
    );
  }, [visibleUsers, sortBy]);

  const getOverallStatus = (userId: string): IgniteStatus => {
    const unitProg = getSeededUnitProgressForUser(userId);
    const packStatuses = IGNITE_PACKS.map(pack =>
      computePackStatusForUser(pack, unitProg, state.checkIns, userId)
    );
    const hasAtRisk = packStatuses.some(ps => ps.status === 'at_risk' || ps.status === 'inactive');
    if (hasAtRisk) {
      const inactiveCount = packStatuses.filter(ps => ps.status === 'inactive').length;
      return inactiveCount >= 2 ? 'inactive' : 'at_risk';
    }
    return 'active';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{weekLabel}</p>
        {state.currentRole !== 'admin' && teamName && (
          <p className="text-sm text-muted-foreground mt-1">{teamName}</p>
        )}
      </div>

      {/* Team Health cards — Manager only */}
      {isManager && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Top 3 Due */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Top 3 Due
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dueMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">All clear — no Due members this week.</p>
              ) : (
                <>
                  {dueMembers.map(user => {
                    const status = getOverallStatus(user.id);
                    const cfg = STATUS_CONFIG[status];
                    return (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{user.name}</span>
                          <Badge variant="outline" className={`text-xs ${cfg.color} border-current`}>
                            {cfg.label}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                          onClick={() => navigate('/app/ignite-team?filter=due')}
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  {dueMembers.length < 3 && (
                    <p className="text-xs text-muted-foreground italic">All clear for remaining slots.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Missing check-ins */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                Missing check-ins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missingCheckIns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Everyone checked in this week.</p>
              ) : (
                <>
                  {missingCheckIns.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <span className="text-sm">{user.name}</span>
                      <Badge variant="outline" className="text-xs text-muted-foreground">No check-in</Badge>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mt-1"
                    onClick={() => {
                      navigator.clipboard.writeText(CHECK_IN_NUDGE);
                      toast.success('Copied');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy nudge
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">View:</span>
        <div className="flex rounded-md border border-border overflow-hidden">
          <button
            className={`px-3 py-1 text-xs font-medium transition-colors ${sortBy === 'xp' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSortBy('xp')}
          >
            XP
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium transition-colors ${sortBy === 'streak' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
            onClick={() => setSortBy('streak')}
          >
            Streak
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardContent className="pt-6 space-y-1">
          {sorted.map((user, i) => (
            <div
              key={user.id}
              className={`flex items-center justify-between py-3 px-3 rounded-md ${
                i === 0 ? 'bg-accent/50' : ''
              } ${user.id === state.currentUserId ? 'ring-1 ring-primary/30' : ''}`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold w-8 text-center ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.streak > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="h-3 w-3" />
                    {user.streak}
                  </div>
                )}
                <Badge variant="outline" className={`${getLevelColor(user.level)} border-current text-xs`}>
                  {user.level}
                </Badge>
                <span className="text-sm font-medium w-16 text-right">
                  {sortBy === 'xp' ? `${user.xp} XP` : `${user.streak} wk`}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeamLeaderboard() {
  const { user } = useAuth();
  return user ? <AuthenticatedTeamLeaderboard /> : <DemoTeamLeaderboard />;
}
