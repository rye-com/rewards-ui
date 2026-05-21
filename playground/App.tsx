import type { ReactNode } from "react";

import { ProductCard, ProductCardSkeleton } from "../registry/default/components/product-card";
import type { ProductAvailability } from "../registry/default/types/product";
import { products } from "./data";

const availabilityLabels: Record<ProductAvailability["kind"], string> = {
  in_stock: "In stock",
  out_of_stock: "Out of stock",
  marketplace_down: "Marketplace down",
};

export default function App() {
  return (
    <div className="bg-page min-h-screen px-10 py-12">
      <div className="mx-auto max-w-[1200px] space-y-16">
        <Header />

        <Section title="Catalog grid" eyebrow="ProductCard · default">
          <Grid>
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product}>
                <ProductCard.Image />
                <ProductCard.Info />
              </ProductCard>
            ))}
          </Grid>
        </Section>

        <Section title="Edge states" eyebrow="ProductCard · non-default availability">
          <Grid>
            {products.map((product) => (
              <div key={product.id}>
                <Label>{availabilityLabels[product.availability.kind]}</Label>
                <ProductCard product={product}>
                  <ProductCard.Image />
                  <ProductCard.Info />
                </ProductCard>
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
      <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">
        @rye-api/rewards-ui
      </div>
      <h1 className="text-ink-1 mt-2 text-3xl font-semibold">Playground</h1>
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
      <div className="text-ink-3 text-xs font-medium tracking-widest uppercase">{eyebrow}</div>
      <h2 className="text-ink-1 mt-1 mb-6 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-4 gap-x-6 gap-y-10">{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-ink-3 mb-3 text-xs font-medium tracking-widest uppercase">{children}</div>
  );
}
