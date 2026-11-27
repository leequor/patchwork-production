# Design system

Patchwork is a **violet bench** interface: a repair bench at night, a violet-black ground with
near-white ink, and one indigo accent that fades toward cyan. The product's own subject — a device
opened into its parts — is the only picture in it, and it is rendered in real 3D rather than drawn.

The world is chosen from the use scene: a technician works in a dim shop under a single lamp, and a
customer opens the tracker on a phone in a dark room. Both want the same thing — legible figures and
one obvious action.

## The three rules

1. **Surfaces separate by a step in tone, never by a heavier border.** `panel` → `raised` →
   `overlay`, with a single 1 px hairline where an edge must exist.
2. **Colour is a signal, not decoration.** The indigo marks the one primary action and live state.
   Moss marks "ready / paid", vermilion marks "blocked / failed". Nothing else earns a hue.
3. **Geometry is tight and physical.** Controls 6 px, panels 8–10 px, insets 6 px. Nothing is a pill.

## Colour

All tokens live in `tailwind.config.ts` and are mirrored as CSS variables in `app/globals.css`.

| Token | Hex | Use |
| --- | --- | --- |
| `canvas` | `#09080F` | Page ground. |
| `sunken` | `#06050B` | Insets, the counter board, fields. |
| `panel` | `#110F1C` | Panels, the auth form column. |
| `raised` | `#18162A` | Nested surfaces, secondary buttons, hover. |
| `overlay` | `#201D38` | Popovers, active secondary state. |
| `hairline` | `#E7E3FF0F` | Panel edges and row rules. |
| `hairline-strong` | `#E7E3FF1F` | Control edges, focusable boundaries. |
| `ink` | `#F1EFFA` | Primary text. |
| `ink-secondary` | `#B5B1CA` | Body copy, descriptions. |
| `ink-tertiary` | `#928DA9` | Labels, metadata, help text. |
| `ink-faint` | `#8C87A3` | Decorative marks and disabled state only. |
| `accent` | `#6E5CF7` | The one primary action, live state, selected marker. |
| `accent-bright` | `#9C8BFF` | Hover, focus rings, active line. |
| `accent-deep` | `#4E3DE0` | Pressed primary. |
| `positive` | `#4FD3A1` | Ready, paid, connected. |
| `warn` | `#EDB24A` | Waiting on parts, unpaid, degraded. |
| `negative` | `#F4685F` | Failed check, urgent, cancelled. |
| `info` | `#7FB6F0` | On the bench, diagnosing. |

Contrast floor: body and help text ≥ 4.5:1 on `canvas` and `panel`; placeholders are never lighter
than `ink-tertiary`. The primary fill is a violet gradient (`#7C6AFF` → `#5A47E6`) carrying near-white
text (`#F8F6FF`), which clears 6.5:1; it never carries dim ink.

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
- **The teardown takes the shape of the thing that came in.** `lib/device-form.ts` maps a device
  category to one of four forms, and the scene derives every dimension from it, so a laptop is a
  wide shallow stack and a console a squat one — never a phone standing in for a PlayStation.

| Form | Categories | Proportions | Its own details |
| --- | --- | --- | --- |
| `handheld` | phone, other | 7.0 × 14.4 | camera block, three lenses, flash, charging coil, side buttons |
| `tablet` | tablet | 11.2 × 13.4 | camera block and lenses, no coil |
| `clamshell` | laptop | 12.8 × 8.9 | keyboard deck (5 × 14 keys), trackpad, vents |
| `box` | console, camera | 12.4 × 7.6 | heatsink fins and fan instead of a cell, vented top cover, port slots |

The module is plain TypeScript with no client marker, because the tracker is a server component and
has to choose a form before the scene is ever fetched.
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
- On a phone the section eyebrow drops away and search becomes an icon control to preserve room for
  the page name and profile button.
- Profile disclosure and command palette close on Escape and restore focus. The mobile drawer traps
  keyboard focus, locks background scrolling while open, and returns focus to its trigger on close.
- Native selects share a 44 px control, inset surface and chevron while retaining browser-native
  options and keyboard behavior.
- Mission control is two panes in one viewport: the queue (stats, live rows, keyboard up/down) and
  the bench (the scene, three readouts, the actions). Nothing scrolls except the two inner panes.
- Everything else uses a shared page frame: title, description, actions, then panels.

## Motion

- Motion is feedback, not performance. Workspace pages do not animate on arrival; the public hero
  uses `.rise` once, staggered by 60–70 ms.
- Anchored overlays use a small opacity/transform entrance: 150 ms for the profile disclosure,
  170 ms for search and 180 ms for the mobile drawer. Press and colour feedback stays near 130 ms;
  ease out with `cubic-bezier(0.22, 1, 0.36, 1)`.
- The scene is the one authored moment: springs for the pointer, damped easing for the explode.
- Never `transition: all`; name the properties.
- `prefers-reduced-motion` removes travel, parallax and drift while keeping opacity and colour.
  Overlay entrances reduce to an opacity change, and the workspace drawer stays in place.

## The landing page

The public page has one composition, and everything else defers to it: type on the left, art on
the right, nothing in a card unless it is a control.

| Piece | Rule |
| --- | --- |
| Nav | Borderless, floating over the art. Mark left, three links centre, one near-white pill right. |
| Eyebrow | `.eyebrow` — mono, 0.2em tracking, a 32px dash, `--ink-tertiary`. One per section. |
| Headline | `.display-hero` — **weight 400**, −0.032em, 0.94 leading, `clamp(44px, 6.6vw, 92px)`. |
| Body | 17px / 1.6 in `--ink-secondary`, max 44ch. Never on top of artwork. |
| Facts | Three columns, mono numerals, a hairline above that spans the container. |
| Sections | One oversized `h2`, a right-hand note, then a single bordered grid split by hairlines. |
| Footer | Large wordmark, one blurb, three link columns, a quiet bottom bar. |

The weight is the whole trick. At 90px a 600 face shouts and crowds the artwork; regular weight
with tight tracking reads composed and lets the illustration be the loud thing.

### The repair tree

`components/landing/repair-tree.tsx` renders a looping 7.5s bloom video at full bleed
(`public/art/hero-sakura.mp4` — 1920×1080, 30 fps, 225 frames, audio stripped, 4.1 MB).
A time-based, eased 500ms tail-to-head blend softens the source seam. Motion interpolation uses
frames from both sides of the wrap, then trims a complete cycle so the encoder cannot drop the
last two frames. The tree and petal composition are preserved. A still of the same tree
(`public/art/sakura-tree.png`) under `prefers-reduced-motion`. The art is masked at the bottom so it
dissolves into the next section instead of ending on a line.

Three attempts, and what each one taught:

| Attempt | Result | Lesson |
| --- | --- | --- |
| Canvas L-system, drawn branches | Read as smoke | Soft blooms without bounce light always do |
| Generated still, `mix-blend-mode: screen` | Read as zoomed | A square render cropped into a wide frame loses its composition |
| Wide render with its own motion | Matches the reference | Canopy, crop and petals are already composed for the frame |

The same footage is the **front door**: `AuthShell` puts it behind the sign-in plate at full bleed,
with the logo, headline and links over it. The shopfront and the front door should be the same
building — a form floating on a flat panel is a different, smaller place.

The scrims do the legibility work, never opacity on the artwork alone:

- top band (128px) so nav links never land on a blossom;
- wall `0.9 → 0.62 → 0.18 → transparent` so copy has ground but petals still read mid-frame;
- floor that **fades out**, plus a matching hand-off at the top of the next section, because an
  opaque floor hides the ambient field and draws a step across the page.

## Ornament

Violet is the brand, so it is allowed to exist as light — but as *light*, not as a gradient poured
over type. The room itself is drawn by `components/patchwork/ambient-field.tsx`, mounted once in
`app/layout.tsx`, and the rest are small utilities in `app/globals.css`:

| Element | What it draws | Where it is allowed |
| --- | --- | --- |
| `<AmbientField>` | Four light fields: violet lamp, cyan spill, indigo floor, plus a near light that answers the pointer. | Once, behind everything, from the root layout. Never per page. |
| `.grain` | 3% SVG fractal-noise overlay in `soft-light`. | Over large dark fields, to stop gradient banding. |
| `.hairline-glow` | One 1 px rule fading indigo → cyan across a panel's top edge. | Panel tops only. |
| `.bench-ticks` | Two corner brackets, like a technical drawing. | Around the 3D plate. |
| `.iris` | A violet spotlight under the device. | Behind the 3D, always. |

Rules that keep it from turning into decoration soup: one ambient field per screen, ornaments never
sit behind text, and no ornament is the only carrier of meaning.

### The background follows the pointer — on purpose, and cheaply

Three responses, one gesture. They are layers, not one big effect, because each
answers a different question: where is the light (orbs), where is the surface
(grid), where is the hand (dust).

| Layer | File | What moves | Cost |
| --- | --- | --- | --- |
| Orbs | `ambient-field.tsx` | 4 blurred fields, parallax by depth | transform only |
| Grid | `reactive-grid.tsx` | same grid, lit through a pointer mask, shifted 14px against the hand | one CSS variable pair per frame |
| Dust | `pointer-dust.tsx` | Up to 72 motes, pulled within 300px, pushed away when the hand moves fast | one canvas, two cached glow sprites |

Things worth keeping:

- **The dust has a wake.** Motes within the radius are pushed *outward* by pointer
  speed. This is what makes it feel like air rather than a follower.
- **Brightness is distance**, so the field has a centre without drawing one.
- **The grid moves against the pointer**, 14px, which reads as depth; moving with
  it reads as a sticker.
- **Every layer stops on a hidden tab**, and all three are inert under
  `prefers-reduced-motion` — no loop, no listeners, just the artwork.

The dust is mounted **once, in `app/layout.tsx`**, at `z-[45]` and `pointer-events-none`, above the
content rather than behind it. That is deliberate: dust is the air in the room, so a workspace panel
or a form card must not hide it. The grid is per-page, because a grid is a drawing and only some pages
are drawn on.

Measured, not asserted: `scripts/measure-follow.mjs` parks the pointer on a fixed
probe and compares mean luminance there with the pointer at the opposite corner.
Current reading: **+39%** (25.5 → 35.5) at the probe.

### The mark: a sewn P

`components/ui/logo.tsx` is a letter P with a lavender patch sewn into its bowl. The silhouette is
the main read; two short thread marks remain secondary detail. The body and patch use adjacent brand
violets, and the accent-colored `work` half of the wordmark carries that contrast into the name.
The favicon repeats the same geometry in `app/icon.svg`.

Review the mark at the real 16 px favicon size and at the 22 px public-header size; the SVG view
alone is not enough to judge whether the thread survives rasterisation.

### Reading a password

`components/ui/password-field.tsx` wraps `FormField` with a reveal toggle in the field's `trailing`
slot. The eye is **always** there rather than appearing after a failed attempt: typing blind on a
phone keyboard is the most common way a first sign-in fails, and it fails silently.

The control is a real button — `type="button"` so it cannot submit, `aria-pressed`, and a label that
swaps between "Show password" and "Hide password". Focus order puts it after the field and before
submit, which is where the hand reaches when it realises it cannot see what it typed.

### Hairlines never end mid-air

A 1px `border-top` stops dead and reads as a cut. Dividers are gradient rules that
fade to transparent (`h-px` + `linear-gradient(to right, …0.16, …0.07 54%, transparent)`),
and controls use one inset ring instead of a border plus an inner button ring —
two adjacent strokes on a pill always look like an overlap.

## Editing a price

Prices are set one part at a time, on the row the part lives on
(`components/workspace/price-editor.tsx` + `updatePartPriceAction`). A shop
changes a price because one thing moved — a supplier, a screen family — so a
batch tool would be a control nobody asked for.

- **Read state** matches the table: mono figure, cost underneath, a quiet
  `Edit` that only asserts itself on hover or focus.
- **Edit state** is a real field: 92 px, `field-inset`, autofocus, Escape
  cancels, Enter saves.
- The margin is stated live while typing, and a price under cost flips to
  `warn` with the exact shortfall. Undercutting is allowed — loss leaders exist —
  but it is never silent.
- The action stores exactly what was typed; it does not infer or round.

### Price history

Every change is kept in `part_price_events`, written by a trigger on
`parts.price_cents` rather than by the action — so a price changed by psql or by
the API is recorded the same way as one changed in the UI. The trigger records
the old price, the new price, `auth.uid()` and the timestamp.

On the row, history is a native `<details>` (`PriceHistory`): no client state,
works with JavaScript off, and the browser already knows how to describe a
disclosure to a screen reader. It reads newest first, states each change as
`old → new` with who did it and when, labels the part's first row as
`Set at $X` instead of pretending it was a change of zero, and hides anything
past the fourth row behind `+N earlier`.

One query per page fetches the history for every visible part; a per-row fetch
would be the slowest thing on the screen.

## The way back

`components/patchwork/back-link.tsx` is the one back control. It goes back
through history when this tab has a same-origin referrer, and otherwise takes
the caller's fallback route, so a direct visit never dead-ends. The public
header renders it beside the mark, after a 1 px divider.

Where it appears, and why not everywhere: the tracker and the status board are
the only public pages you can arrive at from somewhere else. The workspace detail
pages carry explicit parent links (`Back to tickets`) because their destination
is knowable, and a history-aware control there would sometimes be wrong.

## Auditing the site

Four scripts, all kept in the repo because "I checked it" is not evidence:

| Script | What it settles |
| --- | --- |
| `scripts/audit-site.mjs` | every route at 390/820/1440: status, console, page errors, failed requests, broken images, overflow; then every internal link resolves |
| `scripts/audit-flows.mjs` | the public forms and the keyboard: empty submits, junk input, wrong password, the reveal toggle, palette, phone drawer |
| `scripts/audit-detail.mjs` | DOM hygiene (duplicate ids, heading order, one `h1`), alt text, 24px tap targets, iOS 16px inputs, visible focus rings, production headers, robots/sitemap |
| `scripts/audit-workspace.mjs` | the staff console against a live deployment, read-only — it never submits a mutation |

Run them against a local server and against `https://patchwork-production.vercel.app`.
The deployment is the only place some behaviours exist: the design-preview routes return 404 there
by design, so the scripts skip those checks rather than report them as failures.

### Where "records unreachable" is not "no repair found"

`lib/repair/queries.ts` exports `RecordsUnavailableError` and `isRecordsUnavailable`. A remote failure
arrives as `fetch failed` / `ETIMEDOUT` / `ENOTFOUND`, which is indistinguishable from a real exception
unless it is classified. The tracker catches only that class: it tells the customer the records cannot
be reached and that nothing was lost. Everything else still throws, so a genuine bug reaches
`app/error.tsx` instead of hiding behind friendly copy.

### Security headers, and the one deliberately missing

`next.config.ts` sets `nosniff`, `X-Frame-Options: DENY`, a referrer policy, a permissions policy and
COOP. There is **no** CSP: getting one wrong silently breaks Supabase auth and Next's inline styles,
which is a worse failure than the class of attack it prevents on a shop desk. If it is ever added it
must be tested deployment-first, not in a build.

## Rejected looks

Do not bring these back:

- gradient text, and a saturated colour poured behind every section
- glass cards and backdrop blur as decoration
- a dot grid as page structure
- five-hue status rainbows where the colour is the only signal
- warm graphite + brass (the bench-light pass) — replaced by the violet ground above
- pill shapes, and 20 px radii on 32 px controls
- sketch-style or line-art SVG standing in for a product picture
- cream + clover green + coral + Fraunces
- black + safety yellow + Bricolage + Space Mono
- pills for everything, and 20 px radii on 32 px controls
