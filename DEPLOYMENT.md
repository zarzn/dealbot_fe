# Frontend Deployment Guide

This document outlines the process for deploying the frontend of the AI Agentic Deals System to AWS S3 and CloudFront.

## Deployment Architecture

The frontend is deployed as a static site with the following components:
- **S3 Bucket**: Hosts the static files
- **CloudFront**: CDN for global distribution and HTTPS
- **API Gateway**: Backend API endpoints (separate deployment)

## Prerequisites

Before deploying, ensure you have:

1. AWS CLI installed and configured with the `agentic-deals-deployment` profile
2. Node.js and npm installed
3. Proper environment variables set in `.env.production`

## Environment Configuration

The project is configured to work in two modes:

1. **Development mode**: API routes work normally, and the application runs with full Next.js functionality
2. **Production mode**: Builds as a static export for S3 deployment

The `next.config.js` file includes conditional logic to only apply the `output: 'export'` setting when `NODE_ENV` is set to 'production'.

## Deployment Process

### Automated Deployment

The easiest way to deploy is using the automated deployment script:

```powershell
./scripts/deploy_frontend.ps1
```

This script will:
1. Check prerequisites
2. Temporarily remove API routes (to avoid conflicts with static export)
3. Set NODE_ENV to 'production'
4. Build the Next.js application
5. Restore API routes
6. Clean the S3 bucket
7. Upload the new build to S3
8. Invalidate the CloudFront cache

### Manual Deployment

If you need to deploy manually, follow these steps:

1. Prepare for static build by removing API routes:
   ```powershell
   ./scripts/prepare-static-build.ps1
   ```

2. Build the application with NODE_ENV set to production:
   ```powershell
   $env:NODE_ENV = "production"
   npm run build
   ```

3. Restore API routes:
   ```powershell
   ./scripts/restore-after-build.ps1
   ```

4. Clean the S3 bucket:
   ```powershell
   aws s3 rm s3://agentic-deals-frontend --recursive --profile agentic-deals-deployment
   ```

5. Upload the new build:
   ```powershell
   aws s3 sync out/ s3://agentic-deals-frontend/ --profile agentic-deals-deployment
   ```

6. Invalidate CloudFront cache:
   ```powershell
   aws cloudfront create-invalidation --distribution-id EDQQ1KY0M1HWU --paths "/*" --profile agentic-deals-deployment --region us-east-1
   ```

## Troubleshooting

### Common Issues

#### 1. Development vs. Production mode conflicts

**Problem**: Error about dynamic API routes not being compatible with static export.

**Solution**: Make sure you're running in the correct mode:
- For development: Run `npm run dev` (NODE_ENV is automatically set to 'development')
- For production build: Set NODE_ENV to 'production' before running `npm run build`

#### 2. Build fails with "exportPathMap" error

**Problem**: Error about `exportPathMap` being incompatible with the app directory.

**Solution**: Remove the `exportPathMap` configuration from `next.config.js` or use the static build script which temporarily removes API routes.

#### 3. Build fails with "dynamic export" error

**Problem**: Error about dynamic routes not being compatible with static export.

**Solution**: Use the static build script which temporarily removes API routes during build.

#### 4. CloudFront still serving old content

**Problem**: After deployment, CloudFront is still serving cached content.

**Solution**: Ensure you've invalidated the CloudFront cache with `/*` path pattern. It may take a few minutes for the invalidation to complete.

#### 5. Missing environment variables

**Problem**: Deployment fails due to missing environment variables.

**Solution**: Check that `.env.production` contains all required variables, including:
- `S3_BUCKET_NAME` or `NEXT_PUBLIC_S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

## AWS Configuration

### S3 Bucket

- **Name**: agentic-deals-frontend
- **Region**: us-east-1
- **Public Access**: Blocked (access through CloudFront only)
- **Versioning**: Enabled
- **Static Website Hosting**: Enabled

### CloudFront

- **Distribution ID**: EDQQ1KY0M1HWU
- **Domain**: d3irpl0o2ddv9y.cloudfront.net
- **Origin**: agentic-deals-frontend.s3.amazonaws.com
- **Default Root Object**: index.html
- **Error Pages**: Configured to redirect to /404.html

## Maintenance

### Adding New Routes

When adding new routes to the application:

1. Ensure they work with static export (avoid using dynamic server features)
2. If you need server-side functionality, implement it in the backend API
3. Update the deployment script if necessary

### Running in Development Mode

To run the application in development mode with fully functioning API routes:

```powershell
npm run dev
```

This will start the development server with API routes enabled.

### Updating Environment Variables

To update environment variables:

1. Edit `.env.production`
2. Redeploy the application

### Monitoring

After deployment, monitor:

1. CloudFront distribution status
2. S3 bucket metrics
3. Application performance and errors

## Support

For deployment issues, contact the DevOps team or refer to the AWS documentation. 