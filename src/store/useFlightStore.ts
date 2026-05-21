import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Flight,
  Seat,
  SearchQuery,
  PassengerFormData,
  BookingStep,
} from "@/types";

interface FlightState {
  // Search
  searchQuery: SearchQuery | null;
  searchResults: Flight[];

  // Booking flow
  selectedFlight: Flight | null;
  selectedSeat: Seat | null;
  bookingStep: BookingStep;
  passengerFormData: Omit<PassengerFormData, "passport_no"> | null;

  // Optimistic seat selection
  optimisticSeatId: string | null;

  // Actions
  setSearchQuery: (query: SearchQuery) => void;
  setSearchResults: (flights: Flight[]) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedSeat: (seat: Seat | null) => void;
  setBookingStep: (step: BookingStep) => void;
  setPassengerFormData: (data: Omit<PassengerFormData, "passport_no">) => void;
  setOptimisticSeatId: (seatId: string | null) => void;
  resetBooking: () => void;
  resetAll: () => void;
}

const initialState = {
  searchQuery: null,
  searchResults: [],
  selectedFlight: null,
  selectedSeat: null,
  bookingStep: "search" as BookingStep,
  passengerFormData: null,
  optimisticSeatId: null,
};

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (flights) => set({ searchResults: flights }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassengerFormData: (data) => set({ passengerFormData: data }),
      setOptimisticSeatId: (seatId) => set({ optimisticSeatId: seatId }),

      resetBooking: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: "search",
          passengerFormData: null,
          optimisticSeatId: null,
        }),

      resetAll: () => set(initialState),
    }),
    {
      name: "flight-store",
      storage: createJSONStorage(() => localStorage),
      // Exclude sensitive fields from localStorage
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        // passengerFormData is stored but passport_no is already excluded from the type
        passengerFormData: state.passengerFormData,
        // searchResults and optimisticSeatId are NOT persisted
      }),
    }
  )
);
