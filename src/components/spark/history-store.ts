import type { SavedConversation, Msg, ConversationType } from './types';

const STORAGE_KEY = 'spark-history';

export function loadHistory(): SavedConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(history: SavedConversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20)));
}

function detectType(messages: Msg[]): ConversationType {
  const first = messages.find(m => m.role === 'user')?.content?.toLowerCase() || '';
  if (first.includes('suggestion') || first.includes('generate')) return 'suggestion';
  if (first.includes('reflect')) return 'reflection';
  if (first.includes('question')) return 'question';
  return 'unknown';
}

const SHORT_FILLERS = new Set([
  'oui', 'ok', 'yes', 'no', 'non', 'merci', 'thanks', 'yep', 'nope', 'sure', 'yeah', 'ouais', 'd\'accord', 'cool', 'bon', 'bien', 'top',
]);

function isMeaningful(text: string): boolean {
  const cleaned = text.trim().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  if (cleaned.length < 4) return false;
  if (SHORT_FILLERS.has(cleaned.toLowerCase())) return false;
  const words = cleaned.split(' ');
  return words.length >= 2;
}

function trimToWords(text: string, max: number): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  const words = cleaned.split(' ');
  const result = words.slice(0, max).join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function extractTopicSummary(messages: Msg[]): string {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => (m.content || '')
      .replace(/^generate a concrete suggestion for how i can execute my leadership action this week\.?/i, '')
      .replace(/^i have a question about my leadership action this week\.?/i, '')
      .replace(/^help me reflect on how my leadership action went this week\.?/i, '')
      .replace(/^génère une suggestion concrète.*?cette semaine\.?/i, '')
      .replace(/^j'ai une question sur.*?cette semaine\.?/i, '')
      .replace(/^aide-moi à réfléchir.*?cette semaine\.?/i, '')
      .trim()
    )
    .filter(t => t.length > 0);

  // Walk backwards to find last meaningful message
  for (let i = userMessages.length - 1; i >= 0; i--) {
    if (isMeaningful(userMessages[i])) {
      return trimToWords(userMessages[i], 6);
    }
  }

  // Fallback: use first message even if short
  if (userMessages.length > 0) {
    return trimToWords(userMessages[0], 6);
  }

  return 'Spark chat';
}

export function saveConversation(messages: Msg[], actionTitle?: string, existingId?: string): string {
  if (messages.length === 0) return existingId || '';
  const history = loadHistory();

  // Update existing conversation in-place
  if (existingId) {
    const idx = history.findIndex(c => c.id === existingId);
    if (idx !== -1) {
      history[idx] = {
        ...history[idx],
        messages,
        preview: extractTopicSummary(messages),
        type: detectType(messages),
        actionTitle: actionTitle || history[idx].actionTitle,
        timestamp: Date.now(),
      };
      persist(history);
      return existingId;
    }
  }

  // Create new entry
  const id = crypto.randomUUID();
  const entry: SavedConversation = {
    id,
    type: detectType(messages),
    preview: extractTopicSummary(messages),
    actionTitle: actionTitle || undefined,
    messages,
    timestamp: Date.now(),
  };
  persist([entry, ...history]);
  return id;
}

export function deleteConversation(id: string): void {
  const history = loadHistory().filter(c => c.id !== id);
  persist(history);
}
