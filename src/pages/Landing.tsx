import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, BarChart3, Trophy } from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain" />
        <Link to="/login">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 md:py-32">
        <div className="max-w-3xl text-center space-y-10 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] text-balance">
              <span className="relative inline-block">
                <span className="font-extrabold">IgniteUp</span>{' '}your{' '}
                <span className="font-extrabold">potential</span>
                <span
                  className="absolute -bottom-2 left-0 w-full h-[3px] rounded-full"
                  style={{ background: 'var(--gradient-primary)' }}
                  aria-hidden="true"
                />
              </span>
              <br className="hidden sm:block" />
              <span className="text-foreground"> — one journey at a time.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build measurable habits through curated learning, real-world practice, and clear progress signals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app/journey">
              <Button size="lg" className="text-base px-8 min-w-[200px]">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/app/journey">
              <Button variant="outline" size="lg" className="text-base px-8 min-w-[200px]">
                Open Demo
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3 text-left pt-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Target className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Measurable growth in weeks
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BarChart3 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                ROI signals leaders understand
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Trophy className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Momentum through practice & recognition
              </p>
            </div>
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
