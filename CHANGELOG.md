# Changelog

All notable changes to `@rye-api/rewards-ui` will be documented here. Components are versioned together: a single semver release covers the full registry snapshot. Once installed, partners own their copy of the source. Upgrade by running `pnpm dlx shadcn@latest diff @rye-api/<component>` to see what changed before merging.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0]

First public release. Seven components covering the catalog → PDP → checkout → post-purchase lifecycle, plus a write-side address form.

### Distribution

- Self-hosted shadcn registry at [registry.rye.com](https://registry.rye.com/r/registry.json). Vercel auto-rebuilds on pushes to `main` — registry updates are atomic with component changes.
- Install via the shadcn CLI: `pnpm dlx shadcn@latest add @rye-api/<component>` (with a `@rye-api` registry entry in `components.json`) or by full URL. No npm publish.

### Components

- **`<ProductCard />`** — catalog tile with `in_stock`, `out_of_stock`, `marketplace_down`, and `image-failed` states. Ships with `<ProductCardSkeleton />`. Image fade-in on cold-load + cache-hit paths.
- **`<ProductDetails />`** — PDP with image gallery (caps at 8 thumbs + overflow caption), variant pickers (swatches / grid / cards, adaptive column count for long labels), inline revalidation alert, breadcrumbs accepting `string | { label, href }`, quantity stepper, and a redeem CTA that takes children + the standard `disabled` boolean (any button-like content works). Ships with `<ProductDetailsSkeleton />`.
- **`<VariantSelector />`** — standalone variant picker extracted from the PDP. Reusable inside a `<PaymentSheet />` or any other surface that needs variant selection.
- **`<PayWithPoints />`** — composable redemption slot with `<Header />`, `<Slider />`, and `<Summary />` subcomponents. Slider supports arrow-key + Home/End keyboard navigation. Summary surfaces the after-redemption balance plus a partial-coverage info card for insufficient-balance states. Enabling/disabling points is a consumer concern — wrap or conditionally render based on your own state.
- **`<PaymentSheet />`** — compound checkout sheet. `<Header />` / `<Alert />` / `<Item />` / `<Shipping />` / `<Section />` / `<MemberBenefit />` / `<CostBreakdown />` / `<Confirm />` / `<Actions />` subcomponents cover cash + member benefit, mixed tender, full points, and five error variants (variant gone, no shipping, unpriceable, marketplace down, card declined). `<Shipping />` consumes the canonical `Buyer` shape from `checkout-intents/resources`; `<Actions />` takes `React.ReactNode` icons.
- **`<OrderTracking />`** — compound post-purchase view covering 8 lifecycle states (`placed`, `processing`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `refunded`, `stuck_under_investigation`). Timeline is semantic `<ol>` / `<li>` with `aria-current="step"`. `InvestigationCard` carries `role="status"` + `aria-live="polite"`. Icon props throughout accept `React.ReactNode`; action buttons split icons into `leadingIcon` and `trailingIcon` slots for explicit placement.
- **`<AddressForm />`** — write-side companion to `<PaymentSheet.Shipping />`. Compound API (`<Name />` / `<Address />` / `<Region />` / `<Contact />` / `<Submit />`) producing the same `Buyer` shape `Shipping` consumes. Validation is consumer-owned via a `fieldErrors` prop; the component handles `aria-invalid` + error-message rendering. Browser autofill via canonical `autoComplete` attrs.

### Shared

- **`lib/format.ts`** — single edit point for `formatMoney(money)` and `formatPoints(points)`. Every component that displays money or points imports from here, so localizing or rebranding currency / points labels is a one-file change.
- **`lib/utils.ts`** — the standard shadcn `cn()` helper, installed via the `shadcn` registry dependency.

### Architecture

- **Invariant #1: no runtime API client.** The package cannot import `checkout-intents` (Rye API client) at runtime. Type imports are allowed and encouraged — components reference `Buyer`, `Money`, etc. so partners can pass intent responses straight through without remapping. Enforced via oxlint `no-restricted-imports` with `allowTypeImports: true`.
- **Invariant #2: partner is merchant of record.** Components never see a Rye API key. User auth is partner-owned; the SDK is a thin pipe between partner state and partner callbacks.
- **Invariant #3: theme-aware by default.** Every CTA, button, and glassy panel reads from CSS-var tokens (`--ink-1` / `--ink-2` / `--page` / `--card` / `--cta`). Partners override five tokens to rebrand without forking.
- All components declare `"use client"` to work as drop-ins inside Next.js App Router server components.
- Every sub-component exports its Props interface so partners typing wrappers get the right shape without re-declaring inline types.

### Tooling

- `pnpm registry:build` runs `shadcn build` and emits `public/r/<name>.json` files with inlined component sources.
- `pnpm build` runs the registry build then `vite build` so a Vercel deploy ships both the registry JSON files and a Vite playground in one go.
- `pnpm check` covers typecheck + lint + format + Tailwind audit + tests in one pipeline.
- `oxlint` `curly` rule enforces braced `if` statements.

### Notes on the registry shape

- The `product-details` registry item's types file is at `types/pdp.ts` (not `types/product-details.ts`). The original name collided with the item name and triggered a shadcn-cli import-collapse bug. `pdp` is standard ecommerce shorthand and unambiguous given the contents (`ProductDetailsData` plus shared variant types).
