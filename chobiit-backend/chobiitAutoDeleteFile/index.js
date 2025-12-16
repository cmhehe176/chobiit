const AWS = require('aws-sdk');
const TARGET_ORIGIN_ID = process.env.TARGET_ORIGIN_ID;
const configTable = 'chobiitConfig';


const s3 = new AWS.S3({
    params: { Bucket: TARGET_ORIGIN_ID }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient({
    
});


exports.handler = async (event) => {
    
    
    const query = {
        TableName: configTable,
        
    };
    
    
    
    let allConfig = await scanTable(query, dynamoDB);
    // console.log(allConfig);
    
    let listDomain = allConfig.map(x => x.domain);
    console.log(listDomain)
    
    //delete public fil
    await Promise.all(listDomain.map(async domain => {
        let sDomain = domain.split('.')[0];
        return await emptyS3Directory(TARGET_ORIGIN_ID, `public/${sDomain}/file/`)
    }))
    
      console.log('delete file public done')
    
    //delete  private file
   
  await emptyS3Directory(TARGET_ORIGIN_ID, `private/`)
    
    
    console.log('delete file private  done')
    
       
    
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

