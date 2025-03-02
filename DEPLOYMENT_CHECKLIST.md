# Frontend Deployment Checklist

## Pre-Deployment Preparation

- [ ] Update environment variables in `.env.production`
- [ ] Test application with production settings locally
- [ ] Run linting and fix any issues: `npm run lint`
- [ ] Ensure all dependencies are up to date: `npm outdated`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Verify all API endpoints are configured correctly
- [ ] Test authentication flows with production settings
- [ ] Optimize images and assets
- [ ] Verify responsive design across different devices
- [ ] Run performance tests

## AWS Infrastructure Setup

- [ ] Install AWS CLI and configure credentials
- [ ] Create S3 bucket for static hosting
- [ ] Configure bucket permissions and CORS settings
- [ ] Request SSL certificate in AWS Certificate Manager
- [ ] Create CloudFront distribution
- [ ] Configure CloudFront settings (cache, compression, etc.)
- [ ] Set up Route 53 for domain routing
- [ ] Configure security headers
- [ ] Set up monitoring and alerts

## CI/CD Configuration

- [ ] Set up GitHub repository
- [ ] Configure GitHub Actions workflow
- [ ] Add required secrets to GitHub repository
- [ ] Test CI/CD pipeline with a test commit
- [ ] Verify automatic deployment works correctly
- [ ] Set up branch protection rules

## Deployment Process

- [ ] Build the application for production
- [ ] Test the production build locally
- [ ] Deploy to AWS using the deployment script
- [ ] Verify the application is accessible at the production URL
- [ ] Test critical user journeys in production
- [ ] Monitor for any errors or issues
- [ ] Verify analytics and monitoring are working

## Post-Deployment Tasks

- [ ] Document the deployment process
- [ ] Update README with deployment instructions
- [ ] Create rollback plan
- [ ] Set up regular backup schedule
- [ ] Configure automated testing for production
- [ ] Set up performance monitoring
- [ ] Document any known issues or limitations

## Security Verification

- [ ] Verify HTTPS is enforced
- [ ] Check Content Security Policy headers
- [ ] Verify authentication token handling
- [ ] Test rate limiting
- [ ] Check for exposed environment variables
- [ ] Verify proper error handling
- [ ] Test for common security vulnerabilities

## Performance Optimization

- [ ] Verify assets are properly cached
- [ ] Check page load times
- [ ] Verify code splitting is working
- [ ] Test image loading and optimization
- [ ] Verify lazy loading for non-critical components
- [ ] Check bundle sizes
- [ ] Test time to interactive

## Rollback Plan

In case of deployment issues:

1. Identify the last stable deployment
2. Revert to the previous version using S3 versioning
3. Invalidate CloudFront cache
4. Verify the rollback fixed the issues
5. Document the root cause of the issue

## Deployment Commands

```powershell
# Set up AWS infrastructure
./scripts/aws-setup.ps1 -BucketName "agentic-deals-frontend" -Region "us-east-1" -DomainName "agentic-deals.example.com"

# Test production build locally
./scripts/test-production-build.ps1

# Deploy to AWS
./scripts/deploy-to-aws.ps1 -BucketName "agentic-deals-frontend" -DistributionId "DISTRIBUTION_ID"

# Set up GitHub secrets
./scripts/setup-github-secrets.ps1
``` 