//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({
   
});
const { KINTONE_USER_TABLE_NAME } = require("./../constants/dynamodb-table-names");
const USER_TABLE_NAME = 'chobitoneUser';
const MSG_SUCCESS = "update table SUCCESS";
const MSG_ERROR = "Error DynamoDBへ更新失敗";

exports.handler = (event, context, callback) => {
    console.log("*** PUT UserInfo ****");
    console.log(JSON.stringify(event));
    
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if(domain){
             let eventBody = event['body-json'];
    
            let kintoneLoginName = eventBody.kintoneLoginName;
            let cybozuToken = eventBody.cybozuToken;
            
            let updateInfo = async function(){
                const putParams = {
                    TableName: KINTONE_USER_TABLE_NAME,
                    Item:{
                        domain               : domain,
                        kintoneLoginName      : kintoneLoginName ,
                        cybozuToken          : cybozuToken,
                
                    }
                };
        
                await dynamo.put(putParams).promise();
                
                let params = {
                        TableName : USER_TABLE_NAME,
                        KeyConditionExpression: "#dm = :dd",
                        FilterExpression: "#kl = :k",
                        ExpressionAttributeNames:{
                            "#dm": "domain",
                            "#kl": "kintoneLoginName"
                        },
                        ExpressionAttributeValues: {
                            ":dd": domain,
                            ":k" : kintoneLoginName
                        }
                }
                    
                
                let data = await dynamo.query(params).promise();
                console.log('query data: '+JSON.stringify(data, null, 2));
                
                if (data.Items.length > 0){
                    for (let i = 0; i < data.Items.length; i++){
                        let item = data.Items[i];
                        item['cybozuToken'] = cybozuToken;
                        
                        let updateParams = {
                            TableName: USER_TABLE_NAME,
                            Item: item
                        }
                        
                        console.log('item to put: '+JSON.stringify(item, null, 2))
                        let tableData = await dynamo.put(updateParams).promise();
                        console.log("DynamoへのPUT成功 data:", JSON.stringify(tableData));
                    }
                }else{
                    handleSuccess(MSG_SUCCESS, callback);
                }
            }
            
            updateInfo()
            .catch(err =>   {
                    handleError(err, callback)
                }
            )
        }else{
            handleError('Access Denied', callback)  
        }
    })
    .catch(err => {
        handleError(err, callback)
    })
    
   
};

function handleSuccess(data, callback) {
    console.log('Handle success:', JSON.stringify(data, null, 2));

    let responseBody = {
        code: 200,
        message: 'Get record succeed',
        data: data
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
        body: JSON.stringify({
            code: 400,
            message: error.message,
            messageDev: error
        })
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