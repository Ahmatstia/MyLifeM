# Helper script to capture screenshot from connected Android device via ADB
param(
    [string]$ScreenName = "screen"
)

$targetDir = Join-Path $PSScriptRoot "..\screenshots"
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$devices = adb devices | Where-Object { $_ -match "\bdevice\b" -and $_ -notmatch "List of devices" }
if (-not $devices) {
    Write-Host "Tidak ada perangkat Android yang terhubung via ADB." -ForegroundColor Red
    Write-Host "Pastikan:" -ForegroundColor Yellow
    Write-Host "1. HP terhubung dengan kabel USB ke PC"
    Write-Host "2. 'USB Debugging' telah diaktifkan di Opsi Pengembang (Developer Options)"
    Write-Host "3. Berikan izin dialog 'Allow USB Debugging' di layar HP"
    exit 1
}

$outFile = Join-Path $targetDir "$ScreenName.png"
Write-Host "Mengambil screenshot untuk: $ScreenName..." -ForegroundColor Cyan
adb exec-out screencap -p > $outFile

if (Test-Path $outFile) {
    Write-Host "Screenshot berhasil disimpan ke: $outFile" -ForegroundColor Green
} else {
    Write-Host "Gagal mengambil screenshot." -ForegroundColor Red
}

