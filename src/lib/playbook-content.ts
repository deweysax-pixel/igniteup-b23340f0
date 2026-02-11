// Shared playbook copy constants used across multiple pages

export const SBI_TEMPLATE = `Situation: …\nBehavior: …\nImpact: …\nNext step: …`;

export const ASK_FOR_FEEDBACK_MSG = `Quick request: could you share one thing I should keep doing and one thing I could improve this week? 2 minutes is enough.`;

export const POSITIVE_FEEDBACK_EXAMPLE = `Situation: In yesterday's client call…\nBehavior: you summarized the decision and next steps clearly.\nImpact: it aligned everyone and saved time.\nNext step: keep doing that at the end of calls.`;

export const COURSE_CORRECT_EXAMPLE = `Situation: In today's stand-up…\nBehavior: you interrupted twice before others finished.\nImpact: it reduced clarity and slowed decisions.\nNext step: let others finish, then summarize your point.`;

export function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}
