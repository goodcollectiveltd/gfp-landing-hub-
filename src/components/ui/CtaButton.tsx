// The single call-to-action button used across every section. Every CTA on an
// advertorial points at the same Shopify checkout destination. On the public
// page the href already has click-IDs (fbclid/utm) appended for attribution.

interface CtaButtonProps {
  label: string;
  href: string;
  /** "lg" for the big hero/offer CTAs, "md" for inline ones. */
  size?: "md" | "lg";
  className?: string;
}

export default function CtaButton({
  label,
  href,
  size = "lg",
  className = "",
}: CtaButtonProps) {
  const sizing =
    size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base";
  return (
    <a
      href={href}
      className={`lp-btn inline-block rounded-full font-semibold shadow-md ${sizing} ${className}`}
    >
      {label}
    </a>
  );
}
