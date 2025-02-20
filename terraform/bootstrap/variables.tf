variable "project_name" {
  type        = string
  default     = "holiday-optimizer"
  description = "Name of the project"
}

variable "aws_default_region" {
  description = "The default AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  type        = string
  default     = "ctoplanner.com"
  description = "Domain name for the project"
}

variable "github_org" {
  description = "The GitHub organization name"
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository name"
  type        = string
}

