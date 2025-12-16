const AWS = require('aws-sdk');


const axios = require('axios');
const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';


const s3Bucket = new AWS.S3({
    region: 'us-east-1',
    signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.BUCKET_NAME;

const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    console.log('Starting download files.', JSON.stringify(event, null, 2));
    
    const params = {
          InvocationType: "RequestResponse",
          Payload: JSON.stringify(event),
          FunctionName : 'decode-verify-jwt'
    };
    

    let decodeResp = await lambda.invoke(params).promise();
    
      console.log(decodeResp);
    
    let payload = JSON.parse(decodeResp.Payload);
    
    console.log(decodeResp);

    
    const domain  = payload['custom:domain'];
    const loginName  =  payload['nickname'];
 
      
    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': loginName
        }
    };
    
    try {
        

        let data = await docClient.get(queries).promise();
        return  downloadFileFromKintone(event, data.Item, domain);
           
    }catch(err){
        return handleError(err)
    }

        
};


async function downloadFileFromKintone(fileInfo, userInfo, domain) {
    

    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken

    let result = await axios.request({
      responseType: 'arraybuffer',
      url:`${kintoneDomain}/k/v1/file.json?fileKey=${fileInfo.fileKey}`,  
      method: 'get',
      headers: {
        'X-Cybozu-Authorization': authorizedToken,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    
    
    console.log('file size: '+result.data.byteLength);
    //let fileName = fileInfo.fileName.replace(/ /g, "_");
    
  

    let params = {
         Bucket: BUCKET_NAME,
        Key: `private/${domain.split('.')[0]}/file/${fileInfo.fileKey}/${fileInfo.fileName}`,
        Body: result.data 
    };
    
    //console.log('params: ',JSON.stringify(params, null, 2))
    await s3Bucket.putObject(params).promise();
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
        body: JSON.stringify(responseBody)
    };
    
   
   return responseBody;
}



