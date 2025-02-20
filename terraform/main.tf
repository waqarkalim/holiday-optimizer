terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.87.0"
    }
  }
}

provider "aws" {
  region = var.aws_default_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "production"
      ManagedBy   = "terraform"
      Owner       = "holiday-optimizer-team"
      Purpose     = "frontend-hosting"
      CostCenter  = "holiday-optimizer-prod"
      Tier        = "frontend"
      Component   = "web-hosting"
      Domain      = var.domain_name
    }
  }
}

# ===========================================================================================
# ================================= Networking Infrastructure ===============================
# ===========================================================================================

// Registered Domain
resource "aws_route53domains_registered_domain" "domain" {
  domain_name = var.domain_name
  dynamic "name_server" {
    for_each = toset(aws_route53_zone.route53_zone.name_servers)
    content {
      name = name_server.value
    }
  }
}

// Certificate Manager
resource "aws_acm_certificate" "acm_certificate" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  key_algorithm     = "RSA_2048"

  subject_alternative_names = [var.domain_name, "*.${var.domain_name}"]
}

// Route 53
resource "aws_route53_zone" "route53_zone" {
  name          = var.domain_name
  force_destroy = true
}

resource "aws_route53_record" "acm_certificate_route53_record" {
  for_each = {
    for dvo in aws_acm_certificate.acm_certificate.domain_validation_options : dvo.domain_name => {
      name    = dvo.resource_record_name
      type    = dvo.resource_record_type
      zone_id = aws_route53_zone.route53_zone.zone_id
      record  = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.route53_zone.zone_id
}

resource "aws_route53_record" "cloudfront_route53_record" {
  name    = var.domain_name
  type    = "A"
  zone_id = aws_route53_zone.route53_zone.zone_id
  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "root_domain_route53_record" {
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  zone_id = aws_route53_zone.route53_zone.zone_id
  records = [var.domain_name]
}

// ACM Certificate Validation
resource "aws_acm_certificate_validation" "acm_certificate_validation" {
  certificate_arn         = aws_acm_certificate.acm_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_certificate_route53_record : record.fqdn]
}

# ===========================================================================================
# ================================= Frontend Infrastructure =================================
# ===========================================================================================

// S3 Bucket
resource "aws_s3_bucket" "bucket" {
  bucket_prefix = "${var.project_name}-"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "bucket_public_access_block" {
  bucket = aws_s3_bucket.bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


data "aws_iam_policy_document" "bucket_policy" {
  statement {
    principals {
      identifiers = ["*"]
      type        = "*"
    }

    effect  = "Allow"
    actions = ["s3:*"]

    resources = [
      aws_s3_bucket.bucket.arn,
      "${aws_s3_bucket.bucket.arn}/*"
    ]
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.bucket.id
  policy = data.aws_iam_policy_document.bucket_policy.json

  depends_on = [
    data.aws_iam_policy_document.bucket_policy, aws_s3_bucket_public_access_block.bucket_public_access_block
  ]
}


resource "aws_s3_bucket_website_configuration" "bucket_website_configuration" {
  bucket = aws_s3_bucket.bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

// CloudFront
resource "aws_cloudfront_origin_access_control" "s3_distribution_oac" {
  name                              = "s3_distribution_origin_access_control_${var.project_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_response_headers_policy" "s3_distribution_response_header_policy" {
  name = "s3_distribution_response_header_policy_${var.project_name}"
  cors_config {
    access_control_allow_credentials = false
    origin_override                  = false
    access_control_allow_origins {
      items = ["*"]
    }
    access_control_expose_headers {
      items = [""]
    }
    access_control_allow_headers {
      items = ["*"]
    }
    access_control_allow_methods {
      items = ["ALL"]
    }
  }
}

locals {
  s3_origin_id = "myS3Origin"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.bucket.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_distribution_oac.id
  }

  enabled         = true
  is_ipv6_enabled = true

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.acm_certificate_validation.certificate_arn
    cloudfront_default_certificate = true
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  aliases = ["*.${var.domain_name}", var.domain_name]

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" // CachingOptimized
  }

  http_version = "http2and3"

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  wait_for_deployment = false

  depends_on = [
    aws_s3_bucket_website_configuration.bucket_website_configuration,
    aws_cloudfront_origin_access_control.s3_distribution_oac
  ]
}
