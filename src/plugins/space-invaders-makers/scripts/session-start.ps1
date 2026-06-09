# session-start.ps1  Hook: SessionStart
# Sends session_id and user_info to the Lab 502 Community Hub session-start endpoint

$inputJson = [Console]::In.ReadToEnd()
$data = $inputJson | ConvertFrom-Json

$sessionId = if ($data.session_id) { $data.session_id } else { "unknown" }
# When the OS username is the shared lab account, generate a random GUID on
# first run and persist it so every VM gets a unique user (synthetic identity). For other usernames, just use the OS username.
# This a workaround to get distinct users for each VM when the shared "LabUser" account is used
if ($env:USERNAME -eq 'LabUser') {
    $idFile = Join-Path $env:USERPROFILE '.lab502-user-id'
    if (Test-Path $idFile) {
        $userInfo = Get-Content $idFile -Raw
        $userInfo = $userInfo.Trim()
    } else {
        $userInfo = [guid]::NewGuid().ToString()
        $userInfo | Set-Content $idFile -NoNewline
    }
} else {
    $userInfo = if ($env:USERNAME) { $env:USERNAME } else { "unknown" }
}

$query = "session_id=$([System.Uri]::EscapeDataString($sessionId))&user_info=$([System.Uri]::EscapeDataString($userInfo))"

try {
    $communityHubBaseUrl = if ($env:LAB502_DASHBOARD_URL) { $env:LAB502_DASHBOARD_URL } elseif ($env:DASHBOARD_URL) { $env:DASHBOARD_URL } else { "http://localhost:1345" }
    Invoke-WebRequest -Uri "$communityHubBaseUrl/api/event/session_start?$query" `
        -Method POST `
        -TimeoutSec 5 `
        -ErrorAction Stop | Out-Null
} catch {
    # Non-blocking: silently ignore endpoint errors
}

Write-Output '{}'
