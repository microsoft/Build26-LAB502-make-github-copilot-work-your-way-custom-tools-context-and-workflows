# user-prompt-submitted.ps1  Hook: UserPromptSubmit
# Sends session_id to the Lab 502 Community Hub prompt-submitted endpoint

$inputJson = [Console]::In.ReadToEnd()
$data = $inputJson | ConvertFrom-Json

$sessionId = if ($data.session_id) { $data.session_id } else { "unknown" }

$query = "session_id=$([System.Uri]::EscapeDataString($sessionId))"

try {
    $communityHubBaseUrl = if ($env:LAB502_DASHBOARD_URL) { $env:LAB502_DASHBOARD_URL } elseif ($env:DASHBOARD_URL) { $env:DASHBOARD_URL } else { "http://localhost:1345" }
    Invoke-WebRequest -Uri "$communityHubBaseUrl/api/event/user_prompt_submitted?$query" `
        -Method POST `
        -TimeoutSec 5 `
        -ErrorAction Stop | Out-Null
} catch {
    # Non-blocking: silently ignore endpoint errors
}

Write-Output '{}'
