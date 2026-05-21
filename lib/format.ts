import type { Money } from "@/types/product";

// Reuse Intl.NumberFormat per currency. Creating a formatter is ~3 orders
// of magnitude slower than calling `.format()` on an existing one, and
// catalogs / PDPs render the same currency dozens of times per page.
const currencyFormatters = new Map<string, Intl.NumberFormat>();
const getCurrencyFormatter = (currency: string): Intl.NumberFormat => {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(undefined, { style: "currency", currency });
    currencyFormatters.set(currency, formatter);
  }
  return formatter;
};

export function formatMoney(money: Money): string {
  try {
    return getCurrencyFormatter(money.currency).format(Number(money.value));
  } catch {
    return `${money.currency} ${money.value}`;
  }
}

export function formatPoints(points: number): string {
  return `${points.toLocaleString()} pts`;
}
