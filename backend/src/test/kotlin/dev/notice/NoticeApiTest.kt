package dev.notice
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.net.URI
import java.net.http.*
import tools.jackson.databind.json.JsonMapper
import kotlin.test.*
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class NoticeApiTest {
 @org.springframework.beans.factory.annotation.Autowired lateinit var encoder: org.springframework.security.oauth2.jwt.JwtEncoder
 private fun signed(roles: List<String>, expired: Boolean = false): String {
  val now = java.time.Instant.now()
  val claims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder().issuer("notice-board").subject("test").audience(listOf("notice-board"))
   .issuedAt(now.minusSeconds(7200)).expiresAt(if (expired) now.minusSeconds(3600) else now.plusSeconds(1800)).claim("roles", roles).build()
  return encoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(org.springframework.security.oauth2.jwt.JwsHeader.with(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build(), claims)).tokenValue
 }
 @Test fun `expired malformed and non-admin tokens cannot write`() {
  assertEquals(401, req("POST", "/api/notices", "{}", "tampered").statusCode())
  assertEquals(401, req("POST", "/api/notices", "{}", signed(listOf("ADMIN"), true)).statusCode())
  assertEquals(403, req("POST", "/api/notices", "{}", signed(listOf("USER"))).statusCode())
 }
 @Test fun `validation boundaries and pagination remain stable after edit`() {
  val token = signed(listOf("ADMIN"))
  fun payload(title: String, body: String) = json.writeValueAsString(mapOf("title" to title, "body" to body))
  assertEquals(400, req("POST", "/api/notices", payload("x".repeat(101), "body"), token).statusCode())
  assertEquals(400, req("POST", "/api/notices", payload("title", "x".repeat(10001)), token).statusCode())
  val paths = mutableListOf<String>()
  try {
   repeat(11) {
    val response = req("POST", "/api/notices", payload("x".repeat(100), "y".repeat(10000)), token)
    assertEquals(201, response.statusCode())
    paths += response.headers().firstValue("Location").orElseThrow()
   }
   val first = json.readTree(req("GET", "/api/notices").body())
   assertEquals(10, first.get("items").size())
   assertEquals(1, json.readTree(req("GET", "/api/notices?page=1").body()).get("items").size())
   val newestId = first.get("items").get(0).get("id")
   assertEquals(200, req("PUT", paths.first(), payload("edited oldest", "body"), token).statusCode())
   assertEquals(newestId, json.readTree(req("GET", "/api/notices").body()).get("items").get(0).get("id"))
   assertEquals(0, json.readTree(req("GET", "/api/notices?page=9999").body()).get("items").size())
  } finally { paths.forEach { req("DELETE", it, token = token) } }
 }
 @LocalServerPort var port: Int = 0
 private val client = HttpClient.newHttpClient()
 private val json = JsonMapper.builder().build()
 companion object {
  @JvmStatic @DynamicPropertySource fun credentials(r: DynamicPropertyRegistry) {
   r.add("app.admin-password-hash") { BCryptPasswordEncoder().encode("test-password")!! }
  }
 }
 private fun req(method: String, path: String, body: String? = null, token: String? = null): HttpResponse<String> {
  val b = HttpRequest.newBuilder(URI("http://localhost:$port$path")).header("Content-Type", "application/json")
  if (token != null) b.header("Authorization", "Bearer $token")
  return client.send(b.method(method, body?.let(HttpRequest.BodyPublishers::ofString) ?: HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.ofString())
 }
 @Test fun `browser receives CORS headers for allowed origin`() {
  val request = HttpRequest.newBuilder(URI("http://localhost:$port/api/auth/login"))
   .header("Origin", "http://localhost:5173").header("Access-Control-Request-Method", "POST")
   .header("Access-Control-Request-Headers", "content-type,authorization").method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build()
  val response = client.send(request, HttpResponse.BodyHandlers.ofString())
  assertEquals(200, response.statusCode())
  assertEquals("http://localhost:5173", response.headers().firstValue("Access-Control-Allow-Origin").orElse(""))
 }
 @Test fun `public errors and authenticated CRUD through HTTP`() {
  assertEquals(200, req("GET", "/api/notices").statusCode())
  assertEquals(400, req("GET", "/api/notices?page=-1").statusCode())
  assertEquals(404, req("GET", "/api/notices/999999").statusCode())
  assertEquals(401, req("POST", "/api/notices", "{}").statusCode())
  assertEquals(401, req("POST", "/api/auth/login", """{"username":"admin","password":"wrong"}""").statusCode())
  val login = req("POST", "/api/auth/login", """{"username":"admin","password":"test-password"}""")
  assertEquals(200, login.statusCode(), login.body())
  val token = json.readTree(login.body()).get("accessToken").asText()
  assertEquals(400, req("POST", "/api/notices", """{"title":"  ","body":"body"}""", token).statusCode())
  val created = req("POST", "/api/notices", """{"title":"  안내  ","body":"  본문  "}""", token)
  assertEquals(201, created.statusCode(), created.body())
  val path = created.headers().firstValue("Location").orElseThrow()
  val initial = json.readTree(created.body())
  assertEquals("안내", initial.get("title").asText())
  assertEquals("본문", initial.get("body").asText())
  val updated = req("PUT", path, """{"title":"수정","body":"새 본문"}""", token)
  assertEquals(200, updated.statusCode(), updated.body())
  assertEquals(initial.get("createdAt"), json.readTree(updated.body()).get("createdAt"))
  assertEquals("수정", json.readTree(req("GET", path).body()).get("title").asText())
  assertEquals(204, req("DELETE", path, token = token).statusCode())
  assertEquals(404, req("GET", path).statusCode())
 }
}


