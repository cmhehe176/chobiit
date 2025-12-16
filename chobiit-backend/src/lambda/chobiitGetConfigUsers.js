const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const userTableNAme = 'chobitoneUser';



  
exports.handler = (event, context, callback) => {
    // handleSuccess({},callback);
    console.log('Starting get config ', JSON.stringify(event, null, 2));
    
    const apiKey = event.params.header["x-api-key"] || event.params.header["X-Api-Key"]; 
    authenticate(apiKey)
    .then(domain => { 
        if(domain){
            
            let body = event['body-json'];
            let ExclusiveStartKey = body.ExclusiveStartKey;
           
            let queries = {
                TableName: userTableNAme,
                KeyConditionExpression: "#do = :dm",
                ExpressionAttributeNames: {
                    "#do" : "domain",
                },
                ExpressionAttributeValues: {
                     ":dm": domain
                }
            };
            
            if (ExclusiveStartKey){
                queries.ExclusiveStartKey = ExclusiveStartKey;
            }
            
            
            
            
            docClient.query(queries, function (err, data) {
                if (err) {
                    console.error('Unable to get config info from DynamoDB. Error:', JSON.stringify(err, null, 2));
                    handleError(err, callback);
                   
                } else {
                   
                    // console.log('Get config info from DynamoDB succeed.', JSON.stringify(data, null, 2));
                    data.Items = parseArrayStrings(data.Items)
                        
                    handleSuccess( {
                        users : data.Items,
                        LastEvaluatedKey: data.LastEvaluatedKey
                    }, callback)
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
    console.log('Handle success:');
    let responseBody = {
        code: 200,
        data: data
    };


  

  
    let response = {
         statusCode: 200,
         body: JSON.stringify(responseBody),
         
       
    };
     callback(null, response);
}

function handleError(error, callback) {
    console.log('Handle error:', JSON.stringify(error, null, 2));
    let responseBody = {
        code: 400,
        message: error || 'Get config failed',
    };

    let response = {
        statusCode: 200,
        body: JSON.stringify(responseBody),
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

const scanTable = async (params, dyanmo) => {
    let scanResults = [];
    let items;
    do{
        items =  await dyanmo.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");

    return scanResults;

};

function parseArrayStrings(items){
    return items.map(item => {
        try {
            item.apps = JSON.parse(item.apps);
            item.kintoneOrganizations = JSON.parse(item.kintoneOrganizations);
            item.kintoneGroups = JSON.parse(item.kintoneGroups);
        } catch (error) {
            console.error("JSON parse error for item:", item, error);
        }
        return item;
    });
}
