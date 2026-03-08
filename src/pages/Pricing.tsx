import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDemo } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RequestDemoModal } from '@/components/RequestDemoModal';
import {
  Check, ArrowRight, Copy, CheckCircle2,
  Users, Building2, Handshake,
  MessageSquare, Lightbulb, GraduationCap, Puzzle, Info,
} from 'lucide-react';
import igniteupLogo from '@/assets/igniteup-logo.png';

/* ── Plan data ── */
const plans = [
  {
    id: 'team',
    title: 'TEAM',
    icon: Users,
    tagline: 'For one team that wants stronger habits fast.',
    features: [
      'Today (Human Skills OS): what to do now, every day',
      'Journeys (2–24 weeks): build a clear path',
      '3h+ modules, split into units: easy to follow',
      'Playbooks + copy scripts: ready-to-use',
      'Practice + 60s check-ins: keep momentum',
      'Ignite status (Active / Due): based on real action',
      'Manager cockpit: Weekly Review + action heatmap + nudges',
      'ROI barometer + essential reports',
    ],
    bestFor: 'Best for: 1 manager, 1 team, one clear rollout.',
  },
  {
    id: 'business',
    title: 'BUSINESS',
    icon: Building2,
    highlighted: true,
    tagline: 'For several teams — with consolidated reporting.',
    includesLabel: 'Everything in TEAM, plus:',
    features: [
      'Multi-teams / multi-cohorts: deploy to multiple groups',
      'Journey templates: standardize what works',
      'Consolidated reporting: company view + team view',
      'Exports (CSV / print): share internally',
      'Common cadence: simple governance across teams',
    ],
    bestFor: 'Best for: HR/L&D rolling out across multiple teams.',
  },
  {
    id: 'enterprise',
    title: 'ENTERPRISE (SUCCESS PARTNERSHIP)',
    icon: Handshake,
    tagline: 'For guaranteed adoption and ROI — with hands-on support.',
    includesLabel: 'Everything in BUSINESS, plus:',
    features: [
      'Success Manager (monthly): monthly steering, adoption review, and next actions',
      '90-day rollout plan (one-time): rollout steps + manager kit',
      'Quarterly Executive Review: leadership-ready summary and next plan',
    ],
    bestFor: 'Best for: organizations that want results, not just a tool.',
  },
];

const addons = [
  { icon: MessageSquare, title: 'Coaching Credits (monthly pool)', desc: 'A monthly pool of coaching sessions to unlock tough situations.' },
  { icon: GraduationCap, title: 'Team Workshops', desc: 'Live workshops (kick-off, feedback, accountability, team performance).' },
  { icon: Lightbulb, title: 'Expert Q&A (monthly)', desc: "Monthly 'Ask an expert' session + async Q&A support." },
  { icon: Puzzle, title: 'Custom Module / Playbook', desc: 'We adapt content to your context (your cases, your language, your reality).' },
];

const addonDetails: Record<string, { bullets: string[]; bestFor: string }> = {
  'Coaching Credits (monthly pool)': {
    bullets: [
      'A monthly pool of coaching sessions for real situations.',
      'Use credits when a manager or team gets stuck.',
      'Turn challenges into action fast.',
    ],
    bestFor: 'Teams that want support on demand.',
  },
  'Team Workshops': {
    bullets: [
      'Live sessions to accelerate adoption and alignment.',
      'Kick-off, feedback, accountability, team performance.',
      'Designed to trigger practice immediately.',
    ],
    bestFor: 'Fast rollout and culture shifts.',
  },
  'Expert Q&A (monthly)': {
    bullets: [
      "Monthly 'Ask an expert' session + async Q&A support.",
      'Get answers when timing matters.',
      'Help managers handle real cases.',
    ],
    bestFor: 'Managers facing recurring people challenges.',
  },
  'Custom Module / Playbook': {
    bullets: [
      'Adapt content to your context (your cases, your language).',
      'Increase relevance and adoption.',
      "Make training feel 'made for us'.",
    ],
    bestFor: 'Organizations with specific scenarios.',
  },
};

const faqs = [
  {
    q: 'How does billing work?',
    a: 'Team / Business: per user / month. Enterprise: per user / month + a Success Partnership retainer.',
  },
  {
    q: 'What is Ignite?',
    a: 'Ignite is a live status of real-world capability — not a diploma. Active stays active only through real practice signals.',
  },
  {
    q: "What's included in every plan?",
    a: 'The full secure platform, journeys, modules, practice, Ignite, and core reporting. Plans differ by scale and support.',
  },
];

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

/* (RequestDemoModal is now imported from @/components/RequestDemoModal) */

/* ── Pricing Page ── */
export default function PricingPage() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [addonDetail, setAddonDetail] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link to="/"><img src={igniteupLogo} alt="IgniteUp" className="h-14 w-auto object-contain" /></Link>
        <div className="flex items-center gap-3">
          <Link to="/fit-check">
            <Button variant="ghost" size="sm">Fit Check</Button>
          </Link>
          <Link to="/auth">
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
              Choose the level of support you need
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              All plans include the same secure platform. The difference is scale and support.
            </p>
            <p className="text-xs text-muted-foreground">Billing: per user / month (monthly or annual).</p>
          </div>

          {/* Plan cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map(plan => {
              const Icon = plan.icon;
              const isEnterprise = plan.id === 'enterprise';
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
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground pt-1">{plan.tagline}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1">
                      {'includesLabel' in plan && plan.includesLabel && (
                        <p className="text-xs font-medium text-muted-foreground mb-2">{plan.includesLabel}</p>
                      )}
                      <ul className="space-y-2">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs font-medium text-primary mt-4">{plan.bestFor}</p>
                    </div>
                    <div className="space-y-2 pt-6">
                      <Button className="w-full gap-2" onClick={() => setDemoOpen(true)}>
                        Request a demo <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full gap-2" onClick={() => isEnterprise ? setDemoOpen(true) : navigate('/fit-check')}>
                        {isEnterprise ? 'Talk to us' : 'Open demo'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add-ons */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold tracking-tight">Add-ons (Boosters)</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {addons.map(a => (
                <div key={a.title} className="relative flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <button
                    className="absolute top-3 right-3 h-6 w-6 rounded-full border border-border bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    aria-label="Learn more"
                    onClick={() => setAddonDetail(a.title)}
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold tracking-tight text-center">FAQ</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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

      {/* Add-on Detail Modal */}
      <Dialog open={!!addonDetail} onOpenChange={v => !v && setAddonDetail(null)}>
        <DialogContent className="max-w-sm">
          {addonDetail && addonDetails[addonDetail] && (() => {
            const detail = addonDetails[addonDetail];
            const addon = addons.find(a => a.title === addonDetail);
            const Icon = addon?.icon || Info;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <DialogTitle className="text-base">{addonDetail}</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="space-y-4 pt-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">What it is</p>
                    <ul className="space-y-1.5">
                      {detail.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs font-medium text-primary">Best for: {detail.bestFor}</p>
                  <div className="flex gap-2 pt-1">
                    <div className="flex-1 space-y-2 pt-1">
                      <Button className="w-full gap-2" size="sm" onClick={() => { setAddonDetail(null); setDemoOpen(true); }}>
                        Request a demo <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">We’ll reply within 24–48h.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAddonDetail(null)}>
                      Not now
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
