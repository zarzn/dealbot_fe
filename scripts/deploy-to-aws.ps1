# Deploy to AWS Script
# This script deploys the application to AWS S3 and invalidates CloudFront cache

# Parameters
param (
    [string]$BucketName = "agentic-deals-frontend",
    [string]$Region = "us-east-1",
    [string]$DistributionId = "",
    [switch]$SkipBuild = $false,
    [switch]$SkipOptimize = $true
)

# Validate parameters
if ([string]::IsNullOrEmpty($DistributionId)) {
    Write-Warning "CloudFront distribution ID not provided. Cache invalidation will be skipped."
}

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "AWS CLI is installed: $awsVersion"
}
catch {
    Write-Error "AWS CLI is not installed. Please install it first."
    exit 1
}

# Check if AWS credentials are configured
try {
    $awsIdentity = aws sts get-caller-identity | ConvertFrom-Json
    Write-Host "AWS credentials are configured for account: $($awsIdentity.Account)"
}
catch {
    Write-Error "AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
}

# Set environment to production
$env:NODE_ENV = "production"

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

# Deploy to S3
Write-Host "Deploying to S3 bucket: $BucketName"

# Deploy .next directory
Write-Host "Deploying .next directory..."
aws s3 sync .next "s3://$BucketName/.next" --delete --region $Region

# Deploy public directory
Write-Host "Deploying public directory..."
aws s3 sync public "s3://$BucketName/public" --delete --region $Region

# Deploy static assets with cache headers
Write-Host "Deploying static assets with cache headers..."
aws s3 cp .next/static "s3://$BucketName/_next/static" --recursive --cache-control "public,max-age=31536000,immutable" --region $Region

# Invalidate CloudFront cache if distribution ID is provided
if (-not [string]::IsNullOrEmpty($DistributionId)) {
    Write-Host "Invalidating CloudFront cache for distribution: $DistributionId"
    aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" --region $Region
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "CloudFront invalidation failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
    
    Write-Host "CloudFront invalidation created successfully."
}

Write-Host "Deployment completed successfully." 