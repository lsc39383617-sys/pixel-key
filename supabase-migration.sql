-- Pixel Key map release migration
-- Supabase Dashboard > SQL Editor에서 전체 실행하세요.

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

-- 허용된 카테고리만 저장되도록 제한합니다.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pixels_category_check'
      and conrelid = 'public.pixels'::regclass
  ) then
    alter table public.pixels
      add constraint pixels_category_check
      check (category in ('food', 'cafe', 'travel', 'date', 'daily', 'other'));
  end if;
end
$$;

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

-- 이미지 버킷을 생성하고 공개 URL을 사용할 수 있게 합니다.
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
