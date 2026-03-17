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

function extractPreview(messages: Msg[]): string {
  const assistant = messages.find(m => m.role === 'assistant');
  if (assistant) {
    const clean = assistant.content.replace(/[*#>_~`🎯💡⚡1️⃣2️⃣3️⃣]/g, '').trim();
    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
    const meaningful = lines.find(l =>
      l.length > 20 &&
      !l.startsWith('Suggested script') &&
      !l.startsWith('Why this works') &&
      !l.startsWith('Quick version') &&
      !l.startsWith('How did it go') &&
      !l.startsWith('Nice reflection') &&
      !l.startsWith('What worked') &&
      !l.startsWith('Suggestion for next')
    );
    if (meaningful) return meaningful.slice(0, 100);
    return lines[0]?.slice(0, 80) || 'Conversation';
  }
  const user = messages.find(m => m.role === 'user');
  return user?.content?.slice(0, 80) || 'Conversation';
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
    preview: extractPreview(messages),
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
