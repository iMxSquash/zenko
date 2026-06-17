# Skill: generate-fiches

## Invocation

```bash
/generate-fiches <count> "<thème>" [category:<TSA|TDAH|DYS|TDI>] [user:<user_id>]
```

Exemples :
```bash
/generate-fiches 3 "gestion des émotions"
/generate-fiches 5 "sommeil et régulation" category:TDAH
/generate-fiches 2 "communication non verbale" user:53474062-1445-4ea9-a637-bb7a1c28313c
/generate-fiches 4 "autonomie scolaire" category:DYS user:53474062-1445-4ea9-a637-bb7a1c28313c
```

---

## Ce que tu reçois

| Paramètre | Obligatoire | Description |
|---|---|---|
| `count` | Oui | Nombre de fiches à générer (1 à 20) |
| `thème` | Oui | Sujet global (entre guillemets si plusieurs mots) |
| `category:` | Non | Restreindre à une catégorie. Sinon répartir sur TSA / TDAH / DYS / TDI |
| `user:` | Non | `author_user_id` à assigner. Si absent, laisser `null` |

---

## Étapes

### 1. Planifier les fiches

Pour chaque fiche, définir :

- **`slug`** : kebab-case unique et descriptif. Exemple : `sommeil-enfant-tsa`. Vérifier qu'il n'entre pas en conflit avec les slugs existants en les lisant via le MCP Supabase (`SELECT slug FROM public.fiches`).
- **`title`** : titre court (6-12 mots), clair, orienté parent/prof/expert.
- **`description`** : 1 phrase de 20-30 mots décrivant l'utilité concrète de la fiche.
- **`category`** : si fourni en argument, l'appliquer à toutes. Sinon, varier entre TSA, TDAH, DYS, TDI selon la pertinence du sous-thème.
- **`author`** : si `user:` fourni, récupérer `first_name || ' ' || last_name` depuis `public.profiles`. Sinon, utiliser un nom d'expert fictif cohérent avec la catégorie (ex: `Dr. Amélie Roussel` pour TSA, `Karim Belkacem` pour TDAH, `Sophie Lambert` pour DYS, `Nadia Ferreira` pour TDI).
- **`reading_time_minutes`** : estimer selon la longueur du contenu (5 à 10 min).

### 2. Trouver des images Unsplash

Pour chaque fiche, trouver **une image libre** (domaine `images.unsplash.com`, pas `plus.unsplash.com`).

**Méthode :**

1. Chercher avec `WebSearch` des photo IDs Unsplash sur le thème de la fiche :
   ```
   unsplash photos children neurodiversity <mot-clé> site:unsplash.com
   ```
2. Pour chaque ID candidat, vérifier que l'image est libre avec `WebFetch` sur `https://unsplash.com/photos/<id>`. Conserver seulement les URLs commençant par `images.unsplash.com` (les `plus.unsplash.com` sont payantes, les ignorer).
3. Construire l'URL finale : `https://images.unsplash.com/photo-<id>?w=800&auto=format&fit=crop&q=80`

Si aucune image satisfaisante n'est trouvée après 2-3 tentatives, utiliser `null` pour `cover_image_url` — ne pas bloquer l'insertion.

**Images de secours connues libres** (à utiliser si les recherches échouent) :

| Usage | URL |
|---|---|
| Enfant qui dessine / crée | `https://images.unsplash.com/photo-1769720205873-6a73e0698093?w=800&auto=format&fit=crop&q=80` |
| Enfant en méditation / calme | `https://images.unsplash.com/photo-1769095207794-02ffab1e2376?w=800&auto=format&fit=crop&q=80` |
| Enfant qui écrit / travaille | `https://images.unsplash.com/photo-1560785477-d43d2b34e0df?w=800&auto=format&fit=crop&q=80` |
| Enfant avec blocs / jeu | `https://images.unsplash.com/photo-1495900593237-22dc861b231d?w=800&auto=format&fit=crop&q=80` |
| Adolescent / autonomie | `https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?w=800&auto=format&fit=crop&q=80` |

### 3. Générer le contenu markdown de chaque fiche

Chaque fiche doit avoir un `content` **complet, structuré et utile** (400-700 mots). Ne jamais générer du contenu générique ou vague.

**Structure type :**

```markdown
## <Introduction : définition ou contexte du sujet>

<2-3 paragraphes qui posent le sujet, pourquoi c'est important, à quoi ça ressemble concrètement>

## <Section 1 : comprendre / repérer / diagnostiquer>

- Point concret 1
- Point concret 2
- Point concret 3

## <Section 2 : stratégies / outils / méthodes>

### <Sous-section si nécessaire>

<Contenu actionnable — ce que le parent / prof / expert peut faire>

## <Section 3 : conseils pratiques / ressources / mise en œuvre>

<Conseils pour aller plus loin, outils recommandés, liens avec les professionnels>
```

**Règles de contenu :**
- Toujours ancré dans la réalité quotidienne d'un parent, d'un enseignant ou d'un expert.
- Exemples concrets, pas de jargon clinique non expliqué.
- Cohérent avec le ton des fiches existantes (bienveillant, pratique, non culpabilisant).
- Pas de liste à puces unique pour tout — mélanger paragraphes, listes et sous-titres.

### 4. Insérer via le MCP Supabase

Utiliser `mcp__claude_ai_Supabase__execute_sql` avec `project_id: aqyvrumakemtyoouoodc`.

**SQL template :**

```sql
INSERT INTO public.fiches (slug, title, description, category, author, author_user_id, cover_image_url, content, reading_time_minutes)
VALUES
(
  '<slug-1>',
  '<Titre fiche 1>',
  '<Description fiche 1>',
  '<CATEGORIE>',
  '<Nom auteur>',
  <'<user_id>' | NULL>,
  '<url_image | null>',
  $c1$<contenu markdown fiche 1>$c1$,
  <minutes>
),
(
  '<slug-2>',
  ...
)
ON CONFLICT (slug) DO NOTHING;
```

**Points critiques :**
- Utiliser le **dollar-quoting PostgreSQL** (`$c1$...$c1$`, `$c2$...$c2$`, etc.) pour le champ `content` — ne jamais escape les apostrophes manuellement dans du markdown.
- Chaque tag de dollar-quoting doit être **unique par fiche** dans le même INSERT.
- `ON CONFLICT (slug) DO NOTHING` pour éviter les erreurs sur les slugs déjà existants.
- Si `user_id` non fourni : écrire `NULL` (sans guillemets) pour `author_user_id`.

### 5. Vérifier l'insertion

Après l'INSERT, lancer une requête de vérification :

```sql
SELECT slug, title, category, reading_time_minutes, cover_image_url IS NOT NULL AS has_cover
FROM public.fiches
WHERE slug IN ('<slug-1>', '<slug-2>', ...)
ORDER BY created_at DESC;
```

Si certaines fiches manquent (slug déjà existant ou erreur), en informer l'utilisateur et proposer des slugs alternatifs.

---

## Contraintes

- **Slugs uniques** : toujours vérifier avant d'insérer.
- **Catégories valides** : uniquement `TSA`, `TDAH`, `DYS`, `TDI`.
- **Images libres uniquement** : domaine `images.unsplash.com` — jamais `plus.unsplash.com`.
- **Contenu en français**, sans commentaire de code ni mention de l'outil utilisé.
- **Pas de console.log** dans le code généré (n'est pas pertinent ici, mais rappel de convention).
- **Pas de Co-Authored-By** dans les commits éventuels liés à ce skill.

---

## Format de réponse final

Après l'insertion réussie, afficher un tableau récapitulatif :

```
✓ 3 fiches insérées avec succès

| Slug | Titre | Catégorie | Durée | Image |
|------|-------|-----------|-------|-------|
| sommeil-enfant-tsa | Améliorer le sommeil chez l'enfant autiste | TSA | 7 min | ✓ |
| ...  | ...   | ...       | ...   | ...   |
```
