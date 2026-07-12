# Pixel Key 배포

이 프로젝트는 아래 검사를 통과한 상태입니다.

- `npm run lint`
- `npm run build`
- Next.js 16.2.9 / Turbopack

## 기존 저장소에 덮어쓰기

압축을 푼 뒤 `pixel-key` 폴더의 파일을 기존 `~/pixel-key`에 덮어쓰고 다음을 실행합니다.

```bash
cd ~/pixel-key
npm install
npm run build
git add .
git commit -m "Fix production build and visited date"
git push origin main
```

GitHub와 연결된 Vercel 프로젝트라면 `main` 푸시 후 자동 배포됩니다.

## Supabase 날짜 컬럼

Supabase SQL Editor에서 한 번만 실행합니다.

```sql
alter table public.pixels
add column if not exists visited_at date;
```

동일 SQL은 `supabase-migration.sql`에도 들어 있습니다.
