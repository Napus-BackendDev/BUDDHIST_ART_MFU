[CmdletBinding()]
param(
    [string]$StudentId = '6631503016',
    [string]$Email = '6631503016@lamduan.mfu.ac.th',
    [string]$SshUser = 'uatenv',
    [string]$Server = '192.168.11.90',
    [string]$Container = 'buddhist-art-backend-1'
)

$ErrorActionPreference = 'Stop'

$checkScript = Resolve-Path (Join-Path $PSScriptRoot '..\backend\scripts\checkAdminUser.js')
$remoteCommand = "docker exec -i $Container node - --student-id $StudentId --email $Email"

Get-Content -Raw -Encoding utf8 -LiteralPath $checkScript |
    & ssh "$SshUser@$Server" $remoteCommand

if ($LASTEXITCODE -ne 0) {
    throw "Remote admin-account check failed with SSH exit code $LASTEXITCODE."
}
