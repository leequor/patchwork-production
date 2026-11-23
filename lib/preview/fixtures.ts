import type { AuthUser } from "@/lib/auth/types";
import type { TicketRow } from "@/lib/repair/types";

/**
 * Fixture data for the design-preview routes.
 *
 * Nothing here touches Supabase. It exists so the workspace surfaces can be
 * reviewed and screenshotted locally without a live database, and it is only
 * reachable when NEXT_PUBLIC_DESIGN_PREVIEW is "true".
 */

const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();


export const PREVIEW_USER: AuthUser = {
  id: "preview-owner",
  email: "alex@luckypatcher.test",
  role: "admin",
  fullName: "Alex Moreau",
  createdAt: "2026-01-04T09:00:00.000Z",
};

function row(
  index: number,
  overrides: {
    customer: string;
    phone: string;
    brand: string;
    model: string;
    category: TicketRow["device"]["category"];
    status: TicketRow["status"];
    priority: TicketRow["priority"];
    issue: string;
    estimate: number;
    created: number;
    assignee: string | null;
  },
): TicketRow {
  return {
    id: `preview-ticket-${index}`,
    ticket_number: `PW-${1040 + index}`,
    public_code: `TRACK${1040 + index}`,
    customer_id: `preview-customer-${index}`,
    device_id: `preview-device-${index}`,
    status: overrides.status,
    priority: overrides.priority,
    issue: overrides.issue,
    diagnosis: null,
    assigned_to: overrides.assignee ? `preview-staff-${overrides.assignee}` : null,
    labour_cents: Math.round(overrides.estimate * 0.4),
    estimate_cents: overrides.estimate,
    final_cents: null,
    due_at: null,
    completed_at: null,
    created_by: PREVIEW_USER.id,
    created_at: minutesAgo(overrides.created),
    updated_at: minutesAgo(Math.max(1, overrides.created - 20)),
    customer: {
      id: `preview-customer-${index}`,
      full_name: overrides.customer,
      phone: overrides.phone,
      email: `${overrides.customer.split(" ")[0].toLowerCase()}@example.com`,
    },
    device: {
      id: `preview-device-${index}`,
      category: overrides.category,
      brand: overrides.brand,
      model: overrides.model,
    },
    assignee: overrides.assignee
      ? {
          id: `preview-staff-${overrides.assignee}`,
          full_name: overrides.assignee,
          email: `${overrides.assignee.split(" ")[0].toLowerCase()}@luckypatcher.test`,
        }
      : null,
  };
}

export const PREVIEW_QUEUE: TicketRow[] = [
  row(1, {
    customer: "Maya Ferreira",
    phone: "+1 415 555 0142",
    brand: "Apple",
    model: "iPhone 15 Pro",
    category: "phone",
    status: "in_repair",
    priority: "high",
    issue: "Screen cracked after a drop. Touch still registers, digitizer flags a dead column on the left edge.",
    estimate: 24900,
    created: 18,
    assignee: "Deniz Kaya",
  }),
  row(2, {
    customer: "Tobias Lindqvist",
    phone: "+1 415 555 0198",
    brand: "Framework",
    model: "Laptop 13",
    category: "laptop",
    status: "waiting_parts",
    priority: "normal",
    issue: "Battery swells under load and the deck flexes above the trackpad. Replacement cell ordered.",
    estimate: 18400,
    created: 240,
    assignee: "Priya Raman",
  }),
  row(3, {
    customer: "Rosa Delgado",
    phone: "+1 415 555 0110",
    brand: "Nintendo",
    model: "Switch OLED",
    category: "console",
    status: "diagnosing",
    priority: "normal",
    issue: "Dock handshake fails intermittently. USB-C port looks discoloured on two pins.",
    estimate: 12000,
    created: 62,
    assignee: "Deniz Kaya",
  }),
  row(4, {
    customer: "Idris Bello",
    phone: "+1 415 555 0177",
    brand: "Sony",
    model: "A7 III",
    category: "camera",
    status: "ready",
    priority: "low",
    issue: "Shutter curtain sluggish below 1/60. Replaced the shutter unit and re-timed it.",
    estimate: 46000,
    created: 1500,
    assignee: "Priya Raman",
  }),
  row(5, {
    customer: "Hana Okafor",
    phone: "+1 415 555 0135",
    brand: "Apple",
    model: "iPad Air",
    category: "tablet",
    status: "intake",
    priority: "urgent",
    issue: "Won't charge past 12%. Customer needs it back before Friday for a work trip.",
    estimate: 0,
    created: 6,
    assignee: null,
  }),
  row(6, {
    customer: "Sam Whitfield",
    phone: "+1 415 555 0163",
    brand: "Dell",
    model: "XPS 13",
    category: "laptop",
    status: "in_repair",
    priority: "normal",
    issue: "Liquid damage on the keyboard controller. Cleaned the board, two keys still ghosting.",
    estimate: 21600,
    created: 480,
    assignee: "Marco Silva",
  }),
  row(7, {
    customer: "Leila Haddad",
    phone: "+1 415 555 0121",
    brand: "Google",
    model: "Pixel 8",
    category: "phone",
    status: "diagnosing",
    priority: "high",
    issue: "Rear camera module rattles and autofocus hunts. Possible drop damage to the OIS assembly.",
    estimate: 14900,
    created: 130,
    assignee: "Marco Silva",
  }),
  row(8, {
    customer: "Owen Brady",
    phone: "+1 415 555 0189",
    brand: "Apple",
    model: "MacBook Pro 14",
    category: "laptop",
    status: "waiting_parts",
    priority: "normal",
    issue: "Display assembly flickers on wake. Waiting on a top-case from the supplier.",
    estimate: 78000,
    created: 3200,
    assignee: "Deniz Kaya",
  }),
  row(9, {
    customer: "Priyanka Nair",
    phone: "+1 415 555 0102",
    brand: "Samsung",
    model: "Galaxy S24",
    category: "phone",
    status: "ready",
    priority: "normal",
    issue: "Charging port replaced and tested at 45W. Ready for collection.",
    estimate: 9500,
    created: 2800,
    assignee: "Marco Silva",
  }),
  row(10, {
    customer: "Gustav Ek",
    phone: "+1 415 555 0154",
    brand: "Steam",
    model: "Deck OLED",
    category: "console",
    status: "intake",
    priority: "low",
    issue: "Left thumbstick drifts. Customer asked for a quote before we open it.",
    estimate: 0,
    created: 95,
    assignee: null,
  }),
];

export const PREVIEW_DASHBOARD = {
  openCount: 9,
  readyCount: 2,
  revenueMtd: 412_850,
  lowStockCount: 3,
};
