-- Keep a sales ID in sync with its role. Retain the numeric part when free at
-- the new level; otherwise generate an unused ID in that level's prefix.
CREATE OR REPLACE FUNCTION public.assign_partner_code()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
  pfx text;
  candidate text;
BEGIN
  pfx := sales_code_prefix(new.role);
  IF pfx IS NULL THEN
    new.partner_code := NULL;
    RETURN new;
  END IF;

  -- Imports may supply an ID on creation. Role changes always recalculate it.
  IF tg_op = 'INSERT' AND new.partner_code IS NOT NULL AND new.partner_code <> '' THEN
    RETURN new;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('partner_code:' || pfx));
  IF tg_op = 'UPDATE' THEN
    IF old.partner_code ~ '^VP[A-Z]+[0-9]+$' THEN
      candidate := pfx || substring(old.partner_code FROM '[0-9]+$');
      IF NOT EXISTS (
        SELECT 1 FROM users WHERE partner_code = candidate AND id <> new.id
      ) THEN
        new.partner_code := candidate;
        RETURN new;
      END IF;
    END IF;
  END IF;

  new.partner_code := next_partner_code(pfx);
  RETURN new;
END;
$function$;

DROP TRIGGER IF EXISTS trg_assign_partner_code ON public.users;
CREATE TRIGGER trg_assign_partner_code
BEFORE INSERT OR UPDATE OF role ON public.users
FOR EACH ROW EXECUTE FUNCTION public.assign_partner_code();
