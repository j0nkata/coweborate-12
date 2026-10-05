type SectionLabelProps = {
  index: string;
  children: string;
  tone?: "light" | "dark";
};

export function SectionLabel({
  index,
  children,
  tone = "light",
}: SectionLabelProps) {
  return (
    <p className={`section-label section-label--${tone}`}>
      <span>{index}</span>
      <span aria-hidden="true">/</span>
      {children}
    </p>
  );
}
