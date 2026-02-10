import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Admin() {
  const { state } = useDemo();

  const teamsData = state.teams.map(team => {
    const members = state.users.filter(u => team.memberIds.includes(u.id));
    const avgXP = members.length > 0 ? Math.round(members.reduce((s, u) => s + u.xp, 0) / members.length) : 0;
    const checkIns = state.checkIns.filter(ci => members.some(m => m.id === ci.userId));
    return { ...team, members, avgXP, totalCheckIns: checkIns.length };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">{state.organization.name}</p>
        </div>
        <Button variant="outline" onClick={() => toast.info('Simulated export — demo feature.')}>
          Export Data
        </Button>
      </div>

      {/* Teams overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {teamsData.map(team => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="text-base">{team.name}</CardTitle>
              <CardDescription>{team.members.length} members · {team.totalCheckIns} check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. XP</span>
                <span className="text-lg font-bold">{team.avgXP}</span>
              </div>
              <div className="mt-3 space-y-1">
                {team.members.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span>{m.name}</span>
                    <span className="text-muted-foreground">{m.xp} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Challenges management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Challenge Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.challenges.map(ch => (
            <div key={ch.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{ch.title}</p>
                <p className="text-xs text-muted-foreground">{ch.startDate} → {ch.endDate}</p>
              </div>
              <Badge variant={ch.status === 'active' ? 'default' : 'secondary'}>
                {ch.status === 'active' ? 'Active' : ch.status === 'upcoming' ? 'Upcoming' : 'Completed'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
