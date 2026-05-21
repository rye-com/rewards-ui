"use client";

import * as React from "react";
import { AlertCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  VariantDimension,
  VariantOption,
  VariantRevalidationError,
  VariantSelection,
} from "@/components/rye-rewards/types/product-details";

export interface VariantSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant dimensions in render order. */
  dimensions: ReadonlyArray<VariantDimension>;
  /** Map of dimension id to selected option id. */
  selection: VariantSelection;
  onSelectionChange: (dimensionId: string, optionId: string) => void;
  /** Set when a previously-selected variant has just become unavailable. */
  revalidationError?: VariantRevalidationError;
}

export function VariantSelector({
  dimensions,
  selection,
  onSelectionChange,
  revalidationError,
  className,
  ...rest
}: VariantSelectorProps) {
  return (
    <div className={className} {...rest}>
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
    </div>
  );
}

VariantSelector.displayName = "VariantSelector";

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
  const colsClass = gridColsFor(options);
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

function gridColsFor(options: ReadonlyArray<VariantOption>): string {
  if (options.length === 1) {
    return "grid-cols-1";
  }
  if (options.length === 2) {
    return "grid-cols-2";
  }
  const maxLabel = options.reduce((m, o) => Math.max(m, o.label.length), 0);
  if (maxLabel > 16) {
    return "grid-cols-3";
  }
  if (maxLabel > 10) {
    return "grid-cols-4";
  }
  return "grid-cols-5";
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
