const AWS = require('aws-sdk');


const docClient = new AWS.DynamoDB.DocumentClient();
const appTableName = 'chobitoneApp';
const KINTONE_API_ERROR = 1;
const PERMISSION_ERROR = 2; 
const INTERNAL_ERROR = 3;
const errTableName = 'chobiitError';
  
const BUCKET_NAME = process.env.BUCKET_NAME;

var s3Bucket = new AWS.S3({
    region: 'us-east-1',
    params: { Bucket: BUCKET_NAME }
});

exports.handler = (event, context, callback) => {
    console.log('Starting upload files.', JSON.stringify(event, null, 2));
    const domain = event.queryStringParameters.domain;
    const appId = event.pathParameters.id;
    let file = JSON.parse(event.body);

    const queries = {
        TableName: appTableName,
        Key: {
            'domain' : domain,
            'app': appId
        }
    };

    docClient.get(queries, function (err, data) {
        if (err) {
            console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
            return handleError(err, INTERNAL_ERROR, callback);
        } else {
            if (data.Item && (data.Item.auth === false || data.Item.auth === 1)) {
               
                return uploadFileToS3(file, domain, callback);
                        
            }
            else return handleError(new Error('You do not have permission to access this app.'), PERMISSION_ERROR, callback);
        }
    });
};
function uploadFileToS3(file, domain, callback){
    console.log('starting upload file to s3' + JSON.stringify(file, null, 2));
    
    let fileId = getUniqueStr();
    
    var params = {
        Bucket: BUCKET_NAME,
        Key: `public/${domain.split('.')[0]}/file/${fileId}/${file.name}`,   
        Expires: 3600,
        ContentType: file.type,
    };
    s3Bucket.getSignedUrl('putObject', params, function (err, url) {
        if (err){
            handleError(err, callback)
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
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback, domain) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let responseBody = {
        code: 400,
        message: 'Upload file failed',
        messageDev: error.message
    };

    let response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: responseBody
    };
    
    
    storeError(error, domain);
    callback(null, response);
}

function storeError(error, domain){
    console.log('error to store:' + error);
    let dateTime = new Date().toString();
    let functionName = 'chobitoneUploadFile';

    var params = {
        TableName:errTableName,
        Item:{
            domain: domain,
            error: error,
            dateTime: dateTime,
            functionName: functionName
        }
    };
    
    console.log("Adding a new error item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add error item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added error item:", JSON.stringify(data, null, 2));
        }
    });
}

function getUniqueStr(myStrong){
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
   }