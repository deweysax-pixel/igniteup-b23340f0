import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';

export default function Challenges() {
  const { state } = useDemo();

  const statusLabel = (s: string) => {
    switch (s) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return s;
    }
  };

  const statusVariant = (s: string) => {
    return s === 'active' ? 'default' : 'secondary';
  };

  const handleCopySBI = async () => {
    await copyToClipboard(SBI_TEMPLATE);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Challenges</h2>

      {state.challenges.length === 0 ? (
        <p className="text-muted-foreground">No active challenge at the moment. Create one to kick things off.</p>
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
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  {ch.startDate} → {ch.endDate}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Weekly Actions</p>
                  {ch.weeklyActions.map(a => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span>{a.label}</span>
                      <span className="text-primary font-medium">+{a.points} pts</span>
                    </div>
                  ))}
                </div>

                {/* How to do it — only for the active feedback challenge */}
                {ch.status === 'active' && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-sm font-semibold">How to do it (2 minutes)</p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground list-disc ml-5">
                      <li>Pick one colleague you worked with this week.</li>
                      <li>Use the SBI template: Situation → Behavior → Impact.</li>
                      <li>Keep it factual — no judgments, just observations.</li>
                      <li>Send it via chat, email, or say it face-to-face.</li>
                    </ul>
                    <Button size="sm" variant="outline" className="gap-2" onClick={handleCopySBI}>
                      <Copy className="h-3.5 w-3.5" />
                      Copy SBI Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
