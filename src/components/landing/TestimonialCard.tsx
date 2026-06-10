interface TestimonialCardProps {
  quote: string;
  bg: string;
  color: string;
}

export function TestimonialCard({ quote, bg, color }: TestimonialCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-card p-8" style={{ background: bg }}>
      <span
        className="text-display-xl font-bold leading-none tracking-display"
        style={{ color }}
        aria-hidden="true"
      >
        "
      </span>
      <p className="text-body-lg leading-7 text-text-primary">{quote}</p>
    </div>
  );
}
