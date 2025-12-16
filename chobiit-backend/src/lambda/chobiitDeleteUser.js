//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({
   
});


const UserPoolId = process.env.UserPoolId;
const USER_TABLE_NAME = 'chobitoneUser';
const DELETED_USER_TABLE_NAME = 'ChobiitDeletedUsers';

const UPDATE_USER_TABLE_SUCCESSS = "update user table success";


exports.handler = (event, context, callback) => {
    console.log('starting update dynamo' + JSON.stringify(event, null, 2))
    
    const apiKey = event.params.header["x-api-key"] ||  event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if (domain){
            let eventBody = event['body-json'];
    
            let loginName =  eventBody.loginName;
            
            (async function (){
                const getParams = {
                    TableName: USER_TABLE_NAME,
                    Key:{
                        "domain": domain,
                        "loginName": loginName
                    }
                };
                const resp = await dynamo.get(getParams).promise();
                if (Object.keys(resp).length){
                    let deleteParams = {
                        TableName:USER_TABLE_NAME,
                        Key:{
                            "domain" : domain,
                            "loginName": loginName
                        },
                        ConditionExpression:"#dm = :d and #lg = :l",
                        ExpressionAttributeNames:{
                            "#dm" : "domain",
                            "#lg": "loginName" 
                        },
                        ExpressionAttributeValues: {
                            ":d" : domain,
                            ":l": loginName
                        }
                    };
                    
                    console.log("Attempting a conditional delete...");
                    let deleteRes = await dynamo.delete(deleteParams).promise();
                    console.log("Delete Item succeeded:", JSON.stringify(deleteRes, null, 2));

                    let createParams = {
                        TableName: DELETED_USER_TABLE_NAME, 
                        Item: {
                            domain: domain,
                            loginName: loginName,
                        }
                    };
                    let createRes = await dynamo.put(createParams).promise();
                    console.log("Created item succeeded:", JSON.stringify(createRes, null, 2));
                    
                    await updateCognito(loginName);
                     console.log("update to coginto succeeded");
                     
                    handleSuccess(UPDATE_USER_TABLE_SUCCESSS, callback)
                    
                }else {
                    handleSuccess(UPDATE_USER_TABLE_SUCCESSS, callback);
                    return;
                }
            })()
            .catch(err=>{
                handleError(err, callback);
            });
            
        }else{
            handleError('Access Denied', callback)  
        }
    })
    .catch(err => {
        handleError(err, callback)
    })
    
   
    
};

function updateCognito(loginName){
    var params = {
        UserPoolId: UserPoolId,
        Username: loginName,
     };
      
    let client = new AWS.CognitoIdentityServiceProvider();
          
    return new Promise((resolve, reject) => {
        client.adminDeleteUser(params, function(err, data) {
        if (err) {
            console.log("EE",err);
            reject(err);
        } else {
            console.log("DDD",data);
            resolve(data);
        }  
    })
  })
}

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