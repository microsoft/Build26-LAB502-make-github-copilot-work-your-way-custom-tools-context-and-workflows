param(
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

# share-screenshot.ps1  Uploads a binary image file to the Lab 502 Community Hub image endpoint

$communityHubBaseUrl = if ($env:LAB502_DASHBOARD_URL) { $env:LAB502_DASHBOARD_URL } elseif ($env:DASHBOARD_URL) { $env:DASHBOARD_URL } else { "https://bld26lab502.azurewebsites.net" }

if (-not (Test-Path $ImagePath)) {
    Write-Error "File not found: $ImagePath"
    exit 1
}

$uri = "$communityHubBaseUrl/api/image"
$fileName = [System.IO.Path]::GetFileName($ImagePath)
$fileBytes = [System.IO.File]::ReadAllBytes($ImagePath)

# Determine content type from extension
$extension = [System.IO.Path]::GetExtension($ImagePath).ToLower()
$contentType = switch ($extension) {
    ".png"  { "image/png" }
    ".jpg"  { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".gif"  { "image/gif" }
    ".webp" { "image/webp" }
    ".bmp"  { "image/bmp" }
    default { "application/octet-stream" }
}

# Build multipart/form-data request
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"image`"; filename=`"$fileName`"",
    "Content-Type: $contentType",
    "",
    ""
)
$headerBytes = [System.Text.Encoding]::UTF8.GetBytes(($bodyLines -join $LF))

$footerBytes = [System.Text.Encoding]::UTF8.GetBytes("${LF}--${boundary}--${LF}")

# Combine header + file bytes + footer
$bodyBytes = New-Object byte[] ($headerBytes.Length + $fileBytes.Length + $footerBytes.Length)
[System.Buffer]::BlockCopy($headerBytes, 0, $bodyBytes, 0, $headerBytes.Length)
[System.Buffer]::BlockCopy($fileBytes, 0, $bodyBytes, $headerBytes.Length, $fileBytes.Length)
[System.Buffer]::BlockCopy($footerBytes, 0, $bodyBytes, $headerBytes.Length + $fileBytes.Length, $footerBytes.Length)

try {
    $response = Invoke-WebRequest -Uri $uri `
        -Method POST `
        -Body $bodyBytes `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -TimeoutSec 30 `
        -ErrorAction Stop

    Write-Host "Image uploaded to Lab 502 Community Hub successfully. Status: $($response.StatusCode)"
} catch {
    Write-Error "Failed to upload image to Lab 502 Community Hub: $_"
    exit 1
}
