# @rye-api/rewards-ui

Source-available React components for partners building rewards-program redemption flows on Rye. Designed for credit-card rewards programs, points-based loyalty apps, and corporate gifting.

> Components ship as source via the shadcn CLI against our hosted registry at `registry.rye.com`. Partners install, own, and customize the source — no compiled black box, no theme variants to maintain, no npm dep to upgrade.

**📖 Docs:** [docs.rye.com/rewards](https://docs.rye.com/rewards/introduction) — install guide, component reference, integration cookbook.
**🎁 Demo:** [rewards.rye.com](https://rewards.rye.com) — every component in every state.
**📦 Registry:** [registry.rye.com](https://registry.rye.com/r/registry.json) — the shadcn-CLI endpoint.

## Status

v1.0.0. Seven components covering the full catalog → PDP → checkout → post-purchase lifecycle (`<ProductCard />`, `<ProductDetails />`, `<VariantSelector />`, `<PayWithPoints />`, `<PaymentSheet />`, `<OrderTracking />`, `<AddressForm />`) — all pass the full check pipeline (typecheck, lint, format, 83 vitest assertions, shadcn registry build).

Registry is hosted at [registry.rye.com](https://registry.rye.com/r/registry.json) (Vercel) and consumed via the shadcn CLI — see [Install](#install).

## Install

Two equivalent ways for partners to add a component to their app.

### Full URL (no setup)

```bash
pnpm dlx shadcn@latest add https://registry.rye.com/r/product-card.json
```

### Namespace shortcut (one-time setup)

Add a namespace to your project's `components.json`:

```json
{
  "registries": {
    "@rye-api": "https://registry.rye.com/r/{name}.json"
  }
}
```

Then:

```bash
pnpm dlx shadcn@latest add @rye-api/product-card
```

Either way, source files copy into `components/rye-rewards/` (configurable). You commit them and own the source from there.

## Components

| Component             | Surface                     | States covered                                                                                                                                                                                              |
| --------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<ProductCard />`     | Catalog tile                | in_stock, out_of_stock, marketplace_down, image-failed, plus a matching `<ProductCardSkeleton />`                                                                                                           |
| `<ProductDetails />`  | Compound PDP                | gallery, variant pickers (swatches / grid / cards), revalidation alert, quantity stepper, redeem CTA, plus `<ProductDetailsSkeleton />`                                                                     |
| `<VariantSelector />` | Standalone variant picker   | swatches / grid / cards styles with a revalidation-error state. Used inside `<ProductDetails.Variants />` or standalone in a `<PaymentSheet />` flow.                                                       |
| `<PayWithPoints />`   | Composable slot             | balance pill, slider, after-redemption preview, insufficient-balance partial-coverage card                                                                                                                  |
| `<PaymentSheet />`    | Compound checkout sheet     | Header / Alert / Item / Shipping / Section / MemberBenefit / CostBreakdown / Confirm / Actions / Skeleton subcomponents covering cash + member benefit, mixed tender, full points, plus five error variants |
| `<OrderTracking />`   | Compound post-purchase view | Header / StatusCard / InvestigationCard / Timeline / Item / RefundSummary / ActionsCard / InvestigationActions / InvestigationProgress subcomponents covering all 8 lifecycle states                        |

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

The registry is self-hosted at [registry.rye.com](https://registry.rye.com/r/registry.json) — a Vercel project pinned to this repo's `main`. `pnpm registry:build` (run automatically on deploy via `vercel.json`) executes `shadcn build`, which inlines each component's source into `public/r/<name>.json`. Vercel serves those static JSON files; the shadcn CLI fetches them when partners run `shadcn add @rye-api/<name>`.

Pushes to `main` trigger a redeploy automatically — there's no manual publish step. Registry updates are atomic with component changes.

## License

MIT.
