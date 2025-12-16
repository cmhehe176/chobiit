const process = {
    env:{
        TARGET_ORIGIN_ID:"chobiit-client-prod",
        commonFolder:"chobiit-common",
        configTable:"chobiitConfig"
    }
}
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-west-1'});

const TARGET_ORIGIN_ID = process.env.TARGET_ORIGIN_ID;
const configTable = process.env.configTable;
const commonFolder = 'public/chobiit-common';

const s3 = new AWS.S3({
    params: { Bucket: TARGET_ORIGIN_ID }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const cloudfront = new AWS.CloudFront();

const excludedChobiitDomains = [
  // キャッシュ削除の対象外にしたいドメインを指定
  // 例：'novelworks.chobiit.me',
];

async function handler(){
    const query = {
        TableName: configTable,
    };

    let allConfig = await scanTable(query, dynamoDB);
    let listDomain = allConfig.map(x => x.domain);
    console.log('All domains:', listDomain)

    // copyFile

    for (let i = 0 ;i < listDomain.length; i++){
        let domain = listDomain[i];
        let sDomain = domain.split('.')[0];
        console.log(`[${i+1}/${listDomain.length}] copying files... domain:`, sDomain);
        await copyFiles(commonFolder,'public/'+ sDomain);
    }

    //invalidate

    let distributions = await listDistributions({}, cloudfront);
    let listChobiitDomain = listDomain.map(domain =>  domain.split('.')[0] +'.chobiit.me');
    let needUpdatedistributions = distributions.filter(dis => {
        let disDomain = dis.Aliases.Items[0];
        return listChobiitDomain.includes(disDomain) && !excludedChobiitDomains.includes(disDomain);
    })

    for (let i = 0 ; i < needUpdatedistributions.length; i++){
        await new Promise(resolve => setTimeout(resolve, 3000));
        let x = needUpdatedistributions[i];
        let params = {
          DistributionId: x.Id,
          InvalidationBatch: { /* required */
            CallerReference: '' + new Date().getTime(),
            Paths: { /* required */
              Quantity: 1, /* required */
              Items:
                [ '/*' ]

            }
          }
        };

        const runInvalidation = async () => {
            console.log(`[${i+1}/${needUpdatedistributions.length}] Invalidating... domain:`, x.Aliases.Items[0]);
            await cloudfront.createInvalidation(params).promise();
        };

        try {
          runInvalidation();
        } catch (error) {
          console.log('Error occurred.', error);
          console.log('Retrying...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          runInvalidation();
        }
    }

    console.log('invalidate done')

    const response = {
        statusCode: 200,
        body: JSON.stringify('done'),
    };
    return response;
};

const scanTable = async (params, dyanmo) => {
    let scanResults = [];
    let items;
    do{
        items =  await dyanmo.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    } while(typeof items.LastEvaluatedKey != "undefined");
    return scanResults;
};

const listDistributions = async (params, cloudfront) => {
    let scanResults = [];
    let items;
    do{
        items =  await cloudfront.listDistributions(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.Marker  = items.NextMarker;
    } while(typeof items.NextMarker != "undefined");
    return scanResults;
};

async function copyFiles(commonFolder, destinationFolder){
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

handler()
