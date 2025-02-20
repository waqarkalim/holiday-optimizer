#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first."
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ terraform is not installed. Please install it first."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🧪 Running tests..."
pnpm test

echo "🏗️ Building Next.js application..."
pnpm build

echo "🌍 Setting up infrastructure..."
# Initialize and apply bootstrap infrastructure
echo "  → Setting up bootstrap infrastructure..."
pnpm run tf:bootstrap:init
pnpm run tf:bootstrap:apply --auto-approve

# Initialize and apply main infrastructure
echo "  → Setting up main infrastructure..."
pnpm run tf:init
pnpm run tf:apply --auto-approve

# Get the S3 bucket name from terraform output
echo "📤 Uploading build files to S3..."
BUCKET_NAME=$(cd terraform && terraform output -raw aws_s3_bucket)

# Upload the Next.js build to S3
aws s3 sync ./out "s3://$BUCKET_NAME" --delete

echo "🧹 Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(cd terraform && terraform output -raw aws_cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be live in a few minutes after the CloudFront cache invalidation completes." 