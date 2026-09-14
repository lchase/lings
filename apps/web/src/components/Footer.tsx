export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-[var(--wire)] px-4 pb-14 pt-10 text-[var(--ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} Lings.</p>
        <p className="island-kicker m-0">Self-hosted agent fleet control</p>
      </div>
    </footer>
  )
}
