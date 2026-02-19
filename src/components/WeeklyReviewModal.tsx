import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2, Users, BarChart3, ClipboardCheck, Flame, MessageSquare } from 'lucide-react';

interface Step {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; route: string };
  tip: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: <Flame className="h-6 w-6 text-warning" />,
    title: 'Check Ignite renewals',
    description: 'Review who needs to renew their Ignite status this week. Flag members who are At Risk or Inactive.',
    action: { label: 'Open Ignite heatmap', route: '/app/ignite-team' },
    tip: '📌 Focus on members with 2+ packs At Risk — a quick 1:1 nudge is enough.',
  },
  {
    id: 2,
    icon: <ClipboardCheck className="h-6 w-6 text-primary" />,
    title: 'Review check-in submissions',
    description: 'Check who submitted a check-in in the last 7 days. Follow up with those who haven\'t — it takes 60 seconds.',
    action: { label: 'View Team', route: '/app/team' },
    tip: '📌 A simple message like "Did you get to complete your check-in this week?" is enough.',
  },
  {
    id: 3,
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: 'Read the ROI signal',
    description: 'Open the ROI Barometer to see if your team\'s confidence, engagement, and clarity scores are trending up.',
    action: { label: 'Open ROI Barometer', route: '/app/barometer' },
    tip: '📌 A delta above +0.5 is a strong signal. If it\'s flat or negative, look at engagement and check-in patterns.',
  },
  {
    id: 4,
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: 'Plan one feedback conversation',
    description: 'Identify one team member who would benefit from specific, direct feedback this week. Use the SBI template as a guide.',
    action: { label: 'Open Playbooks', route: '/app/playbooks' },
    tip: '📌 One real conversation per week compounds over time. Short, kind, specific — that\'s all it takes.',
  },
  {
    id: 5,
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Set your manager intent for the week',
    description: 'Decide one thing you\'ll do differently or reinforce this week based on what you\'ve just reviewed. Log a check-in to signal it.',
    action: { label: 'Do check-in (60s)', route: '/app/checkin' },
    tip: '📌 Consistency over perfection. Even a small intent logged each week creates momentum.',
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeeklyReviewModal({ open, onOpenChange }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { state } = useDemo();

  const step = STEPS[currentStep];
  const progress = Math.round(((currentStep) / STEPS.length) * 100);
  const isLast = currentStep === STEPS.length - 1;
  const allDone = completed.size === STEPS.length;

  const handleNext = () => {
    setCompleted(prev => new Set(prev).add(step.id));
    if (!isLast) setCurrentStep(c => c + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleNavigate = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setCompleted(new Set());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            Weekly Review
            <Badge variant="outline" className="text-xs font-normal">
              10 min
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step content */}
        {!allDone ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5 p-2 rounded-lg bg-accent">
                {step.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base">{step.title}</h3>
                  {completed.has(step.id) && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>

            {/* Manager tip */}
            <div className="rounded-lg bg-muted/60 border border-border px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              {step.tip}
            </div>

            {/* Step CTA */}
            {step.action && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full"
                onClick={() => handleNavigate(step.action!.route)}
              >
                {step.action.label}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-1.5"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <Button size="sm" onClick={handleNext} className="gap-1.5">
                {isLast ? 'Finish' : 'Next step'}
                {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                {isLast && <CheckCircle2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        ) : (
          /* All done state */
          <div className="space-y-4 pt-2 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-accent">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Review complete 🎯</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You've covered all 5 touchpoints. Consistency here is what drives team performance.
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
