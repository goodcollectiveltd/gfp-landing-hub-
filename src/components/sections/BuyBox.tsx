import type { BuyBoxConfig } from "@/types/page";

// Sticky buy bar pinned to the bottom of the viewport. This is the Shopify-native
// conversion element — the href deep-links into Shopify checkout (with click-IDs
// appended on the public page). Always visible so the CTA is one tap away.

export default function BuyBox({
  buyBox,
  embedded = false,
}: {
  buyBox: BuyBoxConfig;
  /** In an embedded preview, stick to the container bottom instead of the viewport. */
  embedded?: boolean;
}) {
  return (
    <div
      className={`${
        embedded ? "sticky" : "fixed"
      } inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="lp-heading truncate text-sm font-semibold sm:text-base">
            {buyBox.productName}
          </p>
          <p className="flex items-baseline gap-2">
            <span className="lp-accent-text text-lg font-bold">
              {buyBox.price}
            </span>
            {buyBox.compareAtPrice && (
              <span className="lp-muted text-sm line-through">
                {buyBox.compareAtPrice}
              </span>
            )}
          </p>
        </div>
        <a
          href={buyBox.productUrl}
          className="lp-btn shrink-0 rounded-full px-6 py-3 text-sm font-semibold shadow-md sm:text-base"
        >
          {buyBox.ctaLabel}
        </a>
      </div>
    </div>
  );
}
