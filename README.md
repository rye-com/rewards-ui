# rye-rewards-ui

Source-available React components for partners building rewards-program redemption flows on Rye. Designed for credit-card rewards programs, points-based loyalty apps, and corporate gifting.

> Published on public npm as `rye-rewards-ui`, unscoped, matching the `rye-pay` / `checkout-intents` pattern from Rye's existing partner-facing packages.

> Components ship as source via shadcn-style CLI. Partners install, own, and customize the source — no compiled black box, no theme variants to maintain.

## Status

Pre-1.0 (v0.x). All five v1 components have landed: `<ProductCard />`, `<ProductDetails />` (compound), `<PayWithPoints />`, `<PaymentSheet />` (compound), `<OrderTracking />`. Registry builds via `pnpm registry:build`. Hosting + npm publish are the remaining v0.1 gates.

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
    "@rye": "https://rewards-ui.rye.com/r/{name}.json"
  }
}
```

Then:

```bash
pnpm dlx shadcn@latest add @rye/product-card
```

Either way, source files copy into `components/rye-rewards/` (configurable). You commit them and own the source from there.

## Components

Listed in `registry.json`. v1 ships:

- `<ProductCard />` — catalog tile
- `<ProductDetails.Root>` — PDP with compound sub-components
- `<PaymentSheet.Root>` — checkout sheet with compound sub-components
- `<PayWithPoints />` — points-redemption slot
- `<OrderTracking />` — post-purchase status timeline

## Stack

- React 19 + TypeScript strict
- Tailwind v4 with CSS custom-property tokens
- [Base UI](https://base-ui.com/) primitives for a11y / behavior
- Lucide for iconography

## Architecture invariants

1. **No API client dependency.** This package does not import `checkout-intents` or any other Rye API client. Components receive data via props and emit callbacks; the partner's backend is the only thing that talks to Rye's API. Enforced by an ESLint rule.
2. **Partner is merchant of record.** Components never see a Rye API key. User auth is partner-owned; the SDK is a dumb pipe between partner-supplied user state and partner-supplied callbacks.

See the design doc for full context.

## Development

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm registry:build   # generates public/r/*.json
```

## Hosting

**TBD.** The `shadcn build` step emits `public/r/*.json` files that need to be served at a stable HTTPS URL. Candidates under discussion:

- An existing Rye-controlled host (`rye-api` infra, `docs.rye.com`), so registry URLs live on `rye.com` natively.
- GitHub Pages from this repo, CNAMEd to `rewards-ui.rye.com`.

Decision blocks shipping the partner-facing install command in this README. Tracked separately.

## License

MIT.
