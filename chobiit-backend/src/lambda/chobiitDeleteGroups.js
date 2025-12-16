const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const GROUP_TABLE_NAME = 'chobitoneGroup';
const DELETE_GROUP_TABLE_SUCCESSS = "Delete groups success!";


exports.handler = (event, context, callback) => {

    const apiKey = event.params.header["x-api-key"] ||  event.params.header["X-Api-Key"];
    const eventBody = event['body-json'];
    const dataGroups = eventBody.data;

    console.log("dataGroups==> ", dataGroups)

    authenticate(apiKey)
        .then(domain => {
            if (domain && dataGroups.length > 0) {

                for (let key=0; key<dataGroups.length; key++) {
                    const name =  dataGroups[key];

                    (async function () {


                        const getParams = {
                            TableName: GROUP_TABLE_NAME,
                            Key:{
                                "domain": domain,
                                "name": name
                            }
                        };

                        const resp = await dynamo.get(getParams).promise();

                        if (Object.keys(resp).length) {
                            const deleteParams = {
                                TableName: GROUP_TABLE_NAME,
                                Key:{
                                    "domain" : domain,
                                    "name": name
                                },
                            };

                            await dynamo.delete(deleteParams).promise();

                        } else {
                            return handleSuccess(DELETE_GROUP_TABLE_SUCCESSS, callback);
                        }
                    })()
                        .catch(err=>{
                            handleError(err, callback);
                        });
                }

                return handleSuccess(DELETE_GROUP_TABLE_SUCCESSS, callback)
            } else {
                handleError('Access denied or data groups not pass', callback)
            }
        })
        .catch(err => {
            handleError(err, callback)
        })

};

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