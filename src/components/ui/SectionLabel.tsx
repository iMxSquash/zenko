interface SectionLabelProps {
  children: string;
  color: string;
}

export function SectionLabel({ children, color }: SectionLabelProps) {
  return (
    <p className="text-center text-h3 font-semibold" style={{ color }}>
      {children}
    </p>
  );
}
