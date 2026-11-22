create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz not null default now(),
  name text not null check (
    name = btrim(name)
    and char_length(name) between 2 and 80
  ),
  phone text not null check (phone ~ '^[67][0-9]{7}$'),
  email text check (
    email is null
    or (
      email = btrim(email)
      and char_length(email) between 3 and 120
      and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  ),
  reason text not null check (
    reason in ('Consulta de producto', 'Realizar pedido', 'Asesoría de alimento')
  ),
  message text not null check (
    message = btrim(message)
    and char_length(message) between 10 and 1000
  ),
  consent boolean not null default false check (consent),
  cart_items jsonb not null default '[]'::jsonb check (jsonb_typeof(cart_items) = 'array'),
  cart_total numeric(10, 2) not null default 0 check (cart_total >= 0)
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from public, anon, authenticated;
grant insert (name, phone, email, reason, message, consent, cart_items, cart_total)
  on table public.contact_messages to anon, authenticated;
grant select, insert, update, delete on table public.contact_messages to service_role;

create policy "Visitors can submit contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);
