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
};
