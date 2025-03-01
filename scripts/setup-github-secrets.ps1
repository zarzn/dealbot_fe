# Setup GitHub Secrets Script
# This script helps set up GitHub repository secrets for CI/CD

# Parameters
param (
    [string]$RepoOwner = "",
    [string]$RepoName = "",
    [string]$GithubToken = ""
)

# Check if GitHub CLI is installed
try {
    $ghVersion = gh --version
    Write-Host "GitHub CLI is installed: $ghVersion"
}
catch {
    Write-Error "GitHub CLI is not installed. Please install it first: https://cli.github.com/"
    exit 1
}

# Authenticate with GitHub if token is provided
if (-not [string]::IsNullOrEmpty($GithubToken)) {
    Write-Host "Authenticating with GitHub using token..."
    $env:GITHUB_TOKEN = $GithubToken
}
else {
    # Check if already authenticated
    try {
        $ghAuth = gh auth status
        Write-Host "GitHub CLI is authenticated."
    }
    catch {
        Write-Host "Please authenticate with GitHub CLI:"
        gh auth login
    }
}

# Validate repository information
if ([string]::IsNullOrEmpty($RepoOwner) -or [string]::IsNullOrEmpty($RepoName)) {
    Write-Host "Repository owner or name not provided. Using current repository..."
    
    try {
        $repoInfo = gh repo view --json owner,name | ConvertFrom-Json
        $RepoOwner = $repoInfo.owner
        $RepoName = $repoInfo.name
        
        Write-Host "Using repository: $RepoOwner/$RepoName"
    }
    catch {
        Write-Error "Failed to get current repository information. Please provide repository owner and name."
        exit 1
    }
}

# Function to add a secret
function Add-GitHubSecret {
    param (
        [string]$Name,
        [string]$Value,
        [switch]$IsOptional = $false
    )
    
    if ([string]::IsNullOrEmpty($Value)) {
        if ($IsOptional) {
            Write-Warning "Skipping optional secret: $Name (no value provided)"
            return
        }
        else {
            $Value = Read-Host "Enter value for secret $Name"
        }
    }
    
    try {
        Write-Host "Adding secret: $Name"
        echo $Value | gh secret set $Name -R "$RepoOwner/$RepoName"
        Write-Host "Secret $Name added successfully."
    }
    catch {
        $errorMessage = "Failed to add secret $Name"
        Write-Error $errorMessage
    }
}

# List of required secrets
Write-Host "Setting up required GitHub secrets for CI/CD..."

# AWS Credentials
$AWS_ACCESS_KEY_ID = Read-Host "Enter AWS Access Key ID"
Add-GitHubSecret -Name "AWS_ACCESS_KEY_ID" -Value $AWS_ACCESS_KEY_ID

$AWS_SECRET_ACCESS_KEY = Read-Host "Enter AWS Secret Access Key"
Add-GitHubSecret -Name "AWS_SECRET_ACCESS_KEY" -Value $AWS_SECRET_ACCESS_KEY

$AWS_CLOUDFRONT_DISTRIBUTION_ID = Read-Host "Enter AWS CloudFront Distribution ID"
Add-GitHubSecret -Name "AWS_CLOUDFRONT_DISTRIBUTION_ID" -Value $AWS_CLOUDFRONT_DISTRIBUTION_ID

# Authentication Secrets
$NEXTAUTH_SECRET = Read-Host "Enter NextAuth Secret"
Add-GitHubSecret -Name "NEXTAUTH_SECRET" -Value $NEXTAUTH_SECRET

$JWT_SECRET = Read-Host "Enter JWT Secret"
Add-GitHubSecret -Name "JWT_SECRET" -Value $JWT_SECRET

# API Keys
$OPENAI_API_KEY = Read-Host "Enter OpenAI API Key (optional)" -AsSecureString
$OPENAI_API_KEY_Plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($OPENAI_API_KEY))
Add-GitHubSecret -Name "OPENAI_API_KEY" -Value $OPENAI_API_KEY_Plain -IsOptional

$GOOGLE_API_KEY = Read-Host "Enter Google API Key (optional)" -AsSecureString
$GOOGLE_API_KEY_Plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($GOOGLE_API_KEY))
Add-GitHubSecret -Name "GOOGLE_API_KEY" -Value $GOOGLE_API_KEY_Plain -IsOptional

$DEEPSEEK_API_KEY = Read-Host "Enter DeepSeek API Key (optional)" -AsSecureString
$DEEPSEEK_API_KEY_Plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DEEPSEEK_API_KEY))
Add-GitHubSecret -Name "DEEPSEEK_API_KEY" -Value $DEEPSEEK_API_KEY_Plain -IsOptional

# Payment Processing
$STRIPE_SECRET_KEY = Read-Host "Enter Stripe Secret Key (optional)" -AsSecureString
$STRIPE_SECRET_KEY_Plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($STRIPE_SECRET_KEY))
Add-GitHubSecret -Name "STRIPE_SECRET_KEY" -Value $STRIPE_SECRET_KEY_Plain -IsOptional

$STRIPE_PUBLISHABLE_KEY = Read-Host "Enter Stripe Publishable Key (optional)"
Add-GitHubSecret -Name "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" -Value $STRIPE_PUBLISHABLE_KEY -IsOptional

# Email Configuration
$EMAIL_SERVER_HOST = Read-Host "Enter Email Server Host (optional)"
Add-GitHubSecret -Name "EMAIL_SERVER_HOST" -Value $EMAIL_SERVER_HOST -IsOptional

$EMAIL_SERVER_PORT = Read-Host "Enter Email Server Port (optional)"
Add-GitHubSecret -Name "EMAIL_SERVER_PORT" -Value $EMAIL_SERVER_PORT -IsOptional

$EMAIL_SERVER_USER = Read-Host "Enter Email Server User (optional)"
Add-GitHubSecret -Name "EMAIL_SERVER_USER" -Value $EMAIL_SERVER_USER -IsOptional

$EMAIL_SERVER_PASSWORD = Read-Host "Enter Email Server Password (optional)" -AsSecureString
$EMAIL_SERVER_PASSWORD_Plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($EMAIL_SERVER_PASSWORD))
Add-GitHubSecret -Name "EMAIL_SERVER_PASSWORD" -Value $EMAIL_SERVER_PASSWORD_Plain -IsOptional

$EMAIL_FROM = Read-Host "Enter Email From Address (optional)"
Add-GitHubSecret -Name "EMAIL_FROM" -Value $EMAIL_FROM -IsOptional

# Token Contract
$TOKEN_CONTRACT = Read-Host "Enter Token Contract Address (optional)"
Add-GitHubSecret -Name "TOKEN_CONTRACT" -Value $TOKEN_CONTRACT -IsOptional

Write-Host "GitHub secrets setup completed successfully." 