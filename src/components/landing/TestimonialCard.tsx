interface TestimonialCardProps {
  quote: string;
  bg: string;
  color: string;
}

export function TestimonialCard({ quote, bg, color }: TestimonialCardProps) {
  return (
    <div
      className="flex h-72 w-full flex-col gap-1 overflow-hidden rounded-card p-8 sm:w-96"
      style={{ background: bg }}
    >
      <span
        className="text-display-xl font-bold leading-20 tracking-display"
        style={{ color }}
        aria-hidden="true"
      >
        {'\u201C'}
      </span>
      <p className="text-body-lg leading-7 text-text-primary">{quote}</p>
    </div>
  );
}
