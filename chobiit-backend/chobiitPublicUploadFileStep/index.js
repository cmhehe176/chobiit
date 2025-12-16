const AWS = require('aws-sdk');
const request = require('request');

const docClient = new AWS.DynamoDB.DocumentClient();
const appTableName = 'chobitoneApp';

  
const BUCKET_NAME = process.env.BUCKET_NAME;

var s3Bucket = new AWS.S3({
    region: 'us-east-1',
});

exports.handler = async (event) => {
    console.log('Starting upload files.', JSON.stringify(event, null, 2));

    
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
        
        if (data.Item && (data.Item.auth === false || data.Item.auth === 1)) {
          
            return uploadFileToKintone(event, data.Item, domain);
                    
                    
        }else{
          return handleError(new Error('権限がありません。'));  
        }
    }catch(err){
        console.log(err);
        return handleError(err);
    }
    
};


async function uploadFileToKintone(file, appInfo, domain) {
    console.log('starting upload file to kintone');
     
    let kintoneAPIToken = appInfo.apiToken0;
    let kintoneDomain = appInfo.domain.indexOf('https') < 0 ? `https://${appInfo.domain}` : appInfo.domain;
    
    let folder = file.oldFileKey || file.fileId
    
    var params = {  
        Bucket: BUCKET_NAME,
        Key: `public/${domain.split('.')[0]}/file/${folder}/${file.name}`
    };  

    let data = await s3Bucket.getObject(params).promise();
    
    let fileKey = await new Promise((resolve, reject) => {
          const requestOptions = {
            method: 'POST',
            url: `${kintoneDomain}/k/v1/file.json`,
            headers: {
                'X-Cybozu-API-Token': kintoneAPIToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'multipart/form-data'
            }
        };
    
        const r = request(requestOptions, function (err, response, body) {
            console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
            if (err) {
               reject(err);
            } else {
                body = JSON.parse(body);
                if (body.fileKey) {
                    
                    resolve(body.fileKey)
                    
                } else {
                    reject(body);
                }
            }
        });
    
        let form = r.form();
        form.append('file', data.Body, file.name);
    })
    
    
    console.log('fileKey: ',fileKey);
    
    //delete s3 file
    let deleteParams = {   
        Bucket: BUCKET_NAME,
        Key: `public/${domain.split('.')[0]}/file/${folder}/${file.name}` 
    };

    await s3Bucket.deleteObject(deleteParams).promise();
    
    console.log('delete file succeed')
       
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

    return response
}

function handleError(error) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let responseBody = {
        code: 400,
        message: 'Upload file failed',
        messageDev: error.message
    };

    let response = {
        statusCode: 200,

        body: responseBody
    };
    
    
    
    return response
}

