import * as React from "react";
import { AlertCircle, ChevronRight, RotateCcw, ShieldCheck, Truck, X } from "lucide-react";

import { cn } from "../lib/utils";
import type { Product } from "../types/product";
import type {
  ProductDetailsData,
  VariantDimension,
  VariantOption,
  VariantRevalidationError,
  VariantSelection,
} from "../types/product-details";

export interface ProductDetailsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  data: ProductDetailsData;
  /** Map of dimension id → selected option id. */
  selection: VariantSelection;
  onSelectionChange: (dimensionId: string, optionId: string) => void;
  /** Which gallery image is in the hero slot. */
  selectedImageIndex?: number;
  onImageSelect?: (index: number) => void;
  /** Set when a previously-selected variant has just become unavailable. */
  revalidationError?: VariantRevalidationError;
  /** Called when the "Redeem with points" CTA is clicked. */
  onRedeem?: () => void;
  /**
   * When set, the CTA renders as a disabled button with this label. Useful for
   * "Pick another size to continue" / "Pick a bonus mini to continue" states.
   */
  redeemDisabledReason?: string;
  /** Breadcrumb trail. The last item renders as plain text, others as links. */
  breadcrumbs?: string[];
  /** Override how the cash price renders. */
  formatPrice?: (price: Product["price"]) => string;
  /** Override how points render. */
  formatPoints?: (points: number) => string;
}

const defaultFormatPrice = (price: Product["price"]): string => {
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

export function ProductDetails({
  data,
  selection,
  onSelectionChange,
  selectedImageIndex = 0,
  onImageSelect,
  revalidationError,
  onRedeem,
  redeemDisabledReason,
  breadcrumbs,
  formatPrice = defaultFormatPrice,
  formatPoints = defaultFormatPoints,
  className,
  ...rest
}: ProductDetailsProps) {
  const { product, gallery, dimensions, meta } = data;
  const isDisabled = redeemDisabledReason !== undefined;

  return (
    <div className={cn("mx-auto max-w-[1200px]", className)} {...rest}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          className="text-ink-3 mb-8 flex items-center gap-2 text-[12px]"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${i}-${crumb}`}>
                {isLast ? (
                  <span className="text-ink-2">{crumb}</span>
                ) : (
                  <a href="#" className="hover:text-ink-1 transition">
                    {crumb}
                  </a>
                )}
                {!isLast && <ChevronRight size={12} strokeWidth={2} />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="grid grid-cols-[1fr_460px] gap-16">
        <Gallery
          images={gallery}
          selectedIndex={selectedImageIndex}
          onSelect={onImageSelect ?? (() => undefined)}
          altBase={product.name}
        />

        <div className="pt-2">
          {product.vendor && (
            <div className="text-ink-3 text-[11px] font-medium tracking-[0.14em] uppercase">
              {product.vendor}
            </div>
          )}
          <h1 className="text-ink-1 mt-2 text-[28px] leading-tight font-semibold -tracking-[0.02em]">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-ink-1 text-[24px] font-semibold -tracking-[0.02em] tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.pointsPrice !== undefined && (
              <>
                <span className="text-ink-3">·</span>
                <span className="text-ink-2 text-[14px] tabular-nums">
                  or {formatPoints(product.pointsPrice)}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-ink-2 mt-6 text-[14px] leading-relaxed">{product.description}</p>
          )}

          {revalidationError && <RevalidationAlert error={revalidationError} />}

          {dimensions.map((dim) => (
            <VariantGroup
              key={dim.id}
              dimension={dim}
              selectedOptionId={selection[dim.id] ?? null}
              onChange={(optionId) => onSelectionChange(dim.id, optionId)}
              hasRevalidationError={revalidationError !== undefined}
            />
          ))}

          <button
            type="button"
            disabled={isDisabled}
            onClick={onRedeem}
            className={cn(
              "mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-[15px] text-[14.5px] font-medium -tracking-[0.02em] transition",
              isDisabled
                ? "bg-line text-ink-3 cursor-not-allowed"
                : "bg-ink-1 text-white hover:bg-[#000]",
            )}
          >
            {isDisabled ? (
              redeemDisabledReason
            ) : (
              <>
                <span>Redeem with points</span>
                <span className="text-white/50">·</span>
                <span className="tabular-nums">{formatPrice(product.price)}</span>
              </>
            )}
          </button>

          {meta && meta.length > 0 && (
            <div className="border-line mt-6 space-y-3 border-t pt-6 text-[12.5px]">
              {meta.map((row, i) => (
                <div key={i} className="text-ink-2 flex items-center gap-2.5">
                  {row.icon === "truck" && (
                    <Truck size={14} strokeWidth={2} className="text-ink-3" />
                  )}
                  {row.icon === "rotate-ccw" && (
                    <RotateCcw size={14} strokeWidth={2} className="text-ink-3" />
                  )}
                  {row.icon === "shield-check" && (
                    <ShieldCheck size={14} strokeWidth={2} className="text-ink-3" />
                  )}
                  <span>{row.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Private helpers
// -------------------------------------------------------------------------

function Gallery({
  images,
  selectedIndex,
  onSelect,
  altBase,
}: {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  altBase: string;
}) {
  const heroImage = images[selectedIndex] ?? images[0];

  return (
    <div>
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
        {images.map((src, i) => (
          <button
            key={`${i}-${src}`}
            type="button"
            onClick={() => onSelect?.(i)}
            aria-label={`View image ${i + 1}${i === selectedIndex ? ", currently selected" : ""}`}
            className={cn(
              "bg-line aspect-square overflow-hidden rounded-lg",
              i === selectedIndex
                ? "ring-ink-1 ring-offset-page ring-2 ring-offset-2"
                : "transition hover:opacity-90",
            )}
          >
            <img src={src} alt={`${altBase} ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function RevalidationAlert({ error }: { error: VariantRevalidationError }) {
  return (
    <div
      role="alert"
      className="bg-error-soft border-error/20 mt-6 flex items-start gap-3 rounded-xl border px-4 py-3.5"
    >
      <AlertCircle size={16} strokeWidth={2} className="text-error mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-error text-[13px] font-semibold -tracking-[0.02em]">
          {error.headline}
        </div>
        {error.detail && (
          <div className="text-ink-2 mt-1 text-[12px] leading-relaxed">{error.detail}</div>
        )}
      </div>
    </div>
  );
}

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

  return (
    <div className="mt-7" role="radiogroup" aria-label={dimension.label}>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-ink-3 text-[12px] font-medium tracking-[0.12em] uppercase">
          {dimension.label}
        </div>
        {showRevalidationFlag && selectedOption ? (
          <div className="text-error flex items-center gap-1.5 text-[12.5px] font-medium">
            <X size={11} strokeWidth={2.25} />
            <span>{selectedOption.label} · unavailable</span>
          </div>
        ) : dimension.hint ? (
          <div className="text-ink-3 text-[11.5px]">{dimension.hint}</div>
        ) : selectedOption ? (
          <div className="text-ink-1 text-[12.5px] font-medium">{selectedOption.label}</div>
        ) : null}
      </div>

      {dimension.style === "swatches" && (
        <SwatchOptions
          options={dimension.options}
          selectedId={selectedOptionId}
          onChange={onChange}
          revalidating={hasRevalidationError}
        />
      )}
      {dimension.style === "grid" && (
        <GridOptions
          options={dimension.options}
          selectedId={selectedOptionId}
          onChange={onChange}
          revalidating={hasRevalidationError}
        />
      )}
      {dimension.style === "cards" && (
        <CardOptions
          options={dimension.options}
          selectedId={selectedOptionId}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function SwatchOptions({
  options,
  selectedId,
  onChange,
  revalidating,
}: {
  options: VariantOption[];
  selectedId: string | null;
  onChange: (optionId: string) => void;
  revalidating: boolean;
}) {
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
              opt.swatchColor === "#E8E1D3" && "border-line-strong border",
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

function GridOptions({
  options,
  selectedId,
  onChange,
  revalidating,
}: {
  options: VariantOption[];
  selectedId: string | null;
  onChange: (optionId: string) => void;
  revalidating: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
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
              "h-11 rounded-lg text-[13px] font-medium tabular-nums transition",
              isSelected && !isUnavailableSelected && "bg-ink-1 text-white",
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

function CardOptions({
  options,
  selectedId,
  onChange,
}: {
  options: VariantOption[];
  selectedId: string | null;
  onChange: (optionId: string) => void;
}) {
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
            <div
              className={cn(
                "text-[12.5px] font-medium -tracking-[0.02em]",
                isUnavailable ? "text-ink-3" : "text-ink-1",
              )}
            >
              {opt.label}
            </div>
            {opt.secondary && (
              <div className={cn("mt-0.5 text-[10.5px]", isSelected ? "text-ink-2" : "text-ink-3")}>
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
// Loading skeleton
// -------------------------------------------------------------------------

export function ProductDetailsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto max-w-[1200px]", className)} aria-hidden="true">
      <div className="mb-8 flex items-center gap-2">
        <div className="bg-line skeleton h-2.5 w-16 rounded" />
        <span className="text-ink-3">·</span>
        <div className="bg-line skeleton h-2.5 w-20 rounded" style={{ animationDelay: "0.05s" }} />
        <span className="text-ink-3">·</span>
        <div className="bg-line skeleton h-2.5 w-32 rounded" style={{ animationDelay: "0.1s" }} />
      </div>

      <div className="grid grid-cols-[1fr_460px] gap-16">
        <div>
          <div className="bg-line skeleton mb-3 aspect-[4/5] rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[0.05, 0.1, 0.15, 0.2].map((delay) => (
              <div
                key={delay}
                className="bg-line skeleton aspect-square rounded-lg"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="bg-line skeleton h-2.5 w-24 rounded" />
          <div
            className="bg-line skeleton mt-3 h-7 w-full rounded"
            style={{ animationDelay: "0.05s" }}
          />
          <div
            className="bg-line skeleton mt-2 h-7 w-3/4 rounded"
            style={{ animationDelay: "0.1s" }}
          />

          <div className="mt-5 flex items-baseline gap-3">
            <div
              className="bg-line skeleton h-6 w-24 rounded"
              style={{ animationDelay: "0.15s" }}
            />
            <div className="bg-line skeleton h-3 w-20 rounded" style={{ animationDelay: "0.2s" }} />
          </div>

          <div className="mt-7 space-y-2.5">
            {[0.25, 0.3, 0.35].map((delay) => (
              <div
                key={delay}
                className="bg-line skeleton h-3 w-full rounded"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>

          <div className="mt-8">
            <div
              className="bg-line skeleton h-2.5 w-12 rounded"
              style={{ animationDelay: "0.4s" }}
            />
            <div className="mt-3 flex gap-2.5">
              {[0.45, 0.5, 0.55, 0.6, 0.65].map((delay) => (
                <div
                  key={delay}
                  className="bg-line skeleton h-9 w-9 rounded-full"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div
              className="bg-line skeleton h-2.5 w-10 rounded"
              style={{ animationDelay: "0.7s" }}
            />
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[0.75, 0.8, 0.85, 0.9, 0.95].map((delay) => (
                <div
                  key={delay}
                  className="bg-line skeleton h-11 rounded-lg"
                  style={{ animationDelay: `${delay}s` }}
                />
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
