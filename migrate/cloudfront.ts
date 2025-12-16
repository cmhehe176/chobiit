import * as dotenv from 'dotenv';
import AWS from 'aws-sdk';
import {
  DistributionSummary
} from "aws-sdk/clients/cloudfront"
import {
  ScanInput,
  UpdateItemInput,
} from "aws-sdk/clients/dynamodb";
import fs from "fs";

dotenv.config();

const appTableName = 'chobiitConfig';

export const env = process.env!;

AWS.config.update({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.CLOUDFRONT_REGION
})

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
// Around DynamoDB
//
///////////////////////

async function updateDynamoDBItem(cloudfrontDistributions: any, config: any) {
  const dynamo = new AWS.DynamoDB();

  // @ts-ignore
  const domain = config.domain
  const subDomain = domain.S.split('.')[0]
  const distributionId = cloudfrontDistributions[subDomain]
  if (!distributionId) {
    console.error(`Have no chobiitConfig in dynamoDB for subdomain=${JSON.stringify(subDomain)}`);
    return
  };

  const updateParam: UpdateItemInput = {
    TableName: appTableName,
    Key: {
      domain: {
        S: domain.S
      }
    },
    UpdateExpression: "set #cloudfrontDistributionId=:cloudfrontDistributionId",
    ExpressionAttributeNames: {
      '#cloudfrontDistributionId': 'cloudfrontDistributionId'
    },
    ExpressionAttributeValues: {
      ':cloudfrontDistributionId': {
        S: distributionId
      }
    }

  }

  console.log(`Updating dynamoDB chobiitConfig after sleeping... id=${distributionId}. domainName=${domain.S}`);
  await sleep(2_000);

  try {
    await dynamo.updateItem(updateParam).promise();
    console.log(`Finished updating chobiitConfig in dynamoDB. id=${distributionId}. domainName=${domain.S}`);
  } catch (error) {
    console.warn(`Failed updating chobiitConfig in dynamoDB. params: ${JSON.stringify(updateParam)}. error=${JSON.stringify(error)} retry after sleeping...`
    );
    await sleep(5_000);
    await updateDynamoDBItem(cloudfrontDistributions, config);
  }
}

async function getDynamoDBChobiitConfigs(cloudfrontDistributions: any = {}, queries: ScanInput = {TableName: appTableName}, listConfigs: object[] = []): Promise<object[]> {
  const dynamo = new AWS.DynamoDB();
  const result = await dynamo.scan(queries).promise();

  // @ts-ignore
  const nextListConfigs = listConfigs.concat(result.Items) || [];

  if (result.LastEvaluatedKey) {
    await sleep(1_000);
    queries.ExclusiveStartKey = result.LastEvaluatedKey
    return await getDynamoDBChobiitConfigs(cloudfrontDistributions, queries, nextListConfigs)
  } else {
    return nextListConfigs
  }
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

async function exportCloudFrontDistributionsCSV(distributions: DistributionSummary[]) {
  let csv = ''
  let cloudfrontDistributions: any = {}
  distributions.forEach((distribution: DistributionSummary) => {
    const alias = distribution.Aliases?.Items ? distribution.Aliases?.Items[0] : null
    if (!alias) return
    csv +=`${distribution.Id},${alias}\r\n`
    const subDomain = alias.split('.chobiit')[0]
    cloudfrontDistributions[subDomain] = distribution.Id
  })

  fs.writeFileSync("cloudfront-distribution.csv", csv);
  console.log("Done!");

  return cloudfrontDistributions
}

(async () => {
  console.log("Getting cloudfront distributions...");
  const distributions = await getCloudFrontDistributions();
  console.log(`Finished getting cloudfront distributions. count=${distributions.length}`);

  const cloudfrontDistributions = await exportCloudFrontDistributionsCSV(distributions)

  const listConfigs = await getDynamoDBChobiitConfigs(cloudfrontDistributions)

  for (const config of listConfigs) {
    try {
      await updateDynamoDBItem(cloudfrontDistributions, config)
    } catch (e) {
      // @ts-ignore
      console.warn(`Failed updating chobiitConfig in dynamoDB. Domain: ${JSON.stringify(config.domain)}. error=${JSON.stringify(e)} retry after sleeping...`)
    }
  }
})();
