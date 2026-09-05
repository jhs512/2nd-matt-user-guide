# 배포 설정

Railway API·PostgreSQL과 Cloudflare Pages 첫 공개 배포를 완료했습니다. [공개 URL과 확인 범위](production-status.md)를 참고하세요. Pages 자동배포에는 별도 API 토큰이 필요합니다.

## 준비된 파일

- 루트 Dockerfile: JDK25 빌드 → JRE25 실행, 일반 사용자로 실행.
- railway.toml: 루트 Dockerfile 사용, /actuator/health 준비 검사.
- .github/workflows/verify.yml: H2·화면·E2E·실제 PG 검사 후 배포.
- /api/version: APP_REVISION을 반환해 이전 배포의 health200을 새 배포 성공으로 착각하지 않도록 검사.

## 배포 순서

1. Railway에 프로젝트, api 서비스와 PostgreSQL을 만든다. 이 저장소는 **Root Directory를 저장소 루트**로 사용한다. Dockerfile 내부에서 backend/를 복사하므로 Railway에 backend/를 다시 지정하지 않는다.
2. api 환경변수: SPRING_PROFILES_ACTIVE=prod, ADMIN_USERNAME, ADMIN_PASSWORD_HASH(새 BCrypt 해시), JWT_SECRET(새 무작위 32바이트 이상), CORS_ALLOWED_ORIGINS(실제 Pages HTTPS Origin).
3. DB 변수: SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}, SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}, SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}. 서비스 이름은 실제 PG 서비스 이름과 맞춘다.
4. api 공개 도메인을 발급하고 Pages 프로젝트를 Direct Upload 방식으로 준비한다. 별도 Git 자동배포는 켜지 않는다.
5. GitHub production 환경 Secrets에 RAILWAY_TOKEN(해당 프로젝트·환경 토큰), CLOUDFLARE_API_TOKEN(Pages 편집 권한)을 등록한다.
6. GitHub Variables에 RAILWAY_SERVICE_ID, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_PAGES_PROJECT, VITE_API_BASE_URL을 등록한다.
7. 위 설정을 준비한 뒤 DEPLOY_ENABLED=true로 Railway 배포를 켠다. Cloudflare 토큰을 등록한 뒤 PAGES_DEPLOY_ENABLED=true도 설정하고 workflow_dispatch를 실행한다.
8. /api/version의 SHA, health, Pages URL, 실제 관리자 로그인과 PG CRUD를 확인하고 05 티켓을 완료한다.

로컬 예제의 비밀번호·해시는 공개된 실습 전용입니다. 운영에서 재사용하지 않습니다. 비밀번호를 채팅이나 저장소에 붙여 넣지 않고 환경변수/Secrets에 넣습니다.

## 로컬 PostgreSQL 확인 재현

Docker가 실행 중이어야 합니다. 이미 동일 이름의 컨테이너가 있다면 새로 만들지 말고 상태를 확인합니다.

```powershell
docker run -d --name second-matt-pg -e POSTGRES_DB=notice -e POSTGRES_USER=notice -e POSTGRES_PASSWORD=local-pg-only -p 127.0.0.1:55432:5432 postgres:17
```

별도 터미널에서 로컬 실행 스크립트와 같은 관리자 설정을 사용하되 SPRING_PROFILES_ACTIVE=prod, PORT=8081, SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:55432/notice, SPRING_DATASOURCE_USERNAME=notice, SPRING_DATASOURCE_PASSWORD=local-pg-only로 실행합니다. health200 이후 `node scripts/smoke.mjs`로 실제 CRUD를 검사합니다. GitHub CI에는 이 과정이 자동으로 포함되어 있습니다.
