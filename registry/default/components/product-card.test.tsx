import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "../types/product";
import { ProductCard, ProductCardSkeleton } from "./product-card";

const baseProduct: Product = {
  id: "test-1",
  vendor: "Aesop",
  name: "Resurrection Aromatique Hand Wash",
  subtitle: "500 mL",
  image: { url: "https://example.com/img.jpg" },
  price: { currency: "USD", value: "89.00" },
  pointsPrice: 8900,
  availability: { kind: "in-stock" },
  marketplace: "shopify",
};

describe("<ProductCard />", () => {
  describe("default in-stock state", () => {
    it("renders vendor, name, subtitle, cash price, and points equivalent", () => {
      render(<ProductCard product={baseProduct} href="/p/aesop" />);
      expect(screen.getByText("Aesop")).toBeInTheDocument();
      expect(screen.getByText("Resurrection Aromatique Hand Wash")).toBeInTheDocument();
      expect(screen.getByText("500 mL")).toBeInTheDocument();
      expect(screen.getByText("$89.00")).toBeInTheDocument();
      expect(screen.getByText("or 8,900 pts")).toBeInTheDocument();
    });

    it("omits points equivalent when not provided", () => {
      const { pointsPrice: _omitted, ...productWithoutPoints } = baseProduct;
      render(<ProductCard product={productWithoutPoints} href="/p/x" />);
      expect(screen.queryByText(/pts$/)).not.toBeInTheDocument();
    });

    it("invokes onClick when clicked", () => {
      const onClick = vi.fn();
      render(<ProductCard product={baseProduct} href="/p/x" onClick={onClick} />);
      fireEvent.click(screen.getByRole("link"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("selected state", () => {
    it("applies the focus ring classes when `selected`", () => {
      const { container } = render(<ProductCard product={baseProduct} href="/p/x" selected />);
      const imageContainer = container.querySelector(".aspect-\\[4\\/5\\]");
      expect(imageContainer?.className).toContain("ring-2");
      expect(imageContainer?.className).toContain("ring-ink-1");
    });
  });

  describe("out-of-stock state", () => {
    const outOfStock: Product = {
      ...baseProduct,
      availability: { kind: "out-of-stock" },
    };

    it("renders the Unavailable badge", () => {
      render(<ProductCard product={outOfStock} href="/p/x" />);
      expect(screen.getByText("Unavailable")).toBeInTheDocument();
    });

    it("does not render the points equivalent", () => {
      render(<ProductCard product={outOfStock} href="/p/x" />);
      expect(screen.queryByText(/pts$/)).not.toBeInTheDocument();
    });

    it("renders price with line-through", () => {
      render(<ProductCard product={outOfStock} href="/p/x" />);
      expect(screen.getByText("$89.00").className).toContain("line-through");
    });

    it("prevents click navigation", () => {
      const onClick = vi.fn();
      render(<ProductCard product={outOfStock} href="/p/x" onClick={onClick} />);
      fireEvent.click(screen.getByRole("link"));
      // onClick is replaced by preventDefault when not buyable
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("subscription-only state", () => {
    const { pointsPrice: _ignored, ...rest } = baseProduct;
    const subscription: Product = {
      ...rest,
      availability: { kind: "subscription-only" },
    };

    it("renders the Subscription badge and cadence", () => {
      render(<ProductCard product={subscription} href="/p/x" />);
      expect(screen.getByText("Subscription")).toBeInTheDocument();
      expect(screen.getByText("/ month")).toBeInTheDocument();
    });

    it("respects a custom cadence", () => {
      render(
        <ProductCard
          product={{
            ...subscription,
            availability: { kind: "subscription-only", cadence: "quarter" },
          }}
          href="/p/x"
        />,
      );
      expect(screen.getByText("/ quarter")).toBeInTheDocument();
    });

    it('renders the "not redeemable" helper', () => {
      render(<ProductCard product={subscription} href="/p/x" />);
      expect(screen.getByText("Not redeemable with points yet")).toBeInTheDocument();
    });
  });

  describe("marketplace-down state", () => {
    const marketplaceDown: Product = {
      ...baseProduct,
      availability: { kind: "marketplace-down", marketplace: "amazon" },
    };

    it("renders the temporarily-paused panel mentioning the marketplace", () => {
      render(<ProductCard product={marketplaceDown} href="/p/x" />);
      expect(screen.getByText(/Ordering temporarily paused on Amazon/)).toBeInTheDocument();
    });

    it("respects a custom reason override", () => {
      render(
        <ProductCard
          product={{
            ...marketplaceDown,
            availability: {
              kind: "marketplace-down",
              marketplace: "amazon",
              reason: "Maintenance window",
            },
          }}
          href="/p/x"
        />,
      );
      expect(screen.getByText("Maintenance window")).toBeInTheDocument();
    });

    it("invokes onNotify when the in-panel notify link is clicked", () => {
      const onNotify = vi.fn();
      render(<ProductCard product={marketplaceDown} href="/p/x" onNotify={onNotify} />);
      fireEvent.click(screen.getByText("Notify me when available"));
      expect(onNotify).toHaveBeenCalledWith(marketplaceDown);
    });
  });

  describe("image failure", () => {
    it("renders the fallback when the image errors", () => {
      render(<ProductCard product={baseProduct} href="/p/x" />);
      const img = screen.getByRole("img");
      fireEvent.error(img);
      expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    });
  });

  describe("thumbnailUrl preference", () => {
    it("prefers thumbnailUrl over the full image url", () => {
      render(
        <ProductCard
          product={{
            ...baseProduct,
            image: {
              url: "https://example.com/full.jpg",
              thumbnailUrl: "https://example.com/thumb.jpg",
            },
          }}
          href="/p/x"
        />,
      );
      expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/thumb.jpg");
    });
  });
});

describe("<ProductCardSkeleton />", () => {
  it("renders without props", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.querySelector(".aspect-\\[4\\/5\\]")).toBeInTheDocument();
  });

  it("is hidden from assistive tech", () => {
    const { container } = render(<ProductCardSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });
});
