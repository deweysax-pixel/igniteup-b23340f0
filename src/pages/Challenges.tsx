import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallengeData, getCurrentWeekFromDates } from '@/hooks/useChallengeData';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Copy, Map, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';
import { leadershipThemes } from '@/data/leadership-moments';

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

const themeProgressColors: Record<string, string> = {
  direction: '[&>div]:bg-purple-500',
  alignment: '[&>div]:bg-blue-500',
  ownership: '[&>div]:bg-amber-500',
  energy: '[&>div]:bg-pink-500',
};

const momentInstructions: Record<string, string> = {
  'give-sbi-feedback': 'Use the SBI template to give one short piece of feedback this week.',
  'check-real-understanding': 'Ask a team member to explain the objective in their own words.',
  'clarify-ownership': 'Pick one ambiguous task and name a clear owner for it.',
  'share-team-win': 'Highlight one team achievement in a meeting or message this week.',
  'clarify-real-priority': 'Ask your team: if we could only succeed at one thing this week, what is it?',
  'name-decision-owner': 'In your next meeting, clarify who makes the final call on one open decision.',
  'recognize-contribution': 'Publicly thank one person for a specific contribution this week.',
  'ask-for-proposal': 'Instead of solving a problem yourself, ask someone: what do you propose?',
};

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

const statusLabel = (s: string) => {
  switch (s) {
    case 'active': return 'Active';
    case 'upcoming': return 'Upcoming';
    case 'completed': return 'Completed';
    default: return s;
  }
};

const statusVariant = (s: string) => s === 'active' ? 'default' as const : 'secondary' as const;

export default function Challenges() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { challenges, assignments, teamIds, isActionCompleted, loading } = useChallengeData();
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Challenges page] data', {
      currentUserId: user?.id ?? null,
      currentOrganizationId: profile?.organization_id ?? null,
      currentTeamId: teamIds[0] ?? null,
      challengeRows: challenges,
      assignmentRows: assignments,
    });
  }, [assignments, challenges, profile?.organization_id, teamIds, user?.id]);

  useEffect(() => {
    const id = sessionStorage.getItem('justCreatedChallengeId');
    if (id) {
      sessionStorage.removeItem('justCreatedChallengeId');
      setJustCreatedId(id);
      const timer = setTimeout(() => setJustCreatedId(null), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopySBI = async () => {
    await copyToClipboard(SBI_TEMPLATE);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Challenges</h2>

      {challenges.length === 0 ? (
        <p className="text-muted-foreground">No active challenge at the moment. Create one to kick things off.</p>
      ) : (
        <div className="grid gap-4">
          {challenges.map(ch => {
            const totalWeeks = ch.actions.length;
            const currentWeek = ch.start_date && ch.end_date
              ? getCurrentWeekFromDates(ch.start_date, ch.end_date, totalWeeks)
              : 0;

            const completedCount = ch.actions.filter(a => isActionCompleted(a.id)).length;
            const progressPct = ch.status === 'completed' ? 100
              : ch.status === 'upcoming' ? 0
              : totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

            const isJustCreated = ch.id === justCreatedId;

            return (
              <Card
                key={ch.id}
                className={isJustCreated ? 'ring-1 ring-primary/40 shadow-[0_0_16px_-4px_hsl(var(--primary)/0.3)] animate-fade-in' : ''}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant(ch.status)}>{statusLabel(ch.status)}</Badge>
                      {isJustCreated && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0 bg-primary/10 text-primary border-primary/20 animate-pulse">
                          ✨ Just created
                        </Badge>
                      )}
                    </div>
                    {ch.start_date && ch.end_date && (
                      <p className="text-xs text-muted-foreground">
                        {ch.start_date} → {ch.end_date}
                      </p>
                    )}
                  </div>
                  <CardTitle className="text-lg">{ch.title}</CardTitle>
                  <p className="text-sm text-muted-foreground/80 italic">Become the manager your team actually needs — one action per week.</p>
                  {ch.description && <CardDescription>{ch.description}</CardDescription>}

                  {/* Sprint Progress */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">Progress</span>
                      <span>
                        {ch.status === 'completed'
                          ? 'Completed'
                          : ch.status === 'upcoming'
                            ? 'Not started'
                            : `Week ${currentWeek} / ${totalWeeks}`}
                      </span>
                    </div>
                    <Progress value={progressPct} className="h-1.5 bg-secondary" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Leadership Actions */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Leadership Actions</p>
                    {ch.actions.map(a => {
                      const moment = a.moment_id ? momentLookup[a.moment_id] : null;
                      const instruction = a.description || (a.moment_id ? momentInstructions[a.moment_id] : null);
                      const isCurrentWeek = ch.status === 'active' && a.week_number === currentWeek;
                      const done = isActionCompleted(a.id);

                      return (
                        <div
                          key={a.id}
                          className={`text-sm border rounded-lg p-3 transition-colors ${
                            done
                              ? 'border-green-500/30 bg-green-500/5'
                              : isCurrentWeek
                                ? 'border-primary/30 bg-primary/5'
                                : 'border-border/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-muted-foreground font-medium">Week {a.week_number}</span>
                                {moment && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${themeBadgeStyles[moment.themeId]}`}>
                                      {themeLabels[moment.themeId]}
                                    </Badge>
                                  </>
                                )}
                                {isCurrentWeek && !done && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs font-medium text-primary">🔥 This week</span>
                                  </>
                                )}
                                {done && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs font-medium text-green-500">✅ Done</span>
                                  </>
                                )}
                              </div>
                              <p className="font-medium">{a.label}</p>
                              {instruction && (
                                <p className="text-xs text-muted-foreground whitespace-pre-line">{instruction}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                              <span className={`font-semibold text-xs ${done ? 'text-green-500' : 'text-primary'}`}>+{a.points} XP</span>
                              {a.moment_id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-primary"
                                  onClick={() => navigate('/app/moment-library')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Open moment
                                </Button>
                              )}
                            </div>
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
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="gap-2" onClick={handleCopySBI}>
                          <Copy className="h-3.5 w-3.5" />
                          Copy SBI Template
                        </Button>
                        <Button size="sm" variant="link" className="gap-1.5" onClick={() => navigate('/app/my-journey')}>
                          <Map className="h-3.5 w-3.5" />
                          Back to My Journey
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
