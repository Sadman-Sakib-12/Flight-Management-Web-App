-- ============================================================
-- Migration 003: RPC Functions
-- ============================================================

-- ============================================================
-- RPC: reserve_seat
-- Atomically reserves a seat and creates a booking.
-- Uses advisory lock to prevent double-booking race conditions.
-- ============================================================
CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_flight_id   UUID,
  p_seat_id     UUID,
  p_user_id     UUID,
  p_total_price NUMERIC,
  p_pnr_code    TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat        public.seats%ROWTYPE;
  v_booking_id  UUID;
  v_result      JSON;
BEGIN
  -- Acquire advisory lock on the seat to prevent concurrent reservations
  PERFORM pg_advisory_xact_lock(hashtext(p_seat_id::TEXT));

  -- Check seat availability
  SELECT * INTO v_seat
  FROM public.seats
  WHERE id = p_seat_id AND flight_id = p_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Seat not found');
  END IF;

  IF NOT v_seat.is_available THEN
    RETURN json_build_object('success', false, 'error', 'Seat is no longer available');
  END IF;

  -- Mark seat as unavailable
  UPDATE public.seats
  SET is_available = FALSE
  WHERE id = p_seat_id;

  -- Create booking
  INSERT INTO public.bookings (user_id, flight_id, seat_id, total_price, pnr_code, status)
  VALUES (p_user_id, p_flight_id, p_seat_id, p_total_price, p_pnr_code, 'confirmed')
  RETURNING id INTO v_booking_id;

  RETURN json_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'pnr_code', p_pnr_code
  );
END;
$$;

-- ============================================================
-- RPC: cancel_booking
-- Atomically cancels a booking and frees the seat.
-- Enforces 2-hour cancellation rule.
-- ============================================================
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID,
  p_user_id    UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking   public.bookings%ROWTYPE;
  v_flight    public.flights%ROWTYPE;
  v_departs   TIMESTAMPTZ;
BEGIN
  -- Get booking (verify ownership)
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'error', 'Booking is already cancelled');
  END IF;

  -- Get flight departure time
  SELECT departs_at INTO v_departs
  FROM public.flights
  WHERE id = v_booking.flight_id;

  -- Enforce 2-hour rule
  IF v_departs - NOW() < INTERVAL '2 hours' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cancellations are not allowed within 2 hours of departure'
    );
  END IF;

  -- Free the seat
  UPDATE public.seats
  SET is_available = TRUE
  WHERE id = v_booking.seat_id;

  -- Cancel the booking
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;

  RETURN json_build_object('success', true, 'booking_id', p_booking_id);
END;
$$;

-- ============================================================
-- RPC: reschedule_booking
-- Reschedules a booking to a new flight on the same route.
-- ============================================================
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id    UUID,
  p_new_flight_id UUID,
  p_new_seat_id   UUID,
  p_user_id       UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking       public.bookings%ROWTYPE;
  v_old_flight    public.flights%ROWTYPE;
  v_new_flight    public.flights%ROWTYPE;
  v_new_seat      public.seats%ROWTYPE;
  v_fee_charged   NUMERIC := 0;
  v_reschedule_id UUID;
BEGIN
  -- Acquire advisory lock
  PERFORM pg_advisory_xact_lock(hashtext(p_new_seat_id::TEXT));

  -- Get booking
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RETURN json_build_object('success', false, 'error', 'Cannot reschedule a cancelled booking');
  END IF;

  -- Get old and new flights
  SELECT * INTO v_old_flight FROM public.flights WHERE id = v_booking.flight_id;
  SELECT * INTO v_new_flight FROM public.flights WHERE id = p_new_flight_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'New flight not found');
  END IF;

  -- Verify same route
  IF v_old_flight.origin != v_new_flight.origin OR v_old_flight.destination != v_new_flight.destination THEN
    RETURN json_build_object('success', false, 'error', 'New flight must be on the same route');
  END IF;

  -- Check new seat availability
  SELECT * INTO v_new_seat
  FROM public.seats
  WHERE id = p_new_seat_id AND flight_id = p_new_flight_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_new_seat.is_available THEN
    RETURN json_build_object('success', false, 'error', 'Selected seat is not available');
  END IF;

  -- Calculate fee if new flight is more expensive
  IF v_new_flight.base_price > v_old_flight.base_price THEN
    v_fee_charged := v_new_flight.base_price - v_old_flight.base_price;
  END IF;

  -- Free old seat
  UPDATE public.seats SET is_available = TRUE WHERE id = v_booking.seat_id;

  -- Reserve new seat
  UPDATE public.seats SET is_available = FALSE WHERE id = p_new_seat_id;

  -- Record reschedule
  INSERT INTO public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_booking.flight_id, p_new_flight_id, v_fee_charged)
  RETURNING id INTO v_reschedule_id;

  -- Update booking
  UPDATE public.bookings
  SET
    flight_id   = p_new_flight_id,
    seat_id     = p_new_seat_id,
    status      = 'rescheduled',
    total_price = v_booking.total_price + v_fee_charged
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'reschedule_id', v_reschedule_id,
    'fee_charged', v_fee_charged
  );
END;
$$;

-- ============================================================
-- DB TRIGGER: Enforce 2-hour cancellation rule at DB level
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_cancellation_window()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs_at
    FROM public.flights
    WHERE id = NEW.flight_id;

    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_cancellation_window
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cancellation_window();
