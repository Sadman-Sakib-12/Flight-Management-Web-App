import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import FlightResults from "@/components/flights/FlightResults";
import FlightResultsSkeleton from "@/components/flights/FlightResultsSkeleton";
import type { Flight } from "@/types";

interface SearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: string;
  class?: string;
}

async function getFlights(params: SearchParams): Promise<Flight[]> {
  const supabase = createClient();

  if (!params.origin || !params.destination || !params.date) {
    return [];
  }

  // Get date range (full day)
  const dateStart = `${params.date}T00:00:00`;
  const dateEnd = `${params.date}T23:59:59`;

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("origin", params.origin)
    .eq("destination", params.destination)
    .gte("departs_at", dateStart)
    .lte("departs_at", dateEnd)
    .neq("status", "cancelled")
    .order("departs_at", { ascending: true });

  if (error) {
    console.error("Error fetching flights:", error);
    return [];
  }

  return data ?? [];
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const flights = await getFlights(resolvedParams);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search summary */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {resolvedParams.origin} → {resolvedParams.destination}
        </h1>
        <p className="text-gray-500 mt-1">
          {resolvedParams.date} · {resolvedParams.passengers ?? 1} passenger(s) ·{" "}
          {resolvedParams.class ?? "economy"}
        </p>
      </div>

      <Suspense fallback={<FlightResultsSkeleton />}>
        <FlightResults
          flights={flights}
          searchParams={resolvedParams}
        />
      </Suspense>
    </div>
  );
}
