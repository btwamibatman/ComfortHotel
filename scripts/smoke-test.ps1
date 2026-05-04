[CmdletBinding()]
param(
  [string]$BaseUrl = "http://localhost",
  [string]$PrometheusUrl = "http://localhost:9090",
  [string]$GrafanaUrl = "http://localhost:3001",
  [string]$AdminUsername = "",
  [string]$AdminPassword = "",
  [string]$ManagerUsername = "",
  [string]$ManagerPassword = ""
)

$ErrorActionPreference = "Stop"

$script:Failures = 0
$script:CreatedBookingIds = @()
$script:CreatedContactIds = @()
$script:CreatedRoomIds = @()

function Get-DotEnvValue {
  param([string]$Name)

  $envPath = Join-Path (Get-Location) ".env"
  if (-not (Test-Path -LiteralPath $envPath)) {
    return ""
  }

  $line = Get-Content -LiteralPath $envPath |
    Where-Object { $_ -match "^\s*$Name\s*=" } |
    Select-Object -First 1

  if (-not $line) {
    return ""
  }

  return (($line -split "=", 2)[1]).Trim().Trim('"').Trim("'")
}

function Resolve-SmokeSetting {
  param(
    [string]$Name,
    [string]$ProvidedValue,
    [string]$Fallback = ""
  )

  if ($ProvidedValue) {
    return $ProvidedValue
  }

  $environmentValue = [Environment]::GetEnvironmentVariable($Name)
  if ($environmentValue) {
    return $environmentValue
  }

  $dotEnvValue = Get-DotEnvValue $Name
  if ($dotEnvValue) {
    return $dotEnvValue
  }

  if ($Fallback) {
    return $Fallback
  }

  throw "$Name is required. Set it in the environment, .env, or pass it as a script parameter."
}

$AdminUsername = Resolve-SmokeSetting "ADMIN_USERNAME" $AdminUsername "admin"
$AdminPassword = Resolve-SmokeSetting "ADMIN_PASSWORD" $AdminPassword
$ManagerUsername = Resolve-SmokeSetting "MANAGER_USERNAME" $ManagerUsername "manager"
$ManagerPassword = Resolve-SmokeSetting "MANAGER_PASSWORD" $ManagerPassword

function Write-Check {
  param(
    [string]$Name,
    [bool]$Passed,
    [object]$Status = "",
    [string]$Detail = ""
  )

  $mark = if ($Passed) { "PASS" } else { "FAIL" }
  $statusText = if ($Status -ne "") { " | $Status" } else { "" }
  $detailText = if ($Detail) { " | $Detail" } else { "" }
  Write-Host "$mark | $Name$statusText$detailText"

  if (-not $Passed) {
    $script:Failures += 1
  }
}

function Invoke-SmokeRequest {
  param(
    [string]$Name,
    [string]$Uri,
    [string]$Method = "GET",
    [object]$Body = $null,
    [string]$ContentType = "",
    [Microsoft.PowerShell.Commands.WebRequestSession]$Session = $null,
    [int[]]$ExpectedStatus = @(200),
    [string]$Contains = ""
  )

  $params = @{
    Uri = $Uri
    Method = $Method
    UseBasicParsing = $true
    ErrorAction = "Stop"
  }

  if ($null -ne $Body) {
    $params.Body = $Body
  }
  if ($ContentType) {
    $params.ContentType = $ContentType
  }
  if ($null -ne $Session) {
    $params.WebSession = $Session
  }

  try {
    $response = Invoke-WebRequest @params
    $contentOk = $true
    if ($Contains) {
      $contentOk = $response.Content.Contains($Contains)
    }

    $passed = ($ExpectedStatus -contains [int]$response.StatusCode) -and $contentOk
    $detail = if ($Contains) { "contains '$Contains'=$contentOk" } else { "" }
    Write-Check $Name $passed $response.StatusCode $detail
    return $response
  } catch {
    $status = "ERROR"
    if ($_.Exception.Response) {
      $status = [int]$_.Exception.Response.StatusCode
    }

    $passed = $ExpectedStatus -contains $status
    Write-Check $Name $passed $status $_.Exception.Message
    return $null
  }
}

function Remove-TestData {
  param(
    [Microsoft.PowerShell.Commands.WebRequestSession]$AdminSession
  )

  foreach ($id in $script:CreatedBookingIds | Select-Object -Unique) {
    try {
      Invoke-WebRequest -Uri "$BaseUrl/api/bookings/$id" -Method Delete -WebSession $AdminSession -UseBasicParsing | Out-Null
    } catch {
      Write-Check "Cleanup booking $id" $false "ERROR" $_.Exception.Message
    }
  }

  foreach ($id in $script:CreatedContactIds | Select-Object -Unique) {
    try {
      Invoke-WebRequest -Uri "$BaseUrl/api/contacts/$id" -Method Delete -WebSession $AdminSession -UseBasicParsing | Out-Null
    } catch {
      Write-Check "Cleanup contact $id" $false "ERROR" $_.Exception.Message
    }
  }

  foreach ($id in $script:CreatedRoomIds | Select-Object -Unique) {
    try {
      Invoke-WebRequest -Uri "$BaseUrl/api/rooms/$id" -Method Delete -WebSession $AdminSession -UseBasicParsing | Out-Null
    } catch {
      Write-Check "Cleanup room $id" $false "ERROR" $_.Exception.Message
    }
  }
}

function Test-PrometheusTargets {
  $wantedJobs = @("backend", "product-service", "order-service", "chat-service", "auth-service")
  $targetsJson = $null
  $responseStatus = ""

  for ($attempt = 1; $attempt -le 6; $attempt++) {
    try {
      $response = Invoke-WebRequest -Uri "$PrometheusUrl/api/v1/targets" -UseBasicParsing
      $responseStatus = $response.StatusCode
      $targetsJson = $response.Content | ConvertFrom-Json
      $allReady = $true

      foreach ($job in $wantedJobs) {
        $targets = @($targetsJson.data.activeTargets | Where-Object { $_.labels.job -eq $job })
        if (($targets.Count -eq 0) -or (@($targets | Where-Object { $_.health -eq "up" }).Count -ne $targets.Count)) {
          $allReady = $false
          break
        }
      }

      if ($allReady) {
        break
      }

      Start-Sleep -Seconds 10
    } catch {
      if ($attempt -eq 6) {
        Write-Check "Prometheus targets" $false "ERROR" $_.Exception.Message
        return
      }
      Start-Sleep -Seconds 10
    }
  }

  foreach ($job in $wantedJobs) {
    $targets = @($targetsJson.data.activeTargets | Where-Object { $_.labels.job -eq $job })
    $upTargets = @($targets | Where-Object { $_.health -eq "up" })
    $passed = ($targets.Count -gt 0) -and ($targets.Count -eq $upTargets.Count)
    $health = ($targets | ForEach-Object { $_.health }) -join ","
    Write-Check "Prometheus target $job" $passed $responseStatus "count=$($targets.Count); health=$health"
  }
}

function Test-InternalServices {
  $nodeScript = @'
const services = ['product-service', 'order-service', 'chat-service', 'auth-service'];

(async () => {
  for (const service of services) {
    for (const path of ['/health', '/metrics']) {
      const response = await fetch(`http://${service}:3000${path}`);
      console.log(`${service}${path} ${response.status}`);
    }
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

  try {
    $output = $nodeScript | docker compose exec -T app node
    foreach ($line in ($output -split "`n" | Where-Object { $_.Trim() })) {
      $trimmed = $line.Trim()
      $parts = $trimmed -split " "
      $passed = ($parts.Count -eq 2) -and ($parts[1] -eq "200")
      Write-Check "Internal $trimmed" $passed
    }
  } catch {
    Write-Check "Internal service health/metrics" $false "ERROR" $_.Exception.Message
  }
}

function Test-DirectAppRoutes {
  $nodeScript = @'
(async () => {
  const checks = [
    ['/auth/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'placeholder-user', password: 'placeholder-password' })
    }, 404],
    ['/api/rooms', {}, 404],
    ['/api/bookings', {}, 404],
    ['/api/contacts', {}, 404],
    ['/api/info', {}, 200]
  ];

  for (const [path, options, expected] of checks) {
    const response = await fetch(`http://127.0.0.1:3000${path}`, options);
    const mark = response.status === expected ? 'PASS' : 'FAIL';
    console.log(`${mark} ${path} status=${response.status} expected=${expected}`);
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
'@

  try {
    $output = $nodeScript | docker compose exec -T app node
    foreach ($line in ($output -split "`n" | Where-Object { $_.Trim() })) {
      $trimmed = $line.Trim()
      Write-Check "Direct app $trimmed" ($trimmed.StartsWith("PASS "))
    }
  } catch {
    Write-Check "Direct app route split checks" $false "ERROR" $_.Exception.Message
  }
}

$adminSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$managerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$bookingEmail = "migration.smoke.booking@example.com"
$dashboardBookingEmail = "migration.smoke.dashboard.booking@example.com"
$contactEmail = "migration.smoke.contact@example.com"
$roomType = "migration-smoke-room"

try {
  Invoke-SmokeRequest "Web UI /" "$BaseUrl/" | Out-Null
  Invoke-SmokeRequest "Web UI /rooms" "$BaseUrl/rooms" -Contains "Single Room" | Out-Null
  Invoke-SmokeRequest "Web UI /booking" "$BaseUrl/booking" | Out-Null
  Invoke-SmokeRequest "Web UI /admin/login page" "$BaseUrl/admin/login" | Out-Null
  Invoke-SmokeRequest "Web UI /staff/login page" "$BaseUrl/staff/login" | Out-Null

  $adminLoginBody = @{ username = $AdminUsername; password = $AdminPassword } | ConvertTo-Json
  Invoke-SmokeRequest "Auth admin login" "$BaseUrl/auth/admin/login" -Method "POST" -Body $adminLoginBody -ContentType "application/json" -Session $adminSession | Out-Null
  Invoke-SmokeRequest "Auth status with admin cookie" "$BaseUrl/api/auth/status" -Session $adminSession -Contains "authenticated" | Out-Null
  Invoke-SmokeRequest "Admin dashboard with cookie" "$BaseUrl/admin/dashboard" -Session $adminSession | Out-Null

  $managerLoginBody = @{ username = $ManagerUsername; password = $ManagerPassword } | ConvertTo-Json
  Invoke-SmokeRequest "Auth staff login" "$BaseUrl/auth/staff/login" -Method "POST" -Body $managerLoginBody -ContentType "application/json" -Session $managerSession | Out-Null
  Invoke-SmokeRequest "Staff dashboard with cookie" "$BaseUrl/staff/dashboard" -Session $managerSession | Out-Null

  Invoke-SmokeRequest "Public API rooms" "$BaseUrl/api/rooms" -Contains "Single Room" | Out-Null
  Invoke-SmokeRequest "Product contract room by type" "$BaseUrl/api/rooms/type/single" -Contains "price" | Out-Null
  Invoke-SmokeRequest "Protected bookings without cookie" "$BaseUrl/api/bookings" -ExpectedStatus @(401) | Out-Null
  Invoke-SmokeRequest "Protected bookings with admin cookie" "$BaseUrl/api/bookings" -Session $adminSession | Out-Null
  Invoke-SmokeRequest "Protected contacts without cookie" "$BaseUrl/api/contacts" -ExpectedStatus @(401) | Out-Null

  $existingRooms = Invoke-SmokeRequest "List rooms before dashboard room CRUD" "$BaseUrl/api/rooms" -Session $adminSession
  if ($existingRooms) {
    $rooms = $existingRooms.Content | ConvertFrom-Json
    foreach ($room in @($rooms | Where-Object { $_.type -eq $roomType })) {
      if ($room._id) {
        $script:CreatedRoomIds += $room._id
      }
    }
  }
  Remove-TestData $adminSession
  $script:CreatedRoomIds = @()

  $roomBody = @{
    type = $roomType
    name = "Migration Smoke Room"
    price = 77
    count = 1
  } | ConvertTo-Json
  $roomCreate = Invoke-SmokeRequest "Admin create room" "$BaseUrl/api/rooms" -Method "POST" -Body $roomBody -ContentType "application/json" -Session $adminSession -ExpectedStatus @(201) -Contains "id"
  if ($roomCreate) {
    $roomJson = $roomCreate.Content | ConvertFrom-Json
    if ($roomJson.id) {
      $script:CreatedRoomIds += $roomJson.id
    }
  }

  $roomForbidden = @{
    type = "manager-smoke-room"
    name = "Manager Smoke Room"
    price = 88
    count = 1
  } | ConvertTo-Json
  Invoke-SmokeRequest "Staff cannot create room" "$BaseUrl/api/rooms" -Method "POST" -Body $roomForbidden -ContentType "application/json" -Session $managerSession -ExpectedStatus @(403) | Out-Null

  if ($script:CreatedRoomIds.Count -gt 0) {
    $roomUpdateBody = @{
      type = $roomType
      name = "Migration Smoke Room Updated"
      price = 79
      count = 2
    } | ConvertTo-Json
    Invoke-SmokeRequest "Admin update room" "$BaseUrl/api/rooms/$($script:CreatedRoomIds[0])" -Method "PUT" -Body $roomUpdateBody -ContentType "application/json" -Session $adminSession | Out-Null
    Invoke-SmokeRequest "Product contract updated smoke room" "$BaseUrl/api/rooms/type/$roomType" -Contains "79" | Out-Null
  }

  $bookingBody = @{
    roomType = "single"
    guestName = "Migration Smoke Booking"
    guestEmail = $bookingEmail
    guestPhone = "+15551234567"
    checkInDate = "2026-05-15"
    checkOutDate = "2026-05-17"
    numberOfGuests = 1
    specialRequests = "smoke test cleanup"
  } | ConvertTo-Json

  $bookingResponse = Invoke-SmokeRequest "Create public booking" "$BaseUrl/api/bookings/public" -Method "POST" -Body $bookingBody -ContentType "application/json" -ExpectedStatus @(201) -Contains "id"
  if ($bookingResponse) {
    $bookingJson = $bookingResponse.Content | ConvertFrom-Json
    if ($bookingJson.id) {
      $script:CreatedBookingIds += $bookingJson.id
    }
  }

  $bookingList = Invoke-SmokeRequest "List created booking by email" "$BaseUrl/api/bookings?guestEmail=$bookingEmail" -Session $adminSession
  if ($bookingList) {
    $rows = $bookingList.Content | ConvertFrom-Json
    foreach ($row in @($rows)) {
      if ($row._id) {
        $script:CreatedBookingIds += $row._id
      }
    }
  }

  $dashboardBookingBody = @{
    roomType = "single"
    guestName = "Dashboard Staff Booking"
    guestEmail = $dashboardBookingEmail
    guestPhone = "+15559876543"
    checkInDate = "2026-05-18"
    checkOutDate = "2026-05-19"
    numberOfGuests = 1
    specialRequests = "dashboard smoke test cleanup"
  } | ConvertTo-Json

  $dashboardBookingResponse = Invoke-SmokeRequest "Staff create booking" "$BaseUrl/api/bookings" -Method "POST" -Body $dashboardBookingBody -ContentType "application/json" -Session $managerSession -ExpectedStatus @(201) -Contains "id"
  $dashboardBookingId = $null
  if ($dashboardBookingResponse) {
    $dashboardBookingJson = $dashboardBookingResponse.Content | ConvertFrom-Json
    $dashboardBookingId = $dashboardBookingJson.id
    if ($dashboardBookingId) {
      $script:CreatedBookingIds += $dashboardBookingId
    }
  }

  if ($dashboardBookingId) {
    $statusBody = @{ status = "confirmed" } | ConvertTo-Json
    Invoke-SmokeRequest "Staff change booking status" "$BaseUrl/api/bookings/$dashboardBookingId/status" -Method "PATCH" -Body $statusBody -ContentType "application/json" -Session $managerSession | Out-Null
    Invoke-SmokeRequest "Staff cannot delete booking" "$BaseUrl/api/bookings/$dashboardBookingId" -Method "DELETE" -Session $managerSession -ExpectedStatus @(403) | Out-Null
  }

  $contactForm = @{
    name = "Migration Smoke Contact"
    email = $contactEmail
    message = "smoke test cleanup"
  }
  Invoke-SmokeRequest "Submit contact form through Web UI" "$BaseUrl/contact" -Method "POST" -Body $contactForm -ContentType "application/x-www-form-urlencoded" | Out-Null

  $contactList = Invoke-SmokeRequest "List created contact by email" "$BaseUrl/api/contacts?email=$contactEmail" -Session $adminSession
  if ($contactList) {
    $contacts = $contactList.Content | ConvertFrom-Json
    foreach ($contact in @($contacts)) {
      if ($contact._id) {
        $script:CreatedContactIds += $contact._id
      }
    }
  }

  Remove-TestData $adminSession
  $script:CreatedBookingIds = @()
  $script:CreatedContactIds = @()
  $script:CreatedRoomIds = @()

  Invoke-SmokeRequest "Grafana health" "$GrafanaUrl/api/health" | Out-Null
  Test-PrometheusTargets
  Test-InternalServices
  Test-DirectAppRoutes
} finally {
  Remove-TestData $adminSession
}

if ($script:Failures -gt 0) {
  Write-Host "Smoke test failed: $script:Failures check(s) failed."
  exit 1
}

Write-Host "Smoke test passed."
