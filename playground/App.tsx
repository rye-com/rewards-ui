import { useState } from "react";
import { Sparkles } from "lucide-react";

import { ProductCard, ProductCardSkeleton } from "../registry/default/components/product-card";
import {
  ProductDetails,
  ProductDetailsSkeleton,
} from "../registry/default/components/product-details";
import { PayWithPoints } from "../registry/default/components/pay-with-points";
import { PaymentSheet } from "../registry/default/components/payment-sheet";
import { OrderTracking } from "../registry/default/components/order-tracking";
import type { VariantSelection } from "../registry/default/types/product-details";

import { aesopConfigurator, products, sweaterPDP } from "./data";

type View =
  | "catalog"
  | "pdp-ready"
  | "pdp-loading"
  | "pdp-configurator"
  | "pdp-revalidation"
  | "pwp-mixed"
  | "pwp-full"
  | "pwp-off"
  | "pwp-insufficient"
  | "ps-cash-benefit"
  | "ps-mixed"
  | "ps-full-points"
  | "ps-loading"
  | "ps-err-variant"
  | "ps-err-shipping"
  | "ps-err-unpriceable"
  | "ps-err-marketplace"
  | "ps-err-partner"
  | "ot-placed"
  | "ot-processing"
  | "ot-shipped"
  | "ot-out-for-delivery"
  | "ot-delivered"
  | "ot-cancelled"
  | "ot-refunded"
  | "ot-stuck";

export function App() {
  const [view, setView] = useState<View>("catalog");
  return (
    <div className="bg-page min-h-screen">
      <Nav view={view} onChange={setView} />
      <div className="px-10 py-12">
        <RenderView view={view} />
      </div>
    </div>
  );
}

function RenderView({ view }: { view: View }) {
  if (view === "catalog") return <CatalogView />;
  if (view.startsWith("pdp")) return <PdpView view={view} />;
  if (view.startsWith("pwp")) return <PwpView view={view} />;
  if (view.startsWith("ps")) return <PsView view={view} />;
  if (view.startsWith("ot")) return <OtView view={view} />;
  return null;
}

// -------------------------------------------------------------------------
// Nav
// -------------------------------------------------------------------------

function Nav({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const groups: Array<{ name: string; items: Array<{ id: View; label: string }> }> = [
    { name: "ProductCard", items: [{ id: "catalog", label: "Catalog" }] },
    {
      name: "ProductDetails",
      items: [
        { id: "pdp-ready", label: "Ready" },
        { id: "pdp-loading", label: "Loading" },
        { id: "pdp-configurator", label: "Configurator" },
        { id: "pdp-revalidation", label: "Revalidation" },
      ],
    },
    {
      name: "PayWithPoints",
      items: [
        { id: "pwp-mixed", label: "Mixed" },
        { id: "pwp-full", label: "Full" },
        { id: "pwp-off", label: "Off" },
        { id: "pwp-insufficient", label: "Insufficient" },
      ],
    },
    {
      name: "PaymentSheet",
      items: [
        { id: "ps-cash-benefit", label: "Cash + benefit" },
        { id: "ps-mixed", label: "Mixed tender" },
        { id: "ps-full-points", label: "Full points" },
        { id: "ps-loading", label: "Loading" },
        { id: "ps-err-variant", label: "Err: variant" },
        { id: "ps-err-shipping", label: "Err: shipping" },
        { id: "ps-err-unpriceable", label: "Err: unpriced" },
        { id: "ps-err-marketplace", label: "Err: market down" },
        { id: "ps-err-partner", label: "Err: partner" },
      ],
    },
    {
      name: "OrderTracking",
      items: [
        { id: "ot-placed", label: "Placed" },
        { id: "ot-processing", label: "Processing" },
        { id: "ot-shipped", label: "Shipped" },
        { id: "ot-out-for-delivery", label: "Out for delivery" },
        { id: "ot-delivered", label: "Delivered" },
        { id: "ot-cancelled", label: "Cancelled" },
        { id: "ot-refunded", label: "Refunded" },
        { id: "ot-stuck", label: "Stuck" },
      ],
    },
  ];
  return (
    <div className="border-line bg-card sticky top-0 z-10 border-b">
      <div className="mx-auto max-w-[1200px] px-10 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px]">
          {groups.map((g) => (
            <div key={g.name} className="flex items-center gap-1.5">
              <span className="text-ink-3 mr-1 text-[10px] font-medium tracking-[0.12em] uppercase">
                {g.name}
              </span>
              {g.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  className={
                    view === item.id
                      ? "bg-ink-1 rounded-full px-2.5 py-1 font-medium text-white transition"
                      : "text-ink-2 hover:text-ink-1 rounded-full px-2.5 py-1 transition"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Catalog
// -------------------------------------------------------------------------

function CatalogView() {
  const [selectedId, setSelectedId] = useState<string | null>("bellroy-sleeve");
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="border-line mb-10 flex items-end justify-between border-b pb-6">
        <div>
          <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.14em] uppercase">
            Rewards Catalog
          </div>
          <div className="text-ink-1 mt-2 text-[28px] font-semibold -tracking-[0.02em]">
            Curated for you
          </div>
        </div>
        <div className="bg-points-soft text-points inline-flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <Sparkles size={13} strokeWidth={2.25} />
          <span className="text-[12.5px] font-semibold -tracking-[0.02em] tabular-nums">
            12,450 pts
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-x-6 gap-y-12">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            href={`/p/${p.id}`}
            selected={p.id === selectedId}
            onClick={(e) => {
              e.preventDefault();
              setSelectedId(p.id === selectedId ? null : p.id);
            }}
            onNotify={(prod) => alert(`Would notify you about ${prod.name}`)}
          />
        ))}
        <ProductCardSkeleton />
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// PDP
// -------------------------------------------------------------------------

function PdpView({ view }: { view: View }) {
  const [sel, setSel] = useState<VariantSelection>({ color: "slate-blue", size: "m" });
  const [conf, setConf] = useState<VariantSelection>({
    cleanser: "parsley",
    "hand-wash": "reverence",
    "hand-balm": "resurrection",
  });
  const [gallery, setGallery] = useState(0);

  if (view === "pdp-loading") return <ProductDetailsSkeleton />;
  if (view === "pdp-configurator") {
    return (
      <ProductDetails
        data={aesopConfigurator}
        selection={conf}
        onSelectionChange={(d, o) => setConf((p) => ({ ...p, [d]: o }))}
        selectedImageIndex={gallery}
        onImageSelect={setGallery}
        breadcrumbs={["Catalog", "Build your own", "Aesop Discovery Set"]}
        onRedeem={() => alert("Would create checkout intent")}
        {...(conf["bonus"] ? {} : { redeemDisabledReason: "Pick a bonus mini to continue" })}
      />
    );
  }
  if (view === "pdp-revalidation") {
    return (
      <ProductDetails
        data={{
          ...sweaterPDP,
          dimensions: sweaterPDP.dimensions.map((d) =>
            d.id === "size"
              ? {
                  ...d,
                  options: d.options.map((o) =>
                    o.id === "m" ? { ...o, justBecameUnavailable: true } : o,
                  ),
                }
              : d,
          ),
        }}
        selection={sel}
        onSelectionChange={(d, o) => setSel((p) => ({ ...p, [d]: o }))}
        selectedImageIndex={gallery}
        onImageSelect={setGallery}
        breadcrumbs={["Catalog", "Knitwear", "Sigfred Merino Crew"]}
        revalidationError={{
          headline: "Slate Blue · M just became unavailable",
          detail:
            "Stock changed while you were viewing. Pick a different size or color to continue.",
        }}
        redeemDisabledReason="Pick another size or color to continue"
      />
    );
  }
  return (
    <ProductDetails
      data={sweaterPDP}
      selection={sel}
      onSelectionChange={(d, o) => setSel((p) => ({ ...p, [d]: o }))}
      selectedImageIndex={gallery}
      onImageSelect={setGallery}
      breadcrumbs={["Catalog", "Knitwear", "Sigfred Merino Crew"]}
      onRedeem={() => alert("Would create checkout intent")}
    />
  );
}

// -------------------------------------------------------------------------
// PayWithPoints
// -------------------------------------------------------------------------

function PwpView({ view }: { view: View }) {
  const [applied, setApplied] = useState(4500);
  const [enabled, setEnabled] = useState(true);

  if (view === "pwp-full") {
    return (
      <div className="mx-auto max-w-[440px]">
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={8900}
          onAppliedChange={() => undefined}
        />
      </div>
    );
  }
  if (view === "pwp-off") {
    return (
      <div className="mx-auto max-w-[440px]">
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={0}
          onAppliedChange={() => undefined}
          enabled={enabled}
          onEnabledChange={setEnabled}
        />
      </div>
    );
  }
  if (view === "pwp-insufficient") {
    return (
      <div className="mx-auto max-w-[440px]">
        <PayWithPoints
          balance={500}
          maxApplicable={8900}
          applied={500}
          onAppliedChange={() => undefined}
          orderTotal={{ currency: "USD", value: "89.00" }}
        />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-[440px]">
      <PayWithPoints
        balance={12450}
        maxApplicable={8900}
        applied={applied}
        onAppliedChange={setApplied}
      />
    </div>
  );
}

// -------------------------------------------------------------------------
// PaymentSheet
// -------------------------------------------------------------------------

const aesopItem = {
  vendor: "Aesop",
  name: "Resurrection Aromatique Hand Wash",
  subtitle: "500 mL",
  imageUrl: "https://picsum.photos/seed/aesop-handwash/200/200",
  price: { currency: "USD", value: "89.00" },
  pointsPrice: 8900,
};

const sweaterItem = {
  vendor: "Norse Projects",
  name: "Sigfred Merino Crew Sweater",
  subtitle: "Slate Blue · M · Qty 1",
  imageUrl: "https://picsum.photos/seed/norse-1/200/200",
  price: { currency: "USD", value: "245.00" },
};

const address = {
  name: "Nathan Pegram",
  lines: ["350 Mission St, Apt 4C", "San Francisco, CA 94105"],
};

function PsView({ view }: { view: View }) {
  return (
    <div className="flex justify-center">
      {view === "ps-cash-benefit" && <PsCashBenefit />}
      {view === "ps-mixed" && <PsMixedTender />}
      {view === "ps-full-points" && <PsFullPoints />}
      {view === "ps-loading" && <PaymentSheet.Skeleton />}
      {view === "ps-err-variant" && <PsErrVariant />}
      {view === "ps-err-shipping" && <PsErrShipping />}
      {view === "ps-err-unpriceable" && <PsErrUnpriceable />}
      {view === "ps-err-marketplace" && <PsErrMarketplace />}
      {view === "ps-err-partner" && <PsErrPartner />}
    </div>
  );
}

function PsCashBenefit() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header
        title="Confirm your order"
        subtitle="Includes your member benefit"
        onBack={() => undefined}
        onClose={() => undefined}
      />
      <PaymentSheet.Item item={aesopItem} />
      <PaymentSheet.Shipping address={address} onEdit={() => undefined} />
      <PaymentSheet.MemberBenefit
        title="Member benefit applied"
        description="15% off Aesop, automatically applied at checkout for active members."
        amount={{ currency: "USD", value: "-13.35" }}
      />
      <PaymentSheet.CostBreakdown
        lines={[
          { label: "Subtotal", value: "$89.00" },
          { label: "Member discount", hint: "· 15%", value: "−$13.35", tone: "points" },
          { label: "Shipping", hint: "· Standard, 3–5 days", value: "Free" },
          { label: "Tax", hint: "· CA 8.625%", value: "$6.53" },
        ]}
        total={{ label: "Total due", value: "$82.18" }}
      />
      <PaymentSheet.Confirm
        label="Confirm order"
        secondary="$82.18"
        footerNote="Charged to your card on file. Member benefit funded by your rewards program."
      />
    </PaymentSheet>
  );
}

function PsMixedTender() {
  const [applied, setApplied] = useState(4500);
  return (
    <PaymentSheet>
      <PaymentSheet.Header
        title="Confirm redemption"
        subtitle="One item · Standard delivery"
        onBack={() => undefined}
        onClose={() => undefined}
      />
      <PaymentSheet.Item item={aesopItem} />
      <PaymentSheet.Shipping address={address} onEdit={() => undefined} />
      <PaymentSheet.Section>
        <PayWithPoints
          balance={12450}
          maxApplicable={8900}
          applied={applied}
          onAppliedChange={setApplied}
        />
      </PaymentSheet.Section>
      <PaymentSheet.CostBreakdown
        lines={[
          { label: "Subtotal", value: "$89.00" },
          { label: "Shipping", hint: "· Standard, 3–5 days", value: "Free" },
          { label: "Tax", hint: "· CA 8.625%", value: "$7.68" },
          {
            label: "Points discount",
            hint: `· ${applied.toLocaleString()} pts`,
            value: `−$${(applied / 100).toFixed(2)}`,
            tone: "points",
          },
        ]}
        total={{
          label: "Total due",
          value: `$${(96.68 - applied / 100).toFixed(2)}`,
        }}
      />
      <PaymentSheet.Confirm
        label="Confirm redemption"
        secondary={`$${(96.68 - applied / 100).toFixed(2)}`}
        footerNote={`Your card on file will be charged $${(96.68 - applied / 100).toFixed(
          2,
        )}. ${applied.toLocaleString()} points will be deducted upon order placement.`}
      />
    </PaymentSheet>
  );
}

function PsFullPoints() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header
        title="Confirm redemption"
        subtitle="Paying entirely with points"
        onBack={() => undefined}
        onClose={() => undefined}
      />
      <PaymentSheet.Item item={aesopItem} />
      <PaymentSheet.Shipping address={address} onEdit={() => undefined} />
      <PaymentSheet.Section>
        <PayWithPoints
          balance={12450}
          maxApplicable={9668}
          applied={9668}
          onAppliedChange={() => undefined}
        />
      </PaymentSheet.Section>
      <PaymentSheet.CostBreakdown
        lines={[
          { label: "Subtotal", value: "$89.00" },
          { label: "Shipping", hint: "· Standard, 3–5 days", value: "Free" },
          { label: "Tax", hint: "· CA 8.625%", value: "$7.68" },
          { label: "Points discount", hint: "· 9,668 pts", value: "−$96.68", tone: "points" },
        ]}
        total={{ label: "Total due", value: "$0.00", tone: "points" }}
      />
      <PaymentSheet.Confirm
        label="Redeem with points"
        secondary="9,668 pts"
        footerNote="No card charge. Points are deducted upon order placement."
      />
    </PaymentSheet>
  );
}

function PsErrVariant() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header title="Confirm redemption" />
      <PaymentSheet.Alert tone="error" title="Slate Blue · M just sold out">
        Stock changed while you were checking out. Pick another size or color to continue.
      </PaymentSheet.Alert>
      <PaymentSheet.Item item={sweaterItem} dimmed strikePrice />
      <PaymentSheet.Confirm label="Pick another variant to continue" disabled />
    </PaymentSheet>
  );
}

function PsErrShipping() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header title="Confirm redemption" />
      <PaymentSheet.Item item={aesopItem} />
      <PaymentSheet.Shipping
        address={{ name: "Nathan Pegram", lines: ["PO Box 1284, APO AE 09421"] }}
        onEdit={() => undefined}
        shipError={{
          headline: "Can't ship to this address",
          detail:
            "Aesop doesn't ship to this destination. Update the shipping address to continue.",
        }}
      />
      <PaymentSheet.Confirm label="Update address to continue" disabled />
    </PaymentSheet>
  );
}

function PsErrUnpriceable() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header title="Confirm redemption" />
      <PaymentSheet.Item
        item={{
          ...sweaterItem,
          vendor: "Bose",
          name: "QuietComfort Ultra Earbuds",
          subtitle: "Black",
          imageUrl: "https://picsum.photos/seed/bose-earbuds/200/200",
        }}
        unpriceable
      />
      <PaymentSheet.CostBreakdown
        lines={[
          { label: "Subtotal", value: "—" },
          { label: "Shipping", value: "—" },
          { label: "Tax", value: "—" },
        ]}
        total={{ label: "Total due", value: "Unable to price", tone: "error" }}
        inlineNote={{
          tone: "error",
          title: "Bose couldn't price this item right now.",
          detail: "This usually clears in a few minutes — try again, or pick a different product.",
        }}
      />
      <PaymentSheet.Actions
        primary={{ label: "Try again", icon: "rotate-ccw", onClick: () => undefined }}
        secondary={{ label: "Confirm", disabled: true }}
      />
    </PaymentSheet>
  );
}

function PsErrMarketplace() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header title="Confirm redemption" />
      <PaymentSheet.Alert tone="amber" title="Norse Projects ordering temporarily paused">
        The merchant has briefly paused ordering. We&apos;ll notify you when it&apos;s back —
        usually within a few hours.
      </PaymentSheet.Alert>
      <PaymentSheet.Item item={sweaterItem} dimmed />
      <PaymentSheet.Actions
        primary={{ label: "Notify me", icon: "rotate-ccw", onClick: () => undefined }}
        secondary={{ label: "Browse other items", onClick: () => undefined }}
      />
    </PaymentSheet>
  );
}

function PsErrPartner() {
  return (
    <PaymentSheet>
      <PaymentSheet.Header title="Confirm redemption" />
      <PaymentSheet.Item item={aesopItem} />
      <PaymentSheet.CostBreakdown lines={[]} total={{ label: "Total due", value: "$96.68" }} />
      <PaymentSheet.Alert tone="error" title="Your card on file was declined">
        Update payment in your account settings to continue. Your points balance is unchanged.
      </PaymentSheet.Alert>
      <PaymentSheet.Actions
        primary={{ label: "Update payment", icon: "rotate-ccw", onClick: () => undefined }}
        secondary={{ label: "Confirm", disabled: true }}
      />
    </PaymentSheet>
  );
}

// -------------------------------------------------------------------------
// OrderTracking
// -------------------------------------------------------------------------

const sweaterImg = "https://picsum.photos/seed/norse-1/300/300";

function OtView({ view }: { view: View }) {
  if (view === "ot-placed") return <OtPlaced />;
  if (view === "ot-processing") return <OtProcessing />;
  if (view === "ot-shipped") return <OtShipped />;
  if (view === "ot-out-for-delivery") return <OtOFD />;
  if (view === "ot-delivered") return <OtDelivered />;
  if (view === "ot-cancelled") return <OtCancelled />;
  if (view === "ot-refunded") return <OtRefunded />;
  if (view === "ot-stuck") return <OtStuck />;
  return null;
}

function OtPlaced() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Just placed · 2 minutes ago"
        pill={{ label: "Order placed", tone: "active", pulse: true }}
      />
      <OrderTracking.StatusCard
        eyebrow="Status"
        title="Awaiting merchant confirmation"
        description="Norse Projects typically accepts orders within 24 hours."
        meta={[
          {
            icon: "clock",
            text: (
              <>
                Estimated ship by <span className="text-ink-1 font-medium">Mon, May 12</span>
              </>
            ),
          },
        ]}
        image={{ url: sweaterImg }}
        itemCount={1}
      />
      <OrderTracking.Timeline
        steps={[
          {
            label: "Order placed",
            status: "current",
            badge: "Now",
            description: "Confirmation sent to your email",
            timestamp: "May 7, 2:14 PM",
          },
          { label: "Processing", status: "pending", description: "Pending merchant acceptance" },
          { label: "Shipped", status: "pending", description: "Estimated Mon, May 12" },
          { label: "Delivered", status: "pending", description: "Estimated Wed, May 14" },
        ]}
      />
      <OrderTracking.Item
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
        price={{ currency: "USD", value: "245.00" }}
        pointsApplied={12250}
      />
      <OrderTracking.ActionsCard
        title="Need to cancel?"
        callout={{
          tone: "points",
          icon: "clock",
          title: "You can still cancel",
          description:
            "Norse Projects hasn't started processing yet. Cancel now and your points and card charge are reversed in full.",
        }}
        actions={[
          { label: "Order details" },
          { label: "Cancel order", variant: "primary", onClick: () => alert("would cancel") },
        ]}
      />
    </OrderTracking>
  );
}

function OtProcessing() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "Processing", tone: "active", pulse: true }}
      />
      <OrderTracking.StatusCard
        eyebrow="Status"
        title="Norse Projects is preparing your order"
        description="Your order has been accepted and is being prepared for shipment. You'll get a tracking number once it ships."
        meta={[
          {
            icon: "clock",
            text: (
              <>
                Estimated ship by <span className="text-ink-1 font-medium">Tue, May 12</span>
              </>
            ),
          },
        ]}
        image={{ url: sweaterImg }}
        itemCount={1}
      />
      <OrderTracking.Timeline
        steps={[
          {
            label: "Order placed",
            status: "complete",
            description: "Confirmation sent to your email",
            timestamp: "May 5, 2:14 PM",
          },
          {
            label: "Processing",
            status: "current",
            badge: "Now",
            description: "Norse Projects accepted your order",
            timestamp: "May 6, 9:02 AM",
          },
          { label: "Shipped", status: "pending", description: "Estimated Tue, May 12" },
          { label: "Delivered", status: "pending", description: "Estimated Thu, May 14" },
        ]}
      />
      <OrderTracking.Item
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
        price={{ currency: "USD", value: "245.00" }}
        pointsApplied={12250}
      />
      <OrderTracking.ActionsCard
        title="Need changes?"
        callout={{
          tone: "inset",
          icon: "info",
          title: "Order is being prepared",
          description:
            "Cancellation isn't available once the merchant has started processing. To cancel or change, contact Norse Projects directly.",
        }}
        actions={[
          { label: "Cancel order", disabled: true },
          { label: "Contact Norse Projects", variant: "primary", icon: "arrow-right" },
        ]}
      />
    </OrderTracking>
  );
}

function OtShipped() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "In transit", tone: "active", pulse: true }}
      />
      <OrderTracking.StatusCard
        eyebrow="Estimated arrival"
        title="Wed, May 14"
        description="Between 11:00 AM – 6:00 PM"
        meta={[
          {
            icon: "truck",
            text: (
              <>
                UPS ·{" "}
                <a
                  className="text-ink-1 hover:text-ink-2 border-line-strong hover:border-ink-2 ml-1 border-b pb-px font-medium tabular-nums transition"
                  href="#"
                >
                  1Z999AA10123456784
                </a>
              </>
            ),
          },
        ]}
        image={{ url: sweaterImg }}
        itemCount={1}
      />
      <OrderTracking.Timeline
        steps={[
          {
            label: "Order placed",
            status: "complete",
            description: "Confirmation sent to your email",
            timestamp: "May 5, 2:14 PM",
          },
          {
            label: "Processing",
            status: "complete",
            description: "Order accepted by Norse Projects",
            timestamp: "May 6, 9:02 AM",
          },
          {
            label: "Shipped",
            status: "current",
            badge: "Now",
            description: "Departed fulfillment center · UPS Ground",
            timestamp: "May 7, 11:48 AM",
            lastUpdate: "Package scanned at UPS facility, San Bruno CA · 6:32 AM",
          },
          { label: "Out for delivery", status: "pending", description: "Pending" },
          { label: "Delivered", status: "pending", description: "Estimated Wed, May 14" },
        ]}
      />
      <OrderTracking.Item
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
        price={{ currency: "USD", value: "245.00" }}
        pointsApplied={12250}
      />
      <OrderTracking.ActionsCard
        title="Need changes?"
        callout={{
          tone: "inset",
          icon: "info",
          title: "This order has shipped",
          description:
            "Cancellation isn't available once the carrier has the package. To return for a refund after delivery, use the link below.",
        }}
        actions={[
          { label: "Cancel order", disabled: true },
          { label: "Start a return", variant: "primary", icon: "arrow-right" },
        ]}
        footer={
          <>
            Questions about the product itself?{" "}
            <a
              href="#"
              className="text-ink-1 hover:text-ink-2 font-medium underline underline-offset-2 transition"
            >
              Contact Norse Projects directly
            </a>{" "}
            · they handle product, shipping, and warranty.
          </>
        }
      />
    </OrderTracking>
  );
}

function OtOFD() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "Out for delivery", tone: "active", pulse: true }}
      />
      <OrderTracking.StatusCard
        eyebrow="Arriving today"
        title="Between 11:00 AM – 6:00 PM"
        description="Wed, May 14"
        meta={[
          {
            icon: "truck",
            text: (
              <>
                UPS ·{" "}
                <a
                  href="#"
                  className="text-ink-1 hover:text-ink-2 border-line-strong hover:border-ink-2 ml-1 border-b pb-px font-medium transition"
                >
                  Track in real-time
                </a>
              </>
            ),
          },
        ]}
        image={{ url: sweaterImg }}
        itemCount={1}
      />
      <OrderTracking.Timeline
        steps={[
          { label: "Order placed", status: "complete", timestamp: "May 5" },
          { label: "Processing", status: "complete", timestamp: "May 6" },
          { label: "Shipped", status: "complete", description: "UPS Ground", timestamp: "May 7" },
          {
            label: "Out for delivery",
            status: "current",
            badge: "Now",
            description: "On a UPS truck headed to your address",
            timestamp: "May 14, 8:14 AM",
            lastUpdate: "Departed UPS facility, Daly City CA · 7:48 AM",
          },
          { label: "Delivered", status: "pending", description: "Today, between 11 AM – 6 PM" },
        ]}
      />
      <OrderTracking.Item
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
      />
      <OrderTracking.ActionsCard
        title="Almost there"
        callout={{
          tone: "inset",
          icon: "info",
          title: "Cancellation no longer possible",
          description:
            "The carrier has the package. If you need to refuse delivery or arrange a return after it arrives, you can do that here.",
        }}
        actions={[
          { label: "Live tracking", icon: "truck" },
          { label: "Order details", variant: "primary" },
        ]}
      />
    </OrderTracking>
  );
}

function OtDelivered() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "Delivered", tone: "complete", icon: "check" }}
      />
      <OrderTracking.StatusCard
        eyebrow="Delivered"
        title="Wed, May 14 · 2:38 PM"
        description="Left at front door · Photo on file"
        meta={[
          {
            icon: "truck",
            text: (
              <>
                UPS ·{" "}
                <a
                  href="#"
                  className="text-ink-1 hover:text-ink-2 border-line-strong hover:border-ink-2 ml-1 border-b pb-px font-medium tabular-nums transition"
                >
                  1Z999AA10123456784
                </a>
              </>
            ),
          },
        ]}
        image={{ url: "https://picsum.photos/seed/delivery-photo/300/300" }}
      />
      <OrderTracking.Timeline
        emphasized
        steps={[
          { label: "Order placed", status: "complete", timestamp: "May 5, 2:14 PM" },
          { label: "Processing", status: "complete", timestamp: "May 6, 9:02 AM" },
          { label: "Shipped", status: "complete", timestamp: "May 7, 11:48 AM" },
          { label: "Out for delivery", status: "complete", timestamp: "May 14, 8:14 AM" },
          {
            label: "Delivered",
            status: "current",
            badge: "Complete",
            description: "Left at front door",
            timestamp: "May 14, 2:38 PM",
          },
        ]}
      />
      <OrderTracking.Item
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
        price={{ currency: "USD", value: "245.00" }}
        pointsApplied={12250}
      />
      <OrderTracking.ActionsCard
        title="Need anything?"
        columns={3}
        actions={[
          { label: "Reorder", icon: "rotate-ccw" },
          { label: "Order details" },
          { label: "Start a return", variant: "primary", icon: "arrow-right" },
        ]}
        footer={
          <>
            Returns accepted within 30 days · refunded to your original points + cash. Questions
            about the product?{" "}
            <a
              href="#"
              className="text-ink-1 hover:text-ink-2 font-medium underline underline-offset-2 transition"
            >
              Contact Norse Projects directly
            </a>
            .
          </>
        }
      />
    </OrderTracking>
  );
}

function OtCancelled() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "Cancelled", tone: "cancelled", icon: "x" }}
      />
      <OrderTracking.StatusCard
        eyebrow="Cancelled"
        title="Order cancelled at your request"
        description="May 6, 11:42 AM · No charge will appear on your card."
        image={{ url: sweaterImg }}
      />
      <OrderTracking.RefundSummary
        card={{ amount: { currency: "USD", value: "133.13" } }}
        points={{ amount: 12250 }}
        note="Posted in full. Card credit visible within 1–2 business days · points are already in your balance."
      />
      <OrderTracking.Timeline
        steps={[
          { label: "Order placed", status: "complete", timestamp: "May 5, 2:14 PM" },
          {
            label: "Cancelled",
            status: "cancelled",
            description: "By you · before merchant processing",
            timestamp: "May 6, 11:42 AM",
          },
        ]}
      />
      <OrderTracking.Item
        sectionLabel="Item not ordered"
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
        price={{ currency: "USD", value: "245.00" }}
        dimmed
        strikePrice
      />
      <OrderTracking.ActionsCard
        title="Want to try again?"
        actions={[
          { label: "Browse catalog" },
          { label: "Reorder this item", variant: "primary", icon: "rotate-ccw" },
        ]}
      />
    </OrderTracking>
  );
}

function OtRefunded() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "Refunded", tone: "complete", icon: "check" }}
      />
      <div className="bg-card border-line rounded-2xl border p-7 shadow-[0_1px_2px_rgba(15,15,15,0.04),_0_8px_32px_-12px_rgba(15,15,15,0.06)]">
        <div className="text-ink-3 text-[10.5px] font-medium tracking-[0.14em] uppercase">
          Refund · complete
        </div>
        <div className="text-ink-1 mt-1.5 text-[26px] leading-tight font-semibold -tracking-[0.02em]">
          All set · refund posted
        </div>
        <div className="text-ink-2 mt-2 text-[13px] leading-relaxed">
          Norse Projects received and inspected the item · funds and points are back where they came
          from.
        </div>
        <div className="mt-5">
          <OrderTracking.RefundSummary
            variant="detailed"
            card={{ amount: { currency: "USD", value: "133.13" }, postedLabel: "Posted May 18" }}
            points={{ amount: 12250, postedLabel: "Posted May 17" }}
          />
        </div>
      </div>
      <OrderTracking.Timeline
        emphasized
        steps={[
          { label: "Order placed", status: "complete", timestamp: "May 5" },
          { label: "Delivered", status: "complete", timestamp: "May 14" },
          {
            label: "Return submitted",
            status: "complete",
            description: "Reason: No longer needed",
            timestamp: "May 15",
          },
          { label: "Item received", status: "complete", timestamp: "May 17" },
          {
            label: "Refund posted",
            status: "current",
            badge: "Complete",
            description: "Card credit + points returned",
            timestamp: "May 18",
          },
        ]}
      />
      <OrderTracking.Item
        sectionLabel="Returned"
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Refund #RT-7B23X1"
        imageUrl={sweaterImg}
        refundedAmount={{ currency: "USD", value: "245.00" }}
        pointsRefunded={12250}
      />
      <OrderTracking.ActionsCard
        actions={[
          { label: "Browse catalog" },
          { label: "Reorder this item", variant: "primary", icon: "rotate-ccw" },
        ]}
      />
    </OrderTracking>
  );
}

function OtStuck() {
  return (
    <OrderTracking>
      <OrderTracking.Header
        orderId="#RW-A4F92K"
        placedLabel="Placed May 5, 2026"
        pill={{ label: "Under investigation", tone: "amber", pulse: true }}
      />
      <OrderTracking.InvestigationCard
        eyebrow="We're looking into this"
        title="No tracking updates for 5 days"
        description="Your package was last scanned at the carrier facility on May 7. We've reached out to the merchant and carrier to find it. You don't need to do anything — but if you'd rather refund and move on, you can do that below."
        lastSeen={{
          location: "UPS facility, Daly City CA",
          timestamp: "May 7, 6:32 AM · 5 days ago",
        }}
        originalEta={{ date: "Wed, May 14", pastDue: "3 days past due" }}
      />
      <OrderTracking.InvestigationProgress
        steps={[
          {
            status: "complete",
            title: "Filed a trace request with UPS",
            detail: "Opened May 11 · Carriers typically respond within 3 business days",
          },
          {
            status: "complete",
            title: "Confirmed shipment with Norse Projects",
            detail: "Verified the package left the merchant warehouse on May 7",
          },
          {
            status: "current",
            title: "Awaiting carrier response",
            detail: "Expected by Wed, May 13",
            detailTone: "amber",
          },
        ]}
      />
      <OrderTracking.InvestigationActions
        options={[
          {
            label: "Wait for resolution",
            description:
              "We'll email you the moment we hear from UPS or the merchant. Most stuck shipments are located within 5 business days.",
            badge: "Recommended",
          },
          {
            label: "Refund anyway",
            description:
              "Get $133.13 back on your card and 12,250 pts back. If the package later arrives, please return it for free.",
          },
          {
            label: "Talk to a human",
            description: "Reach support directly · typical response within 4 hours.",
          },
        ]}
      />
      <OrderTracking.Timeline
        steps={[
          { label: "Order placed", status: "complete", timestamp: "May 5" },
          { label: "Processing", status: "complete", timestamp: "May 6" },
          {
            label: "Shipped",
            status: "complete",
            description: "Last seen at UPS facility, Daly City CA",
            timestamp: "May 7",
          },
          {
            label: "Tracking gap",
            status: "tracking-gap",
            badge: "5 days",
            description: "No carrier scans since May 7",
            timestamp: "May 7 → now",
          },
          { label: "Delivered", status: "pending", description: "Was estimated Wed, May 14" },
        ]}
      />
      <OrderTracking.Item
        vendor="Norse Projects"
        name="Sigfred Merino Crew Sweater"
        subtitle="Slate Blue · Size M · Qty 1"
        imageUrl={sweaterImg}
        price={{ currency: "USD", value: "245.00" }}
        pointsApplied={12250}
      />
    </OrderTracking>
  );
}
