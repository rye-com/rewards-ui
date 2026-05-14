# @rye-api/rewards-ui

Source-available React components for partners building rewards-program redemption flows on Rye. Designed for credit-card rewards programs, points-based loyalty apps, and corporate gifting.

> Published on public npm as `@rye-api/rewards-ui`, joining the rest of the `@rye-api` family (`@rye-api/rye-pay`, `@rye-api/rye-sdk`, `@rye-api/idempotency-redis`).

> Components ship as source via shadcn-style CLI. Partners install, own, and customize the source. No compiled black box, no theme variants to maintain.

## Status

v0.1.0 (pre-1.0). All five components from the design doc have landed and pass the full check pipeline (typecheck, lint, format, 71 vitest assertions, shadcn registry build). Remaining gates for the public install command:

- Registry hosting decision (see [Hosting](#hosting) below).
- npm publish of the `@rye-api/rewards-ui` CLI helper.

## Install

Two equivalent ways for partners to add a component to their app.

### Full URL (no setup)

```bash
pnpm dlx shadcn@latest add https://rewards-ui.rye.com/r/product-card.json
```

### Namespace shortcut (one-time setup)

Add a namespace to your project's `components.json`:

```json
{
  "registries": {
    "@rye-api": "https://rewards-ui.rye.com/r/{name}.json"
  }
}
```

Then:

```bash
pnpm dlx shadcn@latest add @rye-api/product-card
```

Either way, source files copy into `components/rye-rewards/` (configurable). You commit them and own the source from there.

## Components

| Component            | Surface                     | States covered                                                                                                                                                                                              |
| -------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<ProductCard />`    | Catalog tile                | in-stock, out-of-stock, subscription-only, marketplace-down, image-failed, plus a matching `<ProductCardSkeleton />`                                                                                        |
| `<ProductDetails />` | Compound PDP                | gallery, variant pickers (swatches / grid / cards), revalidation alert, quantity stepper, redeem CTA, plus `<ProductDetailsSkeleton />`                                                                     |
| `<PayWithPoints />`  | Composable slot             | balance pill, slider, enable toggle, after-redemption preview, insufficient-balance partial-coverage card                                                                                                   |
| `<PaymentSheet />`   | Compound checkout sheet     | Header / Alert / Item / Shipping / Section / MemberBenefit / CostBreakdown / Confirm / Actions / Skeleton subcomponents covering cash + member benefit, mixed tender, full points, plus five error variants |
| `<OrderTracking />`  | Compound post-purchase view | Header / StatusCard / InvestigationCard / Timeline / Item / RefundSummary / ActionsCard / InvestigationActions / InvestigationProgress subcomponents covering all 8 lifecycle states                        |

Full registry shape lives in `registry.json`.

## Stack

- React 19 with TypeScript strict
- Tailwind v4 with CSS custom-property tokens (swap five vars to rebrand the whole surface)
- [Base UI](https://base-ui.com/) primitives for behavior and accessibility
- Lucide for iconography

## Architecture invariants

1. **No API client at runtime.** This package does not import `checkout-intents` (or any other Rye API client) at runtime. Type imports are allowed and encouraged: components reference `checkout-intents` for its public type definitions so partners can pass API responses straight through without remapping. Components receive data via props and emit callbacks; the partner's backend is the only thing that talks to Rye's API. Enforced by an oxlint `no-restricted-imports` rule with `allowTypeImports: true`.
2. **Partner is merchant of record.** Components never see a Rye API key. User auth is partner-owned; the SDK is a dumb pipe between partner-supplied user state and partner-supplied callbacks.
3. **Theme-aware by default.** Every CTA, button, and glassy panel reads from CSS-var tokens (no hardcoded `text-white` on `bg-ink-1` pairs that flip in dark themes). Partners override five tokens in their own `globals.css` to rebrand without forking components.

See the design doc for full context.

## Development

```bash
pnpm install
pnpm dev                # vite playground on localhost:5173
pnpm check              # typecheck + lint + format + tests in one shot
pnpm registry:build     # generates public/r/*.json for hosting
```

Individual scripts (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format`) are also available.

## Hosting

Publishing to shadcn's official registry (`ui.shadcn.com`). Partners install via `shadcn@latest add @rye-api/<component>` once we're listed there, no Rye-side hosting infra to operate.

Until the listing lands, the `shadcn build` step emits `public/r/*.json` files that can be served from any HTTPS URL for testing. The install commands above will resolve to the official registry once published.

## License

MIT.
