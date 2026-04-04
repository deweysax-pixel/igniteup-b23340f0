import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '@/contexts/JourneyContext';
import { useCatalogModules } from '@/hooks/useCatalogModules';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Clock, Check, Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['all', 'feedback', 'communication', 'delegation', 'coaching', 'strategy', 'team performance', 'gen z & the new work code'] as const;

export default function CatalogPage() {
  const navigate = useNavigate();
  const { journey, addModuleToJourney, moduleProgress } = useJourney();
  const { data: modules = [], isLoading } = useCatalogModules();
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? modules : modules.filter(m => m.category === filter);
  const inJourney = new Set(journey.steps.map(s => s.moduleId));

  const handleAdd = (mod: { id: string; title: string }) => {
    addModuleToJourney(mod.id);
    toast.success(`"${mod.title}" added to your journey`);
  };

  const statusBadge = (modId: string) => {
    const p = moduleProgress[modId];
    if (p?.status === 'completed') return <Badge variant="outline" className="text-xs border-primary/30 text-primary">Completed</Badge>;
    if (p?.status === 'in_progress') return <Badge variant="outline" className="text-xs">In Progress</Badge>;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse leadership modules</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c} value={c} className="capitalize">{c === 'all' ? 'All categories' : c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(mod => {
          const added = inJourney.has(mod.id);
          const duration = mod.total_duration_minutes || mod.duration_minutes;
          return (
            <Card key={mod.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize text-xs">{mod.category}</Badge>
                  <div className="flex items-center gap-2">
                    {statusBadge(mod.id)}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-base mt-2">{mod.title}</CardTitle>
                <CardDescription className="text-xs">{mod.short_description}</CardDescription>
                {mod.category === 'gen z & the new work code' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-primary mt-1.5 font-medium uppercase tracking-wider">
                    <Flame className="h-3 w-3" /> Supports Ignite practice signals
                  </span>
                )}
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/app/modules/${mod.id}`)}>
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button size="sm" className="gap-1.5" disabled={added} onClick={() => handleAdd(mod)}>
                    {added ? <><Check className="h-3.5 w-3.5" />In Journey</> : <><Plus className="h-3.5 w-3.5" />Add to Journey</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
