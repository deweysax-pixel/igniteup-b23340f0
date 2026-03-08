import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Map } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const dimensions = [
  { key: 'confidence' as const, label: 'Confidence', question: 'I feel confident in my leadership capabilities.' },
  { key: 'engagement' as const, label: 'Engagement', question: 'I am actively invested in developing my team.' },
  { key: 'clarity' as const, label: 'Clarity', question: 'I have a clear vision of my leadership objectives.' },
];

export default function Barometer() {
  const navigate = useNavigate();
  const { state, dispatch, currentUser } = useDemo();
  const { journey } = useJourney();
  const [scores, setScores] = useState({ confidence: 3, engagement: 3, clarity: 3 });
  const [submitted, setSubmitted] = useState(false);

  const activeChallenge = state.challenges.find(c => c.status === 'active');
  const currentWeek = 4;

  const handleSubmit = () => {
    if (!currentUser || !activeChallenge) return;
    dispatch({
      type: 'SUBMIT_BAROMETER',
      payload: {
        userId: currentUser.id,
        challengeId: activeChallenge.id,
        weekNumber: currentWeek,
        scores,
      },
    });
    setSubmitted(true);
    toast.success('Barometer recorded. Thank you for your feedback!');
  };

  // Compute aggregate data for chart
  const canSeeAggregate = state.currentRole === 'admin' || state.currentRole === 'manager' || state.currentRole === 'sponsor';
  const responses = state.barometerResponses.filter(r => r.challengeId === activeChallenge?.id);

  const chartData = dimensions.map(d => {
    const week1 = responses.filter(r => r.weekNumber === 1);
    const latest = responses.filter(r => r.weekNumber === Math.max(...responses.map(r2 => r2.weekNumber)));
    const baseline = week1.length > 0 ? week1.reduce((s, r) => s + r.scores[d.key], 0) / week1.length : 0;
    const current = latest.length > 0 ? latest.reduce((s, r) => s + r.scores[d.key], 0) / latest.length : 0;
    return {
      dimension: d.label,
      'Baseline (W1)': +baseline.toFixed(1),
      Current: +current.toFixed(1),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ROI Barometer</h2>
        <p className="text-sm text-muted-foreground mt-1">Rate your week in 30 seconds</p>
      </div>

      {/* Journey banner */}
      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          Measurement for: <span className="text-foreground font-medium">{journey.title}</span>
        </p>
        <Button variant="link" size="sm" className="h-auto p-0 gap-1.5 text-primary shrink-0" onClick={() => navigate('/app/journey')}>
          <Map className="h-3.5 w-3.5" />
          Back to My Journey
        </Button>
      </div>

      {/* Form */}
      {!submitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Week {currentWeek}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {dimensions.map(d => (
              <div key={d.key} className="space-y-2">
                <p className="text-sm">{d.question}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-4">1</span>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[scores[d.key]]}
                    onValueChange={([v]) => setScores(s => ({ ...s, [d.key]: v }))}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-4">5</span>
                  <span className="text-sm font-medium text-primary w-6 text-right">{scores[d.key]}</span>
                </div>
              </div>
            ))}
            <Button onClick={handleSubmit} className="w-full">Submit</Button>
          </CardContent>
        </Card>
      )}

      {submitted && (
        <p className="text-sm text-muted-foreground">Thank you! Your feedback has been recorded.</p>
      )}

      {/* Aggregate Chart */}
      {canSeeAggregate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aggregate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="dimension" tick={{ fill: 'hsl(0 0% 55%)', fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fill: 'hsl(0 0% 55%)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(240 8% 12%)', border: '1px solid hsl(240 6% 20%)', borderRadius: 8 }}
                  labelStyle={{ color: 'hsl(0 0% 95%)' }}
                />
                <Legend />
                <Bar dataKey="Baseline (W1)" fill="hsl(240 5% 35%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
