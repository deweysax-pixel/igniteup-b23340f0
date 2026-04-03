import { useNavigate } from 'react-router-dom';
import { usePreview } from '@/contexts/PreviewContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Target, TrendingUp, Users, Zap, CheckCircle2, Calendar } from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

const behaviorLabels: Record<string, string> = {
  feedback: 'Giving clear feedback',
  accountability: 'Holding people accountable',
  alignment: 'Aligning the team around priorities',
  conversations: 'Having honest conversations',
  recognition: 'Recognizing contributions',
};

const ambitionLabels: Record<string, string> = {
  small: 'Small improvements',
  habits: 'Consistent habits',
  shift: 'Behavior shift',
  culture: 'Culture change',
};

const audienceLabels: Record<string, string> = {
  'just-me': 'Individual',
  'my-team': 'Team activation',
  'my-managers': 'Manager rollout',
};

const teamSizeLabels: Record<string, string> = {
  '1': '1 leader',
  '2-10': '2–10 leaders',
  '10-50': '10–50 leaders',
  '50+': '50+ leaders',
};

function computeReadiness(ambition: string, audience: string, teamSize: string): number {
  let score = 55;
  if (ambition === 'culture') score += 20;
  else if (ambition === 'shift') score += 15;
  else if (ambition === 'habits') score += 10;
  else score += 5;
  if (audience === 'my-managers') score += 10;
  else if (audience === 'my-team') score += 7;
  if (teamSize === '50+') score += 10;
  else if (teamSize === '10-50') score += 8;
  else if (teamSize === '2-10') score += 5;
  return Math.min(score, 95);
}

function getReadinessLabel(score: number) {
  if (score >= 80) return 'Strong rollout potential';
  if (score >= 65) return 'Good activation fit';
  return 'Solid starting point';
}

const sprintWeeks = [
  { week: 1, label: 'Alignment conversations' },
  { week: 2, label: 'Feedback habit' },
  { week: 3, label: 'Ownership culture' },
  { week: 4, label: 'Recognition loop' },
];

export default function PreviewJourney() {
  const navigate = useNavigate();
  const { fitCheckAnswers, setPreviewMode } = usePreview();
  const {
    behavior = 'alignment',
    ambition = 'habits',
    audience = 'just-me',
    teamSize = '2-10',
  } = fitCheckAnswers;

  const readiness = computeReadiness(ambition, audience, teamSize);

  const handleOpenDemo = () => {
    setPreviewMode(true);
    navigate('/app/journey?mode=preview');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img src={igniteupLogo} alt="IgniteUp" className="h-16 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
        <Button variant="outline" size="sm" onClick={() => navigate('/fit-check')}>
          Retake Diagnostic
        </Button>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          {/* Section 0 — What high-execution teams do */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">What high-execution teams do differently</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'They force weekly action',
                  'They track behavior, not attendance',
                  'They make execution visible',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Section 1 — Title */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Your Leadership Transformation Profile</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              You're looking for practical leadership habits that create visible impact in teams.
              IgniteUp helps leaders turn leadership into consistent weekly behaviors.
            </p>
          </div>

          {/* Context badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              <Target className="h-3.5 w-3.5" /> {behaviorLabels[behavior]}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              <TrendingUp className="h-3.5 w-3.5" /> {ambitionLabels[ambition]}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              <Users className="h-3.5 w-3.5" /> {audienceLabels[audience]}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 text-sm py-1 px-3">
              <Zap className="h-3.5 w-3.5" /> {teamSizeLabels[teamSize]}
            </Badge>
          </div>

          {/* Section 2 — Readiness score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Leadership Activation Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-primary">{readiness}</span>
                <span className="text-muted-foreground text-sm pb-1">/ 100 — {getReadinessLabel(readiness)}</span>
              </div>
              <Progress value={readiness} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Your context is well suited for a leadership habit activation approach.
                With the right structure, behavior adoption can spread quickly across leaders.
              </p>
            </CardContent>
          </Card>

          {/* Section 3 — Activation path */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Recommended IgniteUp Activation Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Start with:</p>
                  <ul className="space-y-2">
                    {[
                      'A small manager cohort',
                      'One leadership behavior per week',
                      'Short real-world challenges',
                      'Visible behavior tracking',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Expected outcomes:</p>
                  <ul className="space-y-2">
                    {[
                      'Stronger leadership consistency',
                      'Faster behavior adoption',
                      'Measurable progress across teams',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 — Sprint */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Suggested First Leadership Sprint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sprintWeeks.map(w => (
                  <div key={w.week} className="p-3 rounded-md border border-border text-center space-y-1">
                    <div className="text-xs font-semibold text-primary uppercase">Week {w.week}</div>
                    <p className="text-sm font-medium">{w.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-3 pt-2">
            <Button size="lg" className="gap-2" onClick={() => navigate('/rollout-preview')}>
              See your recommended IgniteUp rollout <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Takes less than 2 minutes to explore.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
