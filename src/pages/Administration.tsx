import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Play, UserCog, KeyRound, Plus, RotateCcw, Power, Trash2, ExternalLink, Copy, Lock } from 'lucide-react';
import { toast } from 'sonner';

/* ──────────────────────────────────────────────
   Static seed data – will be DB-backed later
   ────────────────────────────────────────────── */

type InternalRole = 'super_admin' | 'internal_admin' | 'demo_operator' | 'support_ops';

interface InternalAccount {
  id: string;
  name: string;
  email: string;
  role: InternalRole;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface DemoEnvironment {
  id: string;
  name: string;
  environment: string;
  accessType: 'password-protected';
  status: 'active' | 'disabled';
  perspectives: string[];
  lastUsed: string | null;
  accessRoute: string;
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

const seedDemoAccounts: DemoAccount[] = [
  { id: '1', identifier: 'Horizon Group Demo', environment: 'Horizon Group', status: 'active', lastUsed: '2026-03-07' },
];

/* ──────────────────────────────────────────────
   Internal Accounts Tab
   ────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────
   Demo Accounts Tab
   ────────────────────────────────────────────── */

function DemoAccountsTab() {
  const [accounts] = useState<DemoAccount[]>(seedDemoAccounts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Demo Accounts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage demo access credentials — isolated from real client accounts.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info('Demo account creation will be available in a future update.')}>
          <Plus className="h-3.5 w-3.5" />
          Add Demo Account
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifier</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(account => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.identifier}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.environment}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{account.lastUsed ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Reset access code"
                        onClick={() => toast.info('Access code reset will be available once demo accounts are DB-backed.')}
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={account.status === 'active' ? 'Disable' : 'Enable'}
                        onClick={() => toast.info('Status toggle coming soon.')}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                    No demo accounts configured yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <Play className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Demo isolation</p>
            <p className="mt-1">
              Demo accounts provide access to sandboxed demo environments (e.g. Horizon Group).
              They are completely separate from real client organization data and authentication.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Administration Page
   ────────────────────────────────────────────── */

export default function Administration() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

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
            Demo Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-6">
          <InternalAccountsTab />
        </TabsContent>

        <TabsContent value="demo" className="mt-6">
          <DemoAccountsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
