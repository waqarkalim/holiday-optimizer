output "state_bucket_name" {
  value       = aws_s3_bucket.terraform_state.id
  description = "Name of the S3 bucket holding Terraform state"
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.terraform_locks.id
  description = "Name of the DynamoDB table for Terraform state locking"
} 