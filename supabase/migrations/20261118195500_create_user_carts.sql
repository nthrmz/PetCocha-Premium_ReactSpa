create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  product_id integer not null references public.products (id),
  quantity integer not null check (quantity between 1 and 99),
  constraint cart_items_cart_id_product_id_key unique (cart_id, product_id)
);

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

revoke all on table public.carts, public.cart_items from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.carts, public.cart_items to authenticated;

create policy "Users manage their own carts"
  on public.carts
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage items in their own carts"
  on public.cart_items
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.carts
      where carts.id = cart_items.cart_id
        and carts.user_id = (select auth.uid())
    )
  );
