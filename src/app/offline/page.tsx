"use client";

import { WifiOff, Plane } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re offline
        </h1>
        <p className="text-gray-500 mb-6">
          No internet connection detected. You can still view your cached
          bookings below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/bookings"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Plane className="w-4 h-4" />
            View My Bookings
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
