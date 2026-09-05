package dev.notice

import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@Configuration
@Profile("local")
class LocalExamples {
 @Bean fun examples(notices: Notices) = CommandLineRunner {
  if (notices.count() == 0L) notices.save(Notice("서비스 이용 안내", "공지사항 게시판에 오신 것을 환영합니다. 이 글은 로컬 실습에서만 생성됩니다."))
 }
}
@RestController
class VersionController(@Value("\${APP_REVISION:local}") private val revision: String) {
 @GetMapping("/api/version") fun version() = mapOf("revision" to revision)
}
