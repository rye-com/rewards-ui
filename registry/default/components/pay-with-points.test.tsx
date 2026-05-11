import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PayWithPoints } from "./pay-with-points";

describe("<PayWithPoints />", () => {
  describe("enabled mixed-tender state", () => {
    it("renders the balance pill, applied amount, and after-redemption remainder", () => {
      render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={4500}
          onAppliedChange={vi.fn()}
        />,
      );
      expect(screen.getByText("12,450 pts")).toBeInTheDocument();
      expect(screen.getByText("Available")).toBeInTheDocument();
      expect(screen.getByText("4,500 applied")).toBeInTheDocument();
      expect(screen.getByText("8,900 max")).toBeInTheDocument();
      expect(screen.getByText("After redemption")).toBeInTheDocument();
      expect(screen.getByText("7,950")).toBeInTheDocument();
    });

    it("uses the rateLabel as subtitle when not maxed", () => {
      render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={4500}
          onAppliedChange={vi.fn()}
          rateLabel="100 pts = $1.00"
        />,
      );
      expect(screen.getByText("100 pts = $1.00")).toBeInTheDocument();
    });

    it("updates value with arrow keys", () => {
      const onChange = vi.fn();
      render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={4500}
          onAppliedChange={onChange}
        />,
      );
      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalled();
      const calls = onChange.mock.calls;
      expect(calls[calls.length - 1]?.[0]).toBeGreaterThan(4500);
    });
  });

  describe("full-points state", () => {
    it("shows the Maxed subtitle when applied === maxApplicable", () => {
      render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={8900}
          onAppliedChange={vi.fn()}
        />,
      );
      expect(screen.getByText("Maxed · paying with points only")).toBeInTheDocument();
    });
  });

  describe("disabled (off) state", () => {
    it("shows the toggle, dimmed slider, and unchanged balance footer", () => {
      const onEnabledChange = vi.fn();
      render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={0}
          onAppliedChange={vi.fn()}
          enabled={false}
          onEnabledChange={onEnabledChange}
        />,
      );
      expect(screen.getByRole("switch")).toBeInTheDocument();
      expect(screen.getByText("Save your points for later")).toBeInTheDocument();
      expect(screen.getByText("Balance unchanged")).toBeInTheDocument();
      expect(screen.getByText("12,450")).toBeInTheDocument();
    });

    it("fires onEnabledChange when the toggle is clicked", () => {
      const onEnabledChange = vi.fn();
      render(
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={0}
          onAppliedChange={vi.fn()}
          enabled={false}
          onEnabledChange={onEnabledChange}
        />,
      );
      fireEvent.click(screen.getByRole("switch"));
      expect(onEnabledChange).toHaveBeenCalledWith(true);
    });
  });

  describe("insufficient-balance state", () => {
    it("strikes through the max scale and shows the partial-coverage info card", () => {
      render(
        <PayWithPoints
          balance={500}
          maxApplicable={8900}
          applied={500}
          onAppliedChange={vi.fn()}
          orderTotal={{ currency: "USD", value: "89.00" }}
        />,
      );
      expect(screen.getByText("500 applied · max")).toBeInTheDocument();
      expect(screen.getByText("8,900 max").className).toContain("line-through");
      expect(screen.getByText(/You'll cover \$5\.00 with points/)).toBeInTheDocument();
      expect(screen.getByText(/remaining \$84\.00/)).toBeInTheDocument();
    });
  });
});
