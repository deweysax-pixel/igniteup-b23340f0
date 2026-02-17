import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { IGNITE_PACKS, computePackStatusForUser, STATUS_CONFIG, type IgniteStatus } from '@/pages/Ignite';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Flame, Map, Copy, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import type { EvidenceItem } from '@/types/demo';

const NUDGE_MESSAGE = "Quick nudge: to keep your Ignite pack Active, complete one unit and submit one check-in this week. It takes ~5 minutes.";

export default function IgniteTeam() {
  const { state } = useDemo();
  const { unitProgress } = useJourney();
  const navigate = useNavigate();
  const [selectedCell, setSelectedCell] = useState<{ userId: string; packId: string } | null>(null);

  // Get team members (exclude admin user)
  const teamMembers = useMemo(() => state.users.filter(u => u.role !== 'admin'), [state.users]);

  // Build heatmap data
  const heatmapData = useMemo(() => {
    return teamMembers.map(user => {
      const packStatuses = IGNITE_PACKS.map(pack =>
        computePackStatusForUser(pack, unitProgress, state.checkIns, user.id)
      );
      return { user, packStatuses };
    });
  }, [teamMembers, unitProgress, state.checkIns]);

  // Selected cell details
  const selectedDetail = useMemo(() => {
    if (!selectedCell) return null;
    const row = heatmapData.find(r => r.user.id === selectedCell.userId);
    const packResult = row?.packStatuses.find(ps => ps.pack.packId === selectedCell.packId);
    const userEvidence = state.evidenceLog
      .filter(e => e.userId === selectedCell.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
    return { user: row?.user, packResult, evidence: userEvidence };
  }, [selectedCell, heatmapData, state.evidenceLog]);

  // Role gate (after all hooks)
  if (state.currentRole === 'participant') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <h2 className="text-2xl font-semibold">Team Ignite Heatmap</h2>
        <p className="text-muted-foreground max-w-md">This view is available to Managers and Admins.</p>
        <Button onClick={() => navigate('/app/ignite')}><Flame className="h-4 w-4 mr-2" /> Go to My Ignite</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <Flame className="h-6 w-6 text-primary" />
            Team Ignite Heatmap
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Pack-level certification status across your team.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/ignite')}>
          <Flame className="h-3.5 w-3.5" /> My Ignite
        </Button>
      </div>

      {/* Heatmap table */}
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Team Member</TableHead>
                {IGNITE_PACKS.map(pack => (
                  <TableHead key={pack.packId} className="text-center text-xs min-w-[100px]">
                    {pack.title.replace('Ignite: ', '')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {heatmapData.map(({ user, packStatuses }) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-sm">
                    {user.name}
                    <span className="block text-xs text-muted-foreground capitalize">{user.role}</span>
                  </TableCell>
                  {packStatuses.map(ps => {
                    const cfg = STATUS_CONFIG[ps.status];
                    const Icon = cfg.icon;
                    return (
                      <TableCell key={ps.pack.packId} className="text-center">
                        <button
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border cursor-pointer transition-colors hover:opacity-80 ${cfg.bg} ${cfg.color}`}
                          onClick={() => setSelectedCell({ userId: user.id, packId: ps.pack.packId })}
                        >
                          <Icon className="h-3 w-3" />
                          {cfg.label}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedCell} onOpenChange={(open) => { if (!open) setSelectedCell(null); }}>
        <DialogContent className="max-w-md">
          {selectedDetail?.user && selectedDetail?.packResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Flame className="h-4 w-4 text-primary" />
                  {selectedDetail.user.name} — {selectedDetail.packResult.pack.title}
                </DialogTitle>
                <DialogDescription className="text-xs">Pack certification detail</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Status */}
                {(() => {
                  const cfg = STATUS_CONFIG[selectedDetail.packResult.status];
                  const Icon = cfg.icon;
                  return (
                    <div className={`rounded-lg border p-3 ${cfg.bg}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                        <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedDetail.packResult.whyLine}</p>
                    </div>
                  );
                })()}

                {/* Evidence */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Evidence</p>
                  {selectedDetail.evidence.length > 0 ? (
                    selectedDetail.evidence.map((ev: EvidenceItem) => (
                      <div key={ev.id} className="text-xs text-muted-foreground p-2 rounded bg-secondary/30">
                        <span className="font-medium capitalize">{ev.type.replace('_', ' ')}</span>
                        {' · '}
                        {new Date(ev.createdAt).toLocaleDateString()}
                        <p className="mt-0.5">{ev.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No evidence recorded yet.</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={async () => {
                      await navigator.clipboard.writeText(NUDGE_MESSAGE);
                      toast.success('Nudge message copied');
                    }}
                  >
                    <Copy className="h-3 w-3" /> Nudge user
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => {
                      setSelectedCell(null);
                      navigate(`/app/modules/${selectedDetail.packResult!.pack.linkedModuleIds[0]}`);
                    }}
                  >
                    <BookOpen className="h-3 w-3" /> Open pack
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
