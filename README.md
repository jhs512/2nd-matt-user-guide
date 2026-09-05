# Matt Pocock 매뉴얼을 실제로 실행한 공지사항 게시판

빈 프로젝트에서 [원래 매뉴얼](https://github.com/jhs512/matt-user-guide)의 스킬 흐름을 따라 만든 결과입니다.

**[공개 공지사항](https://2nd-matt-user-guide.pages.dev)에 접속할 수 있습니다. Railway PostgreSQL과 API, Cloudflare Pages 첫 배포 및 실제 브라우저 검증이 완료됐습니다. Pages 자동배포는 전용 토큰 설정이 남았습니다.**

```mermaid
flowchart LR
    A["하네스 설정"] --> B["질문과 결정 기록"] --> C["명세 작성"] --> D["5개 작업으로 나누기"] --> E["구현과 실제 검사"] --> F["공개 배포 · 운영 확인"]
```

## 교육용 커밋

`002 하네스` → `003 요구사항` → `004 명세` → `005 티켓` → `006 구현·검사·배포`

각 단계의 파일과 전후 비교는 [매뉴얼](https://github.com/jhs512/matt-user-guide)에서 확인하세요. 실제 구현 결과를 수업 순서로 재구성한 이력입니다.

## 바로 실행하기

Git, Node.js 24, JDK 25가 필요합니다. Windows PowerShell 기준입니다.

```powershell
git clone https://github.com/jhs512/2nd-matt-user-guide.git
cd 2nd-matt-user-guide
./scripts/run-local.ps1
```

새 터미널에서:

```powershell
cd frontend
npm ci
npm run dev
```

http://localhost:5173 으로 접속합니다. 로컬 실습용 로그인은 **admin / local-demo-password**입니다. 공개된 연습 계정이므로 운영에서는 새 비밀번호와 해시를 설정합니다. 새로고침하면 로그아웃됩니다.

로컬 DB는 backend/data/ 아래 H2 파일이며 다시 실행해도 남습니다. 빈 DB에는 local 프로필에서만 이용 안내 예제를 넣습니다. test 프로필은 H2 메모리, prod 프로필은 PostgreSQL입니다.

## 실제 실행 화면

![공개 사이트에서 운영 PostgreSQL에 저장한 실제 화면](docs/evidence/production-detail.png)

## 검사 실행

```powershell
./backend/gradlew.bat -p backend test bootJar
cd frontend
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

E2E를 실행할 때는 위의 로컬 백엔드가 실행 중이어야 합니다. 프론트 개발 서버는 Playwright가 실행합니다. API 모의 응답만으로 통과시키지 않고 실제 서버와 DB를 호출합니다.

[GitHub Actions 실행 결과](https://github.com/jhs512/2nd-matt-user-guide/actions)에서는 H2 검사와 별도로 PostgreSQL 서비스를 띄워 prod 설정과 CRUD도 확인합니다. Railway 배포가 활성화돼 있으며 Pages 업로드 단계는 전용 토큰 설정이 완료될 때까지 건너뜁니다.

## 진행 기록과 설계

- [단계별 학습 결과](docs/execution-log.md)
- [고정한 도구·라이브러리 버전](docs/versions.md)
- [실제로 구현할 내용](.scratch/notice-board/spec.md)
- [작업별 완료 여부](.scratch/notice-board/issues)
- [프로젝트 용어와 규칙](CONTEXT.md), [결정과 이유](docs/adr)
- [코드 검토 결과](docs/review.md)
- [배포 설정과 남은 작업](docs/deployment.md)

CONTEXT.md는 프로젝트의 설명서, ADR은 중요한 선택의 이유를 적는 노트입니다. 다음 작업 때 이 파일들을 다시 읽으면 지난 대화를 전부 기억하지 못해도 결정 내용을 이어갈 수 있습니다. 파일을 작성하는 것만으로 AI가 영구히 기억하는 것은 아니므로 AGENTS.md가 이 문서들을 먼저 읽도록 안내합니다.

## 운영 로그인

운영 관리자 이름은 admin입니다. 비밀번호는 로컬 예제와 다릅니다. 배포한 Windows 계정에서 `./scripts/show-production-login.ps1`로 확인할 수 있습니다. 암호화 파일은 Git에 포함하지 않았습니다. [운영 배포 상태](docs/production-status.md)를 참고하세요.
