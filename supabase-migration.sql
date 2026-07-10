-- Pixel Key: 날짜 컬럼 추가
alter table public.pixels
add column if not exists visited_at date;
