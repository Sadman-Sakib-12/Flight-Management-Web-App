"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import type { Flight, Seat, SeatClass, SeatWithStatus } from "@/types";
import { formatCurrency, formatTime, getFlightDuration, getSeatClassLabel } from "@/lib/utils";
import { Plane, Info } from "lucide-react";
import toast from "react-hot-toast";

interface SeatMapClientProps {
  flight: Flight;
  initialSeats: Seat[];
  preferredClass: SeatClass;
}

const CLASS_COLORS: Record<SeatClass, string> = {
  first: "bg-amber-500 hover:bg-amber-600",
  business: "bg-purple-500 hover:bg-purple-600",
  economy: "bg-green-500 hover:bg-green-600",
};

const CLASS_ZONES: Record<SeatClass, { rows: [number, number]; cols: string[] }> = {
  first: { rows: [1, 2], cols: ["A", "B", "C", "D"] },
  business: { rows: [3, 7], cols: ["A", "B", "C", "D", "E", "F"] },
  economy: { rows: [8, 30], cols: ["A", "B", "C", "D", "E", "F"] },
};

export default function SeatMapClient({
  flight,
  initialSeats,
  preferredClass,
}: SeatMapClientProps) {
  const router = useRouter();
  const { setSelectedSeat, setOptimisticSeatId, optimisticSeatId, selectedSeat } = useFlightStore();
  const { session } = useUserStore();

  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);
  const [activeClass, setActiveClass] = useState<SeatClass>(preferredClass);

  // Build seat map with status
  const getSeatStatus = useCallback(
    (seat: Seat): SeatWithStatus => {
      const isOptimistic = optimisticSeatId === seat.id;
      const isSelected = selectedSeat?.id === seat.id;

      if (isSelected || isOptimistic) {
        return { ...seat, status: "selected" };
      }
      if (!seat.is_available) {
        return { ...seat, status: "occupied" };
      }
      return { ...seat, status: "available" };
    },
    [optimisticSeatId, selectedSeat]
  );

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`seats:${flight.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flight.id}`,
        },
        (payload) => {
          const updatedSeat = payload.new as Seat;
          setSeats((prev) =>
            prev.map((s) => (s.id === updatedSeat.id ? updatedSeat : s))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flight.id]);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available && selectedSeat?.id !== seat.id) return;

    // Optimistic update
    setOptimisticSeatId(seat.id);
    setSelectedSeat(seat);
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      toast.error("Please select a seat to continue");
      return;
    }
    if (!session) {
      toast.error("Please login to continue");
      router.push("/auth/login");
      return;
    }
    router.push(`/flights/${flight.id}/book`);
  };

  // Filter seats by active class
  const filteredSeats = seats.filter((s) => s.class === activeClass);

  // Group seats by row
  const seatsByRow = filteredSeats.reduce<Record<number, Seat[]>>((acc, seat) => {
    const row = parseInt(seat.seat_number);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const zone = CLASS_ZONES[activeClass];
  const cols = zone.cols;

  return (
    <div className="space-y-6">
      {/* Flight summary */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {flight.origin.split("(")[0].trim()} →{" "}
                {flight.destination.split("(")[0].trim()}
              </p>
              <p className="text-sm text-gray-500">
                {flight.flight_no} · {formatTime(flight.departs_at)} →{" "}
                {formatTime(flight.arrives_at)} ·{" "}
                {getFlightDuration(flight.departs_at, flight.arrives_at)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Base price</p>
            <p className="text-xl font-bold text-primary-600">
              {formatCurrency(flight.base_price)}
            </p>
          </div>
        </div>
      </div>

      {/* Class tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["first", "business", "economy"] as SeatClass[]).map((cls) => (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeClass === cls
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {getSeatClassLabel(cls)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto">
            <h3 className="font-semibold text-gray-900 mb-4">
              {getSeatClassLabel(activeClass)} Cabin
            </h3>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-6 text-xs">
              {[
                { color: "bg-green-500", label: "Available" },
                { color: "bg-blue-500", label: "Selected" },
                { color: "bg-red-400", label: "Occupied" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-4 h-4 rounded ${item.color}`} />
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Column headers */}
            <div className="min-w-[280px]">
              <div className="flex items-center mb-2">
                <div className="w-8" />
                {cols.map((col, i) => (
                  <div key={col} className="flex-1 text-center">
                    {i === Math.floor(cols.length / 2) && (
                      <div className="text-xs text-gray-400 mb-1">Aisle</div>
                    )}
                    <span className="text-xs font-semibold text-gray-500">{col}</span>
                  </div>
                ))}
              </div>

              {/* Seat rows */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {Object.entries(seatsByRow)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([row, rowSeats]) => {
                    const sortedSeats = [...rowSeats].sort((a, b) =>
                      a.seat_number.localeCompare(b.seat_number)
                    );

                    return (
                      <div key={row} className="flex items-center gap-0.5">
                        <div className="w-8 text-xs text-gray-400 text-right pr-1">
                          {row}
                        </div>
                        {cols.map((col, i) => {
                          const seat = sortedSeats.find((s) =>
                            s.seat_number.endsWith(col)
                          );
                          const seatWithStatus = seat ? getSeatStatus(seat) : null;

                          return (
                            <div key={col} className={`flex-1 ${i === 2 ? "mr-2" : ""}`}>
                              {seatWithStatus ? (
                                <button
                                  onClick={() => handleSeatClick(seat!)}
                                  onMouseEnter={() => setHoveredSeat(seat!)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  disabled={seatWithStatus.status === "occupied"}
                                  title={`${seat!.seat_number} - ${getSeatClassLabel(seat!.class)} ${
                                    seat!.extra_fee > 0
                                      ? `(+${formatCurrency(seat!.extra_fee)})`
                                      : ""
                                  }`}
                                  className={`w-full aspect-square rounded text-xs font-medium transition-all ${
                                    seatWithStatus.status === "available"
                                      ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                                      : seatWithStatus.status === "selected"
                                      ? "bg-blue-500 text-white ring-2 ring-blue-300 cursor-pointer"
                                      : "bg-red-400 text-white cursor-not-allowed opacity-70"
                                  }`}
                                >
                                  {seat!.seat_number}
                                </button>
                              ) : (
                                <div className="w-full aspect-square" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Hovered seat info */}
          {hoveredSeat && (
            <div className="card border-primary-200 bg-primary-50 animate-fade-in">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Seat {hoveredSeat.seat_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getSeatClassLabel(hoveredSeat.class)}
                  </p>
                  {hoveredSeat.extra_fee > 0 && (
                    <p className="text-sm text-primary-600 font-medium">
                      +{formatCurrency(hoveredSeat.extra_fee)} extra
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {hoveredSeat.is_available ? "✓ Available" : "✗ Occupied"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected seat summary */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Your Selection</h3>
            {selectedSeat ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Seat</span>
                  <span className="font-semibold">{selectedSeat.seat_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Class</span>
                  <span className="font-semibold">
                    {getSeatClassLabel(selectedSeat.class)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base fare</span>
                  <span>{formatCurrency(flight.base_price)}</span>
                </div>
                {selectedSeat.extra_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Seat fee</span>
                    <span>+{formatCurrency(selectedSeat.extra_fee)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">
                    {formatCurrency(flight.base_price + selectedSeat.extra_fee)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No seat selected yet</p>
            )}

            <button
              onClick={handleContinue}
              disabled={!selectedSeat}
              className="btn-primary w-full mt-4"
            >
              Continue to Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
