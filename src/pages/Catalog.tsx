import { useState } from 'react';
import { useJourney } from '@/contexts/JourneyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Module } from '@/types/journey';

const categories = ['all', 'feedback', 'communication', 'delegation', 'coaching', 'strategy'] as const;

export default function CatalogPage() {
  const { modules, journey, addModuleToJourney } = useJourney();
  const [filter, setFilter] = useState<string>('all');
  const [preview, setPreview] = useState<Module | null>(null);

  const filtered = filter === 'all' ? modules : modules.filter(m => m.category === filter);
  const inJourney = new Set(journey.steps.map(s => s.moduleId));

  const handleAdd = (mod: Module) => {
    addModuleToJourney(mod.id);
    toast.success(`"${mod.title}" added to your journey`);
  };

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
          return (
            <Card key={mod.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize text-xs">{mod.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{mod.durationMinutes}m
                  </span>
                </div>
                <CardTitle className="text-base mt-2">{mod.title}</CardTitle>
                <CardDescription className="text-xs">{mod.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPreview(mod)}>
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                  <Button size="sm" className="gap-1.5" disabled={added} onClick={() => handleAdd(mod)}>
                    {added ? <><Check className="h-3.5 w-3.5" />Added</> : <><Plus className="h-3.5 w-3.5" />Add to Journey</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent>
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>{preview.title}</DialogTitle>
                <DialogDescription>{preview.shortDescription}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{preview.durationMinutes} min</span>
                  <Badge variant="secondary" className="capitalize">{preview.category}</Badge>
                </div>
                {preview.playbookRoute && <p>📖 Linked playbook available</p>}
                {preview.practiceRoute && <p>🎯 Practice activity linked</p>}
                {preview.measureRoute && <p>📊 ROI measurement linked</p>}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPreview(null)}>Close</Button>
                <Button className="gap-1.5" disabled={inJourney.has(preview.id)} onClick={() => { handleAdd(preview); setPreview(null); }}>
                  {inJourney.has(preview.id) ? 'Already added' : <><Plus className="h-3.5 w-3.5" />Add to Journey</>}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
