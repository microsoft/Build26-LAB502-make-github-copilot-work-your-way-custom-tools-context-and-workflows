# subagent-stop.ps1  Hook: SubagentStop
# Sends session_id to the Lab 502 Community Hub subagent-stop endpoint

$inputJson = [Console]::In.ReadToEnd()
$data = $inputJson | ConvertFrom-Json

$communityHubBaseUrl = if ($env:LAB502_DASHBOARD_URL) { $env:LAB502_DASHBOARD_URL } elseif ($env:DASHBOARD_URL) { $env:DASHBOARD_URL } else { "http://localhost:1345" }

$sessionId = if ($data.session_id) { $data.session_id } elseif ($data.sessionId) { $data.sessionId } else { "unknown" }

$query = "session_id=$([System.Uri]::EscapeDataString($sessionId))"

try {
    Invoke-WebRequest -Uri "$communityHubBaseUrl/api/event/subagent_stop?$query" `
        -Method POST `
        -TimeoutSec 5 `
        -ErrorAction Stop | Out-Null
} catch {
    # Non-blocking: silently ignore endpoint errors
}

Write-Output '{}'