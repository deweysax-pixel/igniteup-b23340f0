import { useState } from 'react';
import { leadershipThemes, type Theme, type LeadershipMoment } from '@/data/leadership-moments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Compass, Users, Shield, Flame, MessageSquareQuote, Target, Lightbulb, CheckCircle2 } from 'lucide-react';

const themeIcons: Record<string, React.ReactNode> = {
  Compass: <Compass className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
};

const themeColors: Record<string, string> = {
  direction: 'border-l-blue-500',
  alignment: 'border-l-emerald-500',
  ownership: 'border-l-amber-500',
  energy: 'border-l-rose-500',
};

const themeBadgeColors: Record<string, string> = {
  direction: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  alignment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ownership: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  energy: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function MomentCard({ moment, themeId }: { moment: LeadershipMoment; themeId: string }) {
  return (
    <Card className={`border-l-4 ${themeColors[themeId]} bg-card/50`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{moment.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex gap-2">
          <Lightbulb className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-muted-foreground">{moment.whyItMatters}</p>
        </div>

        <div className="flex gap-2">
          <Target className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="whitespace-pre-line font-medium text-foreground">{moment.action}</p>
        </div>

        <div className="flex gap-2">
          <MessageSquareQuote className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-muted-foreground italic">{moment.example}</p>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/50">
          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-foreground font-medium">{moment.checkIn}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ThemeSection({ theme }: { theme: Theme }) {
  const totalMoments = theme.habits.reduce((sum, h) => sum + h.moments.length, 0);

  return (
    <Card className="bg-card/30 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {themeIcons[theme.icon]}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{theme.name}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{theme.description}</CardDescription>
          </div>
          <Badge variant="outline" className={themeBadgeColors[theme.id]}>
            {totalMoments} moment{totalMoments !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-1">
          {theme.habits.map(habit => (
            <AccordionItem key={habit.id} value={habit.id} className="border-b-0">
              <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
                {habit.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 pt-1">
                  {habit.moments.map(moment => (
                    <MomentCard key={moment.id} moment={moment} themeId={theme.id} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default function MomentLibrary() {
  const totalMoments = leadershipThemes.reduce(
    (sum, t) => sum + t.habits.reduce((s, h) => s + h.moments.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leadership Moment Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {leadershipThemes.length} themes · {totalMoments} leadership moments ready to activate
        </p>
      </div>

      <div className="grid gap-4">
        {leadershipThemes.map(theme => (
          <ThemeSection key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  );
}
