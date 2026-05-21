import type { Money as ApiMoney } from "checkout-intents/resources";

/** `Money` as returned by the `checkout-intents` SDK. */
export type { ApiMoney };

/** Display-formatted money. Pre-formatted by the partner app. */
export type Money = {
  currency: string;
  value: string;
};

export type ProductImage = {
  url: string;
  thumbnailUrl?: string;
  alt?: string;
};

export type Marketplace = "amazon" | "shopify" | "bestbuy";

export type ProductAvailability =
  | { kind: "in-stock" }
  | { kind: "out-of-stock" }
  | { kind: "marketplace-down"; marketplace: Marketplace; reason?: string };

export type Product = {
  id: string;
  vendor?: string;
  name: string;
  subtitle?: string;
  description?: string;
  image: ProductImage;
  price: Money;
  /** Original price shown struck-through next to `price` when a discount applies. */
  compareAtPrice?: Money;
  pointsPrice?: number;
  availability: ProductAvailability;
  marketplace: Marketplace;
};
