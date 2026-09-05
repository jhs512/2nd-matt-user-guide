import { render, screen, fireEvent } from "@testing-library/react";
import { vi, test, expect, afterEach } from "vitest";
import App from "./App";
afterEach(() => vi.unstubAllGlobals());
test("visitor sees empty state and no editing controls", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ items: [], totalPages: 0, totalElements: 0 }),
        ),
      ),
  );
  render(<App />);
  expect(
    await screen.findByText("아직 등록된 공지가 없습니다."),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "새 공지" }),
  ).not.toBeInTheDocument();
});
test("failed list request can be retried", async () => {
  const fetcher = vi
    .fn()
    .mockRejectedValueOnce(new Error("연결 실패"))
    .mockResolvedValue(
      new Response(
        JSON.stringify({ items: [], totalPages: 0, totalElements: 0 }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent("연결 실패");
  fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(
    await screen.findByText("아직 등록된 공지가 없습니다."),
  ).toBeInTheDocument();
});
