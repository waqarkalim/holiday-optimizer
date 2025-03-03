#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
SKIP_BOOTSTRAP=false
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_INFRA=false
DRY_RUN=true
ENVIRONMENT="dev"
SHOW_HELP=false

# Exit on error
set -e

# Function to display usage help
show_help() {
  echo -e "${BLUE}Holiday Optimizer Local Deployment Script${NC}"
  echo ""
  echo "Usage: ./deploy.sh [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help               Show this help message"
  echo "  -e, --environment ENV    Set deployment environment (dev, staging) [default: dev]"
  echo "  --skip-bootstrap         Skip bootstrap infrastructure setup"
  echo "  --skip-tests             Skip running tests"
  echo "  --skip-build             Skip building the application (use existing build)"
  echo "  --skip-infra             Skip infrastructure deployment (just deploy app)"
  echo "  --dry-run                Show commands without executing them"
  echo ""
  echo "Example:"
  echo "  ./deploy.sh --environment dev --skip-bootstrap"
}

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -h|--help) SHOW_HELP=true; shift ;;
    -e|--environment) ENVIRONMENT="$2"; shift 2 ;;
    --skip-bootstrap) SKIP_BOOTSTRAP=true; shift ;;
    --skip-tests) SKIP_TESTS=true; shift ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    --skip-infra) SKIP_INFRA=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo -e "${RED}Unknown parameter: $1${NC}"; show_help; exit 1 ;;
  esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
  show_help
  exit 0
fi

# Command execution with dry run support
execute() {
  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}WOULD EXECUTE: $*${NC}"
  else
    echo -e "${BLUE}EXECUTING: $*${NC}"
    "$@"
  fi
}

echo -e "${GREEN}🚀 Starting local deployment process for ${YELLOW}$ENVIRONMENT${GREEN} environment...${NC}"

# Run tests if not skipped
if [ "$SKIP_TESTS" = false ]; then
  echo -e "${GREEN}🧪 Running tests...${NC}"
  execute pnpm test
fi

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
execute pnpm install

# Build app if not skipped
if [ "$SKIP_BUILD" = false ]; then
  echo -e "${GREEN}🏗️ Building Next.js application...${NC}"
  execute pnpm build
else
  echo -e "${YELLOW}⏩ Skipping build step (using existing build)${NC}"
fi

# Setup infrastructure if not skipped
if [ "$SKIP_INFRA" = false ]; then
  echo -e "${GREEN}🌍 Setting up infrastructure...${NC}"

  # Bootstrap infrastructure if not skipped
  if [ "$SKIP_BOOTSTRAP" = false ]; then
    echo -e "${GREEN}  → Setting up bootstrap infrastructure...${NC}"
    execute cd terraform/bootstrap
    execute terraform init
    
    echo -e "${YELLOW}⚠️ You are about to apply changes to bootstrap infrastructure${NC}"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo -e "${RED}Deployment aborted.${NC}"
      exit 1
    fi
    
    execute terraform apply -var="environment=$ENVIRONMENT"
    execute cd ../..
  else
    echo -e "${YELLOW}⏩ Skipping bootstrap infrastructure setup${NC}"
  fi

  echo -e "${GREEN}  → Setting up main infrastructure...${NC}"
  execute cd terraform
  execute terraform init
  
  echo -e "${YELLOW}⚠️ You are about to apply changes to main infrastructure${NC}"
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment aborted.${NC}"
    exit 1
  fi
  
  execute terraform apply -var="environment=$ENVIRONMENT"

  # Get the S3 bucket name from terraform output
  echo -e "${GREEN}📤 Uploading build files to S3...${NC}"
  if [ "$DRY_RUN" = true ]; then
    BUCKET_NAME="example-bucket-name"
  else
    BUCKET_NAME=$(terraform output -raw aws_s3_bucket)
  fi

  # Upload the Next.js build to S3
  execute aws s3 sync ../out "s3://$BUCKET_NAME" --delete

  echo -e "${GREEN}🧹 Invalidating CloudFront cache...${NC}"
  if [ "$DRY_RUN" = true ]; then
    DISTRIBUTION_ID="example-distribution-id"
  else
    DISTRIBUTION_ID=$(terraform output -raw aws_cloudfront_distribution_id)
  fi
  
  execute aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
  execute cd ..
else
  echo -e "${YELLOW}⏩ Skipping infrastructure deployment${NC}"
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application should be live in a few minutes after the CloudFront cache invalidation completes.${NC}"

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}NOTE: This was a dry run. No actual changes were made.${NC}"
fi 