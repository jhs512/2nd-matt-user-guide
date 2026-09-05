package dev.notice

import jakarta.persistence.*
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.net.URI
import java.time.Instant

@Entity
class Notice(
    @Column(nullable = false, length = 100) var title: String = "",
    @Column(nullable = false, length = 10000) var body: String = "",
    @Column(nullable = false) val createdAt: Instant = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS),
    @Column(nullable = false) var updatedAt: Instant = createdAt,
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) var id: Long? = null,
)
interface Notices : JpaRepository<Notice, Long>
data class NoticeInput(val title: String, val body: String) {
    fun normalized(): NoticeInput {
        val value = NoticeInput(title.trim(), body.trim())
        if (value.title.length !in 1..100 || value.body.length !in 1..10000)
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "제목은 1–100자, 본문은 1–10000자로 입력해 주세요")
        return value
    }
}
data class NoticePage(val items: List<Notice>, val page: Int, val size: Int, val totalElements: Long, val totalPages: Int)

@RestController
@RequestMapping("/api/notices")
class NoticeController(private val notices: Notices) {
    @GetMapping fun list(@RequestParam(defaultValue = "0") page: Int): NoticePage {
        if (page < 0 || page > 1_000_000) throw ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 페이지입니다")
        val result = notices.findAll(PageRequest.of(page, 10, Sort.by(Sort.Direction.DESC, "createdAt", "id")))
        return NoticePage(result.content, page, 10, result.totalElements, result.totalPages)
    }
    @GetMapping("/{id}") fun get(@PathVariable id: Long): Notice = notices.findById(id).orElseThrow {
        ResponseStatusException(HttpStatus.NOT_FOUND, "공지를 찾을 수 없습니다")
    }
    @PostMapping fun create(@RequestBody input: NoticeInput): ResponseEntity<Notice> {
        val value = input.normalized()
        val saved = notices.save(Notice(value.title, value.body))
        return ResponseEntity.created(URI("/api/notices/${saved.id}")).body(saved)
    }
    @PutMapping("/{id}") @Transactional fun update(@PathVariable id: Long, @RequestBody input: NoticeInput): Notice {
        val value = input.normalized()
        return get(id).apply { title = value.title; body = value.body; updatedAt = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS) }
    }
    @DeleteMapping("/{id}") @Transactional fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        notices.delete(get(id))
        return ResponseEntity.noContent().build()
    }
}


