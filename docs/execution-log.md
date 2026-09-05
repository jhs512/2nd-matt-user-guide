# 단계별 학습 결과

이 저장소는 실제로 구현하고 검증한 결과를 학습 순서에 맞춰 5개 커밋으로 정리했습니다. 태그는 수업별 결과를 비교하기 위한 저장 지점입니다.

| 태그 | 단계 | 만들어지는 결과 |
| --- | --- | --- |
| 002 | `/setup-matt-pocock-skills` | 작업 규칙과 파일 이슈 관리 안내 |
| 003 | `/grill-with-docs` | CONTEXT.md와 ADR |
| 004 | `/to-spec` | 기능과 확인 조건을 적은 명세 |
| 005 | `/to-tickets` | 실행할 작업 5개 |
| 006 | `/implement` | 게시판 코드·테스트·CI·배포 설정과 공개 결과 |

## 구현 확인

- H2 메모리 DB를 사용하는 HTTP 테스트와 실제 Spring Security 검사.
- React 화면 테스트, TypeScript, lint, 프로덕션 빌드.
- Chromium에서 실제 API를 호출하는 로그인·작성·수정·공개 조회·삭제 검사.
- 별도 PostgreSQL에서 prod 프로필, 마이그레이션, health, CRUD 확인.

![게시판 관리자 화면](evidence/admin-detail.png)

## 검증 기록을 읽는 방법

[자동 검사 기록](https://github.com/jhs512/2nd-matt-user-guide/actions/runs/33979364062)은 이력 정리 전 코드에서 수행했습니다. 교육용으로 커밋을 재구성하면서 새 SHA가 생겼으며, 앱 코드와 테스트 내용은 동일합니다. 과거 배포의 SHA와 새 교육용 태그의 SHA는 다릅니다.

[운영 결과](production-status.md)에서 공개 주소와 배포 범위를 확인할 수 있습니다. Pages 최초 업로드는 완료했고 Actions 자동 업로드는 API 토큰 설정이 남았습니다.

실제 작업 당시의 시간순 기록이 필요하면 [보관 브랜치](https://github.com/jhs512/2nd-matt-user-guide/tree/archive/original-execution-20260906)를 참고하세요.
