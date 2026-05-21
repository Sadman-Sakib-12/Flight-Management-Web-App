import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BookingsList from "@/components/bookings/BookingsList";
import OfflineBookingsWrapper from "@/components/bookings/OfflineBookingsWrapper";
import type { Booking } from "@/types";

async function getUserBookings(): Promise<Booking[]> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select("*, flight:flights(*), seat:seats(*), passengers(*)")
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return (data ?? []) as Booking[];
}

export default async function BookingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const bookings = await getUserBookings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">Manage your flight bookings</p>
      </div>

      {/* OfflineBookingsWrapper shows cached data when offline */}
      <OfflineBookingsWrapper>
        <BookingsList initialBookings={bookings} />
      </OfflineBookingsWrapper>
    </div>
  );
}
