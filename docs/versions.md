# 실행에 사용한 버전

2026-09-06에 빈 프로젝트를 생성하고 설치·빌드를 실행한 결과입니다. 이후 재현할 때는 Gradle Wrapper와 package-lock.json을 사용합니다.

| 구성 | 실행 버전 |
|---|---|
| JDK | Eclipse Temurin 25.0.3 |
| Spring Boot | 4.1.1 |
| Kotlin | 2.3.21 |
| Gradle Wrapper | 9.7.1 |
| Node.js | 24.13.1 |
| React | 19.2.8 |
| Vite | 8.2.2 |
| TypeScript | 6.0.2 |
| Tailwind CSS | 4.3.3 |
| shadcn CLI | 4.21.0, radix + nova |
| Vitest | 5.0.0 |
| Playwright | 1.63.0 |
| Railway CLI | 5.30.4 |
| Wrangler (프로젝트 고정) | 4.129.0 |
| 로컬 PostgreSQL 실험 | 17.11 (postgres:17 이미지) |

Spring 의존성은 Boot가 관리합니다. H2 2.4.240, Spring Security 7.1.1을 실제 실행에서 확인했습니다. Vite 생성 템플릿의 lint 명령은 ESLint가 아닌 Oxlint였습니다.
