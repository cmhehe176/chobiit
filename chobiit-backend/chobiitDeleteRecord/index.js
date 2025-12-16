const AWS = require('aws-sdk');
const request = require('request');


const docClient = new AWS.DynamoDB.DocumentClient();
const userTableName = 'chobitoneUser';


exports.handler = (event, context, callback) => {
    console.log('Starting remove record.', JSON.stringify(event, null, 2));
    
    const appId = event.pathParameters.id;
    const recordId = event.pathParameters.recordId;
    
    const domain  = event.requestContext.authorizer.claims['custom:domain'];
    const loginName  =  event.requestContext.authorizer.claims['nickname'];


    const queries = {
        TableName: userTableName,
        Key: {
            'domain': domain,
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
                return removeRecord(appId, recordId, data.Item, callback);

            }
            return handleError(new Error('Invalid token'), callback);
        }
    });
   

};

function removeRecord(appId, recordId, userInfo, callback) {
    let kintoneDomain = userInfo.domain.indexOf('https') < 0 ? `https://${userInfo.domain}` : userInfo.domain;
    let authorizedToken = userInfo.cybozuToken

    const requestOptions = {
        method: 'DELETE',
        uri: `${kintoneDomain}/k/v1/records.json`,
        headers: {
            'X-Cybozu-Authorization': authorizedToken,
            'Authorization' : authorizedToken,
            'Content-Type': 'application/json'
        },
        json: true,
        body: {
            app: +appId,
            ids: [+recordId]
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
        message: 'Remove record succeed',
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

    let response = {
        headers: getHeader(),
        body: JSON.stringify({
            code: 400,
            message: 'Remove record failed',
            messageDev: error.message
        })
    };

    callback(null, response);
}


function getHeader(origin) {
     
    
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