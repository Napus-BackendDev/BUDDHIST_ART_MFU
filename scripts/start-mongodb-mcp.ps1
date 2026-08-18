$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot "backend\.env"

if (-not (Test-Path -LiteralPath $envFile)) {
    throw "MongoDB MCP startup failed: backend/.env was not found."
}

$mongoLine = Get-Content -LiteralPath $envFile |
    Where-Object { $_ -match '^\s*MONGODB\s*=' } |
    Select-Object -First 1

if (-not $mongoLine) {
    throw "MongoDB MCP startup failed: MONGODB is not configured in backend/.env."
}

$connectionString = ($mongoLine -split '=', 2)[1].Trim()
if (
    ($connectionString.StartsWith('"') -and $connectionString.EndsWith('"')) -or
    ($connectionString.StartsWith("'") -and $connectionString.EndsWith("'"))
) {
    $connectionString = $connectionString.Substring(1, $connectionString.Length - 2)
}

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    throw "MongoDB MCP startup failed: MONGODB in backend/.env is empty."
}

$env:MDB_MCP_CONNECTION_STRING = $connectionString
$env:MDB_MCP_READ_ONLY = "true"

& npx.cmd -y mongodb-mcp-server@latest --readOnly
exit $LASTEXITCODE
