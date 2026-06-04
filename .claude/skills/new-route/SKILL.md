# Skill: new-route

## Auto-invoke

Invoquer automatiquement quand l'utilisateur demande de :
- Créer une nouvelle page (`"crée une page …"`, `"ajoute une route …"`)
- Ajouter un écran ou une vue dans l'app
- Scaffolder une URL dans TanStack Router

Crée une nouvelle route TanStack Router dans le projet Zenko.

## Ce que tu reçois

L'utilisateur précise le nom et le type (ex: `/new-route pricing publique` ou `/new-route parametres protégée`).

Si le type n'est pas précisé, demande : publique ou protégée ?

## Règle de placement

| Type | Dossier | Exemple d'URL |
|---|---|---|
| Publique (sans auth) | `src/routes/` | `/`, `/login`, `/pricing` |
| Protégée (auth requise) | `src/routes/_protected/` | `/bibliotheque`, `/forum`, `/assistant` |

## Route publique

`src/routes/<nom>.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/<nom>')({
  component: <NomPascalCase>Page,
})

function <NomPascalCase>Page() {
  return (
    <main className="min-h-screen bg-background">
      {/* contenu */}
    </main>
  )
}
```

## Route protégée simple

`src/routes/_protected/<nom>.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/<nom>')({
  component: <NomPascalCase>Page,
})

function <NomPascalCase>Page() {
  return (
    <div className="p-6">
      <h1 className="text-h2 font-semibold text-text-primary"><Titre></h1>
    </div>
  )
}
```

## Route protégée avec paramètre dynamique

`src/routes/_protected/<feature>/$<paramId>.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/<feature>/$<paramId>')({
  component: <NomPascalCase>Page,
})

function <NomPascalCase>Page() {
  const { <paramId> } = Route.useParams()
  return <div>{<paramId>}</div>
}
```

## Route protégée avec feature imbriquée (dossier)

Si la feature a plusieurs sous-pages, créer un dossier :
```
src/routes/_protected/<feature>/
  index.tsx        # /<feature>
  $<paramId>.tsx   # /<feature>/:id
```

## Conventions

- Fichier en kebab-case
- Composant de page en PascalCase avec suffixe `Page`
- Le composant de page est une fonction nommée (pas arrow function exportée)
- La logique métier va dans `src/hooks/`, pas dans le composant de route
- Imports avec `@/`

Après création, lancer `npm run type-check`.
