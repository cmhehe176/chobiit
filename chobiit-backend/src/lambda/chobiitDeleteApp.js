//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({

});

const USER_TABLE_NAME = 'chobitoneUser';
const APP_TABLE_NAME = 'chobitoneApp';
const INDEX_NAME = 'kintoneLoginName-index';

const UPDATE_APP_TABLE_SUCCESSS = "update app table success";
const UPDATE_USER_TABLE_SUCCESSS = "update user table success";

exports.handler = (event, context, callback) => {
    console.log('starting update dynamo' + JSON.stringify(event, null, 2))
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if (domain){
            let eventBody = event['body-json'];
            
            let appId =  eventBody.appId;
            let userInfo =  eventBody.userInfo;
            
            let updateAppTablePromise = new Promise((resolve, reject) =>{
                let queryParams = {
                    TableName : APP_TABLE_NAME,
                    KeyConditionExpression: "#dm = :d and #app = :a",
                    ExpressionAttributeNames:{
                        "#app": "app",
                        "#dm" : "domain"
                    },
                    ExpressionAttributeValues: {
                        ":a": appId,
                        ":d": domain
                    }
                };
                
                dynamo.query(queryParams, function(err, data) {
                    if (err) {
                        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
                        reject(err);
                    } else {
                        console.log("Query succeeded.");
                        console.log('list app: ' + JSON.stringify(data,null, 2));
                        if (data.Items.length > 0){
                            let deleteParams = {
                                TableName:APP_TABLE_NAME,
                                Key:{
                                    "domain" : domain,
                                    "app": appId
                                },
                                ConditionExpression:"#dm = :d and #app = :a",
                                ExpressionAttributeNames:{
                                    "#app": "app",
                                    "#dm" : "domain"
                                },
                                ExpressionAttributeValues: {
                                    ":a": appId,
                                    ":d": domain
                                }
                            };
                            
                            console.log("Attempting a conditional delete...");
                            dynamo.delete(deleteParams, function(err, data) {
                                if (err) {
                                    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                                } else {
                                    console.log("Delete Item succeeded:", JSON.stringify(data, null, 2));
                                    resolve(UPDATE_APP_TABLE_SUCCESSS);
                                }
                            });
                        }else {
                            resolve(UPDATE_APP_TABLE_SUCCESSS);
                        }
                    }
                });
               
            }) 
            
            let updateUserTablePromises = [];
            if (userInfo){
                for (let i = 0; i < userInfo.length; i++){
                    let user = userInfo[i];
                    let loginName = user.loginName;
                    let apps = user.apps;
                        
                    let updateUserTablePromise = new Promise((resolve, reject)=>{
                        let params = {
                            TableName:USER_TABLE_NAME,
                            Key:{
                                "domain" : domain,
                                "loginName": loginName,
                            },
                            UpdateExpression: "set apps = :a",
                            ExpressionAttributeValues:{
                                ":a": JSON.stringify(apps)
                            },
                            ReturnValues:"UPDATED_NEW"
                        };
                        
                        console.log("Updating the item...");
                        dynamo.update(params, function(err, data) {
                            if (err) {
                                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                                reject(err);
                            } else {
                                console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                                resolve(UPDATE_USER_TABLE_SUCCESSS);
                            }
                        });
                    })
                    updateUserTablePromises.push(updateAppTablePromise);
                }
            }
            updateUserTablePromises.push(updateAppTablePromise);
            
             
            return Promise.all(updateUserTablePromises)
            .then(values => {
                handleSuccess(values, callback);
            })
            .catch(err => {
                handleError(err, callback);
            })
    
    
        }else{
            handleError('Access Denied', callback)  
        }
    })
    .catch(err => {
        handleError(err,callback)
    })
};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        body: JSON.stringify(data)
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };

    callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let response = {
        statusCode: 200,
        body: JSON.stringify(error)
    };

    callback(null, response);
}

function authenticate(apiKey){
    const request = require('request');
    const [apiToken,domain,settingAppId] = apiKey.split(':')
    return new Promise((resolve, reject) =>{
         const requestOptions = {
            method: 'GET',
            uri: `https://${domain}/k/v1/app.json`,
            headers: {
              
                'Content-Type': 'application/json',
                'X-Cybozu-API-Token': apiToken,
            },
            json: true,
             body: {
                id: +settingAppId
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