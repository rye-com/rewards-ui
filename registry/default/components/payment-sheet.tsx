"use client";

import * as React from "react";
import { AlertCircle, ChevronLeft, Loader2, PauseCircle, Sparkles, X } from "lucide-react";
import type { Buyer } from "checkout-intents/resources";

import { formatMoney, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Money } from "@/components/rye-rewards/types/product";

// -------------------------------------------------------------------------
// Root + Header + Alert
// -------------------------------------------------------------------------

export interface PaymentSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Compound component. Partners compose sub-components in any order; the
 * root supplies the card chrome.
 */
function PaymentSheetRoot({ children, className, ...rest }: PaymentSheetProps) {
  return (
    <div className={cn("w-full max-w-lg", className)} {...rest}>
      <div className="bg-card border-line overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(15,15,15,0.08)]">
        {children}
      </div>
    </div>
  );
}

PaymentSheetRoot.displayName = "PaymentSheet";

export interface PaymentSheetHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
}

function PaymentSheetHeader({ title, subtitle, onBack, onClose }: PaymentSheetHeaderProps) {
  return (
    <div className="border-line flex items-center justify-between border-b px-7 pt-6 pb-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="text-ink-2 hover:text-ink-1 -ml-1 p-1 transition"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
        )}
        <div>
          <div className="text-ink-1 text-base leading-tight font-medium">{title}</div>
          {subtitle && <div className="text-ink-3 mt-0.5 text-xs leading-tight">{subtitle}</div>}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-ink-3 hover:text-ink-1 p-1 transition"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

PaymentSheetHeader.displayName = "PaymentSheet.Header";

export interface PaymentSheetAlertProps {
  tone: "error" | "amber";
  title: string;
  children?: React.ReactNode;
}

/** Inline error/warning banner shown directly under the header. */
function PaymentSheetAlert({ tone, title, children }: PaymentSheetAlertProps) {
  const isError = tone === "error";
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 border-b px-7 py-5",
        isError ? "bg-error-soft border-error/15" : "bg-amber-soft border-amber/15",
      )}
    >
      {isError ? (
        <AlertCircle size={16} strokeWidth={2} className="text-error mt-0.5 flex-shrink-0" />
      ) : (
        <PauseCircle size={16} strokeWidth={2} className="text-amber mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className={cn("text-sm font-semibold", isError ? "text-error" : "text-amber")}>
          {title}
        </div>
        {children && <div className="text-ink-2 mt-1 text-xs leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

PaymentSheetAlert.displayName = "PaymentSheet.Alert";

// -------------------------------------------------------------------------
// Item summary
// -------------------------------------------------------------------------

export interface PaymentSheetItemSummary {
  vendor?: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  price: Money;
  pointsPrice?: number;
}

export interface PaymentSheetItemProps {
  item: PaymentSheetItemSummary;
  /** Renders the item dimmed + grayscale for error states. */
  dimmed?: boolean;
  /** Strike-through the price for variant-gone state. */
  strikePrice?: boolean;
  /** Renders a placeholder instead of a price for the unpriceable state. */
  unpriceable?: boolean;
  /** Placeholder rendered when `unpriceable` is true. Defaults to "n/a". */
  unpriceableLabel?: React.ReactNode;
}

function PaymentSheetItem({
  item,
  dimmed = false,
  strikePrice = false,
  unpriceable = false,
  unpriceableLabel = "n/a",
}: PaymentSheetItemProps) {
  return (
    <div className={cn("px-7 py-6", dimmed && "opacity-50")}>
      <div className="flex gap-4">
        <div
          className={cn(
            "bg-line h-18 w-18 flex-shrink-0 overflow-hidden rounded-lg",
            dimmed && "grayscale",
          )}
        >
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {item.vendor && (
            <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
              {item.vendor}
            </div>
          )}
          <div className="text-ink-1 mt-1 text-sm leading-snug font-medium">{item.name}</div>
          {item.subtitle && <div className="text-ink-2 mt-1.5 text-xs">{item.subtitle}</div>}
        </div>
        <div className="flex-shrink-0 text-right">
          {unpriceable ? (
            <div className="text-ink-3 text-sm font-medium tabular-nums">{unpriceableLabel}</div>
          ) : (
            <>
              <div
                className={cn(
                  "text-ink-1 text-base font-semibold tabular-nums",
                  strikePrice && "line-through",
                )}
              >
                {formatMoney(item.price)}
              </div>
              {item.pointsPrice !== undefined && !strikePrice && (
                <div className="text-ink-3 mt-1 text-xs tabular-nums">
                  or {formatPoints(item.pointsPrice)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

PaymentSheetItem.displayName = "PaymentSheet.Item";

// -------------------------------------------------------------------------
// Shipping
// -------------------------------------------------------------------------

export interface PaymentSheetShippingProps {
  /**
   * Recipient + address. Uses the `Buyer` shape from `checkout-intents`
   * directly so partners pass intent responses through without remapping.
   */
  buyer: Buyer;
  /** Label rendered above the address. Defaults to "Ship to". */
  label?: React.ReactNode;
  /** Edit-button copy. Defaults to "Edit". */
  editLabel?: React.ReactNode;
  onEdit?: () => void;
  /** When set, renders the "Can't ship to this address" error treatment. */
  shipError?: { headline: string; detail: string };
}

function PaymentSheetShipping({
  buyer,
  label = "Ship to",
  editLabel = "Edit",
  onEdit,
  shipError,
}: PaymentSheetShippingProps) {
  const addressBlock = (
    <>
      {buyer.firstName} {buyer.lastName}
      <br />
      {buyer.address1}
      {buyer.address2 ? (
        <>
          <br />
          {buyer.address2}
        </>
      ) : null}
      <br />
      {buyer.city}, {buyer.province} {buyer.postalCode}
      <br />
      {buyer.country}
    </>
  );
  return (
    <div className="border-line border-t px-7 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {shipError ? (
            <>
              <div className="text-error flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase">
                <AlertCircle size={11} strokeWidth={2.25} />
                <span>{shipError.headline}</span>
              </div>
              <div className="text-ink-1 mt-2 text-sm leading-relaxed line-through opacity-60">
                {addressBlock}
              </div>
              <div className="text-ink-2 mt-2 text-xs leading-relaxed">{shipError.detail}</div>
            </>
          ) : (
            <>
              <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
                {label}
              </div>
              <div className="text-ink-1 mt-1.5 text-sm leading-relaxed">{addressBlock}</div>
            </>
          )}
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="text-ink-1 hover:text-ink-2 border-line-strong hover:border-ink-2 flex-shrink-0 border-b pb-px text-xs font-medium transition"
          >
            {editLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

PaymentSheetShipping.displayName = "PaymentSheet.Shipping";

// -------------------------------------------------------------------------
// Section (used to wrap PayWithPoints + bg-inset)
// -------------------------------------------------------------------------

export interface PaymentSheetSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true (default), adds the inset background tint. */
  inset?: boolean;
  /** When true, skips the top border (use when stacking adjacent sections). */
  noBorder?: boolean;
}

function PaymentSheetSection({
  inset = true,
  noBorder = false,
  className,
  children,
  ...rest
}: PaymentSheetSectionProps) {
  return (
    <div
      className={cn(
        "px-7 py-6",
        inset && "bg-inset",
        !noBorder && "border-line border-t",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

PaymentSheetSection.displayName = "PaymentSheet.Section";

// -------------------------------------------------------------------------
// Member benefit callout (discount-passthrough pattern)
// -------------------------------------------------------------------------

export interface PaymentSheetMemberBenefitProps {
  title: string;
  description?: string;
  /** The discount amount as a negative `Money`, e.g. `{ currency: "USD", value: "-13.35" }`. */
  amount: Money;
}

function PaymentSheetMemberBenefit({ title, description, amount }: PaymentSheetMemberBenefitProps) {
  return (
    <PaymentSheetSection>
      <div className="flex items-start gap-3">
        <div className="bg-points-soft flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
          <Sparkles size={16} strokeWidth={2} className="text-points" />
        </div>
        <div className="flex-1">
          <div className="text-ink-1 text-sm font-medium">{title}</div>
          {description && (
            <div className="text-ink-2 mt-0.5 text-xs leading-relaxed">{description}</div>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-points text-base font-semibold tabular-nums">
            {formatMoney(amount)}
          </div>
        </div>
      </div>
    </PaymentSheetSection>
  );
}

PaymentSheetMemberBenefit.displayName = "PaymentSheet.MemberBenefit";

// -------------------------------------------------------------------------
// Cost breakdown
// -------------------------------------------------------------------------

export interface CostLine {
  label: string;
  hint?: string;
  value: string;
  /** Color-code the line. Defaults to neutral. */
  tone?: "default" | "points" | "muted";
}

export interface PaymentSheetCostBreakdownProps {
  lines: CostLine[];
  total: {
    label: string;
    value: string;
    /** Visual tone for the total. `points` colors it green; `error` shows the value in red. */
    tone?: "default" | "points" | "error";
  };
  /** Optional inline error card under the total (e.g. unpriceable explanation). */
  inlineNote?: { tone: "error"; title: string; detail?: string };
}

function PaymentSheetCostBreakdown({ lines, total, inlineNote }: PaymentSheetCostBreakdownProps) {
  return (
    <div className="border-line border-t px-7 py-5">
      <div className="space-y-3">
        {lines.map((line, i) => (
          <div key={i} className="flex items-baseline justify-between text-sm">
            <span className={cn(line.tone === "points" ? "text-points font-medium" : "text-ink-2")}>
              {line.label}
              {line.hint && (
                <span
                  className={cn(
                    "ml-1 text-xs",
                    line.tone === "points" ? "text-points/70 font-normal" : "text-ink-3",
                  )}
                >
                  {line.hint}
                </span>
              )}
            </span>
            <span
              className={cn(
                "tabular-nums",
                line.tone === "points" ? "text-points font-medium" : "text-ink-1",
              )}
            >
              {line.value}
            </span>
          </div>
        ))}
      </div>
      <div className="border-line mt-5 flex items-baseline justify-between border-t pt-4">
        <span className="text-ink-1 text-sm font-medium">{total.label}</span>
        <span
          className={cn(
            "text-2xl font-semibold tabular-nums",
            total.tone === "points" && "text-points",
            total.tone === "error" && "text-error text-sm",
            (!total.tone || total.tone === "default") && "text-ink-1",
          )}
        >
          {total.value}
        </span>
      </div>
      {inlineNote && (
        <div
          role="alert"
          className="bg-error-soft border-error/15 mt-4 flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed"
        >
          <AlertCircle size={13} strokeWidth={2} className="text-error mt-0.5 flex-shrink-0" />
          <span className="text-ink-2">
            <span className="text-error font-semibold">{inlineNote.title}</span>
            {inlineNote.detail && ` ${inlineNote.detail}`}
          </span>
        </div>
      )}
    </div>
  );
}

PaymentSheetCostBreakdown.displayName = "PaymentSheet.CostBreakdown";

// -------------------------------------------------------------------------
// Confirm CTA + Actions
// -------------------------------------------------------------------------

export interface PaymentSheetConfirmProps {
  label: string;
  /** Appears after a separator, e.g. "$51.68" or "9,668 pts". */
  secondary?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  footerNote?: string;
}

function PaymentSheetConfirm({
  label,
  secondary,
  onClick,
  disabled,
  loading,
  footerNote,
}: PaymentSheetConfirmProps) {
  const isInactive = disabled || loading;
  return (
    <div className="px-7 pt-3 pb-7">
      <button
        type="button"
        onClick={onClick}
        disabled={isInactive}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-medium transition",
          isInactive
            ? "bg-line text-ink-3 cursor-not-allowed"
            : "bg-cta text-cta-fg hover:opacity-90",
        )}
      >
        {loading ? (
          <>
            <Loader2 size={14} strokeWidth={2.25} className="animate-spin" />
            <span>{label}</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            {secondary && (
              <>
                <span className={cn(disabled ? "text-ink-3" : "text-page/50")}>·</span>
                <span className="tabular-nums">{secondary}</span>
              </>
            )}
          </>
        )}
      </button>
      {footerNote && (
        <div className="text-ink-3 mt-3.5 text-center text-xs leading-relaxed">{footerNote}</div>
      )}
    </div>
  );
}

PaymentSheetConfirm.displayName = "PaymentSheet.Confirm";

export interface PaymentSheetActionsProps {
  primary: { label: string; onClick?: () => void; icon?: React.ReactNode };
  secondary: { label: string; onClick?: () => void; disabled?: boolean };
}

/** Two-button row for error states (e.g. "Try again" + "Confirm"). */
function PaymentSheetActions({ primary, secondary }: PaymentSheetActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-7 pt-5 pb-7">
      <button
        type="button"
        onClick={secondary.onClick}
        disabled={secondary.disabled}
        className={cn(
          "h-12 rounded-xl text-sm font-medium transition",
          secondary.disabled
            ? "bg-line text-ink-3 cursor-not-allowed"
            : "border-line-strong text-ink-1 hover:border-ink-1 border",
        )}
      >
        {secondary.label}
      </button>
      <button
        type="button"
        onClick={primary.onClick}
        className="bg-cta text-cta-fg flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-medium transition hover:opacity-90"
      >
        {primary.icon}
        <span>{primary.label}</span>
      </button>
    </div>
  );
}

PaymentSheetActions.displayName = "PaymentSheet.Actions";

// -------------------------------------------------------------------------
// Skeleton (loading state)
// -------------------------------------------------------------------------

const SKELETON_ITEM_DELAYS = [
  { animationDelay: "0.05s" },
  { animationDelay: "0.1s" },
  { animationDelay: "0.15s" },
  { animationDelay: "0.2s" },
  { animationDelay: "0.25s" },
  { animationDelay: "0.3s" },
] as const;

const SKELETON_SHIPPING_DELAYS = [
  { animationDelay: "0.35s" },
  { animationDelay: "0.4s" },
  { animationDelay: "0.45s" },
  { animationDelay: "0.5s" },
] as const;

const SKELETON_COSTS_DELAYS = [
  { animationDelay: "0.95s" },
  { animationDelay: "1.05s" },
  { animationDelay: "1.15s" },
] as const;

export interface PaymentSheetSkeletonProps {
  /** Header title shown while loading. Defaults to "Loading…". */
  title?: React.ReactNode;
  /** Subtitle text shown next to a spinner under the title. */
  subtitle?: React.ReactNode;
  /** CTA copy. Defaults to "Loading…". */
  ctaLabel?: React.ReactNode;
}

function PaymentSheetSkeleton({
  title = "Loading…",
  subtitle = "Getting offer details",
  ctaLabel = "Loading…",
}: PaymentSheetSkeletonProps) {
  return (
    <PaymentSheetRoot aria-hidden="true">
      <div className="border-line flex items-center justify-between border-b px-7 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="text-ink-2 -ml-1 p-1">
            <ChevronLeft size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="text-ink-1 text-base leading-tight font-medium">{title}</div>
            <div className="text-ink-3 mt-0.5 inline-flex items-center gap-1.5 text-xs leading-tight">
              <Loader2 size={11} strokeWidth={2.25} className="animate-spin" />
              <span>{subtitle}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-7 py-6">
        <div className="flex gap-4">
          <div className="bg-line skeleton h-18 w-18 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-line skeleton h-2.5 w-16 rounded" style={SKELETON_ITEM_DELAYS[0]} />
            <div
              className="bg-line skeleton h-3.5 w-full rounded"
              style={SKELETON_ITEM_DELAYS[1]}
            />
            <div className="bg-line skeleton h-3.5 w-4/5 rounded" style={SKELETON_ITEM_DELAYS[2]} />
            <div
              className="bg-line skeleton mt-3 h-3 w-1/3 rounded"
              style={SKELETON_ITEM_DELAYS[3]}
            />
          </div>
          <div className="flex-shrink-0 space-y-2 text-right">
            <div
              className="bg-line skeleton ml-auto h-4 w-16 rounded"
              style={SKELETON_ITEM_DELAYS[4]}
            />
            <div
              className="bg-line skeleton ml-auto h-2.5 w-20 rounded"
              style={SKELETON_ITEM_DELAYS[5]}
            />
          </div>
        </div>
      </div>
      <div className="border-line border-t px-7 py-5">
        <div className="space-y-2">
          {SKELETON_SHIPPING_DELAYS.map((style, i) => (
            <div
              key={i}
              className={cn("bg-line skeleton h-3 rounded", i === 0 ? "h-2.5 w-12" : "w-3/5")}
              style={style}
            />
          ))}
        </div>
      </div>
      <div className="bg-inset border-line space-y-3 border-t px-7 py-6">
        <div className="flex items-start justify-between">
          <div className="bg-line skeleton h-3.5 w-24 rounded" style={{ animationDelay: "0.6s" }} />
          <div
            className="bg-line skeleton h-7 w-24 rounded-full"
            style={{ animationDelay: "0.7s" }}
          />
        </div>
        <div className="bg-line skeleton h-0.75 rounded-full" style={{ animationDelay: "0.75s" }} />
      </div>
      <div className="border-line space-y-3 border-t px-7 py-5">
        {SKELETON_COSTS_DELAYS.map((style, i) => (
          <div key={i} className="flex justify-between">
            <div className="bg-line skeleton h-3 w-24 rounded" style={style} />
            <div
              className="bg-line skeleton h-3 w-12 rounded"
              style={{ animationDelay: `${parseFloat(style.animationDelay) + 0.05}s` }}
            />
          </div>
        ))}
      </div>
      <div className="px-7 pt-3 pb-7">
        <button
          disabled
          className="bg-line text-ink-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl py-4 text-sm font-medium"
        >
          <Loader2 size={14} strokeWidth={2.25} className="animate-spin" />
          <span>{ctaLabel}</span>
        </button>
      </div>
    </PaymentSheetRoot>
  );
}

PaymentSheetSkeleton.displayName = "PaymentSheet.Skeleton";

// -------------------------------------------------------------------------
// Compound exports
// -------------------------------------------------------------------------

export const PaymentSheet = Object.assign(PaymentSheetRoot, {
  Header: PaymentSheetHeader,
  Alert: PaymentSheetAlert,
  Item: PaymentSheetItem,
  Shipping: PaymentSheetShipping,
  Section: PaymentSheetSection,
  MemberBenefit: PaymentSheetMemberBenefit,
  CostBreakdown: PaymentSheetCostBreakdown,
  Confirm: PaymentSheetConfirm,
  Actions: PaymentSheetActions,
  Skeleton: PaymentSheetSkeleton,
});
