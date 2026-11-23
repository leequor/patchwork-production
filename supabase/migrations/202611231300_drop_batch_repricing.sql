-- The batch repricing sweep is gone: prices are set one part at a time on the
-- row they belong to (updatePartPriceAction). Dropping the function keeps the
-- database honest about what the product can actually do.
drop function if exists public.reprice_parts(text, text, text, numeric);
