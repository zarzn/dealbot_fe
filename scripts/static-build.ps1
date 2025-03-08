#!/usr/bin/env pwsh
# Script for static build process that handles API routes

$ErrorActionPreference = "Stop"

# Define paths
$scriptPath = $PSScriptRoot
$rootPath = "$scriptPath\.."

Write-Host "Starting static build process..." -ForegroundColor Cyan

try {
    # Step 1: Prepare for static build by removing API routes
    Write-Host "Step 1: Preparing for static build..." -ForegroundColor Cyan
    & "$scriptPath\prepare-static-build.ps1"
    
    # Step 2: Run Next.js build with NODE_ENV set to production
    Write-Host "Step 2: Running Next.js build..." -ForegroundColor Cyan
    Set-Location -Path $rootPath
    
    # Explicitly set NODE_ENV to production for the build
    $env:NODE_ENV = "production"
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build process failed with exit code $LASTEXITCODE"
    }
    
    Write-Host "Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "Error during build process: $_" -ForegroundColor Red
} finally {
    # Step 3: Restore API routes
    Write-Host "Step 3: Restoring API routes..." -ForegroundColor Cyan
    & "$scriptPath\restore-after-build.ps1"
}

Write-Host "Static build process complete" -ForegroundColor Green 