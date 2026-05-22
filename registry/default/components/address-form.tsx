"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { Buyer } from "checkout-intents/resources";

import { cn } from "@/lib/utils";

/**
 * `<AddressForm />` is the write-side companion to `<PaymentSheet.Shipping>`.
 * Both speak the same `Buyer` shape from `checkout-intents`, so consumers
 * collect the address here and pass it straight through to checkout / order
 * placement without remapping.
 *
 * Compound API — partners compose the sections they need:
 *
 * ```tsx
 * <AddressForm
 *   value={buyer}
 *   onChange={setBuyer}
 *   fieldErrors={errors}
 *   onSubmit={handleSubmit}
 * >
 *   <AddressForm.Name />
 *   <AddressForm.Address />
 *   <AddressForm.Region />
 *   <AddressForm.Contact />
 *   <AddressForm.Submit>Save address</AddressForm.Submit>
 * </AddressForm>
 * ```
 *
 * Validation is consumer-owned — pass `fieldErrors` keyed by `Buyer` field
 * name; the component renders each message under the relevant input and sets
 * `aria-invalid`. Plug in zod, react-hook-form, or roll your own.
 */

// -------------------------------------------------------------------------
// Context
// -------------------------------------------------------------------------

type BuyerField = keyof Buyer;
type FieldErrors = Partial<Record<BuyerField, string>>;

interface AddressFormContextValue {
  value: Partial<Buyer>;
  setField: (field: BuyerField, next: string) => void;
  errors: FieldErrors;
  disabled: boolean;
  idPrefix: string;
}

const AddressFormContext = React.createContext<AddressFormContextValue | null>(null);

const useAddressFormContext = (slot: string): AddressFormContextValue => {
  const ctx = React.useContext(AddressFormContext);
  if (!ctx) {
    throw new Error(`<AddressForm.${slot} /> must be rendered inside an <AddressForm>`);
  }
  return ctx;
};

// -------------------------------------------------------------------------
// Root
// -------------------------------------------------------------------------

export interface AddressFormProps extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onChange" | "onSubmit"
> {
  /** Current address values. `Partial<Buyer>` so new entries can start empty. */
  value: Partial<Buyer>;
  /** Fires with the merged Buyer whenever any field changes. */
  onChange: (next: Partial<Buyer>) => void;
  /** Per-field error map. Surfaced under the relevant input + sets `aria-invalid`. */
  fieldErrors?: FieldErrors;
  /** Disables every input and the submit button. */
  disabled?: boolean;
  /** Fires when the form is submitted. Receives the current value. */
  onSubmit?: (value: Partial<Buyer>) => void;
  children: React.ReactNode;
}

function AddressFormRoot({
  value,
  onChange,
  fieldErrors,
  disabled = false,
  onSubmit,
  className,
  children,
  id,
  ...rest
}: AddressFormProps) {
  // Stable per-instance prefix so we can derive deterministic input ids
  // (label `htmlFor` → input id → error `aria-describedby`).
  const generatedId = React.useId();
  const idPrefix = id ?? generatedId;

  const setField = React.useCallback(
    (field: BuyerField, next: string) => {
      onChange({ ...value, [field]: next });
    },
    [onChange, value],
  );

  const ctx = React.useMemo<AddressFormContextValue>(
    () => ({
      value,
      setField,
      errors: fieldErrors ?? EMPTY_ERRORS,
      disabled,
      idPrefix,
    }),
    [value, setField, fieldErrors, disabled, idPrefix],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  return (
    <AddressFormContext.Provider value={ctx}>
      <form
        id={idPrefix}
        noValidate
        onSubmit={handleSubmit}
        className={cn("space-y-5", className)}
        {...rest}
      >
        {children}
      </form>
    </AddressFormContext.Provider>
  );
}

AddressFormRoot.displayName = "AddressForm";

// Stable reference so `fieldErrors` unset doesn't churn the memoized ctx value.
const EMPTY_ERRORS: FieldErrors = Object.freeze({});

// -------------------------------------------------------------------------
// Field primitive
// -------------------------------------------------------------------------

interface FieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: BuyerField;
  label: React.ReactNode;
  /** Span the input over `cols` columns when nested inside a grid. */
  cols?: 1 | 2;
}

function Field({ name, label, cols = 1, className, ...inputProps }: FieldProps) {
  const { value, setField, errors, disabled, idPrefix } = useAddressFormContext("Field");
  const inputId = `${idPrefix}-${name}`;
  const errorId = `${inputId}-error`;
  const error = errors[name];
  return (
    <div className={cn(cols === 2 && "col-span-2")}>
      <label
        htmlFor={inputId}
        className="text-ink-3 mb-1.5 block text-xs font-medium tracking-widest uppercase"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        value={value[name] ?? ""}
        onChange={(e) => setField(name, e.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "bg-card text-ink-1 placeholder:text-ink-3 w-full rounded-lg border px-3.5 py-2.5 text-sm transition",
          "focus:border-ink-1 focus:outline-none",
          "disabled:bg-inset disabled:text-ink-3 disabled:cursor-not-allowed",
          error ? "border-error" : "border-line-strong hover:border-ink-2",
          className,
        )}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="text-error mt-1.5 text-xs leading-relaxed">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface SelectProps {
  name: BuyerField;
  label: React.ReactNode;
  options: ReadonlyArray<{ code: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  cols?: 1 | 2;
}

function Select({
  name,
  label,
  options,
  placeholder,
  required,
  autoComplete,
  cols = 1,
}: SelectProps) {
  const { value, setField, errors, disabled, idPrefix } = useAddressFormContext("Select");
  const inputId = `${idPrefix}-${name}`;
  const errorId = `${inputId}-error`;
  const error = errors[name];
  const current = value[name] ?? "";
  return (
    <div className={cn(cols === 2 && "col-span-2")}>
      <label
        htmlFor={inputId}
        className="text-ink-3 mb-1.5 block text-xs font-medium tracking-widest uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={inputId}
          name={name}
          value={current}
          onChange={(e) => setField(name, e.target.value)}
          disabled={disabled}
          required={required}
          aria-required={required ? "true" : undefined}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "bg-card text-ink-1 w-full appearance-none rounded-lg border py-2.5 pr-9 pl-3.5 text-sm transition",
            "focus:border-ink-1 focus:outline-none",
            "disabled:bg-inset disabled:text-ink-3 disabled:cursor-not-allowed",
            current === "" && "text-ink-3",
            error ? "border-error" : "border-line-strong hover:border-ink-2",
          )}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="text-ink-3 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        />
      </div>
      {error ? (
        <p id={errorId} className="text-error mt-1.5 text-xs leading-relaxed">
          {error}
        </p>
      ) : null}
    </div>
  );
}

// -------------------------------------------------------------------------
// Reference data — partners can override via props on <AddressForm.Region />
// -------------------------------------------------------------------------

const DEFAULT_COUNTRIES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "NZ", label: "New Zealand" },
  { code: "IE", label: "Ireland" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
];

const US_STATES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "AL", label: "Alabama" },
  { code: "AK", label: "Alaska" },
  { code: "AZ", label: "Arizona" },
  { code: "AR", label: "Arkansas" },
  { code: "CA", label: "California" },
  { code: "CO", label: "Colorado" },
  { code: "CT", label: "Connecticut" },
  { code: "DE", label: "Delaware" },
  { code: "DC", label: "District of Columbia" },
  { code: "FL", label: "Florida" },
  { code: "GA", label: "Georgia" },
  { code: "HI", label: "Hawaii" },
  { code: "ID", label: "Idaho" },
  { code: "IL", label: "Illinois" },
  { code: "IN", label: "Indiana" },
  { code: "IA", label: "Iowa" },
  { code: "KS", label: "Kansas" },
  { code: "KY", label: "Kentucky" },
  { code: "LA", label: "Louisiana" },
  { code: "ME", label: "Maine" },
  { code: "MD", label: "Maryland" },
  { code: "MA", label: "Massachusetts" },
  { code: "MI", label: "Michigan" },
  { code: "MN", label: "Minnesota" },
  { code: "MS", label: "Mississippi" },
  { code: "MO", label: "Missouri" },
  { code: "MT", label: "Montana" },
  { code: "NE", label: "Nebraska" },
  { code: "NV", label: "Nevada" },
  { code: "NH", label: "New Hampshire" },
  { code: "NJ", label: "New Jersey" },
  { code: "NM", label: "New Mexico" },
  { code: "NY", label: "New York" },
  { code: "NC", label: "North Carolina" },
  { code: "ND", label: "North Dakota" },
  { code: "OH", label: "Ohio" },
  { code: "OK", label: "Oklahoma" },
  { code: "OR", label: "Oregon" },
  { code: "PA", label: "Pennsylvania" },
  { code: "RI", label: "Rhode Island" },
  { code: "SC", label: "South Carolina" },
  { code: "SD", label: "South Dakota" },
  { code: "TN", label: "Tennessee" },
  { code: "TX", label: "Texas" },
  { code: "UT", label: "Utah" },
  { code: "VT", label: "Vermont" },
  { code: "VA", label: "Virginia" },
  { code: "WA", label: "Washington" },
  { code: "WV", label: "West Virginia" },
  { code: "WI", label: "Wisconsin" },
  { code: "WY", label: "Wyoming" },
];

// -------------------------------------------------------------------------
// <AddressForm.Name />
// -------------------------------------------------------------------------

export interface AddressFormNameProps {
  firstNameLabel?: React.ReactNode;
  lastNameLabel?: React.ReactNode;
}

function AddressFormName({
  firstNameLabel = "First name",
  lastNameLabel = "Last name",
}: AddressFormNameProps) {
  useAddressFormContext("Name");
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field
        name="firstName"
        label={firstNameLabel}
        autoComplete="given-name"
        required
        aria-required="true"
      />
      <Field
        name="lastName"
        label={lastNameLabel}
        autoComplete="family-name"
        required
        aria-required="true"
      />
    </div>
  );
}

AddressFormName.displayName = "AddressForm.Name";

// -------------------------------------------------------------------------
// <AddressForm.Address />
// -------------------------------------------------------------------------

export interface AddressFormAddressProps {
  line1Label?: React.ReactNode;
  line2Label?: React.ReactNode;
  line2Placeholder?: string;
}

function AddressFormAddress({
  line1Label = "Address",
  line2Label = "Apartment, suite, etc.",
  line2Placeholder = "Optional",
}: AddressFormAddressProps) {
  useAddressFormContext("Address");
  return (
    <div className="space-y-4">
      <Field
        name="address1"
        label={line1Label}
        autoComplete="address-line1"
        required
        aria-required="true"
      />
      <Field
        name="address2"
        label={line2Label}
        autoComplete="address-line2"
        placeholder={line2Placeholder}
      />
    </div>
  );
}

AddressFormAddress.displayName = "AddressForm.Address";

// -------------------------------------------------------------------------
// <AddressForm.Region />
// -------------------------------------------------------------------------

export interface AddressFormRegionProps {
  cityLabel?: React.ReactNode;
  provinceLabel?: React.ReactNode;
  postalCodeLabel?: React.ReactNode;
  countryLabel?: React.ReactNode;
  /** Override the country dropdown options. Codes should be ISO 3166-1 alpha-2. */
  countries?: ReadonlyArray<{ code: string; label: string }>;
  /** Override the US state dropdown options. Codes should be ISO 3166-2 (e.g. `NY`). */
  usStates?: ReadonlyArray<{ code: string; label: string }>;
}

function AddressFormRegion({
  cityLabel = "City",
  provinceLabel = "State / Province",
  postalCodeLabel = "Zip / Postal code",
  countryLabel = "Country",
  countries = DEFAULT_COUNTRIES,
  usStates = US_STATES,
}: AddressFormRegionProps) {
  const { value } = useAddressFormContext("Region");
  const isUS = (value.country ?? "") === "US";
  return (
    <div className="space-y-4">
      <Select
        name="country"
        label={countryLabel}
        options={countries}
        autoComplete="country"
        required
      />
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-4">
        <Field
          name="city"
          label={cityLabel}
          autoComplete="address-level2"
          required
          aria-required="true"
        />
        {isUS ? (
          <Select
            name="province"
            label={provinceLabel}
            options={usStates}
            autoComplete="address-level1"
            required
          />
        ) : (
          <Field
            name="province"
            label={provinceLabel}
            autoComplete="address-level1"
            required
            aria-required="true"
          />
        )}
        <Field
          name="postalCode"
          label={postalCodeLabel}
          autoComplete="postal-code"
          inputMode="numeric"
          required
          aria-required="true"
        />
      </div>
    </div>
  );
}

AddressFormRegion.displayName = "AddressForm.Region";

// -------------------------------------------------------------------------
// <AddressForm.Contact />
// -------------------------------------------------------------------------

export interface AddressFormContactProps {
  emailLabel?: React.ReactNode;
  phoneLabel?: React.ReactNode;
}

function AddressFormContact({
  emailLabel = "Email",
  phoneLabel = "Phone",
}: AddressFormContactProps) {
  useAddressFormContext("Contact");
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        name="email"
        label={emailLabel}
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        aria-required="true"
      />
      <Field
        name="phone"
        label={phoneLabel}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        aria-required="true"
      />
    </div>
  );
}

AddressFormContact.displayName = "AddressForm.Contact";

// -------------------------------------------------------------------------
// <AddressForm.Submit />
// -------------------------------------------------------------------------

export interface AddressFormSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** When true, the button shows the loading style and is disabled. */
  loading?: boolean;
  children: React.ReactNode;
}

function AddressFormSubmit({
  loading = false,
  disabled,
  className,
  type = "submit",
  children,
  ...rest
}: AddressFormSubmitProps) {
  const { disabled: formDisabled } = useAddressFormContext("Submit");
  const isInactive = disabled ?? formDisabled ?? loading;
  return (
    <button
      type={type}
      disabled={isInactive}
      className={cn(
        "mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition",
        isInactive
          ? "bg-line text-ink-3 cursor-not-allowed"
          : "bg-cta text-cta-fg hover:opacity-90",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

AddressFormSubmit.displayName = "AddressForm.Submit";

// -------------------------------------------------------------------------
// Compound export
// -------------------------------------------------------------------------

export const AddressForm = Object.assign(AddressFormRoot, {
  Name: AddressFormName,
  Address: AddressFormAddress,
  Region: AddressFormRegion,
  Contact: AddressFormContact,
  Submit: AddressFormSubmit,
});
