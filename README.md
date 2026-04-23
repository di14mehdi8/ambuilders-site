# AM Builders, Inc. — Static Website

Modern, single-page static site for AM Builders, Inc. (Nashville, TN).
Pure HTML / CSS / JS. Zero build step. Drop straight onto S3 or any static host.

## Structure

```
ambuilders-site/
├── index.html
├── css/style.css
├── js/main.js
├── assets/
│   ├── logo.png
│   └── images/  (p1.jpg … p13.jpg — project photography)
└── README.md
```

## Local preview

```bash
cd ambuilders-site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy — S3 static website

### 1. Create and configure the bucket

```bash
BUCKET=ambuilders-site-prod   # must be globally unique
REGION=us-east-1

aws s3api create-bucket --bucket $BUCKET --region $REGION

# Disable Block Public Access (required for public static hosting)
aws s3api put-public-access-block --bucket $BUCKET \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Enable static website hosting
aws s3 website s3://$BUCKET/ --index-document index.html --error-document index.html
```

### 2. Public-read bucket policy

Save as `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::ambuilders-site-prod/*"
  }]
}
```

Apply:

```bash
aws s3api put-bucket-policy --bucket $BUCKET --policy file://bucket-policy.json
```

### 3. Upload with correct cache headers

```bash
# HTML — always revalidate
aws s3 sync . s3://$BUCKET/ \
  --exclude "*" --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8"

# Static assets — long cache
aws s3 sync . s3://$BUCKET/ \
  --exclude "*.html" --exclude "README.md" --exclude ".*" \
  --cache-control "public, max-age=31536000, immutable"
```

Site URL: `http://$BUCKET.s3-website-$REGION.amazonaws.com`

### 4. (Recommended) CloudFront + HTTPS + custom domain

1. Create a CloudFront distribution with the S3 website endpoint (NOT the REST endpoint) as origin.
2. Request an ACM certificate in `us-east-1` for `ambuilders.pro` and `www.ambuilders.pro`.
3. Add both as alternate domain names on the distribution.
4. Point Route 53 (or your DNS) A / AAAA aliases to the distribution.
5. Invalidate `/*` after deploys:
   ```bash
   aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"
   ```

## Contact on the form

The form uses `mailto:matt@ambuilders.pro`. For a production submission flow,
swap to a serverless endpoint (e.g. API Gateway + Lambda + SES, or a service
like Formspree / Basin) by changing the `<form action>` and `method`.

## Editing content

- Copy + contact info: `index.html`
- Colors, type, spacing: `:root` in `css/style.css`
- Intro animation timing: `.intro__*` keyframes in `css/style.css`
- Project images: replace files in `assets/images/` (keep filenames or update `index.html`)

## Browser support

Evergreen browsers. Uses: CSS Grid, `aspect-ratio`, `backdrop-filter`,
IntersectionObserver, `prefers-reduced-motion`.
