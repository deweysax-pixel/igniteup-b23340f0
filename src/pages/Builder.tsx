import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Wand2, Save, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function BuilderPage() {
  const { journey, getModule, removeModuleFromJourney, setDuration, generatePlan, saveJourney } = useJourney();

  const handleGenerate = () => {
    if (journey.steps.length === 0) {
      toast.error('Add modules from the Catalog first');
      return;
    }
    generatePlan();
    toast.success('Plan generated');
  };

  const handleSave = () => {
    saveJourney();
    toast.success('Journey saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Build Your Journey</h1>
        <p className="text-sm text-muted-foreground mt-1">Compose and schedule your learning path</p>
      </div>

      {/* Duration selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Journey Duration</CardTitle>
          <CardDescription className="text-xs">Choose how long your journey should last</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" variant={journey.durationWeeks === 4 ? 'default' : 'outline'} onClick={() => setDuration(4)}>
              4 Weeks
            </Button>
            <Button size="sm" variant={journey.durationWeeks === 8 ? 'default' : 'outline'} onClick={() => setDuration(8)}>
              8 Weeks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Steps list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Selected Modules</CardTitle>
            <span className="text-xs text-muted-foreground">{journey.steps.length} module{journey.steps.length !== 1 ? 's' : ''}</span>
          </div>
        </CardHeader>
        <CardContent>
          {journey.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No modules yet. Add some from the Catalog.</p>
          ) : (
            <div className="space-y-2">
              {journey.steps.map(step => {
                const mod = getModule(step.moduleId);
                if (!mod) return null;
                return (
                  <div key={`${step.weekNumber}-${step.moduleId}`} className="flex items-center gap-3 p-3 rounded-md bg-secondary/50">
                    <span className="text-xs font-medium text-primary w-10 shrink-0">W{step.weekNumber}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{mod.title}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{mod.durationMinutes}m
                        <Badge variant="secondary" className="capitalize text-xs ml-2">{mod.category}</Badge>
                      </span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeModuleFromJourney(step.moduleId)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={handleGenerate}>
          <Wand2 className="h-4 w-4" />
          Generate Plan
        </Button>
        <Button className="gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Journey
        </Button>
      </div>
    </div>
  );
}
