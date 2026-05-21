import { createClient } from "@/lib/supabase/server";
import SeatMapClient from "@/components/seats/SeatMapClient";
import type { Flight, Seat } from "@/types";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ flightId: string }>;
  searchParams: Promise<{ class?: string }>;
}

async function getFlightWithSeats(flightId: string) {
  const supabase = createClient();

  const [flightRes, seatsRes] = await Promise.all([
    supabase.from("flights").select("*").eq("id", flightId).single(),
    supabase
      .from("seats")
      .select("*")
      .eq("flight_id", flightId)
      .order("seat_number", { ascending: true }),
  ]);

  if (flightRes.error || !flightRes.data) return null;

  return {
    flight: flightRes.data as Flight,
    seats: (seatsRes.data ?? []) as Seat[],
  };
}

export default async function SeatsPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const data = await getFlightWithSeats(resolvedParams.flightId);

  if (!data) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SeatMapClient
        flight={data.flight}
        initialSeats={data.seats}
        preferredClass={(resolvedSearchParams.class as "economy" | "business" | "first") ?? "economy"}
      />
    </div>
  );
}
