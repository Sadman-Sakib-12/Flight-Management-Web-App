"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import type { Booking } from "@/types";
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getSeatClassLabel,
} from "@/lib/utils";
import {
  Plane,
  Calendar,
  MapPin,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RescheduleModal from "@/components/bookings/RescheduleModal";

interface BookingsListProps {
  initialBookings: Booking[];
}

export default function BookingsList({ initialBookings }: BookingsListProps) {
  const router = useRouter();
  const { updateCachedBooking } = useUserStore();

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleCancel = async (bookingId: string) => {
    setLoading(bookingId);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setLoading(null);
      return;
    }

    const { data, error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
      p_user_id: user.id,
    });

    if (error) {
      toast.error(error.message);
      setLoading(null);
      return;
    }

    const result = data as { success: boolean; error?: string };

    if (!result.success) {
      toast.error(result.error ?? "Cancellation failed");
      setLoading(null);
      return;
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
    updateCachedBooking(bookingId, { status: "cancelled" });
    toast.success("Booking cancelled successfully");
    setCancelDialogId(null);
    setLoading(null);
  };

  const handleRescheduleSuccess = (bookingId: string, newFlightId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: "rescheduled", flight_id: newFlightId }
          : b
      )
    );
    updateCachedBooking(bookingId, { status: "rescheduled" });
    setRescheduleBooking(null);
    router.refresh();
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20">
        <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h2>
        <p className="text-gray-500 mb-6">
          You haven&apos;t booked any flights yet. Start searching!
        </p>
        <button
          onClick={() => router.push("/")}
          className="btn-primary"
        >
          Search Flights
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="card hover:shadow-md transition-shadow animate-slide-up"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <Plane className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">
                      {booking.flight?.origin.split("(")[0].trim()} →{" "}
                      {booking.flight?.destination.split("(")[0].trim()}
                    </p>
                    <span className={`badge ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    PNR: <span className="font-mono font-semibold text-gray-700">{booking.pnr_code}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setExpandedId(expandedId === booking.id ? null : booking.id)
                }
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {expandedId === booking.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Quick info */}
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                {booking.flight
                  ? formatDateTime(booking.flight.departs_at)
                  : "—"}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                Seat {booking.seat?.seat_number} (
                {booking.seat ? getSeatClassLabel(booking.seat.class) : "—"})
              </div>
              <div className="text-gray-600">
                Flight: {booking.flight?.flight_no}
              </div>
              <div className="font-semibold text-primary-600">
                {formatCurrency(booking.total_price)}
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === booking.id && (
              <div className="mt-4 pt-4 border-t animate-fade-in">
                {booking.passengers?.[0] && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium text-gray-700 mb-2">Passenger</p>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <span>Name: {booking.passengers[0].full_name}</span>
                      <span>Nationality: {booking.passengers[0].nationality}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {booking.status !== "cancelled" && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setRescheduleBooking(booking)}
                      disabled={loading === booking.id}
                      className="btn-secondary flex items-center gap-2 text-sm py-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => setCancelDialogId(booking.id)}
                      disabled={loading === booking.id}
                      className="flex items-center gap-2 text-sm py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Booking
                    </button>
                  </div>
                )}

                {booking.status === "cancelled" && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AlertTriangle className="w-4 h-4" />
                    This booking has been cancelled
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialogId && (
        <ConfirmDialog
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone. Note: cancellations within 2 hours of departure are not allowed."
          confirmLabel="Yes, Cancel"
          confirmVariant="danger"
          loading={loading === cancelDialogId}
          onConfirm={() => handleCancel(cancelDialogId)}
          onCancel={() => setCancelDialogId(null)}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleModal
          booking={rescheduleBooking}
          onSuccess={handleRescheduleSuccess}
          onClose={() => setRescheduleBooking(null)}
        />
      )}
    </>
  );
}
