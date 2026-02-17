import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { useDemo } from '@/contexts/DemoContext';
import { moduleContent } from '@/data/module-content';
import type { Unit } from '@/types/journey';
import type { ServiceRequestType } from '@/types/demo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Play, BarChart3, ArrowRight, CheckCircle2,
  PartyPopper, Hammer, Clock, Circle, HeadphonesIcon, Ticket, Flame,
} from 'lucide-react';
import { useIgniteStatus, type IgniteStatus } from '@/pages/Ignite';
import { toast } from 'sonner';
import { SupportRequestModal } from '@/components/SupportRequestModal';


function statusLabel(status: string | undefined) {
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="border-primary/30 text-primary text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="text-xs gap-1"><Play className="h-3 w-3" />In progress</Badge>;
    default:
      return <Badge variant="outline" className="text-xs text-muted-foreground gap-1"><Circle className="h-3 w-3" />Not started</Badge>;
  }
}

function statusButton(status: string | undefined): { label: string; variant: 'default' | 'outline' | 'secondary' } {
  switch (status) {
    case 'completed':
      return { label: 'Review', variant: 'outline' };
    case 'in_progress':
      return { label: 'Continue', variant: 'default' };
    default:
      return { label: 'Start module', variant: 'default' };
  }
}

export default function JourneyPage() {
  const navigate = useNavigate();
  const { journey, firstIncompleteModule, getModule, completedCount, moduleProgress, updateModuleStatus, unitProgress } = useJourney();
  const { state, currentUser, dispatch } = useDemo();
  const ignite = useIgniteStatus();
  const igniteColor: Record<IgniteStatus, string> = { active: 'text-emerald-400 border-emerald-500/30', at_risk: 'text-amber-400 border-amber-500/30', inactive: 'text-red-400 border-red-500/30' };
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ServiceRequestType>('coaching_session');
  const uniqueModuleIds = [...new Set(journey.steps.map(s => s.moduleId))];
  const totalModules = uniqueModuleIds.length;
  const allCompleted = totalModules > 0 && completedCount === totalModules;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  const handleModuleAction = (moduleId: string) => {
    const current = moduleProgress[moduleId]?.status;
    if (!current || current === 'not_started') {
      updateModuleStatus(moduleId, 'in_progress');
      toast.success('Module started');
    }
    navigate(`/app/modules/${moduleId}`);
  };

  // Get the next module + its outcomes for the hero card
  const nextMod = firstIncompleteModule;
  const nextModContent = nextMod ? moduleContent[nextMod.id] : undefined;
  const nextModStatus = nextMod ? moduleProgress[nextMod.id]?.status : undefined;
  const nextBtn = statusButton(nextModStatus);

  // Find next incomplete unit for macro-modules
  const nextUnit: Unit | undefined = nextMod?.units?.find(u => unitProgress[u.unitId]?.status !== 'completed');
  const hasUnits = nextMod?.units && nextMod.units.length > 0;

  const isManager = state.currentRole === 'manager' || state.currentRole === 'admin';

  // Next step label for Training Progress card
  const nextStepLabel = (() => {
    if (hasUnits && nextUnit) return `${nextUnit.title} (${nextUnit.durationMinutes} min)`;
    if (nextMod) return `${nextMod.title} (${nextMod.durationMinutes} min)`;
    return null;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Journey</h1>
          <p className="text-sm text-muted-foreground mt-1">Your personalized leadership development path</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`gap-1.5 cursor-pointer ${igniteColor[ignite.status]}`}
            onClick={() => navigate('/app/ignite')}
          >
            <Flame className="h-3 w-3" />
            Ignite: {ignite.status === 'at_risk' ? 'At Risk' : ignite.status.charAt(0).toUpperCase() + ignite.status.slice(1)}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/app/onboarding')}>
            <Hammer className="h-3.5 w-3.5" /> Rebuild my journey
          </Button>
        </div>
      </div>

      {/* Training Progress */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-accent/20">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs uppercase tracking-wider text-primary">Training Progress</CardDescription>
          <CardTitle className="text-xl">{journey.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPercent} className="h-2.5" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount} of {totalModules} modules completed</span>
            <span>{progressPercent}%</span>
          </div>
          {nextStepLabel && (
            <p className="text-sm font-medium text-foreground">
              Next: {nextStepLabel}
            </p>
          )}
          {journey.durationWeeks >= 12 && (
            <p className="text-xs text-muted-foreground italic">Designed for sustainable habit-building (Learning + Practice weeks).</p>
          )}
        </CardContent>
      </Card>

      {allCompleted ? (
        <Card className="border-primary/30">
          <CardContent className="flex flex-col items-center py-10 space-y-4">
            <PartyPopper className="h-10 w-10 text-primary" />
            <h2 className="text-lg font-semibold">Journey Complete!</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Congratulations! You have completed all modules in this journey. Ready for the next challenge?
            </p>
            <Button className="gap-2" onClick={() => navigate('/app/builder')}>
              <Hammer className="h-4 w-4" /> Start a New Journey
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Next Module (prominent) */}
          {nextMod && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Next Module</CardDescription>
                <CardTitle className="text-lg">{nextMod.title}</CardTitle>
                <div className="flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{nextMod.durationMinutes} min
                  </span>
                  <Badge variant="secondary" className="capitalize text-xs">{nextMod.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextModContent && (
                  <ul className="space-y-1.5">
                    {nextModContent.outcomes.slice(0, 2).map((o, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Next unit callout for macro-modules */}
                {hasUnits && nextUnit && (
                  <div className="rounded-md border border-primary/20 bg-accent/30 p-3 space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">Next Unit</p>
                    <p className="text-sm font-medium">{nextUnit.title}</p>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{nextUnit.durationMinutes} min
                      <Badge variant="outline" className="capitalize text-xs ml-1">{nextUnit.type}</Badge>
                    </span>
                    <Button size="sm" className="gap-1.5 mt-1" onClick={() => navigate(`/app/modules/${nextMod.id}#units`)}>
                      <Play className="h-3.5 w-3.5" /> Start unit
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button className="gap-1.5" onClick={() => handleModuleAction(nextMod.id)}>
                    <BookOpen className="h-4 w-4" />
                    {hasUnits && nextUnit
                      ? `Start unit (${nextUnit.durationMinutes} min)`
                      : `${nextBtn.label} (${nextMod.durationMinutes} min)`}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate('/app/checkin')}>
                    <Play className="h-3.5 w-3.5" />
                    Do check-in (60s)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground italic pt-1">Best loop: Learn → Practice → Signal</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Practice */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Practice</CardDescription>
                <CardTitle className="text-base">Weekly Feedback Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Complete your weekly actions and track your streak.</p>
                <Button size="sm" className="gap-1.5" onClick={() => navigate('/app/checkin')}>
                  Do Check-in
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>

            {/* Measure */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Measure</CardDescription>
                <CardTitle className="text-base">ROI Barometer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Track confidence, engagement, and clarity over time.</p>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate('/app/barometer')}>
                  <BarChart3 className="h-3.5 w-3.5" />
                  Open ROI Barometer
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Support options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Support Options</CardTitle>
              <CardDescription className="text-xs">Get expert help along your journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Ticket className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Coaching credits: {state.coachingCredits}</p>
                  <p className="text-xs text-muted-foreground">Use credits for 1-on-1 coaching sessions</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={state.coachingCredits <= 0}
                  onClick={() => {
                    dispatch({ type: 'USE_COACHING_CREDIT' });
                    toast.success('Credit used');
                  }}
                >
                  Use a credit
                </Button>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setModalType('coaching_session'); setModalOpen(true); }}>
                <HeadphonesIcon className="h-3.5 w-3.5" /> Request support
              </Button>
            </CardContent>
          </Card>

          <SupportRequestModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            requestType={modalType}
            onSubmit={(data) => {
              dispatch({
                type: 'ADD_SERVICE_REQUEST',
                payload: {
                  requesterName: currentUser?.name || 'Unknown',
                  role: state.currentRole,
                  requestType: modalType,
                  message: data.message,
                  preferredTimeframe: data.preferredTimeframe,
                  requesterEmail: data.email,
                },
              });
              toast.success('Request sent');
            }}
          />
          {/* Journey Modules list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Journey Modules</CardTitle>
              <CardDescription className="text-xs">Your full training plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {journey.steps.map(step => {
                  const mod = getModule(step.moduleId);
                  if (!mod) return null;
                  const status = moduleProgress[step.moduleId]?.status;
                  const btn = statusButton(status);
                  return (
                    <div
                      key={step.weekNumber}
                      className="flex items-center gap-3 text-sm p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <span className="text-xs font-medium text-primary w-10 shrink-0">W{step.weekNumber}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{mod.title}{step.isPracticeWeek ? ' — Practice & Embed' : ''}</p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{mod.durationMinutes} min
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {statusLabel(status)}
                        <Button size="sm" variant={btn.variant} className="gap-1.5" onClick={() => handleModuleAction(step.moduleId)}>
                          {btn.label}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
