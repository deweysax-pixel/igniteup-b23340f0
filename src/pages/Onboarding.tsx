import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles, Rocket, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Journey, JourneyStep } from '@/types/journey';

type FocusArea = 'team-performance' | 'weekly-feedback' | 'effective-1on1s' | 'recognition';

const focusAreas: { id: FocusArea; label: string; description: string }[] = [
  { id: 'team-performance', label: 'Team Performance', description: 'Core track — 5 macro-modules covering trust, conflict, decisions, accountability & results' },
  { id: 'weekly-feedback', label: 'Weekly Feedback', description: 'Build a habit of giving and receiving feedback using the SBI framework' },
  { id: 'effective-1on1s', label: 'Effective 1:1s', description: 'Run 1:1 meetings that build trust and drive accountability' },
  { id: 'recognition', label: 'Recognition That Sticks', description: 'Deliver recognition that reinforces the right behaviors' },
];

const durationPresets: { weeks: Journey['durationWeeks']; label: string; hint?: string }[] = [
  { weeks: 2, label: '2 weeks', hint: 'Sprint' },
  { weeks: 4, label: '4 weeks', hint: '1 month' },
  { weeks: 8, label: '8 weeks', hint: '2 months' },
  { weeks: 12, label: '12 weeks', hint: 'Best for sustainable change' },
  { weeks: 16, label: '16 weeks', hint: '4 months' },
  { weeks: 20, label: '20 weeks', hint: '5 months' },
  { weeks: 24, label: '24 weeks', hint: 'Full transformation' },
];

const FOCUS_TO_MODULES: Record<FocusArea, string[]> = {
  'team-performance': ['tp-1', 'tp-2', 'tp-3', 'tp-4', 'tp-5'],
  'weekly-feedback': ['mod-1'],
  'effective-1on1s': ['mod-6'],
  'recognition': ['mod-7'],
};

const CHALLENGE_TO_FOCUS: Record<string, FocusArea[]> = {
  alignment: ['team-performance'],
  accountability: ['team-performance'],
  'hard-conversations': ['weekly-feedback', 'team-performance'],
  motivation: ['recognition', 'weekly-feedback'],
  overwhelmed: ['team-performance', 'weekly-feedback'],
};

const DURATION_MAP: Record<string, Journey['durationWeeks']> = {
  '4w': 4, '8w': 8, '3m': 12, '6m': 24,
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { replaceJourney, getModule } = useJourney();

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<FocusArea[]>([]);
  const [duration, setDuration] = useState<Journey['durationWeeks']>(8);
  const [generated, setGenerated] = useState(false);
  const [shortNote, setShortNote] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const challenge = searchParams.get('challenge');
    const dur = searchParams.get('duration');
    if (challenge || dur) {
      if (challenge && CHALLENGE_TO_FOCUS[challenge]) {
        setSelected(CHALLENGE_TO_FOCUS[challenge]);
      }
      if (dur && DURATION_MAP[dur]) {
        setDuration(DURATION_MAP[dur]);
      }
      setPrefilled(true);
    }
  }, [searchParams]);

  const toggleFocus = (id: FocusArea) => {
    setSelected(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const generateJourney = () => {
    let moduleIds = selected.flatMap(f => FOCUS_TO_MODULES[f]);
    // deduplicate
    moduleIds = [...new Set(moduleIds)];

    let note = false;
    if (selected.length > 1 && duration <= 8 && moduleIds.length > 3) {
      moduleIds = moduleIds.slice(0, 3);
      note = true;
    }
    setShortNote(note);

    // Build steps using the same logic as generatePlan
    const steps: JourneyStep[] = [];
    if (duration <= 8) {
      for (let w = 1; w <= duration; w++) {
        const modId = moduleIds[(w - 1) % moduleIds.length];
        steps.push({ weekNumber: w, moduleId: modId });
      }
    } else {
      let week = 1;
      let modIndex = 0;
      while (week <= duration) {
        const modId = moduleIds[modIndex % moduleIds.length];
        steps.push({ weekNumber: week, moduleId: modId });
        week++;
        if (week <= duration) {
          steps.push({ weekNumber: week, moduleId: modId, isPracticeWeek: true });
          week++;
        }
        modIndex++;
      }
    }

    const journey: Journey = {
      id: 'j-onboarding',
      title: selected.length === 1
        ? focusAreas.find(f => f.id === selected[0])!.label + ' Journey'
        : 'Custom Leadership Journey',
      durationWeeks: duration,
      steps,
      currentWeek: 1,
    };

    replaceJourney(journey);
    setGenerated(true);
    toast.success('Journey generated!');
  };

  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Build Your Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">3 quick steps to a personalized learning path</p>
      </div>

      <Progress value={progressValue} className="h-1.5" />

      {prefilled && (
        <div className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-md px-3 py-2">
          Prefilled from your Fit Check — you can edit anytime.
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 1 of 3</CardDescription>
            <CardTitle className="text-lg">What do you want to improve?</CardTitle>
            <p className="text-sm text-muted-foreground">Pick one or two. You can edit later.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {focusAreas.map(area => (
              <label
                key={area.id}
                className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-accent/50 transition-colors"
                data-selected={selected.includes(area.id)}
              >
                <Checkbox
                  checked={selected.includes(area.id)}
                  onCheckedChange={() => toggleFocus(area.id)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{area.label}</p>
                  <p className="text-xs text-muted-foreground">{area.description}</p>
                </div>
              </label>
            ))}
            <div className="flex justify-end pt-2">
              <Button disabled={selected.length === 0} className="gap-1.5" onClick={() => setStep(2)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 2 of 3</CardDescription>
            <CardTitle className="text-lg">Choose your timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {durationPresets.map(p => (
                <button
                  key={p.weeks}
                  onClick={() => setDuration(p.weeks)}
                  className={`rounded-md border p-3 text-left transition-colors ${duration === p.weeks ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                >
                  <p className="text-sm font-medium">{p.label}</p>
                  {p.hint && <p className="text-xs text-muted-foreground">{p.hint}</p>}
                </button>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" className="gap-1.5" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="gap-1.5" onClick={() => setStep(3)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 3 of 3</CardDescription>
            <CardTitle className="text-lg">Generate your journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Focus areas</p>
              <div className="flex flex-wrap gap-2">
                {selected.map(id => (
                  <Badge key={id} variant="secondary" className="capitalize text-xs">
                    {focusAreas.find(f => f.id === id)!.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Timeline</p>
              <p className="text-sm flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {durationPresets.find(p => p.weeks === duration)!.label}
                {duration >= 12 && <span className="text-xs text-muted-foreground ml-1">— includes Practice & Embed weeks</span>}
              </p>
            </div>

            {shortNote && (
              <p className="text-xs text-muted-foreground bg-accent/30 rounded-md p-2">
                Short journey: focusing on essentials (max 3 modules).
              </p>
            )}

            {generated && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" /> Journey generated successfully
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" className="gap-1.5" onClick={() => { setStep(2); setGenerated(false); }}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex gap-2">
                {!generated ? (
                  <Button className="gap-1.5" onClick={generateJourney}>
                    <Sparkles className="h-4 w-4" /> Generate journey
                  </Button>
                ) : (
                  <Button className="gap-1.5" onClick={() => navigate('/app/journey')}>
                    <Rocket className="h-4 w-4" /> Start now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
