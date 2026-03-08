import { useState, useEffect } from 'react';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, Send, UserPlus, Users, Shield } from 'lucide-react';

type InvitableRole = 'manager' | 'collaborator' | 'sponsor';

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
}

interface UserWithRole {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  role: AppRole | null;
  user_id: string;
}

export default function AdminInvites() {
  const { user, profile, hasRole } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitableRole>('collaborator');
  const [sending, setSending] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (!isAdmin || !profile) return;
    if (profile.organization_id) {
      setOrgId(profile.organization_id);
      loadData(profile.organization_id);
    }
  }, [isAdmin, profile]);

  const loadData = async (oid: string) => {
    const [{ data: invData }, { data: orgData }, { data: profilesData }] = await Promise.all([
      supabase.from('invitations').select('*').eq('organization_id', oid).order('created_at', { ascending: false }),
      supabase.from('organizations').select('name').eq('id', oid).single(),
      supabase.from('profiles').select('id, full_name, avatar_url, organization_id').eq('organization_id', oid),
    ]);
    setInvitations((invData as Invitation[]) ?? []);
    setOrgName(orgData?.name ?? '');

    // Fetch roles for org members
    if (profilesData && profilesData.length > 0) {
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profilesData.map(p => p.id));

      const merged = profilesData.map(p => {
        const r = rolesData?.find(rd => rd.user_id === p.id);
        return { ...p, role: (r?.role as AppRole) ?? null, user_id: p.id };
      });
      setUsers(merged);
    } else {
      setUsers([]);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim() || !user) return;
    setCreatingOrg(true);
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name: newOrgName.trim() })
      .select('id')
      .single();
    if (error) {
      toast.error('Failed to create organization');
      setCreatingOrg(false);
      return;
    }
    // Set admin's org
    await supabase.from('profiles').update({ organization_id: data.id }).eq('id', user.id);
    setOrgId(data.id);
    setCreatingOrg(false);
    loadData(data.id);
  };

  const sendInvite = async () => {
    if (!email.trim() || !orgId || !user) return;
    setSending(true);
    const { error } = await supabase.from('invitations').insert({
      email: email.trim().toLowerCase(),
      organization_id: orgId,
      role,
      invited_by: user.id,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      loadData(orgId);
    }
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/signup?invite=${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id,role' });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Role updated');
      if (orgId) loadData(orgId);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Admin access required.</p>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Organization</CardTitle>
            <CardDescription>Set up your organization to start inviting team members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input placeholder="Acme Corp" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} />
            </div>
            <Button onClick={createOrganization} disabled={creatingOrg || !newOrgName.trim()} className="w-full">
              {creatingOrg ? 'Creating…' : 'Create Organization'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
        <p className="text-sm text-muted-foreground mt-1">{orgName}</p>
      </div>

      <Tabs defaultValue="invite">
        <TabsList>
          <TabsTrigger value="invite" className="gap-1.5"><UserPlus className="h-4 w-4" /> Invite</TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5"><Users className="h-4 w-4" /> Members</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5"><Send className="h-4 w-4" /> Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send an Invitation</CardTitle>
              <CardDescription>Invite someone to join your organization. Admin role cannot be assigned via invites.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="colleague@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={v => setRole(v as InvitableRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="collaborator">Collaborator</SelectItem>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={sendInvite} disabled={sending || !email.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? 'Sending…' : 'Send Invite'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization Members</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[180px]">Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.full_name || '(unnamed)'}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                            {u.role ?? 'none'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.id !== user?.id ? (
                            <Select value={u.role ?? ''} onValueChange={v => updateUserRole(u.user_id, v as AppRole)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Assign" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="collaborator">Collaborator</SelectItem>
                                <SelectItem value="sponsor">Sponsor</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> You</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              {invitations.filter(i => i.status === 'pending').length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending invitations.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="w-[80px]">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.filter(i => i.status === 'pending').map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell className="text-sm">{inv.email}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{inv.role}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => copyInviteLink(inv.token)} title="Copy invite link">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
