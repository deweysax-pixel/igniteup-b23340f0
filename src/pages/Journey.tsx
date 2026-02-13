import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, BarChart3, ArrowRight, CheckCircle2, PartyPopper, Hammer } from 'lucide-react';

export default function JourneyPage() {
  const navigate = useNavigate();
  const { journey, firstIncompleteModule, getModule, completedCount, moduleProgress } = useJourney();

  const uniqueModuleIds = [...new Set(journey.steps.map(s => s.moduleId))];
  const totalModules = uniqueModuleIds.length;
  const allCompleted = totalModules > 0 && completedCount === totalModules;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personalized leadership development path</p>
      </div>

      {/* Hero */}
      <Card className="border-primary/30 bg-gradient-to-br from-card to-accent/20">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wider text-primary">Current Journey</CardDescription>
          <CardTitle className="text-xl">{journey.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{completedCount} of {totalModules} modules completed</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
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
        <div className="grid gap-4 md:grid-cols-2">
          {/* Today's Step */}
          {firstIncompleteModule && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider text-primary">Next Step</CardDescription>
                <CardTitle className="text-base">{firstIncompleteModule.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{firstIncompleteModule.shortDescription}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{firstIncompleteModule.durationMinutes} min estimated</li>
                  <li>Category: {firstIncompleteModule.category}</li>
                </ul>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="gap-1.5" onClick={() => navigate(`/app/modules/${firstIncompleteModule.id}`)}>
                    <BookOpen className="h-3.5 w-3.5" />
                    Open Module
                  </Button>
                  {firstIncompleteModule.practiceRoute && (
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(firstIncompleteModule.practiceRoute!)}>
                      <Play className="h-3.5 w-3.5" />
                      Start Practice
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Journey map */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wider text-primary">Journey Map</CardDescription>
              <CardTitle className="text-base">Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {journey.steps.map(step => {
                  const mod = getModule(step.moduleId);
                  if (!mod) return null;
                  const isDone = moduleProgress[step.moduleId]?.status === 'completed';
                  const isNext = firstIncompleteModule?.id === step.moduleId;
                  return (
                    <div
                      key={step.weekNumber}
                      className={`flex items-center gap-3 text-sm p-2 rounded-md cursor-pointer hover:bg-accent/30 transition-colors ${isNext ? 'bg-accent/40 text-foreground' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}
                      onClick={() => navigate(`/app/modules/${step.moduleId}`)}
                    >
                      <span className={`text-xs font-medium w-12 shrink-0 ${isNext ? 'text-primary' : ''}`}>W{step.weekNumber}</span>
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                      <span className={isDone ? 'line-through' : ''}>{mod.title}</span>
                      {isNext && <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Next</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
