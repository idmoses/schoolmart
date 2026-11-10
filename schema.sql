-- SchoolMart database. Paste ALL of this in Supabase > SQL Editor > New query > Run.

create table profiles(
  id uuid primary key references auth.users on delete cascade,
  email text, name text, school text, student_no text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz default now());
create unique index profiles_student_no_key on profiles (lower(student_no));

create table products(
  id bigint generated always as identity primary key,
  name text not null, category text not null,
  price integer not null check (price >= 0),
  image_url text, emoji text default '🛍️', created_at timestamptz default now());

create table orders(
  id bigint generated always as identity (start with 10001) primary key,
  user_id uuid not null default auth.uid() references profiles(id),
  name text, student_no text, school text, phone text, address text, payment text,
  items jsonb not null, item_count int not null default 0, total int not null default 0,
  status text not null default 'Processing', created_at timestamptz default now());

create function public.is_admin() returns boolean language sql security definer stable set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- every new sign-up gets a profile (name, school, student number)
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, school, student_no)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''), coalesce(new.raw_user_meta_data->>'school',''), new.raw_user_meta_data->>'student_no');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- the SERVER works out each order total and status, so students cannot fake them
create function public.orders_before_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare t int := 0; c int := 0; it jsonb; q int;
begin
  for it in select * from jsonb_array_elements(new.items) loop
    q := greatest(coalesce((it->>'q')::int, 1), 1);
    t := t + coalesce((select price from products where id = (it->>'id')::bigint), 0) * q;
    c := c + q;
  end loop;
  new.user_id := auth.uid();
  new.item_count := c;
  new.status := case when new.payment = 'Pay on delivery' then 'Processing' else 'Awaiting payment confirmation' end;
  return new;
end $$;
create trigger orders_before_insert before insert on orders for each row execute function public.orders_before_insert();

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

create policy "own or admin profile" on profiles for select using (id = auth.uid() or public.is_admin());
create policy "everyone sees products" on products for select using (true);
create policy "admin adds products" on products for insert with check (public.is_admin());
create policy "admin edits products" on products for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes products" on products for delete using (public.is_admin());
create policy "own or admin orders" on orders for select using (user_id = auth.uid() or public.is_admin());
create policy "students place own orders" on orders for insert to authenticated with check (user_id = auth.uid());
create policy "admin updates orders" on orders for update using (public.is_admin()) with check (public.is_admin());

-- live updates: new items appear on every open screen
alter publication supabase_realtime add table products;

-- photo storage for items added by the admin
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict do nothing;
create policy "anyone views photos" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin uploads photos" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin edits photos" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "admin deletes photos" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- starter items (photos load from your images/ folder; emoji shows if a photo is missing)
insert into products (name, category, price, image_url, emoji) values
  ('Mathematics Textbook','Books',4500,'images/maths-textbook.jpg','📘'),
  ('English Language Guide','Books',3800,'images/english-guide.jpg','📗'),
  ('Science Workbook','Books',4200,'images/science-workbook.jpg','📙'),
  ('Black School Shoes','Shoes',12500,'images/black-school-shoes.jpg','👞'),
  ('White Canvas Sneakers','Shoes',9800,'images/white-sneakers.jpg','👟'),
  ('Sports Trainers','Shoes',15000,'images/sports-trainers.jpg','👟'),
  ('School Uniform Shirt','Clothes',5500,'images/uniform-shirt.jpg','👕'),
  ('Navy Trousers','Clothes',6000,'images/navy-trousers.jpg','👖'),
  ('PE Kit Set','Clothes',7500,'images/pe-kit.jpg','🎽'),
  ('Knitted Cardigan','Clothes',8500,'images/cardigan.jpg','🧥'),
  ('Student Backpack','Bags',11000,'images/backpack.jpg','🎒'),
  ('Lunch Bag','Bags',3500,'images/lunch-bag.jpg','🍱'),
  ('Exercise Books (12 pack)','Stationery',2400,'images/exercise-books.jpg','📓'),
  ('Geometry Set','Stationery',2200,'images/geometry-set.jpg','📐'),
  ('Pen Pack (20)','Stationery',1500,'images/pens.jpg','🖊️'),
  ('Scientific Calculator','Stationery',6500,'images/calculator.jpg','🧮');

-- AFTER you register on the site with the owner email, run this ONE line to make that account the admin:
-- update profiles set role = 'admin' where email = 'YOUR-EMAIL@example.com';
