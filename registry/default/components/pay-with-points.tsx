"use client";

import * as React from "react";
import { Info, Sparkles } from "lucide-react";

import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

// Just the number; suffix ("pts" / "points" / "remaining") is composed
// at each use site. Distinct from `formatPoints` in lib/format which
// emits the full "X,XXX pts" string for display in catalog tiles / PDP.
const formatPointsNumber = (points: number): string => points.toLocaleString("en-US");

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

interface PayWithPointsContextValue {
  balance: number;
  maxApplicable: number;
  applied: number;
  onAppliedChange: (points: number) => void;
  effectiveMax: number;
  isInsufficient: boolean;
  isMaxed: boolean;
  isFullPayment: boolean;
}

const PayWithPointsContext = React.createContext<PayWithPointsContextValue | null>(null);

const usePayWithPointsContext = (slot: string): PayWithPointsContextValue => {
  const ctx = React.useContext(PayWithPointsContext);
  if (!ctx) {
    throw new Error(`<PayWithPoints.${slot} /> must be rendered inside a <PayWithPoints>`);
  }
  return ctx;
};

// -------------------------------------------------------------------------
// Root
// -------------------------------------------------------------------------

export interface PayWithPointsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** User's points balance (informational; cap is `maxApplicable`). */
  balance: number;
  /** Max points applicable to this order (bounded by order total). */
  maxApplicable: number;
  /** Currently-applied points value (controlled). */
  applied: number;
  /** Fires when the user moves the slider. */
  onAppliedChange: (points: number) => void;
  children: React.ReactNode;
}

const PayWithPointsRoot = React.forwardRef<HTMLDivElement, PayWithPointsProps>(
  function PayWithPointsRoot(
    { balance, maxApplicable, applied, onAppliedChange, className, children, ...rest },
    ref,
  ) {
    const effectiveMax = Math.min(balance, maxApplicable);
    const isInsufficient = balance < maxApplicable;
    const isMaxed = applied === effectiveMax && effectiveMax > 0;
    const isFullPayment = applied === maxApplicable && maxApplicable > 0;

    const value = React.useMemo<PayWithPointsContextValue>(
      () => ({
        balance,
        maxApplicable,
        applied,
        onAppliedChange,
        effectiveMax,
        isInsufficient,
        isMaxed,
        isFullPayment,
      }),
      [
        balance,
        maxApplicable,
        applied,
        onAppliedChange,
        effectiveMax,
        isInsufficient,
        isMaxed,
        isFullPayment,
      ],
    );

    return (
      <PayWithPointsContext.Provider value={value}>
        <div
          ref={ref}
          className={cn("bg-inset border-line rounded-2xl border p-7", className)}
          {...rest}
        >
          {children}
        </div>
      </PayWithPointsContext.Provider>
    );
  },
);

PayWithPointsRoot.displayName = "PayWithPoints";

// -------------------------------------------------------------------------
// <PayWithPoints.Header />
// -------------------------------------------------------------------------

export interface PayWithPointsHeaderProps {
  /** Label rendered on the left side. Defaults to "Apply points". */
  label?: React.ReactNode;
  /**
   * Subtitle shown under the label. If omitted, derives from state:
   * "Paying with points only" when maxed, otherwise falls back to
   * `rateLabel` (or nothing).
   */
  subtitle?: React.ReactNode;
  /** Used as the default subtitle in the cash + points mixed state. */
  rateLabel?: React.ReactNode;
  /** Caption rendered under the balance pill. Defaults to "Available". */
  availableLabel?: React.ReactNode;
}

function PayWithPointsHeader({
  label = "Apply points",
  subtitle,
  rateLabel,
  availableLabel = "Available",
}: PayWithPointsHeaderProps) {
  const { balance, isFullPayment } = usePayWithPointsContext("Header");

  const resolvedSubtitle = subtitle ?? (isFullPayment ? "Paying with points only" : rateLabel);
  const subtitleTone: "muted" | "points" =
    isFullPayment && subtitle === undefined ? "points" : "muted";

  return (
    <div className="mb-5 flex items-start justify-between">
      <div>
        <div className="text-ink-1 text-sm font-medium">{label}</div>
        {resolvedSubtitle ? (
          <div
            className={cn(
              "mt-0.5 text-xs",
              subtitleTone === "points" ? "text-points font-medium" : "text-ink-2",
            )}
          >
            {resolvedSubtitle}
          </div>
        ) : null}
      </div>

      <div className="text-right">
        <div className="bg-points-soft text-points inline-flex items-center gap-1.5 rounded-full px-2.5 py-1">
          <Sparkles size={11} strokeWidth={2.25} />
          <span className="text-xs font-semibold tabular-nums">
            {formatPointsNumber(balance)} pts
          </span>
        </div>
        <div className="text-ink-3 mt-1.5 text-xs font-medium tracking-widest uppercase">
          {availableLabel}
        </div>
      </div>
    </div>
  );
}

PayWithPointsHeader.displayName = "PayWithPoints.Header";

// -------------------------------------------------------------------------
// <PayWithPoints.Slider />
// -------------------------------------------------------------------------

export interface PayWithPointsSliderProps {
  /** Accessible label for the slider thumb. Defaults to "Points to apply". */
  "aria-label"?: string;
  /** Suffix on the applied total, e.g. "8,500 applied". */
  appliedSuffix?: string;
  /** Suffix on the max scale, e.g. "8,900 max". */
  maxSuffix?: string;
  /** Suffix when applied has hit the user's balance, e.g. "500 applied · max". */
  maxedSuffix?: string;
}

function PayWithPointsSlider({
  "aria-label": ariaLabel = "Points to apply",
  appliedSuffix = "applied",
  maxSuffix = "max",
  maxedSuffix = "applied · max",
}: PayWithPointsSliderProps) {
  const { applied, maxApplicable, onAppliedChange, effectiveMax, isInsufficient, isMaxed } =
    usePayWithPointsContext("Slider");

  const appliedLabel = `${formatPointsNumber(applied)} ${isMaxed && isInsufficient ? maxedSuffix : appliedSuffix}`;

  return (
    <div>
      <SliderControl
        value={applied}
        max={effectiveMax}
        onChange={onAppliedChange}
        aria-label={ariaLabel}
      />
      <div className="text-ink-3 mt-3.5 flex items-center justify-between text-xs tabular-nums">
        <span>0 pts</span>
        <span className={cn("text-xs font-semibold", applied > 0 ? "text-points" : "text-ink-3")}>
          {appliedLabel}
        </span>
        <button
          type="button"
          onClick={() => onAppliedChange(effectiveMax)}
          disabled={applied === effectiveMax}
          aria-label={`Apply the maximum ${formatPointsNumber(maxApplicable)} points`}
          className={cn(
            "rounded-md px-1.5 py-0.5 transition hover:bg-points-soft/60 focus-visible:outline-points focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:hover:bg-transparent",
            isInsufficient && "line-through",
          )}
        >
          {formatPointsNumber(maxApplicable)} {maxSuffix}
        </button>
      </div>
    </div>
  );
}

PayWithPointsSlider.displayName = "PayWithPoints.Slider";

// -------------------------------------------------------------------------
// <PayWithPoints.Summary />
// -------------------------------------------------------------------------

export interface PayWithPointsSummaryProps {
  /**
   * Order total in cash. When provided alongside `pointsToCash`, the
   * insufficient-balance state renders a partial-coverage info card
   * instead of the default after-redemption line.
   */
  orderTotal?: { currency: string; value: string };
  /**
   * Points-to-cash converter, used to compute the partial-coverage split
   * when `orderTotal` is provided. Defaults to `points / 100`. Partners
   * with a different rate (e.g. 1000 pts = $1) pass their own.
   */
  pointsToCash?: (points: number) => number;
  /** Label for the after-redemption line. Defaults to "After redemption". */
  afterLabel?: React.ReactNode;
  /** Trailing word after the remaining-points number. Defaults to "pts remaining". */
  remainingSuffix?: React.ReactNode;
  /** Override the partial-coverage copy. */
  renderRemainder?: (info: { covered: string; remaining: string }) => React.ReactNode;
}

const defaultPointsToCash = (points: number): number => points / 100;

function PayWithPointsSummary({
  orderTotal,
  pointsToCash = defaultPointsToCash,
  afterLabel = "After redemption",
  remainingSuffix = "pts remaining",
  renderRemainder,
}: PayWithPointsSummaryProps) {
  const { balance, applied, isInsufficient } = usePayWithPointsContext("Summary");

  const remainingAfterRedemption = balance - applied;

  const remainderInfo =
    isInsufficient && orderTotal
      ? (() => {
          const totalCash = Number(orderTotal.value);
          const covered = pointsToCash(applied);
          const remaining = totalCash - covered;
          return {
            covered: formatMoney({ currency: orderTotal.currency, value: covered.toFixed(2) }),
            remaining: formatMoney({ currency: orderTotal.currency, value: remaining.toFixed(2) }),
          };
        })()
      : null;

  if (remainderInfo) {
    return (
      <div className="bg-card border-line mt-5 flex items-start gap-2.5 rounded-lg border px-3.5 py-3">
        <Info size={14} strokeWidth={2} className="text-ink-3 mt-0.5 flex-shrink-0" />
        <div className="text-ink-2 flex-1 text-xs leading-relaxed">
          {renderRemainder ? (
            renderRemainder(remainderInfo)
          ) : (
            <>
              <span className="text-ink-1 font-medium">
                {"You'll cover "}
                {remainderInfo.covered}
                {" with points."}
              </span>{" "}
              The remaining {remainderInfo.remaining} will be charged to your card.
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-line mt-5 flex items-baseline justify-between border-t pt-4">
      <div className="text-ink-2 text-xs">{afterLabel}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink-1 text-sm font-semibold tabular-nums">
          {formatPointsNumber(remainingAfterRedemption)}
        </span>
        <span className="text-ink-2 text-xs">{remainingSuffix}</span>
      </div>
    </div>
  );
}

PayWithPointsSummary.displayName = "PayWithPoints.Summary";

// -------------------------------------------------------------------------
// Compound export
// -------------------------------------------------------------------------

export const PayWithPoints = Object.assign(PayWithPointsRoot, {
  Header: PayWithPointsHeader,
  Slider: PayWithPointsSlider,
  Summary: PayWithPointsSummary,
});

// -------------------------------------------------------------------------
// SliderControl (custom range thumb so we can theme via Tailwind tokens)
// -------------------------------------------------------------------------

interface SliderControlProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  "aria-label": string;
}

function SliderControl({ value, max, onChange, "aria-label": ariaLabel }: SliderControlProps) {
  const trackRef = React.useRef<HTMLSpanElement>(null);
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const isDragging = React.useRef(false);

  const setFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track || max <= 0) {
      return;
    }
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(Math.round(ratio * max));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    isDragging.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!isDragging.current) {
      return;
    }
    setFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLSpanElement>) => {
    isDragging.current = false;
    (e.currentTarget as Element).releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    const step = Math.max(1, Math.round(max / 100));
    let next = value;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      next = Math.max(0, value - step);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      next = Math.min(max, value + step);
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = max;
    } else {
      return;
    }
    e.preventDefault();
    onChange(next);
  };

  return (
    <span
      ref={trackRef}
      role="presentation"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative flex h-5.5 w-full cursor-pointer items-center"
    >
      <span className="bg-line-strong relative h-0.75 flex-1 overflow-hidden rounded-full">
        <span className="bg-points absolute top-0 left-0 h-full" style={{ width: `${pct}%` }} />
      </span>
      <span
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={onKeyDown}
        className="focus-visible:ring-points absolute top-1/2 h-5.5 w-5.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white shadow-[0_1px_3px_rgba(15,15,15,0.18),_0_3px_8px_rgba(15,15,15,0.08)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:cursor-grabbing"
        style={{ left: `${pct}%` }}
      />
    </span>
  );
}
