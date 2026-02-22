import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, UserPlus, Map, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { modules } from '@/data/journey-seed';
import type { Role } from '@/types/demo';

const teamSizeOptions = ['1-5', '6-15', '16-50', '51-200', '200+'];

const trackOptions = modules
  .filter(m => m.units && m.units.length > 0)
  .map(m => ({ id: m.id, title: m.title }));

export default function Workspace() {
  const { state, dispatch, currentUser } = useDemo();
  const navigate = useNavigate();
  const isAllowed = state.currentRole === 'manager' || state.currentRole === 'admin';

  // Workspace form
  const [wsName, setWsName] = useState(state.workspace?.name || '');
  const [wsIndustry, setWsIndustry] = useState(state.workspace?.industry || '');
  const [wsTeamSize, setWsTeamSize] = useState(state.workspace?.teamSize || '');

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Assign form
  const [selectedTrack, setSelectedTrack] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
        <p className="text-muted-foreground">This page is available for Managers and Admins only.</p>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/app/today')}>
          <ArrowLeft className="h-4 w-4" /> Back to Today
        </Button>
      </div>
    );
  }

  const handleSaveWorkspace = () => {
    if (!wsName.trim()) { toast.error('Workspace name is required'); return; }
    dispatch({ type: 'SAVE_WORKSPACE', payload: { name: wsName.trim(), industry: wsIndustry, teamSize: wsTeamSize } });
    toast.success('Workspace saved');
  };

  const handleAddInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) { toast.error('Name and email are required'); return; }
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
    ...state.users.filter(u => u.role !== 'admin').map(u => ({ id: u.id, name: u.name })),
    ...state.workspaceInvites.map(inv => ({ id: inv.id, name: inv.name })),
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
    dispatch({
      type: 'ASSIGN_JOURNEY',
      payload: { journeyTitle: track?.title || '', memberIds: selectedMembers },
    });
    setSelectedTrack('');
    setSelectedMembers([]);
    toast.success('Journey assigned');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workspace</h2>
        <p className="text-sm text-muted-foreground mt-1">Set up your team workspace, invite members, and assign journeys.</p>
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
            <Input value={wsName} onChange={e => setWsName(e.target.value)} placeholder="e.g. Acme Leadership" />
          </div>
          <div className="space-y-1.5">
            <Label>Industry (optional)</Label>
            <Input value={wsIndustry} onChange={e => setWsIndustry(e.target.value)} placeholder="e.g. Technology" />
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
            <Input className="flex-1" placeholder="Name" value={inviteName} onChange={e => setInviteName(e.target.value)} />
            <Input className="flex-1" placeholder="Work email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <Button variant="outline" size="icon" onClick={handleAddInvite}><UserPlus className="h-4 w-4" /></Button>
          </div>

          {state.workspaceInvites.length > 0 && (
            <div className="space-y-2">
              {state.workspaceInvites.map(inv => (
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
                {allMembers.map(m => (
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
              {state.journeyAssignments.map(a => (
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
