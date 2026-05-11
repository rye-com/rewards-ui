import * as React from "react";
import {
  AlertCircle,
  ChevronLeft,
  Loader2,
  PauseCircle,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { cn } from "../lib/utils";
import type { Money } from "../types/product";

// -------------------------------------------------------------------------
// Root + Header + Alert
// -------------------------------------------------------------------------

export interface PaymentSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Compound component (per components.build/composition). Partner composes
 * sub-components in the order they want. Root supplies the card chrome.
 */
function PaymentSheet({ children, className, ...rest }: PaymentSheetProps) {
  return (
    <div className={cn("w-full max-w-[520px]", className)} {...rest}>
      <div className="bg-card border-line overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(15,15,15,0.08)]">
        {children}
      </div>
    </div>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  onClose?: () => void;
}

function Header({ title, subtitle, onBack, onClose }: HeaderProps) {
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
          <div className="text-ink-1 text-[15px] leading-tight font-medium -tracking-[0.02em]">
            {title}
          </div>
          {subtitle && (
            <div className="text-ink-3 mt-0.5 text-[12px] leading-tight">{subtitle}</div>
          )}
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

interface AlertProps {
  tone: "error" | "amber";
  title: string;
  children?: React.ReactNode;
}

/** Inline error/warning banner shown directly under the header. */
function Alert({ tone, title, children }: AlertProps) {
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
        <div
          className={cn(
            "text-[13px] font-semibold -tracking-[0.02em]",
            isError ? "text-error" : "text-amber",
          )}
        >
          {title}
        </div>
        {children && <div className="text-ink-2 mt-1 text-[12px] leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Item summary
// -------------------------------------------------------------------------

interface ItemSummary {
  vendor?: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  price: Money;
  pointsPrice?: number;
}

interface ItemProps {
  item: ItemSummary;
  /** Renders the item dimmed + grayscale for error states. */
  dimmed?: boolean;
  /** Strike-through the price for variant-gone state. */
  strikePrice?: boolean;
  /** Renders an em-dash instead of a price for "unpriceable" state. */
  unpriceable?: boolean;
  formatPrice?: (price: Money) => string;
  formatPoints?: (points: number) => string;
}

const defaultFormatPrice = (price: Money): string => {
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

function Item({
  item,
  dimmed = false,
  strikePrice = false,
  unpriceable = false,
  formatPrice = defaultFormatPrice,
  formatPoints = defaultFormatPoints,
}: ItemProps) {
  return (
    <div className={cn("px-7 py-6", dimmed && "opacity-50")}>
      <div className="flex gap-4">
        <div
          className={cn(
            "bg-line h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-lg",
            dimmed && "grayscale",
          )}
        >
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {item.vendor && (
            <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
              {item.vendor}
            </div>
          )}
          <div className="text-ink-1 mt-1 text-[14.5px] leading-snug font-medium -tracking-[0.02em]">
            {item.name}
          </div>
          {item.subtitle && <div className="text-ink-2 mt-1.5 text-[12.5px]">{item.subtitle}</div>}
        </div>
        <div className="flex-shrink-0 text-right">
          {unpriceable ? (
            <div className="text-ink-3 text-[14px] font-medium tabular-nums">—</div>
          ) : (
            <>
              <div
                className={cn(
                  "text-ink-1 text-[15px] font-semibold -tracking-[0.02em] tabular-nums",
                  strikePrice && "line-through",
                )}
              >
                {formatPrice(item.price)}
              </div>
              {item.pointsPrice !== undefined && !strikePrice && (
                <div className="text-ink-3 mt-1 text-[11.5px] tabular-nums">
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

// -------------------------------------------------------------------------
// Shipping
// -------------------------------------------------------------------------

interface ShippingAddress {
  name: string;
  lines: string[];
}

interface ShippingProps {
  address: ShippingAddress;
  onEdit?: () => void;
  /** When set, renders the "Can't ship to this address" error treatment. */
  shipError?: { headline: string; detail: string };
}

function Shipping({ address, onEdit, shipError }: ShippingProps) {
  return (
    <div className="border-line border-t px-7 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {shipError ? (
            <>
              <div className="text-error flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.12em] uppercase">
                <AlertCircle size={11} strokeWidth={2.25} />
                <span>{shipError.headline}</span>
              </div>
              <div className="text-ink-1 mt-2 text-[13.5px] leading-relaxed line-through opacity-60">
                {address.name}
                {address.lines.map((l, i) => (
                  <React.Fragment key={i}>
                    <br />
                    {l}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-ink-2 mt-2 text-[12px] leading-relaxed">{shipError.detail}</div>
            </>
          ) : (
            <>
              <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
                Ship to
              </div>
              <div className="text-ink-1 mt-1.5 text-[13.5px] leading-relaxed">
                {address.name}
                {address.lines.map((l, i) => (
                  <React.Fragment key={i}>
                    <br />
                    {l}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-ink-1 hover:text-ink-2 border-line-strong hover:border-ink-2 flex-shrink-0 border-b pb-px text-[12px] font-medium transition"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Section (used to wrap PayWithPoints + bg-inset)
// -------------------------------------------------------------------------

function Section({
  children,
  inset = true,
  noBorder = false,
  className,
}: {
  children: React.ReactNode;
  inset?: boolean;
  noBorder?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-7 py-6",
        inset && "bg-inset",
        !noBorder && "border-line border-t",
        className,
      )}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------
// Member benefit callout (discount-passthrough pattern)
// -------------------------------------------------------------------------

interface MemberBenefitProps {
  title: string;
  description?: string;
  /** The discount amount as a negative Money, e.g. { currency: "USD", value: "-13.35" }. */
  amount: Money;
  formatPrice?: (price: Money) => string;
}

function MemberBenefit({
  title,
  description,
  amount,
  formatPrice = defaultFormatPrice,
}: MemberBenefitProps) {
  return (
    <Section>
      <div className="flex items-start gap-3">
        <div className="bg-points-soft flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
          <Sparkles size={16} strokeWidth={2} className="text-points" />
        </div>
        <div className="flex-1">
          <div className="text-ink-1 text-[14px] font-medium -tracking-[0.02em]">{title}</div>
          {description && (
            <div className="text-ink-2 mt-0.5 text-[12.5px] leading-relaxed">{description}</div>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-points text-[15px] font-semibold -tracking-[0.02em] tabular-nums">
            {formatPrice(amount)}
          </div>
        </div>
      </div>
    </Section>
  );
}

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

interface CostBreakdownProps {
  lines: CostLine[];
  total: {
    label: string;
    value: string;
    /** Visual tone for the total. "points" colors it green; "error" shows "Unable to price" red text. */
    tone?: "default" | "points" | "error";
  };
  /** Optional inline error card under the total (e.g. unpriceable explanation). */
  inlineNote?: { tone: "error"; title: string; detail?: string };
}

function CostBreakdown({ lines, total, inlineNote }: CostBreakdownProps) {
  return (
    <div className="border-line border-t px-7 py-5">
      <div className="space-y-3">
        {lines.map((line, i) => (
          <div key={i} className="flex items-baseline justify-between text-[13.5px]">
            <span className={cn(line.tone === "points" ? "text-points font-medium" : "text-ink-2")}>
              {line.label}
              {line.hint && (
                <span
                  className={cn(
                    "ml-1 text-[12px]",
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
        <span className="text-ink-1 text-[14px] font-medium">{total.label}</span>
        <span
          className={cn(
            "text-[22px] font-semibold -tracking-[0.02em] tabular-nums",
            total.tone === "points" && "text-points",
            total.tone === "error" && "text-error text-[14px]",
            (!total.tone || total.tone === "default") && "text-ink-1",
          )}
        >
          {total.value}
        </span>
      </div>
      {inlineNote && (
        <div
          role="alert"
          className="bg-error-soft border-error/15 mt-4 flex items-start gap-2 rounded-lg border px-3.5 py-2.5 text-[12px] leading-relaxed"
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

// -------------------------------------------------------------------------
// Confirm CTA + Actions
// -------------------------------------------------------------------------

interface ConfirmProps {
  label: string;
  /** Appears after a "·" separator, e.g. "$51.68" or "9,668 pts". */
  secondary?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  footerNote?: string;
}

function Confirm({ label, secondary, onClick, disabled, loading, footerNote }: ConfirmProps) {
  const isInactive = disabled || loading;
  return (
    <div className="px-7 pt-3 pb-7">
      <button
        type="button"
        onClick={onClick}
        disabled={isInactive}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-[15px] text-[14.5px] font-medium -tracking-[0.02em] transition",
          isInactive
            ? "bg-line text-ink-3 cursor-not-allowed"
            : "bg-ink-1 text-white hover:bg-[#000]",
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
                <span className={cn(disabled ? "text-ink-3" : "text-white/50")}>·</span>
                <span className="tabular-nums">{secondary}</span>
              </>
            )}
          </>
        )}
      </button>
      {footerNote && (
        <div className="text-ink-3 mt-3.5 text-center text-[11px] leading-relaxed">
          {footerNote}
        </div>
      )}
    </div>
  );
}

interface ActionsProps {
  primary: { label: string; onClick?: () => void; icon?: "rotate-ccw" | "arrow-right" };
  secondary: { label: string; onClick?: () => void; disabled?: boolean };
}

/** Two-button row for error states (e.g. "Try again" + "Confirm"). */
function Actions({ primary, secondary }: ActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-7 pt-5 pb-7">
      <button
        type="button"
        onClick={secondary.onClick}
        disabled={secondary.disabled}
        className={cn(
          "h-12 rounded-xl text-[13.5px] font-medium transition",
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
        className="bg-ink-1 flex h-12 items-center justify-center gap-2 rounded-xl text-[13.5px] font-medium text-white transition hover:bg-[#000]"
      >
        {primary.icon === "rotate-ccw" && <RotateCcw size={13} strokeWidth={2.25} />}
        <span>{primary.label}</span>
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------
// Skeleton (loading state)
// -------------------------------------------------------------------------

function Skeleton() {
  return (
    <PaymentSheet aria-hidden="true">
      <div className="border-line flex items-center justify-between border-b px-7 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="text-ink-2 -ml-1 p-1">
            <ChevronLeft size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="text-ink-1 text-[15px] leading-tight font-medium -tracking-[0.02em]">
              Confirm redemption
            </div>
            <div className="text-ink-3 mt-0.5 inline-flex items-center gap-1.5 text-[12px] leading-tight">
              <Loader2 size={11} strokeWidth={2.25} className="animate-spin" />
              <span>Getting offer details</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-7 py-6">
        <div className="flex gap-4">
          <div className="bg-line skeleton h-[72px] w-[72px] rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div
              className="bg-line skeleton h-2.5 w-16 rounded"
              style={{ animationDelay: "0.05s" }}
            />
            <div
              className="bg-line skeleton h-3.5 w-full rounded"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="bg-line skeleton h-3.5 w-4/5 rounded"
              style={{ animationDelay: "0.15s" }}
            />
            <div
              className="bg-line skeleton mt-3 h-3 w-1/3 rounded"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          <div className="flex-shrink-0 space-y-2 text-right">
            <div
              className="bg-line skeleton ml-auto h-4 w-16 rounded"
              style={{ animationDelay: "0.25s" }}
            />
            <div
              className="bg-line skeleton ml-auto h-2.5 w-20 rounded"
              style={{ animationDelay: "0.3s" }}
            />
          </div>
        </div>
      </div>
      <div className="border-line border-t px-7 py-5">
        <div className="space-y-2">
          <div
            className="bg-line skeleton h-2.5 w-12 rounded"
            style={{ animationDelay: "0.35s" }}
          />
          <div className="bg-line skeleton h-3 w-3/5 rounded" style={{ animationDelay: "0.4s" }} />
          <div className="bg-line skeleton h-3 w-1/2 rounded" style={{ animationDelay: "0.45s" }} />
          <div className="bg-line skeleton h-3 w-2/5 rounded" style={{ animationDelay: "0.5s" }} />
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
        <div
          className="bg-line skeleton h-[3px] rounded-full"
          style={{ animationDelay: "0.75s" }}
        />
      </div>
      <div className="border-line space-y-3 border-t px-7 py-5">
        {[0.95, 1.05, 1.15].map((delay) => (
          <div key={delay} className="flex justify-between">
            <div
              className="bg-line skeleton h-3 w-24 rounded"
              style={{ animationDelay: `${delay}s` }}
            />
            <div
              className="bg-line skeleton h-3 w-12 rounded"
              style={{ animationDelay: `${delay + 0.05}s` }}
            />
          </div>
        ))}
      </div>
      <div className="px-7 pt-3 pb-7">
        <button
          disabled
          className="bg-line text-ink-3 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl py-[15px] text-[14.5px] font-medium"
        >
          <Loader2 size={14} strokeWidth={2.25} className="animate-spin" />
          <span>Calculating…</span>
        </button>
      </div>
    </PaymentSheet>
  );
}

// -------------------------------------------------------------------------
// Compound exports
// -------------------------------------------------------------------------

PaymentSheet.Header = Header;
PaymentSheet.Alert = Alert;
PaymentSheet.Item = Item;
PaymentSheet.Shipping = Shipping;
PaymentSheet.Section = Section;
PaymentSheet.MemberBenefit = MemberBenefit;
PaymentSheet.CostBreakdown = CostBreakdown;
PaymentSheet.Confirm = Confirm;
PaymentSheet.Actions = Actions;
PaymentSheet.Skeleton = Skeleton;

export { PaymentSheet };
