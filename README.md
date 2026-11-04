# Patchwork

**Repair-shop operations, from intake to collection.**

Patchwork is a workshop management system for repair businesses. It covers the full repair lifecycle — device intake, diagnosis, parts, invoicing, payment, and customer collection — alongside a public tracker customers can check without an account.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-087EA4?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Auth-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14-0055FF?style=flat-square&logo=framer&logoColor=white)](https://motion.dev)

## Live Demo

<!-- LIVE_DEMO_PLACEHOLDER -->

The production URL is added here after the Vercel deployment completes.

## Highlights

| Area | What it does |
| --- | --- |
| **Mission Control** | Live repair counts, the open queue, bench load, ready-for-pickup list, low stock, and paid revenue in one operational view. |
| **Tickets** | Intake, diagnosis, priority, technician assignment, status workflow, notes, parts used, invoice, payment, and collection. |
| **Customers and devices** | Contact profiles, device history, and every repair attached to the person. |
| **Inventory** | Parts, SKU, stock, reorder levels, cost, price, and supplier, with stock movement recorded when a part is fitted to a repair. |
| **Invoices** | Labour, parts, tax, totals, and an unpaid/paid ledger. Marking an invoice paid closes out collection. |
| **Team** | Role-based staff access with server-side guards and confirmed staff accounts. |
| **Public tracker** | Customers follow repair progress with the tracking code from their receipt. No account, email, or phone number required. |
| **Command palette** | Keyboard-first navigation and actions from anywhere in the workspace with `Cmd/Ctrl + K`. |
| **3D workbench** | A CSS 3D exploded-device scene with spring parallax that responds to the pointer, with a static fallback for reduced-motion users. |

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, Server Components, Server Actions |
| UI | React 19, Tailwind CSS 3, Lucide icons, Geist Sans and Geist Mono |
| Motion | Framer Motion 14 — page transitions, staggered panels, crossfades, spring hovers |
| Data | Supabase Postgres with Row Level Security, Supabase Auth, security-definer RPCs |
| Language | TypeScript 5 (strict) |
| Tests | Vitest, Testing Library, Playwright |

## Quick start

Requirements: Node.js 20.19 or newer, npm, and a Supabase project.

```bash
npm install
cp .env.example .env.local
```

Fill in the Supabase values in `.env.local`, then apply the schema and seed the demo workshop:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npm run seed:demo
npm run seed:repair
npm run dev
```

Open <http://localhost:3000>. The workspace requires a session and redirects to `/login`; the public tracker lives at `/track`, and the health page at `/status`.

### Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Public anon key, constrained by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Seed scripts and staff creation. Never expose it to the browser. |
| `NEXT_PUBLIC_SITE_URL` | Browser and server | Base URL used in Supabase auth redirects. |
| `DEMO_PASSWORD` | Local only | Password for the seeded demo accounts. |
| `NEXT_PUBLIC_DESIGN_PREVIEW` | Local only | Enables the design-preview screenshot route. |

`.env` and `.env.local` are ignored by git. Real keys and passwords never belong in the repository.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local Next.js server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run typecheck` | Generate Next.js route types and run TypeScript. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run the Vitest suite. |
| `npm run test:coverage` | Run the unit suite with coverage. |
| `npm run test:integration` | Run RLS and public-tracking checks against local Supabase. |
| `npm run test:e2e` | Run Playwright browser tests. |
| `npm run check:env` | Verify required Supabase variables without printing secrets. |
| `npm run seed:demo` | Create or update the demo staff accounts. |
| `npm run seed:repair` | Seed customers, devices, parts, tickets, timelines, and invoices. |
| `npm run db:push` | Push database migrations with the Supabase CLI. |

## Access model

| Role | Access |
| --- | --- |
| `superadmin` | Owner-level access, including team and role administration. |
| `admin` | Workshop operations, inventory, invoicing, and management actions. |
| `user` | Technician access to the repair queue and assigned work. |

Permissions are enforced in the database with Row Level Security and repeated in server-side guards. The browser only ever receives the anon key.

### Demo accounts

The seed script creates three confirmed accounts; the password comes from `DEMO_PASSWORD` in `.env.local`.

| Email | Role |
| --- | --- |
| `alex@luckypatcher.test` | `superadmin` |
| `admin@luckypatcher.test` | `admin` |
| `user@luckypatcher.test` | `user` |

## Architecture

```text
app/
  (auth)/                 Login, registration, recovery, password reset
  (workspace)/            Authenticated workshop
    page.tsx              Mission Control dashboard
    tickets/              Queue, intake, ticket detail
    customers/            Directory, new customer, customer history
    inventory/            Parts and stock
    invoices/             Invoice ledger
    team/                 Staff and roles
  track/                  Public repair tracker
  status/                 Runtime and Supabase health
components/
  workspace/              Shell, command palette, motion primitives, 3D bench
  ui/                     Buttons, fields, alerts, logo
lib/                      Supabase clients, auth guards, data access, validation
supabase/                 Migrations, seeds, local configuration
tests/                    Vitest unit and component suites
e2e/                      Playwright specs
docs/                     Architecture, deployment, security, testing
```

The data model follows the repair itself:

```text
customers ──< devices ──< tickets ──< ticket_parts >── parts
                              │
                              ├──< ticket_events
                              └──  invoices
profiles ── assigned_to / created_by / actor
```

- Tickets receive a generated `PW-####` number and an unguessable tracking code.
- `track_ticket(code)` is a security-definer RPC that returns only customer-safe progress data.
- Staff read repair data through RLS; anonymous visitors can reach only the tracking RPC.

## Deployment

Production runs on Vercel with Supabase Auth and Postgres.

1. Import the repository into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project's environment variables.
3. Deploy and note the production URL.
4. In Supabase, open **Authentication → URL Configuration** and set the **Site URL** to the production URL. Add `https://<production-domain>/**` under **Redirect URLs**.

`SUPABASE_SERVICE_ROLE_KEY` is only needed for seed scripts and staff provisioning; do not add it to the client bundle.

See [`docs/deployment.md`](docs/deployment.md) for the full checklist.

## Testing

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The integration and browser suites need a local Supabase stack; see [`docs/testing.md`](docs/testing.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [Security notes](docs/security.md)
- [Supabase setup](docs/supabase-setup.md)
- [Testing guide](docs/testing.md)
- [Design system](docs/design-system.md)
- [Documentation index](docs/README.md)

## Contributing

All changes go through a pull request. See [CONTRIBUTING.md](CONTRIBUTING.md) for the branch and PR workflow, test gate, migration rules, and repository conventions.
