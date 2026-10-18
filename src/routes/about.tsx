import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="mx-auto w-page px-4 py-12">
      <section className="rounded-2xl border border-(--line) bg-linear-165 from-(--surface-strong) to-(--surface) p-6 shadow-island backdrop-blur-xs transition duration-180 ease-in-out sm:p-8">
        <p className="mb-2 text-kicker font-bold tracking-kicker text-(--kicker) uppercase">
          About
        </p>
        <h1 className="mb-3 font-display text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          A small starter with room to grow.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-(--sea-ink-soft)">
          TanStack Start gives you type-safe routing, server functions, and modern SSR defaults. Use
          this as a clean foundation, then layer in your own routes, styling, and add-ons.
        </p>
      </section>
    </main>
  );
}
