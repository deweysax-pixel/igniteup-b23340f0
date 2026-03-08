import { Link } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  Users,
  BarChart3,
  Shield,
  Lock,
} from 'lucide-react';
import { useState } from 'react';

const demoSteps = [
  '1. Open the Landing page → present the IgniteUp value proposition',
  '2. Click "Explore the Demo" → select Manager role',
  '3. Dashboard → walk through KPIs, team health, leaderboard',
  '4. Challenges → show active challenge with weekly actions',
  '5. Check-in → submit Week 4, watch XP update live',
  '6. Ignite Heatmap → show team engagement by training pack',
  '7. Reports → highlight participation rates and trends',
  '8. Switch to Admin role → show org-wide Dashboard and Teams monitoring',
  '9. Service Requests → show coaching/workshop requests pipeline',
  '10. Switch to Sponsor role → show executive oversight view',
];

const quickLinks = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard },
  { label: 'Challenges', to: '/app/challenges', icon: Target },
  { label: 'Check-in', to: '/app/checkin', icon: ClipboardCheck },
  { label: 'Team', to: '/app/team', icon: Users },
  { label: 'ROI Barometer', to: '/app/barometer', icon: BarChart3 },
  { label: 'Reports', to: '/app/reports', icon: BarChart3 },
  { label: 'Admin', to: '/app/admin', icon: Shield },
];

export default function DemoScript() {
  const { state } = useDemo();
  const { user, role: authRole } = useAuth();
  const [checked, setChecked] = useState<boolean[]>(new Array(demoSteps.length).fill(false));

  // Allow access if authenticated admin OR demo admin
  const isAdmin = user ? authRole === 'admin' : state.currentRole === 'admin';

  if (!isAdmin) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20 space-y-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Admin Access Required</h2>
        <p className="text-muted-foreground text-sm">This page is only available to the Admin role.</p>
      </div>
    );
  }

  const activeChallenge = state.challenges.find(c => c.status === 'active');

  const toggle = (i: number) =>
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold tracking-tight">Demo Script</h2>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">IgniteUp — Walkthrough Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {demoSteps.map((step, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={checked[i]} onCheckedChange={() => toggle(i)} />
              <span className={`text-sm ${checked[i] ? 'line-through text-muted-foreground' : ''}`}>
                {i + 1}. {step}
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickLinks.map(link => (
              <Button key={link.to} variant="outline" size="sm" asChild className="justify-start gap-2">
                <Link to={link.to}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Demo State */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Demo State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Role</span>
            <Badge variant="outline" className="capitalize">{state.currentRole}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Demo Mode</span>
            <Badge variant="default">ON</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Active Challenge</span>
            <span className="text-sm font-medium">{activeChallenge?.title ?? 'None'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
