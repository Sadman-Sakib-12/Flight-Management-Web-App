"use client";

import { useRouter } from "next/navigation";
import { Plane, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import type { Flight } from "@/types";
import { formatTime, formatCurrency, getFlightDuration, getStatusColor } from "@/lib/utils";
import toast from "react-hot-toast";

interface FlightResultsProps {
  flights: Flight[];
  searchParams: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: string;
    class?: string;
  };
}

export default function FlightResults({ flights, searchParams }: FlightResultsProps) {
  const router = useRouter();
  const { setSelectedFlight, setBookingStep } = useFlightStore();
  const { session } = useUserStore();

  const handleSelectFlight = (flight: Flight) => {
    if (!session) { toast.error("Please sign in to book"); router.push("/auth/login"); return; }
    setSelectedFlight(flight);
    setBookingStep("seats");
    router.push(`/flights/${flight.id}/seats?class=${searchParams.class ?? "economy"}`);
  };

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-neutral-300" />
        </div>
        <h2 className="text-lg font-bold text-neutral-800 mb-1.5">No flights found</h2>
        <p className="text-neutral-400 text-sm max-w-xs leading-relaxed mb-6">
          No flights available for this route and date. Try a different date.
        </p>
        <button onClick={() => router.push("/")} className="btn-primary">Search again</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-400 font-medium">{flights.length} flight{flights.length !== 1 ? "s" : ""} available</p>

      {flights.map((flight, idx) => (
        <div
          key={flight.id}
          className="group bg-white border border-neutral-100 rounded-2xl hover:border-blue-200 hover:shadow-card-md transition-all duration-200 animate-slide-up overflow-hidden"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5">

              {/* Left — airline */}
              <div className="flex items-center gap-4 flex-1">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-neutral-400 font-semibold text-center mt-1">{flight.flight_no}</p>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 flex-1">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900 tabular-nums leading-none">{formatTime(flight.departs_at)}</p>
                    <p className="text-xs text-neutral-400 mt-1 font-medium">
                      {flight.origin.match(/\(([^)]+)\)/)?.[1] ?? flight.origin.split(" ")[0]}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1 px-2">
                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {getFlightDuration(flight.departs_at, flight.arrives_at)}
                    </div>
                    <div className="flex items-center w-full gap-1.5">
                      <div className="flex-1 h-px bg-neutral-200" />
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-300" />
                      <div className="flex-1 h-px bg-neutral-200" />
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">Direct</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900 tabular-nums leading-none">{formatTime(flight.arrives_at)}</p>
                    <p className="text-xs text-neutral-400 mt-1 font-medium">
                      {flight.destination.match(/\(([^)]+)\)/)?.[1] ?? flight.destination.split(" ")[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-12 bg-neutral-100" />

              {/* Right — price */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[150px]">
                <div className="text-right">
                  <p className="text-xs text-neutral-400 mb-0.5">{flight.aircraft_type}</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(flight.base_price)}</p>
                  <p className="text-xs text-neutral-400">per person</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${getStatusColor(flight.status)}`}>{flight.status}</span>
                  <button
                    onClick={() => handleSelectFlight(flight)}
                    disabled={flight.status === "cancelled"}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
