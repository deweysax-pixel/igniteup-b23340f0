import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { usePreview } from '@/contexts/PreviewContext';
import igniteupLogo from '@/assets/igniteup-logo.png';

const behaviors = [
  { id: 'feedback', label: 'Giving clear feedback', description: 'Help leaders deliver honest, actionable feedback consistently' },
  { id: 'accountability', label: 'Holding people accountable', description: 'Build a culture where commitments are kept and results delivered' },
  { id: 'alignment', label: 'Aligning the team around priorities', description: 'Ensure everyone moves in the same direction with clarity' },
  { id: 'conversations', label: 'Having honest conversations', description: 'Navigate difficult topics with confidence and psychological safety' },
  { id: 'recognition', label: 'Recognizing contributions', description: 'Make recognition a leadership habit that drives engagement' },
];

const ambitions = [
  { id: 'small', label: 'Small improvements in daily leadership', description: 'Quick wins in everyday interactions' },
  { id: 'habits', label: 'More consistent leadership habits', description: 'Build repeatable weekly leadership behaviors' },
  { id: 'shift', label: 'Strong leadership behavior shift', description: 'Visible change in how leaders operate day-to-day' },
  { id: 'culture', label: 'Real culture change in how leaders operate', description: 'Organization-wide leadership transformation' },
];

const audiences = [
  { id: 'just-me', label: 'Just me', description: 'Personal leadership activation' },
  { id: 'my-team', label: 'My team', description: 'Activate leadership habits across my team' },
  { id: 'my-managers', label: 'My managers', description: 'Roll out to the managers I oversee' },
];

const teamSizes = [
  { id: '1', label: 'Just me', hint: 'Individual' },
  { id: '2-10', label: '2–10 leaders', hint: 'Small cohort' },
  { id: '10-50', label: '10–50 leaders', hint: 'Department rollout' },
  { id: '50+', label: '50+ leaders', hint: 'Organization-wide' },
];

const TOTAL_STEPS = 4;

export default function FitCheck() {
  const navigate = useNavigate();
  const { setFitCheckAnswers } = usePreview();
  const [step, setStep] = useState(1);
  const [behavior, setBehavior] = useState('');
  const [ambition, setAmbition] = useState('');
  const [audience, setAudience] = useState('');
  const [teamSize, setTeamSize] = useState('');

  const progress = (step / TOTAL_STEPS) * 100;

  const handleFinish = () => {
    setFitCheckAnswers({ behavior, ambition, audience, teamSize });
    navigate('/preview/journey');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-6 animate-fade-in">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Leadership Activation Diagnostic</h1>
            <p className="text-sm text-muted-foreground">4 quick questions to build your transformation profile</p>
          </div>

          <Progress value={progress} className="h-1.5" />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 1 of {TOTAL_STEPS}</CardDescription>
                <CardTitle className="text-lg">What leadership behavior would make the biggest difference in your team right now?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {behaviors.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBehavior(b.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${behavior === b.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  >
                    <p className="text-sm font-medium">{b.label}</p>
                    <p className="text-xs text-muted-foreground">{b.description}</p>
                  </button>
                ))}
                <div className="flex justify-end pt-2">
                  <Button disabled={!behavior} className="gap-1.5" onClick={() => setStep(2)}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 2 of {TOTAL_STEPS}</CardDescription>
                <CardTitle className="text-lg">What level of transformation are you aiming for?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ambitions.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAmbition(a.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${ambition === a.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  >
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </button>
                ))}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" className="gap-1.5" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button disabled={!ambition} className="gap-1.5" onClick={() => setStep(3)}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 3 of {TOTAL_STEPS}</CardDescription>
                <CardTitle className="text-lg">Who will activate these leadership habits?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {audiences.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAudience(a.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${audience === a.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  >
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </button>
                ))}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" className="gap-1.5" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button disabled={!audience} className="gap-1.5" onClick={() => setStep(4)}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 4 of {TOTAL_STEPS}</CardDescription>
                <CardTitle className="text-lg">How many leaders are involved in this transformation?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {teamSizes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTeamSize(t.id)}
                      className={`p-3 rounded-md border text-left transition-colors ${teamSize === t.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                    >
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.hint}</p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" className="gap-1.5" onClick={() => setStep(3)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button disabled={!teamSize} className="gap-1.5" onClick={handleFinish}>
                    <Sparkles className="h-4 w-4" /> See my transformation profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
