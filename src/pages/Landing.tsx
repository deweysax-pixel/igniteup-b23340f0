import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequestDemoModal } from '@/components/RequestDemoModal';
import ProductPreviewSection from '@/components/ProductPreviewSection';
import { Target, BarChart3, Trophy, Eye, Zap, Radio, Settings2 } from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

export default function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/"><img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain cursor-pointer" /></Link>
        <div className="flex items-center gap-3">
          <Link to="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setDemoOpen(true)}>Request a Demo</Button>
          <Link to="/auth">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8 animate-fade-in">
          <Badge variant="outline" className="border-primary/40 text-primary text-xs tracking-widest uppercase px-3 py-1">
            Human Skills OS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Activate leadership habits across your managers
            <span className="text-primary"> — and make them measurable.</span>
          </h2>
          <div className="space-y-1">
            <p className="text-base text-foreground font-medium">IgniteUp is the leadership activation system that turns leadership behaviors into weekly actions teams practice, track, and improve.</p>
            <p className="text-sm text-muted-foreground">Learn, practice, measure, repeat.</p>
          </div>

          <ProductPreviewSection />

          <div className="grid gap-4 md:grid-cols-3 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Target className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Leadership habits activated in 4 weeks
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BarChart3 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Leadership ROI your board can understand
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Trophy className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Teams engaged through challenges and recognition
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <Button size="lg" className="text-base px-8" onClick={() => setDemoOpen(true)}>
              Request a Demo
            </Button>
            <Link to="/fit-check">
              <Button variant="outline" size="lg" className="text-base px-8">
                Take the 90-second Fit Check
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors underline underline-offset-2">
              Prefer details? Explore pricing →
            </Link>
          </p>
        </div>

        {/* How it works */}
        <div className="w-full max-w-3xl py-16 space-y-10">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold tracking-tight">How IgniteUp activates leadership habits</h3>
            <p className="text-sm text-muted-foreground">A simple system to turn leadership skills into consistent behaviors.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Eye, label: 'Understand', description: 'Managers learn the leadership habit that matters most for their team. Small insights. Clear focus.' },
              { icon: Zap, label: 'Practice', description: 'Managers apply the habit through short real-world leadership challenges. No theory. Just action.' },
              { icon: Radio, label: 'Track', description: 'Teams log actions and check-ins so progress becomes visible. Leadership behaviors become measurable.' },
              { icon: Settings2, label: 'Improve', description: 'IgniteUp highlights patterns and suggests the next leadership focus. Continuous improvement, week after week.' },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold">{step.label}</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{step.description}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        IgniteUp · Leadership Development Platform
      </footer>

      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
