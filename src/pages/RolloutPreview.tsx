import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreview } from '@/contexts/PreviewContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, Rocket, Users, CalendarCheck, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

const behaviorLabels: Record<string, string> = {
  feedback: 'Clear feedback',
  accountability: 'Accountability',
  alignment: 'Team alignment',
  conversations: 'Honest conversations',
  recognition: 'Recognition',
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

export default function RolloutPreview() {
  const navigate = useNavigate();
  const { fitCheckAnswers } = usePreview();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { behavior, ambition, audience, teamSize } = fitCheckAnswers;

  const tags = [
    behavior && behaviorLabels[behavior],
    ambition && ambitionLabels[ambition],
    audience && audienceLabels[audience],
    teamSize && teamSizeLabels[teamSize],
  ].filter(Boolean) as string[];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: persist lead to backend
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img
          src={igniteupLogo}
          alt="IgniteUp"
          className="h-14 w-auto object-contain cursor-pointer"
          onClick={() => navigate('/')}
        />
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          {/* Section 1 — Context Reminder */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">
              See how IgniteUp would activate leadership in your organization
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Based on your diagnostic, IgniteUp recommends starting with a focused leadership activation rollout.
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Section 2 — Rollout Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Your recommended rollout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phase 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
                  <h3 className="text-sm font-semibold">Manager pilot</h3>
                </div>
                <ul className="ml-8 space-y-1.5">
                  {[
                    '10–15 managers',
                    '4 leadership habits',
                    'Weekly action challenges',
                    'Visible behavior tracking',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
                  <h3 className="text-sm font-semibold">Team expansion</h3>
                </div>
                <ul className="ml-8 space-y-1.5">
                  {[
                    'Extend habits to teams',
                    'Reinforce feedback loops',
                    'Track adoption across managers',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 3 — CTAs */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-center">Want to explore this rollout?</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Option 1 — Book */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                    Book a walkthrough
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    See how IgniteUp works for teams like yours and explore your leadership rollout.
                  </p>
                  <Button className="w-full gap-2" asChild>
                    <a
                      href="https://calendly.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book a 20-minute walkthrough <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Option 2 — Email */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Get your rollout plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Receive your personalized leadership rollout preview.
                  </p>
                  {submitted ? (
                    <div className="flex items-center gap-2 text-sm text-primary font-medium justify-center py-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Your rollout preview will be sent shortly.
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="flex gap-2">
                      <Input
                        type="email"
                        required
                        placeholder="Your work email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        Send
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 4 — Trust */}
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            No spam. Just your rollout preview and a short explanation of how IgniteUp works.
          </p>
        </div>
      </main>
    </div>
  );
}
