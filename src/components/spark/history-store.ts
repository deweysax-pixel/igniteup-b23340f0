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

function extractSemanticLabel(text: string): string {
  // Comprehensive stop words for EN + FR including conjugated verbs and fillers
  const stopWords = new Set([
    // English
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'the', 'a', 'an', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'do', 'does', 'did', 'done', 'doing',
    'have', 'has', 'had', 'having', 'can', 'could', 'should', 'would', 'will', 'shall',
    'may', 'might', 'must', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'this', 'that', 'it', 'its', 'and', 'or', 'but', 'not', 'so', 'if', 'then', 'than',
    'just', 'also', 'very', 'really', 'much', 'more', 'most', 'some', 'any', 'all', 'each',
    'want', 'need', 'like', 'how', 'what', 'when', 'where', 'why', 'who', 'which',
    'get', 'got', 'make', 'made', 'take', 'know', 'think', 'see', 'come', 'go', 'going',
    'still', 'always', 'never', 'often', 'sometimes', 'try', 'trying',
    'feel', 'feeling', 'find', 'keep', 'seem', 'way', 'thing', 'things',
    'because', 'since', 'while', 'even', 'though', 'already', 'yet',
    'am', 'been', 'being', 'were', 'able', 'unable',
    'struggle', 'struggling', 'hard', 'difficult',
    // French
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on',
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux',
    'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'dont',
    'est', 'sont', 'suis', 'es', 'être', 'avoir', 'ai', 'as', 'avons', 'avez', 'ont',
    'fait', 'faire', 'fais', 'faisons', 'faites', 'font',
    'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'nos', 'leur', 'leurs',
    'ce', 'cette', 'ces', 'ne', 'pas', 'plus', 'en', 'sur', 'pour', 'par', 'avec', 'dans',
    'se', 'si', 'tout', 'tous', 'toute', 'toutes', 'bien', 'très', 'aussi', 'encore',
    'comment', 'quoi', 'quel', 'quelle', 'quels', 'quelles',
    'jai', 'cest', 'quand', 'comme',
    'peu', 'trop', 'assez', 'beaucoup', 'souvent', 'parfois', 'jamais', 'toujours',
    'vraiment', 'juste',
    'cas', 'chose', 'choses', 'façon', 'manière',
    'veux', 'voudrais', 'peux', 'pouvez', 'dois', 'devez', 'faut',
    'sens', 'sentiment', 'impression',
    'derrière', 'devant', 'entre', 'vers', 'chez', 'après', 'avant',
  ]);

  // Clean text: remove punctuation but keep letters/numbers/spaces
  const cleaned = text.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

  const words = cleaned
    .split(' ')
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));

  if (words.length === 0) return '';

  // Take the first 3-4 meaningful words, capitalise the first
  const selected = words.slice(0, Math.min(words.length, words.length <= 4 ? words.length : 3));
  const label = selected.map(w => w.toLowerCase()).join(' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
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
      const summary = extractSemanticLabel(cleaned);
      if (summary.length > 2) return summary;
    }
  }

  // Fallback: extract keywords from first user message
  const firstUser = userMessages[0]?.content || '';
  const fallback = extractSemanticLabel(firstUser);
  if (fallback.length > 2) return fallback;
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
