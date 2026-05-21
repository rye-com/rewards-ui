import { fireEvent, render, screen } from "@testing-library/react";
import { RotateCcw } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { PaymentSheet } from "./payment-sheet";

const item = {
  vendor: "Aesop",
  name: "Resurrection Aromatique Hand Wash",
  subtitle: "500 mL",
  price: { currency: "USD", value: "89.00" },
  pointsPrice: 8900,
};

const buyer = {
  firstName: "Nathan",
  lastName: "Pegram",
  address1: "350 Mission St",
  address2: "Apt 4C",
  city: "San Francisco",
  province: "CA",
  postalCode: "94105",
  country: "US",
  email: "nathan@example.com",
  phone: "+1-415-555-0100",
};

describe("<PaymentSheet />", () => {
  describe("header", () => {
    it("renders title and subtitle", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Header title="Confirm redemption" subtitle="One item · Standard delivery" />
        </PaymentSheet>,
      );
      expect(screen.getByText("Confirm redemption")).toBeInTheDocument();
      expect(screen.getByText("One item · Standard delivery")).toBeInTheDocument();
    });

    it("fires onBack and onClose", () => {
      const onBack = vi.fn();
      const onClose = vi.fn();
      render(
        <PaymentSheet>
          <PaymentSheet.Header title="x" onBack={onBack} onClose={onClose} />
        </PaymentSheet>,
      );
      fireEvent.click(screen.getByLabelText("Back"));
      fireEvent.click(screen.getByLabelText("Close"));
      expect(onBack).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("alert", () => {
    it("renders an error alert", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Alert tone="error" title="Slate Blue · M just sold out">
            Stock changed while you were checking out.
          </PaymentSheet.Alert>
        </PaymentSheet>,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Slate Blue · M just sold out")).toBeInTheDocument();
      expect(screen.getByText(/Stock changed/)).toBeInTheDocument();
    });

    it("renders an amber (marketplace-down) alert", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Alert tone="amber" title="Norse Projects ordering temporarily paused">
            We&apos;ll notify you when it&apos;s back.
          </PaymentSheet.Alert>
        </PaymentSheet>,
      );
      expect(screen.getByText("Norse Projects ordering temporarily paused")).toBeInTheDocument();
    });
  });

  describe("item", () => {
    it("renders vendor, name, subtitle, formatted price, points equivalent", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Item item={item} />
        </PaymentSheet>,
      );
      expect(screen.getByText("Aesop")).toBeInTheDocument();
      expect(screen.getByText("Resurrection Aromatique Hand Wash")).toBeInTheDocument();
      expect(screen.getByText(/89\.00/)).toBeInTheDocument();
      expect(screen.getByText("or 8,900 pts")).toBeInTheDocument();
    });

    it("renders the unpriceable placeholder", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Item item={item} unpriceable />
        </PaymentSheet>,
      );
      expect(screen.getByText("n/a")).toBeInTheDocument();
      expect(screen.queryByText(/89\.00/)).not.toBeInTheDocument();
    });

    it("strikes through the price when strikePrice is set", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Item item={item} strikePrice />
        </PaymentSheet>,
      );
      expect(screen.getByText(/89\.00/).className).toContain("line-through");
    });
  });

  describe("shipping", () => {
    it("renders the address and edit button", () => {
      const onEdit = vi.fn();
      render(
        <PaymentSheet>
          <PaymentSheet.Shipping buyer={buyer} onEdit={onEdit} />
        </PaymentSheet>,
      );
      expect(screen.getByText(/Ship to/)).toBeInTheDocument();
      expect(screen.getByText(/Nathan Pegram/)).toBeInTheDocument();
      fireEvent.click(screen.getByText("Edit"));
      expect(onEdit).toHaveBeenCalled();
    });

    it("renders the shipError treatment when set", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Shipping
            buyer={buyer}
            shipError={{
              headline: "Can't ship to this address",
              detail: "Aesop doesn't ship to this destination.",
            }}
          />
        </PaymentSheet>,
      );
      expect(screen.getByText("Can't ship to this address")).toBeInTheDocument();
      expect(screen.getByText(/Aesop doesn't ship/)).toBeInTheDocument();
    });
  });

  describe("member benefit", () => {
    it("renders title, description, and amount", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.MemberBenefit
            title="Member benefit applied"
            description="15% off Aesop, automatically applied at checkout."
            amount={{ currency: "USD", value: "-13.35" }}
          />
        </PaymentSheet>,
      );
      expect(screen.getByText("Member benefit applied")).toBeInTheDocument();
      expect(screen.getByText(/15% off Aesop/)).toBeInTheDocument();
      expect(screen.getByText(/-?13\.35/)).toBeInTheDocument();
    });
  });

  describe("cost breakdown", () => {
    it("renders lines, total, and inline note", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.CostBreakdown
            lines={[
              { label: "Subtotal", value: "$89.00" },
              {
                label: "Points discount",
                hint: "· 4,500 pts",
                value: "−$45.00",
                tone: "points",
              },
            ]}
            total={{ label: "Total due", value: "$51.68" }}
          />
        </PaymentSheet>,
      );
      expect(screen.getByText("Subtotal")).toBeInTheDocument();
      expect(screen.getByText("Points discount")).toBeInTheDocument();
      expect(screen.getByText("· 4,500 pts")).toBeInTheDocument();
      // CostBreakdown lines render the partner-provided value strings verbatim
      // (they're already formatted upstream), so dollar-sign assertion is OK here.
      expect(screen.getByText("$51.68")).toBeInTheDocument();
    });

    it("colors the total in points-green when tone is 'points'", () => {
      const { container } = render(
        <PaymentSheet>
          <PaymentSheet.CostBreakdown
            lines={[]}
            total={{ label: "Total due", value: "$0.00", tone: "points" }}
          />
        </PaymentSheet>,
      );
      expect(container.querySelector(".text-points")).toBeInTheDocument();
    });

    it("shows an inline error note", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.CostBreakdown
            lines={[]}
            total={{ label: "Total due", value: "Unable to price", tone: "error" }}
            inlineNote={{
              tone: "error",
              title: "Bose couldn't price this item right now.",
              detail: "This usually clears in a few minutes.",
            }}
          />
        </PaymentSheet>,
      );
      expect(screen.getByText(/Bose couldn't price/)).toBeInTheDocument();
    });
  });

  describe("confirm", () => {
    it("renders label and secondary with a separator, fires onClick", () => {
      const onClick = vi.fn();
      render(
        <PaymentSheet>
          <PaymentSheet.Confirm label="Confirm order" secondary="$82.18" onClick={onClick} />
        </PaymentSheet>,
      );
      fireEvent.click(screen.getByRole("button", { name: /Confirm order/ }));
      expect(onClick).toHaveBeenCalled();
      expect(screen.getByText("$82.18")).toBeInTheDocument();
    });

    it("disables when disabled is true", () => {
      render(
        <PaymentSheet>
          <PaymentSheet.Confirm label="Pick another variant to continue" disabled />
        </PaymentSheet>,
      );
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("shows the spinner in loading state", () => {
      const { container } = render(
        <PaymentSheet>
          <PaymentSheet.Confirm label="Calculating…" loading />
        </PaymentSheet>,
      );
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("actions (two-button row)", () => {
    it("renders the two buttons and fires onClick", () => {
      const onPrimary = vi.fn();
      const onSecondary = vi.fn();
      render(
        <PaymentSheet>
          <PaymentSheet.Actions
            primary={{
              label: "Try again",
              onClick: onPrimary,
              icon: <RotateCcw size={13} strokeWidth={2.25} />,
            }}
            secondary={{ label: "Confirm", onClick: onSecondary, disabled: true }}
          />
        </PaymentSheet>,
      );
      fireEvent.click(screen.getByText("Try again"));
      expect(onPrimary).toHaveBeenCalled();
      expect(screen.getByText("Confirm")).toBeDisabled();
    });
  });

  describe("skeleton", () => {
    it("renders the loading skeleton with default copy", () => {
      const { container } = render(<PaymentSheet.Skeleton />);
      expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
      // Default title + ctaLabel both default to "Loading…", so it appears twice.
      expect(screen.getAllByText("Loading…").length).toBeGreaterThan(0);
    });

    it("respects custom skeleton copy", () => {
      render(
        <PaymentSheet.Skeleton
          title="Confirm redemption"
          subtitle="Pricing your order"
          ctaLabel="Calculating…"
        />,
      );
      expect(screen.getByText("Confirm redemption")).toBeInTheDocument();
      expect(screen.getByText("Calculating…")).toBeInTheDocument();
    });
  });
});
