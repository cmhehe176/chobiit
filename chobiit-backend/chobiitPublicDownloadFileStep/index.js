const AWS = require('aws-sdk');
const request = require('request');
const axios = require('axios');
const docClient = new AWS.DynamoDB.DocumentClient();
const errTableName = 'chobiitError';
const appTableName = 'chobitoneApp';
const BUCKET_NAME = process.env.BUCKET_NAME;  
var s3Bucket = new AWS.S3({
     region: 'us-east-1',
    params: { Bucket: BUCKET_NAME }
});


exports.handler = async (event) => {
    console.log('Starting download files.', JSON.stringify(event, null, 2));
  
    
    const {domain, appId} = event;
    
    const queries = {
        TableName: appTableName,
        Key: {
            'domain' : domain,
            'app': appId
        }
    }; 

    try {
       
        let data = await docClient.get(queries).promise();
        
        console.log('data item' +JSON.stringify(data.Item, null, 2));
        if (data.Item && ( data.Item.auth === false || data.Item.auth === 1) ) {
             return  downloadFileFromKintone(event, data.Item);
            
        }else return handleError(new Error('You do not have permission to access this app.'));
    }catch(err){
        console.log(err);
        return handleError(err)
    }
            
      
};

async function downloadFileFromKintone(fileInfo, appInfo) {
    let kintoneAPIToken = appInfo.apiToken0;
    let kintoneDomain = appInfo.domain.indexOf('https') < 0 ? `https://${appInfo.domain}` : appInfo.domain;
  
    
    let result = await axios.request({
        responseType: 'arraybuffer',
        url:`${kintoneDomain}/k/v1/file.json?fileKey=${fileInfo.fileKey}`, 
        method: 'get',
        headers: {
            'X-Cybozu-API-Token': kintoneAPIToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    })

        
    console.log('appInfo: ',JSON.stringify(appInfo, null, 2))
     
   
    
  
      
    let params = {
        Key: `public/${appInfo.domain.split('.')[0]}/file/${fileInfo.fileKey}/${fileInfo.fileName}`,  
        Body: result.data
    };
    
    await s3Bucket.putObject(params).promise()
    return handleSuccess('success'); 
    
}


function handleSuccess(data) {

    let responseBody = {
        code: 200,
        body: data
    };


    let response = {
        body: JSON.stringify(responseBody)
    };

    return response;

}

function handleError(error) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let responseBody = {
        code: 400,
        message: 'download file failed',
        messageDev: error.message
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
    return response;
}

