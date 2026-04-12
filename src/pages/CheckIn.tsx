import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChallengeData, getCurrentWeekFromDates } from '@/hooks/useChallengeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle, Lightbulb, BookOpen, Copy } from 'lucide-react';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';

export default function CheckInPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeChallenge, isActionCompleted, markActionDone, loading } = useChallengeData();
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalWeeks = activeChallenge?.actions
    ? Math.max(...activeChallenge.actions.map(a => a.week_number), 1)
    : 1;

  const currentWeek =
    activeChallenge?.start_date && activeChallenge?.end_date
      ? getCurrentWeekFromDates(activeChallenge.start_date, activeChallenge.end_date, totalWeeks)
      : 0;

  const toggleAction = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (!user || !activeChallenge || selectedActions.length === 0) return;
    setSubmitting(true);

    for (const actionId of selectedActions) {
      const action = activeChallenge.actions.find(a => a.id === actionId);
      if (action && !isActionCompleted(actionId)) {
        await markActionDone(actionId, action.points);
      }
    }

    setSubmitted(true);
    setSubmitting(false);
    toast.success('Check-in submitted! Your XP has been updated.');
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Check-in</h2>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!activeChallenge) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Check-in</h2>
        <p className="text-muted-foreground">No active challenge at the moment.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 space-y-4">
        <CheckCircle className="h-16 w-16 text-primary animate-scale-in" />
        <h2 className="text-2xl font-bold">Check-in submitted!</h2>
        <p className="text-muted-foreground">Week {currentWeek} — See you next week.</p>
      </div>
    );
  }

  const weekActions = activeChallenge.actions.filter(a => a.week_number === currentWeek);

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Check-in</h2>
        <p className="text-sm text-muted-foreground mt-1">Week {currentWeek} · {activeChallenge.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions completed this week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weekActions.length === 0 && (
            <p className="text-sm text-muted-foreground">No actions scheduled for this week.</p>
          )}
          {weekActions.map(action => {
            const done = isActionCompleted(action.id);
            return (
              <label key={action.id} className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={done || selectedActions.includes(action.id)}
                  disabled={done}
                  onCheckedChange={() => toggleAction(action.id)}
                />
                <div className="flex-1">
                  <span className={`text-sm ${done ? 'line-through text-muted-foreground' : ''}`}>{action.label}</span>
                  <span className="text-xs text-primary ml-2">+{action.points} pts</span>
                </div>
              </label>
            );
          })}

          <div className="pt-2">
            <Textarea
              placeholder="Any notes about your week? (optional)"
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 500))}
              className="resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Coach tip */}
          <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">
                If you're stuck, use the SBI template and keep it factual.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-1.5 gap-1.5"
                  onClick={async () => {
                    await copyToClipboard(SBI_TEMPLATE);
                    toast.success('Copied to clipboard');
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy SBI Template
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 gap-1.5 text-primary"
                  onClick={() => navigate('/app/playbooks')}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Open Playbook
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedActions.length === 0 || submitting}
            className="w-full"
          >
            {submitting ? 'Submitting…' : 'Submit Check-in'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
