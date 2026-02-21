import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { BookOpen, ClipboardCheck, Flame } from 'lucide-react';
import { getWeekRange } from '@/lib/week-utils';

export default function TodayPage() {
  const navigate = useNavigate();
  const { state, currentUser } = useDemo();
  const weekLabel = getWeekRange().label;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Today</h2>
        <Badge variant="outline" className="border-primary/40 text-primary text-xs tracking-widest uppercase px-2 py-0.5 mt-2">
          Human Skills OS
        </Badge>
        <div className="mt-2 space-y-0.5">
          <p className="text-sm text-foreground font-medium">A Human Skills OS for real progress.</p>
          <p className="text-xs text-muted-foreground">Learn, practice, measure, repeat.</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{weekLabel}</p>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate('/app/checkin')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Weekly check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Submit your 60-second reflection.</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate('/app/playbooks')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Playbooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Open a guided practice template.</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate('/app/ignite')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Ignite score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Check your personal engagement pulse.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
