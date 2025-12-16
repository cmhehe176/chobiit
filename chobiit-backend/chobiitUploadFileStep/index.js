const AWS = require('aws-sdk');

const request = require('request');
const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';

const BUCKET_NAME = process.env.BUCKET_NAME;  

const s3Bucket = new AWS.S3({
    region: 'us-east-1' ,
    signatureVersion: 'v4',
   
});

const lambda = new AWS.Lambda();

exports.handler = async (event) => {
    console.log('Starting upload files.', JSON.stringify(event, null, 2));
    
    
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
        return await uploadFileToKintone(event, data.Item);
    } catch (e) {
        console.log(e);
        return handleError(e);
    }

    
};

async function uploadFileToKintone(file, userInfo) {
    console.log('starting upload file to kintone');
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken;
    
    let folder = file.oldFileKey || file.fileId
    var params = {  
        Bucket: BUCKET_NAME,
        Key: `private/${userInfo.domain.split('.')[0]}/file/${folder}/${file.name}` 
    };  
    
  

    let data = await s3Bucket.getObject(params).promise();
     
    
    const requestOptions = {
        method: 'POST',
        url: `${kintoneDomain}/k/v1/file.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'multipart/form-data'
        }
    };
        
    let fileKey = await new Promise((resolve, reject) => {
        const r = request(requestOptions, function (err, response, body) {
          if (err) {
               reject(err);
            }else if(response.statusCode == 429){
                let error = {
                    code : 'limit',
                    message : '通信が混み合っています。\nしばらくお待ちください。'
                }
                reject(error)
            } else {
                body = JSON.parse(body);
                resolve(body.fileKey);
            }
        });
    
        let form = r.form();
        form.append('file', data.Body, file.name);   
    })
    
    console.log('fileKey: ',fileKey);
    
    let deleteParams = {   
        Bucket: BUCKET_NAME,
        Key: `private/${userInfo.domain.split('.')[0]}/file/${folder}/${file.name}` 
    };  

    console.log('deleteParams: ',JSON.stringify(deleteParams, null, 2))
    await s3Bucket.deleteObject(deleteParams).promise()
    
    console.log('delete file success');
    
    return handleSuccess(fileKey);
  
}



   

function handleSuccess(data) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Upload file succeed',
        url: data,
        fileKey: data
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    return response;
}

function handleError(error) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let responseBody = {
        code: 400,
        message: 'Upload file failed',
        messageDev: error
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
    

    return  response
}





