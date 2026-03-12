export interface LeadershipMoment {
  id: string;
  title: string;
  whyItMatters: string;
  action: string;
  example: string;
  checkIn: string;
}

export interface Habit {
  id: string;
  name: string;
  moments: LeadershipMoment[];
}

export interface Theme {
  id: string;
  name: string;
  icon: string; // lucide icon name
  description: string;
  habits: Habit[];
}

export const leadershipThemes: Theme[] = [
  {
    id: 'direction',
    name: 'Direction',
    icon: 'Compass',
    description: 'Set clear priorities and decisions so teams know where to focus.',
    habits: [
      {
        id: 'priority-clarity',
        name: 'Priority clarity',
        moments: [
          {
            id: 'clarify-real-priority',
            title: 'Clarify the real priority',
            whyItMatters: 'When priorities are unclear, teams spread their effort across too many tasks.',
            action: 'Ask your team:\n"If we could only succeed at one thing this week, what should it be?"',
            example: '"Our priority this week is to finalize the client proposal."',
            checkIn: 'Did you clarify the top priority with your team this week?',
          },
        ],
      },
      {
        id: 'decision-clarity',
        name: 'Decision clarity',
        moments: [
          {
            id: 'name-decision-owner',
            title: 'Name the decision owner',
            whyItMatters: 'Many teams slow down because decision ownership is unclear.',
            action: 'In a meeting say:\n"Let\'s clarify who will make the final decision."',
            example: '"I will make the final call after hearing your input."',
            checkIn: 'Did you clarify a decision owner this week?',
          },
        ],
      },
    ],
  },
  {
    id: 'alignment',
    name: 'Alignment',
    icon: 'Users',
    description: 'Build shared understanding and accelerate learning through feedback.',
    habits: [
      {
        id: 'shared-understanding',
        name: 'Shared understanding',
        moments: [
          {
            id: 'check-real-understanding',
            title: 'Check real understanding',
            whyItMatters: 'Teams often believe they are aligned while interpreting goals differently.',
            action: 'Ask someone:\n"How do you understand the objective?"',
            example: '"What does success look like for you on this project?"',
            checkIn: 'Did you verify how someone understood the objective?',
          },
        ],
      },
      {
        id: 'constructive-feedback',
        name: 'Constructive feedback',
        moments: [
          {
            id: 'give-sbi-feedback',
            title: 'Give one SBI feedback',
            whyItMatters: 'Specific feedback accelerates learning and performance.',
            action: 'Give feedback using:\nSituation – Behavior – Impact.',
            example: '"In yesterday\'s meeting (Situation), you clarified the timeline (Behavior), which reassured the client (Impact)."',
            checkIn: 'Did you give one SBI feedback this week?',
          },
        ],
      },
    ],
  },
  {
    id: 'ownership',
    name: 'Ownership',
    icon: 'Shield',
    description: 'Clarify responsibility and grow autonomy across the team.',
    habits: [
      {
        id: 'responsibility-clarity',
        name: 'Responsibility clarity',
        moments: [
          {
            id: 'clarify-ownership',
            title: 'Clarify ownership',
            whyItMatters: 'When ownership is unclear, tasks stall.',
            action: 'Ask:\n"Who owns this task?"',
            example: '"Sarah will lead the preparation of the proposal."',
            checkIn: 'Did you clarify ownership of a task this week?',
          },
        ],
      },
      {
        id: 'empowered-problem-solving',
        name: 'Empowered problem solving',
        moments: [
          {
            id: 'ask-for-proposal',
            title: 'Ask for the proposal',
            whyItMatters: 'Ownership grows when people propose solutions.',
            action: 'Instead of solving the problem, ask:\n"What do you propose?"',
            example: '"How would you approach this situation?"',
            checkIn: 'Did you ask someone to propose a solution?',
          },
        ],
      },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    icon: 'Flame',
    description: 'Sustain motivation through recognition and visible progress.',
    habits: [
      {
        id: 'recognition',
        name: 'Recognition',
        moments: [
          {
            id: 'recognize-contribution',
            title: 'Recognize a contribution',
            whyItMatters: 'Recognition reinforces behaviors you want repeated.',
            action: 'Publicly recognize a contribution.',
            example: '"I want to thank Alex for how clearly he explained the project timeline."',
            checkIn: 'Did you recognize someone\'s contribution this week?',
          },
        ],
      },
      {
        id: 'celebrate-progress',
        name: 'Celebrate progress',
        moments: [
          {
            id: 'share-team-win',
            title: 'Share a team win',
            whyItMatters: 'Teams stay motivated when progress is visible.',
            action: 'Ask your team:\n"What win did we have this week?"',
            example: '"We successfully delivered the prototype ahead of schedule."',
            checkIn: 'Did you highlight a team win this week?',
          },
        ],
      },
    ],
  },
];
