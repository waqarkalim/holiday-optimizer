variable "project_name" {
  type        = string
  default     = "holiday-optimizer"
  description = "Name of the project"
}

variable "aws_default_region" {
  description = "AWS Default Region"
  default     = "us-east-1"
}

variable "domain_name" {
  type        = string
  default     = "ctoplanner.com"
  description = "Domain name for the project"
}

