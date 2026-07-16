# Pixel Key 카카오맵 배포 설정

## 1. Supabase 마이그레이션

Supabase Dashboard > SQL Editor > New query에서 `supabase-migration.sql` 전체를 실행합니다.

이 SQL은 다음을 준비합니다.

- 방문 날짜
- 카테고리
- 장소명, 주소, 도로명 주소
- 카카오 장소 URL
- 위도와 경도
- 공개 읽기/저장 RLS 정책
- `pixel-images` 공개 버킷과 업로드 정책

## 2. 로컬 환경변수

기존 `.env.local`에 아래 한 줄을 추가합니다.

```env
NEXT_PUBLIC_KAKAO_MAP_KEY=카카오_JavaScript_키
```

REST API 키가 아니라 **JavaScript 키**를 사용해야 합니다.

## 3. 카카오 개발자 콘솔 도메인

카카오 개발자 콘솔에서 앱을 만든 후 JavaScript 키의 JavaScript SDK 도메인에 아래 주소를 등록합니다.

- `http://localhost:3000`
- 실제 Vercel Production 도메인(예: `https://pixel-key.vercel.app`)
- Vercel에 연결한 개인 도메인이 있다면 그 도메인도 추가

프로토콜(`http://`, `https://`)까지 포함해 등록합니다.

## 4. Vercel 환경변수

Vercel > Project > Settings > Environment Variables에 다음 세 값을 등록합니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_KAKAO_MAP_KEY`

Environment는 Production, Preview, Development를 모두 선택하는 편이 편합니다.

환경변수를 새로 등록한 뒤에는 최신 배포를 Redeploy해야 합니다.

## 5. 로컬 확인

```bash
npm install
npm run lint
npm run build
npm run dev
```

브라우저에서 `http://localhost:3000/add`를 열고 아래를 확인합니다.

1. 장소 검색 결과가 나온다.
2. 장소를 선택하면 지도 마커가 이동한다.
3. 사진 없이도 저장된다.
4. 사진을 넣어도 저장된다.
5. 상세 페이지에서 카카오맵과 장소 정보가 표시된다.

## 6. 배포

```bash
git add .
git commit -m "Add Kakao map place memories"
git push origin main
```

Vercel이 `main` 브랜치에 연결되어 있으면 자동 배포됩니다.
