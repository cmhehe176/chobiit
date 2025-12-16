const AWS = require('aws-sdk');
const TARGET_ORIGIN_ID = process.env.TARGET_ORIGIN_ID;
const configTable = process.env.configTable;
const commonFolder = 'public/chobiit-common';

const s3 = new AWS.S3({
    params: { Bucket: TARGET_ORIGIN_ID }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient({
    
});

const cloudfront = new AWS.CloudFront();

exports.handler = async (event) => {
    const query = {
        TableName: configTable, 
        
    };
    
    
    
    let allConfig = await scanTable(query, dynamoDB);
    // console.log(allConfig);
    
    let listDomain = allConfig.map(x => x.domain);
    console.log(listDomain);
    
    
    //copyFile
    
    //for (let i = 0 ;i < listDomain.length; i++){
    //    let domain = listDomain[i];
    //    let sDomain = domain.split('.')[0];
    //    await copyFiles(commonFolder,'public/'+ sDomain);
    //}
  
    //console.log('copy done');
    
    //invalidate
    let distributions = await listDistributions({}, cloudfront);
  
   
    let listChobiitDomain = listDomain.map(domain =>  domain.split('.')[0] +'.chobiit.me');
    let needUpdatedistributions = distributions.filter(dis => {
     
        let disDomain = dis.Aliases.Items[0];
        return listChobiitDomain.includes(disDomain);
    });
    
    console.log("needUpdatedistributions.length:", needUpdatedistributions.length);
    for (let i = 0 ; i < needUpdatedistributions.length; i++){
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("invalidation now... i=", i);
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
        await cloudfront.createInvalidation(params).promise();
        
    }
    

           
    console.log('invalidate done');         
    
    // TODO implement
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

async function emptyS3Directory(bucket, dir) {
    const listParams = {
        Bucket: bucket,
        Prefix: dir
    };

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (listedObjects.Contents.length === 0) return;

    const deleteParams = {
        Bucket: bucket,
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {
        deleteParams.Delete.Objects.push({ Key });
    });

    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

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