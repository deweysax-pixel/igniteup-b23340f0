import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Shield, Play, UserCog, KeyRound, Plus, Power, ExternalLink, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/* ── Types ─────────────────────────────────── */

type InternalRole = 'super_admin' | 'internal_admin' | 'demo_operator' | 'support_ops';

interface InternalAccount {
  id: string;
  name: string;
  email: string;
  role: InternalRole;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface DemoAccount {
  id: string;
  login: string;
  demo_environment: string;
  enabled: boolean;
  created_at: string;
  last_used_at: string | null;
}

const ROLE_LABELS: Record<InternalRole, string> = {
  super_admin: 'Super Admin',
  internal_admin: 'Internal Admin',
  demo_operator: 'Demo Operator',
  support_ops: 'Support / Ops',
};

const ROLE_COLORS: Record<InternalRole, string> = {
  super_admin: 'default',
  internal_admin: 'secondary',
  demo_operator: 'outline',
  support_ops: 'outline',
};

const seedInternalAccounts: InternalAccount[] = [
  { id: '1', name: 'Frederic Sitruk', email: 'fred@igniteup.io', role: 'super_admin', status: 'active', createdAt: '2025-11-01' },
];

/* ── Internal Accounts Tab ─────────────────── */

function InternalAccountsTab() {
  const [accounts] = useState<InternalAccount[]>(seedInternalAccounts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Internal Accounts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage IgniteUp staff and admin accounts — separate from client organization members.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => toast.info('Account creation will be available once the internal accounts table is set up.')}>
          <Plus className="h-3.5 w-3.5" />
          Add Account
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Internal Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(account => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{account.email}</TableCell>
                  <TableCell>
                    <Badge variant={ROLE_COLORS[account.role] as any}>{ROLE_LABELS[account.role]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{account.createdAt}</TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No internal accounts configured yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <UserCog className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Account type separation</p>
            <p className="mt-1">
              Internal accounts are fully isolated from client organization members managed in Workspace.
              They do not appear in client team views, leaderboards, or reports.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Demo Access Tab ───────────────────────── */

function DemoAccessTab() {
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetAccountId, setResetAccountId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const PERSPECTIVES = ['Sponsor', 'Manager', 'Collaborator'];

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('demo-auth?action=list');
      if (!error && data?.accounts) {
        setAccounts(data.accounts);
      }
    } catch {
      toast.error('Failed to load demo accounts');
    } finally {
      setLoading(false);
    }
  };

  const seedAccount = async () => {
    await supabase.functions.invoke('demo-auth?action=seed', { body: {} });
    await loadAccounts();
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Auto-seed if empty
  useEffect(() => {
    if (!loading && accounts.length === 0) {
      seedAccount();
    }
  }, [loading, accounts.length]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/login`);
    toast.success('Demo login URL copied to clipboard.');
  };

  const handleResetPassword = async () => {
    if (!resetAccountId || !newPassword) return;
    setResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('demo-auth?action=reset-password', {
        body: { account_id: resetAccountId, new_password: newPassword },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Failed to reset password');
      } else {
        toast.success('Demo password updated successfully.');
        setResetDialogOpen(false);
        setNewPassword('');
      }
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleToggle = async (accountId: string, enabled: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('demo-auth?action=toggle', {
        body: { account_id: accountId, enabled },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Failed to update account');
      } else {
        toast.success(enabled ? 'Demo account enabled.' : 'Demo account disabled.');
        await loadAccounts();
      }
    } catch {
      toast.error('Failed to update account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Demo Access</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage private demo environments — isolated from real client data and accounts.
        </p>
      </div>

      {accounts.map(env => (
        <Card key={env.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{env.demo_environment} Demo</CardTitle>
                <Badge variant={env.enabled ? 'default' : 'secondary'} className="capitalize">
                  {env.enabled ? 'active' : 'disabled'}
                </Badge>
              </div>
            </div>
            <CardDescription className="mt-1">
              Private demo account with in-app perspective switching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Environment</p>
                <Badge variant="outline">{env.demo_environment}</Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Demo Login</p>
                <span className="font-medium text-xs">{env.login}</span>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Perspectives</p>
                <div className="flex flex-wrap gap-1">
                  {PERSPECTIVES.map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Last Used</p>
                <span className="font-medium">{env.last_used_at ? new Date(env.last_used_at).toLocaleDateString() : '—'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="default"
                className="gap-1.5"
                onClick={() => window.open('/login', '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Demo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={handleCopyUrl}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Demo URL
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setResetAccountId(env.id);
                  setResetDialogOpen(true);
                }}
              >
                <KeyRound className="h-3.5 w-3.5" />
                Reset Password
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={() => handleToggle(env.id, !env.enabled)}
              >
                <Power className="h-3.5 w-3.5" />
                {env.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {accounts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No demo environments configured yet.
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <Play className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Private demo account, multiple perspectives</p>
            <p className="mt-1">
              Each demo environment uses a dedicated demo account with login and password, stored securely in the database.
              Once signed in, users switch between Sponsor, Manager, and Collaborator perspectives
              without re-authenticating. Demo data is fully sandboxed from real client organizations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Demo Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-demo-password">New Password</Label>
              <Input
                id="new-demo-password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={resetting || newPassword.length < 8}>
              {resetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Main Administration Page ──────────────── */

export default function Administration() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Internal accounts &amp; demo access — separate from client Workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="h-3 w-3" />
            Internal Only
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="internal" className="w-full">
        <TabsList>
          <TabsTrigger value="internal" className="gap-1.5">
            <UserCog className="h-3.5 w-3.5" />
            Internal Accounts
          </TabsTrigger>
          <TabsTrigger value="demo" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Demo Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-6">
          <InternalAccountsTab />
        </TabsContent>

        <TabsContent value="demo" className="mt-6">
          <DemoAccessTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
