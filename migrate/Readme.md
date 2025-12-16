Configuration:

- AWS_ACCESS_KEY_ID: AWS access key
- AWS_SECRET_ACCESS_KEY: AWS secret key
- LAMBDA_REGION: Region to create Lambda@Edge (default: us-east-1)
- LAMBDA_CLOUDFRONT_COMMENT: filter cloudfront environment by comment to run
+ Ex: chobiit-dev/chobiit-prod/chobiit-us/wakayam-prod/yaoshi-prod/yaoshi-dev

- CLOUDFRONT_REGION: Region to update cloudfrontDistributionId in chobiitConfig table (dynamoDB)
- CLOUDFRONT_CLOUDFRONT_COMMENT: filter cloudfront environment by comment to run
+ Ex: chobiit-dev/chobiit-prod/chobiit-us/wakayam-prod/yaoshi-prod/yaoshi-dev

Commands:

- npm i: Install the necessary packages
- npm run lambda: Zip chobiitModifyOriginResponse folder to create Lambda@Edge and associate it to Cloudfront
- npm run cloudfront: Get the list of cloudfront distribution and assign the corresponding cloudfrontDistributionId to the records in the chobiitConfig table