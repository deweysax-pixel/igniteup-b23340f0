import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, BarChart3, Trophy, Eye, Zap, Radio, Settings2 } from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/"><img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain cursor-pointer" /></Link>
        <div className="flex items-center gap-3">
          <Link to="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">Sign In</Button>
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
            Transform your managers into high-impact leaders
            <span className="text-primary"> — one challenge at a time.</span>
          </h2>
          <div className="space-y-1">
            <p className="text-base text-foreground font-medium">A Human Skills OS for real progress.</p>
            <p className="text-sm text-muted-foreground">Learn, practice, measure, repeat.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Target className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Measurable leadership habits in 4 weeks
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BarChart3 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                An ROI barometer that speaks the boardroom's language
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Trophy className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Team dynamics driven by gamification and recognition
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <Link to="/fit-check">
              <Button size="lg" className="text-base px-8">
                Take the 90-second Fit Check
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="text-base px-8">
                See pricing
              </Button>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="w-full max-w-2xl py-16 space-y-8">
          <h3 className="text-xl font-semibold tracking-tight text-center">How it works</h3>

          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { icon: Eye, label: 'Clarity', map: 'Journey' },
              { icon: Zap, label: 'Action', map: 'Units + Micro-actions' },
              { icon: Radio, label: 'Signal', map: 'Check-ins + Ignite' },
              { icon: Settings2, label: 'Adjust', map: 'Today recommendations' },
            ].map((step, i) => (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{step.label}</span>
                <span className="text-xs text-muted-foreground">= {step.map}</span>
              </div>
            ))}
          </div>

          <div className="text-center space-y-1">
            <p className="text-base text-foreground font-medium">A Human Skills OS for real progress.</p>
            <p className="text-sm text-muted-foreground">Learn, practice, measure, repeat.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        IgniteUp · Leadership Development Platform
      </footer>
    </div>
  );
}
