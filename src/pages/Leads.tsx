import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Copy, Search, ArrowLeft } from 'lucide-react';
import type { DemoRequest, DemoRequestStatus } from '@/types/demo';

const STATUS_OPTIONS: DemoRequestStatus[] = ['new', 'contacted', 'qualified', 'closed'];
const STATUS_LABELS: Record<DemoRequestStatus, string> = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', closed: 'Closed' };
const STATUS_COLORS: Record<DemoRequestStatus, string> = {
  new: 'bg-primary/20 text-primary border-primary/30',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  qualified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-muted text-muted-foreground border-border',
};

function buildFollowUp(lead: DemoRequest): string {
  const lines = [
    'Subject: IgniteUp demo — next step',
    '',
    `Hi ${lead.fullName || 'there'},`,
    '',
  ];
  if (lead.biggestChallenge) {
    lines.push(`Thanks for your request about IgniteUp. Based on what you shared ("${lead.biggestChallenge}"), I'd suggest we focus the demo on:`);
  } else {
    lines.push("Thanks for your request about IgniteUp. I'd suggest we focus the demo on:");
  }
  lines.push(
    '',
    '1) The Human Skills OS (Today) for daily clarity',
    '2) Ignite packs + renewals (signals that stick)',
    '3) The Manager cockpit (weekly review + heatmap) to drive adoption',
    '',
    'What would be the best 30-minute slot for you this week?',
    '',
    'Also, who else should join from your side (HR/L&D, team leads)?',
    '',
    'Best,',
    '',
    'IgniteUp Team',
  );
  return lines.join('\n');
}

function buildSummary(lead: DemoRequest): string {
  const parts = [
    lead.fullName,
    lead.workEmail ? `(${lead.workEmail})` : '',
    lead.company ? `— ${lead.company}` : '',
    lead.teamSize ? `— ${lead.teamSize}` : '',
    lead.biggestChallenge ? `— Challenge: ${lead.biggestChallenge}` : '',
    lead.notes ? `— Notes: ${lead.notes}` : '',
  ].filter(Boolean);
  return parts.join(' ');
}

/* ── Blocked view for participants ── */
function ParticipantBlock() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Available to managers</h1>
        <p className="text-muted-foreground">This area is part of the workspace.</p>
        <Button className="gap-2" onClick={() => navigate('/app/today')}>
          <ArrowLeft className="h-4 w-4" /> Back to Today
        </Button>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const { state, dispatch } = useDemo();
  const [filter, setFilter] = useState<'all' | DemoRequestStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const leads = state.demoRequests;

  const now = Date.now();
  const weekAgo = now - 7 * 86400000;
  const newCount = leads.filter(l => l.status === 'new').length;
  const weekCount = leads.filter(l => new Date(l.createdAt).getTime() >= weekAgo).length;

  const filtered = useMemo(() => {
    let list = filter === 'all' ? leads : leads.filter(l => l.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.fullName.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.workEmail.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads, filter, search]);

  const selected = leads.find(l => l.id === selectedId) || null;

  if (state.currentRole === 'participant') return <ParticipantBlock />;

  const openDetail = (lead: DemoRequest) => {
    setSelectedId(lead.id);
    setNotesDraft(lead.internalNotes);
  };

  const handleStatusChange = (id: string, status: DemoRequestStatus) => {
    dispatch({ type: 'UPDATE_DEMO_REQUEST', payload: { id, status } });
  };

  const handleSaveNotes = () => {
    if (!selectedId) return;
    dispatch({ type: 'UPDATE_DEMO_REQUEST', payload: { id: selectedId, internalNotes: notesDraft } });
    toast.success('Note saved');
  };

  const copyFollowUp = (lead: DemoRequest) => {
    navigator.clipboard.writeText(buildFollowUp(lead));
    toast.success('Copied');
  };

  const copySummary = (lead: DemoRequest) => {
    navigator.clipboard.writeText(buildSummary(lead));
    toast.success('Copied');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground text-sm">Demo requests captured from pricing and preview.</p>
      </div>

      {/* KPI chips */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-primary/30 text-primary">
          New: {newCount}
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
          This week: {weekCount}
        </Badge>
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
          Total: {leads.length}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {(['all', ...STATUS_OPTIONS] as const).map(s => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              className="h-7 text-xs px-3"
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, company, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {leads.length === 0
              ? 'No leads yet. Demo requests submitted on /pricing will appear here.'
              : 'No leads match your filters.'}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Date</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Company</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Challenge</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr
                    key={lead.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => openDetail(lead)}
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-medium">{lead.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.company}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{lead.biggestChallenge}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_LABELS[lead.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Copy follow-up" onClick={() => copyFollowUp(lead)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={v => { if (!v) setSelectedId(null); }}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.fullName}</SheetTitle>
                <SheetDescription>{selected.workEmail}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 pt-4">
                {/* Details */}
                <div className="space-y-2 text-sm">
                  <DetailRow label="Company" value={selected.company} />
                  <DetailRow label="Role" value={selected.role} />
                  <DetailRow label="Team size" value={selected.teamSize} />
                  <DetailRow label="Challenge" value={selected.biggestChallenge} />
                  <DetailRow label="Notes" value={selected.notes || '—'} />
                  <DetailRow label="Source" value={selected.source} />
                  <DetailRow label="Submitted" value={new Date(selected.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} />
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
                  <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.id, v as DemoRequestStatus)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Copy buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1 text-xs" onClick={() => copyFollowUp(selected)}>
                    <Copy className="h-3.5 w-3.5" /> Copy follow-up email
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 flex-1 text-xs" onClick={() => copySummary(selected)}>
                    <Copy className="h-3.5 w-3.5" /> Copy request summary
                  </Button>
                </div>

                {/* Internal notes */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Internal notes</label>
                  <Textarea
                    value={notesDraft}
                    onChange={e => setNotesDraft(e.target.value.slice(0, 1000))}
                    rows={3}
                    className="resize-none text-sm"
                    placeholder="Add notes about this lead…"
                    maxLength={1000}
                  />
                  <Button size="sm" className="mt-2" onClick={handleSaveNotes}>Save note</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span>{value}</span>
    </div>
  );
}
