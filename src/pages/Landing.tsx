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
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Transform your managers into high-impact leaders
            <span className="text-primary"> — one challenge at a time.</span>
          </h2>

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
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8">
                Start Your Journey
              </Button>
            </Link>
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
