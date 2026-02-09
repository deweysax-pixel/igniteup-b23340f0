import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLevelColor } from '@/types/demo';
import { Flame } from 'lucide-react';

export default function TeamLeaderboard() {
  const { state } = useDemo();

  const activeUsers = state.users
    .filter(u => u.role !== 'admin')
    .sort((a, b) => b.xp - a.xp);

  // Filter by team if manager/participant
  const currentUser = state.users.find(u => u.id === state.currentUserId);
  const visibleUsers = state.currentRole === 'admin'
    ? activeUsers
    : activeUsers.filter(u => u.teamId === currentUser?.teamId);

  const teamName = state.teams.find(t => t.id === currentUser?.teamId)?.name;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Classement</h2>
        {state.currentRole !== 'admin' && teamName && (
          <p className="text-sm text-muted-foreground mt-1">{teamName}</p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-1">
          {visibleUsers.map((user, i) => (
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
                <span className="text-sm font-medium w-16 text-right">{user.xp} XP</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
