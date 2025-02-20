terraform {
  backend "s3" {
    bucket         = "holiday-optimizer-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "holiday-optimizer-terraform-locks"
  }
} 