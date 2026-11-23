# Design system

Patchwork is a **bench-light** interface: a repair bench at night, warm graphite ground, bone ink,
and one brass accent taken from the bench lamp. The product's own subject — a device opened into
its parts — is the only picture in it, and it is rendered in real 3D rather than drawn.

The world is chosen from the use scene: a technician works in a dim shop under a single lamp, and a
customer opens the tracker on a phone in a dark room. Both want the same thing — legible figures and
one obvious action.

## The three rules

1. **Surfaces separate by a step in tone, never by a heavier border.** `panel` → `raised` →
   `overlay`, with a single 1 px hairline where an edge must exist.
2. **Colour is a signal, not decoration.** Brass marks the one primary action and live state. Moss
   marks "ready / paid", vermilion marks "blocked / failed". Nothing else earns a hue.
3. **Geometry is tight and physical.** Controls 6 px, panels 8–10 px, insets 6 px. Nothing is a pill.

## Colour

All tokens live in `tailwind.config.ts` and are mirrored as CSS variables in `app/globals.css`.

| Token | Hex | Use |
| --- | --- | --- |
| `canvas` | `#0C0C0B` | Page ground. |
| `sunken` | `#080807` | Insets, the counter board, fields. |
| `panel` | `#131312` | Panels, the auth form column. |
| `raised` | `#1A1A18` | Nested surfaces, secondary buttons, hover. |
| `overlay` | `#22221F` | Popovers, active secondary state. |
| `hairline` | `#EDEDE60F` | Panel edges and row rules. |
| `hairline-strong` | `#EDEDE61F` | Control edges, focusable boundaries. |
| `ink` | `#EFEDE7` | Primary text. |
| `ink-secondary` | `#B0ADA4` | Body copy, descriptions. |
| `ink-tertiary` | `#948F86` | Labels, metadata, help text. |
| `ink-faint` | `#716D64` | Decorative marks and disabled state only. |
| `accent` | `#D9A441` | The one primary action, live state, selected marker. |
| `accent-bright` | `#EFBC63` | Hover, focus rings, active line. |
| `accent-deep` | `#A87A22` | Pressed brass. |
| `positive` | `#5FC492` | Ready, paid, connected. |
| `warn` | `#D9A441` | Waiting on parts, unpaid, degraded. |
| `negative` | `#EE6A5B` | Failed check, urgent, cancelled. |
| `info` | `#8FA6B4` | On the bench, diagnosing. |

Contrast floor: body and help text ≥ 4.5:1 on `canvas` and `panel`; placeholders are never lighter
than `ink-tertiary`. Brass is only used as a *fill* behind near-black text (`#17120A`), never as a
surface for white text.

### Status language

Status is a 6 px square mark plus a word. The word carries the meaning; colour is the second,
quieter signal and only appears where the shop has to act.

| State | Mark | Word colour |
| --- | --- | --- |
| Intake | `ink-faint` | `ink-secondary` |
| Diagnosing | `info` | `info` |
| Waiting on parts | `warn` | `warn` |
| In repair | `accent` | `ink` |
| Ready | `positive` | `positive` |
| Picked up | `ink-faint` | `ink-tertiary` |
| Cancelled | `negative` | `negative` |

Priority is Low, Normal, High, Urgent; invoice state is Draft, Unpaid, Paid, Void. Both use the same
mark-plus-word grammar.

## Typography

Two sourced faces, each drawn for its job.

| Role | Family | Setting |
| --- | --- | --- |
| Display (h1) | Instrument Sans | 600, `clamp(38px–80px)`, tracking −0.03em, leading 0.96 |
| Screen title (h2) | Instrument Sans | 600, 24–30 px, tracking −0.022em |
| Section heading (h3) | Instrument Sans | 500–600, 15–17 px |
| Body | Instrument Sans | 400, 14–17 px, leading 1.55–1.75, measure ≤ 64ch |
| Label / help | Instrument Sans | 400–500, 13 px |
| Codes, money, counts | IBM Plex Mono | 400–600, 11–21 px, `tabular-nums` |

Mono is reserved for things that are measured or must align in a column: ticket numbers, tracking
codes, invoice totals, latency, timestamps in a table. It is never used as a texture for "technical".

Sentence case everywhere. No uppercase micro-labels with wide tracking above a heading — the
heading carries its own weight.

## Shape and elevation

| Token | Value | Use |
| --- | --- | --- |
| `sm` | 4 px | Badges, tiny chips |
| `DEFAULT` | 6 px | Every control, input and bracket |
| `md` | 8 px | Panels, popovers |
| `lg` / `xl` | 10–12 px | Large surfaces only |

Declare elevation once. A panel is a tone step; if it needs an edge it gets `.edge-lit` (one inset
top light plus a 1 px ring in a single shadow), never a border *and* a shadow.

- `shadow-panel` — the workspace header bar.
- `shadow-lift` — popovers and the mobile drawer.
- `shadow-float` — the profile menu and command palette.
- `.brass` — the primary control: a metal face with an etched near-black label, top light inset.
- `.field-inset` — inputs: recessed into the surface, brass ring on focus.

## The bench scene

`components/three/device-stage.tsx` (the scene) and `components/three/device-stage-mount.tsx` (the
loader). This is the product's signature element and its progress indicator.

- A device modelled as the five parts a technician actually lifts out: back panel (with camera
  block, lenses, charging coil and regulatory block), machined frame (hollow, corner screws, side
  buttons), battery (labelled cell plus sub-plate), logic board (traced PCB, chips, shield can, edge
  contacts, brass charge connector), and the display assembly (bezel, black glass, punch-hole
  camera, ribbon).
- Lit like a product render: one warm bench lamp, a neutral key, a cool rim, a hemisphere fill, and
  a small procedural environment (PMREM) so metal and glass have something to reflect. Tone-mapped
  with ACES; the scene is transparent so the page ground shows through.
- The stage is the status. The device assembles as the job advances:

| Status | Stage |
| --- | --- |
| Intake | Closed, sitting back on the bench |
| Diagnosing | Display lifted, scan line sweeping the board |
| Waiting on parts | Open, with the battery drawn ghosted out of the stack |
| In repair | Fully open on the bench |
| Ready | Closed under a moss light |
| Picked up | Closed and set back, desaturated |
| Cancelled | Barely present |

- Interaction: pointer parallax on two damped springs, an idle drift under 1°, and a yaw that opens
  from 17° (closed, readable as a product) to 46° (open, readable as a teardown).
- Cost: three.js is imported only by the scene module and the module is only loaded dynamically, so
  no other route pays for it. The scene renders only when it is near the viewport and the tab is
  visible, caps DPR at 2, and disposes every geometry, material and render target on unmount.
- Reduced motion keeps the scene (it is information) but drops the drift and the parallax, and
  renders at lower quality.
- The canvas is `role="img"` with a caption; every state is also stated in text next to it.

## Surfaces

### Public tracker — `/track`

- Header: mark, `System status`, one quiet `Staff sign in` control.
- Hero: heading, one paragraph, the code docket, and the bench scene. Two columns from `lg`.
- No ticket yet: the stage sits in Intake under a `Bench view · nothing open` caption, and the
  stages are explained as a ruled definition list (mark, word, one line).
- Ticket found: the stage moves to the ticket's real stage, and the page shows the five-stage rail,
  the issue, and the customer-visible timeline only.
- Never shows address, payment details, internal notes, or staff-only fields.

### System status — `/status`

Two checks, run on demand and never cached, then a numbered recovery runbook. The endpoint paths are
printed because this page is used by staff, not customers.

### Auth — `/(auth)`

`components/auth/auth-shell.tsx`, `auth-card.tsx`, `shift-board.tsx`.

- Left plate: mark, the bench scene opened (it is the brand image here, not a status), the promise,
  and two quiet links. Right column: the form, then the live counter board as the docket's stub.
- The counter board reads `/api/health` and `/api/health/supabase` on load and prints a word plus a
  figure. Nothing on it is invented; a failed check says so.
- Below `lg` the plate stacks above the form.

### Workspace

- 72 px instrument rail that widens to 248 px on hover or focus and floats over the page rather than
  pushing it. Icon-only at rest, every label still in the accessibility tree.
- Top bar: 48 px, page name, the command palette trigger with its `⌘K` key, `New intake`, profile.
- Mission control is two panes in one viewport: the queue (stats, live rows, keyboard up/down) and
  the bench (the scene, three readouts, the actions). Nothing scrolls except the two inner panes.
- Everything else uses a shared page frame: title, description, actions, then panels.

## Motion

- Motion is feedback, not performance. App screens have no entrance animation; only `.rise` on
  public hero content, staggered once by 60–70 ms.
- Durations: 130 ms for press and colour, 220 ms for surface changes, 420–480 ms for a panel
  entering. Ease out with `cubic-bezier(0.22, 1, 0.36, 1)`.
- The scene is the one authored moment: springs for the pointer, damped easing for the explode.
- Never `transition: all`; name the properties.
- `prefers-reduced-motion` removes travel, parallax and drift while keeping opacity and colour.

## Rejected looks

Do not bring these back:

- indigo → cyan gradients, gradient text, and a coloured glow behind every hero
- glass cards, backdrop blur as decoration, and a dot-grid or grain overlay
- five-hue status rainbows where the colour is the only signal
- sketch-style or line-art SVG standing in for a product picture
- cream + clover green + coral + Fraunces
- black + safety yellow + Bricolage + Space Mono
- pills for everything, and 20 px radii on 32 px controls
