export type ForumUserRole = 'parent' | 'prof' | 'expert';

export interface AssistantSource {
  source_type: 'fiche' | 'forum_thread' | 'forum_reply';
  source_id: string;
  title: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: AssistantSource[] | null;
  created_at: string;
}

export interface Fiche {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author: string;
  authorAvatarUrl?: string;
  content?: string;
  readingTimeMinutes?: number;
}

export interface ReadingProgress {
  resourceSlug: string;
  startedAt: string;
  completedAt: string | null;
}
export type ResourceCategory = 'TSA' | 'TDAH' | 'DYS' | 'TDI';

export interface ForumAuthor {
  name: string;
  role: ForumUserRole;
}

export interface ForumReply {
  id: string;
  author: ForumAuthor;
  content: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: ResourceCategory;
  author: ForumAuthor;
  replies: ForumReply[];
  isPinned: boolean;
  createdAt: string;
}
