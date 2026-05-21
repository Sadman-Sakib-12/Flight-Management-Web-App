-- ============================================================
-- Migration 004: Seed Data
-- 8 flights across 4 routes with full seat maps
-- ============================================================

-- ============================================================
-- INSERT FLIGHTS
-- Routes: DXB-LHR, LHR-DXB, JFK-LAX, LAX-JFK
-- ============================================================
INSERT INTO public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES
  -- Route 1: Dubai → London
  ('11111111-0000-0000-0000-000000000001', 'FX101', 'Dubai (DXB)', 'London (LHR)',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 7 hours', 'Boeing 777', 'scheduled', 450.00),
  ('11111111-0000-0000-0000-000000000002', 'FX103', 'Dubai (DXB)', 'London (LHR)',
   NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 7 hours', 'Airbus A380', 'scheduled', 520.00),

  -- Route 2: London → Dubai
  ('11111111-0000-0000-0000-000000000003', 'FX102', 'London (LHR)', 'Dubai (DXB)',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 7 hours', 'Boeing 777', 'scheduled', 430.00),
  ('11111111-0000-0000-0000-000000000004', 'FX104', 'London (LHR)', 'Dubai (DXB)',
   NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 7 hours', 'Airbus A380', 'scheduled', 490.00),

  -- Route 3: New York → Los Angeles
  ('11111111-0000-0000-0000-000000000005', 'FX201', 'New York (JFK)', 'Los Angeles (LAX)',
   NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 6 hours', 'Boeing 737', 'scheduled', 280.00),
  ('11111111-0000-0000-0000-000000000006', 'FX203', 'New York (JFK)', 'Los Angeles (LAX)',
   NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours', 'Airbus A320', 'scheduled', 310.00),

  -- Route 4: Los Angeles → New York
  ('11111111-0000-0000-0000-000000000007', 'FX202', 'Los Angeles (LAX)', 'New York (JFK)',
   NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 6 hours', 'Boeing 737', 'scheduled', 270.00),
  ('11111111-0000-0000-0000-000000000008', 'FX204', 'Los Angeles (LAX)', 'New York (JFK)',
   NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 6 hours', 'Airbus A320', 'scheduled', 300.00);

-- ============================================================
-- FUNCTION: Generate seats for a flight
-- First class: rows 1-2 (A-D), Business: rows 3-7 (A-F), Economy: rows 8-30 (A-F)
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_seats_for_flight(p_flight_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_row    INT;
  v_col    TEXT;
  v_class  TEXT;
  v_fee    NUMERIC;
BEGIN
  -- First Class: rows 1-2, columns A-D
  FOR v_row IN 1..2 LOOP
    FOREACH v_col IN ARRAY ARRAY['A','B','C','D'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, 'first', TRUE, 500.00);
    END LOOP;
  END LOOP;

  -- Business Class: rows 3-7, columns A-F
  FOR v_row IN 3..7 LOOP
    FOREACH v_col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, 'business', TRUE, 200.00);
    END LOOP;
  END LOOP;

  -- Economy Class: rows 8-30, columns A-F
  FOR v_row IN 8..30 LOOP
    FOREACH v_col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, v_row || v_col, 'economy', TRUE, 0.00);
    END LOOP;
  END LOOP;
END;
$$;

-- Generate seats for all 8 flights
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000001');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000002');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000003');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000004');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000005');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000006');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000007');
SELECT public.generate_seats_for_flight('11111111-0000-0000-0000-000000000008');

-- Mark some seats as occupied for realism
UPDATE public.seats SET is_available = FALSE
WHERE flight_id = '11111111-0000-0000-0000-000000000001'
  AND seat_number IN ('8A','8B','9C','10D','11E','12F','15A','16B','20C');

UPDATE public.seats SET is_available = FALSE
WHERE flight_id = '11111111-0000-0000-0000-000000000005'
  AND seat_number IN ('8A','9B','10C','11D','12E','13F','14A','15B');
