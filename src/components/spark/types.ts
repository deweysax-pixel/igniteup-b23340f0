export type Msg = { role: 'user' | 'assistant'; content: string };

export type ConversationType = 'suggestion' | 'question' | 'reflection' | 'unknown';

export interface SavedConversation {
  id: string;
  type: ConversationType;
  preview: string;
  actionTitle?: string;
  messages: Msg[];
  timestamp: number;
}
