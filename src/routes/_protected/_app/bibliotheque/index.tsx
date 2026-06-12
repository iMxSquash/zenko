import { ResourceCard } from '@/components/bibliotheque/ResourceCard';
import { SearchInput } from '@/components/ui';
import { useFiches } from '@/hooks/useBibliotheque';
import { cn } from '@/lib/utils';
import type { ResourceCategory } from '@/types';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_protected/_app/bibliotheque/')({
  component: BibliothequePage,
});

const RESOURCE_CATEGORIES = ['TSA', 'TDAH', 'DYS', 'TDI'] satisfies ResourceCategory[];

const HERO_MODULES = [
  { title: 'Comprendre le TSA', duration: '12 min' },
  { title: 'Repérer les signaux', duration: '12 min' },
  { title: 'Adapter les consignes', duration: '12 min' },
  { title: 'Gérer les transitions', duration: '12 min' },
] as const;

const SAVED = [
  {
    icon: '✦',
    iconBg: '#e2f2fb',
    iconColor: '#2f9dd4',
    title: 'Fiche pictogrammes transitions',
    meta: 'Fiche pratique · sauvegardé hier',
  },
  {
    icon: '▶',
    iconBg: '#fce2d2',
    iconColor: '#ee6b2d',
    title: 'Webinaire : DYS au quotidien',
    meta: 'Vidéo · sauvegardé lundi',
  },
  {
    icon: '♥',
    iconBg: '#fceaf0',
    iconColor: '#d77890',
    title: 'Scripts dialogue parents',
    meta: 'Article · sauvegardé la semaine dernière',
  },
] as const;

function BibliothequePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'Toutes'>('Toutes');

  const { data: fiches = [], isLoading, error } = useFiches();

  const filteredFiches =
    activeCategory === 'Toutes' ? fiches : fiches.filter((f) => f.category === activeCategory);

  const searchedFiches = search.trim()
    ? filteredFiches.filter(
        (f) =>
          f.title.toLowerCase().includes(search.toLowerCase()) ||
          f.description.toLowerCase().includes(search.toLowerCase())
      )
    : filteredFiches;

  const countByCategory = (cat: ResourceCategory) =>
    fiches.filter((f) => f.category === cat).length;

  return (
    <div className="flex flex-col gap-8 px-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold tracking-[-0.01em] text-text-primary">Bibliothèque</h1>
        <p className="text-[15px] text-text-secondary">
          Fiches pratiques, scripts, vidéos. Tout ce qu'un enseignant peut ouvrir entre deux cours
          et appliquer le lendemain.
        </p>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder={`Rechercher dans ${fiches.length} ressources…`}
      />

      {/* Category filters */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setActiveCategory('Toutes')}
          className={cn(
            'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] transition-colors',
            activeCategory === 'Toutes'
              ? 'bg-dark text-white'
              : 'border border-border bg-surface font-medium text-text-active hover:bg-neutral-100'
          )}
        >
          <span className="font-semibold">Toutes</span>
          <span
            className={cn(
              'text-[12px] font-medium',
              activeCategory === 'Toutes' ? 'text-teacher-bg' : 'text-text-muted'
            )}
          >
            {fiches.length}
          </span>
        </button>

        {RESOURCE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] transition-colors',
              activeCategory === cat
                ? 'bg-dark text-white'
                : 'border border-border bg-surface font-medium text-text-active hover:bg-neutral-100'
            )}
          >
            <span className="font-semibold">{cat}</span>
            <span
              className={cn(
                'text-[12px] font-medium',
                activeCategory === cat ? 'text-teacher-bg' : 'text-text-muted'
              )}
            >
              {countByCategory(cat)}
            </span>
          </button>
        ))}
      </div>

      {/* Hero banner */}
      <div className="relative flex items-center gap-8 overflow-hidden rounded-card-lg bg-brand p-8">
        <div className="absolute left-8 top-8 size-[300px] rounded-full bg-brand-green opacity-30" />

        <div className="relative flex flex-1 flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.88px] text-white">
            Parcours à la une
          </p>
          <p className="text-[28px] font-bold tracking-[-0.01em] text-white">
            Accompagner un élève TSA en CM1
          </p>
          <p className="text-[14px] text-white opacity-90">
            8 modules · 2h au total. Conçu avec le Dr Lambert et 12 enseignants du terrain.
          </p>
          <button
            type="button"
            className="self-start rounded-full bg-white px-5 py-3 transition-opacity hover:opacity-90"
          >
            <span className="text-[14px] font-semibold text-teacher">Commencer le parcours →</span>
          </button>
        </div>

        <div className="relative flex w-[320px] shrink-0 flex-col gap-3 rounded-card bg-[rgba(255,255,255,0.15)] p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-white opacity-70">
            Modules
          </p>
          {HERO_MODULES.map((mod, i) => (
            <div key={mod.title} className="flex items-center gap-3">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white">
                <span className="text-[10px] font-bold text-teacher">{i + 1}</span>
              </div>
              <span className="min-w-0 flex-1 text-[13px] font-medium text-white">{mod.title}</span>
              <span className="shrink-0 text-[11px] text-white opacity-70">{mod.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fiches section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <p className="flex-1 text-[20px] font-bold text-text-primary">
            {activeCategory === 'Toutes' ? 'Toutes les fiches' : `Fiches ${activeCategory}`}
          </p>
          <span className="shrink-0 text-[13px] font-medium text-text-muted">
            {searchedFiches.length} résultat{searchedFiches.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading && (
          <div className="flex gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 animate-pulse overflow-hidden rounded-card border border-border bg-surface"
              >
                <div className="h-[140px] w-full bg-neutral-100" />
                <div className="flex flex-col gap-2.5 p-5">
                  <div className="h-4 w-12 rounded bg-neutral-100" />
                  <div className="h-5 w-full rounded bg-neutral-100" />
                  <div className="h-4 w-3/4 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-[14px] text-text-muted">
            Une erreur est survenue lors du chargement des fiches.
          </p>
        )}

        {!isLoading && !error && searchedFiches.length === 0 && (
          <p className="text-[14px] text-text-muted">Aucune fiche trouvée.</p>
        )}

        {!isLoading && !error && searchedFiches.length > 0 && (
          <div className="flex flex-wrap gap-5">
            {searchedFiches.map((fiche) => (
              <Link
                key={fiche.slug}
                to="/bibliotheque/$slug"
                params={{ slug: fiche.slug }}
                className="min-w-[220px] max-w-[calc(25%-15px)] flex-1 transition-transform hover:-translate-y-0.5"
              >
                <ResourceCard fiche={fiche} className="h-full" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Saved resources */}
      <div className="flex flex-col gap-5 pb-8">
        <div className="flex items-center gap-3">
          <p className="flex-1 text-[20px] font-bold text-text-primary">
            Mes ressources sauvegardées
          </p>
          <span className="shrink-0 text-[13px] font-medium text-text-muted">21 éléments</span>
        </div>

        <div className="flex gap-4">
          {SAVED.map((item) => (
            <div
              key={item.title}
              className="flex flex-1 items-center gap-4 overflow-hidden rounded-[16px] border border-border bg-surface p-4"
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-[12px]"
                style={{ backgroundColor: item.iconBg }}
              >
                <span className="text-[20px] font-bold" style={{ color: item.iconColor }}>
                  {item.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-text-primary">{item.title}</p>
                <p className="truncate text-[12px] text-text-muted">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
