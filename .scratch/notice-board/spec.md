# 공지사항 게시판

Status: ready-for-agent

## Problem Statement
방문자는 안내를 읽고 관리자는 코드를 수정하지 않고 안내를 관리하고 싶다.

## Solution
공개 목록·상세, 관리자 로그인·등록·수정·삭제를 제공한다.

## User Stories
1. 방문자는 로그인 없이 최신 공지부터 읽는다. 생성일과 ID 내림차순, 페이지 크기 10, API 페이지는 0부터다.
2. 방문자는 제목·일반 텍스트 본문·UTC 생성/수정 시각을 확인하며 화면에는 현지 시각이 표시된다.
3. 빈 목록, 로딩, API 실패, 없는 공지를 이해할 수 있다. page<0은 400, 범위 초과는 빈 items다.
4. 관리자는 로그인하여 30분 토큰을 받고 새로고침하면 다시 로그인한다.
5. 잘못된 로그인, 만료·변조 토큰은 401이며 쓰기 권한이 없는 인증 사용자는 403이다.
6. 관리자는 앞뒤 공백 제거 후 제목 1–100자, 본문 1–10000자를 저장한다.
7. 등록은 201+Location과 상세, 수정은 200, 삭제는 204다. GET 상세가 없으면 404다.
8. 수정은 생성일과 목록 순서를 유지하며 수정일을 갱신한다.
9. 삭제 전 확인하고 삭제 후 목록으로 돌아간다. 마지막 페이지의 마지막 글이면 이전 페이지로 이동한다.
10. 요청 중 중복 제출을 막고 실패하면 작성 내용을 보존한다.
11. 운영자는 실제 PG 연결·마이그레이션·CRUD와 배포된 커밋을 확인한다.

## Implementation Decisions
Boot 4.1.1, Initializr Kotlin/Gradle, JDK 25, Spring MVC/JPA/Security/JWT, Flyway+validate.
local H2 파일, test H2 메모리, prod PostgreSQL. 인증은 쿠키와 HTTP Basic 없는 stateless Bearer이며 이 전제에서 CSRF를 사용하지 않는다. CORS는 명시한 Origin과 Authorization 헤더를 허용한다. JWT 서명, exp, issuer, audience, ADMIN 권한을 검사한다.
React TypeScript Vite shadcn/ui, API URL은 빌드 시 주입. 운영 비밀은 프론트에 포함하지 않는다.

## Testing Decisions
사용자가 승인한 튜토리얼의 경계를 따른다: 실제 Security 포함 HTTP+H2, 화면 테스트, 브라우저 E2E. 내부 구현에 의존하는 검증을 피한다. 운영 PG는 배포 검증으로 별도 기록한다.

## Out of Scope
회원가입·댓글·검색·첨부·초안·상단 고정·refresh token·여러 관리자 관리.

## Further Notes
사용자가 기존 튜토리얼 그대로 실행을 요청했으므로 문서의 제안값을 본 실습의 기본 선택으로 사용한다. 추가 질문이 필요한 운영 계정 정보는 만들어내지 않는다.
