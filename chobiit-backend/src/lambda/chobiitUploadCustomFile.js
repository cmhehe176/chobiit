const AWS = require('aws-sdk');

 
const BUCKET_NAME =  process.env.BUCKET_NAME;

var s3Bucket = new AWS.S3({
    params: { Bucket: BUCKET_NAME },
    region: 'us-east-1' ,

});

exports.handler = (event, context, callback) => {
    console.log('Starting upload files.', JSON.stringify(event, null, 2));

  
    
    const {fileId, fileName, fileType, domain} = event
    
    const uniqueKey = getUniqueStr();
    
    var params = {
        Bucket: BUCKET_NAME,    
        Key: `userCustom/${domain}/${fileId || uniqueKey}/${fileName}`,  
        Expires: 600,   
        ContentType: fileType,
    };
    
    s3Bucket.getSignedUrl('putObject', params, function (err, url) {
        if (err){
            handleError(err, callback)
        }else {
            console.log('The URL is', url);
            handleSuccess(url, callback);
        }
      
    });
};



function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Upload file succeed',
        url: data,
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
        messageDev: error
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


function getUniqueStr(myStrong){
        var strong = 1000;
        if (myStrong) strong = myStrong;
        return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    }