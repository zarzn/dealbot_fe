# AWS Infrastructure Setup Script for Frontend Deployment
# This script sets up the necessary AWS resources for the frontend deployment

# Parameters
param (
    [string]$BucketName = "agentic-deals-frontend",
    [string]$Region = "us-east-1",
    [string]$DomainName = "agentic-deals.example.com",
    [switch]$SkipCertificate = $false
)

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

# Create S3 bucket
Write-Host "Creating S3 bucket: $BucketName"
try {
    aws s3 mb "s3://$BucketName" --region $Region
    Write-Host "S3 bucket created successfully."
}
catch {
    Write-Warning "Failed to create S3 bucket. It might already exist."
}

# Enable versioning on the bucket
Write-Host "Enabling versioning on the bucket..."
aws s3api put-bucket-versioning --bucket $BucketName --versioning-configuration Status=Enabled

# Configure bucket for static website hosting
Write-Host "Configuring bucket for static website hosting..."
aws s3 website "s3://$BucketName" --index-document index.html --error-document index.html

# Create bucket policy for CloudFront access
$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "CloudFrontGetObject",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
                }
            }
        }
    ]
}
"@

# Save the policy to a temporary file
$policyFile = "bucket-policy.json"
$bucketPolicy | Out-File -FilePath $policyFile -Encoding utf8

Write-Host "Bucket policy created. You'll need to update it with your CloudFront distribution ID after creation."

# Request SSL certificate if needed
if (-not $SkipCertificate) {
    Write-Host "Requesting SSL certificate for $DomainName..."
    $certificateArn = aws acm request-certificate --domain-name $DomainName --validation-method DNS --region $Region | ConvertFrom-Json
    Write-Host "Certificate requested. ARN: $($certificateArn.CertificateArn)"
    Write-Host "Please add the DNS validation records to your domain's DNS settings."
}

# Create CloudFront distribution
Write-Host "To create a CloudFront distribution, you'll need to:"
Write-Host "1. Go to the AWS Management Console"
Write-Host "2. Navigate to CloudFront"
Write-Host "3. Create a new distribution with the following settings:"
Write-Host "   - Origin domain: $BucketName.s3-website-$Region.amazonaws.com"
Write-Host "   - Origin protocol policy: HTTP Only"
Write-Host "   - Viewer protocol policy: Redirect HTTP to HTTPS"
Write-Host "   - Allowed HTTP methods: GET, HEAD, OPTIONS"
Write-Host "   - Cache policy: CachingOptimized"
Write-Host "   - Price class: Use All Edge Locations"
Write-Host "   - Alternate domain names (CNAMEs): $DomainName"
Write-Host "   - SSL certificate: Custom SSL Certificate (from ACM)"
Write-Host "   - Default root object: index.html"
Write-Host "   - Custom error responses: 404 -> /index.html, 200"

Write-Host "After creating the CloudFront distribution:"
Write-Host "1. Update the bucket policy with your account ID and distribution ID"
Write-Host "2. Apply the updated policy with: aws s3api put-bucket-policy --bucket $BucketName --policy file://$policyFile"
Write-Host "3. Create a Route 53 record to point your domain to the CloudFront distribution"

Write-Host "AWS infrastructure setup script completed." 