-- Pixel Key: 수정/삭제 기능 활성화
-- Supabase Dashboard > SQL Editor > New query에 전체 붙여넣고 Run을 누르세요.

alter table public.pixels enable row level security;

grant select, insert, update, delete
on table public.pixels
to anon, authenticated;

drop policy if exists "Pixel Key public update" on public.pixels;
drop policy if exists "Pixel Key public delete" on public.pixels;

create policy "Pixel Key public update"
on public.pixels
for update
to anon, authenticated
using (true)
with check (true);

create policy "Pixel Key public delete"
on public.pixels
for delete
to anon, authenticated
using (true);

drop policy if exists "Pixel Key public image delete" on storage.objects;

create policy "Pixel Key public image delete"
on storage.objects
for delete
to anon, authenticated
using (bucket_id = 'pixel-images');

notify pgrst, 'reload schema';
