"use client";

/**
 * `<OrderTracking />` is a compound component covering every state in the
 * post-purchase lifecycle: `placed`, `processing`, `shipped`, `out-for-delivery`,
 * `delivered`, `cancelled`, `refunded`, and `stuck-under-investigation`.
 *
 * Partners compose the root with the sub-components they need per state:
 *
 * ```tsx
 * <OrderTracking>
 *   <OrderTracking.Header orderId="#RW-123" pill={...} />
 *   <OrderTracking.StatusCard ... />
 *   <OrderTracking.Timeline steps={...} />
 *   <OrderTracking.Item ... />
 *   <OrderTracking.ActionsCard ... />
 * </OrderTracking>
 * ```
 *
 * All state-machine logic, fetching, and persistence is the partner's; this
 * component is presentation-only.
 */

import * as React from "react";
import { AlertCircle, ArrowRight, Check, Clock, Info, RotateCcw, Truck, X } from "lucide-react";

import { formatMoney, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Money } from "../types/product";

// -------------------------------------------------------------------------
// Root
// -------------------------------------------------------------------------

export type OrderTrackingRootProps = React.HTMLAttributes<HTMLDivElement>;

function OrderTracking({ children, className, ...rest }: OrderTrackingRootProps) {
  return (
    <div className={cn("mx-auto max-w-3xl", className)} {...rest}>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Header (order # + date + status pill)
// -------------------------------------------------------------------------

export type StatusPillTone = "active" | "complete" | "cancelled" | "amber";

export interface StatusPill {
  label: string;
  tone: StatusPillTone;
  /** Animated dot. Use on in-flight states like `processing`, `shipped`. */
  pulse?: boolean;
  /** Static icon. Use on terminal states like `delivered`, `cancelled`. */
  icon?: "check" | "x";
}

export interface OrderTrackingHeaderProps {
  /** Order identifier, e.g. "#RW-3CCF7768". */
  orderId: string;
  /** Human-readable timestamp shown next to the ID, e.g. "Placed May 8, 2:14 PM". */
  placedLabel?: string;
  /** Status pill shown top-right. State machine usually drives `tone` + `label`. */
  pill: StatusPill;
}

function Header({ orderId, placedLabel, pill }: OrderTrackingHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">Order</div>
        <div className="mt-1.5 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
          <span className="text-ink-1 text-xl font-semibold tabular-nums">{orderId}</span>
          {placedLabel && <span className="text-ink-2 text-sm">{placedLabel}</span>}
        </div>
      </div>
      <div className="flex-shrink-0">
        <StatusPillView {...pill} />
      </div>
    </div>
  );
}

function StatusPillView({ label, tone, pulse, icon }: StatusPill) {
  const styles =
    tone === "active" || tone === "complete"
      ? "bg-points-soft text-points"
      : tone === "amber"
        ? "bg-amber-soft text-amber border border-amber-line"
        : "bg-line text-ink-2";
  return (
    <div
      className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5", styles)}
      role="status"
      aria-label={`Order status: ${label}`}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
              tone === "amber" ? "bg-amber" : "bg-points",
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2 w-2 rounded-full",
              tone === "amber" ? "bg-amber" : "bg-points",
            )}
          />
        </span>
      ) : icon === "check" ? (
        <Check size={13} strokeWidth={2.5} aria-hidden="true" />
      ) : icon === "x" ? (
        <X size={11} strokeWidth={2.5} aria-hidden="true" />
      ) : null}
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

// -------------------------------------------------------------------------
// Card primitive
// -------------------------------------------------------------------------

function Card({
  children,
  className,
  tone,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "amber" }) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-7 shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(15,15,15,0.06)]",
        tone === "amber" ? "border-amber-line border" : "border-line border",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------
// StatusCard: primary status block for most states
// -------------------------------------------------------------------------

export interface OrderTrackingStatusCardProps {
  /** Small uppercase label above the title, e.g. "Order placed", "Arriving today". */
  eyebrow: string;
  /** Primary headline for the current state. */
  title: string;
  /** Supporting copy below the title. */
  description?: string;
  /** Inline status rows shown below the description (carrier, ETA, etc.). */
  meta?: Array<{ icon?: "clock" | "truck"; text: React.ReactNode }>;
  /** Optional product thumbnail rendered top-right. */
  image?: { url?: string; alt?: string };
  /** Item count caption rendered under the thumbnail. */
  itemCount?: number;
  /** Apply the amber/warning border style for stuck or delayed states. */
  tone?: "default" | "amber";
}

function StatusCard({
  eyebrow,
  title,
  description,
  meta,
  image,
  itemCount,
  tone,
}: OrderTrackingStatusCardProps) {
  return (
    <Card {...(tone === "amber" ? { tone: "amber" as const } : {})}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">{eyebrow}</div>
          <div className="text-ink-1 mt-1.5 text-2xl leading-tight font-semibold">{title}</div>
          {description && (
            <div className="text-ink-2 mt-2 text-sm leading-relaxed">{description}</div>
          )}
          {meta && meta.length > 0 && (
            <div className="mt-5 space-y-2">
              {meta.map((row, i) => (
                <div key={i} className="text-ink-2 flex items-center gap-2 text-sm">
                  {row.icon === "clock" && (
                    <Clock size={14} strokeWidth={2} className="text-ink-3" />
                  )}
                  {row.icon === "truck" && (
                    <Truck size={14} strokeWidth={2} className="text-ink-3" />
                  )}
                  <span>{row.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="flex-shrink-0 text-right">
            <div className="bg-line h-24 w-24 overflow-hidden rounded-xl">
              {image.url && (
                <img
                  src={image.url}
                  alt={image.alt ?? "Order item"}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {itemCount !== undefined && (
              <div className="text-ink-3 mt-2 text-xs">
                {itemCount === 1 ? "1 item" : `${itemCount} items`}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// InvestigationCard: special status block for stuck state
// -------------------------------------------------------------------------

export interface OrderTrackingInvestigationCardProps {
  /** Small uppercase label, typically "Under investigation". */
  eyebrow: string;
  /** Reassuring headline like "We're looking into your order". */
  title: string;
  /** Plain-language explanation of why the package is stuck. */
  description: string;
  /** Last carrier scan we have on file. */
  lastSeen: { location: string; timestamp: string };
  /** Original ETA + an optional "X days past due" callout. */
  originalEta: { date: string; pastDue?: string };
}

function InvestigationCard({
  eyebrow,
  title,
  description,
  lastSeen,
  originalEta,
}: OrderTrackingInvestigationCardProps) {
  return (
    <Card
      tone="amber"
      className="shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(181,134,11,0.10)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className="bg-amber-soft flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
          <Clock size={18} strokeWidth={2} className="text-amber" />
        </div>
        <div className="flex-1">
          <div className="text-amber text-xs font-semibold tracking-widest uppercase">
            {eyebrow}
          </div>
          <div className="text-ink-1 mt-1.5 text-2xl leading-tight font-semibold">{title}</div>
          <div className="text-ink-2 mt-2 text-sm leading-relaxed">{description}</div>
        </div>
      </div>
      <div className="border-line mt-6 grid grid-cols-2 gap-6 border-t pt-6">
        <div>
          <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">Last seen</div>
          <div className="text-ink-1 mt-1.5 text-sm leading-relaxed">{lastSeen.location}</div>
          <div className="text-ink-2 mt-0.5 text-xs tabular-nums">{lastSeen.timestamp}</div>
        </div>
        <div>
          <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
            Original ETA
          </div>
          <div className="text-ink-1 mt-1.5 text-sm leading-relaxed">{originalEta.date}</div>
          {originalEta.pastDue && (
            <div className="text-amber mt-0.5 text-xs font-medium">{originalEta.pastDue}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Timeline
// -------------------------------------------------------------------------

export type TimelineStepStatus = "complete" | "current" | "pending" | "cancelled" | "tracking-gap";

export interface TimelineStep {
  /** Human-readable step name, e.g. "Order placed", "Shipped". */
  label: string;
  /** Where this step is in its lifecycle. Drives icon + color. */
  status: TimelineStepStatus;
  /** Optional pill rendered next to the label, e.g. "Now", "Late". */
  badge?: string;
  /** Plain-language detail shown under the label, e.g. "Confirmation sent to your email". */
  description?: string;
  /** Right-aligned timestamp for completed steps. */
  timestamp?: string;
  /** Inset row shown below the step row with the latest carrier update. */
  lastUpdate?: string;
}

export interface OrderTrackingTimelineProps {
  /** Ordered list of timeline steps from earliest to latest. */
  steps: TimelineStep[];
  /** Render the connector line in `ink-1` (used on the delivered/refunded states). */
  emphasized?: boolean;
}

function Timeline({ steps, emphasized }: OrderTrackingTimelineProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-5 text-xs font-medium tracking-widest uppercase">Timeline</div>
      <ol className="relative" aria-label="Order timeline">
        <div
          className={cn(
            "absolute top-3 bottom-3 left-2.75 w-px",
            emphasized ? "bg-ink-1" : "bg-line-strong",
          )}
          aria-hidden="true"
        />
        {steps.map((step, i) => (
          <TimelineStepRow key={i} step={step} isLast={i === steps.length - 1} />
        ))}
      </ol>
    </Card>
  );
}

function TimelineStepRow({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const isCurrent = step.status === "current";
  const isComplete = step.status === "complete";
  const isCancelled = step.status === "cancelled";
  const isStuck = step.status === "tracking-gap";
  const isPending = step.status === "pending";

  let badgeTone: "points" | "amber" = "points";
  if (isStuck) badgeTone = "amber";

  return (
    <li
      className={cn("relative flex items-start gap-4", !isLast && "pb-6")}
      aria-current={isCurrent ? "step" : undefined}
    >
      <div className="relative z-10 flex-shrink-0" aria-hidden="true">
        {isComplete && (
          <div className="bg-ink-1 flex h-5.5 w-5.5 items-center justify-center rounded-full">
            <Check size={12} strokeWidth={3} className="text-page" />
          </div>
        )}
        {isCurrent && (
          <div className="bg-points flex h-5.5 w-5.5 items-center justify-center rounded-full shadow-[0_0_0_4px_rgba(26,110,72,0.15)]">
            {(isLast && step.label === "Delivered") || (step.timestamp && isLast && isComplete) ? (
              <Check size={12} strokeWidth={3} className="text-white" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
        )}
        {isCancelled && (
          <div className="bg-ink-2 flex h-5.5 w-5.5 items-center justify-center rounded-full">
            <X size={11} strokeWidth={3} className="text-page" />
          </div>
        )}
        {isStuck && (
          <div className="bg-amber flex h-5.5 w-5.5 items-center justify-center rounded-full shadow-[0_0_0_4px_rgba(181,134,11,0.15)]">
            <AlertCircle size={11} strokeWidth={2.5} className="text-white" />
          </div>
        )}
        {isPending && (
          <div className="bg-card border-line-strong flex h-5.5 w-5.5 items-center justify-center rounded-full border-2">
            <span className="bg-line-strong h-1.5 w-1.5 rounded-full" />
          </div>
        )}
      </div>
      <div className="-mt-0.5 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex-1">
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                isPending ? "text-ink-3" : isStuck ? "text-amber" : "text-ink-1",
              )}
            >
              <span>{step.label}</span>
              {step.badge && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs font-semibold tracking-widest uppercase",
                    badgeTone === "points"
                      ? "bg-points-soft text-points"
                      : "bg-amber-soft text-amber border-amber-line border",
                  )}
                >
                  {step.badge}
                </span>
              )}
            </div>
            {step.description && (
              <div className={cn("mt-0.5 text-xs", isPending ? "text-ink-3" : "text-ink-2")}>
                {step.description}
              </div>
            )}
          </div>
          {step.timestamp && (
            <div className="text-ink-3 flex-shrink-0 text-xs tabular-nums">{step.timestamp}</div>
          )}
        </div>
        {step.lastUpdate && (
          <div className="bg-inset text-ink-2 mt-3 rounded-lg px-3.5 py-2.5 text-xs leading-relaxed">
            <span className="text-ink-1 font-medium">Last update:</span> {step.lastUpdate}
          </div>
        )}
      </div>
    </li>
  );
}

// -------------------------------------------------------------------------
// Item summary
// -------------------------------------------------------------------------

export interface OrderTrackingItemProps {
  /** Section heading rendered above the row. Defaults to "In this order". */
  sectionLabel?: string;
  /** Brand / vendor name shown above the product name. */
  vendor?: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  price?: Money;
  /** Render "−X applied" line under the price. */
  pointsApplied?: number;
  /** Render "+X" line for points returned on cancel/refund. */
  pointsRefunded?: number;
  /** When set, replaces the price with a green "−$X" line for refunded states. */
  refundedAmount?: Money;
  /** Apply muted styles (grayscale image, gray text) for cancelled / dead variants. */
  dimmed?: boolean;
  /** Strike through the price + name. Used with `dimmed` for unavailable items. */
  strikePrice?: boolean;
}

function Item({
  sectionLabel = "In this order",
  vendor,
  name,
  subtitle,
  imageUrl,
  price,
  pointsApplied,
  pointsRefunded,
  refundedAmount,
  dimmed,
  strikePrice,
}: OrderTrackingItemProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-4 text-xs font-medium tracking-widest uppercase">
        {sectionLabel}
      </div>
      <div className={cn("flex gap-4", dimmed && "opacity-60")}>
        <div
          className={cn(
            "bg-line h-15 w-15 flex-shrink-0 overflow-hidden rounded-lg",
            dimmed && "grayscale",
          )}
        >
          {imageUrl && <img src={imageUrl} alt={name} className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          {vendor && (
            <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">{vendor}</div>
          )}
          <div
            className={cn(
              "mt-0.5 text-sm leading-snug font-medium",
              strikePrice && "line-through",
              dimmed ? "text-ink-3" : "text-ink-1",
            )}
          >
            {name}
          </div>
          {subtitle && (
            <div className={cn("mt-1 text-xs", dimmed ? "text-ink-3" : "text-ink-2")}>
              {subtitle}
            </div>
          )}
        </div>
        {(price ||
          pointsApplied !== undefined ||
          pointsRefunded !== undefined ||
          refundedAmount) && (
          <div className="flex-shrink-0 space-y-1 text-right">
            {refundedAmount ? (
              <div className="text-points text-sm font-semibold tabular-nums">
                −{formatMoney(refundedAmount)}
              </div>
            ) : (
              price && (
                <div
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    strikePrice && "line-through",
                    dimmed ? "text-ink-3" : "text-ink-1",
                  )}
                >
                  {formatMoney(price)}
                </div>
              )
            )}
            {pointsApplied !== undefined && (
              <div className="text-points text-xs tabular-nums">
                −{formatPoints(pointsApplied)} applied
              </div>
            )}
            {pointsRefunded !== undefined && (
              <div className="text-points text-xs tabular-nums">
                +{formatPoints(pointsRefunded)}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// RefundSummary
// -------------------------------------------------------------------------

export interface OrderTrackingRefundSummaryProps {
  /** `compact` renders a card with two rows; `detailed` renders two side-by-side tiles. */
  variant?: "compact" | "detailed";
  /** Cash refund line (back to card). */
  card: { amount: Money; postedLabel?: string };
  /** Points refund line (back to balance). */
  points: { amount: number; postedLabel?: string };
  /** Optional success note rendered at the bottom of the compact variant. */
  note?: string;
  sectionLabel?: string;
}

function RefundSummary({
  variant = "compact",
  card,
  points,
  note,
  sectionLabel = "Refund · complete",
}: OrderTrackingRefundSummaryProps) {
  if (variant === "detailed") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-inset rounded-lg px-4 py-3">
          <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
            Back to card
          </div>
          <div className="text-ink-1 mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(card.amount)}
          </div>
          {card.postedLabel && <div className="text-ink-3 mt-0.5 text-xs">{card.postedLabel}</div>}
        </div>
        <div className="bg-points-soft rounded-lg px-4 py-3">
          <div className="text-points/70 text-xs font-medium tracking-widest uppercase">
            Back to points
          </div>
          <div className="text-points mt-1 text-lg font-semibold tabular-nums">
            +{formatPoints(points.amount)}
          </div>
          {points.postedLabel && (
            <div className="text-points/70 mt-0.5 text-xs">{points.postedLabel}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="text-ink-3 mb-5 text-xs font-medium tracking-widest uppercase">
        {sectionLabel}
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-1 font-medium">Back to your card</span>
          <span className="text-ink-1 font-semibold tabular-nums">{formatMoney(card.amount)}</span>
        </div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-points font-medium">Back to your points</span>
          <span className="text-points font-semibold tabular-nums">
            +{formatPoints(points.amount)}
          </span>
        </div>
      </div>
      {note && (
        <div className="bg-points-soft text-points mt-5 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-xs leading-relaxed">
          <Check size={13} strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
          <span>{note}</span>
        </div>
      )}
    </Card>
  );
}

// -------------------------------------------------------------------------
// ActionsCard: generic cancel / contact / reorder / etc.
// -------------------------------------------------------------------------

export interface OrderTrackingCallout {
  /** Visual tone. Drives background and icon color. */
  tone: "points" | "inset" | "amber";
  icon?: "clock" | "info" | "check";
  title: string;
  description?: string;
}

export interface OrderTrackingAction {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  icon?: "arrow-right" | "rotate-ccw" | "truck";
}

export interface OrderTrackingActionsCardProps {
  /** Small uppercase heading above the callout/actions. */
  title?: string;
  /** Optional informational callout above the button row. */
  callout?: OrderTrackingCallout;
  /** Button row. Typically a primary action + one or two secondary. */
  actions: OrderTrackingAction[];
  /** When more than 2 actions, pass `columns: 3` to render in a 3-column grid. */
  columns?: 2 | 3;
  footer?: React.ReactNode;
}

function ActionsCard({
  title,
  callout,
  actions,
  columns = 2,
  footer,
}: OrderTrackingActionsCardProps) {
  return (
    <Card>
      {title && (
        <div className="text-ink-3 mb-4 text-xs font-medium tracking-widest uppercase">{title}</div>
      )}
      {callout && <Callout {...callout} />}
      <div
        className={cn(
          "grid gap-3",
          callout ? "mt-4" : "",
          columns === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {actions.map((action, i) => (
          <ActionButton key={i} {...action} />
        ))}
      </div>
      {footer && (
        <div className="border-line text-ink-2 mt-5 border-t pt-5 text-xs leading-relaxed">
          {footer}
        </div>
      )}
    </Card>
  );
}

function Callout({ tone, icon, title, description }: OrderTrackingCallout) {
  const styles =
    tone === "points"
      ? "bg-points-soft border border-points/15"
      : tone === "amber"
        ? "bg-amber-soft border-amber-line border"
        : "bg-inset";
  const iconColor =
    tone === "points" ? "text-points" : tone === "amber" ? "text-amber" : "text-ink-3";
  const titleColor =
    tone === "points" ? "text-points" : tone === "amber" ? "text-amber" : "text-ink-1";
  return (
    <div className={cn("flex items-start gap-3 rounded-lg px-4 py-3.5", styles)}>
      {icon === "clock" && (
        <Clock size={16} strokeWidth={2} className={cn("mt-0.5 flex-shrink-0", iconColor)} />
      )}
      {icon === "info" && (
        <Info size={16} strokeWidth={2} className={cn("mt-0.5 flex-shrink-0", iconColor)} />
      )}
      {icon === "check" && (
        <Check size={16} strokeWidth={2} className={cn("mt-0.5 flex-shrink-0", iconColor)} />
      )}
      <div className="flex-1">
        <div className={cn("text-sm font-medium", titleColor)}>{title}</div>
        {description && (
          <div className="text-ink-2 mt-1 text-sm leading-relaxed">{description}</div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  variant = "secondary",
  disabled,
  icon,
}: OrderTrackingAction) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition",
        disabled
          ? "border-line text-ink-3 cursor-not-allowed border"
          : isPrimary
            ? "bg-cta text-cta-fg hover:opacity-90"
            : "border-line-strong text-ink-1 hover:border-ink-1 border",
      )}
    >
      {icon === "rotate-ccw" && <RotateCcw size={13} strokeWidth={2} />}
      {icon === "truck" && <Truck size={13} strokeWidth={2} />}
      <span>{label}</span>
      {icon === "arrow-right" && <ArrowRight size={13} strokeWidth={2.25} />}
    </button>
  );
}

// -------------------------------------------------------------------------
// InvestigationActions. 3-option list shown in the stuck state
// -------------------------------------------------------------------------

export interface InvestigationOption {
  label: string;
  description: string;
  /** Optional pill rendered on the right, e.g. "Recommended". */
  badge?: string;
  onClick?: () => void;
}

export interface OrderTrackingInvestigationActionsProps {
  /** Section heading. Defaults to "What you can do". */
  title?: string;
  options: InvestigationOption[];
}

function InvestigationActions({
  title = "What you can do",
  options,
}: OrderTrackingInvestigationActionsProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-4 text-xs font-medium tracking-widest uppercase">{title}</div>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={opt.onClick}
            className="group border-line-strong hover:border-ink-1 flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition"
          >
            <div className="flex-1">
              <div className="text-ink-1 text-sm font-medium">{opt.label}</div>
              <div className="text-ink-2 mt-1 text-sm leading-relaxed">{opt.description}</div>
            </div>
            {opt.badge ? (
              <span className="text-points bg-points-soft rounded px-2 py-1 text-xs font-semibold tracking-widest uppercase">
                {opt.badge}
              </span>
            ) : (
              <ArrowRight
                size={14}
                strokeWidth={2}
                className="text-ink-3 group-hover:text-ink-1 flex-shrink-0 transition"
              />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// InvestigationProgress. "What we're doing" check-list
// -------------------------------------------------------------------------

export interface InvestigationStep {
  status: "complete" | "current";
  title: string;
  detail: string;
  /** Use `amber` on the active step to draw attention to in-flight work. */
  detailTone?: "muted" | "amber";
}

export interface OrderTrackingInvestigationProgressProps {
  /** Section heading. Defaults to "What we're doing". */
  title?: string;
  steps: InvestigationStep[];
}

function InvestigationProgress({
  title = "What we're doing",
  steps,
}: OrderTrackingInvestigationProgressProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-5 text-xs font-medium tracking-widest uppercase">{title}</div>
      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={cn(
                "mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                step.status === "complete"
                  ? "bg-points"
                  : "bg-amber shadow-[0_0_0_3px_rgba(181,134,11,0.15)]",
              )}
            >
              {step.status === "complete" ? (
                <Check size={11} strokeWidth={3} className="text-white" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-ink-1 text-sm font-medium">{step.title}</div>
              <div
                className={cn(
                  "mt-0.5 text-xs",
                  step.detailTone === "amber" ? "text-amber font-medium" : "text-ink-2",
                )}
              >
                {step.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// -------------------------------------------------------------------------
// Compound exports
// -------------------------------------------------------------------------

OrderTracking.Header = Header;
OrderTracking.StatusCard = StatusCard;
OrderTracking.InvestigationCard = InvestigationCard;
OrderTracking.Timeline = Timeline;
OrderTracking.Item = Item;
OrderTracking.RefundSummary = RefundSummary;
OrderTracking.ActionsCard = ActionsCard;
OrderTracking.InvestigationActions = InvestigationActions;
OrderTracking.InvestigationProgress = InvestigationProgress;

export { OrderTracking };
