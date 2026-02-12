import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, BarChart3, ArrowRight } from 'lucide-react';

export default function JourneyPage() {
  const navigate = useNavigate();
  const { journey, currentStepModule, getModule } = useJourney();

  const progressPercent = journey.steps.length > 0
    ? Math.round(((journey.currentWeek - 1) / journey.durationWeeks) * 100)
    : 0;

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
            <span>Week {journey.currentWeek} of {journey.durationWeeks}</span>
            <span>{progressPercent}% complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Step */}
        {currentStepModule && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs uppercase tracking-wider text-primary">Today's Step</CardDescription>
              <CardTitle className="text-base">{currentStepModule.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{currentStepModule.shortDescription}</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>{currentStepModule.durationMinutes} min estimated</li>
                <li>Category: {currentStepModule.category}</li>
              </ul>
              <div className="flex gap-2 pt-1">
                {currentStepModule.playbookRoute && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(currentStepModule.playbookRoute!)}>
                    <BookOpen className="h-3.5 w-3.5" />
                    Open Module
                  </Button>
                )}
                {currentStepModule.practiceRoute && (
                  <Button size="sm" className="gap-1.5" onClick={() => navigate(currentStepModule.practiceRoute!)}>
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
            <CardTitle className="text-base">Upcoming Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {journey.steps.map(step => {
                const mod = getModule(step.moduleId);
                if (!mod) return null;
                const isCurrent = step.weekNumber === journey.currentWeek;
                const isPast = step.weekNumber < journey.currentWeek;
                return (
                  <div key={step.weekNumber} className={`flex items-center gap-3 text-sm p-2 rounded-md ${isCurrent ? 'bg-accent/40 text-foreground' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                    <span className={`text-xs font-medium w-12 shrink-0 ${isCurrent ? 'text-primary' : ''}`}>W{step.weekNumber}</span>
                    <span className={isPast ? 'line-through' : ''}>{mod.title}</span>
                    {isCurrent && <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
