# Lings style guide

Lings is a control panel for directing a small fleet of coding agents — tickets,
playbooks, live sessions, rules. It's a dense, data-forward tool used for hours
at a stretch by its own builder, not a marketing site. The identity below reads
as an **instrument panel / dispatch board**: hairline dividers, mono-set data
and status, one deliberate violet accent reserved for calls to action, not
decoration. It replaces the unmodified TanStack-starter "coastal glass" theme
ticket 01 scaffolded (soft teal islands, blurred glassmorphism, "TanStack
Start" branding in the header/footer) — that theme described the starter kit,
not Lings.

The first pass at this (amber-on-near-black) was rejected as "basically what
all AI builds" — the near-black-plus-single-bright-accent formula is a known
generic-AI-design default regardless of which accent hue fills it in. The fix
per the human's direction: neither surface color is a true neutral — dark
mode's ground carries a violet undertone rather than flat slate-black, light
mode's carries the same undertone rather than flat white — and violet is the
one CTA/attention color, with the rest of the palette (status colors, `ink`)
built as a genuinely separate hue set around it rather than tints of the
accent. That coherent-but-not-monochrome relationship is the actual design
choice; swapping the accent hex alone would not have fixed the underlying
problem.

Home (`/`) and About (`/about`) still carry scaffold copy ("TanStack Start
Base Template", feature-card blurbs about the starter). Rewriting that copy is
out of scope here — this ticket covers tokens, primitives, and ticket 03's
`/tickets` page as proof. Whoever next touches those routes should rewrite
their copy to describe Lings, not the starter.

## Color

Six named brand colors; each resolves differently per theme via CSS custom
properties (see `apps/web/src/styles.css`). Dark is the primary mode — this is
a tool developers live in — but light is fully specced, not an afterthought.
Neither mode's `paper`/`panel`/`ink` is a true neutral gray: all three carry a
faint violet undertone so the accent feels native to the palette instead of a
bright color dropped onto a generic gray shell.

| Name | Role | Light | Dark |
|---|---|---|---|
| `ink` | primary text, headings | `#1c1626` | `#ece7f5` |
| `ink-soft` | secondary text, captions | `#6b6178` | `#a79bbd` |
| `paper` | page background | `#f6f3fa` | `#16141c` |
| `panel` | card/table/input surface | `#ffffff` | `#1e1b26` |
| `wire` | borders, dividers, hairlines | `#ded6ea` | `#322d3d` |
| `signal` | brand accent — primary actions, focus, "live" | `#7c3aed` | `#a878f0` |

Status colors (ticket status, session status — the one recurring motif, see
Signature below) are a **fixed semantic set deliberately built from different
hues than `signal`** — reusing violet for status would both muddy "this needs
your attention" and read as monochrome:

| Status | Color | Use |
|---|---|---|
| `backlog` | `#8983a3` / `#837a94` muted lavender-gray | not started |
| `in_progress` / `generating` | `#c48a1f` / `#e0a83f` amber | active |
| `qa` / `waiting-approval` | `#2597a3` / `#45c2cf` teal | needs a human |
| `done` | `#3f8a5f` / `#57b37e` green | finished |
| `error` | `#c23b4c` / `#e2707d` red | failed |

(light / dark, in that order). Never use `signal` for decoration (backgrounds,
dividers, status) — it means "this needs your attention or is the primary
action," and loses that meaning if it shows up everywhere.

## Type

Two roles from two families, not one grotesk doing every job:

- **IBM Plex Sans** — body text, headings, UI labels, buttons. Weights 400
  (body), 500 (UI/labels), 600–700 (headings).
- **IBM Plex Mono** — anything that's data rather than prose: status chips,
  IDs, timestamps, folder-tree rows, table headers, code. Set at 500 weight,
  uppercase, `0.04em` tracking for chips/headers; normal case for IDs/code.

The mono face is the signature typographic move (see below) — it's what
makes a status chip or a folder row read as *instrumentation* rather than as
a generic app list item. Don't use it for body prose or long descriptions;
that's Plex Sans's job.

Scale (rem, applied via Tailwind's default type scale — no custom scale
needed beyond what's already in `tailwind.config`):
`text-xs` (0.75) captions/chips · `text-sm` (0.875) body/UI default ·
`text-base` (1) emphasized body · `text-lg`–`text-2xl` section/page headings.

## Space & shape

- Border radius: small and consistent — `0.375rem` (6px) for buttons/inputs,
  `0.5rem` (8px) for cards/panels. No pill buttons, no 1.25rem "soft island"
  radii — those read as coastal/consumer, not instrument-panel.
- Borders over shadows: a 1px `wire` border does the job a soft drop-shadow
  did in the old theme. Reserve shadow for actual overlays (menus, modals).
- No backdrop-blur glassmorphism — flat, opaque `panel` surfaces. It's more
  legible for dense tables and cheaper to render.

## Components

Implemented as `@lings/ui` primitives (`Button`, `Input`, `Select`,
`Textarea`, `Table`, `Card`, `StatusBadge`) so `apps/web` and `apps/desktop`
share one implementation instead of hand-rolled Tailwind per screen.

- **Button** — `primary` (solid `signal`, white text), `secondary` (`wire`
  border, `panel` background), `danger` (red border/text, transparent fill
  until hover). One size for now; a `sm` variant can be added when a ticket
  needs it, not speculatively.
- **Input / Select / Textarea** — `panel` background, `wire` border, `signal`
  focus ring (2px, 30% opacity). Same padding/radius across all three so a
  form's fields read as one system.
- **Table** — hairline row dividers, `panel` header row in Plex Mono
  uppercase, row hover tints toward `signal` at low opacity.
- **Card** — `panel` background, `wire` 1px border, `0.5rem` radius, no
  shadow at rest.
- **StatusBadge** (the signature element, below) — small rectangular chip:
  filled dot + Plex Mono uppercase label, colored by the status table above.

## Signature: signal chips

The one motif every status surface in the app shares — ticket status, agent
session status, notification state. A small `2px`-radius rectangle (not a
pill — pills read as generic SaaS), a filled 6px status dot, and an uppercase
Plex Mono label at `0.7rem`/`0.04em` tracking. It's meant to evoke a signal
lamp on a dispatch board: you should be able to scan a table or a fleet view
and read status from color + dot alone, label second. Every later ticket that
introduces a new status-like concept (agent session status in ticket 08, the
`waiting-approval`/`error` states in ticket 20's notifications) reuses this
component rather than inventing another badge style.

## What's next

Ticket 05 (ticket views) and 08 (fleet view) are the next places this system
gets exercised — a kanban board and a live session list are both fundamentally
more `StatusBadge` + `Card` + `Table` usage. If a new pattern is needed that
isn't in this guide (e.g. a drag handle, a DAG node for ticket 13), add it to
this doc and to `@lings/ui` in that ticket rather than inventing inline
Tailwind — that's the standing expectation this ticket sets up.
