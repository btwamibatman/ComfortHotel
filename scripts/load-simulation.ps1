[CmdletBinding()]
param(
  [string]$BaseUrl = "http://localhost",
  [int]$ConcurrentUsers = 10,
  [int]$RequestsPerUser = 20,
  [int]$CpuStressSeconds = 15,
  [switch]$SkipCpuStress
)

$ErrorActionPreference = "Stop"

$endpoints = @(
  "/",
  "/rooms",
  "/booking",
  "/api/rooms",
  "/api/info"
)

Write-Host "Starting ComfortHotel load simulation..."
Write-Host "BaseUrl: $BaseUrl"
Write-Host "Concurrent users: $ConcurrentUsers"
Write-Host "Requests per user: $RequestsPerUser"

$jobs = 1..$ConcurrentUsers | ForEach-Object {
  Start-Job -ArgumentList $BaseUrl, $RequestsPerUser, $endpoints -ScriptBlock {
    param($BaseUrl, $RequestsPerUser, $endpoints)

    $success = 0
    $fail = 0

    for ($i = 0; $i -lt $RequestsPerUser; $i++) {
      $endpoint = $endpoints[$i % $endpoints.Count]
      try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl$endpoint" -TimeoutSec 10
        if ([int]$response.StatusCode -lt 500) {
          $success++
        } else {
          $fail++
        }
      } catch {
        $fail++
      }
    }

    [pscustomobject]@{
      Success = $success
      Fail = $fail
    }
  }
}

$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$totalSuccess = ($results | Measure-Object Success -Sum).Sum
$totalFail = ($results | Measure-Object Fail -Sum).Sum

Write-Host "HTTP load result: success=$totalSuccess fail=$totalFail"

if (-not $SkipCpuStress) {
  Write-Host "Starting short CPU stress inside app container for $CpuStressSeconds seconds..."
  $nodeScript = "const end=Date.now()+($CpuStressSeconds*1000); let x=0; while(Date.now()<end){ x += Math.sqrt(Math.random()*1000000); } console.log('cpu_stress_done', x.toFixed(2));"
  docker compose exec -T app node -e $nodeScript
}

Write-Host "Load simulation completed."
