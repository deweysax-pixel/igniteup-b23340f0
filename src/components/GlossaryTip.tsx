import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const GLOSSARY: Record<string, string> = {
  Ignite: 'A live status of real-world capability — stays Active through practice signals.',
  Due: 'Due = needs renewal (At Risk or Inactive).',
  Journey: 'Your learning path (2–24 weeks) made of modules and weekly steps.',
  Module: 'A deep topic (3h+) split into practical units.',
  Unit: 'A short learning step you can complete in 10–30 minutes.',
  'Check-in': 'A 60-second practice signal that keeps progress visible.',
};

export function GlossaryTip({ term }: { term: keyof typeof GLOSSARY | string }) {
  const text = GLOSSARY[term];
  if (!text) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center align-middle ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`What is ${term}?`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs leading-relaxed">
          <span className="font-semibold">{term}:</span> {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
