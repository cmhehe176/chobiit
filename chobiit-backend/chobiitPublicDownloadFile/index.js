const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const appTableName = 'chobitoneApp';
const BUCKET_NAME = process.env.BUCKET_NAME;  
var s3Bucket = new AWS.S3({
     region: 'us-east-1',
    params: { Bucket: BUCKET_NAME }
});


exports.handler = async (event, contex) => {
    console.log('Starting download files.', JSON.stringify(event, null, 2));
    const domain = event.params.querystring.domain;
    const appId = event.params.path.id;
    
    const fileInfo = event['body-json']
    
    const queries = {
        TableName: appTableName,
        Key: {
            'domain' : domain,
            'app': appId
        }
    }; 

    try {
        let data = await  docClient.get(queries).promise();
        console.log('data item' +JSON.stringify(data.Item, null, 2));
        
        if (data.Item && ( data.Item.auth === false || data.Item.auth === 1) ) {
            
            if (fileInfo.state == 'done') return dowloadFileToLocal(fileInfo,data.Item);
            if (fileInfo.state == 'check') return checkFileOnS3(fileInfo,data.Item);
        
        }else return handleError(new Error('You do not have permission to access this app.'));
    } catch (err) {
        console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
        return handleError(err);
    }
   
};


async function  dowloadFileToLocal(fileInfo, appInfo){
    console.log('starting download file to local' + JSON.stringify(fileInfo, null, 2));
    
  
    var params = {
        Bucket: BUCKET_NAME,
        Key: `public/${appInfo.domain.split('.')[0]}/file/${fileInfo.fileKey}/${fileInfo.fileName}`, 
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

async function  checkFileOnS3(fileInfo, appInfo){
    console.log('starting download file to local' + JSON.stringify(fileInfo, null, 2));
    
   
    var params = {
        Bucket: BUCKET_NAME,
        Key: `public/${appInfo.domain.split('.')[0]}/file/${fileInfo.fileKey}/${fileInfo.fileName}`, 
     
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

function handleSuccess(data) {
    let responseBody = {
        code: 200,
        body: data
    };


   
    return responseBody;
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
