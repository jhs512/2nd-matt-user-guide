package dev.notice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class NoticeBoardApplication

fun main(args: Array<String>) {
	runApplication<NoticeBoardApplication>(*args)
}
