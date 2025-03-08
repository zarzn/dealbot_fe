#!/usr/bin/env pwsh
# Script to prepare for static build by moving dynamic API routes

$ErrorActionPreference = "Stop"

# Define paths
$srcPath = "$PSScriptRoot\..\src"
$apiPath = "$srcPath\app\api"
$backupPath = "$PSScriptRoot\..\api-backup"

Write-Host "Preparing for static build..." -ForegroundColor Cyan

# Create backup directory if it doesn't exist
if (-not (Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    Write-Host "Created backup directory: $backupPath" -ForegroundColor Green
}

# Check if API directory exists
if (Test-Path $apiPath) {
    Write-Host "API directory found at: $apiPath" -ForegroundColor Cyan
    
    # Move API directory to backup
    Write-Host "Moving API directory to backup..." -ForegroundColor Yellow
    if (Test-Path $backupPath\api) {
        Remove-Item -Path "$backupPath\api" -Recurse -Force
    }
    Copy-Item -Path $apiPath -Destination $backupPath -Recurse -Force
    
    # Remove API directory
    Remove-Item -Path $apiPath -Recurse -Force
    Write-Host "API directory moved to backup" -ForegroundColor Green
} else {
    Write-Host "No API directory found, skipping backup" -ForegroundColor Yellow
}

Write-Host "Static build preparation complete" -ForegroundColor Green 