interface RoleCardProps {
  label: string;
  name: string;
  bg: string;
  color: string;
}

export function RoleCard({ label, name, bg, color }: RoleCardProps) {
  return (
    <div
      className="flex h-[140px] flex-col justify-end gap-3 overflow-hidden rounded-card-lg p-6 lg:h-[154px]"
      style={{ background: bg }}
    >
      <div className="size-14 rounded-full bg-white" />
      <div className="flex flex-col gap-0.5" style={{ color }}>
        <span className="text-[11px] font-semibold tracking-capsule">{label}</span>
        <span className="text-body-lg font-bold">{name}</span>
      </div>
    </div>
  );
}
