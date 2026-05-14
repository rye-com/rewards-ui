import type { ReactNode } from "react";

import { ProductCard, ProductCardSkeleton } from "../registry/default/components/product-card";
import { products } from "./data";

export default function App() {
  return (
    <div className="bg-page min-h-screen px-10 py-12">
      <div className="mx-auto max-w-[1200px] space-y-16">
        <Header />

        <Section title="Catalog grid" eyebrow="ProductCard · default">
          <Grid>
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Grid>
        </Section>

        <Section title="Edge states" eyebrow="ProductCard · non-default availability">
          <Grid>
            {products.map((product) => (
              <div key={product.id}>
                <Label>{labelFor(product.availability.kind)}</Label>
                <ProductCard product={product} />
              </div>
            ))}
          </Grid>
        </Section>

        <Section title="Loading skeleton" eyebrow="ProductCardSkeleton">
          <Grid>
            {Array.from({ length: 4 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </Grid>
        </Section>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="border-line border-b pb-6">
      <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.14em] uppercase">
        @rye-api/rewards-ui
      </div>
      <h1 className="text-ink-1 mt-2 text-[28px] font-semibold -tracking-[0.02em]">Playground</h1>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.14em] uppercase">
        {eyebrow}
      </div>
      <h2 className="text-ink-1 mt-1 mb-6 text-[20px] font-semibold -tracking-[0.02em]">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-4 gap-x-6 gap-y-10">{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-ink-3 mb-3 text-[11px] font-medium tracking-[0.12em] uppercase">
      {children}
    </div>
  );
}

function labelFor(kind: string): string {
  switch (kind) {
    case "in-stock":
      return "In stock";
    case "out-of-stock":
      return "Out of stock";
    case "subscription-only":
      return "Subscription only";
    case "marketplace-down":
      return "Marketplace down";
    default:
      return kind;
  }
}
