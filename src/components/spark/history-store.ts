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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); // keep max 20
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
    const clean = assistant.content.replace(/[*#>_~`]/g, '').trim();
    const first = clean.split(/[.\n]/)[0]?.trim();
    return first?.slice(0, 80) || 'Conversation';
  }
  const user = messages.find(m => m.role === 'user');
  return user?.content?.slice(0, 80) || 'Conversation';
}

export function saveConversation(messages: Msg[]): void {
  if (messages.length < 2) return;
  const history = loadHistory();
  const entry: SavedConversation = {
    id: crypto.randomUUID(),
    type: detectType(messages),
    preview: extractPreview(messages),
    messages,
    timestamp: Date.now(),
  };
  persist([entry, ...history]);
}

export function deleteConversation(id: string): void {
  const history = loadHistory().filter(c => c.id !== id);
  persist(history);
}
