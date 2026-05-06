[CmdletBinding()]
param(
  [string[]]$Containers = @(
    "comforthotel-app",
    "comforthotel-auth-service",
    "comforthotel-product-service",
    "comforthotel-order-service",
    "comforthotel-chat-service",
    "comforthotel-gateway",
    "comforthotel-postgres-app",
    "comforthotel-postgres-product",
    "comforthotel-postgres-order",
    "comforthotel-postgres-chat"
  ),
  [int]$Tail = 300,
  [int]$RestartThreshold = 3,
  [string]$Since = "",
  [switch]$FailOnFinding
)

$ErrorActionPreference = "Stop"

$patterns = @(
  [pscustomobject]@{
    Name = "Database connection failure"
    Severity = "critical"
    Regex = "(?i)(ENOTFOUND|ECONNREFUSED|ETIMEDOUT|getaddrinfo|password authentication failed|database .* does not exist|database system is starting up|connection terminated|no pg_hba\.conf|remaining connection slots)"
    Suggestion = "Check DATABASE_URL, PostgreSQL container health, credentials, and Docker service DNS name."
  },
  [pscustomobject]@{
    Name = "Gateway upstream failure"
    Severity = "warning"
    Regex = "(?i)(502 Bad Gateway|upstream.*(failed|unavailable|connection refused)|connect\(\) failed)"
    Suggestion = "Check the upstream microservice health and Nginx route configuration."
  },
  [pscustomobject]@{
    Name = "Unhandled application exception"
    Severity = "warning"
    Regex = "(?i)(Unhandled error|UnhandledPromiseRejection|TypeError|ReferenceError|SyntaxError|500 Internal Server Error)"
    Suggestion = "Inspect the stack trace near the matched line and reproduce the failing request."
  }
)

function Invoke-Docker {
  param([string[]]$Arguments)

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & docker @Arguments 2>&1
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  return @{
    ExitCode = $LASTEXITCODE
    Output = @($output)
  }
}

function Get-ContainerState {
  param([string]$Container)

  $inspect = Invoke-Docker @("inspect", "--format", "{{json .State}}", $Container)
  if ($inspect.ExitCode -ne 0) {
    return $null
  }

  $restartCount = Invoke-Docker @("inspect", "--format", "{{.RestartCount}}", $Container)
  $state = ($inspect.Output -join "`n") | ConvertFrom-Json

  return [pscustomobject]@{
    Status = $state.Status
    Running = [bool]$state.Running
    Restarting = [bool]$state.Restarting
    Health = if ($state.Health) { $state.Health.Status } else { "n/a" }
    RestartCount = [int](($restartCount.Output | Select-Object -First 1).ToString())
    Error = $state.Error
  }
}

function Get-ContainerLogs {
  param([string]$Container)

  $args = @("logs", "--tail", "$Tail")
  if ($Since) {
    $args += @("--since", $Since)
  }
  $args += $Container

  $logs = Invoke-Docker $args
  if ($logs.ExitCode -ne 0) {
    return @()
  }

  return @($logs.Output | ForEach-Object { $_.ToString() })
}

$findings = New-Object System.Collections.Generic.List[object]

Write-Host "ComfortHotel automated log inspection"
Write-Host "Containers: $($Containers -join ', ')"
Write-Host "Tail: $Tail lines per container"
if ($Since) {
  Write-Host "Since: $Since"
}
Write-Host ""

$dockerInfo = Invoke-Docker @("info", "--format", "{{json .ServerVersion}}")
if ($dockerInfo.ExitCode -ne 0) {
  $sample = ($dockerInfo.Output | Select-Object -First 1).ToString()
  $findings.Add([pscustomobject]@{
    Container = "docker-engine"
    Finding = "Docker daemon unavailable"
    Severity = "critical"
    Evidence = $sample
    Suggestion = "Start Docker Desktop or the Docker service, then rerun this inspection."
  })
}

if ($dockerInfo.ExitCode -eq 0) {
  foreach ($container in $Containers) {
    $state = Get-ContainerState $container
    if (-not $state) {
      $findings.Add([pscustomobject]@{
        Container = $container
        Finding = "Container not found"
        Severity = "warning"
        Evidence = "docker inspect failed"
        Suggestion = "Run docker compose ps and verify the expected service name."
      })
      continue
    }

    $hasRepeatedUnhealthyRestarts = $state.RestartCount -ge $RestartThreshold -and $state.Health -ne "healthy"
    if ($state.Restarting -or $state.Status -eq "restarting" -or $hasRepeatedUnhealthyRestarts) {
      $findings.Add([pscustomobject]@{
        Container = $container
        Finding = "Service restart loop"
        Severity = "critical"
        Evidence = "status=$($state.Status); restarting=$($state.Restarting); restart_count=$($state.RestartCount); health=$($state.Health)"
        Suggestion = "Run docker logs $container and inspect startup errors, database connectivity, and healthcheck failures."
      })
    }

    $logs = Get-ContainerLogs $container
    foreach ($pattern in $patterns) {
      $matches = @($logs | Select-String -Pattern $pattern.Regex)
      if ($matches.Count -gt 0) {
        $sample = ($matches | Select-Object -First 1).Line.Trim()
        if ($sample.Length -gt 180) {
          $sample = $sample.Substring(0, 180) + "..."
        }

        $findings.Add([pscustomobject]@{
          Container = $container
          Finding = $pattern.Name
          Severity = $pattern.Severity
          Evidence = "$($matches.Count) match(es); sample: $sample"
          Suggestion = $pattern.Suggestion
        })
      }
    }
  }
}

if ($findings.Count -eq 0) {
  Write-Host "No known failure patterns found."
  exit 0
}

Write-Host "Findings:"
$findings |
  Sort-Object Severity, Container, Finding |
  Format-Table Container, Severity, Finding, Evidence -Wrap -AutoSize

Write-Host ""
Write-Host "Suggested next actions:"
$findings |
  Select-Object Container, Finding, Suggestion -Unique |
  Format-Table Container, Finding, Suggestion -Wrap -AutoSize

if ($FailOnFinding) {
  exit 2
}
