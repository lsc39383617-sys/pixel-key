-- Pixel Key: 장소/정확한 주소/지도 좌표 저장을 위한 필수 SQL
-- Supabase Dashboard > SQL Editor > New query에 전체 붙여넣고 Run을 누르세요.

alter table public.pixels
  add column if not exists visited_at date,
  add column if not exists category text default 'other',
  add column if not exists place_name text,
  add column if not exists address_name text,
  add column if not exists road_address_name text,
  add column if not exists place_url text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

update public.pixels
set category = 'other'
where category is null or category = '';

alter table public.pixels
  alter column category set default 'other';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'pixels_category_check'
      and conrelid = 'public.pixels'::regclass
  ) then
    alter table public.pixels drop constraint pixels_category_check;
  end if;

  alter table public.pixels
    add constraint pixels_category_check
    check (category in ('food', 'cafe', 'travel', 'date', 'daily', 'other'));
end
$$;

grant select, insert on table public.pixels to anon, authenticated;

alter table public.pixels enable row level security;

drop policy if exists "Allow public read" on public.pixels;
drop policy if exists "Allow public insert" on public.pixels;
drop policy if exists "Pixel Key public read" on public.pixels;
drop policy if exists "Pixel Key public insert" on public.pixels;

create policy "Pixel Key public read"
on public.pixels
for select
to anon, authenticated
using (true);

create policy "Pixel Key public insert"
on public.pixels
for insert
to anon, authenticated
with check (true);

insert into storage.buckets (id, name, public)
values ('pixel-images', 'pixel-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public image upload" on storage.objects;
drop policy if exists "Pixel Key public image upload" on storage.objects;
drop policy if exists "Pixel Key public image read" on storage.objects;

create policy "Pixel Key public image upload"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'pixel-images');

create policy "Pixel Key public image read"
on storage.objects
for select
to public
using (bucket_id = 'pixel-images');

-- PostgREST가 새 컬럼을 즉시 인식하도록 스키마 캐시를 새로고침합니다.
notify pgrst, 'reload schema';
