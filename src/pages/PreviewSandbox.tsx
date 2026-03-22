import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreview } from '@/contexts/PreviewContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, BookOpen, ClipboardCheck, BarChart3, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import { RequestDemoModal } from '@/components/RequestDemoModal';
import igniteupLogo from '@/assets/igniteup-logo.png';

const DEFAULT_UNIT = {
  title: 'Trust & Safety Foundations',
  bullets: [
    'Trust is not a feeling — it is a set of observable, repeatable behaviors.',
    'Psychological safety means people speak up without fear of punishment.',
    'Micro-behaviors compound: small daily trust signals outweigh grand gestures.',
    'Assume positive intent as a default. Reset when you catch yourself judging.',
    'Repair fast. A quick "I got that wrong" restores more trust than a perfect record.',
    'Team agreements only work when the team writes them together.',
  ],
};

const challengeUnits: Record<string, { title: string; bullets: string[] }> = {
  alignment: DEFAULT_UNIT,
  accountability: {
    title: 'Embracing Accountability',
    bullets: [
      'Accountability is not punishment — it is a commitment to shared standards.',
      'Name issues early. Small problems left unaddressed become big cultural debts.',
      'Keep accountability conversations factual: behavior, impact, request.',
      'Peers hold each other accountable better than managers — when they have the tools.',
      'A coaching stance balances support with challenge.',
      'Reflect on what you tolerate. Tolerance of low standards is contagious.',
    ],
  },
  'hard-conversations': {
    title: 'Mastering Conflict',
    bullets: [
      'Healthy teams argue about ideas. Dysfunctional teams argue about people.',
      'Conflict avoidance is more dangerous than conflict itself.',
      'Rules of engagement create a safe container for productive tension.',
      'The 2-minute debate format prevents tangents and keeps energy high.',
      'Facilitation moves — like naming the tension — keep conversations on track.',
      'Disagree and commit: once decided, everyone rows in the same direction.',
    ],
  },
  motivation: {
    title: 'Recognition That Sticks',
    bullets: [
      'Recognition works when it is specific, timely, and tied to impact.',
      'Name the behavior, not the person. "You prepared a clear brief" beats "Great job."',
      'Public recognition amplifies the behavior across the team.',
      'Mix written and verbal. A short message can be as powerful as a speech.',
      'Recognize effort during struggle, not just outcomes after success.',
      'One genuine recognition per week changes how your team experiences work.',
    ],
  },
  overwhelmed: DEFAULT_UNIT,
};

export default function PreviewSandbox() {
  const navigate = useNavigate();
  const { fitCheckAnswers } = usePreview();
  const challenge = fitCheckAnswers.behavior || 'alignment';

  const unit = challengeUnits[challenge] || DEFAULT_UNIT;

  const [unitOpened, setUnitOpened] = useState(false);
  const [unitCompleted, setUnitCompleted] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState([1]);
  const [note, setNote] = useState('');
  const [checkinDone, setCheckinDone] = useState(false);

  const allDone = unitCompleted && checkinDone;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
        <Button size="sm" onClick={() => setDemoOpen(true)}>Request a demo</Button>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          {/* Hero */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Try IgniteUp in 2 minutes</h1>
            <p className="text-muted-foreground">Complete one learning unit and one check-in to see how progress becomes visible.</p>
          </div>

          {/* Step 1 */}
          <Card className={unitCompleted ? 'border-primary/30' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${unitCompleted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                  {unitCompleted ? <CheckCircle2 className="h-4 w-4" /> : '1'}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Start a learning unit</CardTitle>
                  <CardDescription className="text-xs">{unit.title}</CardDescription>
                </div>
                {unitCompleted && <Badge variant="secondary" className="text-xs">Completed</Badge>}
              </div>
            </CardHeader>
            {!unitCompleted && (
              <CardContent className="space-y-4">
                {!unitOpened ? (
                  <Button className="gap-2" onClick={() => setUnitOpened(true)}>
                    <BookOpen className="h-4 w-4" /> Open unit
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-4 space-y-2.5">
                      <p className="text-xs font-medium text-primary uppercase tracking-wider">Core Lesson</p>
                      {unit.bullets.map((b, i) => (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          <span className="text-muted-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="gap-2" onClick={() => setUnitCompleted(true)}>
                      <CheckCircle2 className="h-4 w-4" /> Mark unit as completed
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Step 2 */}
          <Card className={checkinDone ? 'border-primary/30' : !unitCompleted ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${checkinDone ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                  {checkinDone ? <CheckCircle2 className="h-4 w-4" /> : '2'}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Do a 60-second check-in</CardTitle>
                  <CardDescription className="text-xs">Reflect on your practice this week</CardDescription>
                </div>
                {checkinDone && <Badge variant="secondary" className="text-xs">Submitted</Badge>}
              </div>
            </CardHeader>
            {unitCompleted && !checkinDone && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">How many feedback conversations did you have this week?</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={feedbackCount}
                      onValueChange={setFeedbackCount}
                      min={0}
                      max={5}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-primary w-6 text-center">{feedbackCount[0]}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Quick note (optional)</label>
                  <Textarea
                    placeholder="What went well? Any challenge?"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button className="gap-2" onClick={() => setCheckinDone(true)}>
                  <ClipboardCheck className="h-4 w-4" /> Submit check-in
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Step 3 */}
          <Card className={allDone ? 'border-primary/30' : !checkinDone ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${allDone ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                  {allDone ? <CheckCircle2 className="h-4 w-4" /> : '3'}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">See your progress</CardTitle>
                  <CardDescription className="text-xs">Your loop in action</CardDescription>
                </div>
              </div>
            </CardHeader>
            {checkinDone && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Unit completion</p>
                    <p className="text-sm font-semibold text-primary">Completed ✓</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <ClipboardCheck className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Practice</p>
                    <p className="text-sm font-semibold text-primary">Check-in submitted ✓</p>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center space-y-2">
                  <Sparkles className="h-6 w-6 text-primary mx-auto" />
                  <p className="text-sm font-semibold">Nice — you just experienced the IgniteUp loop:</p>
                  <p className="text-sm text-muted-foreground">Learn → Practice → Progress.</p>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  <p>Next step: continue with the next unit in your recommended journey.</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" onClick={() => navigate('/pricing')}>
              Request a demo
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/preview/journey')}>
              Back to my recommended journey
            </Button>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              <button onClick={() => navigate('/pricing')} className="hover:text-foreground transition-colors underline underline-offset-2">
                See pricing →
              </button>
            </p>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1" onClick={() => navigate('/fit-check')}>
              <RotateCcw className="h-3 w-3" /> Start over
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
