import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { usePreview } from '@/contexts/PreviewContext';
import igniteupLogo from '@/assets/igniteup-logo.png';

const challenges = [
  { id: 'alignment', label: 'Team alignment & meetings', description: 'Improving how your team collaborates and stays aligned' },
  { id: 'accountability', label: 'Accountability & follow-through', description: 'Making sure commitments are kept and results delivered' },
  { id: 'hard-conversations', label: 'Hard conversations & trust', description: 'Navigating difficult feedback and building psychological safety' },
  { id: 'motivation', label: 'Motivation & recognition', description: 'Keeping people engaged and recognizing contributions' },
  { id: 'overwhelmed', label: 'Overwhelmed / stepping into a bigger role', description: 'Managing transition, delegation, and growing as a leader' },
];

const durations = [
  { id: '4w', label: '4 weeks', hint: 'Quick sprint' },
  { id: '8w', label: '8 weeks', hint: '2 months' },
  { id: '3m', label: '3 months', hint: '~12 weeks' },
  { id: '6m', label: '6 months', hint: '~24 weeks, full transformation' },
];

const audiences = [
  { id: 'just-me', label: 'Just me', description: 'Personal leadership development' },
  { id: 'my-team', label: 'My team', description: 'Team-wide rollout' },
];

export default function FitCheck() {
  const navigate = useNavigate();
  const { setFitCheckAnswers } = usePreview();
  const [step, setStep] = useState(1);
  const [challenge, setChallenge] = useState('');
  const [duration, setDuration] = useState('');
  const [audience, setAudience] = useState('');

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleFinish = () => {
    setFitCheckAnswers({ challenge, duration, audience });
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
            <h1 className="text-2xl font-bold tracking-tight">90-Second Fit Check</h1>
            <p className="text-sm text-muted-foreground">3 quick questions to build your personalized preview</p>
          </div>

          <Progress value={progress} className="h-1.5" />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 1 of 3</CardDescription>
                <CardTitle className="text-lg">What's your biggest leadership challenge?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {challenges.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setChallenge(c.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${challenge === c.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  >
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </button>
                ))}
                <div className="flex justify-end pt-2">
                  <Button disabled={!challenge} className="gap-1.5" onClick={() => setStep(2)}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 2 of 3</CardDescription>
                <CardTitle className="text-lg">How much time can you invest?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {durations.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setDuration(d.id)}
                      className={`p-3 rounded-md border text-left transition-colors ${duration === d.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                    >
                      <p className="text-sm font-medium">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.hint}</p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" className="gap-1.5" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <Button disabled={!duration} className="gap-1.5" onClick={() => setStep(3)}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Step 3 of 3</CardDescription>
                <CardTitle className="text-lg">Who is this for?</CardTitle>
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
                  <Button disabled={!audience} className="gap-1.5" onClick={handleFinish}>
                    <Sparkles className="h-4 w-4" /> See my preview
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
