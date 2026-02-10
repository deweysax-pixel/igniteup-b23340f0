import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLevelColor } from '@/types/demo';
import { TrendingUp, Users, Flame, Trophy } from 'lucide-react';

export default function Dashboard() {
  const { state, currentUser } = useDemo();
  const activeChallenge = state.challenges.find(c => c.status === 'active');

  // KPI calculations
  const activeUsers = state.users.filter(u => u.role !== 'admin');
  const participantsWithCheckIn = new Set(
    state.checkIns.filter(ci => ci.challengeId === activeChallenge?.id).map(ci => ci.userId)
  );
  const participationRate = activeUsers.length > 0
    ? Math.round((participantsWithCheckIn.size / activeUsers.length) * 100)
    : 0;
  const avgStreak = activeUsers.length > 0
    ? (activeUsers.reduce((s, u) => s + u.streak, 0) / activeUsers.length).toFixed(1)
    : '0';
  const avgXP = activeUsers.length > 0
    ? Math.round(activeUsers.reduce((s, u) => s + u.xp, 0) / activeUsers.length)
    : 0;

  // Leaderboard top 5
  const leaderboard = [...activeUsers]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        {activeChallenge && (
          <p className="text-sm text-muted-foreground mt-1">{activeChallenge.title}</p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participation</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participationRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Streak</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgStreak} wk</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. XP</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgXP}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Level</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {currentUser && (
              <div className={`text-2xl font-bold ${getLevelColor(currentUser.level)}`}>
                {currentUser.level}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mini Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 — Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.map((user, i) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  #{i + 1}
                </span>
                <span className="text-sm">{user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getLevelColor(user.level)} border-current text-xs`}>
                  {user.level}
                </Badge>
                <span className="text-sm text-muted-foreground w-14 text-right">{user.xp} XP</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
