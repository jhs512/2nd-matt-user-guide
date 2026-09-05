import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
class HashPassword { public static void main(String[] args) { System.out.print(new BCryptPasswordEncoder().encode(System.getenv("PASSWORD_TO_HASH"))); } }
