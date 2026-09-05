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

test("pending save prevents a new draft and failed save preserves input", async () => {
  let failSave!: (reason: Error) => void;
  const fetcher = vi
    .fn()
    .mockImplementation((url: string, init?: RequestInit) => {
      if (url.endsWith("/api/auth/login"))
        return Promise.resolve(
          new Response(JSON.stringify({ accessToken: "test-token" })),
        );
      if (init?.method === "POST")
        return new Promise((_resolve, reject) => {
          failSave = reject;
        });
      return Promise.resolve(
        new Response(
          JSON.stringify({ items: [], totalPages: 0, totalElements: 0 }),
        ),
      );
    });
  vi.stubGlobal("fetch", fetcher);
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: "관리자 로그인" }));
  fireEvent.change(screen.getByLabelText("아이디"), {
    target: { value: "admin" },
  });
  fireEvent.change(screen.getByLabelText("비밀번호"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "로그인" }));
  fireEvent.click(await screen.findByRole("button", { name: "새 공지" }));
  fireEvent.change(screen.getByLabelText("제목"), {
    target: { value: "보존할 제목" },
  });
  fireEvent.change(screen.getByLabelText("본문"), {
    target: { value: "보존할 본문" },
  });
  fireEvent.click(screen.getByRole("button", { name: "저장" }));
  expect(screen.getByRole("button", { name: "새 공지" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "저장 중…" })).toBeDisabled();
  failSave(new Error("일시적인 연결 실패"));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "일시적인 연결 실패",
  );
  expect(screen.getByLabelText("제목")).toHaveValue("보존할 제목");
  expect(screen.getByLabelText("본문")).toHaveValue("보존할 본문");
});
