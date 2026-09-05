package dev.notice

import com.nimbusds.jose.jwk.source.ImmutableSecret
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.oauth2.core.*
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.*
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.bind.annotation.*
import org.springframework.web.cors.*
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import javax.crypto.spec.SecretKeySpec

@Configuration
class SecurityConfig(
    @Value("\${app.jwt-secret}") private val secret: String,
    @Value("\${app.cors-origins}") private val origins: String,
) {
    @Bean fun encoder(): JwtEncoder {
        require(secret.toByteArray().size >= 32) { "JWT secret must contain at least 32 bytes" }
        return NimbusJwtEncoder(ImmutableSecret(secret.toByteArray()))
    }
    @Bean fun decoder(): JwtDecoder {
        val decoder = NimbusJwtDecoder.withSecretKey(SecretKeySpec(secret.toByteArray(), "HmacSHA256"))
            .macAlgorithm(MacAlgorithm.HS256).build()
        val audience = OAuth2TokenValidator<Jwt> { token ->
            if (token.audience?.contains("notice-board") == true) OAuth2TokenValidatorResult.success()
            else OAuth2TokenValidatorResult.failure(OAuth2Error("invalid_token"))
        }
        decoder.setJwtValidator(DelegatingOAuth2TokenValidator(JwtValidators.createDefaultWithIssuer("notice-board"), audience))
        return decoder
    }
    @Bean fun security(http: HttpSecurity): SecurityFilterChain {
        val roles = JwtGrantedAuthoritiesConverter().apply { setAuthoritiesClaimName("roles"); setAuthorityPrefix("ROLE_") }
        val converter = JwtAuthenticationConverter().apply { setJwtGrantedAuthoritiesConverter(roles) }
        http.csrf { it.disable() }.cors { it.configurationSource(cors()) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll()
                it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                it.requestMatchers(HttpMethod.GET, "/api/notices/**", "/actuator/health", "/api/version").permitAll()
                it.requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                it.requestMatchers("/api/notices/**").hasRole("ADMIN")
                it.anyRequest().denyAll()
            }.oauth2ResourceServer { it.jwt { jwt -> jwt.jwtAuthenticationConverter(converter) } }
        return http.build()
    }
    @Bean fun cors(): CorsConfigurationSource = UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/**", CorsConfiguration().apply {
            allowedOrigins = origins.split(",").map(String::trim)
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowedHeaders = listOf("Content-Type", "Authorization")
            exposedHeaders = listOf("Location")
            allowCredentials = false
        })
    }
}

data class LoginInput(val username: String, val password: String)
@RestController
class LoginController(
    private val encoder: JwtEncoder,
    @Value("\${app.admin-username}") private val username: String,
    @Value("\${app.admin-password-hash}") private val passwordHash: String,
) {
    private val passwords = BCryptPasswordEncoder()
    @PostMapping("/api/auth/login") fun login(@RequestBody input: LoginInput): Map<String, Any> {
        val matches = passwords.matches(input.password, passwordHash)
        if (input.username != username || !matches) throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 정보를 확인해 주세요")
        val now = Instant.now()
        val claims = JwtClaimsSet.builder().issuer("notice-board").subject(username).audience(listOf("notice-board"))
            .issuedAt(now).expiresAt(now.plusSeconds(1800)).claim("roles", listOf("ADMIN")).build()
        val token = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
        return mapOf("accessToken" to token.tokenValue, "expiresIn" to 1800)
    }
}



