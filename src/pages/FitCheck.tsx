import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles, Target, BarChart3, Eye, Zap } from 'lucide-react';
import { usePreview } from '@/contexts/PreviewContext';
import { RequestDemoModal } from '@/components/RequestDemoModal';
import igniteupLogo from '@/assets/igniteup-logo.png';

const sections = [
  {
    id: 'focus',
    title: 'Focus',
    icon: Target,
    questions: [
      'Do your managers have a clear leadership behavior to work on each week?',
      'Are leadership priorities aligned across your management team?',
    ],
  },
  {
    id: 'consistency',
    title: 'Consistency',
    icon: BarChart3,
    questions: [
      'Do your managers practice leadership behaviors on a weekly basis?',
      'Are leadership habits maintained consistently over time?',
    ],
  },
  {
    id: 'visibility',
    title: 'Visibility',
    icon: Eye,
    questions: [
      'Can you see which managers are actually applying what they learned?',
      'Do you have data on leadership behavior adoption across teams?',
    ],
  },
  {
    id: 'activation',
    title: 'Activation',
    icon: Zap,
    questions: [
      'Is leadership training translated into concrete weekly actions?',
      'Do managers receive support to turn learning into real behavior change?',
    ],
  },
];

const answerOptions = [
  { label: 'Always', points: 4 },
  { label: 'Sometimes', points: 3 },
  { label: 'Rarely', points: 2 },
  { label: 'Never', points: 1 },
];

type ScoreCategory = 'weak' | 'inconsistent' | 'structured' | 'high';

function getCategory(score: number): ScoreCategory {
  if (score <= 12) return 'weak';
  if (score <= 20) return 'inconsistent';
  if (score <= 26) return 'structured';
  return 'high';
}

const categoryConfig: Record<ScoreCategory, { label: string; color: string; headline: string; message: string; diagnostic: string; gap: string }> = {
  weak: {
    label: 'Weak',
    color: 'text-red-400',
    headline: 'Your managers are not executing.',
    message: 'Training is not translating into action.',
    diagnostic: 'Your managers lack a structured system to turn learning into weekly leadership behaviors.',
    gap: 'The gap is between training delivery and on-the-ground execution — nothing bridges the two.',
  },
  inconsistent: {
    label: 'Inconsistent',
    color: 'text-amber-400',
    headline: 'Your managers are not executing consistently.',
    message: 'You have effort but no system.',
    diagnostic: "Some managers try, but without structure, leadership habits don't stick.",
    gap: "The gap is between intention and consistency — effort exists but isn't sustained or tracked.",
  },
  structured: {
    label: 'Structured',
    color: 'text-blue-400',
    headline: 'Your managers execute — but it doesn\'t scale.',
    message: "You're close but not scalable.",
    diagnostic: 'You have foundations in place, but scaling leadership activation requires better visibility and tooling.',
    gap: 'The gap is between individual effort and organizational-level measurable impact.',
  },
  high: {
    label: 'High',
    color: 'text-emerald-400',
    headline: 'Your managers execute — now optimize.',
    message: 'You have a system but can optimize.',
    diagnostic: "Your leadership execution is strong — now it's about fine-tuning and maximizing ROI.",
    gap: 'The gap is between good execution and continuous, data-driven optimization.',
  },
};

const TOTAL_SECTIONS = sections.length;

export default function FitCheck() {
  const navigate = useNavigate();
  const { setFitCheckAnswers } = usePreview();
  const [demoOpen, setDemoOpen] = useState(false);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const currentSection = sections[sectionIndex];
  const questionBaseIndex = sectionIndex * 2;
  const q1Key = `q${questionBaseIndex}`;
  const q2Key = `q${questionBaseIndex + 1}`;

  const progress = showResults ? 100 : ((sectionIndex) / TOTAL_SECTIONS) * 100;
  const canProceed = answers[q1Key] !== undefined && answers[q2Key] !== undefined;

  const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);
  const category = getCategory(totalScore);
  const config = categoryConfig[category];

  const handleAnswer = (key: string, points: number) => {
    setAnswers(prev => ({ ...prev, [key]: points }));
  };

  const handleNext = () => {
    if (sectionIndex < TOTAL_SECTIONS - 1) {
      setSectionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
    } else if (sectionIndex > 0) {
      setSectionIndex(prev => prev - 1);
    }
  };

  const handleSeeFix = () => {
    setFitCheckAnswers({ behavior: category, ambition: String(totalScore), audience: '', teamSize: '' });
    navigate('/preview/journey');
  };

  const SectionIcon = currentSection?.icon ?? Target;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <img src={igniteupLogo} alt="IgniteUp" className="h-12 w-auto object-contain cursor-pointer" onClick={() => navigate('/')} />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg space-y-6 animate-fade-in">
          {!showResults && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Leadership Execution Score</h1>
                <p className="text-sm text-muted-foreground">8 questions · 90 seconds · instant results</p>
              </div>

              <Progress value={progress} className="h-1.5" />

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <SectionIcon className="h-5 w-5 text-primary" />
                    <CardDescription className="text-xs uppercase tracking-wider text-primary">
                      {currentSection.title} · Section {sectionIndex + 1} of {TOTAL_SECTIONS}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentSection.questions.map((question, qi) => {
                    const key = `q${questionBaseIndex + qi}`;
                    return (
                      <div key={key} className="space-y-2">
                        <p className="text-sm font-medium">{question}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {answerOptions.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => handleAnswer(key, opt.points)}
                              className={`p-2.5 rounded-md border text-sm transition-colors ${
                                answers[key] === opt.points
                                  ? 'border-primary bg-primary/10 text-primary font-medium'
                                  : 'border-border hover:bg-accent/50 text-foreground'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      className="gap-1.5"
                      onClick={handleBack}
                      disabled={sectionIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button disabled={!canProceed} className="gap-1.5" onClick={handleNext}>
                      {sectionIndex < TOTAL_SECTIONS - 1 ? (
                        <>Next <ArrowRight className="h-4 w-4" /></>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> See my score</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {showResults && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Your Execution Score</h1>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  {/* Score display */}
                  <div className="text-center space-y-2">
                    <p className="text-5xl font-bold tracking-tight">{totalScore}<span className="text-lg text-muted-foreground font-normal">/32</span></p>
                    <p className={`text-lg font-semibold ${config.color}`}>{config.label}</p>
                    <p className="text-base font-bold text-foreground">{config.headline}</p>
                  </div>

                  {/* Score bar */}
                  <div className="space-y-1">
                    <Progress value={(totalScore / 32) * 100} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Weak</span>
                      <span>Inconsistent</span>
                      <span>Structured</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Insight block */}
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-medium text-foreground">Diagnostic</p>
                    <p className="text-sm text-muted-foreground">{config.diagnostic}</p>
                    <p className="text-sm text-muted-foreground">{config.gap}</p>
                    <p className="text-sm font-medium text-primary">This is why you don't see measurable impact.</p>
                  </div>

                  {/* Reality check */}
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 text-center">
                    <p className="text-sm font-medium text-foreground italic">
                      Last week, how many of your managers actually applied what they learned?
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Button className="w-full gap-2" size="lg" onClick={handleSeeFix}>
                      See how top teams fix this <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="w-full" size="lg" onClick={() => setDemoOpen(true)}>
                      Book a 20-min execution demo
                    </Button>
                  </div>

                  <button onClick={handleBack} className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                    ← Review my answers
                  </button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
