import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lightbulb, MessageSquare, RotateCcw, Trash2 } from 'lucide-react';
import type { SavedConversation, ConversationType } from './types';

const typeConfig: Record<ConversationType, { label: string; icon: typeof Lightbulb }> = {
  suggestion: { label: 'Suggestion', icon: Lightbulb },
  question: { label: 'Question', icon: MessageSquare },
  reflection: { label: 'Reflection', icon: RotateCcw },
  unknown: { label: 'Chat', icon: MessageSquare },
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  if (d.toDateString() === new Date(now.getTime() - 86400_000).toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  history: SavedConversation[];
  onSelect: (conv: SavedConversation) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function SparkHistory({ history, onSelect, onDelete, onBack }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">History</span>
      </div>
      <ScrollArea className="flex-1">
        {history.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No conversations yet. Start chatting with Spark!
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {history.map(conv => {
              const cfg = typeConfig[conv.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={conv.id}
                  className="group flex items-start gap-2.5 rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onSelect(conv)}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 shrink-0">{cfg.label}</Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{formatTime(conv.timestamp)}</span>
                    </div>
                    {conv.actionTitle && (
                      <p className="text-xs font-medium text-foreground truncate">{conv.actionTitle}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground truncate">{conv.preview}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive transition-all shrink-0"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
