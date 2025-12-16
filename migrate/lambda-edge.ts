import * as dotenv from "dotenv";
import AWS, { Lambda } from "aws-sdk";
import {
  CreateFunctionRequest,
  FunctionConfiguration,
  GetFunctionResponse,
  NameSpacedFunctionArn,
  PublishVersionRequest,
} from "aws-sdk/clients/lambda";
import {
  DistributionSummary,
  GetDistributionConfigResult,
  UpdateDistributionRequest,
} from "aws-sdk/clients/cloudfront";
import fs from "fs";

dotenv.config();

const env = process.env!;
let lambdaFunctionArn: NameSpacedFunctionArn;

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.LAMBDA_REGION,
});

////////////////////////
//
// Utilities
//
///////////////////////

async function sleep(msec: number) {
  return new Promise((resolve) => setTimeout(resolve, msec));
}

////////////////////////
//
// Around Lambda function
//
///////////////////////

async function createLambdaEdge() {
  const lambda = new AWS.Lambda();
  const LAMBDA_FUNCTION_NAME = "chobiitModifyOriginResponse";

  let buffer = fs.readFileSync(`${LAMBDA_FUNCTION_NAME}.zip`);
  const params: CreateFunctionRequest = {
    Code: {
      ZipFile: buffer,
    },
    FunctionName: LAMBDA_FUNCTION_NAME,
    Role: "arn:aws:iam::831344450728:role/lambda-edge-dynamodb-cloudfront-role",
    Runtime: "nodejs16.x",
    Handler: "index.handler",
  };

  lambda.createFunction(
    params,
    async function (err, data: FunctionConfiguration) {
      if (err) console.log(err, err.stack);
      console.log("Create Lambda success", data.FunctionArn);

      const publish: PublishVersionRequest = {
        FunctionName: LAMBDA_FUNCTION_NAME,
      };

      await publishLambdaFunction(lambda, LAMBDA_FUNCTION_NAME, publish);
    }
  );
}

async function publishLambdaFunction(
  lambda: Lambda,
  lambdaFunctionName: string,
  publish: PublishVersionRequest
) {
  lambda.getFunction(
    { FunctionName: lambdaFunctionName },
    async function (err, data: GetFunctionResponse) {
      if (err) console.log(err);

      if (data.Configuration?.State !== "Active")
        return await publishLambdaFunction(lambda, lambdaFunctionName, publish);

      lambda.publishVersion(
        publish,
        function (err, data: FunctionConfiguration) {
          if (err) console.log(err);
          if (!data.FunctionArn) return;

          lambdaFunctionArn = data.FunctionArn;
        }
      );
    }
  );
}

////////////////////////
//
// Around CloudFront
//
///////////////////////

const isTargetDistribution = (distribution: DistributionSummary) => {
  return distribution.Comment === env.LAMBDA_CLOUDFRONT_COMMENT;
};

async function getCloudFrontDistributions(
  marker = "",
  distributions: DistributionSummary[] = []
): Promise<DistributionSummary[]> {
  const cloudFront = new AWS.CloudFront();
  const result = await cloudFront
    .listDistributions({ Marker: marker })
    .promise();

  const nextDistributions = distributions.concat(
    result.DistributionList?.Items?.filter(isTargetDistribution) || []
  );

  if (result.DistributionList?.NextMarker) {
    await sleep(1_000);
    return await getCloudFrontDistributions(
      result.DistributionList.NextMarker,
      nextDistributions
    );
  } else {
    return nextDistributions;
  }
}
async function getDistributionConfig(
  distributionId: string
): Promise<GetDistributionConfigResult | undefined> {
  const cloudFront = new AWS.CloudFront();
  const result = await cloudFront
    .getDistributionConfig({ Id: distributionId })
    .promise();
  return result;
}

async function updateCloudFrontDistribution(distribution: DistributionSummary) {
  const cloudFront = new AWS.CloudFront();

  if (distribution.CacheBehaviors.Quantity > 1) {
    console.error(
      `distribution.CacheBehaviors.Quantity is more than one. distribution=${JSON.stringify(
        distribution
      )}`
    );
    return;
  }

  const cacheBehaviorList = distribution.CacheBehaviors.Items;

  if (cacheBehaviorList === undefined) {
    console.error(
      `CacheBehaviour is undefined. distribution=${JSON.stringify(
        distribution
      )}`
    );
    return;
  }

  if (cacheBehaviorList.length === 0) {
    console.error(
      `CacheBehaviour is empty. distribution=${JSON.stringify(distribution)}`
    );
    return;
  }

  if (!cacheBehaviorList[0].ForwardedValues) {
    console.error(
      `CacheBehaviour[0].ForwardedValues is empty. distribution=${JSON.stringify(
        distribution
      )}`
    );
    return;
  }

  if (!cacheBehaviorList[0].LambdaFunctionAssociations) {
    console.error(
      `CacheBehaviour[0].LambdaFunctionAssociations is empty. distribution=${JSON.stringify(
        distribution
      )}`
    );
    return;
  }

  const distributionConfigResult = await getDistributionConfig(distribution.Id);

  if (distributionConfigResult?.DistributionConfig === undefined) {
    console.error(
      `DistributionConfig is undefined. distribution=${JSON.stringify(
        distribution
      )}`
    );
    return;
  }

  if (distributionConfigResult.ETag === undefined) {
    console.error(
      `ETag of DistributinoConfig is undefined. distribution=${JSON.stringify(
        distribution
      )}`
    );
    return;
  }

  const distributionConfig = distributionConfigResult.DistributionConfig;
  const eTag = distributionConfigResult.ETag;

  const params: UpdateDistributionRequest = {
    Id: distribution.Id,
    DistributionConfig: {
      Aliases: distribution.Aliases,
      CustomErrorResponses: distributionConfig.CustomErrorResponses,
      PriceClass: distribution.PriceClass,
      Logging: distributionConfig.Logging,
      Restrictions: distributionConfig.Restrictions,
      ViewerCertificate: distributionConfig.ViewerCertificate,
      DefaultRootObject: distributionConfig.DefaultRootObject,
      WebACLId: distribution.WebACLId,
      HttpVersion: distributionConfig.HttpVersion,
      CallerReference: distributionConfig.CallerReference,
      Origins: distribution.Origins,
      DefaultCacheBehavior: distribution.DefaultCacheBehavior,
      Comment: distribution.Comment,
      Enabled: distribution.Enabled,
      CacheBehaviors: {
        Quantity: distribution.CacheBehaviors.Quantity,
        Items: [
          {
            ...cacheBehaviorList[0],
            ForwardedValues: {
              Cookies: cacheBehaviorList[0].ForwardedValues.Cookies,
              Headers: cacheBehaviorList[0].ForwardedValues.Headers,
              QueryStringCacheKeys:
                cacheBehaviorList[0].ForwardedValues.QueryStringCacheKeys,
              QueryString: true,
            },
            LambdaFunctionAssociations: {
              Quantity: 1,
              Items: [
                {
                  LambdaFunctionARN: lambdaFunctionArn,
                  EventType: "origin-response",
                },
              ],
            },
          },
        ],
      },
    },
    IfMatch: eTag,
  };

  try {
    await cloudFront.updateDistribution(params).promise();
  } catch (error) {
    console.warn(
      `Failed updating cloudfront distribution. params: ${JSON.stringify(
        params
      )}. error=${JSON.stringify(error)} retry after sleeping...`
    );
    await sleep(5_000);
    await updateCloudFrontDistribution(distribution);
  }
}

(async () => {
  console.log("Creating a new Lambda function for Lambda@Edge...");
  await createLambdaEdge();
  console.log("Finished creating a new Lambda function for Lambda@Edge.");

  console.log("Getting cloudfront distributions...");
  const distributions = await getCloudFrontDistributions();
  console.log(
    `Finished getting cloudfront distributions. count=${distributions.length}`
  );

  for (const distribution of distributions) {
    console.log(
      `Updating cloudfront distributions after sleeping... id=${distribution.Id}. domainName=${distribution.DomainName}`
    );
    await sleep(2_000);
    try {
      await updateCloudFrontDistribution(distribution);
      console.log(
        `Finished updating cloudfront distribution. id=${distribution.Id}. domainName=${distribution.DomainName}`
      );
    } catch (e) {
      console.error(
        `Failed updating cloudfront distribution. id=${
          distribution.Id
        }. domainName=${distribution.DomainName}. error=${JSON.stringify(e)}`
      );
    }
  }
})();
