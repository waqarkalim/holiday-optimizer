#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Skip bootstrap in CI since it's already set up manually
if [[ -z "${GITHUB_ACTIONS}" ]]; then
  echo "📦 Installing dependencies..."
  pnpm install
fi

echo "🧪 Running tests..."
pnpm test

echo "🏗️ Building Next.js application..."
pnpm build

echo "🌍 Setting up infrastructure..."

# Skip bootstrap in CI since it's already set up manually
if [[ -z "${GITHUB_ACTIONS}" ]]; then
  echo "  → Running locally - setting up bootstrap infrastructure..."
  cd terraform/bootstrap
  terraform init
  terraform apply -auto-approve
  cd ../..
fi

echo "  → Setting up main infrastructure..."
cd terraform
terraform init
terraform apply -auto-approve

# Get the S3 bucket name from terraform output
echo "📤 Uploading build files to S3..."
BUCKET_NAME=$(terraform output -raw aws_s3_bucket)

# Upload the Next.js build to S3
aws s3 sync ../out "s3://$BUCKET_NAME" --delete

echo "🧹 Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(terraform output -raw aws_cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be live in a few minutes after the CloudFront cache invalidation completes." 