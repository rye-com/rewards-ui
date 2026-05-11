import type { Product } from "./product";

/**
 * A single dimension that varies across a product (e.g. "Color", "Size",
 * a configurator slot like "Cleanser"). Variant pickers operate over these.
 */
export type VariantDimension = {
  /** Stable id partner code passes to onChange. */
  id: string;
  /** Display label, e.g. "Color", "Size", "1 · Cleanser". */
  label: string;
  /** Sub-label hint shown on the right side of the section header. */
  hint?: string;
  /** Render style: color swatches, size grid, configurator-style cards. */
  style: "swatches" | "grid" | "cards";
  options: VariantOption[];
};

export type VariantOption = {
  id: string;
  label: string;
  /** Optional sub-label rendered under the label (e.g. "Included", "Out of stock"). */
  secondary?: string;
  /** For "swatches": hex color of the dot. */
  swatchColor?: string;
  /** Availability of this specific option. */
  available?: boolean;
  /**
   * Hard-revalidation flag, set when a previously-selected option just became
   * unavailable (e.g. another shopper bought the last unit). Rendered with the
   * error-tinted variant-revalidation state.
   */
  justBecameUnavailable?: boolean;
};

/**
 * What the parent component / partner sets to drive `<ProductDetails />`.
 * Maps dimension id → selected option id.
 */
export type VariantSelection = Record<string, string | null>;

/**
 * Optional inline messages surfaced on the variant-revalidation state.
 * Shown right above the variant pickers; cleared when the partner updates
 * the variant or the catalog refreshes.
 */
export type VariantRevalidationError = {
  /** Human-readable headline, e.g. "Slate Blue · M just became unavailable". */
  headline: string;
  /** Optional follow-up sentence. */
  detail?: string;
};

export type ProductDetailsData = {
  product: Product;
  /** Image URLs for the gallery. First is the hero. */
  gallery: string[];
  /** Variant dimensions in render order. */
  dimensions: VariantDimension[];
  /** Free-form trust / shipping bullets shown below the redeem CTA. */
  meta?: Array<{
    /** Lucide icon name, e.g. "truck", "rotate-ccw", "shield-check". */
    icon?: "truck" | "rotate-ccw" | "shield-check";
    text: string;
  }>;
};
