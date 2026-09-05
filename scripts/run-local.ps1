param([int]$Port = 8080)
$ErrorActionPreference = 'Stop'
# Local demo only. Production uses a newly generated password hash and secret.
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:PORT = "$Port"
$env:ADMIN_USERNAME = 'admin'
$env:ADMIN_PASSWORD_HASH = '$2a$10$6PFSYhQab4sdL7ygBUkcsuwBJCp1R9Jiber6U38JnqBUJi/8sVdvS'
$env:JWT_SECRET = 'local-only-not-for-production-secret-0123456789'
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173'
Push-Location "$PSScriptRoot/../backend"
try { ./gradlew.bat bootRun } finally { Pop-Location }

