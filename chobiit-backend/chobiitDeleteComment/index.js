const AWS = require('aws-sdk');
const request = require('request');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';






exports.handler = (event, context, callback) => {
    console.log('Starting remove comment.', JSON.stringify(event, null, 2));
    
   
    const appId = event.pathParameters.id;
    const recordId = event.pathParameters.recordId;
    
    const commentId = event.pathParameters.commentId;
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];
    

    getDomainConfig(domain)
    .then(config => {
        const queries = {
            TableName: userTableName,
            Key: {
                'domain' : domain,
                'loginName': loginName
            }
        };

        docClient.get(queries, function (err, data) {
            if (err) {
                // console.error('Unable to get user info. Error:', JSON.stringify(err, null, 2));
                return handleError(err, callback);
            } else {
                if (data.Item) {
                    console.log(data.Item);
                    return removeComment(appId, recordId, commentId, data.Item, config, callback);
                }



                return handleError(new Error('Invalid token'), callback);
            }
        });
    });
   

};

function removeComment(appId, recordId, commentId, userInfo, config, callback) {
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken;
    let basicAuthToken = config.basicAuthToken ? config.basicAuthToken : '';

    const requestOptions = {
        method: 'DELETE',
        uri: `${kintoneDomain}/k/v1/record/comment.json`,
        headers: {
            'Authorization' : 'Basic '+basicAuthToken,
            'X-Cybozu-Authorization': authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: appId,
            record: recordId,
            comment: commentId
        },
    };

    console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
    request(requestOptions, function (err, response, body) {
        if (err) {
            console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
            handleError(err, callback);
        } else {
            console.log('KintoneAPI response.', JSON.stringify(body, null, 2));
            handleSuccess(body, callback);
        }
    });
}

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Remove comment succeed',
        record: data
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    
     let responseBody = {
        code: 400,
        message: 'Remove comment fa iled',
        messageDev: error.message
    };

    let response = {
        headers: getHeader(),
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function getDomainConfig(domain){
    const configTable = 'chobiitConfig';
    return new Promise((resolve, reject) => {
        const queries = {
            TableName: configTable,
            Key: {
                'domain' : domain,
            }
        };
        docClient.get(queries, (err, data) => {
            if (err) {
                console.error('Unable to get config from DynamoDB. Error:', JSON.stringify(err, null, 2));
                reject(err)
            }else{
                console.log('Get config from DynamoDB succeed.', JSON.stringify(data, null, 2));
                if (data.Item) {
                    resolve(data.Item)
                }
            }
        });
    })
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
    }
    
    return headers;
}