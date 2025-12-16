//DynamoDB
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient(); 

const TABLE_NAME = 'chobitoneGroup'


exports.handler = async (event) => {
    console.log('starting create chobiit user: '+JSON.stringify(event, null, 2))
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    let eventBody = event['body-json'];
    
    try {
        
        let domain = await authenticate(apiKey);
        if (!domain){
            return handleError('Access Denied')
        }
         
   
        await addToDynamo(eventBody)
        return handleSuccess({})
        
    }catch(err){
        console.log(err)
        return handleError(err)
    }
 
 
};




async function addToDynamo(eventBody){
      const params = {
        TableName: TABLE_NAME,
        Item:{
            domain               : eventBody.domain,
            name                 : eventBody.name,
            users                : eventBody.users 
        }
    };
    
    console.log('dynamo-post-params:'+ JSON.stringify(params));

    
    return await dynamo.put(params).promise();
    
}
function handleSuccess(data) {
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

    return response;
}

function handleError(error) {
    console.log('Handle error:', JSON.stringify(error, null, 2));

    let response = {
        statusCode: 200,
        body: JSON.stringify({
            code: 400,
            message: error.message,
            messageDev: error
        })
    };

   return response;
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