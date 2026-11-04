# Design System

Patchwork uses a **workshop counter** interface: a green-black ground the colour of an old
ledger, bone-white type, and one brass accent taken from the hardware on the bench. It is an
operations tool first. There is no hero illustration on the way in — the product's own live state
is the signature element.

## Brand idea

- **Paperwork is the identity.** This is a shop that runs on tickets, stage stamps and invoices.
  The mark is a ticket stub; the type is IBM Plex, drawn for documents and screens; the accent is
  the brass of a bench lamp, not a signal colour.
- **One ground, one ink, one accent.** Green-black ground, bone ink, brass for the single primary
  action and live state. Colour on data and status only.
- **Surfaces are flat.** Panels separate by a tone step. Shadows only on the mobile drawer and the
  two overlays that need them.
- **Tight geometry.** Cards 6 px, controls 3 px, no full-radius pills anywhere.
- **IBM Plex Sans** sets all text. **IBM Plex Mono** is reserved for ticket codes, tracking codes,
  IDs and amounts that must align.

## Color palette

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#0D1413` | Page ground. |
| `surface` | `#141D1B` | Panels, navigation, the auth sheet. |
| `raised` | `#1B2623` | Nested surfaces, quiet insets, sheet footer. |
| `wash` | `#1F2A27` | Secondary button fill, selected navigation, hover. |
| `ink` | `#E7E8E3` | Primary text and inverted buttons. |
| `muted` | `#8C9A95` | Secondary text, labels, metadata. |
| `line` | `#26332F` | Panel edges and row rules. |
| `accent` | `#D9A441` | Primary actions and the active bench layer. |
| `gold` | `#E0C079` | Scene nodes and fine hardware detail only. |
| `steel` | `#7C8794` | Neutral state, disabled, quiet badges. |
| `positive` | `#5BE0A0` | Ready and paid state. |
| `negative` | `#FF7A6B` | Errors and urgent state. |
| `warn` | `#E0965A` | Waiting on parts and low stock. |

`positive`, `negative` and `warn` each carry `soft` (fill) and `positive`/`negative` carry `ink`
(readable text on that fill).

## Typography

| Role | Family | Size / weight |
| --- | --- | --- |
| App title | IBM Plex Sans | 26–30 px / 600, tracking -0.025em |
| Auth screen title | IBM Plex Sans | 24 px / 600, tracking -0.025em |
| Section heading | IBM Plex Sans | 14–17 px / 500 |
| Body | IBM Plex Sans | 13–14 px / 400, line-height 1.6–1.8 |
| Field label | IBM Plex Sans | 13–14 px / 500 |
| Metadata | IBM Plex Sans | 11–12 px / 400 |
| Ticket / invoice codes | IBM Plex Mono | 11–13 px |

Sentence case everywhere. No uppercase micro-labels with wide tracking. Numbers in tables and
totals use `font-variant-numeric: tabular-nums` (`.figure`).

## Spacing and shape

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40 px.
- Page gutter: 20 px phone, 32–48 px desktop.
- Content width: 1120 px workspace canvas, 400 px auth form, 1180 px auth shell.
- Radius: cards 6 px, controls and buttons 3 px, insets 3 px. Nothing is a pill.
- Borders: 1 px `line` on panel edges and field boundaries. In-app blocks separate with tone and
  space, not rules.
- Focus: 2 px brass outline, 3 px offset.

## Core components

### Buttons

- **Primary:** brass fill, near-black text, 3 px radius. Hover lightens; press scales to 0.98.
- **Inverted:** `ink` fill, `paper` text. Used for secondary page actions.
- **Secondary:** `wash` fill, 1 px `line` border.
- **Ghost:** text only; hover fills `wash`.
- Sizes: 32 px small, 36 px default, 44 px auth.
- Press feedback is 120 ms; nothing animates on entrance.

### Inputs

- Height 40–44 px, 3 px radius, `paper` fill inside panels.
- Focus: brass border plus the 2 px focus ring.
- Error: red border and a 12 px message with `role="alert"`.
- Labels stay visible. Hints sit on the label row or below the field.
- Autofill is forced back to the surface fill.

### Status language

- **Intake** neutral, **Diagnosing** steel, **Waiting on parts** amber, **In repair** brass,
  **Ready** green, **Picked up** grey, **Cancelled** red.
- Every status is a dot plus a word; colour is never the only signal.
- Priority is text plus a dot: Low, Normal, High, Urgent.
- Invoice state is Draft, Unpaid, Paid, or Void.

### Workspace shell

- 248 px desktop sidebar; solid surface, no blur.
- Wordmark at top, brass **New ticket** action, then Overview, Tickets, Customers, Inventory,
  Invoices, Team.
- Bottom: public tracker link and the signed-in staff block with logout.
- Top bar: mobile menu, page name, search tickets/customers, quick New action.
- Mobile: sidebar becomes a drawer; the top bar keeps the mark and actions.

### Auth surface

`components/auth/auth-shell.tsx`, `auth-card.tsx`, `shift-board.tsx`.

- Two columns on desktop: identity and a live **counter board** on the ground, the form on an
  inset sheet (1 px `line` edge, 6 px radius, no shadow).
- The counter board reads `/api/health` and `/api/health/supabase` on load and prints state word
  plus latency. It is the only live element and the only signature element on the screen.
- Desktop order is identity then form; below `lg` the order flips so the form is above the fold.
- One logo per viewport: sheet header on small screens, ground column on desktop.
- No 3D scene, no entrance animation, no proof lists.

### Public tracker

- Same brand, no workspace chrome, no 3D bench.
- Form takes the 10-character tracking code. No email or phone is needed.
- The result shows device, issue, current stage, and only customer-visible timeline events.
- Never shows address, payment details, internal notes, or staff-only fields.

## The bench scene

`components/patchwork/repair-scene.tsx` and `repair-bench.tsx` still exist and are still mounted by
the workspace dashboard, `/status`, `/track` and the 404 page. It is no longer used on the auth
surface.

- A studio teardown in three floating layers: display, chassis with internals, back panel.
- Accents are on the brass token; nothing in the scene uses the retired orange.
- Bloom is limited to the screen ring and brass accents.
- Compact mode drops the back panel and layer controls; narrow cards drop the back panel too.
- Canvas is decorative; every state is repeated in text.
- Treat it as a candidate for removal: it carries the most bytes and the least information of
  anything in the app.

## Layout

### Dashboard

- Title row: repair desk, date, public tracker, new ticket.
- Split hero: bench scene + live shop metrics.
- Live queue and bench load side by side; low stock in the right column.
- Four status cells at the bottom.

### Ticket detail

- Header: ticket number, status, priority, tracking code, copy.
- Left: repair brief, parts, timeline, notes.
- Right: bench controls (status, assignment, estimate, labour, diagnosis), customer/device card,
  invoice card.

### Tables

- Quiet rules, no zebra striping.
- Ticket numbers and money are tabular.
- Mobile rows become stacked cards; the important status stays beside the customer.

## Motion

- App screens have no motion floor: nothing performs an entrance.
- Feedback only: colour at 120–160 ms, press scale 0.98, custom `cubic-bezier(0.23, 1, 0.32, 1)`.
- Never `transition: all`; name the properties.
- `@media (prefers-reduced-motion: reduce)` removes travel and keeps opacity and colour.
- `.reveal` exists for public surfaces only. It uses `animation-fill-mode: backwards` so content
  can never be left invisible if the animation does not run.

## Rejected looks

Do not bring these back:

- cream + clover green + coral + Fraunces
- black + safety yellow + Bricolage + Space Mono
- light grey + white cards + blue progress-only accent
- signal orange `#FF6B35` on near-black
- a generic device render used as the hero of a login screen
