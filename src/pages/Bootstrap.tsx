import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import igniteupLogo from '@/assets/igniteup-logo.png';

export default function Bootstrap() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.rpc('needs_bootstrap').then(({ data, error }) => {
      if (error) {
        setNeedsBootstrap(false);
      } else {
        setNeedsBootstrap(data as boolean);
      }
    });
  }, []);

  if (needsBootstrap === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking setup status…</div>
      </div>
    );
  }

  if (!needsBootstrap) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Setup Complete</CardTitle>
            <CardDescription>An admin account already exists. Bootstrap is disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your admin account. Your organization "<strong>{orgName}</strong>" will be created automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (!orgName.trim()) {
      toast({ title: 'Organization required', description: 'Enter your organization name.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          bootstrap_org: orgName.trim(),
        },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Setup failed', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <img src={igniteupLogo} alt="IgniteUp" className="h-32 w-auto object-contain mx-auto" />
          <p className="text-sm text-muted-foreground">First-time setup — create your admin account</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Bootstrap Admin</CardTitle>
            <CardDescription>This one-time setup creates the first organization and admin account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" placeholder="Acme Corp" value={orgName} onChange={e => setOrgName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Your Full Name</Label>
                <Input id="fullName" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Setting up…' : 'Create Admin Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
