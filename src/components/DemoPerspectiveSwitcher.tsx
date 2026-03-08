import { useDemo } from '@/contexts/DemoContext';
import { Eye, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Role } from '@/types/demo';

const perspectives: { role: Role; label: string; icon: React.ElementType }[] = [
  { role: 'sponsor', label: 'Sponsor', icon: Eye },
  { role: 'manager', label: 'Manager', icon: Users },
  { role: 'participant', label: 'Collaborator', icon: User },
];

export function DemoPerspectiveSwitcher() {
  const { state, isDemoSession, switchRole } = useDemo();

  // Only show when demo session is active
  if (!isDemoSession) return null;

  const current = perspectives.find(p => p.role === state.currentRole) ?? perspectives[0];
  const CurrentIcon = current.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2 shadow-lg border-primary/30 bg-background/95 backdrop-blur">
            <CurrentIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">View as: {current.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          {perspectives.map(({ role, label, icon: Icon }) => (
            <DropdownMenuItem
              key={role}
              onClick={() => switchRole(role)}
              className={state.currentRole === role ? 'bg-accent' : ''}
            >
              <Icon className="h-4 w-4 mr-2 text-primary" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
