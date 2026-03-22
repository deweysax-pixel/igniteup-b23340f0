import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RequestDemoModal } from '@/components/RequestDemoModal';
import { Lock } from 'lucide-react';

export function PreviewGate() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-md animate-fade-in">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Available in the full version</h2>
        <p className="text-sm text-muted-foreground">
          This section is part of the full IgniteUp workspace.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button onClick={() => setDemoOpen(true)}>Request a demo</Button>
          <Button variant="outline" onClick={() => navigate('/app/journey')}>Back to My Journey</Button>
        </div>
      </div>
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
