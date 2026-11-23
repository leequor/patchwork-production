-- Repricing: raise or lower shelf prices across a scope in one statement.
--
-- A repair shop re-prices in batches, not one SKU at a time: a supplier moves,
-- a screen family goes up 8%, or every part under the reorder level gets a
-- margin-aware touch-up. Doing that in the client would be N round trips and a
-- half-applied price list if one request failed, so it is one statement here.
--
-- Rules baked in, because a price list is money:
--   1. Managers and owners only.
--   2. Never below cost. Whatever the arithmetic says, the floor is cost.
--   3. A percent move stays inside ±50%; a margin target inside 0–90%.
--   4. Cents stay integers, and a change is only written when it is a change.

drop function if exists public.reprice_parts(text, text, text, numeric);

create or replace function public.reprice_parts(
  p_scope text,             -- 'all' | 'low_stock'
  p_category text,          -- null means every category
  p_mode text,              -- 'percent' | 'delta' | 'margin'
  p_value numeric
)
returns table (updated_count integer, before_cents bigint, after_cents bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
begin
  select role into actor_role from public.profiles where id = auth.uid();
  if actor_role is null or actor_role not in ('admin', 'superadmin') then
    raise exception 'Only a manager can reprice inventory';
  end if;

  if p_mode not in ('percent', 'delta', 'margin') then
    raise exception 'Unknown repricing mode: %', p_mode;
  end if;

  if p_mode = 'percent' and (p_value < -50 or p_value > 50) then
    raise exception 'A percent change must stay between -50 and 50';
  end if;

  if p_mode = 'margin' and (p_value < 0 or p_value >= 90) then
    raise exception 'A margin target must stay between 0 and 90 percent';
  end if;

  if p_mode = 'delta' and abs(p_value) > 100000 then
    raise exception 'That price change is too large';
  end if;

  return query
  with scoped as (
    select id, price_cents, cost_cents, stock
    from public.parts
    where (p_category is null or category = p_category)
      and (p_scope <> 'low_stock' or stock <= reorder_level)
  ),
  priced as (
    select
      id,
      price_cents as old_cents,
      case p_mode
        when 'percent' then greatest(
          cost_cents,
          round(price_cents * (1 + p_value / 100.0))::integer
        )
        when 'delta' then greatest(cost_cents, price_cents + round(p_value * 100)::integer)
        else greatest(
          cost_cents,
          round(cost_cents / (1 - p_value / 100.0))::integer
        )
      end as new_cents
    from scoped
  ),
  changed as (
    update public.parts p
    set price_cents = priced.new_cents,
        updated_at = now()
    from priced
    where p.id = priced.id
      and p.price_cents <> priced.new_cents
    returning p.id
  )
  select
    (select count(*)::integer from changed),
    coalesce((select sum(priced.old_cents) from priced), 0),
    coalesce((select sum(priced.new_cents) from priced), 0);
end;
$$;

grant execute on function public.reprice_parts(text, text, text, numeric) to authenticated;
