import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ProductDetailsData } from "../types/product-details";
import { ProductDetails, ProductDetailsSkeleton } from "./product-details";

const sweater: ProductDetailsData = {
  product: {
    id: "norse-sweater",
    vendor: "Norse Projects",
    name: "Sigfred Merino Crew Sweater",
    description: "Mid-weight crewneck in 100% extra-fine merino wool, knitted in Italy.",
    image: { url: "https://example.com/img.jpg" },
    price: { currency: "USD", value: "245.00" },
    pointsPrice: 24500,
    availability: { kind: "in-stock" },
    marketplace: "shopify",
  },
  gallery: ["a.jpg", "b.jpg", "c.jpg", "d.jpg"],
  dimensions: [
    {
      id: "color",
      label: "Color",
      style: "swatches",
      options: [
        { id: "charcoal", label: "Charcoal", swatchColor: "#1F2A33" },
        { id: "oat", label: "Oat", swatchColor: "#D8C9A6" },
        { id: "slate-blue", label: "Slate Blue", swatchColor: "#6B7480" },
      ],
    },
    {
      id: "size",
      label: "Size",
      style: "grid",
      options: [
        { id: "xs", label: "XS" },
        { id: "s", label: "S" },
        { id: "m", label: "M" },
        { id: "l", label: "L" },
        { id: "xl", label: "XL", available: false },
      ],
    },
  ],
  meta: [
    { icon: "truck", text: "Free standard shipping · 3–5 business days" },
    { icon: "rotate-ccw", text: "30-day returns" },
  ],
};

describe("<ProductDetails />", () => {
  describe("ready state", () => {
    it("renders vendor, name, description, price + points", () => {
      render(
        <ProductDetails
          data={sweater}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={vi.fn()}
        />,
      );
      expect(screen.getByText("Norse Projects")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Sigfred Merino Crew Sweater",
      );
      expect(screen.getByText(/Mid-weight crewneck/)).toBeInTheDocument();
      // Price appears twice: in the header AND inside the redeem CTA
      expect(screen.getAllByText("$245.00")).toHaveLength(2);
      expect(screen.getByText("or 24,500 pts")).toBeInTheDocument();
    });

    it("shows breadcrumbs when provided", () => {
      render(
        <ProductDetails
          data={sweater}
          selection={{}}
          onSelectionChange={vi.fn()}
          breadcrumbs={["Catalog", "Knitwear", "Sigfred Merino Crew"]}
        />,
      );
      expect(screen.getByText("Catalog")).toBeInTheDocument();
      expect(screen.getByText("Sigfred Merino Crew")).toBeInTheDocument();
    });

    it("renders the dimensions' selected option label in the group header", () => {
      render(
        <ProductDetails
          data={sweater}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={vi.fn()}
        />,
      );
      const colorHeader = screen.getByRole("radiogroup", { name: "Color" });
      expect(colorHeader.parentElement).toHaveTextContent("Slate Blue");
    });

    it("fires onSelectionChange when a swatch is clicked", () => {
      const onChange = vi.fn();
      render(
        <ProductDetails
          data={sweater}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("radio", { name: /Charcoal/ }));
      expect(onChange).toHaveBeenCalledWith("color", "charcoal");
    });

    it("fires onRedeem when the CTA is clicked", () => {
      const onRedeem = vi.fn();
      render(
        <ProductDetails
          data={sweater}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={vi.fn()}
          onRedeem={onRedeem}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /Redeem with points/ }));
      expect(onRedeem).toHaveBeenCalled();
    });

    it("disables the unavailable XL size", () => {
      render(
        <ProductDetails
          data={sweater}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={vi.fn()}
        />,
      );
      expect(screen.getByRole("radio", { name: /^XL$/ })).toBeDisabled();
    });
  });

  describe("revalidation state", () => {
    const sweaterWithRevalidation: ProductDetailsData = {
      ...sweater,
      dimensions: [
        sweater.dimensions[0]!,
        {
          ...sweater.dimensions[1]!,
          options: sweater.dimensions[1]!.options.map((o) =>
            o.id === "m" ? { ...o, justBecameUnavailable: true } : o,
          ),
        },
      ],
    };

    it("renders the alert with the headline + detail", () => {
      render(
        <ProductDetails
          data={sweaterWithRevalidation}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={vi.fn()}
          revalidationError={{
            headline: "Slate Blue · M just became unavailable",
            detail: "Stock changed while you were viewing.",
          }}
        />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Slate Blue · M just became unavailable/)).toBeInTheDocument();
      expect(screen.getByText("Stock changed while you were viewing.")).toBeInTheDocument();
    });

    it("disables the CTA with the redeemDisabledReason label", () => {
      render(
        <ProductDetails
          data={sweaterWithRevalidation}
          selection={{ color: "slate-blue", size: "m" }}
          onSelectionChange={vi.fn()}
          revalidationError={{ headline: "M just sold out" }}
          redeemDisabledReason="Pick another size to continue"
        />,
      );
      const btn = screen.getByRole("button", { name: "Pick another size to continue" });
      expect(btn).toBeDisabled();
    });
  });

  describe("configurator state (cards style)", () => {
    const configurator: ProductDetailsData = {
      product: {
        id: "byo-discovery",
        vendor: "Aesop",
        name: "Build Your Own Discovery Set",
        image: { url: "x.jpg" },
        price: { currency: "USD", value: "89.00" },
        pointsPrice: 8900,
        availability: { kind: "in-stock" },
        marketplace: "shopify",
      },
      gallery: ["a.jpg"],
      dimensions: [
        {
          id: "cleanser",
          label: "1 · Cleanser",
          hint: "Pick 1 of 2",
          style: "cards",
          options: [
            { id: "parsley", label: "Parsley Seed Anti-Oxidant", secondary: "Included" },
            { id: "amazing", label: "Amazing Face Cleanser", secondary: "Included" },
          ],
        },
      ],
    };

    it("renders the configurator card label + secondary", () => {
      render(
        <ProductDetails
          data={configurator}
          selection={{ cleanser: "parsley" }}
          onSelectionChange={vi.fn()}
        />,
      );
      expect(screen.getByText("Parsley Seed Anti-Oxidant")).toBeInTheDocument();
      expect(screen.getAllByText("Included")).toHaveLength(2);
    });

    it("never labels options as $0 (preempts Jolly's BYO confusion)", () => {
      render(
        <ProductDetails
          data={configurator}
          selection={{ cleanser: "parsley" }}
          onSelectionChange={vi.fn()}
        />,
      );
      expect(screen.queryByText(/\$0/)).not.toBeInTheDocument();
    });
  });

  describe("gallery selection", () => {
    it("fires onImageSelect when a thumbnail is clicked", () => {
      const onImageSelect = vi.fn();
      render(
        <ProductDetails
          data={sweater}
          selection={{}}
          onSelectionChange={vi.fn()}
          onImageSelect={onImageSelect}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /View image 2/ }));
      expect(onImageSelect).toHaveBeenCalledWith(1);
    });
  });
});

describe("<ProductDetailsSkeleton />", () => {
  it("renders the two-column layout placeholders", () => {
    const { container } = render(<ProductDetailsSkeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".aspect-\\[4\\/5\\]")).toBeInTheDocument();
  });
});
