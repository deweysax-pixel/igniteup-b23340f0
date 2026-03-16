import { useState, useRef, useEffect, useCallback } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { getCurrentWeek } from '@/components/WeeklyActionCard';
import { leadershipThemes } from '@/data/leadership-moments';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, MessageSquare, Lightbulb, RotateCcw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spark-chat`;

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement).props.children);
  }
  return '';
}

function CopyScriptButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text.trim());
    setCopied(true);
    toast.success('Script copied');
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors mt-1"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy script'}
    </button>
  );
}

type Msg = { role: 'user' | 'assistant'; content: string };

const momentLookup = (() => {
  const map: Record<string, { title: string; action: string; themeId: string }> = {};
  for (const theme of leadershipThemes) {
    for (const habit of theme.habits) {
      for (const moment of habit.moments) {
        map[moment.id] = { title: moment.title, action: moment.action, themeId: theme.id };
      }
    }
  }
  return map;
})();

const momentInstructions: Record<string, string> = {
  'give-sbi-feedback': 'Use the SBI template to give one short piece of feedback this week.',
  'check-real-understanding': 'Ask a team member to explain the objective in their own words.',
  'clarify-ownership': 'Pick one ambiguous task and name a clear owner for it.',
  'share-team-win': 'Highlight one team achievement in a meeting or message this week.',
  'clarify-real-priority': 'Ask your team: if we could only succeed at one thing this week, what is it?',
  'name-decision-owner': 'In your next meeting, clarify who makes the final call on one open decision.',
  'recognize-contribution': 'Publicly thank one person for a specific contribution this week.',
  'ask-for-proposal': 'Instead of solving a problem yourself, ask someone: what do you propose?',
};

const themeLabels: Record<string, string> = {
  direction: 'Direction',
  alignment: 'Alignment',
  ownership: 'Ownership',
  energy: 'Energy',
};

async function streamChat({
  messages,
  currentAction,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  currentAction: any;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, currentAction }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || 'Something went wrong');
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + '\n' + buf;
        break;
      }
    }
  }
  onDone();
}

export function SparkAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state } = useDemo();
  const activeChallenge = state.challenges.find(ch => ch.status === 'active');

  let currentActionContext: any = null;
  let actionLabel = '';
  let actionInstruction = '';
  let actionTheme = '';
  let actionWeek = 0;

  if (activeChallenge) {
    const totalWeeks = activeChallenge.weeklyActions.length;
    const week = getCurrentWeek(activeChallenge.startDate, activeChallenge.endDate, totalWeeks);
    const action = activeChallenge.weeklyActions[week - 1];
    if (action && week > 0 && week <= totalWeeks) {
      const moment = action.momentId ? momentLookup[action.momentId] : null;
      actionLabel = action.label;
      actionInstruction = action.momentId ? (momentInstructions[action.momentId] || '') : '';
      actionTheme = moment ? themeLabels[moment.themeId] || '' : '';
      actionWeek = week;
      currentActionContext = {
        label: actionLabel,
        instruction: actionInstruction,
        theme: actionTheme,
        week: actionWeek,
      };
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      currentAction: currentActionContext,
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (msg) => {
        setIsLoading(false);
        toast.error(msg);
      },
    });
  };

  const quickActions = [
    { label: 'Generate a suggestion', icon: Lightbulb, prompt: 'Generate a concrete suggestion for how I can execute my leadership action this week.' },
    { label: 'Ask a question', icon: MessageSquare, prompt: 'I have a question about my leadership action this week.' },
    { label: 'Reflect on my action', icon: RotateCcw, prompt: 'Help me reflect on how my leadership action went this week.' },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-0.5 group"
        aria-label="Open Spark assistant"
      >
        <div className="h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center transition-transform group-hover:scale-110">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-[10px] font-semibold text-primary leading-tight">Spark</span>
        <span className="text-[8px] text-muted-foreground leading-tight">by IgniteUp</span>
      </button>

      {/* Chat panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background border-border">
          {/* Header */}
          <SheetHeader className="p-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-sm">Spark — Your leadership coach</SheetTitle>
                <SheetDescription className="text-xs">
                  Ask for help preparing or reflecting on your leadership actions.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="space-y-4">
                {/* Current action context */}
                {actionLabel && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                    <p className="text-xs font-medium text-primary">Your leadership action this week:</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Week {actionWeek}</span>
                      {actionTheme && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">{actionTheme}</Badge>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-medium">{actionLabel}</p>
                    {actionInstruction && (
                      <p className="text-xs text-muted-foreground">{actionInstruction}</p>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Would you like help preparing what to say?
                </p>

                {/* Quick actions */}
                <div className="space-y-2">
                  {quickActions.map(qa => (
                    <button
                      key={qa.label}
                      onClick={() => send(qa.prompt)}
                      disabled={isLoading}
                      className="w-full flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-left text-sm hover:bg-accent/50 transition-colors disabled:opacity-50"
                    >
                      <qa.icon className="h-4 w-4 text-primary shrink-0" />
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_li]:mb-0.5">
                          <ReactMarkdown components={{
                            blockquote: ({ children }) => {
                              const text = extractText(children);
                              return (
                                <div className="relative group/bq">
                                  <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground my-2">
                                    {children}
                                  </blockquote>
                                  {text && (
                                    <CopyScriptButton text={text} />
                                  )}
                                </div>
                              );
                            }
                          }}>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
                      <span className="animate-pulse">Thinking…</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Spark anything…"
                disabled={isLoading}
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
