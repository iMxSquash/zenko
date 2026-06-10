interface ProblemCardProps {
  title: string;
  text: string;
  bg: string;
}

export function ProblemCard({ title, text, bg }: ProblemCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-card p-8" style={{ background: bg }}>
      <p className="text-h3 font-semibold text-text-primary">{title}</p>
      <p className="text-body-sm leading-5 text-text-secondary">{text}</p>
    </div>
  );
}
