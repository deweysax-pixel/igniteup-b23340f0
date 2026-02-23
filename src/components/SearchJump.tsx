import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { Search, BookOpen, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchResult {
  type: 'module' | 'playbook';
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

export function SearchJump() {
  const navigate = useNavigate();
  const { modules } = useJourney();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Static playbook entries
  const playbooks: SearchResult[] = useMemo(() => [
    { type: 'playbook', id: 'pb-1', title: 'Weekly Feedback', subtitle: 'Playbook', route: '/app/playbooks' },
    { type: 'playbook', id: 'pb-2', title: '1-on-1 Conversations', subtitle: 'Playbook (Coming Soon)', route: '/app/playbooks' },
    { type: 'playbook', id: 'pb-3', title: 'Recognition Rituals', subtitle: 'Playbook (Coming Soon)', route: '/app/playbooks' },
  ], []);

  const allItems: SearchResult[] = useMemo(() => [
    ...modules.map(m => ({
      type: 'module' as const,
      id: m.id,
      title: m.title,
      subtitle: m.category,
      route: `/app/modules/${m.id}`,
    })),
    ...playbooks,
  ], [modules, playbooks]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems
      .filter(item => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, allItems]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setOpen(false);
    navigate(result.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search modules, playbooks…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-8 w-48 pl-8 text-xs bg-secondary/50 border-border/50"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
          {results.map(r => (
            <button
              key={r.id}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
              onClick={() => handleSelect(r)}
            >
              {r.type === 'module' ? (
                <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium text-xs truncate">{r.title}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{r.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
