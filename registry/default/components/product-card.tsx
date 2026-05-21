"use client";

import * as React from "react";
import { AlertCircle, ImageOff, PauseCircle } from "lucide-react";

import { formatMoney, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Marketplace,
  Product,
  ProductAvailability,
} from "@/components/rye-rewards/types/product";

type MarketplaceDownAvailability = Extract<ProductAvailability, { kind: "marketplace_down" }>;

const marketplaceLabel: Record<Marketplace, string> = {
  amazon: "Amazon",
  shopify: "Shopify",
  bestbuy: "Best Buy",
};

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

interface ProductCardContextValue {
  product: Product;
  selected: boolean;
  onNotify: ((product: Product) => void) | undefined;
}

const ProductCardContext = React.createContext<ProductCardContextValue | null>(null);

const useProductCardContext = (slot: string): ProductCardContextValue => {
  const ctx = React.useContext(ProductCardContext);
  if (!ctx) {
    throw new Error(`<ProductCard.${slot} /> must be rendered inside a <ProductCard>`);
  }
  return ctx;
};

// -------------------------------------------------------------------------
// Root
// -------------------------------------------------------------------------

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: Product;
  /** Marks this card as the currently selected one (renders the focus ring). */
  selected?: boolean;
  /** Optional callback when the marketplace-down "Notify me" link is clicked. */
  onNotify?: (product: Product) => void;
  children: React.ReactNode;
}

const ProductCardRoot = React.forwardRef<HTMLDivElement, ProductCardProps>(function ProductCardRoot(
  { product, selected = false, onNotify, className, children, ...rest },
  ref,
) {
  const value = React.useMemo<ProductCardContextValue>(
    () => ({ product, selected, onNotify }),
    [product, selected, onNotify],
  );

  return (
    <ProductCardContext.Provider value={value}>
      <div ref={ref} className={cn("block", className)} {...rest}>
        {children}
      </div>
    </ProductCardContext.Provider>
  );
});

ProductCardRoot.displayName = "ProductCard";

// -------------------------------------------------------------------------
// <ProductCard.Image />
// -------------------------------------------------------------------------

export type ProductCardImageProps = React.HTMLAttributes<HTMLDivElement>;

function ProductCardImage({ className, ...rest }: ProductCardImageProps) {
  const { product, selected, onNotify } = useProductCardContext("Image");
  const { availability, image, name } = product;
  const isBuyable = availability.kind === "in_stock";
  const isDimmable =
    availability.kind === "out_of_stock" || availability.kind === "marketplace_down";

  const [imageFailed, setImageFailed] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // If the image was already in the browser cache when this component
  // mounted, the `onLoad` listener attaches after the load event fires
  // and never runs. Check `.complete` on mount to catch that race.
  React.useEffect(() => {
    if (imgRef.current?.complete) {
      setImageLoaded(true);
    }
  }, []);

  const handleNotify = onNotify ? () => onNotify(product) : undefined;

  return (
    <div
      className={cn(
        "bg-line relative aspect-[4/5] overflow-hidden rounded-xl",
        isBuyable &&
          "transition-all duration-300 group-hover:shadow-[0_8px_32px_-12px_rgba(15,15,15,0.18)]",
        selected && "ring-ink-1 ring-offset-page ring-2 ring-offset-4",
        className,
      )}
      {...rest}
    >
      {imageFailed ? (
        <ImageFailedFallback />
      ) : (
        <img
          ref={imgRef}
          src={image.thumbnailUrl ?? image.url}
          alt={image.alt ?? name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-500",
            imageLoaded ? "opacity-100" : "opacity-0",
            isBuyable && "group-hover:scale-[1.03]",
            imageLoaded && isDimmable && "opacity-50 grayscale",
          )}
        />
      )}

      {availability.kind === "out_of_stock" && (
        <AvailabilityBadge icon={<AlertCircle size={11} strokeWidth={2} />} label="Unavailable" />
      )}
      {availability.kind === "marketplace_down" && (
        <MarketplaceDownPanel availability={availability} onNotify={handleNotify} />
      )}
    </div>
  );
}

ProductCardImage.displayName = "ProductCard.Image";

// -------------------------------------------------------------------------
// <ProductCard.Info />
// -------------------------------------------------------------------------

export type ProductCardInfoProps = React.HTMLAttributes<HTMLDivElement>;

function ProductCardInfo({ className, ...rest }: ProductCardInfoProps) {
  const { product, onNotify } = useProductCardContext("Info");
  const { availability, vendor, name, subtitle, price, compareAtPrice, pointsPrice } = product;
  const isBuyable = availability.kind === "in_stock";
  const isOutOfStock = availability.kind === "out_of_stock";
  const isMarketplaceDown = availability.kind === "marketplace_down";
  const isDiscounted = isBuyable && compareAtPrice !== undefined;

  const handleNotify = onNotify ? () => onNotify(product) : undefined;

  return (
    <div className={cn("flex flex-col pt-4", className)} {...rest}>
      {vendor && (
        <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">{vendor}</div>
      )}
      {/* Reserve 2 lines of vertical space so prices line up across tiles when
          some names wrap and others don't. */}
      <div
        className={cn(
          "mt-1 line-clamp-2 min-h-[2.5em] text-sm leading-snug font-medium",
          isBuyable ? "text-ink-1" : "text-ink-2",
        )}
      >
        {name}
      </div>
      {subtitle && (
        <div className={cn("mt-1 text-xs", isBuyable ? "text-ink-2" : "text-ink-3")}>
          {subtitle}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {isDiscounted && (
          <span className="text-ink-3 text-sm tabular-nums line-through">
            {formatMoney(compareAtPrice)}
          </span>
        )}
        <span
          className={cn(
            "text-sm tabular-nums",
            isBuyable ? "text-ink-1 font-semibold" : "text-ink-3 font-medium",
            isOutOfStock && "line-through",
          )}
        >
          {formatMoney(price)}
        </span>

        {isBuyable && pointsPrice !== undefined && (
          <span className="text-ink-3 text-xs tabular-nums">or {formatPoints(pointsPrice)}</span>
        )}

        {isMarketplaceDown && handleNotify && <NotifyButton onClick={handleNotify} compact />}
      </div>
    </div>
  );
}

ProductCardInfo.displayName = "ProductCard.Info";

// -------------------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------------------

const AvailabilityBadge = React.memo(function AvailabilityBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="absolute top-3 left-3">
      <div className="bg-card/95 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur">
        <span className="text-ink-3">{icon}</span>
        <span className="text-ink-2 text-xs font-medium tracking-widest uppercase">{label}</span>
      </div>
    </div>
  );
});

function MarketplaceDownPanel({
  availability,
  onNotify,
}: {
  availability: MarketplaceDownAvailability;
  onNotify: (() => void) | undefined;
}) {
  const headline =
    availability.reason ??
    `Ordering temporarily paused on ${marketplaceLabel[availability.marketplace]}`;
  return (
    <div className="bg-card/95 absolute inset-x-3 bottom-3 flex items-start gap-2.5 rounded-lg px-3.5 py-3 backdrop-blur">
      <PauseCircle size={14} strokeWidth={2} className="text-ink-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-ink-1 text-xs font-medium">{headline}</div>
        <div className="text-ink-2 mt-0.5 text-xs leading-relaxed">
          The merchant has paused this catalog. We&rsquo;ll notify you when it&rsquo;s back.
        </div>
        {onNotify && <NotifyButton onClick={onNotify} label="Notify me when available" />}
      </div>
    </div>
  );
}

interface NotifyButtonProps {
  onClick: () => void;
  label?: string;
  compact?: boolean;
}

function NotifyButton({ onClick, label = "Notify me", compact = false }: NotifyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-ink-1 hover:text-ink-2 text-xs underline underline-offset-2 transition",
        !compact && "mt-1.5",
      )}
    >
      {label}
    </button>
  );
}

const ImageFailedFallback = React.memo(function ImageFailedFallback() {
  return (
    <div className="text-ink-3 absolute inset-0 flex flex-col items-center justify-center gap-2">
      <ImageOff size={32} strokeWidth={1.5} />
      <span className="text-xs font-medium tracking-widest uppercase">Image unavailable</span>
    </div>
  );
});

// -------------------------------------------------------------------------
// Compound export
// -------------------------------------------------------------------------

export const ProductCard = Object.assign(ProductCardRoot, {
  Image: ProductCardImage,
  Info: ProductCardInfo,
});

// -------------------------------------------------------------------------
// Loading skeleton
// -------------------------------------------------------------------------

const SKELETON_LINE_DELAYS = [
  undefined,
  { animationDelay: "0.1s" },
  { animationDelay: "0.15s" },
  { animationDelay: "0.2s" },
] as const;

export function ProductCardSkeleton({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("block", className)} aria-hidden="true" {...rest}>
      <div className="bg-line skeleton aspect-[4/5] rounded-xl" />
      <div className="space-y-2 pt-4">
        <div className="bg-line skeleton h-2.5 w-16 rounded" style={SKELETON_LINE_DELAYS[0]} />
        <div className="bg-line skeleton h-3.5 w-3/4 rounded" style={SKELETON_LINE_DELAYS[1]} />
        <div className="bg-line skeleton h-3 w-1/2 rounded" style={SKELETON_LINE_DELAYS[2]} />
        <div className="bg-line skeleton mt-3 h-4 w-20 rounded" style={SKELETON_LINE_DELAYS[3]} />
      </div>
    </div>
  );
}
