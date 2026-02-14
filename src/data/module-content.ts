import type { ModuleContent } from '@/types/journey';

export const moduleContent: Record<string, ModuleContent> = {
  'mod-1': {
    outcomes: [
      'Deliver feedback that people actually act on',
      'Use the SBI framework with confidence in any setting',
      'Build a weekly feedback habit that compounds over time',
    ],
    coreLesson: [
      'Feedback is a leadership multiplier: the earlier and more specific, the higher the impact.',
      'Use the SBI model: Situation, Behavior, Impact. Keep it factual, never personal.',
      'Aim for a 5:1 ratio of reinforcing to corrective feedback.',
      'Schedule a recurring 10-minute feedback moment each week. Consistency beats perfection.',
      'Ask before giving: "Can I share an observation?" This signals respect and increases receptivity.',
      'Close the loop: ask the recipient what they heard and what they will do differently.',
    ],
  },
  'mod-2': {
    outcomes: [
      'Delegate tasks with clear outcomes and boundaries',
      'Avoid micro-management while maintaining accountability',
      'Free up 3 to 5 hours per week through effective delegation',
    ],
    coreLesson: [
      'Delegation is not abdication. It is transferring ownership with clarity.',
      'Define the outcome, not the method. Let the person choose how to get there.',
      'Set three checkpoints: what success looks like, when to check in, and escalation criteria.',
      'Match task complexity to the person\'s skill and will. Stretch, do not overwhelm.',
      'Resist the urge to jump back in. Coaching through setbacks builds capability faster.',
      'Debrief after completion: what worked, what did not, what to do differently next time.',
    ],
  },
  'mod-3': {
    outcomes: [
      'Run stand-ups that finish in under 10 minutes',
      'Surface blockers early and keep the team aligned',
      'Eliminate status-update fatigue with sharper formats',
    ],
    coreLesson: [
      'Great stand-ups answer one question: what needs to happen today to keep us on track?',
      'Replace "what I did yesterday" with "my number-one priority and what is blocking it."',
      'Timebox ruthlessly: 90 seconds per person, no exceptions.',
      'Rotate facilitation weekly to build shared ownership.',
      'Move problem-solving offline. Stand-up is for surfacing, not solving.',
      'End with one sentence: here is the one thing the team should know today.',
    ],
  },
  'mod-4': {
    outcomes: [
      'Use the GROW model to structure coaching conversations',
      'Help direct reports find their own solutions instead of giving answers',
      'Increase team autonomy and reduce dependency on you',
    ],
    coreLesson: [
      'Coaching is asking, not telling. The best leaders ask questions that unlock thinking.',
      'GROW: Goal, Reality, Options, Will. Follow the sequence, stay curious.',
      'Start with "What outcome do you want?" Clarity on the goal shapes everything.',
      'Resist solutioning. When you give the answer, you own the problem.',
      'Use silence. A 5-second pause after a question often produces the best insight.',
      'End with commitment: "What will you do by when?" This drives accountability.',
    ],
  },
  'mod-5': {
    outcomes: [
      'Craft executive messages that drive decisions in under 2 minutes',
      'Structure updates using the pyramid principle',
      'Eliminate noise and lead with the ask',
    ],
    coreLesson: [
      'Executives do not read. They scan. Lead with the conclusion, then support it.',
      'Use the pyramid: answer first, then 2 to 3 supporting points, then data if asked.',
      'One message equals one ask. If you need two decisions, send two messages.',
      'Replace adjectives with numbers: "significant improvement" becomes "18% increase."',
      'Pre-wire stakeholders before big meetings. Surprises kill momentum.',
      'Practice the elevator version. If you cannot say it in 30 seconds, it is not clear enough.',
    ],
  },
  // Team Performance macro-modules
  'tp-1': {
    outcomes: [
      'Establish measurable trust behaviors across your team',
      'Apply repair moves when trust is damaged',
      'Co-create a team agreement that defines how you show up together',
    ],
    coreLesson: [
      'Trust is not a feeling. It is a set of observable, repeatable behaviors.',
      'Psychological safety means people speak up without fear of punishment.',
      'Micro-behaviors compound: small daily trust signals outweigh grand gestures.',
      'Assume positive intent as a default. Reset when you catch yourself judging.',
      'Repair fast. A quick "I got that wrong" restores more trust than a perfect track record.',
      'Team agreements only work when the team writes them together.',
      'One trust action per week is enough to shift a culture over 90 days.',
    ],
  },
  'tp-2': {
    outcomes: [
      'Transform unproductive conflict into structured, constructive debate',
      'Apply the "challenge the idea, not the person" principle consistently',
      'Use the disagree-and-commit framework to maintain momentum after debate',
    ],
    coreLesson: [
      'Healthy teams argue about ideas. Dysfunctional teams argue about people.',
      'Conflict avoidance is more dangerous than conflict itself.',
      'Rules of engagement create a safe container for productive tension.',
      'The 2-minute debate format prevents tangents and keeps energy high.',
      'Facilitation moves — like naming the tension — keep conversations on track.',
      'Disagree and commit: once a decision is made, everyone rows in the same direction.',
    ],
  },
  'tp-3': {
    outcomes: [
      'Turn vague discussions into documented, actionable decisions',
      'Implement a decision log that creates transparency and accountability',
      'Use pre-mortems to surface risks before they derail execution',
    ],
    coreLesson: [
      'Most teams discuss endlessly without deciding. Decision hygiene fixes that.',
      'A decision statement has four parts: what, who owns it, by when, and how we will know.',
      'If it is not written down, it is not a decision — it is a conversation.',
      'Pre-mortems catch blind spots that post-mortems reveal too late.',
      'Every decision needs an owner and a due date. No exceptions.',
      'Weekly written decisions create a rhythm of clarity and forward motion.',
      'Reflection on where clarity breaks down reveals systemic gaps, not individual failures.',
    ],
  },
  'tp-4': {
    outcomes: [
      'Build a culture of peer-to-peer accountability without hierarchy',
      'Use factual, non-judgmental scripts for difficult accountability moments',
      'Create a visible team standards board that reinforces shared expectations',
    ],
    coreLesson: [
      'Accountability is not punishment. It is a commitment to shared standards.',
      'Name issues early. Small problems left unaddressed become big cultural debts.',
      'Keep accountability conversations factual: behavior, impact, request.',
      'Peers hold each other accountable better than managers — when they have the tools.',
      'A coaching stance balances support with challenge. Hold the bar and hold the person.',
      'Team standards boards make expectations visible and reduce ambiguity.',
      'Reflect on what you tolerate. Tolerance of low standards is contagious.',
    ],
  },
  'tp-5': {
    outcomes: [
      'Install a lightweight operating system for tracking team results',
      'Shift team focus from outputs to outcomes that matter',
      'Run weekly reviews that maintain alignment and momentum',
    ],
    coreLesson: [
      'Outcomes tell you if you are winning. Outputs tell you if you are busy.',
      'Three metrics is enough. More than that, and nobody watches any of them.',
      'A weekly review ritual keeps priorities honest and surfaces drift early.',
      'Trade-offs are not failures. They are decisions that deserve clarity.',
      'Meetings should produce decisions and actions, not status updates.',
      'A scoreboard check-in takes 15 minutes and saves hours of misalignment.',
      'Embed weeks turn one-time learning into sustained habits.',
    ],
  },
};
