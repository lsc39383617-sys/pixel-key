# Pixel Key

장소, 사진, 날짜, 감정을 Pixel로 기록하고 한 송이 꽃으로 채워가는 Next.js 앱입니다.

## 현재 기능

- Supabase Pixel 저장 및 조회
- Supabase Storage 사진 업로드
- 방문 날짜와 카테고리
- 카카오맵 키워드 장소 검색
- 현재 위치 가져오기 및 주소 변환
- 장소명, 주소, 위도·경도 저장
- 상세 페이지 지도와 카카오맵 링크
- 홈 검색과 카테고리 필터
- Pixel Flower 진행률
- 모바일 반응형 UI

## 시작

```bash
cp .env.example .env.local
npm install
npm run dev
```

데이터베이스 설정과 Vercel 배포는 `DEPLOY-KAKAO.md`를 확인하세요.
