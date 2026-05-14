/**
 * Barrel for the rewards-ui registry. Intended for the in-repo playground
 * and any non-CLI consumer (Storybook hosts, snapshot tests, ad-hoc imports).
 *
 * Partners installing via `npx shadcn add @rye/<component>` copy each
 * component file into their own `components/rye-rewards/` and import it
 * directly — they do not depend on this barrel.
 */

export {
  OrderTracking,
  type InvestigationOption,
  type InvestigationStep,
  type OrderTrackingActionsCardProps,
  type OrderTrackingAction,
  type OrderTrackingCallout,
  type OrderTrackingHeaderProps,
  type OrderTrackingInvestigationActionsProps,
  type OrderTrackingInvestigationCardProps,
  type OrderTrackingInvestigationProgressProps,
  type OrderTrackingItemProps,
  type OrderTrackingRefundSummaryProps,
  type OrderTrackingRootProps,
  type OrderTrackingStatusCardProps,
  type OrderTrackingTimelineProps,
  type StatusPill,
  type StatusPillTone,
  type TimelineStep,
  type TimelineStepStatus,
} from "./components/order-tracking";

export { PaymentSheet, type CostLine, type PaymentSheetProps } from "./components/payment-sheet";

export { PayWithPoints, type PayWithPointsProps } from "./components/pay-with-points";

export { ProductCard, ProductCardSkeleton, type ProductCardProps } from "./components/product-card";

export {
  ProductDetails,
  ProductDetailsSkeleton,
  type ProductDetailsProps,
} from "./components/product-details";

export type {
  Marketplace,
  Money,
  Product,
  ProductAvailability,
  ProductImage,
} from "./types/product";

export type {
  ProductDetailsData,
  VariantDimension,
  VariantOption,
  VariantRevalidationError,
  VariantSelection,
} from "./types/product-details";

export { cn } from "./lib/utils";
