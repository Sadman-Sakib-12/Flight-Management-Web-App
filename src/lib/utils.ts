import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDuration, intervalToDuration } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy, HH:mm");
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy");
}

export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "HH:mm");
}

export function getFlightDuration(departsAt: string, arrivesAt: string): string {
  const duration = intervalToDuration({
    start: new Date(departsAt),
    end: new Date(arrivesAt),
  });
  return formatDuration(duration, { format: ["hours", "minutes"] });
}

export function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getSeatClassLabel(cls: string): string {
  const labels: Record<string, string> = {
    economy: "Economy",
    business: "Business",
    first: "First Class",
  };
  return labels[cls] ?? cls;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    rescheduled: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    scheduled: "bg-green-100 text-green-800",
    delayed: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}
