//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient({
    
});

const GROUP_TABLE_NAME = 'chobitoneGroup';



exports.handler = (event, context, callback) => {
    console.log('starting update dynamo' + JSON.stringify(event, null, 2))
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if(domain){
            let eventBody = event['body-json'];
    
            
            
           
            let deleteParams = {
                TableName:GROUP_TABLE_NAME,
                Key:{
                    domain: domain,
                    name: eventBody.name
                }
            };
            
            console.log("Attempting a conditional delete...");
            dynamo.delete(deleteParams ,function(err, data) {
                if (err) {
                    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                    handleError(err, callback)
                } else {
                   
                    handleSuccess('update succeeded', callback)
                }
            });
            
                    
        
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