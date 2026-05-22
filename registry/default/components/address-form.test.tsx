import { fireEvent, render, screen } from "@testing-library/react";
import type { Buyer } from "checkout-intents/resources";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { AddressForm } from "./address-form";

const blank: Partial<Buyer> = {};

const filled: Partial<Buyer> = {
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

function ControlledHarness({
  initial = blank,
  onSubmit,
  fieldErrors,
}: {
  initial?: Partial<Buyer>;
  onSubmit?: (v: Partial<Buyer>) => void;
  fieldErrors?: Partial<Record<keyof Buyer, string>>;
}) {
  const [value, setValue] = useState<Partial<Buyer>>(initial);
  return (
    <AddressForm
      value={value}
      onChange={setValue}
      {...(onSubmit ? { onSubmit } : {})}
      {...(fieldErrors ? { fieldErrors } : {})}
    >
      <AddressForm.Name />
      <AddressForm.Address />
      <AddressForm.Region />
      <AddressForm.Contact />
      <AddressForm.Submit>Save address</AddressForm.Submit>
    </AddressForm>
  );
}

describe("<AddressForm />", () => {
  describe("rendering", () => {
    it("renders all Buyer fields with accessible labels", () => {
      render(<ControlledHarness />);
      expect(screen.getByLabelText("First name")).toBeInTheDocument();
      expect(screen.getByLabelText("Last name")).toBeInTheDocument();
      expect(screen.getByLabelText("Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Apartment, suite, etc.")).toBeInTheDocument();
      expect(screen.getByLabelText("City")).toBeInTheDocument();
      expect(screen.getByLabelText("State / Province")).toBeInTheDocument();
      expect(screen.getByLabelText("Zip / Postal code")).toBeInTheDocument();
      expect(screen.getByLabelText("Country")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Phone")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save address" })).toBeInTheDocument();
    });

    it("hydrates inputs from `value`", () => {
      render(<ControlledHarness initial={filled} />);
      expect(screen.getByLabelText<HTMLInputElement>("First name").value).toBe("Nathan");
      expect(screen.getByLabelText<HTMLInputElement>("Zip / Postal code").value).toBe("94105");
      expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe("nathan@example.com");
    });

    it("applies proper autoComplete attrs for browser autofill", () => {
      render(<ControlledHarness />);
      expect(screen.getByLabelText("First name")).toHaveAttribute("autocomplete", "given-name");
      expect(screen.getByLabelText("Zip / Postal code")).toHaveAttribute("autocomplete", "postal-code");
      expect(screen.getByLabelText("Country")).toHaveAttribute("autocomplete", "country");
      expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    });
  });

  describe("editing", () => {
    it("calls onChange with the merged Buyer when a field changes", () => {
      render(<ControlledHarness initial={filled} />);
      fireEvent.change(screen.getByLabelText("Zip / Postal code"), { target: { value: "94110" } });
      // Re-render driven by ControlledHarness's state — input reflects the new value.
      expect(screen.getByLabelText<HTMLInputElement>("Zip / Postal code").value).toBe("94110");
    });
  });

  describe("validation surface", () => {
    it("renders fieldErrors under the right input + sets aria-invalid", () => {
      render(
        <ControlledHarness
          fieldErrors={{
            postalCode: "ZIP doesn't look right",
            email: "Email is required",
          }}
        />,
      );
      const postal = screen.getByLabelText("Zip / Postal code");
      expect(postal).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("ZIP doesn't look right")).toBeInTheDocument();
      const email = screen.getByLabelText("Email");
      expect(email).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Email is required")).toBeInTheDocument();
    });

    it("doesn't set aria-invalid when no error for the field", () => {
      render(<ControlledHarness fieldErrors={{ email: "Required" }} />);
      expect(screen.getByLabelText("First name")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("submit", () => {
    it("fires onSubmit with the current value and prevents native submission", () => {
      const onSubmit = vi.fn();
      render(<ControlledHarness initial={filled} onSubmit={onSubmit} />);
      fireEvent.click(screen.getByRole("button", { name: "Save address" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(filled);
    });
  });

  describe("disabled state", () => {
    it("disables every input and the submit button when `disabled`", () => {
      render(
        <AddressForm value={filled} onChange={vi.fn()} disabled>
          <AddressForm.Name />
          <AddressForm.Submit>Save</AddressForm.Submit>
        </AddressForm>,
      );
      expect(screen.getByLabelText("First name")).toBeDisabled();
      expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    });
  });

  describe("sub-component usage outside Root", () => {
    it("throws when a slot is used outside <AddressForm>", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() => render(<AddressForm.Name />)).toThrow(
        /<AddressForm.Name \/> must be rendered inside an <AddressForm>/,
      );
      errorSpy.mockRestore();
    });
  });
});
