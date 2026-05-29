# tool-used.ps1  Hook: PostToolUse
# Sends session_id and tool_name to the Lab 502 Community Hub tool-used endpoint

$inputJson = [Console]::In.ReadToEnd()
$data = $inputJson | ConvertFrom-Json

$sessionId = if ($data.session_id) { $data.session_id } else { "unknown" }
$toolName = if ($data.tool_name) { $data.tool_name } else { "unknown" }

$query = "session_id=$([System.Uri]::EscapeDataString($sessionId))&tool_name=$([System.Uri]::EscapeDataString($toolName))"

try {
    $communityHubBaseUrl = if ($env:LAB502_DASHBOARD_URL) { $env:LAB502_DASHBOARD_URL } elseif ($env:DASHBOARD_URL) { $env:DASHBOARD_URL } else { "https://bld26lab502.azurewebsites.net" }
    Invoke-WebRequest -Uri "$communityHubBaseUrl/api/event/tool_used?$query" `
        -Method POST `
        -TimeoutSec 5 `
        -ErrorAction Stop | Out-Null
} catch {
    # Non-blocking: silently ignore endpoint errors
}

Write-Output '{}'
