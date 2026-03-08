import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/PasswordInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import igniteupLogo from '@/assets/igniteup-logo.png';

interface InviteInfo {
  email: string;
  role: string;
  organization_name: string;
}

export default function AuthSignup() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) return;

    const fetchInvite = async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('email, role, organizations(name)')
        .eq('token', inviteToken)
        .eq('status', 'pending')
        .maybeSingle();

      if (error || !data) {
        setInviteError('This invitation link is invalid or has expired.');
      } else {
        const orgName = (data as any).organizations?.name ?? 'Unknown';
        setInviteInfo({ email: data.email, role: data.role, organization_name: orgName });
        setEmail(data.email);
      }
      setInviteLoading(false);
    };
    fetchInvite();
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Use at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (!inviteToken) {
      toast({ title: 'Invitation required', description: 'You need a valid invitation link to sign up.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, inviteToken);
    setLoading(false);
    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth"><Button variant="outline" className="w-full">Back to Sign In</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verifying invitation…</div>
      </div>
    );
  }

  if (inviteError || !inviteToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invitation Required</CardTitle>
            <CardDescription>
              {inviteError || 'IgniteUp is invitation-only. Ask your organization admin for an invite link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth"><Button variant="outline" className="w-full">Back to Sign In</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <a href="/"><img src={igniteupLogo} alt="IgniteUp" className="h-28 w-auto object-contain mx-auto cursor-pointer" /></a>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign Up</CardTitle>
            <CardDescription>
              You're joining <strong>{inviteInfo?.organization_name}</strong> as{' '}
              <Badge variant="secondary" className="capitalize">{inviteInfo?.role}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Sign Up'}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Already have an account? <Link to="/auth" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
