import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Challenges() {
  const { state } = useDemo();

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return 'Actif';
      case 'upcoming': return 'À venir';
      case 'completed': return 'Terminé';
      default: return s;
    }
  };

  const statusVariant = (s: string) => {
    return s === 'active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Défis</h2>

      {state.challenges.length === 0 ? (
        <p className="text-muted-foreground">Aucun défi actif pour le moment. Créez-en un pour lancer la dynamique.</p>
      ) : (
        <div className="grid gap-4">
          {state.challenges.map(ch => (
            <Card key={ch.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ch.title}</CardTitle>
                  <Badge variant={statusVariant(ch.status)}>{statusLabel(ch.status)}</Badge>
                </div>
                <CardDescription>{ch.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  {ch.startDate} → {ch.endDate}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Actions hebdomadaires</p>
                  {ch.weeklyActions.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span>{a.label}</span>
                      <span className="text-primary font-medium">+{a.points} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
