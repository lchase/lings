import { createFileRoute } from '@tanstack/react-router'
import { MockAgentRunner } from '@lings/agent-runner'
import { Placeholder } from '@lings/ui'

export const Route = createFileRoute('/')({ component: App })

const scaffoldStatus = new MockAgentRunner().start({ playbookRunId: 'scaffold-check' })
  .sessionId

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-lg px-6 py-10 sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">TanStack Start Base Template</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--ink)] sm:text-6xl">
          Start simple, ship quickly.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--ink-soft)] sm:text-lg">
          This base starter intentionally keeps things light: two routes, clean
          structure, and the essentials you need to build from scratch.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/about"
            className="rounded-[var(--radius-control)] border border-[var(--signal)] bg-[var(--signal-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] no-underline transition hover:brightness-105"
          >
            About This Starter
          </a>
          <a
            href="https://tanstack.com/router"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[var(--radius-control)] border border-[var(--wire)] bg-[var(--panel)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] no-underline transition hover:border-[var(--signal)]"
          >
            Router Guide
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            'Type-Safe Routing',
            'Routes and links stay in sync across every page.',
          ],
          [
            'Server Functions',
            'Call server code from your UI without creating API boilerplate.',
          ],
          [
            'Streaming by Default',
            'Ship progressively rendered responses for faster experiences.',
          ],
          [
            'Tailwind Native',
            'Design quickly with utility-first styling and reusable tokens.',
          ],
        ].map(([title, desc], index) => (
          <article
            key={title}
            className="island-shell feature-card rise-in rounded-lg p-5"
            style={{ animationDelay: `${index * 90 + 80}ms` }}
          >
            <h2 className="mb-2 text-base font-semibold text-[var(--ink)]">
              {title}
            </h2>
            <p className="m-0 text-sm text-[var(--ink-soft)]">{desc}</p>
          </article>
        ))}
      </section>

      <section className="island-shell mt-8 rounded-lg p-6">
        <p className="island-kicker mb-2">Workspace scaffold check</p>
        <p className="m-0 text-sm text-[var(--ink-soft)]">
          <Placeholder /> reachable from @lings/web, mock agent session:{' '}
          {scaffoldStatus}
        </p>
      </section>

      <section className="island-shell mt-8 rounded-lg p-6">
        <p className="island-kicker mb-2">Quick Start</p>
        <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--ink-soft)]">
          <li>
            Edit <code>src/routes/index.tsx</code> to customize the home page.
          </li>
          <li>
            Update <code>src/components/Header.tsx</code> and{' '}
            <code>src/components/Footer.tsx</code> for brand links.
          </li>
          <li>
            Add routes in <code>src/routes</code> and tweak visual tokens in{' '}
            <code>src/styles.css</code>.
          </li>
        </ul>
      </section>
    </main>
  )
}
