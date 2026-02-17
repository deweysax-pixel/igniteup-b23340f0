import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useDemo } from '@/contexts/DemoContext';
import {
  BookOpen,
  Copy,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import {
  SBI_TEMPLATE,
  ASK_FOR_FEEDBACK_MSG,
  POSITIVE_FEEDBACK_EXAMPLE,
  COURSE_CORRECT_EXAMPLE,
  copyToClipboard,
} from '@/lib/playbook-content';

function CopyButton({ text, label, onCopied }: { text: string; label: string; onCopied?: (label: string) => void }) {
  const handleCopy = async () => {
    await copyToClipboard(text);
    toast.success('Copied to clipboard');
    onCopied?.(label);
  };
  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
      <Copy className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
}

export default function Playbooks() {
  const { state, dispatch } = useDemo();

  const logCopy = (label: string) => {
    dispatch({
      type: 'ADD_EVIDENCE',
      payload: {
        userId: state.currentUserId,
        type: 'script_used',
        moduleId: 'mod-1',
        content: `Copied: ${label}`,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Playbooks</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Step-by-step guides to make every IgniteUp challenge actionable.
        </p>
      </div>

      {/* Primary Playbook */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Weekly Feedback</CardTitle>
            </div>
            <Badge>Active Playbook</Badge>
          </div>
          <CardDescription>
            Build a habit of continuous feedback in under 2 minutes per week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Why it matters */}
          <CollapsibleSection title="Why it matters" icon={CheckCircle2} defaultOpen>
            <ul className="space-y-2 text-sm text-muted-foreground ml-7 list-disc">
              <li>Teams that exchange weekly feedback see 14% higher engagement scores.</li>
              <li>Small, frequent corrections prevent costly misalignment over quarters.</li>
              <li>It normalizes growth conversations so annual reviews hold no surprises.</li>
            </ul>
          </CollapsibleSection>

          {/* 60-second setup */}
          <CollapsibleSection title="60-second setup (Manager)" icon={Clock}>
            <ol className="space-y-2 text-sm text-muted-foreground ml-7 list-decimal">
              <li>Open the active challenge and review the weekly actions.</li>
              <li>Send the "Ask for feedback" message to your team (copy below).</li>
              <li>Block 10 minutes on Friday to read responses and reply with one SBI note each.</li>
            </ol>
          </CollapsibleSection>

          {/* Weekly routine */}
          <CollapsibleSection title="Weekly routine (Participant)" icon={Clock}>
            <ol className="space-y-2 text-sm text-muted-foreground ml-7 list-decimal">
              <li>Reply to the manager's feedback request (keep it under 2 minutes).</li>
              <li>Give one piece of peer feedback using the SBI template.</li>
              <li>Log your check-in on IgniteUp to earn XP.</li>
            </ol>
          </CollapsibleSection>

          {/* Scripts & Templates */}
          <CollapsibleSection title="Scripts & Templates" icon={Copy} defaultOpen>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  A) Ask for feedback (Manager message)
                </p>
                <div className="bg-muted/50 rounded-md p-3 text-sm mb-2 whitespace-pre-line">
                  {ASK_FOR_FEEDBACK_MSG}
                </div>
                <CopyButton text={ASK_FOR_FEEDBACK_MSG} label="Copy message" onCopied={logCopy} />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  B) SBI Feedback Template
                </p>
                <div className="bg-muted/50 rounded-md p-3 text-sm mb-2 whitespace-pre-line">
                  {SBI_TEMPLATE}
                </div>
                <CopyButton text={SBI_TEMPLATE} label="Copy SBI template" onCopied={logCopy} />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  C) Positive feedback example
                </p>
                <div className="bg-muted/50 rounded-md p-3 text-sm mb-2 whitespace-pre-line">
                  {POSITIVE_FEEDBACK_EXAMPLE}
                </div>
                <CopyButton text={POSITIVE_FEEDBACK_EXAMPLE} label="Copy example" onCopied={logCopy} />
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                  D) Course-correct feedback example
                </p>
                <div className="bg-muted/50 rounded-md p-3 text-sm mb-2 whitespace-pre-line">
                  {COURSE_CORRECT_EXAMPLE}
                </div>
                <CopyButton text={COURSE_CORRECT_EXAMPLE} label="Copy example" onCopied={logCopy} />
              </div>
            </div>
          </CollapsibleSection>

          {/* Common pitfalls */}
          <CollapsibleSection title="Common pitfalls" icon={AlertTriangle}>
            <ul className="space-y-2 text-sm text-muted-foreground ml-7 list-disc">
              <li>Waiting until Friday to give feedback — do it in the moment when possible.</li>
              <li>Being vague ("good job") instead of specific (use SBI).</li>
              <li>Only giving corrective feedback — aim for a 3:1 positive-to-corrective ratio.</li>
            </ul>
          </CollapsibleSection>

          {/* How to measure */}
          <CollapsibleSection title="How to measure progress" icon={BarChart3}>
            <ul className="space-y-2 text-sm text-muted-foreground ml-7 list-disc">
              <li>Track participation rate on the Dashboard — target 80%+ weekly check-ins.</li>
              <li>Review the ROI Barometer for engagement trend over 4+ weeks.</li>
            </ul>
          </CollapsibleSection>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">1-on-1 Conversations</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Structure meaningful 1-on-1s that drive accountability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recognition Rituals</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Build a culture of peer recognition with lightweight rituals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
