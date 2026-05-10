/**
 * Minimal product shape consumed by the rewards UI components.
 *
 * Mirrors the relevant subset of `Product` from the public `checkout-intents`
 * SDK so partners can pass API responses straight through, but we re-declare
 * the type here (not import it) to keep components zero-dependency on the
 * API client per Architecture Invariant #1.
 */

export type Money = {
  /** Three-letter ISO currency code, e.g. "USD". */
  currency: string;
  /** Display value in major units, e.g. "89.00". */
  value: string;
};

export type ProductImage = {
  url: string;
  /** Optional pre-sized thumbnail URL (faster catalog grids). */
  thumbnailUrl?: string;
  alt?: string;
};

export type Marketplace = "amazon" | "shopify" | "bestbuy";

export type ProductAvailability =
  | { kind: "in-stock" }
  | { kind: "out-of-stock" }
  | {
      kind: "subscription-only";
      /** e.g. "month" → renders as "/month". Defaults to "month" if omitted. */
      cadence?: string;
    }
  | {
      kind: "marketplace-down";
      marketplace: Marketplace;
      /** Optional human-readable explanation override. */
      reason?: string;
    };

export type Product = {
  id: string;
  /** Brand or vendor name shown above the product title. */
  vendor?: string;
  name: string;
  /** Short variant / config descriptor, e.g. "500 mL", "5 colors · XS–XL". */
  subtitle?: string;
  description?: string;
  image: ProductImage;
  /** Cash price as a Money object. */
  price: Money;
  /** Optional points equivalent, e.g. 8900 renders as "or 8,900 pts". */
  pointsPrice?: number;
  availability: ProductAvailability;
  marketplace: Marketplace;
};
