import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ExternalLink, CheckCircle2, Flame, Trophy } from 'lucide-react';
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

function getCurrentWeek(startDate: string, endDate: string, totalWeeks: number): number {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 0;
  if (now > end) return totalWeeks;
  const elapsed = now.getTime() - start.getTime();
  const total = end.getTime() - start.getTime();
  const weekLen = total / totalWeeks;
  return Math.min(Math.floor(elapsed / weekLen) + 1, totalWeeks);
}

export default function MyJourney() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [bonusXp, setBonusXp] = useState(0);

  const activeChallenge = state.challenges.find(ch => ch.status === 'active');
  const currentUser = state.users.find(u => u.role === 'participant') ?? state.users[0];

  const totalWeeks = activeChallenge?.weeklyActions.length ?? 0;
  const currentWeek = activeChallenge
    ? getCurrentWeek(activeChallenge.startDate, activeChallenge.endDate, totalWeeks)
    : 0;
  const progressPct = activeChallenge
    ? activeChallenge.status === 'completed' ? 100 : Math.round((currentWeek / totalWeeks) * 100)
    : 0;
  const progressColor = activeChallenge?.themeId ? themeProgressColors[activeChallenge.themeId] : '';

  const currentAction = activeChallenge?.weeklyActions[currentWeek - 1];
  const isCompleted = currentAction ? completedIds.has(currentAction.id) : false;
  const currentMoment = currentAction?.momentId ? momentLookup[currentAction.momentId] : null;
  const currentInstruction = currentAction?.momentId ? momentInstructions[currentAction.momentId] : null;

  // Count completed weeks for progress
  const completedWeeks = activeChallenge
    ? activeChallenge.weeklyActions.filter((_, i) => {
        const weekNum = i + 1;
        return weekNum < currentWeek || (weekNum === currentWeek && isCompleted);
      }).length
    : 0;
  const dynamicProgressPct = activeChallenge
    ? Math.round((completedWeeks / totalWeeks) * 100)
    : 0;

  const handleMarkDone = () => {
    if (!currentAction || !activeChallenge || !currentUser || isCompleted) return;
    setCompletedIds(prev => new Set(prev).add(currentAction.id));
    setBonusXp(prev => prev + currentAction.points);

    dispatch({
      type: 'CHECK_IN',
      payload: {
        userId: currentUser.id,
        challengeId: activeChallenge.id,
        weekNumber: currentWeek,
        completedActionIds: [currentAction.id],
        note: 'Completed from My Journey',
      },
    });

    toast.success(`🎉 Action completed — +${currentAction.points} XP earned`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Journey</h2>
        <p className="text-sm text-muted-foreground mt-1">Your leadership progress and weekly action.</p>
      </div>

      {!activeChallenge ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>No active sprint right now. Check the Challenges page or ask your manager.</p>
            <Button variant="link" className="mt-2" onClick={() => navigate('/app/challenges')}>
              Go to Challenges
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* This Week */}
          {currentAction && currentWeek > 0 && currentWeek <= totalWeeks && (
            <Card className={`transition-all duration-500 ${isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-primary/30 bg-primary/5'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-green-500">✅ Completed</span>
                    </>
                  ) : (
                    <>
                      <Flame className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">This week</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Meta line */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Week {currentWeek}</span>
                  {currentMoment && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${themeBadgeStyles[currentMoment.themeId]}`}>
                        {themeLabels[currentMoment.themeId]}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Action title */}
                <p className="font-medium">{currentAction.label}</p>

                {/* Instruction */}
                {currentInstruction && (
                  <p className="text-sm text-muted-foreground">{currentInstruction}</p>
                )}

                {/* XP + buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`font-semibold text-sm ${isCompleted ? 'text-green-500' : 'text-primary'}`}>+{currentAction.points} XP</span>
                  <div className="flex flex-wrap gap-2">
                    {currentAction.momentId && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => navigate('/app/moment-library')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open moment
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="gap-1.5 text-xs"
                      disabled={isCompleted}
                      onClick={handleMarkDone}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {isCompleted ? 'Done' : 'Mark as done'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sprint Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sprint Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{activeChallenge.title}</span>
                <span>Week {currentWeek} / {totalWeeks}</span>
              </div>
              <Progress value={dynamicProgressPct} className={`h-2 bg-secondary ${progressColor}`} />
            </CardContent>
          </Card>

          {/* XP Summary */}
          <Card>
            <CardContent className="py-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Your XP</p>
                <p className="text-2xl font-bold text-primary">{currentUser?.xp ?? 0} <span className="text-sm font-normal text-muted-foreground">XP earned</span></p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
