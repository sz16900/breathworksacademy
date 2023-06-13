-- Run this query in the Supabase SQL editor to setup your tables  
-- Follow the convention of double-quoting column names so they support camelCase   
-- Full instructions at https://divjoy.com/docs/supabase

/*** USERS ***/

create table public.users (
  -- UUID from auth.users
  "id" uuid references auth.users not null primary key,
  -- User data
  "email" text,
  "name" text,
  -- Validate data
  constraint "email" check (char_length("email") >= 3 OR char_length("email") <= 500),
  constraint "name" check (char_length("name") >= 1 OR char_length("name") <= 144)
);

-- Create security policies
alter table public.users enable row level security;
create policy "Can view their user data" on public.users for select using ( auth.uid() = "id" );
create policy "Can update their user data" on public.users for update using ( auth.uid() = "id" );

-- Create a trigger that automatically inserts a new user after signup with Supabase Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users ("id", "email", "name")
  values (new."id", new."email", new."raw_user_meta_data"->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create a trigger that automatically updates a user when their email is changed in Supabase Auth
create or replace function public.handle_update_user() 
returns trigger as $$
begin
  update public.users
  set "email" = new."email"
  where "id" = new."id";
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_updated
  after update of "email" on auth.users
  for each row execute procedure public.handle_update_user();

/*** CUSTOMERS ***/

create table public.customers (
  -- UUID from public.users
  "id" uuid references public.users not null primary key,
  -- Stripe data
  "stripeCustomerId" text,
  "stripeSubscriptionId" text,
  "stripePriceId" text,
  "stripeSubscriptionStatus" text
);

-- Create security policies
alter table public.customers enable row level security;
create policy "Can view their own customer data" on customers for select using (auth.uid() = "id");

/*** ITEMS ***/

create table public.items (
  -- Auto-generated UUID
  "id" uuid primary key default uuid_generate_v4(),
  -- UUID from public.users
  "owner" uuid references public.users not null,
  -- Item data
  "name" text,
  "featured" boolean,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
  -- Validate data
  constraint name check (char_length("name") >= 1 OR char_length("name") <= 144)
);

-- Create security policies
alter table public.items enable row level security;
create policy "Can read items they own" on public.items for select using ( auth.uid() = "owner" );
create policy "Can insert items they own" on public.items for insert with check ( auth.uid() = "owner" );
create policy "Can update items they own" on public.items for update using ( auth.uid() = "owner" );
create policy "Can delete items they own" on public.items for delete using ( auth.uid() = "owner" );