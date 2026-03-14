import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { leadershipThemes } from '@/data/leadership-moments';
import { useDemo } from '@/contexts/DemoContext';
import { toast } from 'sonner';
import { Compass, Users, Shield, Flame, Sparkles, RotateCcw, Save, Check } from 'lucide-react';
import type { Challenge, Action, LeadershipThemeId } from '@/types/demo';

const themeIcons: Record<string, React.ElementType> = {
  direction: Compass,
  alignment: Users,
  ownership: Shield,
  energy: Flame,
};

const themeDescriptions: Record<string, string> = {
  direction: 'Set clear priorities and decisions so teams know where to focus.',
  alignment: 'Build shared understanding and improve feedback loops.',
  ownership: 'Clarify responsibilities and encourage autonomy.',
  energy: 'Sustain motivation through recognition and visible progress.',
};

const themeBorderColors: Record<string, string> = {
  direction: 'border-purple-500/40',
  alignment: 'border-blue-500/40',
  ownership: 'border-amber-500/40',
  energy: 'border-pink-500/40',
};

const themeBgColors: Record<string, string> = {
  direction: 'bg-purple-500/5',
  alignment: 'bg-blue-500/5',
  ownership: 'bg-amber-500/5',
  energy: 'bg-pink-500/5',
};

const themeTextColors: Record<string, string> = {
  direction: 'text-purple-400',
  alignment: 'text-blue-400',
  ownership: 'text-amber-400',
  energy: 'text-pink-400',
};

const themeBadgeStyles: Record<string, string> = {
  direction: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  alignment: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ownership: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  energy: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const DURATION_OPTIONS = [
  { weeks: 4, label: '4 weeks' },
  { weeks: 6, label: '6 weeks' },
  { weeks: 8, label: '8 weeks' },
] as const;

// Flatten all moments with their theme
function getAllMoments() {
  const moments: { id: string; title: string; themeId: string; points: number }[] = [];
  for (const theme of leadershipThemes) {
    for (const habit of theme.habits) {
      for (const moment of habit.moments) {
        moments.push({
          id: moment.id,
          title: moment.title,
          themeId: theme.id,
          points: [10, 15, 20][Math.floor(Math.random() * 3)], // varied XP
        });
      }
    }
  }
  return moments;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface GeneratedWeek {
  week: number;
  momentId: string;
  title: string;
  themeId: string;
  points: number;
}

export default function ProgramBuilder() {
  const navigate = useNavigate();
  const { state, dispatch } = useDemo();
  const previewRef = useRef<HTMLDivElement>(null);

  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWeek[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);

  const allMoments = useMemo(() => getAllMoments(), []);

  const toggleTheme = (id: string) => {
    setSelectedThemes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setGeneratedPlan(null);
    setSaved(false);
  };

  const handleGenerate = () => {
    if (selectedThemes.length === 0) {
      toast.error('Select at least one focus area');
      return;
    }
    if (!duration) {
      toast.error('Select a program duration');
      return;
    }

    const filtered = allMoments.filter(m => selectedThemes.includes(m.themeId));
    if (filtered.length === 0) {
      toast.error('No moments found for the selected themes');
      return;
    }

    // Fill weeks by cycling through shuffled moments
    const shuffled = shuffle(filtered);
    const plan: GeneratedWeek[] = [];
    for (let i = 0; i < duration; i++) {
      const moment = shuffled[i % shuffled.length];
      plan.push({
        week: i + 1,
        momentId: moment.id,
        title: moment.title,
        themeId: moment.themeId,
        points: [10, 15, 20][i % 3],
      });
    }
    setGeneratedPlan(plan);
    setSaved(false);
    setJustGenerated(true);
    toast.success('Sprint generated!');

    // Scroll to preview and clear highlight after animation
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    setTimeout(() => setJustGenerated(false), 3000);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleSave = () => {
    if (!generatedPlan || !duration) return;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() + (7 - startDate.getDay()) % 7 + 1); // next Monday
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration * 7 - 1);

    const themeNames = selectedThemes.map(
      id => leadershipThemes.find(t => t.id === id)?.name ?? id
    );
    const primaryTheme = selectedThemes[0] as LeadershipThemeId;

    const newChallenge: Challenge = {
      id: `ch-${Date.now()}`,
      title: `${themeNames.join(' + ')} Sprint — ${duration} weeks`,
      description: `Custom leadership sprint focused on ${themeNames.join(', ').toLowerCase()}.`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'upcoming',
      themeId: primaryTheme,
      weeklyActions: generatedPlan.map((w, i) => ({
        id: `gen-a-${Date.now()}-${i}`,
        label: w.title,
        points: w.points,
        momentId: w.momentId,
      })),
    };

    // Add to demo state challenges
    state.challenges.push(newChallenge);
    setSaved(true);
    toast.success('Program saved! It will appear on your Challenges page.');
  };

  const canGenerate = selectedThemes.length > 0 && duration !== null;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create your leadership sprint</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select the leadership areas you want to strengthen and the duration of the program.
        </p>
      </div>

      {/* STEP 1 — Focus areas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-2 py-0">Step 1</Badge>
          <span className="text-sm font-semibold">Select focus areas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {leadershipThemes.map(theme => {
            const Icon = themeIcons[theme.id];
            const isSelected = selectedThemes.includes(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => toggleTheme(theme.id)}
                className={`relative text-left rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? `${themeBorderColors[theme.id]} ${themeBgColors[theme.id]}`
                    : 'border-border/50 hover:border-border'
                }`}
              >
                {isSelected && (
                  <div className={`absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center`}>
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`h-4 w-4 ${themeTextColors[theme.id]}`} />
                  <span className="font-medium text-sm">{theme.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{themeDescriptions[theme.id]}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* STEP 2 — Duration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-2 py-0">Step 2</Badge>
          <span className="text-sm font-semibold">Select program duration</span>
        </div>
        <div className="flex gap-3">
          {DURATION_OPTIONS.map(opt => (
            <button
              key={opt.weeks}
              onClick={() => { setDuration(opt.weeks); setGeneratedPlan(null); setSaved(false); }}
              className={`rounded-lg border-2 px-5 py-3 text-sm font-medium transition-all ${
                duration === opt.weeks
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* STEP 3 — Generate */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] px-2 py-0">Step 3</Badge>
          <span className="text-sm font-semibold">Generate sprint</span>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate my sprint
        </Button>
      </div>

      {/* STEP 4 — Preview */}
      {generatedPlan && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-2 py-0">Preview</Badge>
              <span className="text-sm font-semibold">Leadership Sprint Preview</span>
            </div>
            <Card>
              <CardContent className="pt-5 space-y-2">
                {generatedPlan.map(w => {
                  const theme = leadershipThemes.find(t => t.id === w.themeId);
                  return (
                    <div
                      key={w.week}
                      className="flex items-center justify-between p-3 rounded-md bg-secondary/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-medium text-muted-foreground shrink-0 w-12">
                          Week {w.week}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1.5 py-0 shrink-0 ${themeBadgeStyles[w.themeId]}`}
                        >
                          {theme?.name}
                        </Badge>
                        <span className="text-sm font-medium truncate">{w.title}</span>
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0">+{w.points} XP</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2" onClick={handleRegenerate}>
                <RotateCcw className="h-4 w-4" />
                Regenerate
              </Button>
              <Button
                className="gap-2"
                onClick={handleSave}
                disabled={saved}
              >
                <Save className="h-4 w-4" />
                {saved ? 'Saved ✓' : 'Save program'}
              </Button>
            </div>

            {saved && (
              <p className="text-xs text-muted-foreground">
                Your sprint has been saved.{' '}
                <button
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={() => navigate('/app/challenges')}
                >
                  View on Challenges →
                </button>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
