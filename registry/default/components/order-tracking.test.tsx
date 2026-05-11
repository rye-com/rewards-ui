import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OrderTracking } from "./order-tracking";

describe("<OrderTracking />", () => {
  describe("Header", () => {
    it("renders order id, placed label, and status pill", () => {
      render(
        <OrderTracking>
          <OrderTracking.Header
            orderId="#RW-A4F92K"
            placedLabel="Placed May 5, 2026"
            pill={{ label: "Processing", tone: "active", pulse: true }}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("#RW-A4F92K")).toBeInTheDocument();
      expect(screen.getByText("Placed May 5, 2026")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
    });

    it("renders the amber pill with border for the stuck state", () => {
      const { container } = render(
        <OrderTracking>
          <OrderTracking.Header
            orderId="#RW-1"
            pill={{ label: "Under investigation", tone: "amber", pulse: true }}
          />
        </OrderTracking>,
      );
      expect(container.querySelector(".border-amber-line")).toBeInTheDocument();
    });
  });

  describe("StatusCard", () => {
    it("renders eyebrow, title, description, meta rows, image, and item count", () => {
      render(
        <OrderTracking>
          <OrderTracking.StatusCard
            eyebrow="Status"
            title="Norse Projects is preparing your order"
            description="Your order has been accepted."
            meta={[
              { icon: "clock", text: "Estimated ship by Tue, May 12" },
              { icon: "truck", text: "UPS · tracking" },
            ]}
            image={{ url: "x.jpg", alt: "Sweater" }}
            itemCount={1}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText(/preparing your order/)).toBeInTheDocument();
      expect(screen.getByText(/Estimated ship by Tue, May 12/)).toBeInTheDocument();
      expect(screen.getByText("UPS · tracking")).toBeInTheDocument();
      expect(screen.getByText("1 item")).toBeInTheDocument();
    });

    it("renders with amber tone for stuck-state preview", () => {
      const { container } = render(
        <OrderTracking>
          <OrderTracking.StatusCard eyebrow="Status" title="Stuck" tone="amber" />
        </OrderTracking>,
      );
      expect(container.querySelector(".border-amber-line")).toBeInTheDocument();
    });
  });

  describe("InvestigationCard", () => {
    it("renders headline, description, last-seen, and original ETA grid", () => {
      render(
        <OrderTracking>
          <OrderTracking.InvestigationCard
            eyebrow="We're looking into this"
            title="No tracking updates for 5 days"
            description="Your package was last scanned at the carrier facility."
            lastSeen={{ location: "UPS facility, Daly City CA", timestamp: "May 7, 6:32 AM" }}
            originalEta={{ date: "Wed, May 14", pastDue: "3 days past due" }}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("We're looking into this")).toBeInTheDocument();
      expect(screen.getByText("No tracking updates for 5 days")).toBeInTheDocument();
      expect(screen.getByText("UPS facility, Daly City CA")).toBeInTheDocument();
      expect(screen.getByText("Wed, May 14")).toBeInTheDocument();
      expect(screen.getByText("3 days past due")).toBeInTheDocument();
    });
  });

  describe("Timeline", () => {
    it("renders steps with statuses and a current 'Now' badge", () => {
      render(
        <OrderTracking>
          <OrderTracking.Timeline
            steps={[
              { label: "Order placed", status: "complete", timestamp: "May 5" },
              { label: "Processing", status: "current", badge: "Now", timestamp: "May 6" },
              { label: "Shipped", status: "pending", description: "Estimated Tue, May 12" },
            ]}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Order placed")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Now")).toBeInTheDocument();
      expect(screen.getByText("Estimated Tue, May 12")).toBeInTheDocument();
    });

    it("renders the tracking-gap step in amber", () => {
      const { container } = render(
        <OrderTracking>
          <OrderTracking.Timeline
            steps={[
              {
                label: "Tracking gap",
                status: "tracking-gap",
                badge: "5 days",
                description: "No carrier scans since May 7",
              },
            ]}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Tracking gap")).toBeInTheDocument();
      // The label text wrapper uses text-amber
      expect(container.querySelector(".text-amber")).toBeInTheDocument();
    });

    it("renders the lastUpdate inset when provided on a current step", () => {
      render(
        <OrderTracking>
          <OrderTracking.Timeline
            steps={[
              {
                label: "Shipped",
                status: "current",
                badge: "Now",
                lastUpdate: "Package scanned at UPS facility · 6:32 AM",
              },
            ]}
          />
        </OrderTracking>,
      );
      expect(screen.getByText(/Package scanned at UPS facility/)).toBeInTheDocument();
    });
  });

  describe("Item", () => {
    it("renders vendor, name, subtitle, price and points applied", () => {
      render(
        <OrderTracking>
          <OrderTracking.Item
            vendor="Norse Projects"
            name="Sigfred Merino Crew Sweater"
            subtitle="Slate Blue · Size M · Qty 1"
            price={{ currency: "USD", value: "245.00" }}
            pointsApplied={12250}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Norse Projects")).toBeInTheDocument();
      expect(screen.getByText("Sigfred Merino Crew Sweater")).toBeInTheDocument();
      expect(screen.getByText("$245.00")).toBeInTheDocument();
      expect(screen.getByText("−12,250 pts applied")).toBeInTheDocument();
    });

    it("dims and strikes through for cancelled state", () => {
      render(
        <OrderTracking>
          <OrderTracking.Item
            vendor="Norse Projects"
            name="Cancelled Sweater"
            price={{ currency: "USD", value: "245.00" }}
            dimmed
            strikePrice
            sectionLabel="Item not ordered"
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Item not ordered")).toBeInTheDocument();
      expect(screen.getByText("$245.00").className).toContain("line-through");
    });
  });

  describe("RefundSummary", () => {
    it("compact: renders card and points lines with optional note", () => {
      render(
        <OrderTracking>
          <OrderTracking.RefundSummary
            card={{ amount: { currency: "USD", value: "133.13" } }}
            points={{ amount: 12250 }}
            note="Posted in full. Card credit visible within 1–2 business days."
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Back to your card")).toBeInTheDocument();
      expect(screen.getByText("$133.13")).toBeInTheDocument();
      expect(screen.getByText("+12,250 pts")).toBeInTheDocument();
      expect(screen.getByText(/Posted in full/)).toBeInTheDocument();
    });

    it("detailed: renders two-up cards", () => {
      render(
        <OrderTracking>
          <OrderTracking.RefundSummary
            variant="detailed"
            card={{ amount: { currency: "USD", value: "133.13" }, postedLabel: "Posted May 18" }}
            points={{ amount: 12250, postedLabel: "Posted May 17" }}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Back to card")).toBeInTheDocument();
      expect(screen.getByText("Back to points")).toBeInTheDocument();
      expect(screen.getByText("Posted May 18")).toBeInTheDocument();
    });
  });

  describe("ActionsCard", () => {
    it("renders title, callout, and action buttons; fires onClick", () => {
      const onCancel = vi.fn();
      const onDetails = vi.fn();
      render(
        <OrderTracking>
          <OrderTracking.ActionsCard
            title="Need to cancel?"
            callout={{
              tone: "points",
              icon: "clock",
              title: "You can still cancel",
              description: "Cancel now and your points and card charge are reversed.",
            }}
            actions={[
              { label: "Order details", onClick: onDetails },
              { label: "Cancel order", variant: "primary", onClick: onCancel },
            ]}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Need to cancel?")).toBeInTheDocument();
      expect(screen.getByText("You can still cancel")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Cancel order"));
      expect(onCancel).toHaveBeenCalled();
      fireEvent.click(screen.getByText("Order details"));
      expect(onDetails).toHaveBeenCalled();
    });

    it("respects disabled state and renders 3-column variant", () => {
      const { container } = render(
        <OrderTracking>
          <OrderTracking.ActionsCard
            columns={3}
            actions={[
              { label: "Reorder", icon: "rotate-ccw" },
              { label: "Order details" },
              { label: "Start a return", variant: "primary", icon: "arrow-right" },
            ]}
          />
        </OrderTracking>,
      );
      expect(container.querySelector(".grid-cols-3")).toBeInTheDocument();
    });
  });

  describe("InvestigationActions", () => {
    it("renders 3 options and a Recommended badge on the first one", () => {
      const onWait = vi.fn();
      render(
        <OrderTracking>
          <OrderTracking.InvestigationActions
            options={[
              {
                label: "Wait for resolution",
                description: "We'll email you when we hear from UPS.",
                badge: "Recommended",
                onClick: onWait,
              },
              { label: "Refund anyway", description: "Get $133.13 back on your card." },
              { label: "Talk to a human", description: "Reach support directly." },
            ]}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Wait for resolution")).toBeInTheDocument();
      expect(screen.getByText("Recommended")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Wait for resolution"));
      expect(onWait).toHaveBeenCalled();
    });
  });

  describe("InvestigationProgress", () => {
    it("renders complete and current steps with the right styling", () => {
      const { container } = render(
        <OrderTracking>
          <OrderTracking.InvestigationProgress
            steps={[
              {
                status: "complete",
                title: "Filed a trace request with UPS",
                detail: "Opened May 11",
              },
              {
                status: "current",
                title: "Awaiting carrier response",
                detail: "Expected by Wed, May 13",
                detailTone: "amber",
              },
            ]}
          />
        </OrderTracking>,
      );
      expect(screen.getByText("Filed a trace request with UPS")).toBeInTheDocument();
      expect(screen.getByText("Expected by Wed, May 13").className).toContain("text-amber");
      // current step's bullet has amber bg
      expect(container.querySelector(".bg-amber")).toBeInTheDocument();
    });
  });
});
