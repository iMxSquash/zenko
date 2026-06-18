export type ForumUserRole = 'parent' | 'prof' | 'expert';

export interface RoleInfo {
  id: ForumUserRole;
  label: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export const ROLES: RoleInfo[] = [
  {
    id: 'parent',
    label: 'Parent',
    description: 'Vous accompagnez votre enfant au quotidien.',
    icon: '♥',
    iconBg: '#fceaf0',
    iconColor: '#d77890',
  },
  {
    id: 'prof',
    label: 'Enseignant·e',
    description: 'Vous adaptez votre pédagogie pour des élèves neurodivergents.',
    icon: '◉',
    iconBg: '#e2f2fb',
    iconColor: '#2f9dd4',
  },
  {
    id: 'expert',
    label: 'Expert·e',
    description: 'Orthophoniste, psychologue ou pédopsychiatre.',
    icon: '★',
    iconBg: '#e1f4e5',
    iconColor: '#288d40',
  },
];

export const ROLE_LABELS: Record<ForumUserRole, string> = {
  parent: 'Parent',
  prof: 'Enseignant·e',
  expert: 'Expert·e',
};

export interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: ForumUserRole | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  doctolibUrl: string | null;
}

export interface PublicProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: ForumUserRole | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  doctolibUrl: string | null;
}

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
  authorUserId?: string | null;
  authorAvatarUrl?: string;
  coverImageUrl?: string | null;
  content?: string;
  readingTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingProgress {
  resourceSlug: string;
  startedAt: string;
  completedAt: string | null;
}
export type ResourceCategory = 'TSA' | 'TDAH' | 'DYS' | 'TDI';

export interface ForumAuthor {
  userId: string;
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
