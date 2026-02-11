// Shared playbook copy constants used across multiple pages

export const SBI_TEMPLATE = `Situation: …\nBehavior: …\nImpact: …\nNext step: …`;

export const ASK_FOR_FEEDBACK_MSG = `Quick request: could you share one thing I should keep doing and one thing I could improve this week? 2 minutes is enough.`;

export const POSITIVE_FEEDBACK_EXAMPLE = `"I noticed you took the lead on the client call yesterday (Situation). You summarized our proposal clearly and answered every objection with data (Behavior). The client signed the same day — that directly moved the deal forward (Impact)."`;

export const COURSE_CORRECT_EXAMPLE = `"During this morning's standup (Situation), you went into deep technical detail for about 10 minutes (Behavior). It caused the rest of the team to lose focus and we ran over by 15 minutes (Impact). Next time, could you keep it to 2 minutes and follow up in a thread? (Next step)"`;

export function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}
