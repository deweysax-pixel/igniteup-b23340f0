import { useState } from 'react';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowRight, Copy, CheckCircle2 } from 'lucide-react';

const challengeOptions = [
  "My team isn't aligned",
  'We avoid hard conversations',
  'Meetings waste time',
  'Accountability is weak',
  'Trust feels fragile',
  "I'm overwhelmed and need focus",
  "I'm stepping into a bigger role",
  'Motivation & recognition are low',
];

const roleOptions = ['HR / L&D Lead', 'Manager', 'Director / VP', 'C-Suite', 'Consultant', 'Other'];
const teamSizeOptions = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

export function RequestDemoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { dispatch } = useDemo();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', company: '', role: '', teamSize: '', challenge: '', notes: '',
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = form.name.trim() && form.email.trim() && emailRegex.test(form.email.trim()) && form.company.trim() && form.role && form.teamSize && form.challenge;

  const handleSubmit = () => {
    if (!isValid) return;
    dispatch({
      type: 'ADD_DEMO_REQUEST',
      payload: {
        fullName: form.name.trim(),
        workEmail: form.email.trim(),
        company: form.company.trim(),
        role: form.role,
        teamSize: form.teamSize,
        biggestChallenge: form.challenge,
        notes: form.notes.trim(),
        source: 'landing',
      },
    });
    setSubmitted(true);
  };

  const handleCopy = () => {
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company}`,
      `Role: ${form.role}`,
      `Team size: ${form.teamSize}`,
      `Challenge: ${form.challenge}`,
      form.notes && `Notes: ${form.notes}`,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines);
    toast.success('Copied');
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setSubmitted(false);
      setForm({ name: '', email: '', company: '', role: '', teamSize: '', challenge: '', notes: '' });
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>See how IgniteUp drives real execution</DialogTitle>
              <DialogDescription>We'll show you how to make your managers act every week — and measure it.</DialogDescription>
            </DialogHeader>
            <ul className="text-sm text-muted-foreground space-y-1.5 pt-1 pl-1">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Identify your execution gaps</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Activate weekly leadership behaviors</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> Track real behavior change</li>
            </ul>
            <div className="space-y-3 pt-2">
              <Input placeholder="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value.slice(0, 100) }))} maxLength={100} />
              <Input placeholder="Work email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value.slice(0, 255) }))} maxLength={255} />
              <Input placeholder="Company *" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value.slice(0, 100) }))} maxLength={100} />
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Role *" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.teamSize} onValueChange={v => setForm(p => ({ ...p, teamSize: v }))}>
                <SelectTrigger><SelectValue placeholder="Team size *" /></SelectTrigger>
                <SelectContent>
                  {teamSizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.challenge} onValueChange={v => setForm(p => ({ ...p, challenge: v }))}>
                <SelectTrigger><SelectValue placeholder="Biggest challenge *" /></SelectTrigger>
                <SelectContent>
                  {challengeOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value.slice(0, 500) }))} rows={2} className="resize-none" maxLength={500} />
              <Button className="w-full gap-2" disabled={!isValid} onClick={handleSubmit}>
                Submit request <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <DialogHeader>
              <DialogTitle>Thanks — we'll get back to you shortly.</DialogTitle>
            </DialogHeader>
            <Button variant="outline" className="gap-2" onClick={handleCopy}>
              <Copy className="h-4 w-4" /> Copy request details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
