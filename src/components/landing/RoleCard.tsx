interface RoleCardProps {
  label: string;
  name: string;
  bg: string;
  color: string;
  /**
   * Avatar image URL.
   * NOTE: when sourced from Figma's asset CDN these URLs expire ~7 days after
   * they were generated and are NOT production-safe. Replace with locally
   * hosted images (e.g. /public/avatars/*.jpg) before deploying.
   */
  avatar?: string;
}

export function RoleCard({ label, name, bg, color, avatar }: RoleCardProps) {
  return (
    <div
      className="flex h-35 flex-col justify-end gap-3 overflow-hidden rounded-card-lg p-6 lg:h-38.5"
      style={{ background: bg }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          width={56}
          height={56}
          className="size-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="size-14 shrink-0 rounded-full bg-white" />
      )}
      <div className="flex flex-col gap-0.5" style={{ color }}>
        <span className="text-[11px] font-semibold tracking-capsule">{label}</span>
        <span className="text-body-lg font-bold">{name}</span>
      </div>
    </div>
  );
}
