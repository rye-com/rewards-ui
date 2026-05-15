"use client";

import * as React from "react";
import { AlertCircle, ChevronRight, RotateCcw, ShieldCheck, Truck, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Money } from "../types/product";
import type {
  ProductDetailsData,
  VariantDimension,
  VariantOption,
  VariantRevalidationError,
  VariantSelection,
} from "../types/product-details";

type BreadcrumbItem = string | { label: string; href: string };
type MetaIcon = "truck" | "rotate-ccw" | "shield-check";
type MetaRow = { icon?: MetaIcon; text: React.ReactNode };

// Reuse Intl.NumberFormat per currency. See product-card.tsx for context.
const currencyFormatters = new Map<string, Intl.NumberFormat>();
const getCurrencyFormatter = (currency: string): Intl.NumberFormat => {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, { style: "currency", currency });
    currencyFormatters.set(currency, formatter);
  }
  return formatter;
};

const defaultFormatPrice = (price: Money): string => {
  try {
    return getCurrencyFormatter(price.currency).format(Number(price.value));
  } catch {
    return `${price.currency} ${price.value}`;
  }
};

const defaultFormatPoints = (points: number): string => `${points.toLocaleString()} pts`;

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

interface ProductDetailsContextValue {
  data: ProductDetailsData;
  selection: VariantSelection;
  onSelectionChange: (dimensionId: string, optionId: string) => void;
  selectedImageIndex: number;
  onImageSelect: ((index: number) => void) | undefined;
  revalidationError: VariantRevalidationError | undefined;
  formatPrice: (price: Money) => string;
  formatPoints: (points: number) => string;
}

const ProductDetailsContext = React.createContext<ProductDetailsContextValue | null>(null);

const useProductDetailsContext = (slot: string): ProductDetailsContextValue => {
  const ctx = React.useContext(ProductDetailsContext);
  if (!ctx) {
    throw new Error(`<ProductDetails.${slot} /> must be rendered inside a <ProductDetails>`);
  }
  return ctx;
};

// -------------------------------------------------------------------------
// Root
// -------------------------------------------------------------------------

export interface ProductDetailsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  data: ProductDetailsData;
  /** Map of dimension id to selected option id. */
  selection: VariantSelection;
  onSelectionChange: (dimensionId: string, optionId: string) => void;
  /** Which gallery image is in the hero slot. */
  selectedImageIndex?: number;
  onImageSelect?: (index: number) => void;
  /** Set when a previously-selected variant has just become unavailable. */
  revalidationError?: VariantRevalidationError;
  /** Override how the cash price renders. */
  formatPrice?: (price: Money) => string;
  /** Override how points render. */
  formatPoints?: (points: number) => string;
  children: React.ReactNode;
}

const ProductDetailsRoot = React.forwardRef<HTMLDivElement, ProductDetailsProps>(
  function ProductDetailsRoot(
    {
      data,
      selection,
      onSelectionChange,
      selectedImageIndex = 0,
      onImageSelect,
      revalidationError,
      formatPrice = defaultFormatPrice,
      formatPoints = defaultFormatPoints,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const value = React.useMemo<ProductDetailsContextValue>(
      () => ({
        data,
        selection,
        onSelectionChange,
        selectedImageIndex,
        onImageSelect,
        revalidationError,
        formatPrice,
        formatPoints,
      }),
      [
        data,
        selection,
        onSelectionChange,
        selectedImageIndex,
        onImageSelect,
        revalidationError,
        formatPrice,
        formatPoints,
      ],
    );

    return (
      <ProductDetailsContext.Provider value={value}>
        <div ref={ref} className={cn("mx-auto max-w-7xl", className)} {...rest}>
          {children}
        </div>
      </ProductDetailsContext.Provider>
    );
  },
);

ProductDetailsRoot.displayName = "ProductDetails";

// -------------------------------------------------------------------------
// <ProductDetails.Breadcrumbs />
// -------------------------------------------------------------------------

export interface ProductDetailsBreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Breadcrumb trail. The last item always renders as plain text with
   * `aria-current="page"`. Earlier items render as plain spans by default;
   * pass `renderItem` to wrap each one with your framework's link component
   * (e.g. Next.js `<Link>`).
   */
  items: BreadcrumbItem[];
  /**
   * Custom renderer for each crumb. Receives the resolved `{ label, href? }`
   * and a `isLast` flag. Default returns a `<span>{label}</span>`.
   */
  renderItem?: (
    item: { label: string; href?: string },
    index: number,
    isLast: boolean,
  ) => React.ReactNode;
}

function ProductDetailsBreadcrumbs({
  items,
  renderItem,
  className,
  ...rest
}: ProductDetailsBreadcrumbsProps) {
  if (items.length === 0) return null;
  return (
    <nav
      className={cn("text-ink-3 mb-8 flex items-center gap-2 text-xs", className)}
      aria-label="Breadcrumb"
      {...rest}
    >
      {items.map((crumb, i) => {
        const isLast = i === items.length - 1;
        const resolved = typeof crumb === "string" ? { label: crumb } : crumb;
        const content = renderItem ? (
          renderItem(resolved, i, isLast)
        ) : (
          <span
            className={isLast ? "text-ink-2" : ""}
            {...(isLast ? { "aria-current": "page" as const } : {})}
          >
            {resolved.label}
          </span>
        );
        return (
          <React.Fragment key={`${i}-${resolved.label}`}>
            {content}
            {!isLast && <ChevronRight size={12} strokeWidth={2} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

ProductDetailsBreadcrumbs.displayName = "ProductDetails.Breadcrumbs";

// -------------------------------------------------------------------------
// <ProductDetails.Gallery />
// -------------------------------------------------------------------------

const GALLERY_THUMBNAIL_CAP = 8;

export type ProductDetailsGalleryProps = React.HTMLAttributes<HTMLDivElement>;

function ProductDetailsGallery({ className, ...rest }: ProductDetailsGalleryProps) {
  const { data, selectedImageIndex, onImageSelect } = useProductDetailsContext("Gallery");
  const { gallery: images, product } = data;
  const altBase = product.name;
  const heroImage = images[selectedImageIndex] ?? images[0];

  // Some listings include 100+ per-variant images. Cap the thumbnail row
  // so the gallery doesn't take over the page. If the active index sits
  // past the cap, show it instead of the last entry so the user can still
  // navigate back to it.
  const cappedImages =
    images.length <= GALLERY_THUMBNAIL_CAP
      ? images
      : selectedImageIndex < GALLERY_THUMBNAIL_CAP
        ? images.slice(0, GALLERY_THUMBNAIL_CAP)
        : [...images.slice(0, GALLERY_THUMBNAIL_CAP - 1), images[selectedImageIndex] as string];
  const hiddenCount = Math.max(0, images.length - cappedImages.length);

  return (
    <div className={className} {...rest}>
      <div className="bg-line mb-3 aspect-[4/5] overflow-hidden rounded-xl">
        {heroImage && (
          <img
            src={heroImage}
            alt={altBase}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cappedImages.map((src, i) => {
          const imageIndex =
            i === GALLERY_THUMBNAIL_CAP - 1 && selectedImageIndex >= GALLERY_THUMBNAIL_CAP
              ? selectedImageIndex
              : i;
          const isSelected = imageIndex === selectedImageIndex;
          return (
            <button
              key={`${imageIndex}-${src}`}
              type="button"
              onClick={() => onImageSelect?.(imageIndex)}
              aria-label={`View image ${imageIndex + 1}${isSelected ? ", currently selected" : ""}`}
              className={cn(
                "bg-line aspect-square overflow-hidden rounded-lg",
                isSelected
                  ? "ring-ink-1 ring-offset-page ring-2 ring-offset-2"
                  : "transition hover:opacity-90",
              )}
            >
              <img
                src={src}
                alt={`${altBase} ${imageIndex + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
      {hiddenCount > 0 && (
        <div className="text-ink-3 mt-2 text-center text-xs">
          +{hiddenCount} more variant photos
        </div>
      )}
    </div>
  );
}

ProductDetailsGallery.displayName = "ProductDetails.Gallery";

// -------------------------------------------------------------------------
// <ProductDetails.Header />
// -------------------------------------------------------------------------

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

export interface ProductDetailsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading level for the product name. Default `h1`. */
  as?: HeadingLevel;
}

function ProductDetailsHeader({
  as: Heading = "h1",
  className,
  ...rest
}: ProductDetailsHeaderProps) {
  const { data, formatPrice, formatPoints } = useProductDetailsContext("Header");
  const { product } = data;
  return (
    <div className={className} {...rest}>
      {product.vendor && (
        <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
          {product.vendor}
        </div>
      )}
      <Heading className="text-ink-1 mt-2 text-3xl leading-tight font-semibold">
        {product.name}
      </Heading>
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {product.compareAtPrice && (
          <span className="text-ink-3 text-lg tabular-nums line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
        <span className="text-ink-1 text-2xl font-semibold tabular-nums">
          {formatPrice(product.price)}
        </span>
        {product.pointsPrice !== undefined && (
          <>
            <span className="text-ink-3">·</span>
            <span className="text-ink-2 text-sm tabular-nums">
              or {formatPoints(product.pointsPrice)}
            </span>
          </>
        )}
      </div>

      {product.description && (
        <p className="text-ink-2 mt-6 line-clamp-4 text-sm leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      )}
    </div>
  );
}

ProductDetailsHeader.displayName = "ProductDetails.Header";

// -------------------------------------------------------------------------
// <ProductDetails.Variants />
// -------------------------------------------------------------------------

export type ProductDetailsVariantsProps = React.HTMLAttributes<HTMLDivElement>;

function ProductDetailsVariants({ className, ...rest }: ProductDetailsVariantsProps) {
  const { data, selection, onSelectionChange, revalidationError } =
    useProductDetailsContext("Variants");

  return (
    <div className={className} {...rest}>
      {revalidationError && <RevalidationAlert error={revalidationError} />}
      {data.dimensions.map((dim) => (
        <VariantGroup
          key={dim.id}
          dimension={dim}
          selectedOptionId={selection[dim.id] ?? null}
          onChange={(optionId) => onSelectionChange(dim.id, optionId)}
          hasRevalidationError={revalidationError !== undefined}
        />
      ))}
    </div>
  );
}

ProductDetailsVariants.displayName = "ProductDetails.Variants";

const RevalidationAlert = React.memo(function RevalidationAlert({
  error,
}: {
  error: VariantRevalidationError;
}) {
  return (
    <div
      role="alert"
      className="bg-error-soft border-error/20 mt-6 flex items-start gap-3 rounded-xl border px-4 py-3.5"
    >
      <AlertCircle size={16} strokeWidth={2} className="text-error mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-error text-sm font-semibold">{error.headline}</div>
        {error.detail && (
          <div className="text-ink-2 mt-1 text-xs leading-relaxed">{error.detail}</div>
        )}
      </div>
    </div>
  );
});

interface VariantOptionsProps {
  options: VariantOption[];
  selectedId: string | null;
  onChange: (optionId: string) => void;
  revalidating: boolean;
}

const VARIANT_STYLE_RENDERERS: Record<
  VariantDimension["style"],
  React.ComponentType<VariantOptionsProps>
> = {
  swatches: SwatchOptions,
  grid: GridOptions,
  cards: CardOptions,
};

function VariantGroup({
  dimension,
  selectedOptionId,
  onChange,
  hasRevalidationError,
}: {
  dimension: VariantDimension;
  selectedOptionId: string | null;
  onChange: (optionId: string) => void;
  hasRevalidationError: boolean;
}) {
  const selectedOption = dimension.options.find((o) => o.id === selectedOptionId);
  const showRevalidationFlag = hasRevalidationError && selectedOption?.justBecameUnavailable;
  const Renderer = VARIANT_STYLE_RENDERERS[dimension.style];

  return (
    <div className="mt-7" role="radiogroup" aria-label={dimension.label}>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
          {dimension.label}
        </div>
        {showRevalidationFlag && selectedOption ? (
          <div className="text-error flex items-center gap-1.5 text-sm font-medium">
            <X size={11} strokeWidth={2.25} />
            <span>{selectedOption.label} · unavailable</span>
          </div>
        ) : dimension.hint ? (
          <div className="text-ink-3 text-xs">{dimension.hint}</div>
        ) : selectedOption ? (
          <div className="text-ink-1 text-sm font-medium">{selectedOption.label}</div>
        ) : null}
      </div>

      <Renderer
        options={dimension.options}
        selectedId={selectedOptionId}
        onChange={onChange}
        revalidating={hasRevalidationError}
      />
    </div>
  );
}

function SwatchOptions({ options, selectedId, onChange, revalidating }: VariantOptionsProps) {
  return (
    <div className="flex gap-2.5">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        const isUnavailableSelected = isSelected && revalidating && opt.justBecameUnavailable;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={opt.label + (isUnavailableSelected ? ", just became unavailable" : "")}
            disabled={opt.available === false}
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative h-9 w-9 rounded-full transition",
              !isSelected && "hover:scale-105",
              isSelected &&
                !isUnavailableSelected &&
                "ring-ink-1 ring-offset-card ring-2 ring-offset-2",
              isUnavailableSelected &&
                "ring-error ring-offset-card opacity-60 ring-2 ring-offset-2",
              // Subtle border on every colored swatch so light tones don't
              // blend into the card background.
              opt.swatchColor && "border-line-strong border",
            )}
            style={opt.swatchColor ? { backgroundColor: opt.swatchColor } : undefined}
          >
            {isUnavailableSelected && (
              <span className="absolute inset-0 flex items-center justify-center text-white">
                <X size={16} strokeWidth={2.5} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function GridOptions({ options, selectedId, onChange, revalidating }: VariantOptionsProps) {
  // Adapt column count to the longest label so multi-word option names
  // don't overflow narrow buttons.
  const maxLabel = options.reduce((m, o) => Math.max(m, o.label.length), 0);
  const colsClass = maxLabel > 16 ? "grid-cols-3" : maxLabel > 10 ? "grid-cols-4" : "grid-cols-5";
  return (
    <div className={cn("grid gap-2", colsClass)}>
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        const isUnavailableSelected = isSelected && revalidating && opt.justBecameUnavailable;
        const isUnavailable = opt.available === false;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isUnavailable}
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex min-h-11 items-center justify-center rounded-lg px-3 py-2 text-center text-sm leading-tight font-medium break-words whitespace-normal tabular-nums transition",
              isSelected && !isUnavailableSelected && "bg-ink-1 text-page",
              isUnavailableSelected && "bg-error-soft border-error text-error border-2",
              !isSelected &&
                !isUnavailable &&
                "border-line-strong text-ink-1 hover:border-ink-1 border",
              !isSelected && isUnavailable && "border-line text-ink-3 cursor-not-allowed border",
            )}
          >
            {isUnavailable || isUnavailableSelected ? (
              <span className="line-through decoration-1">{opt.label}</span>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>
  );
}

function CardOptions({ options, selectedId, onChange }: VariantOptionsProps) {
  const cols = options.length <= 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={cn("grid gap-2", cols)}>
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        const isUnavailable = opt.available === false;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isUnavailable}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-left transition",
              isSelected && "border-ink-1 bg-inset border-2",
              !isSelected && !isUnavailable && "border-line-strong hover:border-ink-1 border",
              !isSelected && isUnavailable && "border-line cursor-not-allowed border",
            )}
          >
            <div className={cn("text-sm font-medium", isUnavailable ? "text-ink-3" : "text-ink-1")}>
              {opt.label}
            </div>
            {opt.secondary && (
              <div className={cn("mt-0.5 text-xs", isSelected ? "text-ink-2" : "text-ink-3")}>
                {opt.secondary}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------------------
// <ProductDetails.Quantity />
// -------------------------------------------------------------------------

export interface ProductDetailsQuantityProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

function ProductDetailsQuantity({
  value,
  onChange,
  min = 1,
  max = 10,
}: ProductDetailsQuantityProps) {
  // Hooks must run regardless, but the slot still requires a Root provider.
  useProductDetailsContext("Quantity");
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div className="mt-8 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-ink-1 text-sm font-medium">Quantity</span>
        <span className="text-ink-3 mt-0.5 text-xs">Max {max} per redemption</span>
      </div>
      <div className="border-line bg-card flex items-center rounded-xl border">
        <StepperButton
          onClick={decrement}
          disabled={atMin}
          aria-label="Decrease quantity"
          symbol="−"
        />
        <span
          aria-live="polite"
          className="text-ink-1 min-w-7 text-center text-sm font-medium tabular-nums"
        >
          {value}
        </span>
        <StepperButton
          onClick={increment}
          disabled={atMax}
          aria-label="Increase quantity"
          symbol="+"
        />
      </div>
    </div>
  );
}

ProductDetailsQuantity.displayName = "ProductDetails.Quantity";

function StepperButton({
  onClick,
  disabled,
  symbol,
  "aria-label": ariaLabel,
}: {
  onClick: () => void;
  disabled: boolean;
  symbol: string;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "px-3.5 py-2 text-base leading-none font-medium transition",
        disabled ? "text-ink-3 cursor-not-allowed" : "text-ink-1 hover:bg-inset",
      )}
    >
      {symbol}
    </button>
  );
}

// -------------------------------------------------------------------------
// <ProductDetails.Redeem />
// -------------------------------------------------------------------------

export interface ProductDetailsRedeemProps {
  onClick?: () => void;
  /** Primary CTA copy. Defaults to "Redeem with points". */
  label?: string;
  /** Secondary suffix. Defaults to the formatted product price. */
  secondary?: string;
  /** When set, the CTA renders disabled with this label. */
  disabledReason?: string;
}

function ProductDetailsRedeem({
  onClick,
  label = "Redeem with points",
  secondary,
  disabledReason,
}: ProductDetailsRedeemProps) {
  const { data, formatPrice } = useProductDetailsContext("Redeem");
  const isDisabled = disabledReason !== undefined;
  const resolvedSecondary = secondary ?? formatPrice(data.product.price);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-medium transition",
        isDisabled
          ? "bg-line text-ink-3 cursor-not-allowed"
          : "bg-cta text-cta-fg hover:opacity-90",
      )}
    >
      {isDisabled ? (
        disabledReason
      ) : (
        <>
          <span>{label}</span>
          <span className="text-page/50">·</span>
          <span className="tabular-nums">{resolvedSecondary}</span>
        </>
      )}
    </button>
  );
}

ProductDetailsRedeem.displayName = "ProductDetails.Redeem";

// -------------------------------------------------------------------------
// <ProductDetails.Meta />
// -------------------------------------------------------------------------

const META_ICONS: Record<
  MetaIcon,
  React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
> = {
  truck: Truck,
  "rotate-ccw": RotateCcw,
  "shield-check": ShieldCheck,
};

export interface ProductDetailsMetaProps extends React.HTMLAttributes<HTMLDivElement> {
  rows: MetaRow[];
}

function ProductDetailsMeta({ rows, className, ...rest }: ProductDetailsMetaProps) {
  if (rows.length === 0) return null;
  return (
    <div className={cn("border-line mt-6 space-y-3 border-t pt-6 text-sm", className)} {...rest}>
      {rows.map((row, i) => {
        const Icon = row.icon ? META_ICONS[row.icon] : null;
        return (
          <div key={i} className="text-ink-2 flex items-center gap-2.5">
            {Icon && <Icon size={14} strokeWidth={2} className="text-ink-3" />}
            <span>{row.text}</span>
          </div>
        );
      })}
    </div>
  );
}

ProductDetailsMeta.displayName = "ProductDetails.Meta";

// -------------------------------------------------------------------------
// Compound export
// -------------------------------------------------------------------------

export const ProductDetails = Object.assign(ProductDetailsRoot, {
  Breadcrumbs: ProductDetailsBreadcrumbs,
  Gallery: ProductDetailsGallery,
  Header: ProductDetailsHeader,
  Variants: ProductDetailsVariants,
  Quantity: ProductDetailsQuantity,
  Redeem: ProductDetailsRedeem,
  Meta: ProductDetailsMeta,
});

// -------------------------------------------------------------------------
// Loading skeleton
// -------------------------------------------------------------------------

const SKELETON_BREADCRUMB_DELAYS = [
  undefined,
  { animationDelay: "0.05s" },
  { animationDelay: "0.1s" },
] as const;
const SKELETON_HERO_THUMB_DELAYS = [
  { animationDelay: "0.05s" },
  { animationDelay: "0.1s" },
  { animationDelay: "0.15s" },
  { animationDelay: "0.2s" },
] as const;
const SKELETON_DESC_DELAYS = [
  { animationDelay: "0.25s" },
  { animationDelay: "0.3s" },
  { animationDelay: "0.35s" },
] as const;
const SKELETON_SWATCH_DELAYS = [
  { animationDelay: "0.45s" },
  { animationDelay: "0.5s" },
  { animationDelay: "0.55s" },
  { animationDelay: "0.6s" },
  { animationDelay: "0.65s" },
] as const;
const SKELETON_SIZE_DELAYS = [
  { animationDelay: "0.75s" },
  { animationDelay: "0.8s" },
  { animationDelay: "0.85s" },
  { animationDelay: "0.9s" },
  { animationDelay: "0.95s" },
] as const;

export function ProductDetailsSkeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto max-w-7xl", className)} aria-hidden="true" {...rest}>
      <div className="mb-8 flex items-center gap-2">
        <div
          className="bg-line skeleton h-2.5 w-16 rounded"
          style={SKELETON_BREADCRUMB_DELAYS[0]}
        />
        <span className="text-ink-3">·</span>
        <div
          className="bg-line skeleton h-2.5 w-20 rounded"
          style={SKELETON_BREADCRUMB_DELAYS[1]}
        />
        <span className="text-ink-3">·</span>
        <div
          className="bg-line skeleton h-2.5 w-32 rounded"
          style={SKELETON_BREADCRUMB_DELAYS[2]}
        />
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_400px] md:gap-12 lg:grid-cols-[1fr_460px] lg:gap-16">
        <div>
          <div className="bg-line skeleton mb-3 aspect-[4/5] rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {SKELETON_HERO_THUMB_DELAYS.map((style, i) => (
              <div key={i} className="bg-line skeleton aspect-square rounded-lg" style={style} />
            ))}
          </div>
        </div>

        <div className="md:pt-2">
          <div className="bg-line skeleton h-2.5 w-24 rounded" />
          <div
            className="bg-line skeleton mt-3 h-7 w-full rounded"
            style={SKELETON_BREADCRUMB_DELAYS[1]}
          />
          <div
            className="bg-line skeleton mt-2 h-7 w-3/4 rounded"
            style={SKELETON_BREADCRUMB_DELAYS[2]}
          />

          <div className="mt-5 flex items-baseline gap-3">
            <div
              className="bg-line skeleton h-6 w-24 rounded"
              style={SKELETON_HERO_THUMB_DELAYS[2]}
            />
            <div
              className="bg-line skeleton h-3 w-20 rounded"
              style={SKELETON_HERO_THUMB_DELAYS[3]}
            />
          </div>

          <div className="mt-7 space-y-2.5">
            {SKELETON_DESC_DELAYS.map((style, i) => (
              <div key={i} className="bg-line skeleton h-3 w-full rounded" style={style} />
            ))}
          </div>

          <div className="mt-8">
            <div
              className="bg-line skeleton h-2.5 w-12 rounded"
              style={{ animationDelay: "0.4s" }}
            />
            <div className="mt-3 flex gap-2.5">
              {SKELETON_SWATCH_DELAYS.map((style, i) => (
                <div key={i} className="bg-line skeleton h-9 w-9 rounded-full" style={style} />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div
              className="bg-line skeleton h-2.5 w-10 rounded"
              style={{ animationDelay: "0.7s" }}
            />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {SKELETON_SIZE_DELAYS.map((style, i) => (
                <div key={i} className="bg-line skeleton h-11 rounded-lg" style={style} />
              ))}
            </div>
          </div>

          <div
            className="bg-line skeleton mt-8 h-12 w-full rounded-xl"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
}
