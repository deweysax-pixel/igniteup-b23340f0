import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, BookOpen, ClipboardCheck, Compass, Flame, Copy, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { WeeklyReviewModal } from '@/components/WeeklyReviewModal';

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
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={handleWeeklyReview}
                >
                  <BarChart3 className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Run weekly review (10 min)</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => go('/app/ignite-team?filter=due')}
                >
                  <Flame className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Open Ignite heatmap (Due)</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={handleCopyNudge}
                >
                  <Copy className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium">Copy bulk nudge</span>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <WeeklyReviewModal open={weeklyReviewOpen} onOpenChange={setWeeklyReviewOpen} />
    </>
  );
}
