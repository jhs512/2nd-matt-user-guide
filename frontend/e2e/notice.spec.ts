import { test, expect } from "@playwright/test";
test("visitor and admin complete a real notice lifecycle", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "공지사항", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "관리자 로그인" }).click();
  await page.getByLabel("아이디").fill("admin");
  await page.getByLabel("비밀번호").fill("local-demo-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.getByRole("button", { name: "새 공지", exact: true }).click();
  const title = `서비스 점검 안내 ${Date.now()}`;
  await page.getByLabel("제목", { exact: true }).fill(title);
  await page
    .getByLabel("본문", { exact: true })
    .fill(
      "토요일 오전 2시부터 3시까지 점검합니다.\n<script>일반 텍스트입니다.</script>",
    );
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.getByRole("button", { name: "수정", exact: true }).click();
  await page.getByLabel("본문", { exact: true }).fill("점검이 완료되었습니다.");
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(
    page.getByText("점검이 완료되었습니다.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "../docs/evidence/admin-detail.png",
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "관리자 로그인" }),
  ).toBeVisible();
  await page.getByRole("button", { name: title, exact: true }).click();
  await expect(
    page.getByRole("button", { name: "삭제", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "관리자 로그인" }).click();
  await page.getByLabel("아이디").fill("admin");
  await page.getByLabel("비밀번호").fill("local-demo-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.getByRole("button", { name: title, exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(
    page.getByRole("button", { name: title, exact: true }),
  ).toHaveCount(0);
});
