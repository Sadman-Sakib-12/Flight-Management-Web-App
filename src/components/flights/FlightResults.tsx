"use client";

import { useRouter } from "next/navigation";
import { Plane, Clock, ArrowRight, AlertCircle, Wifi } from "lucide-react";
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
    if (!session) {
      toast.error("Please login to book a flight");
      router.push("/auth/login");
      return;
    }
    setSelectedFlight(flight);
    setBookingStep("seats");
    router.push(`/flights/${flight.id}/seats?class=${searchParams.class ?? "economy"}`);
  };

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-5">
          <AlertCircle className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">No flights found</h2>
        <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-6">
          No flights available for this route and date. Try a different date or route.
        </p>
        <button onClick={() => router.push("/")} className="btn-primary">
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Wifi className="w-4 h-4 text-emerald-500" />
        <span>{flights.length} flight{flights.length !== 1 ? "s" : ""} found</span>
      </div>

      {flights.map((flight, idx) => (
        <div
          key={flight.id}
          className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-card-lg transition-all duration-300 overflow-hidden animate-slide-up"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              {/* Flight info */}
              <div className="flex items-center gap-5 flex-1">
                {/* Airline badge */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-200 transition-colors">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs text-gray-400 mt-1.5 font-semibold tracking-wide">
                    {flight.flight_no}
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-center shrink-0">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatTime(flight.departs_at)}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{flight.origin.split("(")[1]?.replace(")", "") ?? ""}</p>
                  </div>

                  <div className="flex flex-col items-center flex-1 min-w-0 px-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{getFlightDuration(flight.departs_at, flight.arrives_at)}</span>
                    </div>
                    <div className="flex items-center w-full">
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1" />
                      <div className="mx-1.5 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1" />
                    </div>
                    <span className="text-xs text-emerald-600 font-medium mt-1">Direct</span>
                  </div>

                  <div className="text-center shrink-0">
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatTime(flight.arrives_at)}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{flight.destination.split("(")[1]?.replace(")", "") ?? ""}</p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-14 bg-gray-100" />

              {/* Price & action */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[160px]">
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">{flight.aircraft_type}</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(flight.base_price)}</p>
                  <p className="text-xs text-gray-400">per person</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${getStatusColor(flight.status)}`}>{flight.status}</span>
                  <button
                    onClick={() => handleSelectFlight(flight)}
                    disabled={flight.status === "cancelled"}
                    className="btn-primary text-sm py-2 px-5 whitespace-nowrap"
                  >
                    Select Seat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}
