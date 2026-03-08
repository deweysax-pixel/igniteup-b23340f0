import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, UserPlus, Map, Copy, Send, ArrowLeft, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { modules } from '@/data/journey-seed';
import type { Role } from '@/types/demo';

const teamSizeOptions = ['1-5', '6-15', '16-50', '51-200', '200+'];

const trackOptions = modules
  .filter(m => m.units && m.units.length > 0)
  .map(m => ({ id: m.id, title: m.title }));

type InvitableRole = 'manager' | 'collaborator' | 'sponsor';

interface DbInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  created_at: string;
  expires_at: string;
  team_id?: string | null;
}

interface DbTeam {
  id: string;
  name: string;
}

interface DbMember {
  id: string;
  full_name: string | null;
}

export default function Workspace() {
  const { state, dispatch } = useDemo();
  const { user, profile, role: authRole, isAdminOrManager, organizationName } = useAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const orgId = profile?.organization_id ?? null;

  // Demo-mode permission check
  const isDemoAllowed = state.currentRole === 'manager' || state.currentRole === 'admin';
  if (!isAuthenticated && !isDemoAllowed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
        <p className="text-muted-foreground">This page is available for Managers and Admins only.</p>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/app/today')}>
          <ArrowLeft className="h-4 w-4" /> Back to Today
        </Button>
      </div>
    );
  }

  if (isAuthenticated) {
    return <AuthenticatedWorkspace orgId={orgId} orgName={organizationName} userId={user.id} />;
  }

  return <DemoWorkspace state={state} dispatch={dispatch} navigate={navigate} />;
}

/* ─── Authenticated (DB-backed) Workspace ─── */

function AuthenticatedWorkspace({ orgId, orgName, userId }: { orgId: string | null; orgName: string | null; userId: string }) {
  const [invitations, setInvitations] = useState<DbInvitation[]>([]);
  const [teams, setTeams] = useState<DbTeam[]>([]);
  const [members, setMembers] = useState<DbMember[]>([]);

  // Invite form
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InvitableRole>('collaborator');
  const [teamId, setTeamId] = useState('');
  const [sending, setSending] = useState(false);

  // Journey assign
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (orgId) loadData();
  }, [orgId]);

  const loadData = async () => {
    if (!orgId) return;
    const [{ data: invData }, { data: teamData }, { data: memberData }] = await Promise.all([
      supabase.from('invitations').select('id, email, role, status, token, created_at, expires_at').eq('organization_id', orgId).order('created_at', { ascending: false }),
      supabase.from('teams').select('id, name').eq('organization_id', orgId),
      supabase.from('profiles').select('id, full_name').eq('organization_id', orgId),
    ]);
    setInvitations((invData as DbInvitation[]) ?? []);
    setTeams((teamData as DbTeam[]) ?? []);
    setMembers((memberData as DbMember[]) ?? []);
  };

  const sendInvite = async () => {
    if (!email.trim() || !orgId) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) { toast.error('Please enter a valid email'); return; }
    setSending(true);
    const insertData: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      organization_id: orgId,
      role,
      invited_by: userId,
    };
    if (teamId && teamId !== 'none') {
      insertData.team_id = teamId;
    }
    const { error } = await supabase.from('invitations').insert(insertData as any);
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Invitation sent to ${email}`);
    setEmail('');
    setRole('collaborator');
    setTeamId('');
    loadData();
  };

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/signup?invite=${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  const pendingInvites = invitations.filter(i => i.status === 'pending');
  const acceptedInvites = invitations.filter(i => i.status === 'accepted');

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {orgName ?? 'Your Organization'} · <Badge variant="secondary" className="text-[10px]">DB-backed</Badge>
        </p>
      </div>

      {/* Section 1: Invite team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Invite your team
          </CardTitle>
          <CardDescription className="text-xs">Send a real invitation link. Recipients will join your organization upon signup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="colleague@company.com" value={email} onChange={e => setEmail(e.target.value.slice(0, 255))} maxLength={255} />
            </div>
            <div className="space-y-1.5">
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
          {teams.length > 0 && (
            <div className="space-y-1.5">
              <Label>Team (optional)</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger><SelectValue placeholder="No team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team</SelectItem>
                  {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={sendInvite} disabled={sending || !email.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? 'Sending…' : 'Send Invite'}
          </Button>

          {/* Pending invitations */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">Pending invitations ({pendingInvites.length})</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="w-[60px]">Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-sm">{inv.email}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{inv.role}</Badge></TableCell>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Organization Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Organization members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet. Invite your first team member above.</p>
          ) : (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-1.5 px-3 rounded-md border border-border text-sm">
                  <span>{m.full_name || '(unnamed)'}</span>
                  {m.id === userId && <Badge variant="secondary" className="text-[10px]">You</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Journey assignment – still demo-only */}
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Map className="h-4 w-4 text-muted-foreground" /> Assign a journey
            <Badge variant="outline" className="text-[10px] ml-auto"><AlertTriangle className="h-3 w-3 mr-1 inline" />Not yet live</Badge>
          </CardTitle>
          <CardDescription className="text-xs">Journey assignment is not yet connected to real data. Coming soon.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

/* ─── Demo-only Workspace (unchanged behavior) ─── */

function DemoWorkspace({ state, dispatch, navigate }: { state: any; dispatch: any; navigate: any }) {
  const [wsName, setWsName] = useState(state.workspace?.name || '');
  const [wsIndustry, setWsIndustry] = useState(state.workspace?.industry || '');
  const [wsTeamSize, setWsTeamSize] = useState(state.workspace?.teamSize || '');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleSaveWorkspace = () => {
    if (!wsName.trim()) { toast.error('Workspace name is required'); return; }
    dispatch({ type: 'SAVE_WORKSPACE', payload: { name: wsName.trim(), industry: wsIndustry, teamSize: wsTeamSize } });
    toast.success('Workspace saved');
  };

  const handleAddInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) { toast.error('Name and email are required'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) { toast.error('Please enter a valid email address'); return; }
    dispatch({ type: 'ADD_INVITE', payload: { name: inviteName.trim(), email: inviteEmail.trim() } });
    setInviteName('');
    setInviteEmail('');
    toast.success('Invite prepared');
  };

  const handleSendInvites = () => {
    if (state.workspaceInvites.length === 0) { toast.error('Add at least one member first'); return; }
    toast.success('Invites prepared');
  };

  const allMembers = [
    ...state.users.filter((u: any) => u.role !== 'admin').map((u: any) => ({ id: u.id, name: u.name })),
    ...state.workspaceInvites.map((inv: any) => ({ id: inv.id, name: inv.name })),
  ];

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleAssignJourney = () => {
    if (!selectedTrack || selectedMembers.length === 0) {
      toast.error('Select a journey and at least one member');
      return;
    }
    const track = trackOptions.find(t => t.id === selectedTrack);
    dispatch({ type: 'ASSIGN_JOURNEY', payload: { journeyTitle: track?.title || '', memberIds: selectedMembers } });
    setSelectedTrack('');
    setSelectedMembers([]);
    toast.success('Journey assigned');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">Set up your team workspace, invite members, and assign journeys. <Badge variant="outline" className="text-[10px]">Demo</Badge></p>
      </div>

      {/* Section 1: Workspace setup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Workspace setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Workspace name *</Label>
            <Input value={wsName} onChange={e => setWsName(e.target.value.slice(0, 100))} placeholder="e.g. Acme Leadership" maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label>Industry (optional)</Label>
            <Input value={wsIndustry} onChange={e => setWsIndustry(e.target.value.slice(0, 100))} placeholder="e.g. Technology" maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label>Team size</Label>
            <Select value={wsTeamSize} onValueChange={setWsTeamSize}>
              <SelectTrigger><SelectValue placeholder="Select team size" /></SelectTrigger>
              <SelectContent>
                {teamSizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveWorkspace}>Save workspace</Button>
        </CardContent>
      </Card>

      {/* Section 2: Invite team */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Invite your team
          </CardTitle>
          <CardDescription className="text-xs">Add members to your workspace. Invites are demo-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Name" value={inviteName} onChange={e => setInviteName(e.target.value.slice(0, 100))} maxLength={100} />
            <Input className="flex-1" placeholder="Work email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value.slice(0, 255))} maxLength={255} />
            <Button variant="outline" size="icon" onClick={handleAddInvite}><UserPlus className="h-4 w-4" /></Button>
          </div>
          {state.workspaceInvites.length > 0 && (
            <div className="space-y-2">
              {state.workspaceInvites.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between py-1.5 px-3 rounded-md border border-border text-sm">
                  <div className="flex items-center gap-2">
                    <span>{inv.name}</span>
                    <span className="text-muted-foreground">{inv.email}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Pending (demo)</Badge>
                </div>
              ))}
              <Button variant="outline" onClick={handleSendInvites}>Send invites</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Assign journey */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" /> Assign a journey
          </CardTitle>
          <CardDescription className="text-xs">Select a track and assign it to team members.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Journey track</Label>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger><SelectValue placeholder="Select a track" /></SelectTrigger>
              <SelectContent>
                {trackOptions.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {allMembers.length > 0 && (
            <div className="space-y-1.5">
              <Label>Recipients</Label>
              <div className="flex flex-wrap gap-2">
                {allMembers.map((m: any) => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      selectedMembers.includes(m.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button onClick={handleAssignJourney}>Assign journey</Button>
          {state.journeyAssignments.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">Assignments</p>
              {state.journeyAssignments.map((a: any) => (
                <div key={a.id} className="text-sm flex items-center justify-between py-1">
                  <span className="font-medium">{a.journeyTitle}</span>
                  <span className="text-xs text-muted-foreground">{a.memberIds.length} member(s)</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
