-- Price history: every change to what a part sells for, kept.
--
-- A price is money, and money moves for reasons that get argued about later
-- ("we never dropped that screen to 64"). The rows are written by a trigger
-- rather than by the server action, so a price changed by psql, by the API or
-- by a future batch job is recorded the same way as one changed in the UI.
--
-- Read by staff, written only by the trigger: there is no insert policy.

create table if not exists public.part_price_events (
  id bigserial primary key,
  part_id uuid not null references public.parts (id) on delete cascade,
  old_price_cents integer not null check (old_price_cents >= 0),
  new_price_cents integer not null check (new_price_cents >= 0),
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists part_price_events_part_idx
  on public.part_price_events (part_id, created_at desc);

alter table public.part_price_events enable row level security;

drop policy if exists part_price_events_read_staff on public.part_price_events;
create policy part_price_events_read_staff
  on public.part_price_events
  for select
  to authenticated
  using (auth.uid() is not null);

-- The recorder. Security definer so the write succeeds whatever the caller's
-- role is: the guard is "you may not write these rows", not "you may not
-- change a price".
create or replace function public.record_part_price_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.price_cents is distinct from old.price_cents then
    insert into public.part_price_events (part_id, old_price_cents, new_price_cents, changed_by)
    values (new.id, old.price_cents, new.price_cents, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists parts_record_price_change on public.parts;
create trigger parts_record_price_change
  after update of price_cents on public.parts
  for each row execute function public.record_part_price_change();

-- Baseline: what the shelf was priced at before we started keeping a ledger.
insert into public.part_price_events (part_id, old_price_cents, new_price_cents, created_at)
select p.id, p.price_cents, p.price_cents, p.created_at
from public.parts p
where not exists (
  select 1 from public.part_price_events e where e.part_id = p.id
);
