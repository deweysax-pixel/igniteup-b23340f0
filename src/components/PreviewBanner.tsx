import { useNavigate } from 'react-router-dom';
import { usePreview } from '@/contexts/PreviewContext';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

export function PreviewBanner() {
  const { isPreviewMode, setPreviewMode } = usePreview();
  const navigate = useNavigate();

  if (!isPreviewMode) return null;

  const handleExit = () => {
    setPreviewMode(false);
    navigate('/fit-check');
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-primary">
        <Eye className="h-4 w-4" />
        <span className="font-medium">Preview mode</span>
        <span className="text-muted-foreground hidden sm:inline">— exploring a guided demo experience.</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => navigate('/pricing')}>
          Request a demo
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={handleExit}>
          Exit preview <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
