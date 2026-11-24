import Link from "next/link";

const PRODUCTS = [
  { id: "gift-card", name: "Gift Card", price: "$25" },
  { id: "starter-kit", name: "Starter Kit", price: "$49" },
  { id: "pro-plan", name: "Pro Plan", price: "$99" },
];

export default function ProductsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.18em] text-ink-muted">Catalog</p>
      <h1
        data-testid="products-heading"
        className="mt-4 font-[family-name:var(--font-display)] text-5xl tracking-tight"
      >
        Products
      </h1>
      <ul className="mt-10 space-y-4" data-testid="products-list">
        {PRODUCTS.map((product) => (
          <li
            key={product.id}
            data-testid={`product-${product.id}`}
            className="flex items-center justify-between rounded-2xl border border-line bg-panel px-5 py-4"
          >
            <span className="font-medium">{product.name}</span>
            <span className="text-ink-muted">{product.price}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full border border-line px-5 py-3 text-sm transition hover:border-accent hover:text-accent"
      >
        Back to login
      </Link>
    </main>
  );
}
