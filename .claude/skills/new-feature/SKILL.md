# Skill: new-feature

## Auto-invoke

Invoquer automatiquement quand l'utilisateur demande de :
- Créer une nouvelle fonctionnalité complète (`"crée la feature …"`, `"ajoute la fonctionnalité …"`)
- Implémenter une section entière de l'app (ex: système de notifications, gestion du profil)
- Scaffolder plusieurs fichiers liés (route + composant + hook ensemble)

Scaffolde une feature complète dans le projet Zenko selon les conventions.

## Ce que tu reçois

L'utilisateur passe un nom de feature (ex: `/new-feature notifications`).

## Ce que tu dois créer

Pour une feature `<nom>` :

### 1. Route protégée

`src/routes/_protected/<nom>/index.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { <NomPascalCase> } from '@/components/<nom>/<NomPascalCase>'

export const Route = createFileRoute('/_protected/<nom>/')({
  component: <NomPascalCase>Page,
})

function <NomPascalCase>Page() {
  return <<NomPascalCase> />
}
```

### 2. Composant principal

`src/components/<nom>/<NomPascalCase>.tsx`

```tsx
import { use<NomPascalCase> } from '@/hooks/use<NomPascalCase>'
import { cn } from '@/lib/utils'

export function <NomPascalCase>() {
  const { data, isLoading, error } = use<NomPascalCase>()

  if (isLoading) return <div className="p-6 text-text-muted">Chargement…</div>
  if (error) return <div className="p-6 text-danger">Une erreur est survenue.</div>

  return (
    <div className="p-6">
      {/* contenu */}
    </div>
  )
}
```

### 3. Hook métier

`src/hooks/use<NomPascalCase>.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

export function use<NomPascalCase>() {
  return useQuery({
    queryKey: ['<nom>'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('<table>')
        .select('*')
      if (error) throw error
      return data
    },
  })
}
```

### 4. Types (si nouveaux types nécessaires)

Ajouter dans `src/types/index.ts` :

```ts
export interface <NomPascalCase> {
  id: string
  // colonnes métier
  created_at: string
}
```

## Conventions

- La route assemble, le composant affiche, le hook récupère les données
- Jamais d'appel Supabase direct dans un composant — passer par le hook
- Jamais de `useEffect` pour fetcher — utiliser `useQuery`
- Mutations via `useMutation` avec `invalidateQueries` dans `onSuccess`
- Imports avec `@/`
- Nommage : fichiers kebab-case, composants et hooks PascalCase/camelCase

Après création, lancer `npm run type-check`.
