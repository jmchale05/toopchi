const LOGO_SRC = "/assets/toopchi-logo.png";

export function ToopchiLogo({
  className = "h-10 w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src={LOGO_SRC}
      alt="Toopchi"
      className={className}
      decoding="async"
    />
  );
}
