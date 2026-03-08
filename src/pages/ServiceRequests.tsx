import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ServiceRequestStatus } from '@/types/demo';

const typeLabels: Record<string, string> = {
  coaching_session: 'Coaching',
  ask_expert: 'Ask Expert',
  team_workshop: 'Workshop',
};

interface DbServiceRequest {
  id: string;
  request_type: string;
  module_title: string | null;
  message: string | null;
  status: string;
  created_at: string;
  requester_id: string;
  organization_id: string;
}

function AuthenticatedServiceRequests() {
  const { user, role, profile } = useAuth();
  const isAdmin = role === 'admin';
  const [requests, setRequests] = useState<DbServiceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState('coaching_session');
  const [newMessage, setNewMessage] = useState('');
  const [newModule, setNewModule] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data as DbServiceRequest[] | null) ?? []);
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const handleCreate = async () => {
    if (!newMessage.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('service_requests').insert({
      requester_id: user!.id,
      organization_id: profile!.organization_id!,
      request_type: newType,
      message: newMessage.trim(),
      module_title: newModule.trim() || null,
    } as any);
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Request submitted');
    setDialogOpen(false);
    setNewMessage('');
    setNewModule('');
    fetchRequests();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from('service_requests')
      .update({ status } as any)
      .eq('id', id);
    if (error) { toast.error(error.message); return; }
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? `${requests.length} org requests` : 'Your requests'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {!isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Request</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Service Request</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Type</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coaching_session">Coaching Session</SelectItem>
                        <SelectItem value="ask_expert">Ask an Expert</SelectItem>
                        <SelectItem value="team_workshop">Team Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Related Module (optional)</Label>
                    <Input value={newModule} onChange={e => setNewModule(e.target.value)} placeholder="e.g. Active Listening" />
                  </div>
                  <div>
                    <Label>Message</Label>
                    <Textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Describe what you need…" />
                  </div>
                  <Button onClick={handleCreate} disabled={submitting || !newMessage.trim()} className="w-full">
                    {submitting ? 'Submitting…' : 'Submit Request'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {isAdmin ? 'No service requests yet.' : 'You haven\'t submitted any requests yet. Click "New Request" to get started.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{typeLabels[r.request_type] || r.request_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {r.module_title || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {r.message}
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v)}>
                          <SelectTrigger className="h-7 text-xs w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_review">In Review</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="text-xs capitalize">{r.status.replace('_', ' ')}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Demo fallback — unchanged
function DemoServiceRequests() {
  const { state, dispatch } = useDemo();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const requests = filterStatus === 'all' ? state.serviceRequests : state.serviceRequests.filter(r => r.status === filterStatus);

  const handleStatusChange = (id: string, status: ServiceRequestStatus) => {
    dispatch({ type: 'UPDATE_REQUEST_STATUS', payload: { id, status } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">{state.serviceRequests.length} total requests</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No service requests yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm font-medium">{r.requesterName}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{typeLabels[r.requestType] || r.requestType}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">{r.moduleTitle || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.message}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v as ServiceRequestStatus)}>
                        <SelectTrigger className="h-7 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_review">In Review</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ServiceRequests() {
  const { user } = useAuth();
  const { isDemoSession } = useDemo();
  return (isDemoSession || !user) ? <DemoServiceRequests /> : <AuthenticatedServiceRequests />;
}
