import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Map, BookOpen, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';
import { leadershipThemes } from '@/data/leadership-moments';
import type { LeadershipThemeId } from '@/types/demo';

const themeLabels: Record<string, string> = {
  direction: 'Direction',
  alignment: 'Alignment',
  ownership: 'Ownership',
  energy: 'Energy',
};

const themeBadgeStyles: Record<string, string> = {
  direction: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  alignment: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ownership: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  energy: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

// Build a flat lookup of momentId → moment data
const momentLookup = (() => {
  const map: Record<string, { title: string; action: string; themeId: string }> = {};
  for (const theme of leadershipThemes) {
    for (const habit of theme.habits) {
      for (const moment of habit.moments) {
        map[moment.id] = { title: moment.title, action: moment.action, themeId: theme.id };
      }
    }
  }
  return map;
})();

export default function Challenges() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const { journey, modules } = useJourney();

  const feedbackModule = modules.find(m => m.id === 'mod-1');
  const isLinkedToJourney = journey.steps.some(s => s.moduleId === 'mod-1');

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
                {ch.themeId && (
                  <Badge variant="outline" className={`w-fit text-[10px] px-2 py-0 ${themeBadgeStyles[ch.themeId]}`}>
                    {themeLabels[ch.themeId]}
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ch.title}</CardTitle>
                  <Badge variant={statusVariant(ch.status)}>{statusLabel(ch.status)}</Badge>
                </div>
                <CardDescription>{ch.description}</CardDescription>
                <p className="text-xs text-muted-foreground">
                  {ch.startDate} → {ch.endDate}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Leadership Actions */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Leadership Actions</p>
                  {ch.weeklyActions.map((a, idx) => {
                    const moment = a.momentId ? momentLookup[a.momentId] : null;
                    return (
                      <div key={a.id} className="flex items-start justify-between gap-3 text-sm border border-border/50 rounded-lg p-3">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">Week {idx + 1}</span>
                            {moment && (
                              <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${themeBadgeStyles[moment.themeId]}`}>
                                {themeLabels[moment.themeId]}
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{a.label}</p>
                          {moment && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{moment.action.split('\n')[0]}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-primary font-medium text-xs">+{a.points} XP</span>
                          {a.momentId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                              onClick={() => navigate('/app/moment-library')}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Open moment
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* How to do it — only for active challenges */}
                {ch.status === 'active' && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <p className="text-sm font-semibold">How to do it (2 minutes)</p>
                    <ul className="space-y-1.5 text-sm text-muted-foreground list-disc ml-5">
                      <li>Pick one colleague you worked with this week.</li>
                      <li>Use the SBI template: Situation → Behavior → Impact.</li>
                      <li>Keep it factual — no judgments, just observations.</li>
                      <li>Send it via chat, email, or say it face-to-face.</li>
                    </ul>
                    {isLinkedToJourney && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Map className="h-3.5 w-3.5" />
                        <span className="font-medium">Linked to your journey</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="gap-2" onClick={handleCopySBI}>
                        <Copy className="h-3.5 w-3.5" />
                        Copy SBI Template
                      </Button>
                      {feedbackModule?.playbookRoute && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(feedbackModule.playbookRoute!)}>
                          <BookOpen className="h-3.5 w-3.5" />
                          Open Playbook
                        </Button>
                      )}
                      <Button size="sm" variant="link" className="gap-1.5" onClick={() => navigate('/app/journey')}>
                        <Map className="h-3.5 w-3.5" />
                        Back to My Journey
                      </Button>
                    </div>
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
