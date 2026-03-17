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

function extractTopicSummary(messages: Msg[]): string {
  const userMsg = messages.find(m => m.role === 'user')?.content?.toLowerCase() || '';

  // Detect reflection prompts
  if (userMsg.includes('reflect') || userMsg.includes('how') && userMsg.includes('went')) {
    return 'Action reflection';
  }

  // Detect suggestion/script generation
  if (userMsg.includes('suggestion') || userMsg.includes('generate') || userMsg.includes('script')) {
    // Try to extract topic from the assistant response
    const assistantMsg = messages.find(m => m.role === 'assistant')?.content || '';
    const scriptMatch = assistantMsg.match(/[""]([^""]{5,40})[""]|> (.{5,40})/);
    if (scriptMatch) {
      const snippet = (scriptMatch[1] || scriptMatch[2] || '').trim();
      // Condense to 3-4 words
      const words = snippet.split(/\s+/).slice(0, 4).join(' ');
      if (words.length > 3) return words;
    }
    return 'Action script';
  }

  // For questions, extract topic from user message
  if (userMsg.includes('question') || userMsg.includes('how') || userMsg.includes('what') || userMsg.includes('why')) {
    // Strip generic prefixes and extract meaningful words
    const cleaned = userMsg
      .replace(/^(i have a question about|help me with|tell me about|how (do|can|should) i)\s*/i, '')
      .replace(/my leadership action this week\.?/i, '')
      .replace(/this week\.?/i, '')
      .trim();
    if (cleaned.length > 3) {
      const words = cleaned.split(/\s+/).slice(0, 4).join(' ');
      return words.charAt(0).toUpperCase() + words.slice(1);
    }
    return 'Leadership question';
  }

  // Fallback: extract key words from user message
  const words = userMsg.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 3).join(' ');
  if (words.length > 3) return words.charAt(0).toUpperCase() + words.slice(1);
  return 'Conversation';
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
