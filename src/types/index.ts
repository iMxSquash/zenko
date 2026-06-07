export type ForumUserRole = 'parent' | 'prof' | 'expert';

export interface Fiche {
  slug: string;
  title: string;
  description: string;
  category: ResourceCategory;
  author: string;
  authorAvatarUrl?: string;
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
