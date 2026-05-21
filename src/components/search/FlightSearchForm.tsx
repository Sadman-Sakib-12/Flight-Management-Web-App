"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search, ArrowLeftRight } from "lucide-react";
import { useFlightStore } from "@/store/useFlightStore";
import type { SearchQuery, SeatClass } from "@/types";
import { format } from "date-fns";

const AIRPORTS = [
  "Dubai (DXB)",
  "London (LHR)",
  "New York (JFK)",
  "Los Angeles (LAX)",
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

  const handleSwap = () => {
    setForm((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origin || !form.destination) return;
    if (form.origin === form.destination) return;

    setSearchQuery(form);
    setBookingStep("results");

    const params = new URLSearchParams({
      origin: form.origin,
      destination: form.destination,
      date: form.date,
      passengers: String(form.passengerCount),
      class: form.class,
    });

    router.push(`/flights?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Origin */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="input-field pl-9 text-gray-900"
              required
            >
              <option value="">Select origin</option>
              {AIRPORTS.filter((a) => a !== form.destination).map((airport) => (
                <option key={airport} value={airport}>
                  {airport}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button (desktop) */}
        <div className="hidden lg:flex items-end pb-1 justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-primary-600 transition-colors"
            title="Swap origin and destination"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="input-field pl-9 text-gray-900"
              required
            >
              <option value="">Select destination</option>
              {AIRPORTS.filter((a) => a !== form.origin).map((airport) => (
                <option key={airport} value={airport}>
                  {airport}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={form.date}
              min={today}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field pl-9 text-gray-900"
              required
            />
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Passengers */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Passengers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={form.passengerCount}
              onChange={(e) =>
                setForm({ ...form, passengerCount: Number(e.target.value) })
              }
              className="input-field pl-9 text-gray-900"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Passenger" : "Passengers"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Class */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
            Class
          </label>
          <select
            value={form.class}
            onChange={(e) =>
              setForm({ ...form, class: e.target.value as SeatClass })
            }
            className="input-field text-gray-900"
          >
            <option value="economy">Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Search Flights
          </button>
        </div>
      </div>

      {/* Mobile swap */}
      <div className="flex justify-center mt-3 md:hidden">
        <button
          type="button"
          onClick={handleSwap}
          className="flex items-center gap-2 text-sm text-primary-600 font-medium"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Swap origin & destination
        </button>
      </div>
    </form>
  );
}
