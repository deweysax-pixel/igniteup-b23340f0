import { useParams, useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Play, CheckCircle2, Clock, Target, Lightbulb, Circle } from 'lucide-react';
import { moduleContent } from '@/data/module-content';

export default function ModulePlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getModule, moduleProgress, updateModuleStatus } = useJourney();

  const mod = id ? getModule(id) : undefined;
  const content = id ? moduleContent[id] : undefined;
  const progress = id ? moduleProgress[id] : undefined;
  const isCompleted = progress?.status === 'completed';

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

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">{mod.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{mod.durationMinutes} min
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

      {/* Mark Complete */}
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
    </div>
  );
}
