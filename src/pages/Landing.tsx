import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RequestDemoModal } from '@/components/RequestDemoModal';
import ProductPreviewSection from '@/components/ProductPreviewSection';
import {
  Eye, Zap, Radio, Settings2, ArrowRight, Check, X,
  Flame, BarChart3, Users, TrendingUp, ChevronRight,
} from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ── Sticky Header ── */}
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10 py-3 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-lg shadow-primary/5'
            : 'bg-transparent'
        }`}
      >
        <Link to="/">
          <img src={igniteupLogo} alt="IgniteUp" className="h-10 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/pricing" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setDemoOpen(true)} className="text-muted-foreground hover:text-foreground">
            Request a Demo
          </Button>
          <Link to="/auth">
            <Button size="sm" className="font-semibold">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* Gradient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[160px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8 animate-fade-in">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs tracking-widest uppercase px-3 py-1">
              Leadership Activation System
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              Training doesn't change behavior.
              <br />
              <span className="text-primary">Execution does.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              IgniteUp forces leadership into weekly action — and makes it measurable across your teams.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/fit-check">
                <Button size="lg" className="text-base px-8 gap-2 group">
                  Run your 90-sec Leadership Fit Check
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#product">
                <Button variant="outline" size="lg" className="text-base px-8">
                  See how it works
                </Button>
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              See how many of your managers actually apply what they learned last week.
            </p>
          </div>

          {/* Product mockup */}
          <div className="max-w-5xl mx-auto px-6 pb-20">
            <div className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 shadow-2xl shadow-primary/5">
              <div className="grid gap-4 md:grid-cols-3">
                <HeroChallengeMock />
                <HeroAdoptionMock />
                <HeroJourneyMock />
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM ── */}
        <section className="py-20 border-t border-border/40">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-10">
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Leadership training doesn't fail.
                <br />
                <span className="text-primary">Execution does.</span>
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                'Managers attend training but don\'t apply it',
                'No visibility on real behavior change',
                'No measurable ROI after programs',
              ].map((item) => (
                <Card key={item} className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-5 flex items-start gap-3">
                    <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground/80 text-left">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-muted-foreground font-medium">So nothing really changes.</p>
          </div>
        </section>

        {/* ── SOLUTION ── */}
        <section className="py-20 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                A simple system to turn leadership{' '}
                <span className="text-primary">into action</span>
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Flame,
                  title: 'Weekly challenges',
                  desc: 'Managers apply one leadership behavior per week through short real-world actions.',
                },
                {
                  icon: BarChart3,
                  title: 'Track adoption',
                  desc: 'See who actually does it — in real time, across every team.',
                },
                {
                  icon: TrendingUp,
                  title: 'Measure impact',
                  desc: 'Turn leadership behaviors into measurable, actionable data.',
                },
              ].map((s) => (
                <Card key={s.title} className="bg-card border-border">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCT ── */}
        <section id="product" className="py-20 border-t border-border/40 scroll-mt-20 flex flex-col items-center">
          <ProductPreviewSection />
          <p className="text-center text-sm text-muted-foreground mt-6">
            No more guessing. You see what managers actually do.
          </p>
        </section>

        {/* ── METHOD ── */}
        <section className="py-20 border-t border-border/40">
          <div className="max-w-3xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                From training to <span className="text-primary">behavior change</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { icon: Eye, label: 'Understand', desc: 'Focus on one behavior' },
                { icon: Zap, label: 'Practice', desc: 'Apply it in real situations' },
                { icon: Radio, label: 'Track', desc: 'Log actions and progress' },
                { icon: Settings2, label: 'Improve', desc: 'Build consistency over time' },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{step.label}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{step.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIATION ── */}
        <section className="py-20 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Why <span className="text-primary">IgniteUp</span> works
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Traditional */}
              <Card className="border-border bg-muted/30">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Traditional training</h3>
                  {['Knowledge-heavy', 'Low follow-through', 'No visibility on impact'].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <span className="text-sm text-muted-foreground">{t}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              {/* IgniteUp */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">IgniteUp</h3>
                  {['Action-driven', 'Weekly execution loops', 'Measurable behavior change'].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{t}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ── FIT CHECK CTA ── */}
        <section className="py-20 border-t border-border/40">
          <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              How strong is your <span className="text-primary">leadership execution</span>?
            </h2>
            <p className="text-muted-foreground">
              Take the 90-second Fit Check and get instant insights.
            </p>
            <Link to="/fit-check">
              <Button size="lg" className="text-base px-10 gap-2 group">
                Run your Fit Check
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">No signup required</p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-24 border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative max-w-2xl mx-auto px-6 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Stop guessing. <span className="text-primary">Start seeing.</span>
            </h2>
            <Link to="/fit-check">
              <Button size="lg" className="text-base px-10 gap-2 group">
                Run your Fit Check
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-xs text-muted-foreground border-t border-border">
        <div className="flex items-center justify-center gap-4">
          <span>IgniteUp · Leadership Activation Platform</span>
          <Link to="/pricing" className="hover:text-foreground transition-colors underline underline-offset-2">
            Pricing
          </Link>
        </div>
      </footer>

      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}

/* ── Hero Mockup Components ── */

function HeroChallengeMock() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Flame className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold">This week's challenge</p>
          <p className="text-[10px] text-muted-foreground">Week 3 of 8</p>
        </div>
      </div>
      <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-1.5">
        <p className="text-xs font-semibold">Give one specific piece of feedback</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Share constructive feedback with a team member. Be specific about behavior and impact.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Check className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] text-muted-foreground">3 of 5 managers completed</span>
      </div>
    </div>
  );
}

function HeroAdoptionMock() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Team adoption</p>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">This month</Badge>
      </div>
      <div className="space-y-2.5">
        {[
          { name: 'Product', pct: 87 },
          { name: 'Engineering', pct: 72 },
          { name: 'Sales', pct: 64 },
        ].map((t) => (
          <div key={t.name} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{t.name}</span>
              <span className="font-medium">{t.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${t.pct}%` }} />
            </div>
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

function HeroJourneyMock() {
  const steps = [
    { label: 'Clear feedback', done: true },
    { label: 'Active listening', done: true },
    { label: 'Recognition', active: true },
    { label: 'Accountability' },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <p className="text-xs font-semibold">Leadership journey</p>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-stretch gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                  s.done
                    ? 'bg-primary text-primary-foreground'
                    : s.active
                    ? 'border-2 border-primary bg-primary/20'
                    : 'border border-border bg-muted'
                }`}
              >
                {s.done && <Check className="h-3 w-3" />}
                {s.active && <Flame className="h-2.5 w-2.5 text-primary" />}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-px flex-1 min-h-[16px] ${s.done ? 'bg-primary/40' : 'bg-border'}`} />
              )}
            </div>
            <div className="pb-3">
              <p
                className={`text-[11px] font-medium ${
                  s.active ? 'text-primary' : s.done ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </p>
              {s.active && <span className="text-[10px] text-muted-foreground">In progress — Week 3</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
