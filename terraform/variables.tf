variable "aws_region" {
  description = "AWS region for the S3 bucket and CloudFront distribution"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket for website hosting"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository name in format 'owner/repo'"
  type        = string
}

variable "terraform_state_bucket" {
  description = "Name of the S3 bucket for Terraform state"
  type        = string
  default     = ""  # Optional, only needed if using S3 backend
}

variable "domain_name" {
  description = "The domain name for the website (e.g., example.com)"
  type        = string
}

variable "create_www_redirect" {
  description = "Whether to create a www redirect domain"
  type        = bool
  default     = true
} 