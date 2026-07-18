Pixel Key 수정·삭제 패치

추가 기능
- 상세 페이지 수정 버튼
- 상세 페이지 삭제 버튼 + 확인 모달
- 피드 카드 점 3개 메뉴에서 수정·삭제
- /pixel/[uid]/edit 전체 수정 화면
- 이름, 카테고리, 날짜, 장소, 설명, 대표 사진 수정
- 기존 사진 삭제 및 새 사진 교체

필수 설정
1. Supabase SQL Editor에서 EDIT-DELETE-SUPABASE.sql 전체 실행
2. 프로젝트 파일 덮어쓰기
3. npm run build
4. git add . && git commit && git push

주의
현재 프로젝트는 로그인 없는 공개 베타 구조라서 수정·삭제 권한도 공개되어 있습니다.
실제 다중 사용자 서비스 공개 전에는 인증과 owner_id 기반 RLS가 필요합니다.
