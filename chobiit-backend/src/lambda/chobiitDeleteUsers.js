const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const UserPoolId = process.env.UserPoolId;
const USER_TABLE_NAME = 'chobitoneUser';
const DELETED_USER_TABLE_NAME = 'ChobiitDeletedUsers';
const DELETE_USER_TABLE_SUCCESSS = "Delete users success!";


exports.handler = (event, context, callback) => {

    const apiKey = event.params.header["x-api-key"] ||  event.params.header["X-Api-Key"];
    const eventBody = event['body-json'];
    const dataLogins = eventBody.data;

    authenticate(apiKey)
    .then(domain => {
        if (domain && dataLogins.length > 0) {

            for (let key=0; key<dataLogins.length; key++) {
                const loginName =  dataLogins[key];

                (async function () {


                    const getParams = {
                        TableName: USER_TABLE_NAME,
                        Key:{
                            "domain": domain,
                            "loginName": loginName
                        }
                    };

                    const resp = await dynamo.get(getParams).promise();
                    if (Object.keys(resp).length) {
                        const deleteParams = {
                            TableName: USER_TABLE_NAME,
                            Key:{
                                "domain" : domain,
                                "loginName": loginName
                            },
                            ConditionExpression:"#dm = :d and #lg = :l",
                            ExpressionAttributeNames: {
                                "#dm" : "domain",
                                "#lg": "loginName"
                            },
                            ExpressionAttributeValues: {
                                ":d" : domain,
                                ":l": loginName
                            }
                        };

                        await dynamo.delete(deleteParams).promise();


                        let createParams = {
                            TableName: DELETED_USER_TABLE_NAME, 
                            Item: {
                                domain: domain,
                                loginName: loginName,
                            }
                        };
                        let createRes = await dynamo.put(createParams).promise();
                        console.log("Created item succeeded:", JSON.stringify(createRes, null, 2));

                        await deleteAccountCognito(loginName);

                    } else {
                       return handleSuccess(DELETE_USER_TABLE_SUCCESSS, callback);
                    }
                })()
                    .catch(err=>{
                        handleError(err, callback);
                    });
            }

            return handleSuccess(DELETE_USER_TABLE_SUCCESSS, callback)
        } else {
            handleError('Access Denied or Data login not pass', callback)
        }
    })
    .catch(err => {
        handleError(err, callback)
    })

};

function deleteAccountCognito(loginName){
    const params = {
        UserPoolId: UserPoolId,
        Username: loginName,
     };

    const client = new AWS.CognitoIdentityServiceProvider();

    return new Promise((resolve, reject) => {
        client.adminDeleteUser(params, function(err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    })
  })
}

function handleSuccess(data, callback) {
    const responseBody = {
        statusCode: 200,
        body: JSON.stringify(data)
    };

    const response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {

    const response = {
        statusCode: 400,
        body: JSON.stringify(error)
    };

    callback(null, response);
}

function authenticate(apiKey){
    const request = require('request');
    const [apiToken,domain,settingAppId] = apiKey.split(':')

    return new Promise((resolve, reject) => {
         const requestOptions = {
            method: 'GET',
            uri: `https://${domain}/k/v1/app.json`,
            headers: {
                'Content-Type': 'application/json',
                'X-Cybozu-API-Token': apiToken,
            },
            json: true,
             body: {
                id: settingAppId
            },

        };

        console.log('Call kintone API with body: ', JSON.stringify(requestOptions.body, null, 2));
        request(requestOptions, function (err, response, body) {
            if (err) {
                console.log('Call KintoneAPI failed.', JSON.stringify(err, null, 2));
               reject(err)
            } else {
                console.log('KintoneAPI response.', JSON.stringify(response, null, 2));
                if (body.appId) {
                   resolve(domain)
                } else {
                   resolve(false)
                }
            }
        });
    })
}