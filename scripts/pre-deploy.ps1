param(
    [string]$EnvFile = "$PSScriptRoot\..\.env",
    [string]$TemplateFile = "$PSScriptRoot\..\.env.template"
)

# 1. Validation of environment variables before deployment
Write-Host "Running Pre-Deployment Checks..." -ForegroundColor Cyan

if (-Not (Test-Path $EnvFile)) {
    Write-Host "Error: Environment file $EnvFile does not exist. Please copy .env.template to .env and fill in the values." -ForegroundColor Red
    exit 1
}

# 2. Use of template-based configuration files to enforce correctness
if (-Not (Test-Path $TemplateFile)) {
    Write-Host "Error: Template file $TemplateFile does not exist." -ForegroundColor Red
    exit 1
}

Write-Host "Validating environment variables against template..."
$requiredKeys = Select-String -Path $TemplateFile -Pattern '^([A-Z0-9_]+)=' | ForEach-Object { $_.Matches.Groups[1].Value }

$envContent = Get-Content $EnvFile
$envDict = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^#][A-Z0-9_]+)=(.*)$') {
        $envDict[$matches[1]] = $matches[2]
    }
}

$hasErrors = $false

foreach ($key in $requiredKeys) {
    if (-Not $envDict.ContainsKey($key)) {
        Write-Host "Error: Missing required environment variable: $key" -ForegroundColor Red
        $hasErrors = $true
    } elseif ([string]::IsNullOrWhiteSpace($envDict[$key])) {
        Write-Host "Error: Environment variable $key is empty." -ForegroundColor Red
        $hasErrors = $true
    }
}

if ($hasErrors) {
    Write-Host "Environment validation failed." -ForegroundColor Red
    exit 1
}

# 3a. Pre-deployment checks for Database connection strings
Write-Host "Validating Database Connection Strings..."
$dbUrl = $envDict['DATABASE_URL']
if ($dbUrl -notmatch '^postgres(ql)?://([^:]+):([^@]+)@([^:]+):(\d+)?/(.*)$' -and $dbUrl -notmatch '^postgres(ql)?://([^:]+)@([^:]+):(\d+)/(.*)$' -and $dbUrl -notmatch '^postgres(ql)?://([^:]+)@([^/]+)/(.*)$' -and $dbUrl -notmatch '^postgres(ql)?://([^:]+):([^@]+)@([^/]+)/(.*)$') {
    # Basic check for Postgres URI protocol scheme
    if ($dbUrl -notmatch '^postgres(ql)?://(.*)$') {
        Write-Host "Error: DATABASE_URL does not match expected PostgreSQL connection string format (postgres://...)." -ForegroundColor Red
        $hasErrors = $true
    } else {
        Write-Host "DATABASE_URL format is assumed valid (Postgres URI found)." -ForegroundColor Green
    }
} else {
    Write-Host "DATABASE_URL format is valid." -ForegroundColor Green
}

# 3b. Pre-deployment checks for Service endpoints
Write-Host "Validating Service Endpoints..."
$serviceEndpoints = @('PRODUCT_SERVICE_URL', 'CHAT_SERVICE_URL')

foreach ($service in $serviceEndpoints) {
    $url = $envDict[$service]
    if ($null -ne $url) {
        try {
            $uri = [System.Uri]::new($url)
            if ($uri.Scheme -notmatch '^https?$') {
                Write-Host "Error: $service must be an HTTP/HTTPS URL. Got: $url" -ForegroundColor Red
                $hasErrors = $true
            } else {
                Write-Host "$service endpoint format is valid: $url" -ForegroundColor Green
            }
        } catch {
            Write-Host "Error: $service ($url) is not a valid URI." -ForegroundColor Red
            $hasErrors = $true
        }
    }
}

if ($hasErrors) {
    Write-Host "Pre-deployment checks failed. Please fix the configuration before deploying." -ForegroundColor Red
    exit 1
} else {
    Write-Host "All pre-deployment checks passed successfully!" -ForegroundColor Green
}
