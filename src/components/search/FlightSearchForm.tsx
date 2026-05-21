"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search, ArrowLeftRight, ChevronDown } from "lucide-react";
import { useFlightStore } from "@/store/useFlightStore";
import type { SearchQuery, SeatClass } from "@/types";
import { format } from "date-fns";

const AIRPORTS = [
  { label: "Dubai", code: "DXB", value: "Dubai (DXB)" },
  { label: "London", code: "LHR", value: "London (LHR)" },
  { label: "New York", code: "JFK", value: "New York (JFK)" },
  { label: "Los Angeles", code: "LAX", value: "Los Angeles (LAX)" },
];

const CLASSES: { value: SeatClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

export default function FlightSearchForm() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, setBookingStep } = useFlightStore();
  const today = format(new Date(), "yyyy-MM-dd");

  const [form, setForm] = useState<SearchQuery>({
    origin: searchQuery?.origin ?? "",
    destination: searchQuery?.destination ?? "",
    date: searchQuery?.date ?? today,
    passengerCount: searchQuery?.passengerCount ?? 1,
    class: searchQuery?.class ?? "economy",
  });

  const handleSwap = () =>
    setForm((p) => ({ ...p, origin: p.destination, destination: p.origin }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination || form.origin === form.destination) return;
    setSearchQuery(form);
    setBookingStep("results");
    router.push(
      `/flights?${new URLSearchParams({
        origin: form.origin,
        destination: form.destination,
        date: form.date,
        passengers: String(form.passengerCount),
        class: form.class,
      })}`
    );
  };

  const selectedOrigin = AIRPORTS.find((a) => a.value === form.origin);
  const selectedDest = AIRPORTS.find((a) => a.value === form.destination);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] max-w-5xl mx-auto overflow-hidden"
    >
      {/* Main row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1px_1fr_1px_1fr_1px_1fr_auto] items-stretch">

        {/* FROM */}
        <div className="relative group px-6 py-7 hover:bg-neutral-50 transition-colors cursor-pointer">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            From
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedOrigin ? (
                <div>
                  <span className="text-xl font-bold text-neutral-900">{selectedOrigin.code}</span>
                  <span className="text-sm text-neutral-400 ml-2">{selectedOrigin.label}</span>
                </div>
              ) : (
                <span className="text-base text-neutral-400">Select city</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-300 shrink-0" />
          </div>
          <select
            value={form.origin}
            onChange={(e) => setForm({ ...form, origin: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required
          >
            <option value="">Select origin</option>
            {AIRPORTS.filter((a) => a.value !== form.destination).map((a) => (
              <option key={a.value} value={a.value}>
                {a.label} ({a.code})
              </option>
            ))}
          </select>
        </div>

        {/* Swap button */}
        <div className="hidden lg:flex items-center justify-center px-1">
          <button
            type="button"
            onClick={handleSwap}
            className="w-9 h-9 rounded-full border-2 border-neutral-200 bg-white hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center transition-all duration-150 group z-10"
            title="Swap cities"
          >
            <ArrowLeftRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        {/* TO */}
        <div className="relative group px-6 py-7 hover:bg-neutral-50 transition-colors cursor-pointer border-t lg:border-t-0 border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            To
          </label>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedDest ? (
                <div>
                  <span className="text-xl font-bold text-neutral-900">{selectedDest.code}</span>
                  <span className="text-sm text-neutral-400 ml-2">{selectedDest.label}</span>
                </div>
              ) : (
                <span className="text-base text-neutral-400">Select city</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-300 shrink-0" />
          </div>
          <select
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required
          >
            <option value="">Select destination</option>
            {AIRPORTS.filter((a) => a.value !== form.origin).map((a) => (
              <option key={a.value} value={a.value}>
                {a.label} ({a.code})
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-neutral-100 my-4" />

        {/* DATE */}
        <div className="group px-6 py-7 hover:bg-neutral-50 transition-colors border-t lg:border-t-0 border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            Date
          </label>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
            <input
              type="date"
              value={form.date}
              min={today}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="flex-1 bg-transparent text-lg font-semibold text-neutral-900 focus:outline-none cursor-pointer min-w-0"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-neutral-100 my-4" />

        {/* PASSENGERS */}
        <div className="relative group px-6 py-7 hover:bg-neutral-50 transition-colors cursor-pointer border-t lg:border-t-0 border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            Passengers
          </label>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xl font-bold text-neutral-900">
              {form.passengerCount} {form.passengerCount === 1 ? "Adult" : "Adults"}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-300 shrink-0" />
          </div>
          <select
            value={form.passengerCount}
            onChange={(e) => setForm({ ...form, passengerCount: Number(e.target.value) })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Adult" : "Adults"}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-neutral-100 my-4" />

        {/* CLASS */}
        <div className="relative group px-6 py-7 hover:bg-neutral-50 transition-colors cursor-pointer border-t lg:border-t-0 border-neutral-100">
          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            Class
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-neutral-900">
              {CLASSES.find((c) => c.value === form.class)?.label ?? "Economy"}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-300 shrink-0" />
          </div>
          <select
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value as SeatClass })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div className="flex items-stretch border-t lg:border-t-0 border-neutral-100">
          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base px-10 transition-colors duration-150 w-full lg:w-auto lg:rounded-none lg:rounded-r-2xl"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Mobile swap */}
      <div className="flex justify-center py-2 border-t border-neutral-100 lg:hidden">
        <button
          type="button"
          onClick={handleSwap}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 py-1.5 px-4 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Swap cities
        </button>
      </div>
    </form>
  );
}
