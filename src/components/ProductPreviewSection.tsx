import { Flame, BarChart3, Route, CheckCircle2, Users, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

function ChallengeMockup() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-card-foreground">This week's challenge</p>
          <p className="text-[10px] text-muted-foreground">Week 3 of 8</p>
        </div>
      </div>
      <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
        <p className="text-xs font-semibold text-card-foreground">Give one specific piece of feedback</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">Share constructive feedback with a team member this week. Be specific about the behavior and its impact.</p>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] text-muted-foreground">3 of 5 managers completed</span>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-card-foreground">Team adoption</p>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">This month</Badge>
      </div>
      <div className="space-y-2.5">
        {[
          { name: 'Product team', pct: 87 },
          { name: 'Engineering', pct: 72 },
          { name: 'Sales', pct: 64 },
        ].map(t => (
          <div key={t.name} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{t.name}</span>
              <span className="text-card-foreground font-medium">{t.pct}%</span>
            </div>
            <Progress value={t.pct} className="h-1.5" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">24 managers</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">+12% vs last month</span>
        </div>
      </div>
    </div>
  );
}

function JourneyMockup() {
  const steps = [
    { label: 'Clear feedback', done: true },
    { label: 'Active listening', done: true },
    { label: 'Recognition', active: true },
    { label: 'Accountability', done: false },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4 text-primary" />
        <p className="text-xs font-semibold text-card-foreground">Leadership journey</p>
      </div>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? 'bg-primary text-primary-foreground' : s.active ? 'border-2 border-primary bg-primary/20' : 'border border-border bg-muted'}`}>
                {s.done && <CheckCircle2 className="h-3 w-3" />}
                {s.active && <Flame className="h-2.5 w-2.5 text-primary" />}
              </div>
              {i < steps.length - 1 && <div className={`w-px flex-1 min-h-[16px] ${s.done ? 'bg-primary/40' : 'bg-border'}`} />}
            </div>
            <div className="pb-3">
              <p className={`text-[11px] font-medium ${s.active ? 'text-primary' : s.done ? 'text-card-foreground' : 'text-muted-foreground'}`}>{s.label}</p>
              {s.active && <span className="text-[10px] text-muted-foreground">In progress — Week 3</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-primary">
        <Calendar className="h-3 w-3" />
        <span>8-week activation program</span>
      </div>
    </div>
  );
}

export default function ProductPreviewSection() {
  return (
    <section className="w-full max-w-4xl py-16 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold tracking-tight">See IgniteUp in action</h3>
        <p className="text-sm text-muted-foreground">A simple system to activate leadership habits across your managers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Weekly leadership challenges',
            description: 'Managers practice one leadership habit each week through simple real-world challenges.',
            mockup: <ChallengeMockup />,
          },
          {
            title: 'Team progress dashboard',
            description: 'Track leadership behavior adoption across managers and teams.',
            mockup: <DashboardMockup />,
          },
          {
            title: 'Leadership habit journey',
            description: 'A structured sequence of habits managers activate week after week.',
            mockup: <JourneyMockup />,
          },
        ].map((card) => (
          <Card key={card.title} className="overflow-hidden border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-card-foreground">{card.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
              {card.mockup}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
