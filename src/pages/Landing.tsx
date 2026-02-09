import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Target, BarChart3, Trophy } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">Ignite</span>
          <span className="text-muted-foreground">+</span>
        </h1>
        <Link to="/login">
          <Button variant="outline" size="sm">Connexion</Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Transformez vos managers en leaders d'impact
            <span className="text-primary"> — un défi à la fois.</span>
          </h2>

          <div className="grid gap-4 md:grid-cols-3 text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Target className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Des habitudes de leadership mesurables en 4 semaines
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <BarChart3 className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Un baromètre ROI qui parle le langage du comité de direction
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
              <Trophy className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-card-foreground">
                Une dynamique d'équipe portée par le jeu et la reconnaissance
              </p>
            </div>
          </div>

          <Link to="/login">
            <Button size="lg" className="text-base px-8 mt-4">
              Explorer la démo
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        Ignite+ · Plateforme de développement du leadership
      </footer>
    </div>
  );
}
