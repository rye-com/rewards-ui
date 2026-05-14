"use client";

import * as React from "react";
import { AlertCircle, ImageOff, PauseCircle, Repeat } from "lucide-react";

import { cn } from "../lib/utils";
import type { Marketplace, Product, ProductAvailability } from "../types/product";

export interface ProductCardProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "type"
> {
  product: Product;
  /** Marks this card as the currently selected one (renders the focus ring). */
  selected?: boolean;
  /** Optional callback when the marketplace-down "Notify me" link is clicked. */
  onNotify?: (product: Product) => void;
  /** Override how the cash price renders. Defaults to Intl.NumberFormat currency. */
  formatPrice?: (price: Product["price"]) => string;
  /** Override how points render. Defaults to "X,XXX pts". */
  formatPoints?: (points: number) => string;
}

const defaultFormatPrice = (price: Product["price"]): string => {
  // en-US default keeps rendering predictable across server / browser / test envs.
  // Partners override via the `formatPrice` prop to match their locale.
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency,
    }).format(Number(price.value));
  } catch {
    return `${price.currency} ${price.value}`;
  }
};

const defaultFormatPoints = (points: number): string => `${points.toLocaleString("en-US")} pts`;

const marketplaceLabel: Record<Marketplace, string> = {
  amazon: "Amazon",
  shopify: "Shopify",
  bestbuy: "Best Buy",
};

export const ProductCard = React.forwardRef<HTMLAnchorElement, ProductCardProps>(
  function ProductCard(
    {
      product,
      selected = false,
      onNotify,
      formatPrice = defaultFormatPrice,
      formatPoints = defaultFormatPoints,
      className,
      onClick,
      ...rest
    },
    ref,
  ) {
    const [imageFailed, setImageFailed] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const imgRef = React.useRef<HTMLImageElement>(null);

    // If the image was already in the browser cache when this component
    // mounted, the `onLoad` listener attaches after the load event fires
    // and never runs. Check `.complete` on mount to catch that race.
    React.useEffect(() => {
      if (imgRef.current?.complete) setImageLoaded(true);
    }, []);

    const isBuyable = product.availability.kind === "in-stock";
    const isMarketplaceDown = product.availability.kind === "marketplace-down";
    const isSubscription = product.availability.kind === "subscription-only";
    const isOutOfStock = product.availability.kind === "out-of-stock";

    return (
      <a
        ref={ref}
        className={cn(
          "group block",
          !isBuyable && "cursor-not-allowed",
          "focus-visible:ring-ink-1 focus-visible:ring-offset-page focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none",
          className,
        )}
        aria-disabled={!isBuyable || undefined}
        onClick={!isBuyable ? (e) => e.preventDefault() : onClick}
        {...rest}
      >
        <div
          className={cn(
            "bg-line relative aspect-[4/5] overflow-hidden rounded-xl",
            isBuyable &&
              "transition-all duration-300 group-hover:shadow-[0_8px_32px_-12px_rgba(15,15,15,0.18)]",
            selected && "ring-ink-1 ring-offset-page ring-2 ring-offset-4",
          )}
        >
          {imageFailed ? (
            <ImageFailedFallback />
          ) : (
            <img
              ref={imgRef}
              src={product.image.thumbnailUrl ?? product.image.url}
              alt={product.image.alt ?? product.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500",
                imageLoaded ? "opacity-100" : "opacity-0",
                isBuyable && "group-hover:scale-[1.03]",
                imageLoaded && (isOutOfStock || isMarketplaceDown) && "opacity-50 grayscale",
              )}
            />
          )}

          {isOutOfStock && (
            <AvailabilityBadge
              tone="muted"
              icon={<AlertCircle size={11} strokeWidth={2} />}
              label="Unavailable"
            />
          )}
          {isSubscription && (
            <AvailabilityBadge
              tone="points"
              icon={<Repeat size={11} strokeWidth={2} />}
              label="Subscription"
            />
          )}
          {product.availability.kind === "marketplace-down" && (
            <MarketplaceDownPanel
              availability={product.availability}
              onNotify={() => onNotify?.(product)}
            />
          )}
        </div>

        <div className="pt-4">
          {product.vendor && (
            <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
              {product.vendor}
            </div>
          )}
          <div
            className={cn(
              "mt-1 text-[14px] leading-snug font-medium -tracking-[0.02em]",
              isBuyable ? "text-ink-1" : "text-ink-2",
            )}
          >
            {product.name}
          </div>
          {product.subtitle && (
            <div className={cn("mt-1 text-[12.5px]", isBuyable ? "text-ink-2" : "text-ink-3")}>
              {product.subtitle}
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={cn(
                "text-[14.5px] -tracking-[0.02em] tabular-nums",
                isBuyable ? "text-ink-1 font-semibold" : "text-ink-3 font-medium",
                isOutOfStock && "line-through",
              )}
            >
              {formatPrice(product.price)}
            </span>

            {isSubscription && (
              <span className="text-ink-3 text-[11.5px]">
                /{" "}
                {product.availability.kind === "subscription-only"
                  ? (product.availability.cadence ?? "month")
                  : "month"}
              </span>
            )}

            {isBuyable && product.pointsPrice !== undefined && (
              <span className="text-ink-3 text-[11.5px] tabular-nums">
                or {formatPoints(product.pointsPrice)}
              </span>
            )}

            {isMarketplaceDown && onNotify && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNotify(product);
                }}
                className="text-ink-1 hover:text-ink-2 text-[11.5px] underline underline-offset-2 transition"
              >
                Notify me
              </button>
            )}
          </div>

          {isSubscription && (
            <div className="text-ink-3 mt-1 text-[11.5px]">Not redeemable with points yet</div>
          )}
        </div>
      </a>
    );
  },
);

ProductCard.displayName = "ProductCard";

// -------------------------------------------------------------------------
// Internal helpers (kept in the same file for shadcn-style copy-paste)
// -------------------------------------------------------------------------

function AvailabilityBadge({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "muted" | "points";
}) {
  return (
    <div className="absolute top-3 left-3">
      <div className="bg-card/95 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur">
        <span className={cn(tone === "points" ? "text-points" : "text-ink-3")}>{icon}</span>
        <span
          className={cn(
            "text-[10.5px] font-medium tracking-[0.08em] uppercase",
            tone === "points" ? "text-ink-1" : "text-ink-2",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function MarketplaceDownPanel({
  availability,
  onNotify,
}: {
  availability: Extract<ProductAvailability, { kind: "marketplace-down" }>;
  onNotify?: () => void;
}) {
  const headline =
    availability.reason ??
    `Ordering temporarily paused on ${marketplaceLabel[availability.marketplace]}`;
  return (
    <div className="bg-card/95 absolute inset-x-3 bottom-3 flex items-start gap-2.5 rounded-lg px-3.5 py-3 backdrop-blur">
      <PauseCircle size={14} strokeWidth={2} className="text-ink-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-ink-1 text-[11.5px] font-medium -tracking-[0.02em]">{headline}</div>
        <div className="text-ink-2 mt-0.5 text-[10.5px] leading-relaxed">
          The merchant has paused this catalog. We&rsquo;ll notify you when it&rsquo;s back.
        </div>
        {onNotify && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNotify();
            }}
            className="text-ink-1 hover:text-ink-2 mt-1.5 text-[11px] underline underline-offset-2 transition"
          >
            Notify me when available
          </button>
        )}
      </div>
    </div>
  );
}

function ImageFailedFallback() {
  return (
    <div className="text-ink-3 absolute inset-0 flex flex-col items-center justify-center gap-2">
      <ImageOff size={32} strokeWidth={1.5} />
      <span className="text-[10.5px] font-medium tracking-[0.1em] uppercase">
        Image unavailable
      </span>
    </div>
  );
}

// -------------------------------------------------------------------------
// Loading skeleton
// -------------------------------------------------------------------------

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("block", className)} aria-hidden="true">
      <div className="bg-line skeleton aspect-[4/5] rounded-xl" />
      <div className="space-y-2 pt-4">
        <div className="bg-line skeleton h-2.5 w-16 rounded" />
        <div className="bg-line skeleton h-3.5 w-3/4 rounded" style={{ animationDelay: "0.1s" }} />
        <div className="bg-line skeleton h-3 w-1/2 rounded" style={{ animationDelay: "0.15s" }} />
        <div
          className="bg-line skeleton mt-3 h-4 w-20 rounded"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
    </div>
  );
}
