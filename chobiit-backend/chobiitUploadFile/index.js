const AWS = require('aws-sdk');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';


const BUCKET_NAME = process.env.BUCKET_NAME;  

const s3Bucket = new AWS.S3({
    region: 'us-east-1' ,
      signatureVersion: 'v4',
   
});


exports.handler = (event, context, callback) => {
    console.log('Starting upload files.', JSON.stringify(event, null, 2));
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    
    
    let file = JSON.parse(event['body']);
    

  
    const queries = {
        TableName: userTableName,
        Key: {
            'domain' : domain,
            'loginName': loginName
        }
    };

    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
            return handleError(err, callback, '');
        } else {
            if (data.Item) {
               
                return uploadFileToS3(file, domain, callback);
                
            }

            return handleError(new Error('Invalid token'), callback, domain);
        }
    });
    
};

function uploadFileToS3(file, domain, callback){
    console.log('starting upload file to s3' + JSON.stringify(file, null, 2));
    
    let fileId = getUniqueStr();
    var params = {
        Bucket: BUCKET_NAME,
        Key: `private/${domain.split('.')[0]}/file/${fileId}/${file.name}`,
        Expires: 3600,
        ContentType: file.type,  
    };
    s3Bucket.getSignedUrl('putObject', params, function (err, url) {
        if (err){
            handleError(err, callback, '')
        }else {
           
            console.log('The URL is', url);
            
            handleSuccess({
                url: url,
                fileId : fileId
            }, callback);
        }
      
    });
}


function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Upload file succeed',
        url: data.url,
        fileId: data.fileId
    };

    let response = {
        statusCode: 200,
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback, domain) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let responseBody = {
        code: 400,
        message: 'Upload file failed',
        messageDev: error
    };

    let response = {
        statusCode: 200,
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };
    

    callback(null, response);
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


function getUniqueStr(myStrong){
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
   }