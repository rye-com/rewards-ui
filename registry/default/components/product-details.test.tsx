import { fireEvent, render, screen } from "@testing-library/react";
import { RotateCcw, Truck } from "lucide-react";
import type { ReactNode } from "react";
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
    availability: { kind: "in_stock" },
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
};

const defaultMetaRows = [
  {
    icon: <Truck size={14} strokeWidth={2} />,
    text: "Free standard shipping, 3 to 5 business days",
  },
  { icon: <RotateCcw size={14} strokeWidth={2} />, text: "30-day returns" },
];

interface RenderPDPOptions {
  data?: ProductDetailsData;
  selection?: Parameters<typeof ProductDetails>[0]["selection"];
  onSelectionChange?: (dim: string, opt: string) => void;
  onImageSelect?: (i: number) => void;
  onRedeem?: () => void;
  revalidationError?: { headline: string; detail?: string };
  redeemDisabledReason?: string;
  breadcrumbs?: Array<string | { label: string; href: string }>;
  meta?: Array<{ icon?: ReactNode; text: ReactNode }>;
}

const renderPDP = (options: RenderPDPOptions = {}) => {
  const {
    data = sweater,
    selection = { color: "slate-blue", size: "m" },
    onSelectionChange = vi.fn(),
    onImageSelect,
    onRedeem,
    revalidationError,
    redeemDisabledReason,
    breadcrumbs,
    meta,
  } = options;
  return render(
    <ProductDetails
      data={data}
      selection={selection}
      onSelectionChange={onSelectionChange}
      {...(onImageSelect ? { onImageSelect } : {})}
      {...(revalidationError ? { revalidationError } : {})}
    >
      {breadcrumbs && <ProductDetails.Breadcrumbs items={breadcrumbs} />}
      <ProductDetails.Gallery />
      <ProductDetails.Header />
      <ProductDetails.Variants />
      {redeemDisabledReason ? (
        <ProductDetails.Redeem disabled>{redeemDisabledReason}</ProductDetails.Redeem>
      ) : (
        <ProductDetails.Redeem {...(onRedeem ? { onClick: onRedeem } : {})}>
          Redeem with points
        </ProductDetails.Redeem>
      )}
      {meta && <ProductDetails.Meta rows={meta} />}
    </ProductDetails>,
  );
};

describe("<ProductDetails />", () => {
  describe("ready state", () => {
    it("renders vendor, name, description, price + points", () => {
      renderPDP({ meta: defaultMetaRows });
      expect(screen.getByText("Norse Projects")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Sigfred Merino Crew Sweater",
      );
      expect(screen.getByText(/Mid-weight crewneck/)).toBeInTheDocument();
      expect(screen.getByText(/245\.00/)).toBeInTheDocument();
      expect(screen.getByText("or 24,500 pts")).toBeInTheDocument();
    });

    it("shows breadcrumbs when provided", () => {
      renderPDP({
        selection: {},
        breadcrumbs: ["Catalog", "Knitwear", "Sigfred Merino Crew"],
      });
      expect(screen.getByText("Catalog")).toBeInTheDocument();
      expect(screen.getByText("Sigfred Merino Crew")).toBeInTheDocument();
    });

    it("renders the dimensions' selected option label in the group header", () => {
      renderPDP();
      const colorHeader = screen.getByRole("radiogroup", { name: "Color" });
      expect(colorHeader.parentElement).toHaveTextContent("Slate Blue");
    });

    it("fires onSelectionChange when a swatch is clicked", () => {
      const onChange = vi.fn();
      renderPDP({ onSelectionChange: onChange });
      fireEvent.click(screen.getByRole("radio", { name: /Charcoal/ }));
      expect(onChange).toHaveBeenCalledWith("color", "charcoal");
    });

    it("fires onRedeem when the CTA is clicked", () => {
      const onRedeem = vi.fn();
      renderPDP({ onRedeem });
      fireEvent.click(screen.getByRole("button", { name: /Redeem with points/ }));
      expect(onRedeem).toHaveBeenCalled();
    });

    it("disables the unavailable XL size", () => {
      renderPDP();
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
      renderPDP({
        data: sweaterWithRevalidation,
        revalidationError: {
          headline: "Slate Blue · M just became unavailable",
          detail: "Stock changed while you were viewing.",
        },
      });
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Slate Blue · M just became unavailable/)).toBeInTheDocument();
      expect(screen.getByText("Stock changed while you were viewing.")).toBeInTheDocument();
    });

    it("disables the CTA when `disabled` is set and renders children as the label", () => {
      renderPDP({
        data: sweaterWithRevalidation,
        revalidationError: { headline: "M just sold out" },
        redeemDisabledReason: "Pick another size to continue",
      });
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
        availability: { kind: "in_stock" },
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
      renderPDP({ data: configurator, selection: { cleanser: "parsley" } });
      expect(screen.getByText("Parsley Seed Anti-Oxidant")).toBeInTheDocument();
      expect(screen.getAllByText("Included")).toHaveLength(2);
    });

    it("never labels options as $0", () => {
      renderPDP({ data: configurator, selection: { cleanser: "parsley" } });
      expect(screen.queryByText(/\$0/)).not.toBeInTheDocument();
    });
  });

  describe("gallery selection", () => {
    it("fires onImageSelect when a thumbnail is clicked", () => {
      const onImageSelect = vi.fn();
      renderPDP({ selection: {}, onImageSelect });
      fireEvent.click(screen.getByRole("button", { name: /View image 2/ }));
      expect(onImageSelect).toHaveBeenCalledWith(1);
    });
  });

  describe("Quantity slot", () => {
    it("fires onChange when increment is clicked", () => {
      const onChange = vi.fn();
      render(
        <ProductDetails data={sweater} selection={{}} onSelectionChange={vi.fn()}>
          <ProductDetails.Quantity value={1} onChange={onChange} />
        </ProductDetails>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Increase quantity" }));
      expect(onChange).toHaveBeenCalledWith(2);
    });

    it("disables decrement at min", () => {
      render(
        <ProductDetails data={sweater} selection={{}} onSelectionChange={vi.fn()}>
          <ProductDetails.Quantity value={1} onChange={vi.fn()} min={1} />
        </ProductDetails>,
      );
      expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    });
  });

  describe("custom layout", () => {
    it("respects child order", () => {
      const { container } = render(
        <ProductDetails data={sweater} selection={{}} onSelectionChange={vi.fn()}>
          <ProductDetails.Header />
          <ProductDetails.Gallery />
        </ProductDetails>,
      );
      const root = container.firstElementChild;
      // Header (vendor div) renders before Gallery (aspect-[4/5] div)
      const headerIndex = Array.from(root?.children ?? []).findIndex((c) =>
        c.textContent?.includes("Norse Projects"),
      );
      const galleryIndex = Array.from(root?.children ?? []).findIndex((c) =>
        c.querySelector(".aspect-\\[4\\/5\\]"),
      );
      expect(headerIndex).toBeLessThan(galleryIndex);
    });
  });

  describe("sub-component usage outside Root", () => {
    it("throws when <ProductDetails.Header /> is used outside <ProductDetails>", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() => render(<ProductDetails.Header />)).toThrow(
        /<ProductDetails.Header \/> must be rendered inside a <ProductDetails>/,
      );
      errorSpy.mockRestore();
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
