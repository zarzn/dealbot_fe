# Test Production Build Script
# This script builds and tests the production build locally

# Parameters
param (
    [switch]$SkipBuild = $false,
    [switch]$SkipOptimize = $true,
    [int]$Port = 3000
)

# Set environment to production
$env:NODE_ENV = "production"

# Create .env.local from .env.production for testing
Write-Host "Creating .env.local from .env.production for testing..."
Copy-Item -Path ".env.production" -Destination ".env.local" -Force

# Build the application if not skipped
if (-not $SkipBuild) {
    Write-Host "Building the application in production mode..."
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
    
    Write-Host "Build completed successfully."
    
    # Run optimization if not skipped
    if (-not $SkipOptimize) {
        Write-Host "Running asset optimization..."
        npm run optimize
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Asset optimization failed with exit code $LASTEXITCODE"
            Write-Warning "Continuing with deployment despite optimization errors..."
        } else {
            Write-Host "Asset optimization completed successfully."
        }
    } else {
        Write-Host "Asset optimization skipped."
    }
}

# Start the application in production mode
Write-Host "Starting the application in production mode on port $Port..."
$env:PORT = $Port
npm start

# Note: The script will continue running until the server is stopped with Ctrl+C 