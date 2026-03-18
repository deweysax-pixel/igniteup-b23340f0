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

function extractMeaningfulWords(text: string, maxWords = 4): string {
  const stopWords = new Set([
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'the', 'a', 'an', 'is', 'are', 'was', 'were',
    'be', 'been', 'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'should', 'would',
    'will', 'shall', 'may', 'might', 'must', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
    'from', 'about', 'into', 'this', 'that', 'it', 'its', 'and', 'or', 'but', 'not', 'so', 'if',
    'then', 'than', 'just', 'also', 'very', 'really', 'much', 'more', 'most', 'some', 'any',
    'want', 'need', 'like', 'how', 'what', 'when', 'where', 'why', 'who', 'which',
    // French stop words
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'le', 'la', 'les', 'un', 'une',
    'des', 'du', 'de', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'est', 'sont',
    'suis', 'es', 'être', 'avoir', 'ai', 'as', 'a', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
    'son', 'sa', 'ses', 'ce', 'cette', 'ces', 'ne', 'pas', 'plus', 'en', 'sur', 'pour', 'par',
    'avec', 'dans', 'au', 'aux', 'se', 'si', 'on', 'tout', 'bien', 'fait', 'faire',
    'comment', 'quoi', 'quel', 'quelle',
  ]);

  const words = text
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, maxWords);

  if (words.length === 0) return '';
  const result = words.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function extractTopicSummary(messages: Msg[]): string {
  // Collect all user messages, prefer later ones (more specific)
  const userMessages = messages.filter(m => m.role === 'user');
  
  for (let i = userMessages.length - 1; i >= 0; i--) {
    const raw = userMessages[i].content || '';
    
    // Strip known quick-action prompt prefixes
    const cleaned = raw
      .replace(/^generate a concrete suggestion for how i can execute my leadership action this week\.?/i, '')
      .replace(/^i have a question about my leadership action this week\.?/i, '')
      .replace(/^help me reflect on how my leadership action went this week\.?/i, '')
      .replace(/^génère une suggestion concrète.*?cette semaine\.?/i, '')
      .replace(/^j'ai une question sur.*?cette semaine\.?/i, '')
      .replace(/^aide-moi à réfléchir.*?cette semaine\.?/i, '')
      .trim();

    if (cleaned.length > 3) {
      const summary = extractMeaningfulWords(cleaned);
      if (summary.length > 2) return summary;
    }
  }

  // Fallback: raw first user words (never use AI response)
  const firstUser = userMessages[0]?.content || '';
  const fallback = firstUser.replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(w => w.length > 2).slice(0, 3).join(' ');
  if (fallback.length > 2) return fallback.charAt(0).toUpperCase() + fallback.slice(1);
  return 'Spark chat';
}

export function saveConversation(messages: Msg[], actionTitle?: string): void {
  if (messages.length < 2) return;
  const history = loadHistory();
  const lastEntry = history[0];
  if (lastEntry && lastEntry.messages.length === messages.length &&
      lastEntry.messages[0]?.content === messages[0]?.content) return;
  const entry: SavedConversation = {
    id: crypto.randomUUID(),
    type: detectType(messages),
    preview: extractTopicSummary(messages),
    actionTitle: actionTitle || undefined,
    messages,
    timestamp: Date.now(),
  };
  persist([entry, ...history]);
}

export function deleteConversation(id: string): void {
  const history = loadHistory().filter(c => c.id !== id);
  persist(history);
}
