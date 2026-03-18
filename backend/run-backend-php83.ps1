$ErrorActionPreference = "Stop"

$php83 = "C:\Users\Jayro\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$port = 8000

if (-not (Test-Path $php83)) {
    Write-Host "PHP 8.3 was not found at:" -ForegroundColor Red
    Write-Host $php83 -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Update the path in run-backend-php83.ps1, then run it again." -ForegroundColor Yellow
    exit 1
}

Set-Location $PSScriptRoot

$serverPath = (Resolve-Path ".\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php").Path
$backendPath = $PSScriptRoot

$staleProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq "php.exe" -and $_.CommandLine -and (
        ($_.CommandLine -like "*artisan serve*--port=$port*") -or
        ($_.CommandLine -like "*-S 127.0.0.1:$port*" -and $_.CommandLine -like "*$serverPath*")
    )
}

if ($staleProcesses) {
    Write-Host "Stopping old Laravel server process(es) on port $port..." -ForegroundColor Yellow
    $staleProcesses | ForEach-Object {
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 1
}

Write-Host "Using PHP:" -ForegroundColor Cyan
& $php83 -v
Write-Host ""
Write-Host "Clearing stale Laravel caches..." -ForegroundColor Cyan
& $php83 artisan optimize:clear
Write-Host ""
Write-Host "Starting Laravel on http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor DarkGray
Write-Host ""

& $php83 artisan serve --no-reload --host=127.0.0.1 --port=$port
