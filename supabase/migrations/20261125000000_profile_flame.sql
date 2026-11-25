-- Flames: a balance on the learner's profile. Every learner starts with 10 (the column default covers
-- existing rows, the sign-up trigger and the app's fallback insert), and once a day they can claim 1–4 more
-- through public.claim_daily_flame(). The amount is decided here, never by the app, so learners can't write
-- the flame columns themselves: insert and update are granted per column and leave them out.
-- src/lib/flame.ts reads the balance and calls the claim.

alter table public.profiles
  add column flame integer not null default 10 check (flame >= 0),
  add column flame_claimed_on date;

comment on column public.profiles.flame is 'Flames held. 10 at sign-up, plus 1–4 per daily claim (claim_daily_flame).';
comment on column public.profiles.flame_claimed_on is 'UTC day of the last daily flame claim; null until the first one.';

-- Access: the settings columns stay writable by their owner (RLS still limits it to their own row);
-- the flame columns are read-only to learners ------------------------------------------------------------

revoke insert, update on public.profiles from authenticated;
grant insert (id, name, avatar_url, goal, reads, daily_goal, direction, script, script_only, show_keyboard, checklist_hidden, onboarded)
  on public.profiles to authenticated;
grant update (name, avatar_url, goal, reads, daily_goal, direction, script, script_only, show_keyboard, checklist_hidden, onboarded)
  on public.profiles to authenticated;

-- The daily claim ----------------------------------------------------------------------------------------------

-- Adds 1–4 flames, once per UTC day. Returns what was added (0 when today's claim is already taken),
-- the new balance and the day of the last claim. One conditional update, so two claims at once can't both win.
create function public.claim_daily_flame()
returns table (gained integer, total integer, claimed_on date)
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner uuid := (select auth.uid());
  today date := (now() at time zone 'utc')::date;
  amount integer := 1 + floor(random() * 4)::integer;
begin
  if learner is null then
    raise exception 'Sign in to claim flames' using errcode = '42501';
  end if;

  return query
    update public.profiles p
       set flame = p.flame + amount, flame_claimed_on = today
     where p.id = learner
       and (p.flame_claimed_on is null or p.flame_claimed_on < today)
    returning amount, p.flame, p.flame_claimed_on;

  if not found then
    return query select 0, p.flame, p.flame_claimed_on from public.profiles p where p.id = learner;
  end if;
end;
$$;

comment on function public.claim_daily_flame() is 'Adds 1–4 flames to the signed-in learner, once per UTC day.';

revoke execute on function public.claim_daily_flame() from public, anon;
grant execute on function public.claim_daily_flame() to authenticated;
