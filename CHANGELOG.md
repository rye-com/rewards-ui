# Changelog

All notable changes to `@rye-api/rewards-ui` will be documented here. Components are versioned together: a single semver release covers the full registry snapshot. Once installed, partners own their copy of the source — upgrade by running `npx @rye-api/rewards-ui diff <component>` to see what changed before merging.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `<ProductCard />` — catalog tile with `in-stock`, `out-of-stock`, `subscription-only`, `marketplace-down`, and `image-failed` states. Ships with `<ProductCardSkeleton />`.
- `<ProductDetails />` — PDP with image gallery, variant pickers (swatches / grid / cards), inline revalidation alert, breadcrumbs (string or `{ label, href }`), quantity stepper, configurable redeem CTA.
- `<PayWithPoints />` — composable redemption slot with slider, balance pill, enable toggle, after-redemption preview, insufficient-balance partial-coverage state.
- `<PaymentSheet />` — compound checkout sheet covering cash + member benefit, mixed tender, full points, and five error variants (variant gone · no shipping · unpriceable · marketplace down · card declined).
- `<OrderTracking />` — compound post-purchase view covering 8 states: placed, processing, shipped, out-for-delivery, delivered, cancelled, refunded, stuck-under-investigation.

### Architecture

- Architecture Invariant #1 enforced via `eslint-plugin-import` `no-restricted-imports`: the package cannot import `checkout-intents` (Rye API client) or any of its sub-modules. Build-time guarantee that components never see a Rye API key.
- All components declare `"use client"` to work as drop-ins inside Next.js App Router server components.
