interface SolutionCardProps {
  title: string;
  text: string;
}

export function SolutionCard({ title, text }: SolutionCardProps) {
  return (
    <div className="flex w-full flex-col gap-5 rounded-card border border-border bg-surface p-8 sm:w-[417px]">
      <p className="text-h3 font-semibold text-text-primary">{title}</p>
      <p className="text-body-sm leading-5 text-text-secondary">{text}</p>
    </div>
  );
}
