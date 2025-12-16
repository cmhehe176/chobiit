const AWS = require('aws-sdk');


const axios = require('axios');
const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';


const s3Bucket = new AWS.S3({
    region: 'us-east-1'    
});

const BUCKET_NAME = process.env.BUCKET_NAME;



exports.handler = async (event) => {
    console.log('Starting download files.', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname']; 
    
    let fileInfo = JSON.parse(event['body']);
 
      
    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': loginName
        }
    };
    
    try {
        

        let data = await docClient.get(queries).promise();
        if (data.Item ) {
           
            if (fileInfo.state == 'done') return dowloadFileToLocal(fileInfo, domain);
            if (fileInfo.state == 'check') return checkFileOnS3(fileInfo, domain);
        }else{
            return handleError(new Error('Invalid token'));    
        }
    }catch(err){
        return handleError(err)
    }

        
};

async function  dowloadFileToLocal(fileInfo, domain){
    console.log('starting download file to local' + JSON.stringify(fileInfo, null, 2));
    
    // let fileName =  fileInfo.fileKey +'-' + fileInfo.fileName
    var params = {
        Bucket: BUCKET_NAME,
        Key: `private/${domain.split('.')[0]}/file/${fileInfo.fileKey}/${fileInfo.fileName}`, 
        Expires: 3600,
       
    };
    
    console.log('get params: ', params)
    
   

    let url = await new Promise((resolve, reject) => {
      s3Bucket.getSignedUrl('getObject', params, (err, url) => {
        if (err) reject(err)
        else resolve(url)
     })
    })

   
    
    return handleSuccess(url);
   
}

async function  checkFileOnS3(fileInfo, domain){
    console.log('starting download file to local' + JSON.stringify(fileInfo, null, 2));
    
   
    var params = {
        Bucket: BUCKET_NAME,
       Key: `private/${domain.split('.')[0]}/file/${fileInfo.fileKey}/${fileInfo.fileName}`, 
     
    };
    
    console.log('get params: ', params)

    let check = false;
    try {
        await  s3Bucket.headObject(params).promise();
        check = true;
        
    } catch (e) {
        check  =false;
    }
    
           
    return handleSuccess(check)
    
    
 
}
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
    
    let fileName =  fileInfo.fileKey +'-' + fileInfo.fileName

    let params = {
         Bucket: BUCKET_NAME,
        Key: `private/${domain.split('.')[0]}/file/${fileName}`,
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
        headers: getHeader(),
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
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    
   
   return responseBody;
}




function getHeader() {
      

    
  
    
    let headers = {
        "Access-Control-Allow-Credentials" : "true",
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Headers" : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Cache-Control" : 'no-cache, must-revalidate',
        "Strict-Transport-Security" : 'max-age=63072000; includeSubDomains; preload',
        "X-Content-Type-Options" : 'nosniff',
        "Referrer-Policy" : 'same-origin',
        'Expires' : 	'-1',
        'Pragma' : 'no-cache',
        'Content-Type': 'application/json'
    }
    
    return headers;
}

