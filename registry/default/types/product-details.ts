import type { Product } from "./product";

/** A single dimension that varies across a product (e.g. "Color", "Size"). */
export type VariantDimension = {
  id: string;
  label: string;
  /** Sub-label hint shown on the right of the section header. */
  hint?: string;
  /** Render style for the option buttons. */
  style: "swatches" | "grid" | "cards";
  options: VariantOption[];
};

export type VariantOption = {
  id: string;
  label: string;
  /** Optional sub-label rendered under the label. */
  secondary?: string;
  /** Hex color of the swatch dot. Used when the dimension style is "swatches". */
  swatchColor?: string;
  available?: boolean;
  /** Flag set when a previously-selected option just became unavailable. */
  justBecameUnavailable?: boolean;
};

/** Maps dimension id to selected option id. */
export type VariantSelection = Record<string, string | null>;

/** Inline error surfaced above the variant pickers. */
export type VariantRevalidationError = {
  headline: string;
  detail?: string;
};

export type ProductDetailsData = {
  product: Product;
  /** Image URLs for the gallery. First entry is the hero. */
  gallery: string[];
  /** Variant dimensions in render order. */
  dimensions: VariantDimension[];
};
