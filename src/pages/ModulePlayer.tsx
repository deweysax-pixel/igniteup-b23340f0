import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { useDemo } from '@/contexts/DemoContext';
import { useCatalogModule } from '@/hooks/useCatalogModules';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Play, CheckCircle2, Clock, Target, Lightbulb, Circle, HeadphonesIcon, MessageSquare, Users, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SupportRequestModal } from '@/components/SupportRequestModal';
import { useModuleWeeks } from '@/hooks/useModuleWeeks';
import type { ServiceRequestType } from '@/types/demo';

/* Copy-to-clipboard scripts for Scripts & Templates units */
const UNIT_SCRIPTS: Record<string, { label: string; script: string }[]> = {
  'gz1-u6': [
    { label: 'Purpose Conversation Opener', script: 'I\'d like to understand what gives you the most energy in your work right now. What part of what we\'re doing feels most meaningful to you — and where do you feel disconnected?' },
    { label: 'Specific Praise Template', script: 'I noticed [specific behavior] during [situation]. The impact was [concrete result]. That\'s exactly the kind of [quality] that makes our team stronger.' },
    { label: 'Energy Reset Script', script: 'I can see you\'ve been pushing hard. Let\'s look at your week: what can we move, delegate, or drop so you can protect time for [priority]? Sustainable performance is a team standard here.' },
  ],
  'gz2-u6': [
    { label: 'Fast Feedback (SBI)', script: 'During [situation], when you [specific behavior], the impact was [effect on team/outcome]. Going forward, I\'d suggest [feedforward action]. What\'s your take?' },
    { label: 'Difficult Conversation Opener', script: 'I want to raise something because I respect you and I think it matters. This isn\'t about blame — it\'s about finding a better path forward. Can I share what I observed?' },
    { label: 'De-escalation Phrase', script: 'I hear you, and I want to understand your perspective fully. Let\'s slow down for a moment — can you walk me through what this looks like from your side?' },
  ],
  'gz3-u7': [
    { label: 'Weekly Scoreboard Check-in', script: 'Let\'s review our 3 key outcomes for this week: [Outcome 1] — status? [Outcome 2] — status? [Outcome 3] — status? What\'s the one thing blocking progress, and who owns the next step?' },
    { label: 'Async Status Update Template', script: 'Update: [Project/Task]\n• Status: [On track / At risk / Blocked]\n• Key progress: [1 sentence]\n• Next step: [Action + owner + deadline]\n• Need from you: [Specific ask or "None"]' },
    { label: 'Decision Ownership Template', script: 'Decision: [What we decided]\nOwner: [Name]\nDeadline: [Date]\nContext: [1-2 sentences on why]\nEscalation: If blocked, raise to [Name] by [Date]' },
  ],
};

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
  const { data: dbModule, isLoading: dbLoading } = useCatalogModule(id);
  const { data: weeks = [] } = useModuleWeeks(id);
  const mod = id ? getModule(id) : undefined;
  const progress = id ? moduleProgress[id] : undefined;
  const isCompleted = progress?.status === 'completed';
  const hasUnits = mod?.units && mod.units.length > 0;
  const hasWeeks = weeks.length > 0;
  const displayDuration = mod?.totalDurationMinutes || mod?.durationMinutes || dbModule?.total_duration_minutes || dbModule?.duration_minutes || 0;

  // Use DB content for outcomes/lesson, fall back to local module-content
  const outcomes = dbModule?.learning_outcomes ?? [];
  const coreLesson = dbModule?.core_lesson ?? [];

  if (!mod && !dbModule) {
    if (dbLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Module not found.</p>
      </div>
    );
  }

  const moduleTitle = mod?.title ?? dbModule?.title ?? '';
  const moduleCategory = mod?.category ?? dbModule?.category ?? '';
  const moduleLevel = mod?.level ?? dbModule?.level;
  const moduleDesc = mod?.shortDescription ?? dbModule?.short_description ?? '';

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
          <Badge variant="secondary" className="capitalize">{moduleCategory}</Badge>
          {moduleLevel && <Badge variant="outline" className="text-xs">{moduleLevel}</Badge>}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{formatDuration(displayDuration)}
          </span>
          {isCompleted && (
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{moduleTitle}</h1>
        <p className="text-sm text-muted-foreground">{moduleDesc}</p>
      </div>

      {/* Outcomes */}
      {outcomes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Learning Outcomes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {outcomes.map((o, i) => (
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
      {coreLesson.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Core Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {coreLesson.map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Circle className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weeks from DB */}
      {hasWeeks && (
        <Card id="weeks">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Weekly Plan</CardTitle>
            <CardDescription className="text-xs">{weeks.length} weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeks.map((week) => (
                <div key={week.id} className="rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3 p-3">
                    <span className="text-xs font-medium text-primary w-6 shrink-0">{week.week_number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{week.title}</p>
                      {week.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{week.description}</p>
                      )}
                      {week.action && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Target className="h-3 w-3 text-primary shrink-0" />
                          {week.action}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{week.xp} XP</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Units (legacy local data) */}
      {!hasWeeks && hasUnits && (
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
                const scripts = UNIT_SCRIPTS[unit.unitId];
                return (
                  <div key={unit.unitId} className="rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 p-3">
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
                    {scripts && scripts.length > 0 && (
                      <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border/30 mt-1 mx-3">
                        <p className="text-xs font-medium text-muted-foreground pt-2">Copy-to-clipboard scripts:</p>
                        {scripts.map((s, si) => (
                          <div key={si} className="flex items-start gap-2 p-2 rounded bg-background/50 text-xs">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{s.label}</p>
                              <p className="text-muted-foreground mt-0.5 line-clamp-2">{s.script}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="shrink-0 h-7 gap-1 text-xs"
                              onClick={async () => {
                                await navigator.clipboard.writeText(s.script);
                                toast.success('Copied to clipboard');
                                dispatch({
                                  type: 'ADD_EVIDENCE',
                                  payload: {
                                    userId: state.currentUserId,
                                    type: 'script_used',
                                    moduleId: id,
                                    content: `Copied: ${s.label}`,
                                  },
                                });
                              }}
                            >
                              <Copy className="h-3 w-3" /> Copy
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
            {mod?.playbookRoute && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(mod.playbookRoute!)}>
                <BookOpen className="h-3.5 w-3.5" /> Open Playbook
              </Button>
            )}
            {mod?.practiceRoute && (
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
        moduleTitle={moduleTitle}
        onSubmit={(data) => {
          dispatch({
            type: 'ADD_SERVICE_REQUEST',
            payload: {
              requesterName: currentUser?.name || 'Unknown',
              role: state.currentRole,
              requestType: modalType,
              moduleId: id,
              moduleTitle: moduleTitle,
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
