import {
  Boxes,
  LayoutGrid,
  Receipt,
  ShieldCheck,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Mission control", short: "Bench overview", icon: LayoutGrid },
  { href: "/tickets", label: "Tickets", short: "Repair queue", icon: Ticket },
  { href: "/customers", label: "Customers", short: "People and devices", icon: Users },
  { href: "/inventory", label: "Inventory", short: "Parts and stock", icon: Boxes },
  { href: "/invoices", label: "Invoices", short: "Ledger and payments", icon: Receipt },
  { href: "/team", label: "Team", short: "Staff and access", icon: ShieldCheck },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
