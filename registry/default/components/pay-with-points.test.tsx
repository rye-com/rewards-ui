import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PayWithPoints } from "./pay-with-points";

interface RenderOptions {
  balance?: number;
  maxApplicable?: number;
  applied?: number;
  onAppliedChange?: (n: number) => void;
  enabled?: boolean;
  onEnabledChange?: (e: boolean) => void;
  rateLabel?: React.ReactNode;
  orderTotal?: { currency: string; value: string };
}

const renderPWP = (options: RenderOptions = {}) => {
  const {
    balance = 12450,
    maxApplicable = 8900,
    applied = 4500,
    onAppliedChange = vi.fn(),
    enabled = true,
    onEnabledChange,
    rateLabel,
    orderTotal,
  } = options;

  return render(
    <PayWithPoints
      balance={balance}
      maxApplicable={maxApplicable}
      applied={applied}
      onAppliedChange={onAppliedChange}
      enabled={enabled}
      {...(onEnabledChange ? { onEnabledChange } : {})}
    >
      <PayWithPoints.Header {...(rateLabel ? { rateLabel } : {})} />
      <PayWithPoints.Slider />
      <PayWithPoints.Summary {...(orderTotal ? { orderTotal } : {})} />
    </PayWithPoints>,
  );
};

describe("<PayWithPoints />", () => {
  describe("enabled mixed-tender state", () => {
    it("renders the balance pill, applied amount, and after-redemption remainder", () => {
      renderPWP();
      expect(screen.getByText("12,450 pts")).toBeInTheDocument();
      expect(screen.getByText("Available")).toBeInTheDocument();
      expect(screen.getByText(/4,500 applied/)).toBeInTheDocument();
      expect(screen.getByText(/8,900 max/)).toBeInTheDocument();
      expect(screen.getByText("After redemption")).toBeInTheDocument();
      expect(screen.getByText("7,950")).toBeInTheDocument();
    });

    it("uses the rateLabel as subtitle when not maxed", () => {
      renderPWP({ rateLabel: "100 pts = $1.00" });
      expect(screen.getByText("100 pts = $1.00")).toBeInTheDocument();
    });

    it("updates value with arrow keys", () => {
      const onChange = vi.fn();
      renderPWP({ onAppliedChange: onChange });
      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalled();
      const calls = onChange.mock.calls;
      expect(calls[calls.length - 1]?.[0]).toBeGreaterThan(4500);
    });
  });

  describe("full-points state", () => {
    it("shows the Maxed subtitle when applied === maxApplicable", () => {
      renderPWP({ applied: 8900 });
      expect(screen.getByText("Paying with points only")).toBeInTheDocument();
    });
  });

  describe("disabled (off) state", () => {
    it("shows the toggle, dimmed slider, and unchanged balance footer", () => {
      const onEnabledChange = vi.fn();
      renderPWP({ applied: 0, enabled: false, onEnabledChange });
      expect(screen.getByRole("switch")).toBeInTheDocument();
      expect(screen.getByText("Save your points for later")).toBeInTheDocument();
      expect(screen.getByText("Balance unchanged")).toBeInTheDocument();
      expect(screen.getByText("12,450")).toBeInTheDocument();
    });

    it("fires onEnabledChange when the toggle is clicked", () => {
      const onEnabledChange = vi.fn();
      renderPWP({ applied: 0, enabled: false, onEnabledChange });
      fireEvent.click(screen.getByRole("switch"));
      expect(onEnabledChange).toHaveBeenCalledWith(true);
    });
  });

  describe("insufficient-balance state", () => {
    it("strikes through the max scale and shows the partial-coverage info card", () => {
      renderPWP({
        balance: 500,
        applied: 500,
        orderTotal: { currency: "USD", value: "89.00" },
      });
      expect(screen.getByText(/500 applied · max/)).toBeInTheDocument();
      expect(screen.getByText(/8,900 max/).className).toContain("line-through");
      expect(screen.getByText(/You'll cover.*5\.00 with points/)).toBeInTheDocument();
      expect(screen.getByText(/remaining.*84\.00/)).toBeInTheDocument();
    });

    it("respects a custom pointsToCash rate", () => {
      // 1000 pts = $1.00 instead of the default 100:1.
      render(
        <PayWithPoints balance={500} maxApplicable={8900} applied={500} onAppliedChange={vi.fn()}>
          <PayWithPoints.Header />
          <PayWithPoints.Slider />
          <PayWithPoints.Summary
            orderTotal={{ currency: "USD", value: "89.00" }}
            pointsToCash={(p) => p / 1000}
          />
        </PayWithPoints>,
      );
      // 500 / 1000 = $0.50 covered, $88.50 remaining
      expect(screen.getByText(/You'll cover.*0\.50 with points/)).toBeInTheDocument();
      expect(screen.getByText(/remaining.*88\.50/)).toBeInTheDocument();
    });
  });

  describe("custom layout", () => {
    it("respects child order (slider first, header second)", () => {
      const { container } = render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={4500}
          onAppliedChange={vi.fn()}
        >
          <PayWithPoints.Slider />
          <PayWithPoints.Header />
        </PayWithPoints>,
      );
      const children = container.firstElementChild?.children;
      // First child is the slider wrapper (has the slider role nested)
      expect(children?.[0]?.querySelector('[role="slider"]')).toBeInTheDocument();
      // Second child is the header (has "Apply points")
      expect(children?.[1]?.textContent).toContain("Apply points");
    });
  });

  describe("sub-component usage outside Root", () => {
    it("throws when <PayWithPoints.Header /> is used outside <PayWithPoints>", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() => render(<PayWithPoints.Header />)).toThrow(
        /<PayWithPoints.Header \/> must be rendered inside a <PayWithPoints>/,
      );
      errorSpy.mockRestore();
    });
  });
});
