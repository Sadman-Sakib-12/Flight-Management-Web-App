-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- ============================================================
-- RLS: flights (public read, no write for users)
-- ============================================================
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flights_public_read"
  ON public.flights FOR SELECT
  USING (true);

-- ============================================================
-- RLS: seats (public read, system write only)
-- ============================================================
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seats_public_read"
  ON public.seats FOR SELECT
  USING (true);

-- ============================================================
-- RLS: bookings (users see only their own)
-- ============================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_own"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RLS: passengers (users see only their own via booking)
-- ============================================================
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passengers_select_own"
  ON public.passengers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own"
  ON public.passengers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id
        AND b.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS: reschedules (users see only their own via booking)
-- ============================================================
ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reschedules_select_own"
  ON public.reschedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reschedules.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own"
  ON public.reschedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reschedules.booking_id
        AND b.user_id = auth.uid()
    )
  );
