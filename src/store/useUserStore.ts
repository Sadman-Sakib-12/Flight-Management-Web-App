import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Session } from "@supabase/supabase-js";
import type { Booking } from "@/types";

interface UserState {
  session: Session | null;
  sessionToken: string | null;
  cachedBookings: Booking[];

  // Actions
  setSession: (session: Session | null) => void;
  setCachedBookings: (bookings: Booking[]) => void;
  addCachedBooking: (booking: Booking) => void;
  updateCachedBooking: (id: string, updates: Partial<Booking>) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      session: null,
      sessionToken: null,
      cachedBookings: [],

      setSession: (session) =>
        set({
          session,
          sessionToken: session?.access_token ?? null,
        }),

      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),

      addCachedBooking: (booking) =>
        set((state) => ({
          cachedBookings: [booking, ...state.cachedBookings],
        })),

      updateCachedBooking: (id, updates) =>
        set((state) => ({
          cachedBookings: state.cachedBookings.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      resetUser: () =>
        set({
          session: null,
          sessionToken: null,
          cachedBookings: [],
        }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist session token and cached bookings (not full session object with sensitive data)
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        cachedBookings: state.cachedBookings,
      }),
    }
  )
);
