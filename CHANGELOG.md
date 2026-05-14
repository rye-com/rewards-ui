# Changelog

All notable changes to `@rye-api/rewards-ui` will be documented here. Components are versioned together: a single semver release covers the full registry snapshot. Once installed, partners own their copy of the source. Upgrade by running `npx @rye-api/rewards-ui diff <component>` to see what changed before merging.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `<ProductCard />` catalog tile with `in-stock`, `out-of-stock`, `subscription-only`, `marketplace-down`, and `image-failed` states. Ships with `<ProductCardSkeleton />`. Image fade-in on cold-load + cache-hit paths.
- `<ProductDetails />` PDP with image gallery (caps at 8 thumbs + overflow caption), variant pickers (swatches / grid / cards, adaptive column count for long labels), inline revalidation alert, breadcrumbs accepting `string | { label, href }`, quantity stepper, configurable redeem CTA via `redeemLabel` + `redeemSecondary`.
- `<PayWithPoints />` composable redemption slot with slider, balance pill, enable toggle, after-redemption preview, insufficient-balance partial-coverage card.
- `<PaymentSheet />` compound checkout sheet covering cash + member benefit, mixed tender, full points, and five error variants (variant gone, no shipping, unpriceable, marketplace down, card declined).
- `<OrderTracking />` compound post-purchase view covering 8 states (placed, processing, shipped, out-for-delivery, delivered, cancelled, refunded, stuck-under-investigation). Timeline is semantic `<ol>` / `<li>` with `aria-current="step"`. InvestigationCard carries `role="status"` + `aria-live="polite"`.

### Architecture

- Architecture Invariant #1 enforced via oxlint `no-restricted-imports` with `allowTypeImports: true`: the package cannot import `checkout-intents` (Rye API client) at runtime, but can (and does) import its types. Build-time guarantee that components never see a Rye API key while still sharing Rye's public type definitions.
- All components declare `"use client"` to work as drop-ins inside Next.js App Router server components.
- Theme-safe CTAs throughout: `bg-ink-1 text-page hover:opacity-90` rather than `text-white hover:bg-black`, so Slate (`ink-1: white`) and Premium (`ink-1: cream`) themes render correctly.
- Theme-safe glassy panels (`bg-card/95` instead of `bg-white/95`) so subscription / marketplace-down callouts adapt to dark themes.
- Every sub-component on `<OrderTracking />` exports its Props interface, so partners typing wrappers around the compound surface get the right shape without re-declaring inline types.
