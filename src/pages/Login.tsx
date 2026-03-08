import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, User, Eye } from 'lucide-react';
import type { Role } from '@/types/demo';
import igniteupLogo from '@/assets/igniteup-logo.png';

const roles: { role: Role; label: string; description: string; icon: React.ElementType }[] = [
  { role: 'admin', label: 'Administrator', description: 'Full organizational view, challenge management, and data export.', icon: Shield },
  { role: 'sponsor', label: 'Sponsor', description: 'Executive oversight with high-level KPIs, ROI tracking, and program health.', icon: Eye },
  { role: 'manager', label: 'Manager', description: 'Lead your team, track rankings, and validate weekly actions.', icon: Users },
  { role: 'participant', label: 'Participant', description: 'Complete challenge actions, track your progress and your team\'s.', icon: User },
];

export default function Login() {
  const { switchRole } = useDemo();
  const navigate = useNavigate();

  const handleSelect = (role: Role) => {
    switchRole(role);
    navigate(role === 'manager' || role === 'admin' || role === 'sponsor' ? '/app' : '/app/journey');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
           <a href="/"><img src={igniteupLogo} alt="IgniteUp" className="h-28 w-auto object-contain mx-auto cursor-pointer" /></a>
           <span className="block text-lg font-medium text-muted-foreground mt-2">Demo</span>
          <p className="text-sm text-muted-foreground">
            Choose a role to explore the platform
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
