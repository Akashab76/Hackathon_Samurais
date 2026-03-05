-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  role text not null check (role in ('farmer', 'consumer')),
  city text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Create listings table (farmer produce listings)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crop text not null,
  variety text not null,
  quantity numeric not null default 0,
  price numeric not null default 0,
  harvest_date date not null,
  storage_method text,
  organic boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

-- Farmers can CRUD their own listings
create policy "listings_select_own" on public.listings for select using (auth.uid() = user_id);
create policy "listings_insert_own" on public.listings for insert with check (auth.uid() = user_id);
create policy "listings_update_own" on public.listings for update using (auth.uid() = user_id);
create policy "listings_delete_own" on public.listings for delete using (auth.uid() = user_id);

-- Consumers can browse all listings (read-only)
create policy "listings_select_all_consumers" on public.listings for select using (true);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone, role, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'consumer'),
    coalesce(new.raw_user_meta_data ->> 'city', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
