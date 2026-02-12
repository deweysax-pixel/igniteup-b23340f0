import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle, Lightbulb, BookOpen, Copy, Map } from 'lucide-react';
import { SBI_TEMPLATE, copyToClipboard } from '@/lib/playbook-content';

export default function CheckInPage() {
  const navigate = useNavigate();
  const { state, dispatch, currentUser } = useDemo();
  const { journey } = useJourney();
  const activeChallenge = state.challenges.find(c => c.status === 'active');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentWeek = 4; // Simulated current week

  // Check if already submitted this week
  const alreadyDone = state.checkIns.some(
    ci => ci.userId === currentUser?.id && ci.challengeId === activeChallenge?.id && ci.weekNumber === currentWeek
  );

  const toggleAction = (id: string) => {
    setSelectedActions(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!currentUser || !activeChallenge) return;
    dispatch({
      type: 'CHECK_IN',
      payload: {
        userId: currentUser.id,
        challengeId: activeChallenge.id,
        weekNumber: currentWeek,
        completedActionIds: selectedActions,
        note,
      },
    });
    setSubmitted(true);
    toast.success('Check-in submitted! Your XP has been updated.');
  };

  if (!activeChallenge) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Check-in</h2>
        <p className="text-muted-foreground">No active challenge at the moment.</p>
      </div>
    );
  }

  if (alreadyDone || submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 space-y-4">
        <CheckCircle className="h-16 w-16 text-primary animate-scale-in" />
        <h2 className="text-2xl font-bold">Check-in submitted!</h2>
        <p className="text-muted-foreground">Week {currentWeek} — See you next week.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Check-in</h2>
        <p className="text-sm text-muted-foreground mt-1">Week {currentWeek} · {activeChallenge.title}</p>
      </div>

      {/* Journey link */}
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          This check-in supports your current journey: <span className="text-foreground font-medium">{journey.title}</span>
        </p>
        <Button variant="link" size="sm" className="h-auto p-0 gap-1.5 text-primary shrink-0" onClick={() => navigate('/app/journey')}>
          <Map className="h-3.5 w-3.5" />
          Back to My Journey
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions completed this week</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeChallenge.weeklyActions.map(action => (
            <label key={action.id} className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={selectedActions.includes(action.id)}
                onCheckedChange={() => toggleAction(action.id)}
              />
              <div className="flex-1">
                <span className="text-sm">{action.label}</span>
                <span className="text-xs text-primary ml-2">+{action.points} pts</span>
              </div>
            </label>
          ))}

          <div className="pt-2">
            <Textarea
              placeholder="Any notes about your week? (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="resize-none"
              rows={3}
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
                  onClick={async () => { await copyToClipboard(SBI_TEMPLATE); toast.success('Copied to clipboard'); }}
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
            disabled={selectedActions.length === 0}
            className="w-full"
          >
            Submit Check-in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
