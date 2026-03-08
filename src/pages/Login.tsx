import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Shield, Users, User, Eye, Lock } from 'lucide-react';
import type { Role } from '@/types/demo';
import igniteupLogo from '@/assets/igniteup-logo.png';

const DEMO_CODE = 'igniteup-demo-2026';

const searchParams = new URLSearchParams(window.location.search);
const showAdmin = searchParams.get('internal') === '1';

const roles: { role: Role; label: string; description: string; icon: React.ElementType }[] = [
  ...(showAdmin ? [{ role: 'admin' as Role, label: 'Administrator', description: 'Full organizational view, challenge management, and data export.', icon: Shield }] : []),
  { role: 'sponsor', label: 'Sponsor', description: 'Executive oversight with high-level KPIs, ROI tracking, and program health.', icon: Eye },
  { role: 'manager', label: 'Manager', description: 'Lead your team, track rankings, and validate weekly actions.', icon: Users },
  { role: 'participant', label: 'Collaborator', description: 'Complete challenge actions, track your progress and your team\'s.', icon: User },
];

export default function Login() {
  const { switchRole } = useDemo();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === DEMO_CODE) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid demo access code');
    }
  };

  const handleSelect = (role: Role) => {
    switchRole(role);
    navigate(role === 'manager' || role === 'admin' || role === 'sponsor' ? '/app' : '/app/journey');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <a href="/"><img src={igniteupLogo} alt="IgniteUp" className="h-28 w-auto object-contain mx-auto cursor-pointer" /></a>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Private Demo</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Access the IgniteUp demo environment to explore the platform firsthand.
            </p>
          </div>
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="demo-code" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access Code</Label>
                  <PasswordInput id="demo-code" placeholder="Enter your access code" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full">Enter Demo</Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground">
            Don't have an access code?{' '}
            <a href="/pricing" className="text-primary hover:underline">Request a demo</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
           <a href="/"><img src={igniteupLogo} alt="IgniteUp" className="h-28 w-auto object-contain mx-auto cursor-pointer" /></a>
           <span className="block text-lg font-medium text-muted-foreground mt-2">Demo · Horizon Group</span>
          <p className="text-sm text-muted-foreground">
            Choose a perspective to explore the platform
          </p>
        </div>

        <div className="grid gap-3">
          {roles.map(({ role, label, description, icon: Icon }) => (
            <Card
              key={role}
              className="cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => handleSelect(role)}
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <CardDescription className="text-xs mt-1">{description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
