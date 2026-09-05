// Runs against a real started server. The caller selects local H2 or PostgreSQL.
import assert from 'node:assert/strict'
const base = process.env.SMOKE_API_URL ?? 'http://localhost:8081'
const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: process.env.SMOKE_USERNAME ?? 'admin', password: process.env.SMOKE_PASSWORD ?? 'local-demo-password' }) })
assert.equal(login.status, 200)
const { accessToken } = await login.json()
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }
const created = await fetch(`${base}/api/notices`, { method: 'POST', headers, body: JSON.stringify({ title: '실제 DB 확인', body: '스모크 테스트' }) })
assert.equal(created.status, 201)
const notice = await created.json()
const url = `${base}/api/notices/${notice.id}`
try {
 const read = await fetch(url)
 assert.equal(read.status, 200)
 assert.equal((await read.json()).createdAt, notice.createdAt)
 const updated = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ title: '수정 확인', body: 'DB 저장 완료' }) })
 assert.equal(updated.status, 200)
 assert.equal((await updated.json()).createdAt, notice.createdAt)
} finally {
 const removed = await fetch(url, { method: 'DELETE', headers })
 assert.equal(removed.status, 204)
}
assert.equal((await fetch(url)).status, 404)
console.log('PASS: real database create/read/update/delete; createdAt preserved; deleted item returns 404')
