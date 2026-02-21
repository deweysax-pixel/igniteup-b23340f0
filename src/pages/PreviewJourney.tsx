import { useNavigate } from 'react-router-dom';
import { usePreview } from '@/contexts/PreviewContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, BookOpen, Target, Clock, Timer } from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

const challengeLabels: Record<string, string> = {
  alignment: 'Team alignment & meetings',
  accountability: 'Accountability & follow-through',
  'hard-conversations': 'Hard conversations & trust',
  motivation: 'Motivation & recognition',
  overwhelmed: 'Stepping into a bigger role',
};

const durationLabels: Record<string, string> = {
  '4w': '4 weeks', '8w': '8 weeks', '3m': '3 months', '6m': '6 months',
};

const challengeToModules: Record<string, string[]> = {
  alignment: ['Trust Building', 'Mastering Conflict', 'Achieving Commitment'],
  accountability: ['Embracing Accountability', 'Focusing on Results'],
  'hard-conversations': ['Trust Building', 'Mastering Conflict', 'Weekly Feedback Habit'],
  motivation: ['Recognition That Sticks', 'Weekly Feedback Habit'],
  overwhelmed: ['Trust Building', 'Effective 1:1s'],
};

export default function PreviewJourney() {
  const navigate = useNavigate();
  const { fitCheckAnswers, setPreviewMode } = usePreview();
  const { challenge = 'alignment', duration = '8w', audience = 'just-me' } = fitCheckAnswers;

  const modules = challengeToModules[challenge] || challengeToModules.alignment;

  const handleOpenDemo = () => {
    setPreviewMode(true);
    navigate('/app/journey?mode=preview');
  };

  const handleUseInWorkspace = () => {
    const params = new URLSearchParams();
    params.set('challenge', challenge);
    params.set('duration', duration);
    params.set('audience', audience);
    navigate(`/app/onboarding?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
        <Button variant="outline" size="sm" onClick={() => navigate('/fit-check')}>
          Retake Fit Check
        </Button>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Your Personalized Preview</h1>
            <p className="text-muted-foreground">Based on your Fit Check answers, here's what your journey could look like.</p>
          </div>

          {/* Summary */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              <Target className="h-3.5 w-3.5" /> {challengeLabels[challenge]}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              <Clock className="h-3.5 w-3.5" /> {durationLabels[duration]}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              {audience === 'my-team' ? 'Team rollout' : 'Individual'}
            </Badge>
          </div>

          {/* Suggested modules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Suggested Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modules.map((mod, i) => (
                  <div key={mod} className="flex items-center gap-3 p-3 rounded-md border border-border">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium">{mod}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gap-2" onClick={() => navigate('/preview/sandbox')}>
              <Timer className="h-4 w-4" /> Try it in 2 minutes
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={handleOpenDemo}>
              <Play className="h-4 w-4" /> Open the interactive demo
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/pricing')}>
              See pricing
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
