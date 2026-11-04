import type { AppRole } from "@/lib/auth/types";

import type {
  DeviceCategory,
  InvoiceStatus,
  TicketPriority,
  TicketStatus,
} from "./types";

export const TICKET_STATUS_META: Record<
  TicketStatus,
  {
    label: string;
    description: string;
    tone: string;
    dot: string;
  }
> = {
  intake: {
    label: "Intake",
    description: "Logged and waiting for a bench slot.",
    tone: "text-ink-secondary",
    dot: "bg-raised",
  },
  diagnosing: {
    label: "Diagnosing",
    description: "On the bench, finding the fault.",
    tone: "text-info",
    dot: "bg-info",
  },
  waiting_parts: {
    label: "Waiting on parts",
    description: "Held until a part arrives.",
    tone: "text-warn",
    dot: "bg-warn",
  },
  in_repair: {
    label: "In repair",
    description: "Approved and actively being fixed.",
    tone: "text-ink",
    dot: "bg-accent",
  },
  ready: {
    label: "Ready",
    description: "Repair complete, waiting for pickup.",
    tone: "text-positive",
    dot: "bg-positive",
  },
  picked_up: {
    label: "Picked up",
    description: "Paid and collected.",
    tone: "text-ink-secondary",
    dot: "bg-raised/60",
  },
  cancelled: {
    label: "Cancelled",
    description: "Closed without a repair.",
    tone: "text-negative",
    dot: "bg-negative",
  },
};

export const PRIORITY_META: Record<
  TicketPriority,
  { label: string; tone: string; dot: string; rank: number }
> = {
  low: { label: "Low", tone: "text-ink-secondary", dot: "bg-raised/60", rank: 0 },
  normal: { label: "Normal", tone: "text-ink-secondary", dot: "bg-raised", rank: 1 },
  high: { label: "High", tone: "text-warn", dot: "bg-warn", rank: 2 },
  urgent: { label: "Urgent", tone: "text-negative", dot: "bg-negative", rank: 3 },
};

export const INVOICE_STATUS_META: Record<
  InvoiceStatus,
  { label: string; tone: string; dot: string }
> = {
  draft: { label: "Draft", tone: "text-ink-secondary", dot: "bg-raised/60" },
  sent: { label: "Unpaid", tone: "text-warn", dot: "bg-warn" },
  paid: { label: "Paid", tone: "text-positive", dot: "bg-positive" },
  void: { label: "Void", tone: "text-negative", dot: "bg-negative" },
};

export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: "Owner",
  admin: "Manager",
  user: "Technician",
};

export const DEVICE_CATEGORY_LABELS: Record<DeviceCategory, string> = {
  phone: "Phone",
  laptop: "Laptop",
  tablet: "Tablet",
  console: "Console",
  camera: "Camera",
  other: "Other",
};

export function formatMoney(cents: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

export function formatCompactMoney(cents: number | null | undefined) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10000 ? 1 : 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatRelative(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  const diff = date.getTime() - Date.now();
  const minutes = Math.round(diff / 60000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return formatter.format(days, "day");
  return formatDate(value);
}

export function deviceLabel(device: { category: DeviceCategory; brand: string; model: string }) {
  return `${DEVICE_CATEGORY_LABELS[device.category] ?? device.category} · ${device.brand} ${device.model}`;
}

export function statusLabel(status: TicketStatus) {
  return TICKET_STATUS_META[status].label;
}

export function openStatuses(): TicketStatus[] {
  return ["intake", "diagnosing", "waiting_parts", "in_repair"];
}

export function isOpenStatus(status: TicketStatus) {
  return openStatuses().includes(status);
}

export function taxForSubtotal(subtotalCents: number) {
  return Math.round(subtotalCents * 0.12);
}
