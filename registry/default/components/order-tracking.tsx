"use client";

import * as React from "react";
import { AlertCircle, ArrowRight, Check, Clock, Info, RotateCcw, Truck, X } from "lucide-react";

import { cn } from "../lib/utils";
import type { Money } from "../types/product";

// -------------------------------------------------------------------------
// Root
// -------------------------------------------------------------------------

function OrderTracking({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto max-w-[720px]", className)} {...rest}>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Header (order # + date + status pill)
// -------------------------------------------------------------------------

export type StatusPillTone = "active" | "complete" | "cancelled" | "amber";

interface HeaderProps {
  orderId: string;
  placedLabel?: string;
  pill: { label: string; tone: StatusPillTone; pulse?: boolean; icon?: "check" | "x" };
}

function Header({ orderId, placedLabel, pill }: HeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.14em] uppercase">
          Order
        </div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <span className="text-ink-1 text-[20px] font-semibold -tracking-[0.02em] tabular-nums">
            {orderId}
          </span>
          {placedLabel && <span className="text-ink-2 text-[13px]">{placedLabel}</span>}
        </div>
      </div>
      <StatusPill {...pill} />
    </div>
  );
}

function StatusPill({ label, tone, pulse, icon }: HeaderProps["pill"]) {
  const styles =
    tone === "active" || tone === "complete"
      ? "bg-points-soft text-points"
      : tone === "amber"
        ? "bg-amber-soft text-amber border border-amber-line"
        : "bg-[#F0E8E8] text-ink-2";
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5", styles)}>
      {pulse ? (
        <span className="relative flex h-2 w-2">
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
        <Check size={13} strokeWidth={2.5} />
      ) : icon === "x" ? (
        <X size={11} strokeWidth={2.5} />
      ) : null}
      <span className="text-[12px] font-semibold -tracking-[0.02em]">{label}</span>
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
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "amber";
}) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-7 shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(15,15,15,0.06)]",
        tone === "amber" ? "border-amber-line border" : "border-line border",
        className,
      )}
    >
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------
// StatusCard — primary status block for most states
// -------------------------------------------------------------------------

interface StatusCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: Array<{ icon?: "clock" | "truck"; text: React.ReactNode }>;
  image?: { url?: string; alt?: string };
  itemCount?: number;
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
}: StatusCardProps) {
  return (
    <Card {...(tone === "amber" ? { tone: "amber" as const } : {})}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.14em] uppercase">
            {eyebrow}
          </div>
          <div className="text-ink-1 mt-1.5 text-[22px] leading-tight font-semibold -tracking-[0.02em]">
            {title}
          </div>
          {description && (
            <div className="text-ink-2 mt-2 text-[13px] leading-relaxed">{description}</div>
          )}
          {meta && meta.length > 0 && (
            <div className="mt-5 space-y-2">
              {meta.map((row, i) => (
                <div key={i} className="text-ink-2 flex items-center gap-2 text-[12.5px]">
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
              <div className="text-ink-3 mt-2 text-[11.5px]">
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
// InvestigationCard — special status block for stuck state
// -------------------------------------------------------------------------

interface InvestigationCardProps {
  eyebrow: string;
  title: string;
  description: string;
  lastSeen: { location: string; timestamp: string };
  originalEta: { date: string; pastDue?: string };
}

function InvestigationCard({
  eyebrow,
  title,
  description,
  lastSeen,
  originalEta,
}: InvestigationCardProps) {
  return (
    <Card
      tone="amber"
      className="shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(181,134,11,0.10)]"
    >
      <div className="flex items-start gap-4">
        <div className="bg-amber-soft flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
          <Clock size={18} strokeWidth={2} className="text-amber" />
        </div>
        <div className="flex-1">
          <div className="text-amber text-[10.5px] font-semibold tracking-[0.14em] uppercase">
            {eyebrow}
          </div>
          <div className="text-ink-1 mt-1.5 text-[22px] leading-tight font-semibold -tracking-[0.02em]">
            {title}
          </div>
          <div className="text-ink-2 mt-2 text-[13px] leading-relaxed">{description}</div>
        </div>
      </div>
      <div className="border-line mt-6 grid grid-cols-2 gap-6 border-t pt-6">
        <div>
          <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
            Last seen
          </div>
          <div className="text-ink-1 mt-1.5 text-[13.5px] leading-relaxed">{lastSeen.location}</div>
          <div className="text-ink-2 mt-0.5 text-[12px] tabular-nums">{lastSeen.timestamp}</div>
        </div>
        <div>
          <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
            Original ETA
          </div>
          <div className="text-ink-1 mt-1.5 text-[13.5px] leading-relaxed">{originalEta.date}</div>
          {originalEta.pastDue && (
            <div className="text-amber mt-0.5 text-[12px] font-medium">{originalEta.pastDue}</div>
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
  label: string;
  status: TimelineStepStatus;
  badge?: string;
  description?: string;
  timestamp?: string;
  lastUpdate?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  /** Render the connector line in ink-1 (used on the delivered/refunded states). */
  emphasized?: boolean;
}

function Timeline({ steps, emphasized }: TimelineProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-5 text-[12px] font-medium tracking-[0.12em] uppercase">
        Timeline
      </div>
      <div className="relative">
        <div
          className={cn(
            "absolute top-3 bottom-3 left-[11px] w-px",
            emphasized ? "bg-ink-1" : "bg-line-strong",
          )}
        />
        {steps.map((step, i) => (
          <TimelineStepRow key={i} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>
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
    <div className={cn("relative flex items-start gap-4", !isLast && "pb-6")}>
      <div className="relative z-10 flex-shrink-0">
        {isComplete && (
          <div className="bg-ink-1 flex h-[22px] w-[22px] items-center justify-center rounded-full">
            <Check size={12} strokeWidth={3} className="text-white" />
          </div>
        )}
        {isCurrent && (
          <div className="bg-points flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-[0_0_0_4px_rgba(26,110,72,0.15)]">
            {(isLast && step.label === "Delivered") || (step.timestamp && isLast && isComplete) ? (
              <Check size={12} strokeWidth={3} className="text-white" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
        )}
        {isCancelled && (
          <div className="bg-ink-2 flex h-[22px] w-[22px] items-center justify-center rounded-full">
            <X size={11} strokeWidth={3} className="text-white" />
          </div>
        )}
        {isStuck && (
          <div className="bg-amber flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-[0_0_0_4px_rgba(181,134,11,0.15)]">
            <AlertCircle size={11} strokeWidth={2.5} className="text-white" />
          </div>
        )}
        {isPending && (
          <div className="bg-card border-line-strong flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.5px]">
            <span className="bg-line-strong h-1.5 w-1.5 rounded-full" />
          </div>
        )}
      </div>
      <div className="-mt-0.5 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex-1">
            <div
              className={cn(
                "flex items-center gap-2 text-[14px] font-medium -tracking-[0.02em]",
                isPending ? "text-ink-3" : isStuck ? "text-amber" : "text-ink-1",
              )}
            >
              <span>{step.label}</span>
              {step.badge && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.1em] uppercase",
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
              <div className={cn("mt-0.5 text-[12px]", isPending ? "text-ink-3" : "text-ink-2")}>
                {step.description}
              </div>
            )}
          </div>
          {step.timestamp && (
            <div className="text-ink-3 flex-shrink-0 text-[11.5px] tabular-nums">
              {step.timestamp}
            </div>
          )}
        </div>
        {step.lastUpdate && (
          <div className="bg-inset text-ink-2 mt-3 rounded-lg px-3.5 py-2.5 text-[12px] leading-relaxed">
            <span className="text-ink-1 font-medium">Last update:</span> {step.lastUpdate}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Item summary
// -------------------------------------------------------------------------

interface ItemProps {
  sectionLabel?: string;
  vendor?: string;
  name: string;
  subtitle?: string;
  imageUrl?: string;
  price?: Money;
  pointsApplied?: number;
  pointsRefunded?: number;
  refundedAmount?: Money;
  dimmed?: boolean;
  strikePrice?: boolean;
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
  formatPrice = defaultFormatPrice,
  formatPoints = defaultFormatPoints,
}: ItemProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-4 text-[12px] font-medium tracking-[0.12em] uppercase">
        {sectionLabel}
      </div>
      <div className={cn("flex gap-4", dimmed && "opacity-60")}>
        <div
          className={cn(
            "bg-line h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-lg",
            dimmed && "grayscale",
          )}
        >
          {imageUrl && <img src={imageUrl} alt={name} className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          {vendor && (
            <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
              {vendor}
            </div>
          )}
          <div
            className={cn(
              "mt-0.5 text-[14px] leading-snug font-medium -tracking-[0.02em]",
              strikePrice && "line-through",
              dimmed ? "text-ink-3" : "text-ink-1",
            )}
          >
            {name}
          </div>
          {subtitle && (
            <div className={cn("mt-1 text-[12px]", dimmed ? "text-ink-3" : "text-ink-2")}>
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
              <div className="text-points text-[14px] font-semibold -tracking-[0.02em] tabular-nums">
                −{formatPrice(refundedAmount)}
              </div>
            ) : (
              price && (
                <div
                  className={cn(
                    "text-[14px] font-semibold -tracking-[0.02em] tabular-nums",
                    strikePrice && "line-through",
                    dimmed ? "text-ink-3" : "text-ink-1",
                  )}
                >
                  {formatPrice(price)}
                </div>
              )
            )}
            {pointsApplied !== undefined && (
              <div className="text-points text-[11.5px] tabular-nums">
                −{formatPoints(pointsApplied)} applied
              </div>
            )}
            {pointsRefunded !== undefined && (
              <div className="text-points text-[11.5px] tabular-nums">
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

interface RefundSummaryProps {
  variant?: "compact" | "detailed";
  card: { amount: Money; postedLabel?: string };
  points: { amount: number; postedLabel?: string };
  note?: string;
  sectionLabel?: string;
  formatPrice?: (price: Money) => string;
  formatPoints?: (points: number) => string;
}

function RefundSummary({
  variant = "compact",
  card,
  points,
  note,
  sectionLabel = "Refund · complete",
  formatPrice = defaultFormatPrice,
  formatPoints = defaultFormatPoints,
}: RefundSummaryProps) {
  if (variant === "detailed") {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-inset rounded-lg px-4 py-3">
          <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
            Back to card
          </div>
          <div className="text-ink-1 mt-1 text-[18px] font-semibold -tracking-[0.02em] tabular-nums">
            {formatPrice(card.amount)}
          </div>
          {card.postedLabel && (
            <div className="text-ink-3 mt-0.5 text-[11px]">{card.postedLabel}</div>
          )}
        </div>
        <div className="bg-points-soft rounded-lg px-4 py-3">
          <div className="text-points/70 text-[10.5px] font-medium tracking-[0.12em] uppercase">
            Back to points
          </div>
          <div className="text-points mt-1 text-[18px] font-semibold -tracking-[0.02em] tabular-nums">
            +{formatPoints(points.amount)}
          </div>
          {points.postedLabel && (
            <div className="text-points/70 mt-0.5 text-[11px]">{points.postedLabel}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="text-ink-3 mb-5 text-[12px] font-medium tracking-[0.12em] uppercase">
        {sectionLabel}
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between text-[13.5px]">
          <span className="text-ink-1 font-medium">Back to your card</span>
          <span className="text-ink-1 font-semibold -tracking-[0.02em] tabular-nums">
            {formatPrice(card.amount)}
          </span>
        </div>
        <div className="flex items-baseline justify-between text-[13.5px]">
          <span className="text-points font-medium">Back to your points</span>
          <span className="text-points font-semibold -tracking-[0.02em] tabular-nums">
            +{formatPoints(points.amount)}
          </span>
        </div>
      </div>
      {note && (
        <div className="bg-points-soft text-points mt-5 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-[12px] leading-relaxed">
          <Check size={13} strokeWidth={2.5} className="mt-0.5 flex-shrink-0" />
          <span>{note}</span>
        </div>
      )}
    </Card>
  );
}

// -------------------------------------------------------------------------
// ActionsCard — generic cancel / contact / reorder / etc.
// -------------------------------------------------------------------------

interface CalloutProps {
  tone: "points" | "inset" | "amber";
  icon?: "clock" | "info" | "check";
  title: string;
  description?: string;
}

interface ActionProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  icon?: "arrow-right" | "rotate-ccw" | "truck";
}

interface ActionsCardProps {
  title?: string;
  callout?: CalloutProps;
  actions: ActionProps[];
  /** When more than 2 actions, render in 3-column grid. */
  columns?: 2 | 3;
  footer?: React.ReactNode;
}

function ActionsCard({ title, callout, actions, columns = 2, footer }: ActionsCardProps) {
  return (
    <Card>
      {title && (
        <div className="text-ink-3 mb-4 text-[12px] font-medium tracking-[0.12em] uppercase">
          {title}
        </div>
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
        <div className="border-line text-ink-2 mt-5 border-t pt-5 text-[12px] leading-relaxed">
          {footer}
        </div>
      )}
    </Card>
  );
}

function Callout({ tone, icon, title, description }: CalloutProps) {
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
        <div className={cn("text-[13px] font-medium -tracking-[0.02em]", titleColor)}>{title}</div>
        {description && (
          <div className="text-ink-2 mt-1 text-[12.5px] leading-relaxed">{description}</div>
        )}
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, variant = "secondary", disabled, icon }: ActionProps) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition",
        disabled
          ? "border-line text-ink-3 cursor-not-allowed border"
          : isPrimary
            ? "bg-ink-1 text-white hover:bg-[#000]"
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
// InvestigationActions — 3-option list shown in the stuck state
// -------------------------------------------------------------------------

export interface InvestigationOption {
  label: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}

interface InvestigationActionsProps {
  title?: string;
  options: InvestigationOption[];
}

function InvestigationActions({ title = "What you can do", options }: InvestigationActionsProps) {
  return (
    <Card>
      <div className="text-ink-3 mb-4 text-[12px] font-medium tracking-[0.12em] uppercase">
        {title}
      </div>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={opt.onClick}
            className="group border-line-strong hover:border-ink-1 flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition"
          >
            <div className="flex-1">
              <div className="text-ink-1 text-[14px] font-medium -tracking-[0.02em]">
                {opt.label}
              </div>
              <div className="text-ink-2 mt-1 text-[12.5px] leading-relaxed">{opt.description}</div>
            </div>
            {opt.badge ? (
              <span className="text-points bg-points-soft rounded px-2 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
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
// InvestigationProgress — "What we're doing" check-list
// -------------------------------------------------------------------------

export interface InvestigationStep {
  status: "complete" | "current";
  title: string;
  detail: string;
  detailTone?: "muted" | "amber";
}

function InvestigationProgress({
  title = "What we're doing",
  steps,
}: {
  title?: string;
  steps: InvestigationStep[];
}) {
  return (
    <Card>
      <div className="text-ink-3 mb-5 text-[12px] font-medium tracking-[0.12em] uppercase">
        {title}
      </div>
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
              <div className="text-ink-1 text-[13.5px] font-medium -tracking-[0.02em]">
                {step.title}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-[12px]",
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
