import { createFileRoute } from "@tanstack/react-router";

const FEATURE_STAGGER_MS = 90;
const FEATURE_INITIAL_DELAY_MS = 80;

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className="mx-auto w-page px-4 pt-14 pb-8">
      <HeroSection />
      <FeaturesSection />
      <QuickStartSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative animate-rise-in overflow-hidden rounded-4xl border border-(--line) bg-linear-165 from-(--surface-strong) to-(--surface) px-6 py-10 shadow-island backdrop-blur-xs transition duration-180 ease-in-out sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -top-24 -left-20 size-56 rounded-full bg-radial from-teal-500/30 to-transparent to-65%" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 size-56 rounded-full bg-radial from-green-800/20 to-transparent to-65%" />
      <p className="mb-3 text-kicker font-bold tracking-kicker text-(--kicker) uppercase">
        TanStack Start Base Template
      </p>
      <h1 className="mb-5 max-w-3xl font-display text-4xl leading-none font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
        Start simple, ship quickly.
      </h1>
      <p className="mb-8 max-w-2xl text-base text-(--sea-ink-soft) sm:text-lg">
        This base starter intentionally keeps things light: two routes, clean structure, and the
        essentials you need to build from scratch.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="/about"
          className="rounded-full border border-teal-600/30 bg-teal-500/15 px-5 py-2.5 text-sm font-semibold text-(--lagoon-deep) no-underline transition hover:-translate-y-0.5 hover:bg-teal-500/25"
        >
          About This Starter
        </a>
        <a
          href="https://tanstack.com/router"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-cyan-950/20 bg-white/50 px-5 py-2.5 text-sm font-semibold text-(--sea-ink) no-underline transition hover:-translate-y-0.5 hover:border-cyan-950/35"
        >
          Router Guide
        </a>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Type-Safe Routing", "Routes and links stay in sync across every page."],
        ["Server Functions", "Call server code from your UI without creating API boilerplate."],
        ["Streaming by Default", "Ship progressively rendered responses for faster experiences."],
        ["Tailwind Native", "Design quickly with utility-first styling and reusable tokens."],
      ].map(([title, desc], index) => (
        <article
          key={title}
          className="animate-rise-in rounded-2xl border border-(--line) bg-linear-165 from-(--feature-surface) to-(--surface) p-5 shadow-feature backdrop-blur-xs transition duration-180 ease-in-out hover:-translate-y-0.5 hover:border-(--feature-border)"
          style={{ animationDelay: `${index * FEATURE_STAGGER_MS + FEATURE_INITIAL_DELAY_MS}ms` }}
        >
          <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">{title}</h2>
          <p className="m-0 text-sm text-(--sea-ink-soft)">{desc}</p>
        </article>
      ))}
    </section>
  );
}

function QuickStartSection() {
  return (
    <section className="mt-8 rounded-2xl border border-(--line) bg-linear-165 from-(--surface-strong) to-(--surface) p-6 shadow-island backdrop-blur-xs transition duration-180 ease-in-out">
      <p className="mb-2 text-kicker font-bold tracking-kicker text-(--kicker) uppercase">
        Quick Start
      </p>
      <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-(--sea-ink-soft)">
        <li>
          Edit <code>src/routes/index.tsx</code> to customize the home page.
        </li>
        <li>
          Update <code>src/components/header.tsx</code> and <code>src/components/footer.tsx</code>{" "}
          for brand links.
        </li>
        <li>
          Add routes in <code>src/routes</code> and tweak visual tokens in{" "}
          <code>src/styles.css</code>.
        </li>
      </ul>
    </section>
  );
}
