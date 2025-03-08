#!/usr/bin/env pwsh
# Script to restore API routes after static build

$ErrorActionPreference = "Stop"

# Define paths
$srcPath = "$PSScriptRoot\..\src"
$apiPath = "$srcPath\app\api"
$backupPath = "$PSScriptRoot\..\api-backup\api"

Write-Host "Restoring API routes after build..." -ForegroundColor Cyan

# Check if backup API directory exists
if (Test-Path $backupPath) {
    Write-Host "API backup found at: $backupPath" -ForegroundColor Cyan
    
    # Create app directory if it doesn't exist
    $appDir = "$srcPath\app"
    if (-not (Test-Path $appDir)) {
        New-Item -ItemType Directory -Path $appDir -Force | Out-Null
        Write-Host "Created app directory: $appDir" -ForegroundColor Green
    }
    
    # Remove current API directory if it exists
    if (Test-Path $apiPath) {
        Remove-Item -Path $apiPath -Recurse -Force
    }
    
    # Restore API directory from backup
    Copy-Item -Path $backupPath -Destination $appDir -Recurse -Force
    Write-Host "API directory restored from backup" -ForegroundColor Green
} else {
    Write-Host "No API backup found at: $backupPath" -ForegroundColor Yellow
}

Write-Host "Restoration complete" -ForegroundColor Green 