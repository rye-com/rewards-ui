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

const renderCard = (product: Product, props: Partial<Parameters<typeof ProductCard>[0]> = {}) =>
  render(
    <ProductCard product={product} {...props}>
      <ProductCard.Image />
      <ProductCard.Info />
    </ProductCard>,
  );

describe("<ProductCard />", () => {
  describe("default in-stock state", () => {
    it("renders vendor, name, subtitle, cash price, and points equivalent", () => {
      renderCard(baseProduct);
      expect(screen.getByText("Aesop")).toBeInTheDocument();
      expect(screen.getByText("Resurrection Aromatique Hand Wash")).toBeInTheDocument();
      expect(screen.getByText("500 mL")).toBeInTheDocument();
      expect(screen.getByText(/89\.00/)).toBeInTheDocument();
      expect(screen.getByText("or 8,900 pts")).toBeInTheDocument();
    });

    it("omits points equivalent when not provided", () => {
      const { pointsPrice: _omitted, ...productWithoutPoints } = baseProduct;
      renderCard(productWithoutPoints);
      expect(screen.queryByText(/pts$/)).not.toBeInTheDocument();
    });
  });

  describe("selected state", () => {
    it("applies the focus ring classes when `selected`", () => {
      const { container } = renderCard(baseProduct, { selected: true });
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
      renderCard(outOfStock);
      expect(screen.getByText("Unavailable")).toBeInTheDocument();
    });

    it("does not render the points equivalent", () => {
      renderCard(outOfStock);
      expect(screen.queryByText(/pts$/)).not.toBeInTheDocument();
    });

    it("renders price with line-through", () => {
      renderCard(outOfStock);
      expect(screen.getByText(/89\.00/).className).toContain("line-through");
    });
  });

  describe("marketplace-down state", () => {
    const marketplaceDown: Product = {
      ...baseProduct,
      availability: { kind: "marketplace-down", marketplace: "amazon" },
    };

    it("renders the temporarily-paused panel mentioning the marketplace", () => {
      renderCard(marketplaceDown);
      expect(screen.getByText(/Ordering temporarily paused on Amazon/)).toBeInTheDocument();
    });

    it("respects a custom reason override", () => {
      renderCard({
        ...marketplaceDown,
        availability: {
          kind: "marketplace-down",
          marketplace: "amazon",
          reason: "Maintenance window",
        },
      });
      expect(screen.getByText("Maintenance window")).toBeInTheDocument();
    });

    it("invokes onNotify when the in-panel notify link is clicked", () => {
      const onNotify = vi.fn();
      renderCard(marketplaceDown, { onNotify });
      fireEvent.click(screen.getByText("Notify me when available"));
      expect(onNotify).toHaveBeenCalledWith(marketplaceDown);
    });
  });

  describe("image failure", () => {
    it("renders the fallback when the image errors", () => {
      renderCard(baseProduct);
      const img = screen.getByRole("img");
      fireEvent.error(img);
      expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    });
  });

  describe("thumbnailUrl preference", () => {
    it("prefers thumbnailUrl over the full image url", () => {
      renderCard({
        ...baseProduct,
        image: {
          url: "https://example.com/full.jpg",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
      });
      expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/thumb.jpg");
    });
  });

  describe("custom layout", () => {
    it("renders sub-components in the order provided", () => {
      const { container } = render(
        <ProductCard product={baseProduct}>
          <ProductCard.Info />
          <ProductCard.Image />
        </ProductCard>,
      );
      const children = container.firstElementChild?.children;
      expect(children?.[0]?.className).toContain("pt-4");
      expect(children?.[1]?.className).toContain("aspect-[4/5]");
    });
  });

  describe("sub-component usage outside Root", () => {
    it("throws when <ProductCard.Image /> is used outside <ProductCard>", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() => render(<ProductCard.Image />)).toThrow(
        /<ProductCard.Image \/> must be rendered inside a <ProductCard>/,
      );
      errorSpy.mockRestore();
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
