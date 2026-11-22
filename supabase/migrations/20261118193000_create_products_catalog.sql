create table public.products (
  id integer primary key,
  name text not null,
  category text not null,
  animal text not null,
  price numeric(10, 2) not null check (price >= 0),
  image text not null
);

alter table public.products enable row level security;

create policy "Public can read products"
  on public.products
  for select
  to anon, authenticated
  using (true);

revoke all on table public.products from anon, authenticated;
grant select on table public.products to anon, authenticated;

insert into public.products (id, name, category, animal, price, image) values
  (1, 'Cat Chow · alimento seco', 'Alimentos', 'Gatos', 165, 'comidaseca-gato1.avif'),
  (2, 'Cat Chow · alimento seco', 'Alimentos', 'Gatos', 165, 'comidaseca-gatp4.avif'),
  (3, 'Pro Plan · alimento seco', 'Alimentos', 'Perros', 165, 'comidapremium-perro.avif'),
  (4, 'Toalla con capucha', 'Higiene', 'Perros y gatos', 55, 'toalla-mascotas.jpg'),
  (5, 'Gallina de juguete', 'Juguetes', 'Perros', 45, 'juguete2-perro.jpg'),
  (6, 'Set de paseo · verde', 'Accesorios', 'Perros y gatos', 85, 'conjunto de correa-verde.jpg'),
  (7, 'Cat Chow · alimento seco', 'Alimentos', 'Gatos', 165, 'comidaseca-gato5.avif'),
  (8, 'Set de paseo · azul', 'Accesorios', 'Perros y gatos', 85, 'conjunto de correa-azul.jpg'),
  (9, 'Set de accesorios para perro', 'Accesorios', 'Perros y gatos', 85, 'combo de perrito-accesorios.jpg'),
  (10, 'Transportadora rígida', 'Accesorios', 'Perros y gatos', 85, 'transportadora-gato.jpg'),
  (11, 'Ropa para mascotas', 'Accesorios', 'Perros y gatos', 85, 'ropasdemascotas.jpg'),
  (12, 'Dog Chow · comida húmeda', 'Alimentos', 'Perros', 35, 'comidahumeda-perro1.avif'),
  (13, 'Cat Chow · comida húmeda', 'Alimentos', 'Gatos', 35, 'comidahumeda-gato2.avif'),
  (14, 'Cat Chow · alimento seco', 'Alimentos', 'Gatos', 165, 'somidaseca-gato3.avif'),
  (15, 'Pro Plan · alimento seco', 'Alimentos', 'Perros', 165, 'comidaseca-perro1.avif'),
  (16, 'Cama con bordes', 'Accesorios', 'Perros y gatos', 85, 'cama-perro.jpg'),
  (17, 'Juguete interactivo para gato', 'Juguetes', 'Gatos', 45, 'jueguete2-gato.jpg'),
  (18, 'Dog Chow · comida húmeda', 'Alimentos', 'Perros', 35, 'comidahumeda-perro3.avif'),
  (19, 'Cepillo dental para mascotas', 'Higiene', 'Perros y gatos', 55, 'cepillodedientes-mascota.jpg'),
  (20, 'Cama acolchada', 'Accesorios', 'Perros y gatos', 85, 'cama-mascotas.jpg'),
  (21, 'Cat Chow · alimento seco', 'Alimentos', 'Gatos', 165, 'comidaseca-gato2.avif'),
  (22, 'Cat Chow · comida húmeda', 'Alimentos', 'Gatos', 35, 'comidahumeda-gato1.avif'),
  (23, 'Bolso transportador', 'Accesorios', 'Perros y gatos', 85, 'bolsopaaraperrito-ttransportador.jpg'),
  (24, 'Set de accesorios para gato', 'Accesorios', 'Perros y gatos', 85, 'combo de gatito-accesorios.jpg'),
  (25, 'Pro Plan · alimento seco', 'Alimentos', 'Gatos', 165, 'comidapremium-gato.avif'),
  (26, 'Pelota para perro', 'Juguetes', 'Perros', 45, 'juguet1-perro.jpg'),
  (27, 'Mordedor con cepillo', 'Juguetes', 'Perros', 45, 'juguete3-perro.jpg'),
  (28, 'Comedero con bebedero', 'Accesorios', 'Perros y gatos', 85, 'platodecomidayagua2.jpg'),
  (29, 'Comedero doble', 'Accesorios', 'Perros y gatos', 85, 'platodeaguaycomida.jpg'),
  (30, 'Limpiador de patitas', 'Higiene', 'Perros y gatos', 55, 'limpiapatita-perro.jpg'),
  (31, 'Cepillo de baño', 'Higiene', 'Perros y gatos', 55, 'cepilloducha-peerito.jpg'),
  (32, 'Rascador con juguete', 'Juguetes', 'Gatos', 45, 'rascasdor-gato.jpg'),
  (33, 'Set de paseo · fucsia', 'Accesorios', 'Perros y gatos', 85, 'conjunto de correa-fucsia.jpg'),
  (34, 'Dog Chow · comida húmeda', 'Alimentos', 'Perros', 35, 'comidahumeda-perro4.avif'),
  (35, 'Circuito de juego para gato', 'Juguetes', 'Gatos', 45, 'juguete3-gato.jpg'),
  (36, 'Bebedero portátil', 'Accesorios', 'Perros y gatos', 85, 'bebedero-afueramascota.jpg'),
  (37, 'Set de paseo · rojoamarillo', 'Accesorios', 'Perros y gatos', 85, 'conjunto de correa-rojoamarillo.jpg'),
  (38, 'Pelotas para gato', 'Juguetes', 'Gatos', 45, 'juguete1-gato.jpg'),
  (39, 'Cortauñas para mascotas', 'Higiene', 'Perros y gatos', 55, 'cortagarras-mascota.jpg');
