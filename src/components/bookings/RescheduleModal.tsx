"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking, Flight, Seat, SeatClass } from "@/types";
import {
  formatCurrency,
  formatDateTime,
  getSeatClassLabel,
} from "@/lib/utils";
import { X, Plane, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface RescheduleModalProps {
  booking: Booking;
  onSuccess: (bookingId: string, newFlightId: string) => void;
  onClose: () => void;
}

export default function RescheduleModal({
  booking,
  onSuccess,
  onClose,
}: RescheduleModalProps) {
  const [alternativeFlights, setAlternativeFlights] = useState<Flight[]>([]);
  const [selectedNewFlight, setSelectedNewFlight] = useState<Flight | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedNewSeat, setSelectedNewSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingFlights, setFetchingFlights] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchAlternatives = async () => {
      if (!booking.flight) return;

      const supabase = createClient();
      const { data } = await supabase
        .from("flights")
        .select("*")
        .eq("origin", booking.flight.origin)
        .eq("destination", booking.flight.destination)
        .neq("id", booking.flight_id)
        .neq("status", "cancelled")
        .gt("departs_at", new Date().toISOString())
        .order("departs_at", { ascending: true });

      setAlternativeFlights((data ?? []) as Flight[]);
      setFetchingFlights(false);
    };

    fetchAlternatives();
  }, [booking]);

  useEffect(() => {
    if (!selectedNewFlight) return;

    const fetchSeats = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("seats")
        .select("*")
        .eq("flight_id", selectedNewFlight.id)
        .eq("is_available", true)
        .eq("class", booking.seat?.class ?? "economy")
        .order("seat_number");

      setSeats((data ?? []) as Seat[]);
      setSelectedNewSeat(null);
    };

    fetchSeats();
  }, [selectedNewFlight, booking.seat?.class]);

  const handleReschedule = async () => {
    if (!selectedNewFlight || !selectedNewSeat) {
      toast.error("Please select a flight and seat");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Not authenticated");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc("reschedule_booking", {
      p_booking_id: booking.id,
      p_new_flight_id: selectedNewFlight.id,
      p_new_seat_id: selectedNewSeat.id,
      p_user_id: user.id,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const result = data as { success: boolean; fee_charged?: number; error?: string };

    if (!result.success) {
      toast.error(result.error ?? "Reschedule failed");
      setLoading(false);
      return;
    }

    const feeMsg =
      result.fee_charged && result.fee_charged > 0
        ? ` Fee charged: ${formatCurrency(result.fee_charged)}`
        : "";

    toast.success(`Booking rescheduled successfully!${feeMsg}`);
    onSuccess(booking.id, selectedNewFlight.id);
    setLoading(false);
  };

  const currentClass = (booking.seat?.class ?? "economy") as SeatClass;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-gray-900">Reschedule Flight</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current booking */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-gray-700 mb-2">Current Booking</p>
            <div className="flex items-center gap-2 text-gray-600">
              <Plane className="w-4 h-4" />
              <span>
                {booking.flight?.flight_no} ·{" "}
                {booking.flight ? formatDateTime(booking.flight.departs_at) : "—"}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              Seat {booking.seat?.seat_number} ({getSeatClassLabel(currentClass)})
            </p>
          </div>

          {/* Alternative flights */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Select New Flight
            </h3>
            {fetchingFlights ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : alternativeFlights.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No alternative flights available on this route.
              </p>
            ) : (
              <div className="space-y-2">
                {alternativeFlights.map((flight) => (
                  <button
                    key={flight.id}
                    onClick={() => setSelectedNewFlight(flight)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedNewFlight?.id === flight.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {flight.flight_no}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(flight.departs_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600">
                          {formatCurrency(flight.base_price)}
                        </p>
                        {flight.base_price > (booking.flight?.base_price ?? 0) && (
                          <p className="text-xs text-orange-600">
                            +{formatCurrency(flight.base_price - (booking.flight?.base_price ?? 0))} fee
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seat selection */}
          {selectedNewFlight && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Select New Seat ({getSeatClassLabel(currentClass)})
              </h3>
              {seats.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No available seats in {getSeatClassLabel(currentClass)} class.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {seats.slice(0, 20).map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => setSelectedNewSeat(seat)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        selectedNewSeat?.id === seat.id
                          ? "bg-primary-600 text-white"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {seat.seat_number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={!selectedNewFlight || !selectedNewSeat || loading}
              className="btn-primary flex-1"
            >
              {loading ? "Processing..." : "Confirm Reschedule"}
            </button>
          </div>
        </div>
      </div>

      {/* Reschedule confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-slide-up">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Confirm Reschedule</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Reschedule to <span className="font-semibold">{selectedNewFlight?.flight_no}</span> on{" "}
                  {selectedNewFlight ? formatDateTime(selectedNewFlight.departs_at) : ""}?
                  {selectedNewFlight && selectedNewFlight.base_price > (booking.flight?.base_price ?? 0) && (
                    <span className="block text-orange-600 font-medium mt-1">
                      Fee: +{formatCurrency(selectedNewFlight.base_price - (booking.flight?.base_price ?? 0))}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Go Back
              </button>
              <button
                onClick={() => { setShowConfirm(false); handleReschedule(); }}
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? "Processing..." : "Yes, Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
