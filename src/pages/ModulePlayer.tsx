import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { useDemo } from '@/contexts/DemoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Play, CheckCircle2, Clock, Target, Lightbulb, Circle, HeadphonesIcon, MessageSquare, Users } from 'lucide-react';
import { moduleContent } from '@/data/module-content';
import { toast } from 'sonner';
import { SupportRequestModal } from '@/components/SupportRequestModal';
import type { ServiceRequestType } from '@/types/demo';

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function unitStatusBadge(status: string | undefined) {
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="border-primary/30 text-primary text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="text-xs gap-1"><Play className="h-3 w-3" />In progress</Badge>;
    default:
      return <Badge variant="outline" className="text-xs text-muted-foreground gap-1"><Circle className="h-3 w-3" />Not started</Badge>;
  }
}

export default function ModulePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getModule, moduleProgress, updateModuleStatus, unitProgress, updateUnitStatus } = useJourney();
  const { state, currentUser, dispatch } = useDemo();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ServiceRequestType>('coaching_session');
  const mod = id ? getModule(id) : undefined;
  const content = id ? moduleContent[id] : undefined;
  const progress = id ? moduleProgress[id] : undefined;
  const isCompleted = progress?.status === 'completed';
  const hasUnits = mod?.units && mod.units.length > 0;
  const displayDuration = mod?.totalDurationMinutes || mod?.durationMinutes || 0;

  if (!mod) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  const handleToggleComplete = () => {
    if (!id) return;
    updateModuleStatus(id, isCompleted ? 'not_started' : 'completed');
  };

  const handleUnitAction = (unitId: string) => {
    const current = unitProgress[unitId]?.status;
    if (!current || current === 'not_started') {
      updateUnitStatus(unitId, 'in_progress', id);
      toast.success('Unit started');
    }
  };

  const handleUnitComplete = (unitId: string) => {
    updateUnitStatus(unitId, 'completed', id);
    toast.success('Unit completed');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="capitalize">{mod.category}</Badge>
          {mod.level && <Badge variant="outline" className="text-xs">{mod.level}</Badge>}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{formatDuration(displayDuration)}
          </span>
          {isCompleted && (
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{mod.title}</h1>
        <p className="text-sm text-muted-foreground">{mod.shortDescription}</p>
      </div>

      {/* Outcomes */}
      {content && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.outcomes.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Core Lesson */}
      {content && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Core Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {content.coreLesson.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Units */}
      {hasUnits && (
        <Card id="units">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Units</CardTitle>
            <CardDescription className="text-xs">{mod.units!.length} units · {formatDuration(displayDuration)} total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mod.units!.map((unit, idx) => {
                const uStatus = unitProgress[unit.unitId]?.status;
                const isUnitCompleted = uStatus === 'completed';
                const btnLabel = uStatus === 'completed' ? 'Review' : uStatus === 'in_progress' ? 'Continue' : 'Start';
                return (
                  <div key={unit.unitId} className="flex items-center gap-3 p-3 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <span className="text-xs font-medium text-primary w-6 shrink-0">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{unit.title}</p>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{unit.durationMinutes}m
                        <Badge variant="outline" className="capitalize text-xs">{unit.type}</Badge>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {unitStatusBadge(uStatus)}
                      {!isUnitCompleted && (
                        <Button size="sm" variant="outline" onClick={() => handleUnitAction(unit.unitId)}>
                          {btnLabel}
                        </Button>
                      )}
                      {uStatus === 'in_progress' && (
                        <Button size="sm" onClick={() => handleUnitComplete(unit.unitId)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Done
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Practice</CardTitle>
          <CardDescription className="text-xs">Apply what you have learned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mod.playbookRoute && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(mod.playbookRoute!)}>
                <BookOpen className="h-3.5 w-3.5" /> Open Playbook
              </Button>
            )}
            {mod.practiceRoute && (
              <Button size="sm" className="gap-1.5" onClick={() => navigate(mod.practiceRoute!)}>
                <Play className="h-3.5 w-3.5" /> Start Practice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Need support? */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Need support?</CardTitle>
          <CardDescription className="text-xs">Get help from our training team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setModalType('coaching_session'); setModalOpen(true); }}>
              <HeadphonesIcon className="h-3.5 w-3.5" /> Request coaching session
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setModalType('ask_expert'); setModalOpen(true); }}>
              <MessageSquare className="h-3.5 w-3.5" /> Ask an expert
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setModalType('team_workshop'); setModalOpen(true); }}>
              <Users className="h-3.5 w-3.5" /> Request team workshop
            </Button>
          </div>
        </CardContent>
      </Card>

      <SupportRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        requestType={modalType}
        moduleTitle={mod.title}
        onSubmit={(data) => {
          dispatch({
            type: 'ADD_SERVICE_REQUEST',
            payload: {
              requesterName: currentUser?.name || 'Unknown',
              role: state.currentRole,
              requestType: modalType,
              moduleId: id,
              moduleTitle: mod.title,
              message: data.message,
              preferredTimeframe: data.preferredTimeframe,
              requesterEmail: data.email,
            },
          });
          toast.success('Request sent');
        }}
      />

      {/* Mark Complete */}
      {!hasUnits && (
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant={isCompleted ? 'outline' : 'default'}
            className="gap-2"
            onClick={handleToggleComplete}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
          </Button>
          {isCompleted && progress?.completedAt && (
            <span className="text-xs text-muted-foreground">
              Completed {new Date(progress.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
