# 04 — Design system & style guide

**What to build:** A written style guide (colors, type scale, spacing, component patterns — buttons, inputs, tables, cards, nav) plus the Tailwind tokens/config and a small set of shared primitive components in `@lings/ui` that implement it. This is the visual foundation every later UI-building ticket applies as it goes, not a coat of paint applied at the end.

**Blocked by:** 01 — Repo & tooling scaffold.

**Status:** ready-for-agent

- [ ] A style guide doc exists (`.scratch/lings/design/style-guide.md` or similar) covering: color palette (incl. dark mode, matching the existing `theme` toggle already in `__root.tsx`), type scale, spacing scale, and a short list of UI patterns (primary/secondary button, text input, select, table, card, nav link) with when-to-use guidance.
- [ ] Tailwind theme tokens (colors, spacing, radii) are defined once in `apps/web/src/styles.css` / Tailwind config and referenced by name, not ad-hoc hex/px values scattered per component.
- [ ] `@lings/ui` gains shared primitives implementing the guide: `Button`, `Input`/`Select`/`Textarea`, `Table`, `Card` — used by both `apps/web` and (eventually) `apps/desktop`.
- [ ] Ticket 03's `/tickets` page (folder tree + ticket table, currently raw utility classes with no design system) is restyled to use these primitives/tokens, as the first proof the system works end to end.
- [ ] Every UI-touching ticket from here on (05 and later) builds against this guide/primitives instead of ad-hoc styling — noted as a standing expectation, not re-stated per ticket.
