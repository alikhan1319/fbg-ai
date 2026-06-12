export function getTestimonialInitial(name: string): string {
  const trimmed = name.trim();
  for (const ch of trimmed) {
    if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  }
  return trimmed.slice(0, 1).toUpperCase() || "A";
}

export function TestimonialAvatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-secondary to-brand-purple font-bold text-white ${sizes[size]} ${className}`}
      aria-hidden
    >
      {getTestimonialInitial(name)}
    </div>
  );
}
