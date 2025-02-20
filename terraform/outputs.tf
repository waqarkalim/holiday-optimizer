output "aws_s3_bucket" {
  value = aws_s3_bucket.bucket.bucket
}

output "aws_s3_bucket_website_url" {
  value = aws_s3_bucket_website_configuration.bucket_website_configuration.website_endpoint
}

output "aws_cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.s3_distribution.id
}