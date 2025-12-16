//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({});
const { KINTONE_USER_TABLE_NAME } = require("./../constants/dynamodb-table-names");
const UPDATE_USER_TABLE_SUCCESSS = "update user table success";
const {LambdaCommonResponse} = require('../utils/lambda-common-response');

exports.handler = (event, context, callback) => {
    console.log('starting update dynamo' + JSON.stringify(event, null, 2))
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if(domain){
            const eventBody = event['body-json'];
            const kintoneLoginName =  eventBody.kintoneLoginName;
            
            (async function (){
                const queryParams = {
                    TableName : KINTONE_USER_TABLE_NAME,
                    KeyConditionExpression: "#dm = :d and #lg = :l",
                    ExpressionAttributeNames:{
                        "#dm" : "domain",
                        "#lg": "kintoneLoginName"
                    },
                    ExpressionAttributeValues: {
                        ":d" : domain,
                        ":l": kintoneLoginName
                    }
                };
                const queryRes = await dynamo.query(queryParams).promise();
                if (queryRes.Items.length > 0){
                    const deleteParams = {
                        TableName: KINTONE_USER_TABLE_NAME,
                        Key:{
                            "domain" : domain,
                            "kintoneLoginName": kintoneLoginName
                        },
                        ConditionExpression:"#dm = :d and #lg = :l",
                        ExpressionAttributeNames:{
                            "#dm" : "domain",
                            "#lg": "kintoneLoginName" 
                        },
                        ExpressionAttributeValues: {
                            ":d" : domain,
                            ":l": kintoneLoginName
                        }
                    };
                    
                    console.log("Attempting a conditional delete...");
                    const deleteRes = await dynamo.delete(deleteParams).promise();
                    console.log("Delete Item succeeded:", JSON.stringify(deleteRes, null, 2));
                    LambdaCommonResponse.handleSuccess(UPDATE_USER_TABLE_SUCCESSS, callback)
                }else {
                    LambdaCommonResponse.handleSuccess(UPDATE_USER_TABLE_SUCCESSS, callback);
                    return;
                }
            })()
            .catch(err=>{
                LambdaCommonResponse.handleError(err, callback);
            });
        }else{
            LambdaCommonResponse.handleError('Access Denied', callback)  
        }
    })
    .catch(err => {
        LambdaCommonResponse.handleError(err, callback)
    })
};

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