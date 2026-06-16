import { Button } from '@/components/ui/Button/Button';
import { TextInput } from '@/components/ui/TextInput/TextInput';
import { useUploadFicheCover } from '@/hooks/useAdmin';
import type { FicheInput } from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';
import type { ResourceCategory } from '@/types';
import { Image, X } from '@phosphor-icons/react';
import { useId, useRef, useState } from 'react';

const CATEGORIES: ResourceCategory[] = ['TSA', 'TDAH', 'DYS', 'TDI'];

interface FicheFormProps {
  initial?: Partial<FicheInput>;
  isCreating?: boolean;
  isPending?: boolean;
  onSubmit: (input: FicheInput) => void;
  onCancel: () => void;
}

export function FicheForm({ initial, isCreating, isPending, onSubmit, onCancel }: FicheFormProps) {
  const descriptionId = useId();
  const contentId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCover = useUploadFicheCover();

  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<ResourceCategory>(initial?.category ?? 'TSA');
  const [author, setAuthor] = useState(initial?.author ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [readingTime, setReadingTime] = useState(
    initial?.readingTimeMinutes != null ? String(initial.readingTimeMinutes) : ''
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initial?.coverImageUrl ?? null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Le titre est requis.';
    if (isCreating && !slug.trim()) next.slug = 'Le slug est requis.';
    if (isCreating && slug && !/^[a-z0-9-]+$/.test(slug))
      next.slug = 'Slug invalide (minuscules, chiffres, tirets uniquement).';
    if (!description.trim()) next.description = 'La description est requise.';
    if (!author.trim()) next.author = "L'auteur est requis.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image trop lourde (max 5 Mo).');
      return;
    }
    setUploadError(null);
    uploadCover.mutate(file, {
      onSuccess: (url) => setCoverImageUrl(url),
      onError: () => setUploadError("Erreur lors de l'upload de l'image."),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      category,
      author: author.trim(),
      coverImageUrl: coverImageUrl ?? null,
      content: content.trim() || null,
      readingTimeMinutes: readingTime ? Number(readingTime) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {isCreating && (
        <TextInput
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="ex: tdah-concentration-strategies"
          error={errors.slug}
        />
      )}

      <TextInput
        label="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de la fiche"
        error={errors.title}
      />

      <fieldset className="flex flex-col gap-1.5 border-none p-0">
        <legend className="text-label font-semibold uppercase tracking-label text-text-secondary">
          Catégorie
        </legend>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-full px-4 py-2 text-body-sm font-semibold transition-colors',
                category === cat
                  ? 'bg-brand-100 text-white'
                  : 'bg-background text-text-secondary hover:bg-neutral-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </fieldset>

      <TextInput
        label="Auteur"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Nom de l'auteur"
        error={errors.author}
      />

      {/* Cover image */}
      <div className="flex flex-col gap-1.5">
        <span className="text-label font-semibold uppercase tracking-label text-text-secondary">
          Image de couverture
        </span>

        {coverImageUrl ? (
          <div className="relative w-full overflow-hidden rounded-card">
            <img src={coverImageUrl} alt="Couverture" className="h-40 w-full object-cover" />
            <button
              type="button"
              onClick={() => setCoverImageUrl(null)}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
              aria-label="Supprimer l'image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadCover.isPending}
            className="flex h-32 w-full items-center justify-center gap-3 rounded-card border-2 border-dashed border-border bg-background text-text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            <Image size={20} />
            <span className="text-body-sm font-medium">
              {uploadCover.isPending ? 'Upload en cours…' : 'Ajouter une image (max 5 Mo)'}
            </span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverFileChange}
        />

        {uploadError && <p className="text-body-sm text-danger">{uploadError}</p>}

        {coverImageUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadCover.isPending}
            className="self-start text-body-sm font-medium text-brand hover:underline disabled:opacity-50"
          >
            Changer l'image
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={descriptionId}
          className="text-label font-semibold uppercase tracking-label text-text-secondary"
        >
          Description courte
        </label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de la fiche (1-2 phrases)"
          rows={3}
          className={cn(
            'rounded-search border border-border-default bg-surface px-4 py-3 text-body-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand resize-none',
            errors.description && 'border-danger'
          )}
        />
        {errors.description && <p className="text-body-sm text-danger">{errors.description}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={contentId}
          className="text-label font-semibold uppercase tracking-label text-text-secondary"
        >
          Contenu (Markdown)
        </label>
        <textarea
          id={contentId}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Contenu complet de la fiche en Markdown…"
          rows={12}
          className="rounded-search border border-border-default bg-surface px-4 py-3 text-body-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand resize-y font-mono"
        />
      </div>

      <TextInput
        label="Temps de lecture (minutes)"
        type="number"
        min="1"
        value={readingTime}
        onChange={(e) => setReadingTime(e.target.value)}
        placeholder="ex: 5"
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || uploadCover.isPending}>
          {isPending ? 'Enregistrement…' : isCreating ? 'Créer la fiche' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
