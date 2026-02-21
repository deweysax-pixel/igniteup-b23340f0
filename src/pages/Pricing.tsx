import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Check, Sparkles, ArrowRight, Copy, CheckCircle2,
  Briefcase, Users, Building2, Plus,
  MessageSquare, Lightbulb, GraduationCap,
  Map, Flame, ClipboardCheck,
} from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

/* ── Plan data ── */
const plans = [
  {
    id: 'starter',
    title: 'Starter',
    audience: 'Individuals',
    icon: Briefcase,
    features: [
      'Human Skills OS (Today cockpit)',
      'Self-built journeys (2–24 weeks)',
      '3h+ modules with units',
      'Playbooks & templates',
      'Practice engine (check-ins, streaks)',
      'Ignite live certifications',
    ],
  },
  {
    id: 'team',
    title: 'Team',
    audience: 'SMBs',
    icon: Users,
    highlighted: true,
    features: [
      'Everything in Starter, plus:',
      'Team heatmap + weekly review ritual',
      'Leaderboards & team challenges',
      'ROI barometer + reports',
      'Manager dashboard & nudges',
      'Ignite pack renewals at team level',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    audience: 'Scale',
    icon: Building2,
    features: [
      'Everything in Team, plus:',
      'Custom journey builder',
      'Multi-team / org-wide rollout',
      'Advanced analytics & exports',
      'SSO & admin controls',
      'Dedicated success manager',
      'Custom content & branding',
      'SLA & compliance',
    ],
  },
];

const addons = [
  { icon: MessageSquare, title: 'Coaching credits', desc: '1-on-1 sessions with certified coaches' },
  { icon: Users, title: 'Team workshops', desc: 'Facilitated team-building sessions' },
  { icon: Lightbulb, title: 'Expert Q&A', desc: 'Access to leadership subject-matter experts' },
];

const challengeOptions = [
  'Team alignment & meetings',
  'Accountability & follow-through',
  'Hard conversations & trust',
  'Motivation & recognition',
  'Stepping into a bigger role',
];

const roleDemoOptions = ['HR / L&D Lead', 'Manager', 'Director / VP', 'C-Suite', 'Consultant', 'Other'];
const teamSizeOptions = ['1–10', '11–50', '51–200', '201–1000', '1000+'];

/* ── Request Demo Modal ── */
function RequestDemoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', company: '', role: '', teamSize: '', challenge: '', notes: '',
  });

  const isValid = form.name.trim() && form.email.trim() && form.company.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
  };

  const handleCopy = () => {
    const lines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Company: ${form.company}`,
      form.role && `Role: ${form.role}`,
      form.teamSize && `Team size: ${form.teamSize}`,
      form.challenge && `Challenge: ${form.challenge}`,
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
              <DialogTitle>Request a demo</DialogTitle>
              <DialogDescription>Tell us about your team and we'll reach out.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Full name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Work email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Company *" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
              <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  {roleDemoOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.teamSize} onValueChange={v => setForm(p => ({ ...p, teamSize: v }))}>
                <SelectTrigger><SelectValue placeholder="Team size" /></SelectTrigger>
                <SelectContent>
                  {teamSizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.challenge} onValueChange={v => setForm(p => ({ ...p, challenge: v }))}>
                <SelectTrigger><SelectValue placeholder="Biggest challenge" /></SelectTrigger>
                <SelectContent>
                  {challengeOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="resize-none" />
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

/* ── Pricing Page ── */
export default function PricingPage() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/"><img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain" /></Link>
        <div className="flex items-center gap-3">
          <Link to="/fit-check">
            <Button variant="ghost" size="sm">Fit Check</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-16 animate-fade-in">
          {/* Hero */}
          <div className="text-center space-y-4">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs tracking-widest uppercase px-3 py-1">
              Pricing
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Plans that scale with your team
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From solo leaders to enterprise rollouts — pick the plan that fits your ambition.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map(plan => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${plan.highlighted ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'}`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-[10px] tracking-wider uppercase px-2.5">Most popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">{plan.audience}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold pt-3">Custom</p>
                    <p className="text-xs text-muted-foreground">Tailored to your needs</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-2 pt-6">
                      <Button className="w-full gap-2" onClick={() => setDemoOpen(true)}>
                        Request a demo <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/fit-check')}>
                        Open demo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add-ons */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Add-ons</h2>
              <p className="text-sm text-muted-foreground">Extend any plan with premium services.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {addons.map(a => (
                <div key={a.title} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust section */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold tracking-tight flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                What you get in 30 days
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: Map, text: 'Clear journey + weekly actions' },
                { icon: Flame, text: 'Visible signals (Ignite + check-ins)' },
                { icon: ClipboardCheck, text: 'Manager-ready reporting' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <item.icon className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center space-y-4 pb-8">
            <p className="text-muted-foreground">Not sure yet? Try the product first.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2" onClick={() => setDemoOpen(true)}>
                Request a demo <ArrowRight className="h-4 w-4" />
              </Button>
              <Link to="/fit-check">
                <Button size="lg" variant="outline">Take the 90-second Fit Check</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-muted-foreground border-t border-border">
        IgniteUp · Leadership Development Platform
      </footer>

      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}
