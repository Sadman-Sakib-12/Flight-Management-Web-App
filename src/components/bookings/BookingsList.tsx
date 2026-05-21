"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import type { Booking } from "@/types";
import { formatCurrency, formatDateTime, getSeatClassLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Plane, Calendar, MapPin, RefreshCw, XCircle,
  ChevronDown, ChevronUp, AlertTriangle, User,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RescheduleModal from "@/components/bookings/RescheduleModal";

interface BookingsListProps {
  initialBookings: Booking[];
}

function getStatusBadgeVariant(status: string): "default" | "success" | "destructive" | "warning" | "secondary" | "outline" {
  if (status === "confirmed") return "success";
  if (status === "cancelled") return "destructive";
  if (status === "rescheduled") return "default";
  return "secondary";
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
    if (!user) { toast.error("Not authenticated"); setLoading(null); return; }

    const { data, error } = await supabase.rpc("cancel_booking", {
      p_booking_id: bookingId,
      p_user_id: user.id,
    });

    if (error) { toast.error(error.message); setLoading(null); return; }

    const result = data as { success: boolean; error?: string };
    if (!result.success) { toast.error(result.error ?? "Cancellation failed"); setLoading(null); return; }

    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
    updateCachedBooking(bookingId, { status: "cancelled" });
    toast.success("Booking cancelled successfully");
    setCancelDialogId(null);
    setLoading(null);
  };

  const handleRescheduleSuccess = (bookingId: string, newFlightId: string) => {
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "rescheduled", flight_id: newFlightId } : b));
    updateCachedBooking(bookingId, { status: "rescheduled" });
    setRescheduleBooking(null);
    router.refresh();
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-20 h-20 bg-neutral-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <Plane className="w-10 h-10 text-neutral-300" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">No bookings yet</h2>
        <p className="text-neutral-400 mb-6 text-sm">You haven&apos;t booked any flights yet.</p>
        <Button onClick={() => router.push("/")}>Search Flights</Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking, idx) => (
          <Card
            key={booking.id}
            className="overflow-hidden hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <CardContent className="p-0">
              {/* Header */}
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-neutral-900">
                          {booking.flight?.origin.split("(")[0].trim()} →{" "}
                          {booking.flight?.destination.split("(")[0].trim()}
                        </p>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-400">
                        PNR:{" "}
                        <span className="font-mono font-bold text-neutral-700 tracking-wider">
                          {booking.pnr_code}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                    className="shrink-0 text-neutral-400 hover:text-neutral-600"
                  >
                    {expandedId === booking.id
                      ? <ChevronUp className="w-5 h-5" />
                      : <ChevronDown className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Quick info */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">
                      {booking.flight ? formatDateTime(booking.flight.departs_at) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>
                      Seat {booking.seat?.seat_number}{" "}
                      ({booking.seat ? getSeatClassLabel(booking.seat.class) : "—"})
                    </span>
                  </div>
                  <div className="text-sm text-neutral-500">
                    <span className="text-neutral-400">Flight </span>
                    {booking.flight?.flight_no}
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {formatCurrency(booking.total_price)}
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === booking.id && (
                <>
                  <Separator />
                  <div className="p-5 md:p-6 animate-fade-in">
                    {booking.passengers?.[0] && (
                      <div className="flex items-start gap-3 mb-5 p-4 bg-neutral-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-neutral-900 mb-0.5">
                            {booking.passengers[0].full_name}
                          </p>
                          <p className="text-neutral-400">{booking.passengers[0].nationality}</p>
                        </div>
                      </div>
                    )}

                    {booking.status !== "cancelled" ? (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRescheduleBooking(booking)}
                          disabled={loading === booking.id}
                          className="gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Reschedule
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCancelDialogId(booking.id)}
                          disabled={loading === booking.id}
                          className="gap-2"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel Booking
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <AlertTriangle className="w-4 h-4" />
                        This booking has been cancelled
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {cancelDialogId && (
        <ConfirmDialog
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? Cancellations within 2 hours of departure are not allowed."
          confirmLabel="Yes, Cancel"
          confirmVariant="danger"
          loading={loading === cancelDialogId}
          onConfirm={() => handleCancel(cancelDialogId)}
          onCancel={() => setCancelDialogId(null)}
        />
      )}

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
