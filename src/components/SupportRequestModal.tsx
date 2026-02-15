import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ServiceRequestType } from '@/types/demo';

const typeLabels: Record<ServiceRequestType, string> = {
  coaching_session: 'Coaching Session',
  ask_expert: 'Ask an Expert',
  team_workshop: 'Team Workshop',
};

interface SupportRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestType: ServiceRequestType;
  moduleTitle?: string;
  onSubmit: (data: { message: string; preferredTimeframe: string; email?: string }) => void;
}

export function SupportRequestModal({ open, onOpenChange, requestType, moduleTitle, onSubmit }: SupportRequestModalProps) {
  const [message, setMessage] = useState('');
  const [timeframe, setTimeframe] = useState('this_week');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSubmit({ message: message.trim(), preferredTimeframe: timeframe, email: email.trim() || undefined });
    setMessage('');
    setEmail('');
    setTimeframe('this_week');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeLabels[requestType]}
            <Badge variant="secondary" className="text-xs font-normal">{requestType.replace(/_/g, ' ')}</Badge>
          </DialogTitle>
          <DialogDescription>
            {moduleTitle
              ? `Request support for "${moduleTitle}"`
              : 'Submit a support request to your training team.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {moduleTitle && (
            <div>
              <Label className="text-xs text-muted-foreground">Module</Label>
              <p className="text-sm font-medium">{moduleTitle}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="sr-message">Message *</Label>
            <Textarea
              id="sr-message"
              placeholder="Describe what you need help with..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sr-timeframe">Preferred timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="sr-timeframe">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This week</SelectItem>
                <SelectItem value="next_week">Next week</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sr-email">Email (optional)</Label>
            <Input
              id="sr-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!message.trim()}>
            Send request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
