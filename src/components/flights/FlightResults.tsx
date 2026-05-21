"use client";

import { useRouter } from "next/navigation";
import { Plane, Clock, ArrowRight, AlertCircle } from "lucide-react";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import type { Flight } from "@/types";
import {
  formatTime,
  formatCurrency,
  getFlightDuration,
  getStatusColor,
} from "@/lib/utils";
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No flights found</h2>
        <p className="text-gray-500 max-w-md">
          No flights available for this route and date. Try a different date or route.
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-primary mt-6"
        >
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{flights.length} flight(s) found</p>

      {flights.map((flight) => (
        <div
          key={flight.id}
          className="card hover:shadow-md transition-all duration-200 animate-slide-up"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Flight info */}
            <div className="flex items-center gap-6 flex-1">
              {/* Airline/flight number */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Plane className="w-5 h-5 text-primary-600" />
                </div>
                <span className="text-xs text-gray-500 mt-1 font-medium">
                  {flight.flight_no}
                </span>
              </div>

              {/* Route & times */}
              <div className="flex items-center gap-4 flex-1">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(flight.departs_at)}
                  </p>
                  <p className="text-sm text-gray-500 max-w-[100px] truncate">
                    {flight.origin.split("(")[0].trim()}
                  </p>
                </div>

                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {getFlightDuration(flight.departs_at, flight.arrives_at)}
                  </div>
                  <div className="flex items-center w-full mt-1">
                    <div className="h-px bg-gray-300 flex-1" />
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                    <div className="h-px bg-gray-300 flex-1" />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">Direct</span>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(flight.arrives_at)}
                  </p>
                  <p className="text-sm text-gray-500 max-w-[100px] truncate">
                    {flight.destination.split("(")[0].trim()}
                  </p>
                </div>
              </div>
            </div>

            {/* Price & status */}
            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:min-w-[160px]">
              <div className="text-right">
                <p className="text-xs text-gray-400">from</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(flight.base_price)}
                </p>
                <p className="text-xs text-gray-400">{flight.aircraft_type}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${getStatusColor(flight.status)}`}>
                  {flight.status}
                </span>
                <button
                  onClick={() => handleSelectFlight(flight)}
                  className="btn-primary text-sm py-2 px-5"
                  disabled={flight.status === "cancelled"}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
