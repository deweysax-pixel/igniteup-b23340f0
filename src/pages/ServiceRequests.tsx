import { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ServiceRequestStatus } from '@/types/demo';

const statusColors: Record<ServiceRequestStatus, string> = {
  new: 'default',
  in_review: 'secondary',
  scheduled: 'outline',
  closed: 'outline',
};

const typeLabels: Record<string, string> = {
  coaching_session: 'Coaching',
  ask_expert: 'Ask Expert',
  team_workshop: 'Workshop',
};

export default function ServiceRequests() {
  const { state, dispatch } = useDemo();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const requests = filterStatus === 'all'
    ? state.serviceRequests
    : state.serviceRequests.filter(r => r.status === filterStatus);

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
      </div>

      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No service requests yet.
            </div>
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
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{r.requesterName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{typeLabels[r.requestType] || r.requestType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                      {r.moduleTitle || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {r.message}
                    </TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v as ServiceRequestStatus)}>
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
