CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') THEN
    DROP TRIGGER IF EXISTS enforce_cancellation_window ON public.bookings;
  END IF;
END $$;

DROP TABLE IF EXISTS public.reschedules CASCADE;
DROP TABLE IF EXISTS public.passengers CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.seats CASCADE;
DROP TABLE IF EXISTS public.flights CASCADE;

DROP FUNCTION IF EXISTS public.check_cancellation_window();
DROP FUNCTION IF EXISTS public.reserve_seat(UUID, UUID, UUID, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.cancel_booking(UUID, UUID);
DROP FUNCTION IF EXISTS public.reschedule_booking(UUID, UUID, UUID, UUID);
DROP FUNCTION IF EXISTS public.generate_seats_for_flight(UUID);

CREATE TABLE public.flights (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_no     TEXT NOT NULL UNIQUE,
  origin        TEXT NOT NULL,
  destination   TEXT NOT NULL,
  departs_at    TIMESTAMPTZ NOT NULL,
  arrives_at    TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT NOT NULL DEFAULT 'Boeing 737',
  status        TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed')),
  base_price    NUMERIC(10, 2) NOT NULL CHECK (base_price > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.seats (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id     UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  seat_number   TEXT NOT NULL,
  class         TEXT NOT NULL CHECK (class IN ('economy', 'business', 'first')),
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  extra_fee     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (flight_id, seat_number)
);

CREATE TABLE public.bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id   UUID NOT NULL REFERENCES public.flights(id),
  seat_id     UUID NOT NULL REFERENCES public.seats(id),
  status      TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'rescheduled', 'cancelled')),
  booked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
  pnr_code    TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.passengers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  passport_no  TEXT NOT NULL,
  nationality  TEXT NOT NULL,
  dob          DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reschedules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_flight_id UUID NOT NULL REFERENCES public.flights(id),
  new_flight_id UUID NOT NULL REFERENCES public.flights(id),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fee_charged   NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_flights_origin_destination ON public.flights(origin, destination);
CREATE INDEX idx_flights_departs_at ON public.flights(departs_at);
CREATE INDEX idx_seats_flight_id ON public.seats(flight_id);
CREATE INDEX idx_seats_is_available ON public.seats(is_available);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_flight_id ON public.bookings(flight_id);
CREATE INDEX idx_bookings_pnr_code ON public.bookings(pnr_code);
CREATE INDEX idx_passengers_booking_id ON public.passengers(booking_id);
CREATE INDEX idx_reschedules_booking_id ON public.reschedules(booking_id);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flights_public_read" ON public.flights FOR SELECT USING (true);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seats_public_read" ON public.seats FOR SELECT USING (true);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update_own" ON public.bookings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passengers_select_own" ON public.passengers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = passengers.booking_id AND b.user_id = auth.uid()));
CREATE POLICY "passengers_insert_own" ON public.passengers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = passengers.booking_id AND b.user_id = auth.uid()));

ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reschedules_select_own" ON public.reschedules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = reschedules.booking_id AND b.user_id = auth.uid()));
CREATE POLICY "reschedules_insert_own" ON public.reschedules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = reschedules.booking_id AND b.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.generate_seats_for_flight(p_flight_id UUID)
RETURNS VOID LANGUAGE plpgsql AS
$BODY$
DECLARE
  v_row INT;
  v_col TEXT;
BEGIN
  FOR v_row IN 1..2 LOOP
    FOREACH v_col IN ARRAY ARRAY['A','B','C','D'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, 'first', TRUE, 500.00);
    END LOOP;
  END LOOP;
  FOR v_row IN 3..7 LOOP
    FOREACH v_col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, 'business', TRUE, 200.00);
    END LOOP;
  END LOOP;
  FOR v_row IN 8..30 LOOP
    FOREACH v_col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, 'economy', TRUE, 0.00);
    END LOOP;
  END LOOP;
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_flight_id UUID, p_seat_id UUID, p_user_id UUID, p_total_price NUMERIC, p_pnr_code TEXT
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS
$BODY$
DECLARE
  v_seat       public.seats%ROWTYPE;
  v_booking_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_seat_id::TEXT));
  SELECT * INTO v_seat FROM public.seats WHERE id = p_seat_id AND flight_id = p_flight_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Seat not found');
  END IF;
  IF NOT v_seat.is_available THEN
    RETURN json_build_object('success', false, 'error', 'Seat is no longer available');
  END IF;
  UPDATE public.seats SET is_available = FALSE WHERE id = p_seat_id;
  INSERT INTO public.bookings (user_id, flight_id, seat_id, total_price, pnr_code, status)
  VALUES (p_user_id, p_flight_id, p_seat_id, p_total_price, p_pnr_code, 'confirmed')
  RETURNING id INTO v_booking_id;
  RETURN json_build_object('success', true, 'booking_id', v_booking_id, 'pnr_code', p_pnr_code);
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID, p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS
$BODY$
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_departs TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;
  IF v_booking.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'error', 'Booking is already cancelled');
  END IF;
  SELECT departs_at INTO v_departs FROM public.flights WHERE id = v_booking.flight_id;
  IF v_departs - NOW() < INTERVAL '2 hours' THEN
    RETURN json_build_object('success', false, 'error', 'Cancellations are not allowed within 2 hours of departure');
  END IF;
  UPDATE public.seats SET is_available = TRUE WHERE id = v_booking.seat_id;
  UPDATE public.bookings SET status = 'cancelled' WHERE id = p_booking_id;
  RETURN json_build_object('success', true, 'booking_id', p_booking_id);
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id UUID, p_new_flight_id UUID, p_new_seat_id UUID, p_user_id UUID
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS
$BODY$
DECLARE
  v_booking       public.bookings%ROWTYPE;
  v_old_flight    public.flights%ROWTYPE;
  v_new_flight    public.flights%ROWTYPE;
  v_new_seat      public.seats%ROWTYPE;
  v_fee_charged   NUMERIC := 0;
  v_reschedule_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_new_seat_id::TEXT));
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;
  IF v_booking.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot reschedule a cancelled booking');
  END IF;
  SELECT * INTO v_old_flight FROM public.flights WHERE id = v_booking.flight_id;
  SELECT * INTO v_new_flight FROM public.flights WHERE id = p_new_flight_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'New flight not found');
  END IF;
  IF v_old_flight.origin != v_new_flight.origin OR v_old_flight.destination != v_new_flight.destination THEN
    RETURN json_build_object('success', false, 'error', 'New flight must be on the same route');
  END IF;
  SELECT * INTO v_new_seat FROM public.seats WHERE id = p_new_seat_id AND flight_id = p_new_flight_id FOR UPDATE;
  IF NOT FOUND OR NOT v_new_seat.is_available THEN
    RETURN json_build_object('success', false, 'error', 'Selected seat is not available');
  END IF;
  IF v_new_flight.base_price > v_old_flight.base_price THEN
    v_fee_charged := v_new_flight.base_price - v_old_flight.base_price;
  END IF;
  UPDATE public.seats SET is_available = TRUE WHERE id = v_booking.seat_id;
  UPDATE public.seats SET is_available = FALSE WHERE id = p_new_seat_id;
  INSERT INTO public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_booking.flight_id, p_new_flight_id, v_fee_charged)
  RETURNING id INTO v_reschedule_id;
  UPDATE public.bookings
  SET flight_id = p_new_flight_id, seat_id = p_new_seat_id,
      status = 'rescheduled', total_price = v_booking.total_price + v_fee_charged
  WHERE id = p_booking_id;
  RETURN json_build_object('success', true, 'reschedule_id', v_reschedule_id, 'fee_charged', v_fee_charged);
END;
$BODY$;

CREATE OR REPLACE FUNCTION public.check_cancellation_window()
RETURNS TRIGGER LANGUAGE plpgsql AS
$BODY$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs_at FROM public.flights WHERE id = NEW.flight_id;
    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
    END IF;
  END IF;
  RETURN NEW;
END;
$BODY$;

CREATE TRIGGER enforce_cancellation_window
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_cancellation_window();

INSERT INTO public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES
  ('11111111-0000-0000-0000-000000000001', 'FX101', 'Dubai (DXB)', 'London (LHR)',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 7 hours', 'Boeing 777', 'scheduled', 450.00),
  ('11111111-0000-0000-0000-000000000002', 'FX103', 'Dubai (DXB)', 'London (LHR)',
   NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 7 hours', 'Airbus A380', 'scheduled', 520.00),
  ('11111111-0000-0000-0000-000000000003', 'FX102', 'London (LHR)', 'Dubai (DXB)',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 7 hours', 'Boeing 777', 'scheduled', 430.00),
  ('11111111-0000-0000-0000-000000000004', 'FX104', 'London (LHR)', 'Dubai (DXB)',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 7 hours', 'Airbus A380', 'scheduled', 490.00),
  ('11111111-0000-0000-0000-000000000005', 'FX201', 'New York (JFK)', 'Los Angeles (LAX)',
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 6 hours', 'Boeing 737', 'scheduled', 280.00),
  ('11111111-0000-0000-0000-000000000006', 'FX203', 'New York (JFK)', 'Los Angeles (LAX)',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours', 'Airbus A320', 'scheduled', 310.00),
  ('11111111-0000-0000-0000-000000000007', 'FX202', 'Los Angeles (LAX)', 'New York (JFK)',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 6 hours', 'Boeing 737', 'scheduled', 270.00),
  ('11111111-0000-0000-0000-000000000008', 'FX204', 'Los Angeles (LAX)', 'New York (JFK)',
   NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 6 hours', 'Airbus A320', 'scheduled', 300.00);

SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000001');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000002');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000003');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000004');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000005');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000006');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000007');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000008');

UPDATE public.seats SET is_available = FALSE
WHERE flight_id = '11111111-0000-0000-0000-000000000001'
  AND seat_number IN ('8A','8B','9C','10D','11E','12F','15A','16B','20C');

UPDATE public.seats SET is_available = FALSE
WHERE flight_id = '11111111-0000-0000-0000-000000000005'
  AND seat_number IN ('8A','9B','10C','11D','12E','13F','14A','15B');
