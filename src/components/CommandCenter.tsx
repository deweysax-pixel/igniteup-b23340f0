import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, BookOpen, ClipboardCheck, Compass, Flame, Copy, BarChart3 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { WeeklyReviewModal } from '@/components/WeeklyReviewModal';
import { IGNITE_PACKS, computePackStatusForUser } from '@/pages/Ignite';
import { getSeededUnitProgressForUser } from '@/data/demo-seed';

const BULK_NUDGE = "Hi — quick reminder: to keep your Ignite pack Active, please complete one unit and submit your 60s check-in this week. It takes ~5 minutes. Reply if you need help.";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandCenter({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { state } = useDemo();
  const { firstIncompleteModule } = useJourney();
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false);

  const isParticipant = state.currentRole === 'participant';

  const hasDueItems = useMemo(() => {
    if (isParticipant) return false;
    const teamMembers = state.users.filter(u => u.role !== 'admin');
    return teamMembers.some(user => {
      const userUnitProgress = getSeededUnitProgressForUser(user.id);
      const packStatuses = IGNITE_PACKS.map(pack =>
        computePackStatusForUser(pack, userUnitProgress, state.checkIns, user.id)
      );
      return packStatuses.some(ps => ps.status === 'at_risk' || ps.status === 'inactive');
    });
  }, [state.users, state.checkIns, isParticipant]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const handleCopyNudge = () => {
    navigator.clipboard.writeText(BULK_NUDGE);
    toast.success('Copied');
  };

  const handleWeeklyReview = () => {
    onOpenChange(false);
    setWeeklyReviewOpen(true);
  };

  const managerActions = useMemo(() => {
    const actions = [
      {
        id: 'review',
        label: 'Run weekly review (10 min)',
        icon: BarChart3,
        onClick: handleWeeklyReview,
      },
      {
        id: 'heatmap',
        label: 'Open Ignite heatmap (Due)',
        icon: Flame,
        onClick: () => go('/app/ignite-team?filter=due'),
      }
    ];

    if (hasDueItems) {
      // Move heatmap to top
      return [actions[1], actions[0]];
    }
    return actions;
  }, [hasDueItems, handleWeeklyReview, go]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              Command Center
            </SheetTitle>
          </SheetHeader>

          <p className="text-xs text-muted-foreground italic mt-2 mb-5">
            {isParticipant
              ? 'Small actions today create measurable progress.'
              : 'A 10-minute weekly ritual drives adoption and renewal.'}
          </p>

          <div className="space-y-2">
            {isParticipant ? (
              <>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => go(firstIncompleteModule ? `/app/modules/${firstIncompleteModule.id}` : '/app/journey')}
                >
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Start next unit</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => go('/app/checkin')}
                >
                  <ClipboardCheck className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Do check-in (60s)</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => go('/app')}
                >
                  <Compass className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Open Today</span>
                </Button>
              </>
            ) : (
              <>
                {managerActions.map(action => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={action.onClick}
                  >
                    <action.icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{action.label}</span>
                  </Button>
                ))}
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={handleCopyNudge}
                  >
                    <Copy className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">Copy bulk nudge message</span>
                  </Button>
                  <p className="text-[10px] text-muted-foreground px-1">Paste in Slack/Teams/Email.</p>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <WeeklyReviewModal open={weeklyReviewOpen} onOpenChange={setWeeklyReviewOpen} />
    </>
  );
}
