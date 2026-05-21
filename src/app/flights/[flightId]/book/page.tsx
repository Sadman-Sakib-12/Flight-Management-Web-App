"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFlightStore } from "@/store/useFlightStore";
import { useUserStore } from "@/store/useUserStore";
import { createClient } from "@/lib/supabase/client";
import type { PassengerFormData } from "@/types";
import {
  formatCurrency,
  formatDateTime,
  generatePNR,
  getSeatClassLabel,
} from "@/lib/utils";
import { User, CreditCard, Plane, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const flightId = params.flightId as string;

  const { selectedFlight, selectedSeat, setBookingStep, resetBooking } = useFlightStore();
  const { session, addCachedBooking } = useUserStore();

  const [passenger, setPassenger] = useState<PassengerFormData>({
    full_name: "",
    passport_no: "",
    nationality: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);

  if (!selectedFlight || !selectedSeat || !session) {
    router.push("/");
    return null;
  }

  const totalPrice = selectedFlight.base_price + selectedSeat.extra_fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const pnrCode = generatePNR();

    try {
      // Call RPC to atomically reserve seat and create booking
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        "reserve_seat",
        {
          p_flight_id: selectedFlight.id,
          p_seat_id: selectedSeat.id,
          p_user_id: session.user.id,
          p_total_price: totalPrice,
          p_pnr_code: pnrCode,
        }
      );

      if (rpcError) {
        toast.error(rpcError.message);
        setLoading(false);
        return;
      }

      const result = rpcResult as { success: boolean; booking_id?: string; error?: string };

      if (!result.success) {
        toast.error(result.error ?? "Booking failed. Please try again.");
        setLoading(false);
        return;
      }

      // Insert passenger details
      const { error: passengerError } = await supabase
        .from("passengers")
        .insert({
          booking_id: result.booking_id,
          full_name: passenger.full_name,
          passport_no: passenger.passport_no,
          nationality: passenger.nationality,
          dob: passenger.dob,
        });

      if (passengerError) {
        console.error("Passenger insert error:", passengerError);
      }

      // Cache booking in store
      addCachedBooking({
        id: result.booking_id!,
        user_id: session.user.id,
        flight_id: selectedFlight.id,
        seat_id: selectedSeat.id,
        status: "confirmed",
        booked_at: new Date().toISOString(),
        total_price: totalPrice,
        pnr_code: pnrCode,
        created_at: new Date().toISOString(),
        flight: selectedFlight,
        seat: selectedSeat,
      });

      setBookingStep("confirmation");
      router.push(`/bookings/confirmation?pnr=${pnrCode}&bookingId=${result.booking_id}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <span className="text-primary-600 font-medium">Search</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-primary-600 font-medium">Select Seat</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-semibold">Passenger Details</span>
        <ChevronRight className="w-4 h-4" />
        <span>Confirmation</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Passenger Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={passenger.full_name}
                    onChange={(e) =>
                      setPassenger({ ...passenger, full_name: e.target.value })
                    }
                    className="input-field"
                    placeholder="As on passport"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    value={passenger.passport_no}
                    onChange={(e) =>
                      setPassenger({ ...passenger, passport_no: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g. AB1234567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    value={passenger.nationality}
                    onChange={(e) =>
                      setPassenger({ ...passenger, nationality: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g. Pakistani"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={passenger.dob}
                    onChange={(e) =>
                      setPassenger({ ...passenger, dob: e.target.value })
                    }
                    className="input-field"
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Payment</h3>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
                  This is a demo app. No real payment is processed. Click &quot;Confirm Booking&quot; to complete.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 text-base py-3"
              >
                {loading ? "Processing..." : `Confirm Booking — ${formatCurrency(totalPrice)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Booking Summary</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Flight</p>
                <p className="font-semibold">{selectedFlight.flight_no}</p>
              </div>
              <div>
                <p className="text-gray-500">Route</p>
                <p className="font-semibold">
                  {selectedFlight.origin.split("(")[0].trim()} →{" "}
                  {selectedFlight.destination.split("(")[0].trim()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Departure</p>
                <p className="font-semibold">
                  {formatDateTime(selectedFlight.departs_at)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Seat</p>
                <p className="font-semibold">
                  {selectedSeat.seat_number} ({getSeatClassLabel(selectedSeat.class)})
                </p>
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base fare</span>
                  <span>{formatCurrency(selectedFlight.base_price)}</span>
                </div>
                {selectedSeat.extra_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seat fee</span>
                    <span>+{formatCurrency(selectedSeat.extra_fee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>Total</span>
                  <span className="text-primary-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
