"use client";

import { useEffect, useState } from "react";
import OfflineBookings from "@/components/bookings/OfflineBookings";

interface Props {
  children: React.ReactNode;
}

export default function OfflineBookingsWrapper({ children }: Props) {
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Before hydration — show children (SSR)
  if (!mounted) return <>{children}</>;

  // Offline — show cached bookings
  if (!isOnline) return <OfflineBookings />;

  // Online — show live bookings
  return <>{children}</>;
}
