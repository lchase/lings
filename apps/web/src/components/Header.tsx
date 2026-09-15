import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--wire)] bg-[var(--paper)] px-4">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--wire)] bg-[var(--panel)] px-3 py-1.5 font-mono text-sm text-[var(--ink)] no-underline sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--signal)]" />
            Lings
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            About
          </Link>
          <Link
            to="/tickets"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Tickets
          </Link>
          <Link
            to="/fleet"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Fleet
          </Link>
          <Link
            to="/laws"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Laws
          </Link>
          <Link
            to="/styleguide"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Style guide
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
