"use client";

import { useUserStore } from "@/store/useUserStore";
import type { Booking } from "@/types";
import { formatCurrency, formatDateTime, getStatusColor, getSeatClassLabel } from "@/lib/utils";
import { WifiOff, Plane, Calendar, MapPin } from "lucide-react";

export default function OfflineBookings() {
  const { cachedBookings } = useUserStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Offline banner */}
      <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <WifiOff className="w-5 h-5 text-orange-500 shrink-0" />
        <div>
          <p className="font-semibold text-orange-800 text-sm">You&apos;re offline</p>
          <p className="text-orange-600 text-xs mt-0.5">
            Showing last cached bookings. Some details may be outdated.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Cached data — {cachedBookings.length} booking(s)</p>
      </div>

      {cachedBookings.length === 0 ? (
        <div className="text-center py-20">
          <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No cached bookings</h2>
          <p className="text-gray-500">Connect to the internet to view your bookings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cachedBookings.map((booking: Booking) => (
            <div key={booking.id} className="card">
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
                      PNR:{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        {booking.pnr_code}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {booking.flight ? formatDateTime(booking.flight.departs_at) : "—"}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
