# Run locally on the Windows account that performed deployment.
# This reads a Windows-encrypted credential outside the Git repository.
$ErrorActionPreference = 'Stop'
$credentialPath = Join-Path $env:USERPROFILE '.config/2nd-matt-user-guide/admin.credential.xml'
if (-not (Test-Path -LiteralPath $credentialPath)) {
    throw 'This computer does not have the encrypted production login file.'
}
$credential = Import-Clixml -LiteralPath $credentialPath
Write-Output "Username: $($credential.UserName)"
Write-Output "Password: $($credential.GetNetworkCredential().Password)"
