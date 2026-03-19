import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

export function SparkNudgeCard() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handlePrepare = () => {
    window.dispatchEvent(
      new CustomEvent('spark:open', {
        detail: { prompt: 'Generate a quick suggestion for my leadership action this week' },
      })
    );
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center gap-4 py-4 px-5">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            👋 You haven't done your leadership action yet this week.
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Want a quick 30-sec prep?
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" className="gap-1.5 text-xs" onClick={handlePrepare}>
            <Sparkles className="h-3 w-3" />
            Prepare now
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground"
            onClick={() => setDismissed(true)}
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
