import { SEOHead } from '@/components/seo/SEOHead';
import { CapsuleFiche } from '@/components/ui';
import {
  useFiche,
  useIsSaved,
  useMarkFicheCompleted,
  useReadingProgress,
  useSaveResource,
  useStartReading,
} from '@/hooks/useBibliotheque';
import { CATEGORY_COVER_BG } from '@/lib/bibliotheque/bibliotheque';
import {
  generateBreadcrumbJsonLd,
  generateLearningResourceJsonLd,
  useJsonLd,
} from '@/lib/seo/jsonld';
import { useAuth } from '@/lib/supabase/use-auth';
import { cn } from '@/lib/utils';
import { Bookmark, Clock } from '@phosphor-icons/react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const Route = createFileRoute('/_app/bibliotheque/$slug')({
  component: FicheDetailPage,
});

function SaveButton({
  isSaved,
  isSaving,
  onToggle,
  className,
}: {
  isSaved: boolean;
  isSaving: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={isSaving}
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors',
        isSaved
          ? 'border border-brand bg-brand/10 text-brand hover:bg-brand/15'
          : 'bg-brand text-white hover:bg-brand/90',
        className
      )}
    >
      {isSaved ? <Bookmark weight="fill" size={15} /> : <Bookmark size={15} />}
      {isSaved ? 'Fiche enregistrée' : 'Enregistrer cette fiche'}
    </button>
  );
}

function FicheDetailPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();

  const { data: fiche, isLoading, error } = useFiche(slug);
  const { data: progress, isLoading: progressLoading } = useReadingProgress(slug, !!user);
  const { data: isSaved = false } = useIsSaved(slug, !!user);

  const { mutate: startReading } = useStartReading();
  const { mutate: markCompleted } = useMarkFicheCompleted();
  const { mutate: saveResource, isPending: isSaving } = useSaveResource();

  const isCompleted = !!progress?.completedAt;
  const bottomRef = useRef<HTMLDivElement>(null);

  useJsonLd(fiche ? generateLearningResourceJsonLd(fiche) : null, 'fiche-jsonld');
  useJsonLd(
    fiche
      ? generateBreadcrumbJsonLd([
          { name: 'Bibliothèque', path: '/bibliotheque' },
          { name: fiche.title, path: `/bibliotheque/${slug}` },
        ])
      : null,
    'fiche-breadcrumb-jsonld'
  );

  useEffect(() => {
    if (!user) return;
    startReading(slug);
  }, [slug, user, startReading]);

  useEffect(() => {
    if (!user || !fiche || progressLoading || isCompleted || !bottomRef.current) return;

    const el = bottomRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markCompleted(slug);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [user, fiche, progressLoading, isCompleted, slug, markCompleted]);

  return (
    <>
      <SEOHead
        title={fiche?.title ?? 'Fiche pratique'}
        description={fiche?.description}
        path={`/bibliotheque/${slug}`}
        noIndex={!fiche}
      />

      {/* Flower background */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-15" aria-hidden>
        <svg
          aria-hidden="true"
          className="h-full w-full"
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_fiche)">
            <path
              d="M-137.012 287.799C-276.494 301.743 -256.346 506.257 -234.649 617.81C-287.342 571.329 -413.186 509.046 -495.015 631.754C-576.844 754.463 -420.625 840.916 -332.287 868.805C-374.131 919.933 -444.802 1038.92 -392.729 1105.85C-340.655 1172.79 -209.852 1133.74 -150.96 1105.85C-137.012 1149.24 -79.3593 1236 39.6652 1236C158.69 1236 163.649 1068.67 151.251 985.006C202.394 1028.39 319.559 1085.4 379.071 966.413C438.583 847.424 317.079 730.913 248.888 687.531C303.131 633.304 394.879 509.976 327.928 450.481C260.977 390.986 98.5576 509.356 25.717 575.978C25.717 506.257 24.9757 271.604 -137.012 287.799Z"
              fill="#FCB040"
            />
            <path
              d="M1728.99 489.799C1589.51 503.743 1609.65 708.257 1631.35 819.81C1578.66 773.329 1452.81 711.046 1370.98 833.754C1289.16 956.463 1445.38 1042.92 1533.71 1070.8C1491.87 1121.93 1421.2 1240.92 1473.27 1307.85C1525.34 1374.79 1656.15 1335.74 1715.04 1307.85C1728.99 1351.24 1786.64 1438 1905.67 1438C2024.69 1438 2029.65 1270.67 2017.25 1187.01C2068.39 1230.39 2185.56 1287.4 2245.07 1168.41C2304.58 1049.42 2183.08 932.913 2114.89 889.531C2169.13 835.304 2260.88 711.976 2193.93 652.481C2126.98 592.986 1964.56 711.356 1891.72 777.978C1891.72 708.257 1890.98 473.604 1728.99 489.799Z"
              fill="#EE91A9"
            />
            <path
              d="M815.988 605.799C676.506 619.743 696.654 824.257 718.351 935.81C665.658 889.33 539.814 827.046 457.985 949.754C376.156 1072.46 532.375 1158.92 620.713 1186.8C578.869 1237.93 508.198 1356.92 560.271 1423.85C612.345 1490.79 743.148 1451.74 802.04 1423.85C815.988 1467.24 873.641 1554 992.665 1554C1111.69 1554 1116.65 1386.67 1104.25 1303.01C1155.39 1346.39 1272.56 1403.4 1332.07 1284.41C1391.58 1165.42 1270.08 1048.91 1201.89 1005.53C1256.13 951.304 1347.88 827.976 1280.93 768.481C1213.98 708.986 1051.56 827.356 978.717 893.978C978.717 824.257 977.976 589.604 815.988 605.799Z"
              fill="#FCB040"
            />
            <path
              d="M1387.99 -473.201C1248.51 -459.257 1268.65 -254.743 1290.35 -143.19C1237.66 -189.67 1111.81 -251.954 1029.98 -129.246C948.156 -6.53729 1104.38 79.9163 1192.71 107.805C1150.87 158.933 1080.2 277.923 1132.27 344.855C1184.34 411.787 1315.15 372.743 1374.04 344.855C1387.99 388.237 1445.64 475 1564.67 475C1683.69 475 1688.65 307.67 1676.25 224.006C1727.39 267.387 1844.56 324.403 1904.07 205.413C1963.58 86.4235 1842.08 -30.0874 1773.89 -73.4691C1828.13 -127.696 1919.88 -251.024 1852.93 -310.519C1785.98 -370.014 1623.56 -251.644 1550.72 -185.022C1550.72 -254.743 1549.98 -489.396 1387.99 -473.201Z"
              fill="#4FB4E5"
            />
            <path
              d="M1925.65 -216.849C1905.49 -224.411 1881.55 -180.094 1872.1 -156.99C1864.76 -175.893 1853.21 -220 1834.31 -220C1809.11 -220 1799.66 -177.993 1790.22 -153.839C1773.42 -168.542 1739.82 -204.247 1717.78 -197.946C1690.35 -190.109 1702.03 -139.137 1705.18 -109.732C1689.43 -123.385 1652.9 -149.429 1632.74 -144.388C1612.58 -139.347 1628.54 -85.5785 1639.04 -59.3243C1619.09 -62.4748 1577.31 -63.1049 1569.75 -40.4213C1562.19 -17.7377 1589.69 11.037 1604.39 22.5888C1587.6 29.94 1554 50.3133 1554 72.9969C1554 95.6805 1591.79 118.154 1610.69 126.555C1597.04 137.057 1565.76 155.134 1572.9 180.114C1579.12 201.898 1621.19 198.066 1644.48 195.944L1645.34 195.867C1635.89 216.87 1610.69 255.726 1629.59 271.479C1645.34 284.606 1684.18 258.877 1705.18 246.275C1702.03 265.178 1699.51 306.134 1714.63 318.736C1729.75 331.338 1762.92 294.582 1777.62 274.629C1783.92 294.582 1790.22 337.639 1812.26 340.79C1837.46 344.39 1851.11 300.883 1862.66 277.78C1879.45 296.683 1902.44 337.784 1928.8 334.489C1953.99 331.338 1957.14 286.181 1963.44 262.027C1980.24 277.78 2010.68 310.86 2032.73 299.833C2051.63 290.382 2043.23 244.174 2039.03 221.071C2060.03 227.372 2104.54 234.933 2114.62 214.77C2124.7 194.606 2095.72 158.06 2079.98 142.308C2098.87 141.258 2142.68 143.325 2149.27 120.254C2155.56 98.2009 2119.87 74.0471 2098.87 60.3949C2111.47 53.0437 2137.3 33.3005 2139.82 13.1373C2142.34 -7.02591 2096.77 -18.3678 2073.68 -21.5182C2083.12 -38.3209 2111.47 -75.0768 2102.02 -93.9798C2091 -116.033 2049.53 -109.732 2023.28 -106.582C2026.43 -127.585 2039.03 -172.742 2016.98 -182.194C1994.94 -191.645 1965.54 -161.191 1947.69 -144.388C1948.74 -165.391 1945.8 -209.288 1925.65 -216.849Z"
              fill="#F05A29"
            />
            <path
              d="M541.647 -216.849C521.49 -224.411 497.554 -180.094 488.105 -156.99C480.756 -175.893 469.207 -220 450.31 -220C425.114 -220 415.665 -177.993 406.216 -153.839C389.419 -168.542 355.824 -204.247 333.777 -197.946C306.354 -190.109 318.029 -139.137 321.178 -109.732C305.431 -123.385 268.896 -149.429 248.739 -144.388C228.582 -139.347 244.539 -85.5785 255.038 -59.3243C235.091 -62.4748 193.307 -63.1049 185.748 -40.4213C178.189 -17.7377 205.695 11.037 220.393 22.5888C203.595 29.94 170 50.3133 170 72.9969C170 95.6805 207.795 118.154 226.692 126.555C213.044 137.057 181.762 155.134 188.897 180.114C195.119 201.898 237.194 198.066 260.482 195.944L261.337 195.867C251.888 216.87 226.692 255.726 245.589 271.479C261.337 284.606 300.182 258.877 321.179 246.275C318.029 265.178 315.51 306.134 330.627 318.736C345.745 331.338 378.921 294.582 393.618 274.629C399.918 294.582 406.216 337.639 428.263 340.79C453.46 344.39 467.108 300.883 478.656 277.78C495.454 296.683 518.439 337.784 544.797 334.489C569.993 331.338 573.143 286.181 579.442 262.027C596.24 277.78 626.685 310.86 648.732 299.833C667.629 290.382 659.231 244.174 655.031 221.071C676.028 227.372 720.542 234.933 730.62 214.77C740.699 194.606 711.723 158.06 695.975 142.308C714.873 141.258 758.676 143.325 765.265 120.254C771.564 98.2009 735.87 74.0471 714.873 60.3949C727.471 53.0437 753.297 33.3005 755.817 13.1373C758.336 -7.02591 712.773 -18.3678 689.676 -21.5182C699.125 -38.3209 727.471 -75.0768 718.022 -93.9798C706.999 -116.033 665.53 -109.732 639.283 -106.582C642.433 -127.585 655.031 -172.742 632.984 -182.194C610.938 -191.645 581.542 -161.191 563.694 -144.388C564.744 -165.391 561.804 -209.288 541.647 -216.849Z"
              fill="#52C46A"
            />
          </g>
          <defs>
            <clipPath id="clip0_fiche">
              <rect width="1920" height="1080" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col gap-16 px-8 py-8 pb-20">
        {isLoading && <FicheDetailSkeleton />}

        {error && (
          <p className="text-body-sm text-text-muted">
            Une erreur est survenue lors du chargement de la fiche.
          </p>
        )}

        {fiche && (
          <>
            {/* Header: back + category + title + description + save */}
            <div className="flex flex-col gap-4">
              <Link
                to="/bibliotheque"
                className="flex w-fit items-center gap-2 text-[15px] font-semibold text-text-secondary transition-opacity hover:opacity-70"
              >
                <span className="rotate-180 font-bold">→</span>
                Retour
              </Link>

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start gap-3">
                  <CapsuleFiche category={fiche.category} size="lg" className="self-center" />
                  <h1 className="text-display-md font-bold leading-13 tracking-[-0.44px] text-text-primary">
                    {fiche.title}
                  </h1>
                </div>

                <p className="max-w-4xl text-body-lg font-normal leading-7 text-text-secondary">
                  {fiche.description}
                </p>
              </div>

              {user ? (
                <SaveButton
                  isSaved={isSaved}
                  isSaving={isSaving}
                  onToggle={() => saveResource({ slug, save: !isSaved })}
                  className="self-start"
                />
              ) : (
                <Link
                  to="/login"
                  className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-text-active transition-colors hover:bg-neutral-100"
                >
                  <Bookmark size={15} />
                  Se connecter pour enregistrer
                </Link>
              )}
            </div>

            {/* Cover image */}
            {fiche.coverImageUrl ? (
              <div className="h-75 w-full overflow-hidden rounded-4xl lg:h-107">
                <img src={fiche.coverImageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className={cn('h-45 w-full rounded-4xl lg:h-70', CATEGORY_COVER_BG[fiche.category])}
              />
            )}

            {/* Body: author sidebar + content */}
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
              {/* Author sidebar */}
              <div className="flex shrink-0 flex-row items-center gap-4 lg:sticky lg:top-8 lg:w-44 lg:flex-col lg:items-start">
                {fiche.authorAvatarUrl ? (
                  <img
                    src={fiche.authorAvatarUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                    <span className="text-h3 font-bold text-text-muted">
                      {fiche.author[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  <span className="text-[17px] font-medium text-text-secondary">
                    {fiche.author}
                  </span>
                  {fiche.authorUserId && (
                    <Link
                      to="/profile/$userId"
                      params={{ userId: fiche.authorUserId }}
                      className="text-[13px] font-medium text-brand hover:underline"
                    >
                      Voir le profil
                    </Link>
                  )}
                  {fiche.readingTimeMinutes && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="shrink-0 text-text-muted" />
                      <span className="text-label font-medium text-text-muted">
                        {fiche.readingTimeMinutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Article content */}
              <div className="flex min-w-0 flex-1 flex-col gap-8">
                {fiche.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node: _, ...props }) => (
                        <h1
                          className="mb-4 mt-8 text-[24px] font-bold leading-tight text-text-primary"
                          {...props}
                        />
                      ),
                      h2: ({ node: _, ...props }) => (
                        <h2
                          className="mb-3 mt-6 text-[20px] font-bold leading-snug text-text-primary"
                          {...props}
                        />
                      ),
                      h3: ({ node: _, ...props }) => (
                        <h3
                          className="mb-2 mt-4 text-[17px] font-semibold text-text-primary"
                          {...props}
                        />
                      ),
                      p: ({ node: _, ...props }) => (
                        <p
                          className="mb-4 text-justify text-[17px] font-normal leading-6 text-text-primary last:mb-0"
                          {...props}
                        />
                      ),
                      ul: ({ node: _, ...props }) => (
                        <ul
                          className="mb-4 list-disc pl-6 text-[17px] leading-6 text-text-primary"
                          {...props}
                        />
                      ),
                      ol: ({ node: _, ...props }) => (
                        <ol
                          className="mb-4 list-decimal pl-6 text-[17px] leading-6 text-text-primary"
                          {...props}
                        />
                      ),
                      li: ({ node: _, ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ node: _, ...props }) => (
                        <strong className="font-semibold text-text-primary" {...props} />
                      ),
                      em: ({ node: _, ...props }) => <em className="italic" {...props} />,
                      blockquote: ({ node: _, ...props }) => (
                        <blockquote
                          className="mb-4 border-l-4 border-border pl-4 italic text-text-secondary"
                          {...props}
                        />
                      ),
                      code: ({ node: _, ...props }) => (
                        <code
                          className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[15px] text-text-secondary"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {fiche.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-body-sm italic text-text-muted">
                    Le contenu de cette fiche n'est pas encore disponible.
                  </p>
                )}

                {/* Bottom save CTA */}
                {user ? (
                  <div className="flex justify-end">
                    <SaveButton
                      isSaved={isSaved}
                      isSaving={isSaving}
                      onToggle={() => saveResource({ slug, save: !isSaved })}
                    />
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Link
                      to="/login"
                      className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[13px] font-medium text-text-active transition-colors hover:bg-neutral-100"
                    >
                      <Bookmark size={15} />
                      Se connecter pour enregistrer
                    </Link>
                  </div>
                )}

                {/* Sentinel - IntersectionObserver fires when this is visible */}
                <div ref={bottomRef} className="h-px" />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function FicheDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-20 rounded bg-neutral-100" />
        <div className="h-12 w-3/4 rounded bg-neutral-100" />
        <div className="h-6 w-full max-w-2xl rounded bg-neutral-100" />
        <div className="h-10 w-40 rounded-full bg-neutral-100" />
      </div>
      <div className="h-70 w-full rounded-4xl bg-neutral-100" />
      <div className="flex gap-12">
        <div className="flex w-44 flex-col gap-2">
          <div className="size-16 rounded-full bg-neutral-100" />
          <div className="h-4 w-24 rounded bg-neutral-100" />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-neutral-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
