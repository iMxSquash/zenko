# Skill: react-vite-best-practices

## Auto-invoke

Invoquer automatiquement dès qu'un fichier dans `src/` est créé ou modifié :

- `src/routes/**` - toute route TanStack Router
- `src/components/**` - tout composant React
- `src/hooks/**` - tout hook métier
- `src/store/**` - tout store Zustand
- `src/lib/**` - tout helper ou service

**Auto-invoke sur tout fichier dans `src/`** - routes, composants, hooks, store, lib.

Conventions React 19 + Vite + TanStack Router + TanStack Query + Zustand pour le projet Zenko.

---

## Règles fondamentales

### SPA - pas de "use client", pas de Server Components

Zenko est une SPA Vite. Tous les composants sont des Client Components par défaut.

- Ne jamais écrire `"use client"` (inutile)
- Ne jamais écrire `"use server"` (n'existe pas dans Vite)
- Pas de `async` sur les composants de page - les données viennent des hooks

### Imports

Toujours avec l'alias `@/` :

```ts
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui";
```

---

## TanStack Router

### Créer une route

```tsx
// src/routes/_protected/ma-page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { MaPage } from "@/components/ma-feature/MaPage";

export const Route = createFileRoute("/_protected/ma-page")({
  component: MaPage,
});
```

### Route avec loader (pre-fetch)

```tsx
export const Route = createFileRoute("/_protected/bibliotheque/$slug")({
  loader: ({ params }) => fetchFiche(params.slug),
  component: FicheDetailPage,
});

function FicheDetailPage() {
  const fiche = Route.useLoaderData();
  return <FicheDetail fiche={fiche} />;
}
```

### Paramètres typés

```tsx
function MonComposant() {
  const { threadId } = Route.useParams(); // string - typé automatiquement
  const navigate = useNavigate();
  return <button onClick={() => navigate({ to: "/forum" })}>Retour</button>;
}
```

### Redirection auth dans \_protected.tsx

```tsx
export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
  },
  component: () => <Outlet />,
});
```

---

## TanStack Query

### Toujours useQuery pour les données Supabase

```ts
// src/hooks/useForum.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function useThreads() {
  return useQuery({
    queryKey: ["forum", "threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from("forum_threads")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum", "threads"] });
    },
  });
}
```

### Jamais de useEffect pour fetcher

```tsx
// ❌ Ne pas faire
useEffect(() => {
  supabase
    .from("forum_threads")
    .select("*")
    .then(({ data }) => setThreads(data));
}, []);

// ✅ Faire
const { data: threads, isLoading, error } = useThreads();
```

---

## Zustand

Zustand uniquement pour l'état client pur (pas de source serveur) :

```ts
// Lire
const { sidebarOpen, toggleSidebar } = useUIStore();

// Pas de Zustand pour les données Supabase → TanStack Query
// Pas de Zustand pour l'état local d'un composant → useState
```

---

## Composants

### Structure standard

```tsx
// src/components/forum/ThreadCard.tsx
import { cn } from "@/lib/utils";
import type { Thread } from "@/types";

interface ThreadCardProps {
  thread: Thread;
  className?: string;
}

export function ThreadCard({ thread, className }: ThreadCardProps) {
  return (
    <article className={cn("rounded-card bg-surface p-4", className)}>
      <h2 className="text-h3 font-semibold text-text-primary">
        {thread.title}
      </h2>
    </article>
  );
}
```

### États de chargement

```tsx
function ForumPage() {
  const { data: threads, isLoading, error } = useThreads();

  if (isLoading) return <div>Chargement…</div>;
  if (error) return <div>Une erreur est survenue.</div>;

  return <ThreadList threads={threads} />;
}
```

---

## Design tokens (Tailwind v4)

Tokens disponibles depuis `src/app.css` :

```
Couleurs    : text-brand, bg-background, bg-surface, text-text-primary,
              text-text-secondary, text-text-muted, border-border
Radius      : rounded-card (20px), rounded-card-lg (24px), rounded-nav (12px)
Texte       : text-display-xl, text-h2, text-h3, text-body-lg, text-body-sm, text-label
```

---

## Après chaque modification

```bash
npm run type-check
npm run lint
npm run format
npm run test
```
