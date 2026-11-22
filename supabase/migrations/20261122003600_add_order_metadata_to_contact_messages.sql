alter table public.contact_messages
  add column request_type text not null default 'Consulta'
    check (request_type in ('Consulta', 'Pedido')),
  add column status text not null default 'Pendiente'
    check (status in ('Pendiente', 'En revisión', 'Respondido', 'Cerrado'));
