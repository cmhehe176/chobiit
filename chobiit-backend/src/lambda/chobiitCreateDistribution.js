const AWS = require('aws-sdk');
AWS.config.apiVersions = {
  cloudfront: '2019-03-26',
  // other service API versions
};
var cloudfront = new AWS.CloudFront();
var route53 = new AWS.Route53();
var lambda = new AWS.Lambda({
  region: 'us-east-1'
});

const TARGET_ORIGIN_ID = process.env.TARGET_ORIGIN_ID;
const DOMAIN_NAME = process.env.DOMAIN_NAME;
const ACM_CERTIFICATE_ARN = process.env.ACM_CERTIFICATE_ARN;
const HOSTZONE_ID = process.env.HOSTZONE_ID;
const  ACCESS_IDENTITY_ID = process.env.ACCESS_IDENTITY_ID;
const COMMENT = process.env.COMMENT;

const configTableName = 'chobiitConfig';
const docClient = new AWS.DynamoDB.DocumentClient();

let timeStap = new Date().toISOString();
const commonFolder = process.env.commonFolder;


const s3 = new AWS.S3({
    params: { Bucket: TARGET_ORIGIN_ID }
});

exports.handler = async (event, context, callback) => {
    console.log('Starting create distribution', JSON.stringify(event, null, 2));
    const kintoneDomain = event.params.querystring.domain;
    let domain = kintoneDomain.substring(0,kintoneDomain.indexOf('.')) + '.' + process.env.CHOBIIT_DOMAIN_NAME;
    
    const lambdaFunctionArn = await getLatestEdgeFunctionArn()

    // implement
    var params = {
      DistributionConfig: { /* required */
        CallerReference: domain, /* required */
        Comment: COMMENT, /* required */
        DefaultCacheBehavior: { /* required */
          ForwardedValues: { /* required */
            Cookies: { /* required */
              Forward: 'none', /* required */
              WhitelistedNames: {
                Quantity: 0, /* required */
                Items: [
                  /* more items */
                ]
              }
            },
            QueryString: false, /* required */
            Headers: {
              Quantity: 0, /* required */
              Items: [
                /* more items */
              ]
            },
            QueryStringCacheKeys: {
              Quantity: 0, /* required */
              Items: [
                /* more items */
              ]
            }
          },
          MinTTL: 0, /* required */
          TargetOriginId: TARGET_ORIGIN_ID, /* required */
          TrustedSigners: { /* required */
            Enabled: false, /* required */
            Quantity: 0, /* required */
            Items: [

              /* more items */
            ]
          },
          ViewerProtocolPolicy: 'allow-all', /* required */
          AllowedMethods: {
            Items: [ /* required */
              'GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE',
              /* more items */
            ],
            Quantity: 7, /* required */
            CachedMethods: {
              Items: [ /* required */
                'GET','HEAD'
                /* more items */
              ],
              Quantity: 2 /* required */
            }
          },
          Compress: true,
          DefaultTTL: 86400,
          FieldLevelEncryptionId: '',
          LambdaFunctionAssociations: {
            Quantity: 0, /* required */
            Items: [
              /* more items */
            ]
          },
          MaxTTL: 31536000,
          SmoothStreaming: false
        },
        Enabled: true, /* required */
        Origins: { /* required */
          Items: [ /* required */
            {
              DomainName: DOMAIN_NAME, /* required */
              Id: TARGET_ORIGIN_ID, /* required */
              CustomHeaders: {
                Quantity: 0, /* required */
                Items: [

                  /* more items */
                ]
              },
              // CustomOriginConfig: {
              //   HTTPPort: 80, /* required */
              //   HTTPSPort: 443, /* required */
              //   OriginProtocolPolicy: 'http-only', /* required */
              //   OriginKeepaliveTimeout: 5,
              //   OriginReadTimeout: 30,
              //   OriginSslProtocols: {
              //     Items: [ /* required */

              //       'SSLv3'
              //     ],
              //     Quantity: 1 /* required */
              //   }
              // },
              OriginPath:  '/public/'+kintoneDomain.split('.')[0],
              S3OriginConfig: {
                OriginAccessIdentity: `origin-access-identity/cloudfront/${ACCESS_IDENTITY_ID}` /* required */
              }
            },
            /* more items */
          ],
          Quantity: 1 /* required */
        },
        Aliases: {
          Quantity: 1, /* required */
          Items: [
            domain,
            /* more items */
          ]
        },
        CacheBehaviors: {
          Quantity: 1, /* required */
          Items: [
            {
              ForwardedValues: { /* required */
                Cookies: { /* required */
                  Forward: 'none', /* required */
                  WhitelistedNames: {
                    Quantity: 0, /* required */
                    Items: [

                      /* more items */
                    ]
                  }
                },
                QueryString: true, /* required */
                Headers: {
                  Quantity: 0, /* required */
                  Items: [

                    /* more items */
                  ]
                },
                QueryStringCacheKeys: {
                  Quantity: 0, /* required */
                  Items: [
                    /* more items */
                  ]
                }
              },
              MinTTL: 0, /* required */
              PathPattern: '*', /* required */
              TargetOriginId: TARGET_ORIGIN_ID, /* required */
              TrustedSigners: { /* required */
                Enabled: false, /* required */
                Quantity: 0, /* required */
                Items: [
                  /* more items */
                ]
              },
              ViewerProtocolPolicy: 'redirect-to-https', /* required */
              AllowedMethods: {
                Items: [ /* required */
                   'GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE',
                  /* more items */
                ],
                Quantity: 7, /* required */
                CachedMethods: {
                  Items: [ /* required */
                    'GET', 'HEAD',
                    /* more items */
                  ],
                  Quantity: 2 /* required */
                }
              },
              Compress: true,
              DefaultTTL: 86400,
              FieldLevelEncryptionId: '',
              LambdaFunctionAssociations: {
                Quantity: 1, /* required */
                Items: [{LambdaFunctionARN: lambdaFunctionArn, EventType: "origin-response"}]
              },
              MaxTTL: 31536000,
              SmoothStreaming: false
            },
            /* more items */
          ]
        },
        CustomErrorResponses: {
          Quantity: 1, /* required */
          Items: [
            {
              ErrorCode: 500, /* required */
              ErrorCachingMinTTL: 300,
              ResponseCode: '',
              ResponsePagePath: ''
            },
            /* more items */
          ]
        },
        DefaultRootObject: 'login.html',
        HttpVersion: 'http2',
        IsIPV6Enabled: true ,
        Logging: {
          Bucket: '', /* required */
          Enabled: false, /* required */
          IncludeCookies: true, /* required */
          Prefix: '' /* required */
        },
        OriginGroups: {
          Quantity: 0, /* required */
          Items: [
          ]
        },
        PriceClass: 'PriceClass_All',
        ViewerCertificate: {
          ACMCertificateArn: ACM_CERTIFICATE_ARN,
          MinimumProtocolVersion: 'TLSv1.2_2019',
          SSLSupportMethod: 'sni-only'
        }
      }
    };

    try {
      await copyFiles('public/' + kintoneDomain.split('.')[0])

      let cloudfrontResp = await cloudfront.createDistribution(params).promise();
      console.log('create distribution resp: '+JSON.stringify(cloudfrontResp, null, 2));

      var route53Params = {
        ChangeBatch: {
        Changes: [
            {
          Action: "CREATE",
          ResourceRecordSet: {
            AliasTarget: {
            DNSName:  cloudfrontResp.Distribution.DomainName,
            EvaluateTargetHealth: false,
            HostedZoneId: "Z2FDTNDATAQYW2"
            },
            Name: domain,
            Type: "A"
          }
          }
        ],
        Comment: "CloudFront distribution for" + domain
        },
        HostedZoneId: HOSTZONE_ID// Depends on the type of resource that you want to route traffic to
      };

      let routeResp =  await route53.changeResourceRecordSets(route53Params).promise();
      let cloudfrontDistributionId = cloudfrontResp.Distribution.Id
      await updateChobiitConfig(kintoneDomain, cloudfrontDistributionId)
      handleSuccess(cloudfrontResp.Distribution.Id, callback);

    } catch(error){
      handleError(error, callback);
    }
};

async function updateChobiitConfig(domain, cloudfrontDistributionId){
  var params = {
    TableName: configTableName,
    Key:{
      domain : domain
    },
    UpdateExpression: "set cloudfrontDistributionId = :cd",
    ExpressionAttributeValues:{
      ":cd": cloudfrontDistributionId
    },
    ReturnValues:"UPDATED_NEW"
  };

  console.log("Updating cloudfrontDistributionId to dynamo.");
  return await docClient.update(params).promise();
}

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'create ditribution sucesss',
        distributionId : data
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let response = {
        statusCode: 200,
        body: JSON.stringify({
            code: 400,
            message: error.message
        })
    };

    callback(null, response);
}

async function copyFiles(destinationFolder){


  console.log('starting copy file....')
  const listObjectsResponse = await s3.listObjects({
    Prefix : commonFolder,

  }).promise();

  const folderContentInfo = listObjectsResponse.Contents;
  const folderPrefix = listObjectsResponse.Prefix;

  await Promise.all(
    folderContentInfo.map(async (file) => {
      await s3.copyObject({
        CopySource: TARGET_ORIGIN_ID + '/' + file.Key,
        Key: file.Key.replace(commonFolder, destinationFolder) // new file Key
      }).promise();

    })
  );

}

async function getLatestEdgeFunctionArn() {
  const functionName = (() => {
    switch (process.env.SYSTEM_ENV) {
      case "dev":
        return "chobiitModifyOriginResponseForDEV";
      case "prod": {
        switch (process.env.CHOBIIT_LANG) {
          case "ja": return "chobiitModifyOriginResponse";
          case "en": return "chobiitModifyOriginResponseForUS";
        }
      }
    }
  })();

  const params = {
    FunctionName: functionName,
  };

  const result = await lambda.listVersionsByFunction(params).promise();

  if (!result.Versions?.length) {
    throw new Error('Can not get versions Lambda@Edge version');
  }

  const isValidFunctionConfig = ({Version, FunctionArn}) => {
    return Version !== undefined && Version !== "$LATEST" && FunctionArn !== undefined
  }

  const validFunctionList = result.Versions.filter(isValidFunctionConfig).map((functionConfiguration) => {
    return {
      Version: parseInt(functionConfiguration.Version, 10),
      FunctionArn: functionConfiguration.FunctionArn
    }
  });

  if (validFunctionList.length === 0) {
    throw new Error('Cannot get the latest lambda@egdge version.')
  }

  const latestFunctionConfig = validFunctionList.reduce((prev, current) => {
    if (prev.Version < current.Version) return current;
    else return prev;
  })

  return latestFunctionConfig.FunctionArn;
}
