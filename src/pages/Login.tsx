import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, User } from 'lucide-react';
import type { Role } from '@/types/demo';

const roles: { role: Role; label: string; description: string; icon: React.ElementType }[] = [
  { role: 'admin', label: 'Administrateur', description: 'Vue complète de l\'organisation, gestion des défis et export des données.', icon: Shield },
  { role: 'manager', label: 'Manager', description: 'Anime son équipe, suit le classement et valide ses actions hebdomadaires.', icon: Users },
  { role: 'participant', label: 'Participant', description: 'Réalise les actions du défi, suit sa progression et celle de son équipe.', icon: User },
];

export default function Login() {
  const { switchRole } = useDemo();
  const navigate = useNavigate();

  const handleSelect = (role: Role) => {
    switchRole(role);
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Ignite</span>
            <span className="text-muted-foreground">+</span>
            <span className="ml-2">Démo</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Choisissez un rôle pour explorer la plateforme
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
