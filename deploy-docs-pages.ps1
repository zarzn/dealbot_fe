# Deploy Documentation Pages
# This script builds and deploys the Next.js application with static documentation pages

Write-Host "Starting deployment of documentation pages..." -ForegroundColor Green

# Set environment variables if needed
$env:NEXT_PUBLIC_API_URL = "https://api.rebaton.ai"

# Build the Next.js application in production mode
Write-Host "Building Next.js application..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed with exit code $LASTEXITCODE. Aborting deployment." -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Deploy to AWS S3
Write-Host "Deploying to AWS S3..." -ForegroundColor Cyan
aws s3 sync out/ s3://agentic-deals-frontend/ --delete --profile agentic-deals-deployment --no-cli-pager

if ($LASTEXITCODE -ne 0) {
    Write-Host "S3 deployment failed with exit code $LASTEXITCODE." -ForegroundColor Red
    exit 1
}

Write-Host "S3 deployment successful!" -ForegroundColor Green

# Create CloudFront invalidation to clear cache
Write-Host "Creating CloudFront invalidation..." -ForegroundColor Cyan
$cloudfrontId = "E1PQGJ1XDD19ZY"
aws cloudfront create-invalidation --distribution-id $cloudfrontId --paths "/*" --profile agentic-deals-deployment --no-cli-pager

if ($LASTEXITCODE -ne 0) {
    Write-Host "CloudFront invalidation failed with exit code $LASTEXITCODE." -ForegroundColor Red
    exit 1
}

Write-Host "CloudFront invalidation created successfully!" -ForegroundColor Green

# List the documentation pages that were deployed
Write-Host "The following documentation pages have been deployed:" -ForegroundColor Yellow
Write-Host "- /how-to-use/getting-started" -ForegroundColor Cyan
Write-Host "- /how-to-use/searching-deals" -ForegroundColor Cyan
Write-Host "- /how-to-use/deal-goals" -ForegroundColor Cyan
Write-Host "- /how-to-use/tracking-deals" -ForegroundColor Cyan
Write-Host "- /how-to-use/understanding-deal-analysis" -ForegroundColor Cyan
Write-Host "- /how-to-use/sharing-deals (pending)" -ForegroundColor DarkYellow
Write-Host "- /how-to-use/token-system (pending)" -ForegroundColor DarkYellow
Write-Host "- /how-to-use/troubleshooting (pending)" -ForegroundColor DarkYellow
Write-Host "- /how-to-use/faq (pending)" -ForegroundColor DarkYellow

Write-Host "Deployment completed! Wait 5-15 minutes for CloudFront propagation." -ForegroundColor Green
Write-Host "Access documentation at: https://rebaton.ai/how-to-use" -ForegroundColor Green