import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Notice = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};
type Page = { items: Notice[]; totalPages: number; totalElements: number };
const api = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
export default function App() {
  const [token, setToken] = useState("");
  const [resumeEdit, setResumeEdit] = useState(false);
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page>({
    items: [],
    totalPages: 0,
    totalElements: 0,
  });
  const [selected, setSelected] = useState<Notice | null>(null);
  const [view, setView] = useState<"list" | "detail" | "login" | "edit">(
    "list",
  );
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  async function request(path: string, method = "GET", payload?: unknown) {
    const response = await fetch(`${api}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && method !== "GET" ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    if (!response.ok) {
      if (response.status === 401) setToken("");
      throw new Error(
        (
          {
            400: "제목은 1–100자, 본문은 1–10000자로 입력해 주세요.",
            401: "로그인 정보를 확인하거나 다시 로그인해 주세요.",
            403: "이 작업을 할 권한이 없습니다.",
            404: "공지를 찾을 수 없습니다.",
          } as Record<number, string>
        )[response.status] ??
          "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
    return response.status === 204 ? null : response.json();
  }
  useEffect(() => {
    if (view !== "list") return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`${api}/api/notices?page=${page}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("목록을 불러오지 못했습니다.");
        const result: Page = await r.json();
        if (!result.items.length && page > 0)
          setPage(Math.max(0, result.totalPages - 1));
        else setData(result);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, view, refresh]);
  async function act(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "연결을 확인해 주세요.");
    } finally {
      setBusy(false);
    }
  }
  function home() {
    setView("list");
    setError("");
    setRefresh((v) => v + 1);
  }
  function edit(n: Notice | null) {
    setSelected(n);
    setTitle(n?.title ?? "");
    setBody(n?.body ?? "");
    setError("");
    setView("edit");
  }
  function save(e: FormEvent) {
    e.preventDefault();
    void act(async () => {
      const n = await request(
        selected ? `/api/notices/${selected.id}` : "/api/notices",
        selected ? "PUT" : "POST",
        { title, body },
      );
      setSelected(n);
      setView("detail");
    });
  }
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            NOTICE BOARD
          </p>
          <h1 className="mt-2 text-3xl font-bold">공지사항</h1>
        </div>
        <div className="flex gap-2">
          {token ? (
            <>
              <Button disabled={busy} onClick={() => edit(null)}>새 공지</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setToken("");
                  home();
                }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setResumeEdit(view === "edit");
                setView("login");
                setError("");
              }}
            >
              관리자 로그인
            </Button>
          )}
        </div>
      </header>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-destructive p-4 text-destructive"
        >
          {error}
          {view === "list" && (
            <Button className="ml-3" variant="outline" onClick={home}>
              다시 시도
            </Button>
          )}
        </div>
      )}
      {view === "list" && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            서비스 소식과 이용 안내 · 총 {data.totalElements}개
          </p>
          {loading ? (
            <p role="status">불러오는 중…</p>
          ) : (
            !error && (
              <>
                {data.items.length ? (
                  <div className="space-y-3">
                    {data.items.map((n) => (
                      <Card key={n.id}>
                        <CardContent className="flex items-center justify-between gap-3 py-5">
                          <button
                            className="text-left font-medium hover:underline"
                            disabled={busy}
                            onClick={() =>
                              void act(async () => {
                                setSelected(
                                  await request(`/api/notices/${n.id}`),
                                );
                                setView("detail");
                              })
                            }
                          >
                            {n.title}
                          </button>
                          <time className="shrink-0 text-sm text-muted-foreground">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </time>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      아직 등록된 공지가 없습니다.
                    </CardContent>
                  </Card>
                )}
                <nav
                  aria-label="페이지"
                  className="mt-6 flex items-center justify-center gap-4"
                >
                  <Button
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage((v) => v - 1)}
                  >
                    이전
                  </Button>
                  <span>
                    {page + 1} / {Math.max(1, data.totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page + 1 >= data.totalPages}
                    onClick={() => setPage((v) => v + 1)}
                  >
                    다음
                  </Button>
                </nav>
              </>
            )
          )}
        </>
      )}
      {view === "login" && (
        <Card>
          <CardContent className="py-6">
            <h2 className="mb-5 text-xl font-semibold">관리자 로그인</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void act(async () => {
                  const result = await request("/api/auth/login", "POST", {
                    username: form.get("username"),
                    password: form.get("password"),
                  });
                  setToken(result.accessToken);
                  if (resumeEdit) {
                    setView("edit");
                    setResumeEdit(false);
                  } else home();
                });
              }}
            >
              <label className="block">
                아이디
                <Input name="username" autoComplete="username" required />
              </label>
              <label className="block">
                비밀번호
                <Input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </label>
              <p className="text-sm text-muted-foreground">
                로그인은 30분 동안 유지되며, 새로고침하면 다시 로그인해야
                합니다.
              </p>
              <Button disabled={busy} type="submit">
                {busy ? "로그인 중…" : "로그인"}
              </Button>
              <Button type="button" variant="ghost" onClick={home}>
                목록
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      {view === "edit" && (
        <form className="space-y-5" onSubmit={save}>
          <h2 className="text-xl font-semibold">
            {selected ? "공지 수정" : "새 공지 작성"}
          </h2>
          <label className="block" htmlFor="notice-title">
            제목
          </label>
          <Input
            id="notice-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
          <label className="block" htmlFor="notice-body">
            본문
          </label>
          <Textarea
            id="notice-body"
            className="min-h-64"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={10000}
          />
          <div className="flex gap-2">
            <Button disabled={busy || !token} type="submit">
              {busy ? "저장 중…" : "저장"}
            </Button>
            <Button
              disabled={busy}
              type="button"
              variant="outline"
              onClick={home}
            >
              취소
            </Button>
          </div>
          {!token && (
            <p>작성 내용은 남아 있습니다. 다시 로그인한 후 저장해 주세요.</p>
          )}
        </form>
      )}
      {view === "detail" && selected && (
        <article>
          <h2 className="text-2xl font-semibold">{selected.title}</h2>
          <p className="my-4 text-sm text-muted-foreground">
            등록 {new Date(selected.createdAt).toLocaleString()} · 수정{" "}
            {new Date(selected.updatedAt).toLocaleString()}
          </p>
          <div className="min-h-48 whitespace-pre-wrap break-words border-y py-6">
            {selected.body}
          </div>
          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={home}>
              목록
            </Button>
            {token && (
              <>
                <Button disabled={busy} onClick={() => edit(selected)}>
                  수정
                </Button>
                <Button
                  variant="destructive"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "이 공지를 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.",
                      )
                    )
                      void act(async () => {
                        await request(`/api/notices/${selected.id}`, "DELETE");
                        home();
                      });
                  }}
                >
                  삭제
                </Button>
              </>
            )}
          </div>
        </article>
      )}
      <footer className="mt-14 border-t pt-5 text-xs text-muted-foreground">
        Matt Pocock 스킬 매뉴얼 실제 실행 프로젝트
      </footer>
    </main>
  );
}


